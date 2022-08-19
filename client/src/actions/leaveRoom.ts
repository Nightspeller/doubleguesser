import { getWebSocket, getWebSocketForClose } from "../services/websocket";

function getLeaveRequest() {
	return JSON.stringify({
		action: "leaveRoom"
	});
}

function sendWebSocketLeaveRoomRequest(ws: WebSocket, request): Promise<void> {
	return new Promise((resolve, reject) => {
		const handleMessage = (event) => {
			resolve();
		}
		ws.addEventListener('error', (e) => {
			console.error(e);
			reject();
		})
		ws.addEventListener('message', handleMessage);
		ws.send(request);
	});
}

const leaveRoom = async () => {
		try { 
		const ws = getWebSocketForClose();
		if (ws) {
			const request = getLeaveRequest();
			await sendWebSocketLeaveRoomRequest(ws, request);
			ws.close();
		}
		} catch (err) {
			console.error(err);
		}
	
}

export default leaveRoom;