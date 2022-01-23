import { findNashEquilibria } from "./equilibrium";

describe("findNashEquilibria", () => {
  it("solves simplest nontrivial equilibrium", () => {
    const data: Record<string, number> = {
      aa: 1,
      ab: -1,
      ba: -1,
      bb: 1,
    };
    const equilibria = findNashEquilibria(
      [
        ["a", "b"],
        ["a", "b"],
      ],
      [
        (_strategy, [s1, s2]) => data[s1 + s2],
        (_strategy, [s1, s2]) => -data[s1 + s2],
      ]
    );
    expect(equilibria).toEqual([[[0.5, 0.5], [0.5, 0.5]]]);
  });
  it("finds weighted equilibrium", () => {
    const data: Record<string, number> = {
      aa: 1,
      ab: 0,
      ba: 0,
      bb: 3,
    };
    const equilibria = findNashEquilibria(
      [
        ["a", "b"],
        ["a", "b"],
      ],
      [
        (_strategy, [s1, s2]) => data[s1 + s2],
        (_strategy, [s1, s2]) => -data[s1 + s2],
      ]
    );
    expect(equilibria).toEqual([[[0.75, 0.25], [0.75, 0.25]]]);
  });
  it("finds multiple equilibria", () => {
    const data: Record<string, number> = {
      aa: 1,
      ab: -1,
      ba: -1,
      bb: 1,
    };
    const equilibria = findNashEquilibria(
      [
        ["a", "b"],
        ["a", "b"],
      ],
      [
        (_strategy, [s1, s2]) => data[s1 + s2],
        (_strategy, [s1, s2]) => data[s1 + s2],
      ]
    );
    expect(equilibria).toEqual([
      [[1, 0], [1, 0]],
      [[0, 1], [0, 1]],
      [[0.5, 0.5], [0.5, 0.5]],
    ]);
  });
  xit("solves rock-paper-scissors", () => {
    findNashEquilibria(
      [
        ["rock", "paper", "scissors"],
        ["rock", "paper", "scissors"],
      ],
      [
        (_strategy, [s1, s2]) =>
          s1 === "rock" && s2 === "scissors" || s1 === "scissors" && s2 === "paper" || s1 === "paper" && s2 === "rock" ? 1 :
          s1 === s2 ? 0 : -1,
        (_strategy, [s1, s2]) =>
          s1 === "rock" && s2 === "scissors" || s1 === "scissors" && s2 === "paper" || s1 === "paper" && s2 === "rock" ? -1 :
          s1 === s2 ? 0 : 1,
      ]
    );
  });
});
