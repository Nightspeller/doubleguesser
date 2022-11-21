import { CurrentRoom } from "../services/database";
import { getWebSocket } from "../services/websocket";
import { joinRoom } from "./joinRoom";

function getRejoinRequest(roomCode, userToken) {
	return JSON.stringify({
		action: "rejoinRoom",
		roomCode,
		userToken
	})
}

async function sendWebSocketRejoinRoomRequest(ws: WebSocket, request): Promise<CurrentRoom | undefined> {
	return new Promise((resolve, reject) => {
		try {
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
		} catch (err) {
			console.log(err);
			reject();
		}
	});
}

export async function rejoinRoom(roomCode): Promise<CurrentRoom | undefined> {
	return new Promise(async (resolve, reject) => {
		try {
			const userToken = localStorage.getItem(roomCode);
			if (!userToken) {
				return joinRoom(roomCode, userToken)
			}
			const ws = await getWebSocket();
			const request = getRejoinRequest(roomCode, userToken);
			const result = await sendWebSocketRejoinRoomRequest(ws, request);
			resolve(result);
		} catch (err) {
			console.error(err);
			reject();
		}
	});
}