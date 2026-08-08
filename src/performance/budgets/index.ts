/**
 * PERFORMANCE-I3 — Budgets / SLO (C-BUD) barrel.
 */

export {
  PERFORMANCE_COMPONENT_C_BUD,
  PERFORMANCE_BUDGET_PHASE,
  PERFORMANCE_BUDGET_STATUS,
} from "./identity";

export type { PerformanceBudgetStatus } from "./identity";

export type {
  BudgetStatistic,
  BudgetComparator,
  BudgetDefinitionKind,
  BudgetDefinition,
  BudgetEvaluationOutcome,
  BudgetEvaluationResult,
  BudgetRegistrySnapshot,
  BudgetEvaluateInput,
  BudgetCoreResult,
} from "./types";

export { validateBudgetDefinition } from "./validate";

export { createBudgetRegistry } from "./registry";
export type { BudgetRegistry } from "./registry";

export { evaluateBudget, evaluateBudgets } from "./evaluate";

export { collectAggregateThenEvaluateBudget } from "./pipeline";
export type { MeasureAndEvaluateResult } from "./pipeline";
