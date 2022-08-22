import { APIGatewayProxyResult } from 'aws-lambda';
import { ApiGatewayManagementApi, DynamoDB } from 'aws-sdk';

const ddbParams = {
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION,
};

const ddbClient = new DynamoDB.DocumentClient(ddbParams);
const apiParams = {
    apiVersion: '2018-11-29',
    endpoint: process.env.WEBSOCKET_ENDPOINT,
};
const api = new ApiGatewayManagementApi(apiParams);

export const lambdaHandler = async (event: any): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult;
    try {
        console.log('Recieved request to send game state to player: ', event);
        const { connectionId, roomCode } = event;
        if (!connectionId || !roomCode) {
            throw new Error('Could not send user game state. No connection or room code provided.');
        }
        console.log(`Retrieving game state for roomCode: ${roomCode}`);
        const gameState = await getGameState(roomCode);
        console.log(`Retrieved game state: ${gameState} for roomCode: ${roomCode}`);
        console.log(`Sending game state for roomCode: ${roomCode} to connection: ${connectionId}`);
        await api.postToConnection({ ConnectionId: connectionId, Data: JSON.stringify(gameState) }).promise();
        console.log(`Sent game state for roomCode: ${roomCode} to connection: ${connectionId}`);
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

function getOperation(roomCode: string): DynamoDB.DocumentClient.GetItemInput {
    return {
        TableName: process.env.GAMES_TABLE_NAME || '',
        Key: {
            roomCode,
        },
    };
}

async function getGameState(roomCode: string) {
    try {
        const getParams = getOperation(roomCode);
        const result = await ddbClient.get(getParams).promise();
        return result.Item;
    } catch (err) {
        console.error(err);
    }
}
