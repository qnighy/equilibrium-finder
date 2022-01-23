export function multidimensionalIndices(lengths: readonly number[]): Iterable<number[]> {
  return {
    [Symbol.iterator]() {
      return new MultidimensionalIndexIterator(lengths);
    }
  }
}

class MultidimensionalIndexIterator implements Iterator<number[]> {
  private _indices: number[];
  private _done = false;
  constructor(private _lengths: readonly number[]) {
    this._indices = _lengths.map(() => 0);
  }

  next(): IteratorResult<number[]> {
    if (this._done) return ({ done: true, value: undefined });
    const value = this._indices.concat();
    let done = true;
    for (let i = this._lengths.length - 1; i >= 0; i--) {
      this._indices[i]++;
      if (this._indices[i] < this._lengths[i]) {
        done = false;
        break;
      }
      this._indices[i] = 0;
    }
    this._done = done;
    return ({ done: false, value });
  }
}
