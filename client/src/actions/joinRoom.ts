import { CurrentRoom } from "../services/database";
import { getWebSocket, WSStates } from "../services/websocket";

function getJoinRoomRequest(player, roomCode) {
	return JSON.stringify({
		action: "joinRoom",
		userToken: player.id,
		roomCode,
		userNickname: player.nickname,
	});
}

async function sendWebSocketJoinRoomRequest(ws: WebSocket, request): Promise<CurrentRoom> {
	return new Promise((resolve, reject) => {
		const handleMessage = (event) => {
			ws.removeEventListener('message', handleMessage);
			resolve(JSON.parse(event.data));
		}

		ws.addEventListener('error', (e) => {
			console.error(e);
			reject();
		});
		ws.addEventListener('message', handleMessage);
		ws.send(request);
	});
}

export async function joinRoom(player, roomCode): Promise<CurrentRoom> {
	return new Promise(async (resolve, reject) => {
		try {
			const ws = await getWebSocket();
			const request = getJoinRoomRequest(player, roomCode);
			const result = await sendWebSocketJoinRoomRequest(ws, request);
			resolve(result);
		} catch (err) {
			console.error(err);
			reject();
		}
	});
}
