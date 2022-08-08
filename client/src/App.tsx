import React from 'react';
import './App.css';
import {PlayerProvider} from "./contexts/playerContext";
import Welcome from "./pages/welcome/welcome";
import {RoomProvider} from "./contexts/roomContext";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Lobby from "./pages/lobby/lobby";
import Round from "./pages/round/round";

function App() {
  return (
    <RoomProvider>
      <PlayerProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Welcome/>}/>
            <Route path="/:roomCode" element={<Welcome/>}/>
            <Route path="/lobby" element={<Lobby/>}/>
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
      </PlayerProvider>
    </RoomProvider>

  );
}

export default App;
