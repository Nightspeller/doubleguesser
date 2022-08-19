import { REACT_APP_WEBSOCKET_URI } from "../config/environment";

let ws: WebSocket;
export enum WSStates {
	CONNECTING = 0,
	OPEN = 1,
	CLOSING = 2,
	CLOSED = 3
} 


export function getWebSocket(): Promise<WebSocket> {
	if (ws?.readyState === WSStates.OPEN) {
		return Promise.resolve(ws);
	}
	if (ws?.readyState === WSStates.CONNECTING) {
		return new Promise((resolve, reject) => {
			const handleOpen = () => {
				ws.removeEventListener('open', handleOpen)
				resolve(ws);
			}
			ws.addEventListener('open', handleOpen);
		});
		}
	return new Promise((resolve, reject) => {
		ws = new WebSocket(REACT_APP_WEBSOCKET_URI);
		const handleOpen = () => {
			ws.removeEventListener('open', handleOpen)
			resolve(ws);
		}
		ws.addEventListener('open', handleOpen);
		ws.addEventListener('error', (err) => {
			console.error(err);
			reject();
		})
	});
}

export function getWebSocketForClose() {
	if (ws?.readyState === WSStates.OPEN) {
		return ws;
	}
}