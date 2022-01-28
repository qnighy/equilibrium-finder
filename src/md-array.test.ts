import { MDArray } from "./md-array";

describe("MDArray", () => {
  it("Initializes a multi-dimensional array", () => {
    const a = new MDArray([3, 5, 4], (indices) => indices.join(","));
    expect(a.shape).toEqual([3,5,4]);
    expect(a.get([0,0,0])).toBe("0,0,0");
    expect(a.get([1,2,3])).toBe("1,2,3");
    expect(a.get([2,1,2])).toBe("2,1,2");
  });

  it("Initializes a zero-dimensional array", () => {
    const a = new MDArray([], () => "foo");
    expect(a.shape).toEqual([]);
    expect(a.get([])).toBe("foo");
  });
});
