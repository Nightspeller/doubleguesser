import { APIGatewayProxyResult, DynamoDBRecord, DynamoDBStreamEvent, StreamRecord } from 'aws-lambda';
import { DynamoDB, ApiGatewayManagementApi } from 'aws-sdk';

const ddbParams = {
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION,
};
const ddbClient = new DynamoDB.DocumentClient(ddbParams);

const apiParams = {
	apiVersion: '2018-11-29',
	endpoint: process.env.WEBSOCKET_ENDPOINT
};
const api = new ApiGatewayManagementApi(apiParams);


export const lambdaHandler = async (event: DynamoDBStreamEvent): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult;
    try {
		const records: DynamoDBRecord[] = event.Records;
		if (!records) {
			throw new Error('Failed up update client game states. DB failed to provide update.');
		}
		//TODO I forsee a possible race condition with users all making moves at once
		//More fine grained state updates can help resolve this
		//Batch writing to the DB to ensure consistent state updates could also help
		//But for now its not that big a deal
		const gameUpdates = records.map(async record => {
			const formattedImage = DynamoDB.Converter.unmarshall(record?.dynamodb?.NewImage);
			const roomCode = formattedImage.roomCode;
			if (!roomCode) {
				throw new Error('Game state does not have a roomCode, could not update players.');
			}

			const connections = await getConnectedPlayerConnections(roomCode);
			const playerUpdates = connections.map(async entry => {
				await updatePlayer(entry.connectionId, formattedImage);
			});

			try {
				await Promise.all(playerUpdates);
			} catch (err) {
				console.error(err);
				throw new Error();
			}
		});

		try {
			await Promise.all(gameUpdates);
		} catch (err) {	
			console.log(err);
			throw new Error();
		}

        response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Success!'
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

//Scans are considered "bad" but because roomCode is the tables sort key this isn't actually too bad.
//Setting roomCode as a GSI would speed it up, but cost more $$$.
function getScanOperation(roomCode: string): DynamoDB.DocumentClient.ScanInput {
	return {
		TableName: process.env.CONNECTIONS_TABLE_NAME,
		ProjectionExpression: 'connectionId',
		FilterExpression: '#roomCode = :code',
		ExpressionAttributeValues: { ':code': roomCode },
		ExpressionAttributeNames: {'#roomCode': 'roomCode'}
	}
}

async function getConnectedPlayerConnections(roomCode: string): Promise<DynamoDB.DocumentClient.ItemList> {
	try {
		const scanParams = getScanOperation(roomCode);
		const result = await ddbClient.scan(scanParams).promise();
		return result.Items || [];
	} catch (err) {
		console.log(err);
		throw new Error('Failed to retrieve player connections for game update.');
	}

}

async function updatePlayer(connectionId: string, gameState: any) {
	try {
		await api.postToConnection({ ConnectionId: connectionId, Data: JSON.stringify(gameState) }).promise();
	} catch (err) {
		console.error(err);
		throw new Error(`Failed up send game state to player with connectionId: ${connectionId}`);
	}
}