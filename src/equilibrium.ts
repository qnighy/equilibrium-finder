import * as math from "mathjs";
import { multidimensionalIndices } from "./indices";
import { ConstExpr, Expr, LinearExpr, ProdExpr, VariableExpr } from "./poly";
import { MDReadonlyArray } from "./md-array";

export type PayoffFunctionOptions = {
  playerId: number;
  strategy: string;
  strategyId: number;
  strategies: string[];
  strategyIds: number[];
};
export type PayoffFunction = (options: PayoffFunctionOptions) => number;

export function findNashEquilibria(
  payoffMatrices: MDReadonlyArray<number>[]
): number[][][] {
  const numPlayers = payoffMatrices.length;
  if (numPlayers === 0) throw new Error("At least one player is needed");

  const dimensions = payoffMatrices[0].shape;
  if (dimensions.length !== numPlayers) throw new Error("Dimension mismatch");
  for (const m of payoffMatrices) {
    if (m.shape.length !== dimensions.length) throw new Error("Dimension mismatch");
    if (!m.shape.every((x, i) => x === dimensions[i])) throw new Error("Dimension mismatch");
  }

  const strategyBitflags = dimensions.map(() => 0);
  const nashEquilibria: number[][][] = [];
  searchBitflags(0);

  // Try all combinations of pure strategies, except the case where
  // one of the players has no strategy to choose.
  // We call the pure strategies in the combination "picked" strategies and the others "unpicked".
  function searchBitflags(playerId: number) {
    if (playerId >= numPlayers) {
      searchMixed();
      return;
    }
    
    const numStrategies = dimensions[playerId];
    // bitflags === 0 means no choice, skip this case
    for (let bitflags = 1; bitflags < (1 << numStrategies); bitflags++) {
      strategyBitflags[playerId] = bitflags;
      searchBitflags(playerId + 1);
    }
  }

  // Solve constraints for the specific combination of pure strategies.
  // We only search for the mixed strategies that satisfy the following:
  // - in the mixed strategy, all the "picked" pure strategy have positive probabilities.
  // - in the mixed strategy, all the "unpicked" pure strategy have zero probability.
  function searchMixed() {
    // For each player, pick the "base strategy". This is the lowest of all the possible strategies.
    const baseStrategyIds: number[] = dimensions.map(() => 0);
    // For each "picked" strategy other than the base strategy,
    // assign a variable that represents the probability in the mixed strategy.
    const strategyToVarId: (number | null)[][] = dimensions.map((numStrategies) => new Array(numStrategies).fill(null));
    const varIdToStrategy: [number, number][] = [];
    for (let playerId = 0; playerId < numPlayers; playerId++) {
      const numStrategies = dimensions[playerId];
      let baseStrategyId: number | undefined = undefined;
      for (let strategyId = 0; strategyId < numStrategies; strategyId++) {
        const usesThisStrategy = (strategyBitflags[playerId] >> strategyId) & 1;
        if (usesThisStrategy && baseStrategyId !== undefined) {
          strategyToVarId[playerId][strategyId] = varIdToStrategy.length;
          varIdToStrategy.push([playerId, strategyId]);
        } else if (usesThisStrategy) {
          baseStrategyId = strategyId;
        }
      }
      baseStrategyIds[playerId] = baseStrategyId!;
    }

    // The expression to compute the probability in the mixed strategy.
    // - For each player's base strategy, it is 1 - (x_i + x_j + ... + x_k)
    // - For a "picked" strategy other than the base strategy, it is x_i
    // - For an "unpicked" strategy, it is 0
    const strategyToExpr: Expr[][] = dimensions.map((numStrategies, playerId) =>
      new Array(numStrategies).fill(null).map((_s, strategyId) => {
        if (strategyId === baseStrategyIds[playerId]) {
          const vars: number[] = [];
          for (let strategyId2 = 0; strategyId2 < numStrategies; strategyId2++) {
            if (strategyToVarId[playerId][strategyId2] !== null) {
              vars.push(strategyToVarId[playerId][strategyId2]!);
            }
          }
          return new LinearExpr(vars.map<[Expr, number]>((v) => [new VariableExpr(v), -1]).concat([[new ConstExpr(1), 1]]));
        } else if (strategyToVarId[playerId][strategyId] !== null) {
          return new VariableExpr(strategyToVarId[playerId][strategyId]!);
        } else {
          return new ConstExpr(0);
        }
      })
    );

    // Equality constraints.
    // From the assumption, we can do the following:
    // - Slightly decrease the probability of the base strategy, and increase that of a "picked" strategy.
    // - Slightly increase the probability of the base strategy, and decrease that of a "picked" strategy.
    // From the local optimality of the equilibrium, both shouldn't improve the player's mean payoff.
    // So the partial differentiation of the payoff at the point should be 0.
    const zeroConstraints = varIdToStrategy.map(([playerId, strategyId]) => {
      const baseStrategyId = baseStrategyIds[playerId];
      const terms: (readonly [Expr, number])[] = [];
      for (const profile of multidimensionalIndices(dimensions.map((d, i) => i === playerId ? 1 : d))) {
        profile[playerId] = baseStrategyId;
        const baseStrategyFactor = payoffMatrices[playerId].get(profile);
        profile[playerId] = strategyId;
        const strategyFactor = payoffMatrices[playerId].get(profile);
        terms.push([new ProdExpr(profile.map((strategyId2, playerId2) => playerId2 === playerId ? new ConstExpr(1) : strategyToExpr[playerId2][strategyId2])), strategyFactor - baseStrategyFactor]);
      }
      return new LinearExpr(terms);
    });

    // Inequality constraints.
    // From the assumption, we can do the following:
    // - Slightly decrease the probability of the base strategy, and increase that of an "unpicked" strategy.
    // From the local optimality of the equilibrium, it shouldn't improve the player's mean payoff.
    // So the partial differentiation of the payoff at the point should be non-negative.
    // Additionally all the probabilities must be positive.
    const positiveConstraints: Expr[] = [];
    for (let playerId = 0; playerId < numPlayers; playerId++) {
      const numStrategies = dimensions[playerId];
      const baseStrategyId = baseStrategyIds[playerId];
      for (let strategyId = 0; strategyId < numStrategies; strategyId++) {
        if ((strategyBitflags[playerId] >> strategyId) & 1) {
          positiveConstraints.push(strategyToExpr[playerId][strategyId]);
        } else {
          const terms: (readonly [Expr, number])[] = [];
          for (const profile of multidimensionalIndices(dimensions.map((d, i) => i === playerId ? 1 : d))) {
            profile[playerId] = baseStrategyId;
            const baseStrategyFactor = payoffMatrices[playerId].get(profile);
            profile[playerId] = strategyId;
            const strategyFactor = payoffMatrices[playerId].get(profile);
            terms.push([new ProdExpr(profile.map((strategyId2, playerId2) => playerId2 === playerId ? new ConstExpr(1) : strategyToExpr[playerId2][strategyId2])), baseStrategyFactor - strategyFactor]);
          }
          positiveConstraints.push(new LinearExpr(terms));
        }
      }
    }
    // console.log({
    //   zeroConstraints: zeroConstraints.map((e) => e.asExprString()),
    //   positiveConstraints: positiveConstraints.map((e) => e.asExprString()),
    // });

    // Solve the equation + inequation.
    // It can be non-linear when there are more than 2 players, so use Newton-Raphson-like method.
    let currentMixedProfileVector = varIdToStrategy.map(() => 0);

    for (let i = 0; i < 5; i++) {
      if (currentMixedProfileVector.length === 0) break;

      // Equality constraint
      // eslint-disable-next-line no-loop-func
      const zValuesAndDiffs = zeroConstraints.map((c) => c.callDiff(currentMixedProfileVector));
      // Inequality constraint, only add to the matrix when it is evaluated as negative.
      // Add a small perturbation to ensure the solution is pushed into the interior.
      // eslint-disable-next-line no-loop-func
      const pValuesAndDiffs = positiveConstraints.map((c) => c.callDiff(currentMixedProfileVector)).map<[number, number[]]>(([x, v]) => [x - 0.0000001, v]).filter(([x]) => x < 0);
      const valuesAndDiffs = zValuesAndDiffs.concat(pValuesAndDiffs);

      // Solve Ax=b. Due to the inequality constraints, _A_ may have more rows than the dimension of the solution space.
      // So using A^TAx=A^Tb (normal equation) instead (i.e. use least squares).
      const vecB = math.matrix(valuesAndDiffs.map(([x]) => x));
      // We're already at the feasible solution or almost there. Stop iteration.
      if (!(math.norm(vecB) >= 0.00001)) break;
      const matA = math.matrix(valuesAndDiffs.map(([,v]) => v));
      const matAT = math.transpose(matA);
      const matATA = math.multiply(matAT, matA);
      // We cannot solve it. Stop iteration.
      if (!(math.det(matATA) >= 0.0000000001)) break;
      const vecATB = math.multiply(matAT, vecB);
      currentMixedProfileVector = math.subtract(currentMixedProfileVector, column(math.lusolve(matATA, vecATB) as math.Matrix)) as number[];
    }

    // Check if the current solution is actually feasible.
    const lastZValues = zeroConstraints.map((c) => c.call(currentMixedProfileVector));
    const lastPValues = positiveConstraints.map((c) => c.call(currentMixedProfileVector));
    if (lastZValues.every((x) => Math.abs(x) < 0.00000000000001) && lastPValues.every((x) => x >= 0)) {
      // console.log(currentMixedProfileVector);
      const nashEquilibrium = strategyToExpr.map((exprs) =>
        exprs.map((e) => e.call(currentMixedProfileVector))
      );
      nashEquilibria.push(nashEquilibrium);
    }
  }

  return nashEquilibria;
}

function column(mat: math.Matrix): number[] {
  return (mat.toArray() as number[][]).map(([x]) => x);
}
