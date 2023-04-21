import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { randomUUID } from 'crypto';
import { blankGame } from './game';

const ddbParams = {
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION,
};

const ddbClient = new DynamoDB.DocumentClient(ddbParams);

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult;
    try {
        console.log('Received create room request: ', event);
        const connectionId = event?.requestContext?.connectionId;
        if (!connectionId) {
            throw new Error('Could not store connection. No connection ID.');
        }

        const userToken = JSON.parse(event.body || '{}').userToken;
        const userNickname = JSON.parse(event.body || '{}').userNickname;
        if (!userToken) {
            throw new Error('Could not store user. No user token.');
        }

        const roomCode = generateShortRoomCode();
        console.log(`Storing connectionId: ${connectionId} for userToken: ${userToken} for room: ${roomCode}`);
        await storeUserConnection(connectionId, roomCode, userToken);
        console.log(`Stored connectionId: ${connectionId} for userToken: ${userToken} for room: ${roomCode}`);
        console.log(`Storing new game state for room: ${roomCode}`);
        await storeNewGame(roomCode, userToken, userNickname);
        console.log(`Stored new game state for room: ${roomCode}`);
        response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Success!',
                roomCode,
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

function generateShortRoomCode(): string {
    return randomUUID().slice(0, 4);
}

function getConnectionPutOperation(
    connectionId: string,
    roomCode: string,
    userToken: string,
): DynamoDB.DocumentClient.PutItemInput {
    return {
        TableName: process.env.CONNECTIONS_TABLE_NAME as string,
        Item: {
            connectionId,
            roomCode,
            userToken,
        },
        ConditionExpression: 'attribute_not_exists(roomCode) AND attribute_not_exists(userToken)', //Prevent roomCode collisions and users having two rooms
    };
}

async function storeUserConnection(connectionId: string, roomCode: string, userToken: string): Promise<string> {
    try {
        const putParams = getConnectionPutOperation(connectionId, roomCode, userToken);
        await ddbClient.put(putParams).promise();
        return roomCode;
    } catch (err) {
        console.error(err);
        throw new Error('Failed to save user connection.');
    }
}

async function storeNewGame(roomCode: string, userToken: string, userNickname: string) {
    try {
        const game = createBlankGame(roomCode, userToken, userNickname);
        const putParams = getGamePutOpertaion(game);
        await ddbClient.put(putParams).promise();
    } catch (err) {
        console.error(err);
        throw new Error('Failed to create new game state.');
    }
}

function getGamePutOpertaion(game: any) {
    return {
        TableName: process.env.GAMES_TABLE_NAME || '',
        Item: game,
    };
}

function createBlankGame(roomCode: string, userToken: string, userNickname: string) {
    //TODO more game initialization? Choose an initial word?
    const result = Object.assign(
        {
            roomCode,
        },
        Object.assign({}, blankGame),
    );
    result.players = {};
    (result.players as any)[userToken] = {
        connected: true,
        score: 0,
        id: userToken,
        nickname: userNickname,
    };
    return result;
}
