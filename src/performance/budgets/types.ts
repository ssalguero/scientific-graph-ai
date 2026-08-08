/**
 * PERFORMANCE-I3 — Budget / SLO policy types (C-BUD).
 *
 * Configurable mechanism only. Product/domain budgets are not invented here.
 * Test fixtures must use kind: "fixture".
 */

import type { AggregationView } from "../measurement/types";

export type BudgetStatistic = "count" | "sum" | "min" | "max";

export type BudgetComparator = "lte" | "gte" | "lt" | "gt" | "eq";

/**
 * Budget definition kind:
 * - fixture: test-only; not a product-approved budget
 * - policy: caller-supplied policy entry (still not auto-product unless authoritative)
 */
export type BudgetDefinitionKind = "fixture" | "policy";

export type BudgetDefinition = {
  readonly budgetId: string;
  readonly label: string;
  readonly sourceLabel: string;
  readonly signalName: string;
  readonly statistic: BudgetStatistic;
  readonly comparator: BudgetComparator;
  readonly threshold: number;
  readonly kind: BudgetDefinitionKind;
};

/** P8-aligned evaluation outcomes for budget policy. */
export type BudgetEvaluationOutcome =
  | "PASS"
  | "FAIL"
  | "INCONCLUSIVE"
  | "BLOCKED"
  | "EVIDENCE_DEPENDENCY";

export type BudgetEvaluationResult = {
  readonly budgetId: string;
  readonly outcome: BudgetEvaluationOutcome;
  readonly observedValue?: number;
  readonly threshold: number;
  readonly reason: string;
};

export type BudgetRegistrySnapshot = {
  readonly budgets: readonly BudgetDefinition[];
};

export type BudgetEvaluateInput = {
  readonly budget: BudgetDefinition;
  readonly aggregation: AggregationView | null | undefined;
};

export type BudgetCoreResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: string };
