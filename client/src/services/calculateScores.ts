import {CurrentRoom} from "./database";

export default function (room: CurrentRoom) {
  const round = room.currentRound;

  if (round.firstWordGuess.isCorrect) {
    round.guessers.forEach(playerId => {
      room.players[playerId].score += 1;
    });
    round.firstWordHinters.forEach((playerId) => {
      if (!round.hints[playerId].excluded) {
        room.players[playerId].score += 1;
      }
    });
  } else {
    round.firstWordSaboteurs?.forEach(playerId => {
      room.players[playerId].score += 1;
    });
  }

  if (round.secondWordGuess?.isCorrect) {
    round.guessers.forEach(playerId => {
      room.players[playerId].score += 1;
    });
    round.secondWordHinters?.forEach(playerId => {
      if (!round.hints[playerId].excluded) {
        room.players[playerId].score += 1;
      }
    });
  } else {
    round.secondWordSaboteurs?.forEach(playerId => {
      room.players[playerId].score += 1;
    });
  }

  console.log(room.players);

  return room.players;
}
