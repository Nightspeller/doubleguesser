# Doubleguesser

## Client
Frontend for the game, currently supports creating a game, joining a game, and rejoining.

## Server
AWS infrastructure for managing user authentication and game state.
- template.yaml - Root stack for the application.
- SAM_templates/tables/template.yaml - Table definitions for the user and game tables.
- SAM_templates/api/template.yaml - The API endpoint definition. Responsible for setting up the WebSocket.
- SAM_templates/api-lambdas/template.yaml - The lambdas invoked by specific API routes.
- SAM_templates/lambdas/template.yaml - Additional business logic lambdas, not directly related to the API.

## Deployment
First deploy the AWS infrastructure.
```bash
cd server
sam build
sam deploy --guided
```

Replace client/src/config/environment.tempalte.ts with the WebSocket URI output from above.

Build the client.
```bash
cd client
npm start
```

## Testing
A small testing script exist in server/tests which opens a websocket, creates a room, then adds a few players.
To run: 
``` bash
cd server
npm test
```

The API lambdas can also be tested locally by running the following:
``` bash
sam local invoke "LambdaFunctionName" -e events/event.json
```
Note that the event should have a userToken, roomCode, and connectionId to simulate the actual WebSocket event.

## Future Steps
- The front end should be built out to more fully display the game state, such as listing all current players,
and adding support for their nicknames.
- Game play: most business logic is already provided in client/src/services/* and should be attached to the UI.
- Valid player moves can then be sent to the server using the "UpdateGameFunction" route. Game updates will be sent to all connected players automatically.
- Once game play has begun, client should listen to the WebSocket for game changes, updating the UI according. React Contexts are used currently to make 
this easier. More fine grained updates can be added as needed.

## Cleanup

To delete the sample application that you created, use the AWS CLI. Assuming you used your project name for the stack name, you can run the following:

```bash
aws cloudformation delete-stack --stack-name HelloSAM
```