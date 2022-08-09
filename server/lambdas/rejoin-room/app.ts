import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const ddbParams = {
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION,
};

const ddbClient = new DynamoDB.DocumentClient(ddbParams);

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult;
    try {
        const connectionId = event?.requestContext?.connectionId;
        if (!connectionId) {
            throw new Error('Could not rejoin room. No connection ID.');
        }

        const { userToken, roomCode } = JSON.parse(event.body || '');

        if (!userToken) {
            throw new Error('Could not rejoin room. No user token provided.');
        }

        if (!roomCode) {
            throw new Error('Could not rejoin room. No room code provided.');
        }

        await updateConnectionEntry(roomCode, userToken, connectionId);
        await updateGameState(roomCode, userToken);

        response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Success!',
            }),
        };
    } catch (err) {
        console.log(err);
        response = {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }

    return response;
};

function getConnectionUpdateOperation(
    connectionId: string,
    roomCode: string,
    userToken: string,
): DynamoDB.DocumentClient.UpdateItemInput {
    return {
        TableName: process.env.CONNECTIONS_TABLE_NAME || '',
        Key: {
            userToken,
            roomCode,
        },
        UpdateExpression: 'set #connectionId = :connectionId',
        ExpressionAttributeNames: { '#connectionId': 'connectionId' },
        ExpressionAttributeValues: {
            ':connectionId': connectionId,
        },
    };
}

async function updateConnectionEntry(connectionId: string, roomCode: string, userToken: string) {
    try {
        const updateParams = getConnectionUpdateOperation(connectionId, roomCode, userToken);
        await ddbClient.update(updateParams).promise();
    } catch (err) {
        console.log(err);
        throw new Error('Failed to update user connection.');
    }
}

function getGameUpdateOperation(roomCode: string, userToken: string): DynamoDB.DocumentClient.UpdateItemInput {
    return {
        TableName: process.env.GAMES_TABLE_NAME || '',
        Key: {
            roomCode: roomCode,
        },
        UpdateExpression: 'set #players.#player.connected = :status',
        ExpressionAttributeNames: { '#players': 'players', '#player': userToken },
        ExpressionAttributeValues: {
            ':status': true,
        },
    };
}

async function updateGameState(roomCode: string, userToken: string) {
    try {
        const updateParams = getGameUpdateOperation(roomCode, userToken);
        await ddbClient.update(updateParams).promise();
    } catch (err) {
        console.log(err);
        throw new Error('Failed to update game state with user reconnection');
    }
}
