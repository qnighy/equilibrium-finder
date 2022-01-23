import React, { useReducer } from 'react';
import './App.css';

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { numPlayers, playerNames } = state;
  return (
    <div className="App">
      <h1>Nash equilibrium finder</h1>
      {
        playerNames.map((playerName, playerId) => (
          <div key={playerId}>
            <h2>Player <input value={playerName} onChange={(e) => dispatch({ type: "setPlayerName", playerId, playerName: e.currentTarget.value })} /></h2>
          </div>
        ))
      }
      <button onClick={() => dispatch({ type: "addPlayer" })}>➕ Add a player</button>
      <button onClick={() => dispatch({ type: "removePlayer" })}>➖ Remove the last player</button>
    </div>
  );
}

type State = {
  numPlayers: number;
  playerNames: string[];
  allPlayerStrategies: string[][];
};

const initialState: State = {
  numPlayers: 2,
  playerNames: ["1", "2"],
  allPlayerStrategies: [["rock", "paper", "scissors"], ["rock", "paper", "scissors"]],
};

type Action =
  | { type: "addPlayer" }
  | { type: "removePlayer" }
  | { type: "setPlayerName", playerId: number, playerName: string };

function reducer(prevState: State, action: Action): State {
  switch (action.type) {
    case "addPlayer":
      return {
        ...prevState,
        numPlayers: prevState.numPlayers + 1,
        playerNames: [...prevState.playerNames, `${prevState.numPlayers + 1}`],
        allPlayerStrategies: [...prevState.allPlayerStrategies, ["rock", "paper", "scissors"]],
      };
    case "removePlayer": {
      const numPlayers = prevState.numPlayers - 1;
      if (numPlayers <= 1) return prevState;
      return {
        ...prevState,
        numPlayers,
        playerNames: prevState.playerNames.slice(0, numPlayers),
        allPlayerStrategies: prevState.allPlayerStrategies.slice(0, numPlayers),
      };
    }
    case "setPlayerName": {
      const playerNames = [...prevState.playerNames];
      playerNames[action.playerId] = action.playerName;
      return {
        ...prevState,
        playerNames,
      };
    }
  }
  return prevState;
}

export default App;
