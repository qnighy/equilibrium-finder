export abstract class Expr {
  abstract call(params: number[]): number;
  abstract callDiff(params: number[]): [number, number[]];
  abstract asExprString(): string;
}

export class ConstExpr extends Expr {
  constructor(public readonly value: number) {
    super();
  }
  call(_params: number[]): number {
    return this.value;
  }
  callDiff(params: number[]): [number, number[]] {
    return [this.value, params.map(() => 0)];
  }
  asExprString(): string {
    return `${this.value}`;
  }
}

export class VariableExpr extends Expr {
  constructor(public readonly index: number) {
    super();
  }
  call(params: number[]): number {
    return params[this.index];
  }
  callDiff(params: number[]): [number, number[]] {
    return [params[this.index], params.map((param, i) => this.index === i ? 1 : 0)];
  }
  asExprString(): string {
    return `x${this.index}`;
  }
}

export class LinearExpr extends Expr {
  constructor(public readonly terms: readonly (readonly [Expr, number])[]) {
    super();
  }
  call(params: number[]): number {
    return this.terms.map(([expr, factor]) => expr.call(params) * factor).reduce((a, b) => a + b, 0);
  }
  callDiff(params: number[]): [number, number[]] {
    let sum = 0;
    const diffSum = params.map(() => 0);
    for (const [expr, factor] of this.terms) {
      const [subValue, subDiff] = expr.callDiff(params);
      sum += subValue * factor;
      for (let i = 0; i < params.length; i++) {
        diffSum[i] += subDiff[i] * factor;
      }
    }
    return [sum, diffSum];
  }
  asExprString() {
    if (this.terms.length === 0) return "0";
    return `(${this.terms.map(([expr, factor]) => `${factor} * ${expr.asExprString()}`).join(" + ")})`;
  }
}

export class ProdExpr extends Expr {
  constructor(public readonly factors: readonly Expr[]) {
    super();
  }
  call(params: number[]): number {
    return this.factors.map((factor) => factor.call(params)).reduce((a, b) => a * b, 1);
  }
  callDiff(params: number[]): [number, number[]] {
    let prod = 1;
    const diffSum = params.map(() => 0);
    for (const factor of this.factors) {
      const [subValue, subDiff] = factor.callDiff(params);
      for (let i = 0; i < params.length; i++) {
        diffSum[i] = diffSum[i] * subValue + subDiff[i] * prod;
      }
      prod *= subValue;
    }
    return [prod, diffSum];
  }
  asExprString() {
    if (this.factors.length === 0) return "1";
    return `(${this.factors.map((factor) => factor.asExprString()).join(" * ")})`;
  }
}
