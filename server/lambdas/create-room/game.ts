//TODO stronger typing
export const blankGame = {
    currentRound: 0,
    firstWord: '',
    firstWordHinters: [] as any[],
    firstWordSaboteurs: [] as any[],
    guessers: [] as any[],
    hints: [] as any[],
    readyToPresentHints: false,
    players: {},
    settings: {
        mixWords: false,
        moderation: true,
        numberOfGuessers: 1,
        numberOfSaboteurs: 1,
        numberOfWords: 1,
        rounds: 10,
        timer: 60,
    },
};
