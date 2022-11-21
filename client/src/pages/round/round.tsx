import React, {ChangeEvent, useEffect, useState} from 'react';
import './round.css';
import {RoomContext} from "../../contexts/roomContext";
import {PlayerContext} from "../../contexts/playerContext";
import {db, PlayerId} from "../../services/database";

function Round() {
  // @ts-ignore
  const [room, setRoom] = React.useContext(RoomContext);
  // @ts-ignore
  const [player, setPlayer] = React.useContext(PlayerContext);

  const [playerInput, setPlayerInput] = useState('');
  const [phase, setPhase] = useState('hinting');

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

  console.log('Phase:', phase);
  if (room.currentRound.readyToPresentHints) {
    console.log('Ready to present hints')
    if (room.currentRound.readyToPresentGuesses) {
      console.log('Ready to present guesses, moving to checkingGuesses')
      phase !== 'checkingGuesses' ?? setPhase('checkingGuesses');
    } else {
      console.log('moving to guessing');
      phase !== 'guessing' ?? setPhase('guessing');
    }
  } else {
    if (numberOfHints === numberOfPlayers - numberOfGuessers && phase === 'hinting') {
      console.log('moving to moderation');
      setPhase('moderation');
    }
  }

  const hints: any = Object.values(room.currentRound.hints ?? {});

  console.log(hints);

  /*  useEffect(() => {
      console.log('UseEffect for the room runs', room);
      if (room.currentRound.readyToPresentHints) {
        if (room.currentRound.readyToPresentGuesses) {
          setPhase('checkingGuesses');
        } else {
          setPhase('guessing');
        }
      }
    }, [room.currentRound])*/

  function excludeHint(author: PlayerId) {
    db.setHintExclusion(author, true);
  }

  function includeHint(author: any) {
    db.setHintExclusion(author, false);
  }

  function presentHints() {
    db.setReadyToPresentHints();
  }

  function handleGuesserTyping(guess: string, word: 'first' | 'second') {
    db.setGuess(guess, word);
  }

  function presentGuesses() {
    db.setReadyToPresentGuesses();
  }

  function evaluateGuess(word: 'first' | 'second', isCorrect: boolean) {
    db.setGuessEvaluation(word, isCorrect);
  }

  async function concludeRound() {
    await db.concludeRound();
    await db.prepareNewRound();
    setPhase('hinting');
  }

  return (
    <div className="round">
      <div className={'hinting'} hidden={phase !== 'hinting'}>
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
      <div className={'moderation'} hidden={phase !== 'moderation' || currentPlayer.currentRole === 'guesser'}>
        {
          hints.map((hint: any) => {
            return <p key={hint?.author}>Player {hint?.author}: {hint?.hint}
              {
                hint.excluded ?
                  < button onClick={() => includeHint(hint?.author)}>Include hint</button> :
                  < button onClick={() => excludeHint(hint?.author)}>Exclude hint</button>
              }
            </p>
          })
        }
        <button onClick={presentHints}>Done! Present the Hints!</button>
      </div>
      <div className={'guessing'} hidden={phase !== 'guessing'}>
        {
          hints.map((hint: any) => {
            return <p key={hint?.author}>Player {hint?.author} hinted for the {hint.wordDescribed} word: {
              hint.excluded ?
                'Oh No! The hint was excluded!' :
                hint.hint
            }
            </p>
          })
        }
        <div hidden={currentPlayer.currentRole !== 'guesser'}>
          <label hidden={currentPlayer.currentRole !== 'guesser'}>
            First word guess:
            <input
              type={'text'}
              value={room.currentRound?.firstWordGuess?.guess}
              onChange={(e) => handleGuesserTyping(e.target.value, 'first')}
            />
          </label>
          {room.settings.numberOfWords === 2 ?? <label>Second word guess:
              <input
                  type={'text'}
                  value={room.currentRound?.secondWordGuess?.guess}
                  onChange={(e) => handleGuesserTyping(e.target.value, 'second')}
              /></label>}
          <button onClick={presentGuesses}>Submit Guesses!</button>
        </div>
      </div>
      <div className={'checkingGuesses'} hidden={phase !== 'checkingGuesses'}>
        <p>
          First word guess: {room.currentRound.firstWordGuess?.guess}
          <button hidden={currentPlayer.currentRole === 'guesser'} onClick={() => evaluateGuess('first', true)}>Mark as
            Correct!
          </button>
        </p>
        <p hidden={room.currentRound.secondWordGuess?.guess === undefined}>
          Second word guess: {room.currentRound.secondWordGuess?.guess}
          <button hidden={currentPlayer.currentRole === 'guesser'} onClick={() => evaluateGuess('second', true)}>Mark as
            Correct!
          </button>
        </p>
        <button hidden={currentPlayer.currentRole === 'guesser'} onClick={concludeRound}>Conclude the round!</button>
      </div>
    </div>
  );
}

export default Round;
