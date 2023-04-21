import create from 'zustand'
import { LocalPlayer, Room } from "../types/types";

type State = {
  room: Room;
  player: LocalPlayer
}

type Actions = {
  setRoom: (newRoom: any) => void;
  setPlayerNickname: (playerNickname: string) => void;
}

let playerId = crypto.randomUUID();
if (localStorage.getItem('playerId')) {
  playerId = localStorage.getItem('playerId');
} else {
  localStorage.setItem('playerId', playerId);
}

export const useRoomStore = create<State & Actions>((set) => ({
  room: undefined,
  player: {
    nickname: localStorage.getItem('playerNickname') || '',
    id: playerId,
  },
  setRoom: (newRoom) => set(() => ({ room: newRoom })),
  setPlayerNickname: (playerNickname) => set((state) => {
    localStorage.setItem('playerNickname', playerNickname);
    return ({ player: { ...state.player, nickname: playerNickname } });
  }),
}))
