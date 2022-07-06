import React, {useState} from 'react';
import './round.css';
import {RoomContext} from "../../contexts/roomContext";
import {PlayerContext} from "../../contexts/playerContext";
import {db, PlayerId} from "../../services/database";

function Round() {
  // @ts-ignore
  const [room, setRoom] = React.useContext(RoomContext);
  // @ts-ignore
  const [player, setPlayer] = React.useContext(PlayerContext);

  const [playerInput, setPlayerInput] = useState('')
  const [phase, setPhase] = useState('hinting')

  const currentPlayer = room.players[player.id];
  let currentPlayerRole;
  if (room.currentRound.guessers.includes(currentPlayer.id)) currentPlayerRole = 'guesser';
  if (room.currentRound.firstWordSaboteurs?.includes(currentPlayer.id)) currentPlayerRole = 'firstWordSaboteur';
  if (room.currentRound.secondWordSaboteurs?.includes(currentPlayer.id)) currentPlayerRole = 'secondWordSaboteur';
  if (room.currentRound.firstWordHinters.includes(currentPlayer.id)) currentPlayerRole = 'firstWordHinter';
  if (room.currentRound.secondWordHinters?.includes(currentPlayer.id)) currentPlayerRole = 'secondWordHinter';
  currentPlayer.currentRole = currentPlayerRole;

  function sendHint() {
    db.submitHint(playerInput);
    db.submitHint('BBBB', 'B');
    db.submitHint('CCCC', 'C');
  }

  const numberOfHints = Object.values(room.currentRound.hints ?? {}).length;
  const numberOfPlayers = Object.values(room.players).length;
  const numberOfGuessers = Object.values(room.currentRound.guessers ?? {}).length;

  console.log(numberOfHints, numberOfPlayers, numberOfGuessers);
  if (numberOfHints === numberOfPlayers - numberOfGuessers && phase === 'hinting') {
    console.log('moving to moderation');
    setPhase('moderation');
  }

  const hints:any  = Object.values(room.currentRound.hints ?? {});

  console.log(hints);

  function excludeHint(author: PlayerId) {
    db.excludeHint(author);
  }

  return (
    <div className="round">
      <div className={'hinting'} hidden={phase === 'moderation'}>
        Room code: {room.roomCode}<br/>
        Player: {JSON.stringify(currentPlayer)}<br/>
        Player role: {currentPlayer.currentRole}<br/>
        Number of words: {room.settings.numberOfWords}<br/>
        First word: {room.currentRound.firstWord}<br/>
        Second word: {room.currentRound.secondWord}<br/>
        <div hidden={currentPlayer.currentRole === 'guesser'}>
          Write hint:
          <input
            type={'text'}
            value={playerInput}
            onChange={(e) => setPlayerInput(e.target.value)}
          />
          <button onClick={sendHint}>Send!</button>
        </div>
      </div>
      <div className={'moderation'} hidden={phase === 'hinting'}>
        {hints.map((hint: any) => {
          return <p key={hint?.author}>Player {hint?.author}: {hint?.hint} < button onClick={() => excludeHint(hint?.author)}>Exclude hint</button></p>
        })}

      </div>

    </div>
  );
}

export default Round;
