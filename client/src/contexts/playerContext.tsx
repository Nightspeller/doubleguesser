import React, {useState} from "react"

export const PlayerContext = React.createContext({
  player: {} as Player,
  setPlayer: () => null
})

let playerId = localStorage.getItem('playerId') ?? '';
let playerNickname = localStorage.getItem('playerNickname') ?? '';
if (playerId === '') {
  playerId =  Math.random().toString(36).slice(2, 7).toUpperCase();
  localStorage.setItem('playerId', playerId);
}

type Player = {
	id: string;
	nickname: string;
	currentRole: string;
	connected: boolean;
	score: number;
	userToken: string | undefined;
}

// @ts-ignore
export const PlayerProvider = ({ children }) => {

  const playerInitialState: Player = {
    id: playerId,
    nickname: playerNickname,
    currentRole: 'hinter',
    connected: true,
    score: 0,
	userToken: undefined
  }

  const [player, setPlayer] = useState(playerInitialState);

  const setPlayerWrapper = (playerToSet: any) => {
    localStorage.setItem('playerNickname', playerToSet.nickname);
    setPlayer(playerToSet);
  }

  return (
    // @ts-ignore
    <PlayerContext.Provider value={[ player, setPlayerWrapper ]}>
      { children }
    </PlayerContext.Provider>
  )
}
