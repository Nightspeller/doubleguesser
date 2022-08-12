import * as readline from 'readline';
import * as crypto from 'crypto';
import WebSocket from 'ws';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const defaultParameters = {
    url: 'wss://aulzd4zd2l.execute-api.us-east-2.amazonaws.com/Dev',
    numberOfPlayers: 3,
};

rl.question('Websocket url:', (urlInput) => {
    const url = urlInput;

    rl.setPrompt('Number of players:');
    rl.prompt();
    rl.on('line', (input) => {
        const numPlayers = parseInt(input);
        if (isNaN(numPlayers) || numPlayers < 3 || numPlayers > 10) {
            console.log('Number of players should be between 3 and 10 inclusive.');
            process.exit(-1);
        }

        const playerData: Array<any> = [];
        for (let i = 0; i < numPlayers; i++) {
            playerData.push({
                userToken: crypto.randomUUID(),
            });
        }

        const ws1 = new WebSocket(url);
        const createMessage = `{"action":"createRoom","userToken":"${playerData[0].userToken}"}`;
        let gameState: any;
        ws1.on('open', () => {
            ws1.on('message', (message, isBinary) => {
                console.log(isBinary, message.toString());
                gameState = JSON.parse(message.toString());
                setTimeout(() => {
                    //Let everyone else join
                    for (let i = 1; i < numPlayers; i++) {
                        const joinMessage = `{"action":"joinRoom","userToken":"${playerData[i].userToken}","roomCode":"${gameState.roomCode}"}`;
                        ws1.on('message', (message, isBinary) => {
                            console.log(isBinary, message.toString());
                        });
                        ws1.send(joinMessage, (err) => {
                            console.log(err);
                        });
                    }
                }, 3000);
            });
            ws1.send(createMessage, (err) => {
                console.log(err);
            });
        });

        rl.close();
    });
});
