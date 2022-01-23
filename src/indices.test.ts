import { multidimensionalIndices } from "./indices";

describe("multidimensionalIndices", () => {
  it("loops over multidimensional indices", () => {
    const iter = multidimensionalIndices([3,2,3]);
    expect(Array.from(iter)).toEqual(
      [
        [0, 0, 0],
        [0, 0, 1],
        [0, 0, 2],
        [0, 1, 0],
        [0, 1, 1],
        [0, 1, 2],
        [1, 0, 0],
        [1, 0, 1],
        [1, 0, 2],
        [1, 1, 0],
        [1, 1, 1],
        [1, 1, 2],
        [2, 0, 0],
        [2, 0, 1],
        [2, 0, 2],
        [2, 1, 0],
        [2, 1, 1],
        [2, 1, 2],
      ]
    );
  });
});
