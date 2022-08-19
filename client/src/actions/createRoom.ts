import { CurrentRoom } from "../services/database";
import { getWebSocket } from "../services/websocket";

function getCreateRequest(player) {
	return JSON.stringify({
		action: "createRoom",
		userToken: player.userToken
	});
}

function sendWebSocketCreateRoomRequest(ws: WebSocket, request): Promise<CurrentRoom> {
	return new Promise((resolve, reject) => {
		const handleMessage = (event) => {
			ws.removeEventListener('message', handleMessage);
			resolve(JSON.parse(event.data)); //TODO verify this api call
		}
		ws.addEventListener('error', (e) => {
			console.error(e);
			reject();
		})
		ws.addEventListener('message', handleMessage);
		ws.send(request);
	});
}

export async function createRoom(player): Promise<CurrentRoom> {
	return new Promise(async (resolve, reject) => {
		try { 
		const ws = await getWebSocket();
		const request = getCreateRequest(player);
		const result = await sendWebSocketCreateRoomRequest(ws, request);
		resolve(result);
		} catch (err) {
			console.error(err);
			reject();
		}
	});
}