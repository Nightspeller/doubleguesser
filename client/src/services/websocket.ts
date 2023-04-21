import { REACT_APP_WEBSOCKET_URI } from "../config/environment";
import { useRoomStore } from "./roomStore";
import { Room } from "../types/types";

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
      ws.removeEventListener("open", handleOpen);
      resolve(ws);
    };
    ws.addEventListener("open", handleOpen);
    ws.addEventListener("error", (err) => {
      console.error(err);
      reject();
    });
    const handleClose = (event) => {
      console.log("WebSocket connection closed", event);
      ws.removeEventListener("close", handleClose);
    };
    ws.addEventListener("close", handleClose);
    const handleMessage = (event) => {
      console.log("WebSocket message arrived, calling messageHandler", JSON.parse(event.data));
      useRoomStore.setState({ room: JSON.parse(event.data) });
    };
    ws.addEventListener("message", handleMessage);
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
    console.log("Tried to get webSocket which was not set up");
  }
  if (ws.readyState === WSStates.CONNECTING) {
    return new Promise((resolve, reject) => {
      const handleOpen = () => {
        ws.removeEventListener("open", handleOpen);
        resolve(ws);
      };
      ws.addEventListener("open", handleOpen);
    });
  }
  return Promise.resolve(ws);
}

export async function closeWebSocket() {
  if (ws) ws.close();
}

type WebSocketRequestActionsAndPayloads = {
  "createRoom": {
    userToken: string,
    userNickname: string,
  },
  "joinRoom": {
    userToken: string,
    roomCode: string,
    userNickname: string,
  },
  "leaveRoom": {
    userToken: string,
    roomCode: string,
  },
  "rejoinRoom": {
    userToken: string,
    roomCode: string,
  },
  "updateGame": {
    userToken: string,
    roomCode: string,
    gameState: Room,
  },
};

export async function sendWebSocketRequest<P extends keyof WebSocketRequestActionsAndPayloads, V extends WebSocketRequestActionsAndPayloads[P]>(action: P, payload: V) {
  if (ws.readyState === WSStates.OPEN) {
    ws.send(JSON.stringify({
      action: action,
      ...payload
    }));
  } else {
    console.error("WS connection is not open");
  }
}
