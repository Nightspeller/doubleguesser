import React, {useState} from "react";
import { PlayerContext } from "./playerContext";

export const RoomContext = React.createContext({
  room: {},
  setRoom: () => null
})
// @ts-ignore
export const RoomProvider = ({ children }) => {

	  // @ts-ignore
	const [player, setPlayer] = React.useContext(PlayerContext);

	const [room, _setRoom] = useState({});

	const setRoom = (newRoom) => {
		localStorage.setItem(newRoom.roomCode, player.userToken);
		_setRoom(newRoom);
	}


  document.onkeydown = function (event) {
    if (event.key === '`') console.log(room);
  };

  return (
    // @ts-ignore
    <RoomContext.Provider value={[ room, setRoom ]}>
      { children }
    </RoomContext.Provider>
  )
}
