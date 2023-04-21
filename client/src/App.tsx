import React from "react";
import "./App.css";
import Welcome from "./pages/welcome/welcome";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Lobby from "./pages/lobby/lobby";
import Round from "./pages/round/round";
import { closeWebSocket, setupWebSocket } from "./services/websocket";


window.onbeforeunload = () => {
  closeWebSocket();
  console.log("WebSocket Closed");
};

console.log("Setting up WebSocket connection");
setupWebSocket().then(() => {
  console.log("WebSocket connection is set up");
});

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/:roomCode" element={<Welcome />} />
        <Route path="/lobby/:roomCode" element={<Lobby />} />
        {/*<Route path="/round" element={<Round />} />*/}
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
  );
}

export default App;
