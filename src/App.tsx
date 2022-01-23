import React, { useReducer } from 'react';
import './App.css';
import { multidimensionalIndices } from './indices';

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { numPlayers, playerNames, allPlayerStrategies, payoffMatrices, tableAxis1, tableAxis2 } = state;
  const dimensionWithoutTableAxes = allPlayerStrategies.map((strategies) => strategies.length);
  dimensionWithoutTableAxes[tableAxis1] = 1;
  dimensionWithoutTableAxes[tableAxis2] = 1;
  const indicesWithoutTableAxes = Array.from(multidimensionalIndices(dimensionWithoutTableAxes));
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
      <h2>Payoffs</h2>
      <ul>
        <li>
          Axis 1:
          {
            playerNames.map((playerName, playerId) => (
              <label key={playerId}>
                <input type="radio" checked={tableAxis1 === playerId} onClick={() => dispatch({ type: "selectTableAxis", axis: 1, playerId })} />
                Player {playerName}
              </label>
            ))
          }
        </li>
        <li>
          Axis 2:
          {
            playerNames.map((playerName, playerId) => (
              <label key={playerId}>
                <input type="radio" checked={tableAxis2 === playerId} onClick={() => dispatch({ type: "selectTableAxis", axis: 2, playerId })} />
                Player {playerName}
              </label>
            ))
          }
        </li>
      </ul>
      {
        playerNames.map((playerName, playerId) => (
          <div key={playerId}>
            <h3>Payoff for Player {playerName}</h3>
            {
              indicesWithoutTableAxes.map((strategyIds) => (
                <div key={strategyIds.join(",")}>
                  {
                    numPlayers > 2 &&
                      <h4>{
                        strategyIds.map((strategyId, playerId) =>
                          playerId === tableAxis1 || playerId === tableAxis2 ? null :
                          `Player ${playerNames[playerId]} => ${allPlayerStrategies[playerId][strategyId]}`
                        ).filter((elem) => elem !== null).join(", ")
                      }</h4>
                  }
                  <table>
                    <thead>
                      <tr>
                        <th>Player {playerNames[tableAxis1]} ＼ Player {playerNames[tableAxis2]}</th>
                        {
                          allPlayerStrategies[tableAxis2].map((axis2StrategyName) => (
                            <th>{axis2StrategyName}</th>
                          ))
                        }
                      </tr>
                    </thead>
                    <tbody>
                      {
                        allPlayerStrategies[tableAxis1].map((axis1StrategyName, axis1StrategyId) => (
                          <tr>
                            <th>{axis1StrategyName}</th>
                            {
                              allPlayerStrategies[tableAxis2].map((_axis2StrategyName, axis2StrategyId) => {
                                const indices = [...strategyIds];
                                indices[tableAxis1] = axis1StrategyId;
                                indices[tableAxis2] = axis2StrategyId;
                                return (
                                  <td>
                                    <input
                                      value={getMD(payoffMatrices[playerId], indices)}
                                      onChange={(e) => dispatch({ type: "updatePayoff", playerId, indices, payoff: e.currentTarget.value })}
                                      onBlur={(e) => dispatch({ type: "updatePayoff", playerId, indices, payoff: reparseNumber(e.currentTarget.value) })}
                                    />
                                  </td>
                                );
                              })
                            }
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              ))
            }
          </div>
        ))
      }
    </div>
  );
}

type State = {
  numPlayers: number;
  playerNames: string[];
  allPlayerStrategies: string[][];
  payoffMatrices: MDArray<string>[];
  tableAxis1: number;
  tableAxis2: number;
};

const initialState: State = normalizeState({
  numPlayers: 2,
  playerNames: ["0", "1"],
  allPlayerStrategies: [["rock", "paper", "scissors"], ["rock", "paper", "scissors"]],
  payoffMatrices: [
    [["0", "-1", "1"], ["1", "0", "-1"], ["-1", "1", "0"]],
    [["0", "1", "-1"], ["-1", "0", "1"], ["1", "-1", "0"]],
  ],
  tableAxis1: 0,
  tableAxis2: 1,
});

type Action =
  | { type: "addPlayer" }
  | { type: "removePlayer" }
  | { type: "addStrategy", playerId: number }
  | { type: "removeStrategy", playerId: number }
  | { type: "setPlayerName", playerId: number, playerName: string }
  | { type: "setStrategyName", playerId: number, strategyId: number, strategyName: string }
  | { type: "updatePayoff", playerId: number, indices: number[], payoff: string }
  | { type: "selectTableAxis", axis: 1 | 2, playerId: number };

function reducer(prevState: State, action: Action): State {
  switch (action.type) {
    case "addPlayer":
      return normalizeState({
        ...prevState,
        numPlayers: prevState.numPlayers + 1,
      });
    case "removePlayer": {
      return normalizeState({
        ...prevState,
        numPlayers: Math.max(prevState.numPlayers - 1, 2),
      });
    }
    case "addStrategy": {
      const allPlayerStrategies = [...prevState.allPlayerStrategies];
      allPlayerStrategies[action.playerId] = [...allPlayerStrategies[action.playerId], `strategy ${allPlayerStrategies[action.playerId].length}`];
      return normalizeState({
        ...prevState,
        allPlayerStrategies,
      });
    }
    case "removeStrategy": {
      const allPlayerStrategies = [...prevState.allPlayerStrategies];
      if (allPlayerStrategies[action.playerId].length <= 1) return prevState;
      allPlayerStrategies[action.playerId] = allPlayerStrategies[action.playerId].slice(0, allPlayerStrategies[action.playerId].length - 1);
      return normalizeState({
        ...prevState,
        allPlayerStrategies,
      });
    }
    case "setPlayerName": {
      const playerNames = [...prevState.playerNames];
      playerNames[action.playerId] = action.playerName;
      return normalizeState({
        ...prevState,
        playerNames,
      });
    }
    case "setStrategyName": {
      const allPlayerStrategies = [...prevState.allPlayerStrategies];
      allPlayerStrategies[action.playerId] = allPlayerStrategies[action.playerId].concat();
      allPlayerStrategies[action.playerId][action.strategyId] = action.strategyName;
      return normalizeState({
        ...prevState,
        allPlayerStrategies,
      });
    }
    case "updatePayoff": {
      const payoffMatrices = [...prevState.payoffMatrices];
      payoffMatrices[action.playerId] = updateMD(payoffMatrices[action.playerId], action.indices, () => action.payoff);
      return normalizeState({
        ...prevState,
        payoffMatrices,
      });
    }
    case "selectTableAxis": {
      let { tableAxis1, tableAxis2 } = prevState;
      if (action.axis === 1) {
        if (tableAxis2 === action.playerId) {
          [tableAxis1, tableAxis2] = [tableAxis2, tableAxis1];
        } else {
          tableAxis1 = action.playerId;
        }
      } else {
        if (tableAxis1 === action.playerId) {
          [tableAxis1, tableAxis2] = [tableAxis2, tableAxis1];
        } else {
          tableAxis2 = action.playerId;
        }
      }
      return normalizeState({
        ...prevState,
        tableAxis1,
        tableAxis2,
      });
    }
  }
  return prevState;
}

function normalizeState(origState: State): State {
  const numPlayers = Math.max(origState.numPlayers, 2);
  const playerNames = resize(origState.playerNames, numPlayers, (index) => `${index}`);
  const allPlayerStrategies = resize(origState.allPlayerStrategies, numPlayers, () => ["strategy 0"]);
  const dimension = allPlayerStrategies.map((strategies) => strategies.length);
  const payoffMatrices = resize(origState.payoffMatrices, numPlayers, () => [])
    .map((mat) => resizeMD(mat, dimension, () => "0"));
  const tableAxis1 = Math.min(origState.tableAxis1, numPlayers - 1);
  let tableAxis2 = Math.min(origState.tableAxis2, numPlayers - 1);
  if (tableAxis1 === tableAxis2) {
    tableAxis2 = tableAxis1 === 0 ? 1 : 0;
  }
  return { numPlayers, playerNames, allPlayerStrategies, payoffMatrices, tableAxis1, tableAxis2 };
}

function resize<T>(orig: T[], newSize: number, filler: (index: number) => T): T[] {
  if (orig.length === newSize) {
    return orig;
  } else if (orig.length > newSize) {
    return orig.slice(0, newSize);
  } else {
    const ret = [...orig];
    while (ret.length < newSize) {
      ret.push(filler(ret.length));
    }
    return ret;
  }
}

type MDArray<T> = T | MDArray<T>[];

function getMD<T>(array: MDArray<T>, indices: number[]): T {
  let current = array;
  for (const index of indices) {
    if (!Array.isArray(current)) throw new Error("Dimension error");
    current = current[index];
  }
  if (Array.isArray(current)) throw new Error("Dimension error");
  return current;
}

function updateMD<T>(array: MDArray<T>, indices: number[], updater: (prev: T) => T): MDArray<T> {
  return recurse(array, 0);

  function recurse(array: MDArray<T>, i: number): MDArray<T> {
    if (i >= indices.length) {
      if (Array.isArray(array)) {
        return array;
      } else {
        return updater(array);
      }
    } else {
      if (Array.isArray(array)) {
        const ret = [...array];
        ret[indices[i]] = recurse(ret[indices[i]], i + 1);
        return ret;
      } else {
        return array;
      }
    }
  }
}

function resizeMD<T>(orig: MDArray<T>, newDimension: number[], filler: (indices: number[]) => T): MDArray<T> {
  return recurse([], orig);

  function recurse(indices: number[], orig: MDArray<T>): MDArray<T> {
    if (indices.length >= newDimension.length) {
      if (Array.isArray(orig)) {
        return orig.length === 0 ? filler(indices) : recurse(indices, orig[0]);
      } else {
        return orig;
      }
    } else {
      const newSize = newDimension[indices.length];
      if (Array.isArray(orig)) {
        if (orig.length >= newSize) {
          return orig.slice(0, newSize).map((elem, index) => recurse([...indices, index], elem));
        } else {
          return new Array(newSize).fill(null).map((_elem, index) => recurse([...indices, index], index < orig.length ? orig[index] : []));
        }
      } else {
        return new Array(newSize).fill(null).map((_elem, index) => recurse([...indices, index], orig));
      }
    }
  }
}

function reparseNumber(s: string): string {
  const n = Number(s);
  if (isNaN(n)) return "0";
  return n.toString();
}

export default App;
