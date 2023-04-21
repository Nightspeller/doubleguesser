import React, { useEffect, useState } from "react";
import "./lobby.css";
import DgInput from "../../components/dg-input/dg-input";
import { useNavigate, useParams } from "react-router-dom";
import { rejoinRoom } from "../../actions/rejoinRoom";
import { useRoomStore } from "../../services/roomStore";
import { Room, RoomSettings } from "../../types/types";
import { sendWebSocketRequest } from "../../services/websocket";

function Lobby() {

  const room = useRoomStore((state) => state.room);
  const player = useRoomStore((state) => state.player);

  console.log("Rendering Lobby", room);

  const { roomCode } = useParams();

  async function attemptRejoin() {
    console.log("Rejoin function called, checking if should rejoin.");
    if (roomCode && Object.values(room).length === 0 && localStorage.getItem(roomCode)) {
      console.log("Rejoining");
      const currentRoom = await rejoinRoom(roomCode);
    } else {
      console.log("Not Rejoining");
    }
  }

  useEffect(() => {
    //attemptRejoin();
  }, []);

  const [rulesDialogOpened, setRulesDialogOpened] = useState(false);
  const navigate = useNavigate();

  /*  useEffect(() => {
      if (room.currentRound.firstWord !== '') {
       // navigate('/round');
      }
    }, [room])*/

  async function startNewRound() {
    if (Object.values(room.players).length < room.settings.numberOfGuessers + room.settings.numberOfSaboteurs + 1) {
      alert("Not enough players");
    } else {
      //await db.prepareNewRound();
      navigate("/round");
    }
  }

  async function updateSettings<P extends keyof RoomSettings, V extends RoomSettings[P]>(parameter: P, value: V) {
    console.log(`Updating ${parameter} to be ${value}`);
    await sendWebSocketRequest("updateGame", {
      roomCode: room.roomCode,
      userToken: player.id,
      gameState: { ...room, settings: { ...room.settings, [parameter]: value } }
    });
    console.log('Updated');
  }

  return (
    <div>
      {Object.values(room).length > 0 ?
        <div className="lobby">
          <div>
            <h1>Players</h1>
            {Object.values(room.players).map((player: any) => {
              return <p key={player.id}>{player.nickname}, {player.id}</p>;
            })}
          </div>
          <div className={"settings"}>
            <p>{JSON.stringify(room.settings, undefined, 2)}</p>
            <h1>Settings</h1>
            <label>
              Number of words:
              <select
                value={room.settings.numberOfWords}
                onChange={(event) => updateSettings("numberOfWords", +event.target.value as 1 | 2)}
              >
                <option value={2}>2</option>
                <option value={1}>1</option>
              </select>
            </label>
            <label>
              Number of rounds:
              <select
                value={room.settings.rounds}
                onChange={(event) => updateSettings("rounds", +event.target.value as 5 | 10 | 15)}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </select>
            </label>
            <label>
              Timer:
              <select
                value={room.settings.timer}
                onChange={(event) => updateSettings("timer", +event.target.value as 30 | 60 | 90 | 0)}
              >
                <option value={0}>None</option>
                <option value={30}>30 seconds</option>
                <option value={60}>60 seconds</option>
                <option value={90}>90 seconds</option>
              </select>
            </label>
            <label>
              Number of guessers:
              <select
                value={room.settings.numberOfGuessers}
                onChange={(event) => updateSettings("numberOfGuessers", +event.target.value as 1 | 2)}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
              </select>
            </label>
            <label>
              Friendly moderation:
              <input
                type="checkbox"
                checked={room.settings.moderation}
                onChange={(event) => updateSettings("moderation", event.target.checked)}
              />
            </label>
            <label>
              Number of saboteurs:
              <select
                value={room.settings.numberOfSaboteurs}
                onChange={(event) => updateSettings("numberOfSaboteurs", +event.target.value as 1 | 2)}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
              </select>
            </label>
            <label>
              Mix the clues (for 2-word mode):
              <input
                type="checkbox"
                checked={room.settings.mixWords}
                onChange={(event) => updateSettings("mixWords", event.target.checked)}
              />
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
            min 5 players - 4 hinters 1 guesser<br />
            max 8 players - 2 guessers, 6 hinters

            <h3>With Saboteurs:</h3>
            min 6 players - 1 guesser, 1 saboteur, 4 hinters<br />
            max 10 players - 2 guessers, 2 saboteurs, 6 hinters

            <h2>2 Words:</h2>
            <h3>Without Saboteurs:</h3>
            min 9 players - 1 guesser, 2*4 hinters<br />
            max 14 players - 2 guessers, 2*6 hinters

            <h3>With Saboteurs:</h3>
            min 11 players - 1 guesser, 2*1 saboteur, 2*4 hinters<br />
            max 18 players - 2 guessers, 2*2 saboteurs, 2*6 hinters
            <br />
            <button onClick={() => setRulesDialogOpened(false)}>Close</button>
          </dialog>
        </div>
        : <p>The room object is empty, nothing to show here :-(</p>}
    </div>
  );
}

export default Lobby;
