/**
 * PERFORMANCE-I3 — Budget evaluation against AggregationView (C-BUD).
 *
 * Deterministic · side-effect free · missing/incompatible data never PASS.
 */

import type { AggregationView, AggregatedSignalView } from "../measurement/types";
import type {
  BudgetComparator,
  BudgetDefinition,
  BudgetEvaluationResult,
  BudgetStatistic,
} from "./types";
import { validateBudgetDefinition } from "./validate";

const compare = (
  observed: number,
  comparator: BudgetComparator,
  threshold: number,
): boolean => {
  switch (comparator) {
    case "lte":
      return observed <= threshold;
    case "gte":
      return observed >= threshold;
    case "lt":
      return observed < threshold;
    case "gt":
      return observed > threshold;
    case "eq":
      return observed === threshold;
    default: {
      const _exhaustive: never = comparator;
      return _exhaustive;
    }
  }
};

const readStatistic = (
  signal: AggregatedSignalView,
  statistic: BudgetStatistic,
): number => {
  switch (statistic) {
    case "count":
      return signal.count;
    case "sum":
      return signal.sum;
    case "min":
      return signal.min;
    case "max":
      return signal.max;
    default: {
      const _exhaustive: never = statistic;
      return _exhaustive;
    }
  }
};

/**
 * Evaluate a budget policy against an aggregation view.
 * Does not mutate peers, registries, or measurement state.
 */
export function evaluateBudget(
  budget: BudgetDefinition,
  aggregation: AggregationView | null | undefined,
): BudgetEvaluationResult {
  const validated = validateBudgetDefinition(budget);
  if (!validated.ok) {
    return {
      budgetId: budget?.budgetId ?? "(invalid)",
      outcome: "BLOCKED",
      threshold: Number.isFinite(budget?.threshold) ? budget.threshold : 0,
      reason: `invalid budget definition — ${validated.error}`,
    };
  }
  budget = validated.value;

  if (aggregation == null) {
    return {
      budgetId: budget.budgetId,
      outcome: "INCONCLUSIVE",
      threshold: budget.threshold,
      reason: "missing aggregation view — cannot evaluate; never PASS",
    };
  }

  if (!aggregation.batchId || aggregation.batchId.trim().length === 0) {
    return {
      budgetId: budget.budgetId,
      outcome: "BLOCKED",
      threshold: budget.threshold,
      reason: "aggregation batchId invalid — evaluation blocked",
    };
  }

  const signal = aggregation.signals.find(
    (s) =>
      s.sourceLabel === budget.sourceLabel && s.signalName === budget.signalName,
  );

  const conditionalSources = new Set(["ai", "collab", "plugins"]);
  if (!signal && conditionalSources.has(budget.sourceLabel)) {
    return {
      budgetId: budget.budgetId,
      outcome: "EVIDENCE_DEPENDENCY",
      threshold: budget.threshold,
      reason: `conditional seam '${budget.sourceLabel}' has no measurement evidence — not PASS`,
    };
  }

  if (!signal) {
    return {
      budgetId: budget.budgetId,
      outcome: "INCONCLUSIVE",
      threshold: budget.threshold,
      reason: `no aggregated signal for ${budget.sourceLabel}/${budget.signalName} — missing measurement never PASS`,
    };
  }

  const observedValue = readStatistic(signal, budget.statistic);
  if (!Number.isFinite(observedValue)) {
    return {
      budgetId: budget.budgetId,
      outcome: "INCONCLUSIVE",
      threshold: budget.threshold,
      reason: "observed statistic is not finite",
    };
  }

  const passed = compare(observedValue, budget.comparator, budget.threshold);
  return {
    budgetId: budget.budgetId,
    outcome: passed ? "PASS" : "FAIL",
    observedValue,
    threshold: budget.threshold,
    reason: passed
      ? `observed ${budget.statistic}=${observedValue} satisfies ${budget.comparator} ${budget.threshold}`
      : `observed ${budget.statistic}=${observedValue} violates ${budget.comparator} ${budget.threshold}`,
  };
}

/** Evaluate every registered budget against one aggregation view. */
export function evaluateBudgets(
  budgets: readonly BudgetDefinition[],
  aggregation: AggregationView | null | undefined,
): readonly BudgetEvaluationResult[] {
  return budgets.map((budget) => evaluateBudget(budget, aggregation));
}
