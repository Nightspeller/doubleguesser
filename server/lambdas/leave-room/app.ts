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
            throw new Error('Could not close connection. No connection ID.');
        }

        const { userToken, roomCode } = JSON.parse(event.body || '').userToken;
        if (!userToken) {
            throw new Error('Could not remove user. No user token.');
        }

        if (!roomCode) {
            throw new Error('Could not leave room. No room code provided.');
        }

        await deleteUserConenction(userToken, roomCode);
        await updateGame(roomCode, userToken);
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

function getConnectionDeleteOperation(userToken: string, roomCode: string): DynamoDB.DocumentClient.DeleteItemInput {
    return {
        TableName: process.env.CONNECTIONS_TABLE_NAME || '',
        Key: {
            userToken,
            roomCode,
        },
    };
}

async function deleteUserConenction(userToken: string, roomCode: string) {
    try {
        const deleteParams = getConnectionDeleteOperation(userToken, roomCode);
        await ddbClient.delete(deleteParams).promise();
    } catch (err) {
        console.log(err);
        throw new Error('Failed to remove user connection.');
    }
}

function getGameUpdateCommand(roomCode: string, userToken: string): DynamoDB.DocumentClient.UpdateItemInput {
    return {
        TableName: process.env.GAMES_TABLE_NAME || '',
        Key: {
            roomCode: roomCode,
        },
        UpdateExpression: 'set #players.#player.connected = :status',
        ExpressionAttributeNames: { '#players': 'players', '#player': userToken },
        ExpressionAttributeValues: {
            ':status': false,
        },
        ReturnValues: 'ALL_NEW',
    };
}

async function updateGame(roomCode: string, userToken: string) {
    try {
        const updateParams = getGameUpdateCommand(roomCode, userToken);
        const result = await ddbClient.update(updateParams).promise();
        const players = result?.Attributes?.players;
        const roomEmpty = Object.keys(players).every((player) => {
            return !players[player].connected;
        });
        if (roomEmpty) {
            await deleteRoom(roomCode);
        }
    } catch (err) {
        console.log(err);
        throw new Error('Failed to update game state.');
    }
}

async function deleteRoom(roomCode: string) {
    try {
        const deleteParams = getDeleteRoomOpertaion(roomCode);
        await ddbClient.delete(deleteParams).promise();
    } catch (err) {
        console.error(err);
        throw new Error('Failed to delete room.');
    }
}

function getDeleteRoomOpertaion(roomCode: string): DynamoDB.DocumentClient.DeleteItemInput {
    return {
        TableName: process.env.GAMES_TABLE_NAME || '',
        Key: {
            roomCode,
        },
    };
}
