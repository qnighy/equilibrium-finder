export class MDArray<T> implements MDReadonlyArray<T> {
  shape: readonly number[];
  _storage: T[];
  constructor(shape: readonly number[], init: ((indices: number[]) => T) | T[]) {
    this.shape = Object.freeze([...shape]);
    if (Array.isArray(init)) {
      this._storage = init;
      return;
    } else if (typeof init === "function") {
      this._storage = new Array(shape.reduce((a, b) => a * b, 1));
      const self = this;
      (function recurse(indices: number[]) {
        if (indices.length >= self.shape.length) {
          self._storage[self._storageIndex(indices)] = init(indices);
        } else {
          const len = self.shape[indices.length];
          for (let i = 0; i < len; i++) {
            recurse([...indices, i]);
          }
        }
      })([]);
    } else {
      throw new TypeError("init must be an array or a function");
    }
  }

  public get(indices: readonly number[]): T {
    return this._storage[this._storageIndex(indices)];
  }

  public set(indices: readonly number[], value: T): void {
    this._storage[this._storageIndex(indices)] = value;
  }

  public update(indices: readonly number[], updater: (value: T) => T): void {
    const index = this._storageIndex(indices);
    this._storage[index] = updater(this._storage[index]);
  }

  public clone(): MDArray<T> {
    return new MDArray(this.shape, this._storage.concat());
  }

  public map<U>(mapper: (value: T, indices: number[], array: MDArray<T>) => U): MDArray<U> {
    return new MDArray(this.shape, (indices) => mapper(this.get(indices), indices, this));
  }

  public mapSimple<U>(mapper: (value: T) => U): MDArray<U> {
    return new MDArray(this.shape, this._storage.map((value) => mapper(value)));
  }

  public everySimple(predicate: (value: T) => boolean): boolean {
    return this._storage.every((value) => predicate(value));
  }

  public toNested(): NestedArray<T> {
    const self = this;
    return recurse([]);

    function recurse(indices: number[]): NestedArray<T> {
      if (indices.length >= self.shape.length) {
        return self.get(indices);
      } else {
        const len = self.shape[indices.length];
        const ret: NestedArray<T>[] = new Array(len);
        for (let i = 0; i < len; i++) {
          ret[i] = recurse([...indices, i]);
        }
        return ret;
      }
    }
  }

  public static fromNested<T>(source: NestedReadonlyArray<T>, shape: readonly number[] = inferShape(source)): MDArray<T> {
    validateShape(source, shape);
    return new MDArray<T>(shape, (indices) => {
      let current = source;
      for (const index of indices) {
        current = (current as NestedReadonlyArray<T>[])[index];
      }
      return current as T;
    });
  }

  private _storageIndex(indices: readonly number[]): number {
    let index = 0;
    for (let i = 0; i < this.shape.length; i++) {
      index = index * this.shape[i] + indices[i];
    }
    return index;
  }
}

export interface MDReadonlyArray<T> {
  shape: readonly number[];
  get(indices: readonly number[]): T;
  clone(): MDArray<T>;
  map<U>(mapper: (value: T, indices: number[], array: MDArray<T>) => U): MDArray<U>;
  mapSimple<U>(mapper: (value: T) => U): MDArray<U>;
  toNested(): NestedArray<T>;
}

export type NestedArray<T> = T | NestedArray<T>[];
export type NestedReadonlyArray<T> = T | readonly NestedReadonlyArray<T>[];

function inferShape<T>(source: NestedReadonlyArray<T>): number[] {
  let current = source;
  const shape: number[] = [];
  while (Array.isArray(current)) {
    if (current.length === 0) throw new Error("Cannot infer shape from an empty array");
    shape.push(current.length);
    current = current[0];
  }
  return shape;
}

function validateShape<T>(source: NestedReadonlyArray<T>, shape: readonly number[]) {
  recurse(source, 0);

  function recurse(current: NestedReadonlyArray<T>, i: number) {
    if (i >= shape.length) {
      if (Array.isArray(current)) throw new Error("Dimension error: array nesting too deep");
    } else {
      if (!Array.isArray(current)) throw new Error("Dimension error: array nesting too shallow");
      if (current.length !== shape[i]) throw new Error("Dimension error: wrong length");
      for (let j = 0; j < current.length; j++) {
        recurse(current[j], i + 1);
      }
    }
  }
}
