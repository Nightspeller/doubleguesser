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

        const { userToken, roomCode, gameState } = JSON.parse(event.body || '{}');
        const isAuthenticated = await authenticateUserUpdate(userToken, connectionId, roomCode, gameState);
        if (!isAuthenticated) {
            response = {
                statusCode: 401,
                body: JSON.stringify({
                    message: 'Not authorized to modify game state',
                }),
            };
            return response;
        }

        await updateGameState(gameState);
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

function getPutOperation(gameState: any): DynamoDB.DocumentClient.PutItemInput {
    return {
        TableName: process.env.GAMES_TABLE_NAME || '',
        Item: gameState,
    };
}

async function updateGameState(gameState: string) {
    try {
        const putParams = getPutOperation(gameState);
        await ddbClient.put(putParams).promise();
    } catch (err) {
        console.error(err);
        throw new Error('Failed to update game state.');
    }
}

/**
 * A user can modify a game state if:
 * 1) their connectionId is stored in the connections table, and the user token and roomCode match
 * 2) The update is a valid game update (TODO - would require complicated business logic)
 */
async function authenticateUserUpdate(
    userToken: string | undefined,
    connectionId: string,
    roomCode: string | undefined,
    gameState: any | undefined,
): Promise<boolean> {
    if (!userToken) {
        throw new Error('Could not update game state. No user token provided.');
    }
    if (!gameState) {
        throw new Error('Could not update game state. No room code provided.');
    }
    if (!gameState) {
        throw new Error('Could not update game state. No new state provided.');
    }

    const connectionEntry = await getConnectionEntry(userToken, roomCode as string);
    const item = connectionEntry?.Item;
    if (item?.connectionId !== connectionId) {
        return false;
    }

    if (item?.userToken !== userToken) {
        return false;
    }

    if (item?.roomCode !== roomCode) {
        return false;
    }
    if (!isValidGameState(gameState)) {
        return false;
    }
    return true;
}

//TODO
function isValidGameState(gameState: any): boolean {
    //Get old game state
    //Compare that new game state is valid and reachable from old game state
    //ie no cheating
    return true;
}

function getConnectionOpereration(userToken: string, roomCode: string): DynamoDB.DocumentClient.GetItemInput {
    return {
        TableName: process.env.CONNECTIONS_TABLE_NAME || '',
        Key: {
            userToken,
            roomCode,
        },
    };
}

async function getConnectionEntry(userToken: string, roomCode: string): Promise<DynamoDB.DocumentClient.GetItemOutput> {
    try {
        const getParams = getConnectionOpereration(userToken, roomCode);
        return await ddbClient.get(getParams).promise();
    } catch (err) {
        console.error(err);
        throw new Error('Failed to retrieve connection entry.');
    }
}
