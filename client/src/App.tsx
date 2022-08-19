import React, { useEffect } from 'react';
import './App.css';
import {PlayerProvider} from "./contexts/playerContext";
import Welcome from "./pages/welcome/welcome";
import {RoomProvider} from "./contexts/roomContext";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Lobby from "./pages/lobby/lobby";
import Round from "./pages/round/round";
import leaveRoom from './actions/leaveRoom';
import { getWebSocket } from './services/websocket';

window.onbeforeunload = () => {
	leaveRoom();
}

getWebSocket();
function App() {
  return (
	<PlayerProvider>
    	<RoomProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Welcome/>}/>
            <Route path="/:roomCode" element={<Welcome/>}/>
            <Route path="/lobby/:roomCode" element={<Lobby/>}/>
            <Route path="/round" element={<Round/>}/>
            {/*<Route path=":roomCode" element={<Lobby/>}>
              <Route index element={<Home />} />
              <Route path="teams" element={<Teams />}>
                <Route path=":teamId" element={<Team />} />
                <Route path="new" element={<NewTeamForm />} />
                <Route index element={<LeagueStandings />} />
              </Route>
            </Route>*/}
          </Routes>
        </BrowserRouter>
		</RoomProvider>
    </PlayerProvider>

  );
}

export default App;
