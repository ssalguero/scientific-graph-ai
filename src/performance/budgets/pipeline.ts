/**
 * PERFORMANCE-I3 — Collect → Aggregate → Budget Evaluate (P1 partial + C-BUD).
 *
 * Does not implement Evidence packaging (later phases).
 */

import { collectThenAggregate } from "../measurement/pipeline";
import type {
  AggregationView,
  MeasurementCoreResult,
  MeasurementObservationInput,
} from "../measurement/types";
import { evaluateBudget } from "./evaluate";
import type { BudgetDefinition, BudgetEvaluationResult } from "./types";

export type MeasureAndEvaluateResult = {
  readonly aggregation: AggregationView;
  readonly evaluation: BudgetEvaluationResult;
};

/**
 * Run Collect → Aggregate, then evaluate one budget against the view.
 * Budget failure does not trigger optimization.
 */
export function collectAggregateThenEvaluateBudget(
  batchId: string,
  inputs: readonly MeasurementObservationInput[],
  budget: BudgetDefinition,
): MeasurementCoreResult<MeasureAndEvaluateResult> {
  const aggregated = collectThenAggregate(batchId, inputs);
  if (!aggregated.ok) return aggregated;
  return {
    ok: true,
    value: {
      aggregation: aggregated.value,
      evaluation: evaluateBudget(budget, aggregated.value),
    },
  };
}
