import React, {useState} from 'react';
import './welcome.css';
import DgInput from "../../components/dg-input/dg-input";
import {PlayerContext} from "../../contexts/playerContext";
import {RoomContext} from "../../contexts/roomContext";
import {useNavigate, useParams} from "react-router-dom";
import {db, Player} from "../../services/database";
import { createRoom } from '../../actions/createRoom';
import { joinRoom } from '../../actions/joinRoom';
import { rejoinRoom } from '../../actions/rejoinRoom';

function Welcome() {

  // @ts-ignore
  const [player, setPlayer] = React.useContext(PlayerContext);
  // @ts-ignore
  const [room, setRoom] = React.useContext(RoomContext);
  const navigate = useNavigate();
  const {roomCode} = useParams();

  const [joinRoomCodeValue, setJoinRoomCodeValue] = useState(roomCode || '');


  async function submitCreateRoom() {
    if (player.nickname !== '') {
    //   const currentRoom = await db.createRoom(setRoom);
    //   console.log(JSON.stringify(player, undefined, 2));
    //   await db.addPlayerToRoom(player);
    //   console.log(JSON.stringify(currentRoom, undefined, 2));

    //   navigate('/lobby');
		player.userToken = crypto.randomUUID();
		setPlayer(player);
		const currentRoom = await createRoom(player);
		setRoom(currentRoom);
		navigate(`/lobby/${currentRoom.roomCode}`);
    }
  }

  async function submitJoinRoom() {
    // console.log(`Joining the room ${joinRoomCodeValue}`);
    // if (player.nickname !== '' && joinRoomCodeValue !== '') {
    //   const currentRoom = await db.getExistingRoomToJoinByCode(joinRoomCodeValue, setRoom);
    //   await db.addPlayerToRoom(player);
    //   console.log(currentRoom);
    //   navigate('/lobby');
    // }
		let currentRoom;
		if (localStorage.getItem(joinRoomCodeValue)) {
			player.userToken = localStorage.getItem(joinRoomCodeValue);
			setPlayer(player);
			currentRoom = await rejoinRoom(joinRoomCodeValue);
		} else {
			player.userToken = crypto.randomUUID();
			setPlayer(player);
			currentRoom = await joinRoom(player, joinRoomCodeValue);
		}
		setRoom(currentRoom);
		navigate(`/lobby/${currentRoom.roomCode}`);
  }

  return (
    <div className="welcome">
      {JSON.stringify(room)}
      <DgInput
        label={"Nickname:"}
        placeholder={"Enter your nickname"}
        value={player.nickname}
        onChange={(event) => setPlayer({...player, nickname: event.target.value})}
      />
      <hr/>
      <button onClick={submitCreateRoom}>Create room</button>
      <hr/>

      <DgInput
        label={"Room code:"}
        placeholder={"Enter room code"}
        value={joinRoomCodeValue}
        onChange={(event) => setJoinRoomCodeValue(event.target.value)}
      />
      <button onClick={submitJoinRoom}>Join room</button>
    </div>
  );
}

export default Welcome;
