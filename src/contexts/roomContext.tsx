import React, {useState} from "react";

export const RoomContext = React.createContext({
  room: {},
  setRoom: () => null
})

// @ts-ignore
export const RoomProvider = ({ children }) => {

const [room, setRoom] = useState({});


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
