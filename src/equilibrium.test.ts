import { findNashEquilibria } from "./equilibrium";
import { MDArray } from "./md-array";

describe("findNashEquilibria", () => {
  it("solves degenerated game", () => {
    const equilibria = findNashEquilibria(
      [
        MDArray.fromNested([
          [0, 0],
        ]),
        MDArray.fromNested([
          [0, 0],
        ]),
      ]
    );
    // TODO: duplicate solutions
    expect(equilibria).toEqual([
      [[1], [1, 0]],
      [[1], [0, 1]],
      [[1], [0.99999999999999, 1e-14]],
    ]);
  });
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
        [0.4, 0.19999999999999998, 0.39999999999999997],
        [0.4, 0.19999999999999998, 0.39999999999999997],
      ],
    ]);
  });
  it("solves modified rock-paper-scissors with zero-payoff strategy", () => {
    const equilibria = findNashEquilibria(
      [
        MDArray.fromNested([
          [0, -1, 1],
          [1, 0, -1],
          [-1, 1, 0],
          [0, 0, 0],
        ]),
        MDArray.fromNested([
          [0, 1, -1],
          [-1, 0, 1],
          [1, -1, 0],
          [0, 0, 0],
        ]),
      ]
    );
    // TODO: duplicate solutions
    expect(equilibria).toEqual([
      [
        [0.33333333333333337, 0.3333333333333333, 0.3333333333333333, 0],
        [0.33333333333333326, 0.3333333333333324, 0.33333333333333426],
      ],
      [
        [0, 0, 0, 1],
        [0.33333333333333337, 0.3333333333333333, 0.3333333333333333],
      ],
      [
        [3.3306690738754696e-15, 0, 0, 0.9999999999999967],
        [0.33333333333333337, 0.3333333333333306, 0.33333333333333603],
      ],
      [
        [0, 1.6653345369377348e-15, 0, 0.9999999999999983],
        [0.33333333333333615, 0.3333333333333333, 0.3333333333333306],
      ],
      [
        [4.107825191113079e-15, 2.3186548771806938e-15, 0, 0.9999999999999936],
        [0.3333333333333367, 0.33333333333333026, 0.33333333333333304],
      ],
      [
        [0, 0, 1.6653345369377348e-15, 0.9999999999999983],
        [0.3333333333333306, 0.33333333333333603, 0.3333333333333333],
      ],
      [
        [4.107825191113079e-15, 0, 2.3186548771806938e-15, 0.9999999999999936],
        [0.33333333333333004, 0.3333333333333336, 0.33333333333333637],
      ],
      [
        [0, 5.10702591327572e-15, 5.0247582837255324e-15, 0.9999999999999899],
        [0.33333333333333304, 0.33333333333333665, 0.3333333333333303],
      ],
    ]);
  });
});
