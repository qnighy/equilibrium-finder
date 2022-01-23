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
        ({ strategies }) => data[strategies.join("")],
        ({ strategies }) => -data[strategies.join("")],
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
        ({ strategies }) => data[strategies.join("")],
        ({ strategies }) => -data[strategies.join("")],
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
        ({ strategies }) => data[strategies.join("")],
        ({ strategies }) => data[strategies.join("")],
      ]
    );
    expect(equilibria).toEqual([
      [[1, 0], [1, 0]],
      [[0, 1], [0, 1]],
      [[0.5, 0.5], [0.5, 0.5]],
    ]);
  });
  it("solves rock-paper-scissors", () => {
    const equilibria = findNashEquilibria(
      [
        ["rock", "paper", "scissors"],
        ["rock", "paper", "scissors"],
      ],
      [
        ({ strategyIds: [s1, s2] }) => (s1 + 4 - s2) % 3 - 1,
        ({ strategyIds: [s1, s2] }) => (s2 + 4 - s1) % 3 - 1,
      ]
    );
    expect(equilibria).toEqual([
      [
        [0.33333333333333337, 0.3333333333333333, 0.3333333333333333],
        [0.33333333333333337, 0.3333333333333333, 0.3333333333333333],
      ],
    ]);
  });
});
