import React, { useState } from "react";
import "./welcome.css";
import DgInput from "../../components/dg-input/dg-input";
import { useNavigate, useParams } from "react-router-dom";
import { createRoom } from "../../actions/createRoom";
import { joinRoom } from "../../actions/joinRoom";
import { rejoinRoom } from "../../actions/rejoinRoom";
import { useRoomStore } from "../../services/roomStore";

function Welcome() {
  const room = useRoomStore((state) => state.room);
  const player = useRoomStore((state) => state.player);
  const setPlayerNickname = useRoomStore((state) => state.setPlayerNickname);

  const navigate = useNavigate();
  const { roomCode } = useParams();
  const [joinRoomCodeValue, setJoinRoomCodeValue] = useState(roomCode || "");

  console.log("Rendering Welcome page", room);

  async function submitCreateRoom() {
    if (player.nickname !== "") {
      console.log("Creating new room");
      const currentRoom = await createRoom(player);
      console.log("Navigating to the lobby");
      navigate(`/lobby/${currentRoom.roomCode}`);
    } else {
      alert("Please enter Nickname");
    }
  }

  async function submitJoinRoom() {
    if (player.nickname !== "" &&  joinRoomCodeValue !== "") {
      console.log('Joining the room with room code', joinRoomCodeValue);
      let currentRoom;
      if (localStorage.getItem(joinRoomCodeValue)) {
        console.log('Player already joined this room in the past, rejoining instead')
        currentRoom = await rejoinRoom(joinRoomCodeValue);
      } else {
        currentRoom = await joinRoom(player, joinRoomCodeValue);
      }
      navigate(`/lobby/${currentRoom.roomCode}`);
    } else {
      alert('Nickname or room code is missing');
    }
  }

  return (
    <div className="welcome">
      {JSON.stringify(room)}
      <DgInput
        label={"Nickname:"}
        placeholder={"Enter your nickname"}
        value={player.nickname}
        onChange={(event) => setPlayerNickname(event.target.value)}
      />
      <hr />
      <button onClick={submitCreateRoom}>Create room</button>
      <hr />

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
