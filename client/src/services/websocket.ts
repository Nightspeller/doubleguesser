import { REACT_APP_WEBSOCKET_URI } from "../config/environment";

let ws: WebSocket;
export enum WSStates {
	CONNECTING = 0,
	OPEN = 1,
	CLOSING = 2,
	CLOSED = 3
} 

async function openWebSocket(): Promise<WebSocket> {
	return new Promise((resolve, reject) => {
		if (!ws || ws.readyState !== WSStates.CONNECTING) {
			ws = new WebSocket(REACT_APP_WEBSOCKET_URI);
		}
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

export function setupWebSocket(): Promise<WebSocket> {
	if (ws?.readyState === WSStates.OPEN) {
		return Promise.resolve(ws);
	}
	return openWebSocket();
}

export function getWebSocket(): Promise<WebSocket> {
	if (!ws) {
		return setupWebSocket();
	} 
	if (ws.readyState === WSStates.CONNECTING) {
		return new Promise((resolve, reject) => {
			const handleOpen = () => {
				ws.removeEventListener('open', handleOpen)
				resolve(ws);
			}
			ws.addEventListener('open', handleOpen);
		})
	}
	return Promise.resolve(ws);
}

export async function closeWebSocket() {
	if (ws) ws.close();
}