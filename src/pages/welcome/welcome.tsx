import React, {useState} from 'react';
import './welcome.css';
import DgInput from "../../components/dg-input/dg-input";
import {PlayerContext} from "../../contexts/playerContext";
import {RoomContext} from "../../contexts/roomContext";
import {useNavigate, useParams} from "react-router-dom";
import {db, Player} from "../../services/database";

function Welcome() {

  // @ts-ignore
  const [player, setPlayer] = React.useContext(PlayerContext);
  // @ts-ignore
  const [room, setRoom] = React.useContext(RoomContext);
  const navigate = useNavigate();
  const {roomCode} = useParams();

  const [joinRoomCodeValue, setJoinRoomCodeValue] = useState(roomCode || '');


  async function createRoom() {
    if (player.nickname !== '') {
      const currentRoom = await db.createRoom(setRoom);
      console.log(JSON.stringify(player, undefined, 2));
      await db.addPlayerToRoom(player);
      console.log(JSON.stringify(currentRoom, undefined, 2));

      navigate('/lobby');
    }
  }

  async function joinRoom() {
    console.log(`Joining the room ${joinRoomCodeValue}`);
    if (player.nickname !== '' && joinRoomCodeValue !== '') {
      const currentRoom = await db.getExistingRoomToJoinByCode(joinRoomCodeValue, setRoom);
      await db.addPlayerToRoom(player);
      console.log(currentRoom);
      navigate('/lobby');
    }
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
      <button onClick={createRoom}>Create room</button>
      <hr/>

      <DgInput
        label={"Room code:"}
        placeholder={"Enter room code"}
        value={joinRoomCodeValue}
        onChange={(event) => setJoinRoomCodeValue(event.target.value)}
      />
      <button onClick={joinRoom}>Join room</button>
    </div>
  );
}

export default Welcome;
