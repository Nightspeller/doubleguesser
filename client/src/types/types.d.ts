export type PlayerId = string;

export type LocalPlayer = {
  id: PlayerId,
  nickname: string,
}

export type Player = {
  id: PlayerId,
  nickname: string,
  connected: boolean,
  score: number,
}

export type Round = {
  firstWord: string,
  secondWord?: string,
  guessers: PlayerId[],
  firstWordSaboteurs?: PlayerId[],
  secondWordSaboteurs?: PlayerId[],
  firstWordHinters: PlayerId[],
  secondWordHinters?: PlayerId[],
  hints: {[key: PlayerId]: {
      wordDescribed: 'first' | 'second',
      hint: string,
      isSabotage: boolean,
      excluded: boolean,
      author: PlayerId
    }},
  readyToPresentHints: boolean,
  firstWordGuess: { guess: string, isCorrect: boolean },
  secondWordGuess?: { guess: string, isCorrect: boolean },
  readyToPresentGuesses: boolean,
  guessedCorrectly: boolean | undefined,
}

export type RoomSettings = {
  numberOfWords: 1 | 2,
  numberOfGuessers: 1 | 2,
  moderation: boolean,
  rounds: 5 | 10 | 15,
  timer: 30 | 60 | 90 | 0,
  mixWords: boolean,
  numberOfSaboteurs: 0 | 1 | 2,
}

export type Room = {
  roomCode: string,
  createdAt: Date,
  settings: RoomSettings,
  players: {
    [key: PlayerId]: Player
  },
  currentRound: Round
}
