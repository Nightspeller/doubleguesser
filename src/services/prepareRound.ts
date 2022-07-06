import {CurrentRoom, Round} from "./database";

export const prepareRound = (room: CurrentRoom, randomWord: string): Round => {
  const protoRound: Round = {} as Round;
  setWords(protoRound, room.settings.numberOfWords, randomWord);
  setGuessers(protoRound, room);
  setSaboteurs(protoRound, room);
  setHinters(protoRound, room);

  return protoRound;
}

function setWords(protoRound: Partial<Round>, numberOfWords: number, randomWord: string) {
  if (numberOfWords === 1) {
    protoRound['firstWord'] = randomWord;
  } else {
    protoRound['firstWord'] = randomWord.split(' ')[0];
    protoRound['secondWord'] = randomWord.split(' ')[1];
  }
}

function setGuessers(protoRound: Partial<Round>, room: CurrentRoom) {
  const playerIds = Object.values(room.players).map(player => player.id);
  const numberOfPlayers = playerIds.length;
  const numberOfGuessers = room.settings.numberOfGuessers;
  const lastGuesser = room.currentRound?.guessers.at(-1) ?? playerIds.at(-1)!; //in case this is the first round
  const lastGuesserIndex = playerIds.indexOf(lastGuesser);
  if (lastGuesserIndex + numberOfGuessers <= numberOfPlayers - 1) {
    const newLastGuesserIndex = lastGuesserIndex + numberOfGuessers;
    protoRound.guessers = playerIds.slice(lastGuesserIndex + 1, newLastGuesserIndex + 1);
  } else {
    const numberOfGuessersLeftFromThisIteration = (numberOfPlayers - 1) - lastGuesserIndex;
    const guessersLeftFromThisIteration = playerIds.slice(lastGuesserIndex + 1, numberOfPlayers);
    const numberOfGuessersFromNewIteration = numberOfGuessers - numberOfGuessersLeftFromThisIteration;
    const newLastGuesserIndex = numberOfGuessersFromNewIteration - 1;
    const guessersFromNewIteration = playerIds.slice(0, newLastGuesserIndex + 1);
    protoRound.guessers = [...guessersLeftFromThisIteration, ...guessersFromNewIteration];
  }
}

function setSaboteurs(protoRound: Partial<Round>, room: CurrentRoom) {
  if (room.settings.numberOfSaboteurs !== 0) {
    const playerIds = Object.values(room.players).map(player => player.id);
    const nonGuessers = playerIds.filter(playerId => !protoRound.guessers?.includes(playerId));
    const saboteurs = nonGuessers.sort(() => Math.random() - Math.random()).slice(0, room.settings.numberOfSaboteurs);
    const numberOfWords = room.settings.numberOfWords;

    if (numberOfWords === 1) {
      protoRound.firstWordSaboteurs = saboteurs;
    } else {
      const numberOfSaboteursForFirstWord = Math.floor(saboteurs.length / 2) + (saboteurs.length % 2);
      protoRound.firstWordSaboteurs = saboteurs.slice(0, numberOfSaboteursForFirstWord);
      protoRound.secondWordSaboteurs = saboteurs.slice(numberOfSaboteursForFirstWord);
    }
  }
}

function setHinters(protoRound: Partial<Round>, room: CurrentRoom) {
  const allPlayersIds = Object.values(room.players).map(player => player.id);
  const numberOfWords = room.settings.numberOfWords;
  if (numberOfWords === 1) {
    const hinters = allPlayersIds.filter(playerId => {
      return !protoRound.guessers?.includes(playerId) && !protoRound.firstWordSaboteurs?.includes(playerId);
    })
    protoRound.firstWordHinters = hinters;
  } else {
    const hinters = allPlayersIds.filter(playerId => {
      return !protoRound.guessers?.includes(playerId) &&
        !protoRound.firstWordSaboteurs?.includes(playerId) &&
        !protoRound.secondWordSaboteurs?.includes(playerId);
    })
    const numberOfHintersForFirstWord = Math.floor(hinters.length / 2) + (hinters.length % 2);
    protoRound.firstWordHinters = hinters.slice(0, numberOfHintersForFirstWord);
    protoRound.secondWordHinters = hinters.slice(numberOfHintersForFirstWord);
  }
}
