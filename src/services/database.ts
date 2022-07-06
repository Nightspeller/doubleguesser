import {initializeApp} from "firebase/app";
import {getAnalytics} from "firebase/analytics";
import {getDatabase, ref, child, set, get, update, push, onValue, DatabaseReference} from "firebase/database";
import {prepareRound} from "./prepareRound";

const firebaseConfig = {
  apiKey: "AIzaSyDkle9_usrpxligxBivJg5ToH8AeZo85DE",
  authDomain: "doubleguesser-82ec6.firebaseapp.com",
  databaseURL: "https://doubleguesser-82ec6-default-rtdb.firebaseio.com",
  projectId: "doubleguesser-82ec6",
  storageBucket: "doubleguesser-82ec6.appspot.com",
  messagingSenderId: "1098096993241",
  appId: "1:1098096993241:web:cf854da96cabe1b6a66fc8",
  measurementId: "G-1FJR2HT47P"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const database = getDatabase();
let roomRef: DatabaseReference;

export let currentRoom: CurrentRoom;

export const db = {
  createRoom: async (setRoom: Function) => {
    const roomCode = Math.random().toString(36).slice(2, 7).toUpperCase();

    roomRef = ref(database, 'rooms/' + roomCode);
    onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        data.roomCode = snapshot.key;
        currentRoom = data;
        setRoom(currentRoom);
      } else {
        console.log("No data available");
      }
    })
    await set(roomRef, {...defaultRoom, roomCode: roomCode, players: {
        'A': {
          "connected": true,
          "currentRole": "hinter",
          "id": "A",
          "nickname": "A",
          "score": 0
        },
        'B': {
          "connected": true,
          "currentRole": "hinter",
          "id": "B",
          "nickname": "B",
          "score": 0
        },
        'C': {
          "connected": true,
          "currentRole": "hinter",
          "id": "C",
          "nickname": "C",
          "score": 0
        },
        /*'D': {
          "connected": true,
          "currentRole": "hinter",
          "id": "D",
          "nickname": "D",
          "score": 0
        },
        'E': {
          "connected": true,
          "currentRole": "hinter",
          "id": "E",
          "nickname": "E",
          "score": 0
        },
        'F': {
          "connected": true,
          "currentRole": "hinter",
          "id": "F",
          "nickname": "F",
          "score": 0
        },
        'G': {
          "connected": true,
          "currentRole": "hinter",
          "id": "G",
          "nickname": "G",
          "score": 0
        },
        'H': {
          "connected": true,
          "currentRole": "hinter",
          "id": "H",
          "nickname": "H",
          "score": 0
        },
        'I': {
          "connected": true,
          "currentRole": "hinter",
          "id": "I",
          "nickname": "I",
          "score": 0
        }*/

      },     "currentRound": {
        "firstWord": "phone",
        "firstWordHinters": [
          "A",
          "B",
          /*"C",
          "D",
          "E",
          "G",
          "H",
          "I"*/
        ],
        "firstWordSaboteurs": [
          "C"
        ],
        "guessers": [
          "74VL0"
        ]
      }});
    return currentRoom;
  },

  getCurrentRoom: () => {
    return currentRoom;
  },

  getExistingRoomToJoinByCode: async (roomCode: string, setRoom: Function) => {
    roomRef = ref(database, 'rooms/' + roomCode);
    onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        data.roomCode = snapshot.key;
        currentRoom = data;
        setRoom(currentRoom);
      } else {
        console.log("No data available");
      }
    });
    const snapshot = await get(roomRef);
    return snapshot.val();
  },

  addPlayerToRoom: async (currentPlayer: any) => {
    if (!roomRef) {
      throw "For some reason roomRef is not defined"
    }
    if (currentRoom.players?.[currentPlayer.id] === undefined) {
      return set(child(roomRef, `players/${currentPlayer.id}`), currentPlayer);
    } else {
      console.log('Current player is already in the room');
      return undefined;
    }
  },

  prepareNewRound: async () => {
    // TODO: remove hardcoding - silly db does not have count operation :-(
    const randomWordIndex = Math.floor(Math.random() * 5);
    let wordsDb;
    if (currentRoom.settings.numberOfWords === 1) {
      wordsDb = ref(database, 'singleWords/' + randomWordIndex);
    } else {
      wordsDb = ref(database, 'doubleWords/' + randomWordIndex);
    }
    const words = await get(wordsDb).then((snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());
        return snapshot.val();
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });
    const newRound = prepareRound(currentRoom, words);
    return set(child(roomRef, `currentRound`), newRound);
  },

  submitHint(hint: string, playerId?: string) {
    const currentPlayerId = playerId ?? localStorage.getItem('playerId')!;
    let currentPlayerRole ='';
    if (currentRoom.currentRound.firstWordSaboteurs?.includes(currentPlayerId)) currentPlayerRole = 'firstWordSaboteur';
    if (currentRoom.currentRound.secondWordSaboteurs?.includes(currentPlayerId)) currentPlayerRole = 'secondWordSaboteur';
    if (currentRoom.currentRound.firstWordHinters.includes(currentPlayerId)) currentPlayerRole = 'firstWordHinter';
    if (currentRoom.currentRound.secondWordHinters?.includes(currentPlayerId)) currentPlayerRole = 'secondWordHinter';

    const dbHint = {
      wordDescribed: currentPlayerRole.includes('first') ? 'first' : 'second',
      hint: hint,
      isSabotage:  currentPlayerRole.includes('Saboteur'),
      excluded: false,
      author: currentPlayerId
    }
    return set(child(roomRef, `currentRound/hints/${currentPlayerId}`), dbHint);
  },

  excludeHint(playerId: PlayerId) {
    return set(child(roomRef, `currentRound/hints/${playerId}/excluded`), true);
  }
}

export type PlayerId = string;

export type Player = {
  id: PlayerId,
  nickname: string,
  currentRole: 'guesser' | 'saboteur' | 'hinter',
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
  hints: {
    wordDescribed: 'first' | 'second',
    hint: string,
    isSabotage: boolean,
    excluded: boolean,
    author: PlayerId
  }[],
  firstWordGuess: string,
  secondWordGuess: string,
  guessedCorrectly: boolean | undefined,
}

export type CurrentRoom = {
  roomCode: string,
  createdAt: Date,
  settings: {
    numberOfWords: 1 | 2,
    numberOfGuessers: 1 | 2,
    moderation: boolean,
    rounds: 5 | 10 | 15,
    timer: 30 | 60 | 90 | null,
    mixWords: boolean,
    numberOfSaboteurs: 0 | 1 | 2,
  },
  players: {
    [key: string]: Player
  },
  currentRound: Round
}

const defaultRoom = {
  roomCode: '',
  createdAt: new Date(),
  settings: {
    numberOfWords: 1,
    numberOfGuessers: 1,
    moderation: true,
    rounds: 10,
    timer: 60,
    mixWords: false,
    numberOfSaboteurs: 1,
  },
  players: {},
}
