import * as readline from 'readline';
import * as crypto from 'crypto';
import { WebSocket } from 'ws';
import { exit } from 'process';
import * as _ from 'lodash';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const parameters: any = {
    url: 'wss://bcxldx0wji.execute-api.us-east-2.amazonaws.com/Dev/',
    numberOfPlayers: 3,
    players: [] as Array<any>,
};

rl.question(`Websocket url [${parameters.url}]:`, async (urlInput) => {
    if (urlInput) parameters.url = urlInput;

    rl.setPrompt(`Number of players [${parameters.numberOfPlayers}]:`);
    rl.prompt();
    rl.on('line', async (input) => {
        const numPlayers = parseInt(input || parameters.numberOfPlayers);
        if (isNaN(numPlayers) || numPlayers < 3 || numPlayers > 10) {
            console.log('Number of players should be between 3 and 10 inclusive.');
            process.exit(-1);
        }
        parameters.numberOfPlayers = numPlayers;

        for (let i = 0; i < numPlayers; i++) {
            parameters.players.push({
                userToken: crypto.randomUUID(),
            });
        }
        rl.close();
        await runTests();
        return;
    });
});

function setupPlayerWS(player: any): Promise<any> {
    return new Promise((resolve, reject) => {
        player.ws = new WebSocket(parameters.url);
        const handleOpen = () => {
            console.log('Connected to websocket.');
            resolve(player);
            player.ws.removeEventListener('open', handleOpen);
        };
        player.ws.addEventListener('open', handleOpen);
        player.ws.addEventListener('error', (err: any) => {
            console.error('Failed to open websocket with error: ', err);
            exit(-1);
        });
    });
}

function testCreateRoom(player: any): Promise<any> {
    return new Promise((resolve, reject) => {
        const handleMessage = (message: any) => {
            const messageObj = JSON.parse(message.data);
            if (messageObj.roomCode) {
                console.log('Successfuly created room with room code: ', messageObj.roomCode);
                player.gameState = messageObj;
                parameters.roomCode = messageObj.roomCode;
                resolve(messageObj);
            } else {
                console.error('Failed to create room.');
                reject();
            }
            player.ws.removeEventListener('message', handleMessage);
            player.ws.addEventListener('message', (message: any) => {
                console.log(`Player: ${player.userToken} recieved game state update.`);
                player.gameState = JSON.parse(message.data);
            });
        };
        player.ws.addEventListener('message', handleMessage);
        const createRequest = {
            action: 'createRoom',
            userToken: player.userToken,
        };
        player.ws.send(JSON.stringify(createRequest));
    });
}

function assertGameStateEquaility(players: Array<any>): boolean {
    return players.every((player) => {
        return _.isEqual(player.gameState, players[0].gameState);
    });
}

function testAllPlayersJoinRoom(): Promise<void> {
    const joinPromises: Array<Promise<any>> = [];
    return new Promise(async (resolve, reject) => {
        for (let i = 1; i < parameters.players.length; i++) {
            joinPromises.push(
                new Promise(async (res, rej) => {
                    const player = await setupPlayerWS(parameters.players[i]);
                    const joinRequest = {
                        action: 'joinRoom',
                        userToken: player.userToken,
                        roomCode: parameters.roomCode,
                    };
                    const handleMessage = (message: any) => {
                        const messageObj = JSON.parse(message.data);
                        if (messageObj.roomCode) {
                            console.log('Successfuly joined room with room code: ', messageObj.roomCode);
                            player.gameState = messageObj;
                            res(player);
                        } else {
                            console.error('Failed to join room.');
                            rej();
                        }
                        player.ws.removeEventListener('message', handleMessage);
                        player.ws.addEventListener('message', (message: any) => {
                            console.log(`Player: ${player.userToken} recieved game state update.`);
                            player.gameState = JSON.parse(message.data);
                        });
                    };
                    player.ws.addEventListener('message', handleMessage);
                    player.ws.send(JSON.stringify(joinRequest));
                }),
            );
        }
        await Promise.all(joinPromises);
        if (assertGameStateEquaility(parameters.players)) {
            console.log('All players successfully joined with matching game states.');
            resolve();
        } else {
            console.error('Other players failed to join room.');
            exit(-1);
        }
    });
}

function testPlayerLeaveRoom() {}

function testPlayerRejoinRoom() {}

function cleanUp() {}

async function runTests() {
    const host = parameters.players[0];
    await setupPlayerWS(host);
    await testCreateRoom(host);
    await testAllPlayersJoinRoom();
}
