import React, { useReducer } from 'react';
import './App.css';

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { numPlayers, playerNames, allPlayerStrategies } = state;
  return (
    <div className="App">
      <h1>Nash equilibrium finder</h1>
      {
        playerNames.map((playerName, playerId) => {
          const strategies = allPlayerStrategies[playerId];
          return (
            <div key={playerId}>
              <h2>Player <input value={playerName} onChange={(e) => dispatch({ type: "setPlayerName", playerId, playerName: e.currentTarget.value })} /></h2>
              <ul>
                {
                  strategies.map((strategyName, strategyId) => (
                    <li>Strategy {strategyId}: <input value={strategyName} onChange={(e) => dispatch({ type: "setStrategyName", playerId, strategyId, strategyName: e.currentTarget.value })} /></li>
                  ))
                }
                <li>
                  <button onClick={() => dispatch({ type: "addStrategy", playerId })}>➕ Add a strategy</button>
                  <button onClick={() => dispatch({ type: "removeStrategy", playerId })} disabled={strategies.length <= 1}>➖ Remove the last strategy</button>
                </li>
              </ul>
            </div>
          );
        })
      }
      <button onClick={() => dispatch({ type: "addPlayer" })}>➕ Add a player</button>
      <button onClick={() => dispatch({ type: "removePlayer" })} disabled={numPlayers <= 2}>➖ Remove the last player</button>
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
  playerNames: ["0", "1"],
  allPlayerStrategies: [["rock", "paper", "scissors"], ["rock", "paper", "scissors"]],
};

type Action =
  | { type: "addPlayer" }
  | { type: "removePlayer" }
  | { type: "addStrategy", playerId: number }
  | { type: "removeStrategy", playerId: number }
  | { type: "setPlayerName", playerId: number, playerName: string }
  | { type: "setStrategyName", playerId: number, strategyId: number, strategyName: string };

function reducer(prevState: State, action: Action): State {
  switch (action.type) {
    case "addPlayer":
      return {
        ...prevState,
        numPlayers: prevState.numPlayers + 1,
        playerNames: [...prevState.playerNames, `${prevState.numPlayers}`],
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
    case "addStrategy": {
      const allPlayerStrategies = [...prevState.allPlayerStrategies];
      allPlayerStrategies[action.playerId] = [...allPlayerStrategies[action.playerId], `strategy ${allPlayerStrategies[action.playerId].length}`];
      return {
        ...prevState,
        allPlayerStrategies,
      };
    }
    case "removeStrategy": {
      const allPlayerStrategies = [...prevState.allPlayerStrategies];
      if (allPlayerStrategies[action.playerId].length <= 1) return prevState;
      allPlayerStrategies[action.playerId] = allPlayerStrategies[action.playerId].slice(0, allPlayerStrategies[action.playerId].length - 1);
      return {
        ...prevState,
        allPlayerStrategies,
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
    case "setStrategyName": {
      const allPlayerStrategies = [...prevState.allPlayerStrategies];
      allPlayerStrategies[action.playerId] = allPlayerStrategies[action.playerId].concat();
      allPlayerStrategies[action.playerId][action.strategyId] = action.strategyName;
      return {
        ...prevState,
        allPlayerStrategies,
      };
    }
  }
  return prevState;
}

export default App;
