import React, {useEffect, useState} from 'react';
import './lobby.css';
import DgInput from "../../components/dg-input/dg-input";
import {PlayerContext} from "../../contexts/playerContext";
import {RoomContext} from "../../contexts/roomContext";
import {useNavigate, useParams} from "react-router-dom";
import {currentRoom, db} from "../../services/database";
import { rejoinRoom } from '../../actions/rejoinRoom';

function Lobby() {

  // @ts-ignore
  const [room, setRoom] = React.useContext(RoomContext);
    // @ts-ignore
  const [player, setPlayer ] = React.useContext(PlayerContext);

  const { roomCode }= useParams();

  async function attemptRejoin() {
	if (roomCode && Object.values(room).length === 0 && localStorage.getItem(roomCode)) {
		player.userToken = localStorage.getItem(roomCode);
		setPlayer(player);
		const currentRoom = await rejoinRoom(roomCode);
		setRoom(currentRoom);
	}
  }

  useEffect(() => {
		attemptRejoin();
	}, []);

  const [rulesDialogOpened, setRulesDialogOpened] = useState(false);
  const navigate = useNavigate();

/*  useEffect(() => {
    if (room.currentRound.firstWord !== '') {
     // navigate('/round');
    }
  }, [room])*/

  async function startNewRound() {
    if (Object.values(room.players).length < room.settings.numberOfGuessers+room.settings.numberOfSaboteurs+1) {
      alert('Not enough players')
    } else {
      await db.prepareNewRound();
      navigate('/round');
    }
  }

  console.log(room);
  return (
	<div>
	{ Object.values(room).length > 0 ? 
    <div className="lobby">
      <div>
        <h1>Players</h1>
        {Object.values(room.players).map((player:any) => {
          return <p key={player.id}>{player.nickname}</p>
        })}
      </div>
      <div className={"settings"}>
        <h1>Settings</h1>
        <label>
          Number of words:
          <select defaultValue={room.settings.numberOfWords}>
            <option>2</option>
            <option>1</option>
          </select>
        </label>
        <label>
          Number of rounds:
          <select>
            <option>5</option>
            <option>10</option>
            <option>15</option>
          </select>
        </label>
        <label>
          Timer:
          <select>
            <option>None</option>
            <option>30 seconds</option>
            <option>60 seconds</option>
            <option>90 seconds</option>
          </select>
        </label>
        <label>
          Number of guessers:
          <select>
            <option>1</option>
            <option>2</option>
          </select>
        </label>
        <label>
          Friendly moderation:
          <input type={"checkbox"}/>
        </label>
        <label>
          Saboteurs:
          <input type={"checkbox"}/>
        </label>
        <label>
          Mix the clues (for 2-word mode):
          <input type={"checkbox"}/>
        </label>
      </div>
      <div>
        <button onClick={startNewRound}>Start</button>
      </div>
      <div>
        <button onClick={() => setRulesDialogOpened(true)}>Show recommended configurations</button>
      </div>
      <dialog open={rulesDialogOpened}>
        <h1>Recommended player configurations:</h1>
        <h2>1 Word:</h2>
        <h3>Without Saboteurs:</h3>
        min 5 players - 4 hinters 1 guesser<br/>
        max 8 players - 2 guessers, 6 hinters

        <h3>With Saboteurs:</h3>
        min 6 players - 1 guesser, 1 saboteur, 4 hinters<br/>
        max 10 players - 2 guessers, 2 saboteurs, 6 hinters

        <h2>2 Words:</h2>
        <h3>Without Saboteurs:</h3>
        min 9 players - 1 guesser, 2*4 hinters<br/>
        max 14 players - 2 guessers, 2*6 hinters

        <h3>With Saboteurs:</h3>
        min 11 players - 1 guesser, 2*1 saboteur, 2*4 hinters<br/>
        max 18 players - 2 guessers, 2*2 saboteurs, 2*6 hinters
        <br/>
        <button onClick={() => setRulesDialogOpened(false)}>Close</button>
      </dialog>
    </div>
	: null }
	</div>
  );
}

export default Lobby;
