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
        console.log('Recieved join room request: ', event);
        const connectionId = event?.requestContext?.connectionId;
        if (!connectionId) {
            throw new Error('Could not store connection. No connection ID.');
        }

        const { userToken, roomCode } = JSON.parse(event.body || '{}');
        if (!userToken) {
            throw new Error('Could not store user. No user token.');
        }

        if (!roomCode) {
            throw new Error('Could not join. No room code provided.');
        }

        console.log(
            `Storing new user connectionId: ${connectionId} for userToken: ${userToken}, for room: ${roomCode}`,
        );
        await storeUserConenction(connectionId, roomCode, userToken);
        console.log(`Stored new user connectionId: ${connectionId} for userToken: ${userToken}, for room: ${roomCode}`);
        console.log(`Updating game for room: ${roomCode} with new users token: ${userToken}`);
        await updateGame(roomCode, userToken);
        console.log(`Updated game for room: ${roomCode} with new users token: ${userToken}`);

        response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Success!',
            }),
        };
    } catch (err) {
        console.error(err);
        response = {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }

    return response;
};

function getConnectionPutOperation(
    connectionId: string,
    roomCode: string,
    userToken: string,
): DynamoDB.DocumentClient.PutItemInput {
    return {
        TableName: process.env.CONNECTIONS_TABLE_NAME || '',
        Item: {
            connectionId,
            roomCode,
            userToken,
        },
        ConditionExpression: 'attribute_not_exists(userToken) AND attribute_not_exists(connectionId)', //Prevent users belonging to two rooms
    };
}

async function storeUserConenction(connectionId: string, roomCode: string, userToken: string): Promise<string> {
    try {
        const putParams = getConnectionPutOperation(connectionId, roomCode, userToken);
        await ddbClient.put(putParams).promise();
        return roomCode;
    } catch (err) {
        console.error(err);
        throw new Error('Failed to save user connection.');
    }
}

function getGameUpdateCommand(roomCode: string, userToken: string): DynamoDB.DocumentClient.UpdateItemInput {
    return {
        TableName: process.env.GAMES_TABLE_NAME || '',
        Key: {
            roomCode: roomCode,
        },
        UpdateExpression: 'set #players.#player = :player',
        ExpressionAttributeNames: { '#players': 'players', '#player': userToken },
        ExpressionAttributeValues: {
            ':player': {
                connected: true,
                score: 0,
                id: userToken,
            },
        },
    };
}

async function updateGame(roomCode: string, userToken: string) {
    try {
        const updateParams = getGameUpdateCommand(roomCode, userToken);
        await ddbClient.update(updateParams).promise();
    } catch (err) {
        console.error(err);
        throw new Error('Failed to update game state.');
    }
}
