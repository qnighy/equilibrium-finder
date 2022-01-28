import { findNashEquilibria } from "./equilibrium";
import { MDArray } from "./md-array";

describe("findNashEquilibria", () => {
  it("solves simplest nontrivial equilibrium", () => {
    const equilibria = findNashEquilibria(
      [
        MDArray.fromNested([
          [1, -1],
          [-1, 1],
        ]),
        MDArray.fromNested([
          [-1, 1],
          [1, -1],
        ]),
      ]
    );
    expect(equilibria).toEqual([[[0.5, 0.5], [0.5, 0.5]]]);
  });
  it("finds weighted equilibrium", () => {
    const equilibria = findNashEquilibria(
      [
        MDArray.fromNested([
          [1, 0],
          [0, 3],
        ]),
        MDArray.fromNested([
          [-1, -0],
          [-0, -3],
        ]),
      ]
    );
    expect(equilibria).toEqual([[[0.75, 0.25], [0.75, 0.25]]]);
  });
  it("finds multiple equilibria", () => {
    const equilibria = findNashEquilibria(
      [
        MDArray.fromNested([
          [1, -1],
          [-1, 1],
        ]),
        MDArray.fromNested([
          [1, -1],
          [-1, 1],
        ]),
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
        MDArray.fromNested([
          [0, -1, 1],
          [1, 0, -1],
          [-1, 1, 0],
        ]),
        MDArray.fromNested([
          [0, 1, -1],
          [-1, 0, 1],
          [1, -1, 0],
        ]),
      ]
    );
    expect(equilibria).toEqual([
      [
        [0.33333333333333337, 0.3333333333333333, 0.3333333333333333],
        [0.33333333333333337, 0.3333333333333333, 0.3333333333333333],
      ],
    ]);
  });
  it("solves weighted rock-paper-scissors", () => {
    const equilibria = findNashEquilibria(
      [
        MDArray.fromNested([
          [0, -6, 3],
          [6, 0, -6],
          [-3, 6, 0],
        ]),
        MDArray.fromNested([
          [0, 6, -3],
          [-6, 0, 6],
          [3, -6, 0],
        ]),
      ]
    );
    expect(equilibria).toEqual([
      [
        [0.4, 0.2, 0.39999999999999997],
        [0.4, 0.2, 0.39999999999999997],
      ],
    ]);
  });
});
