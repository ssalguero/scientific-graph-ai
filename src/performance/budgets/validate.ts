/**
 * PERFORMANCE-I3 — Budget definition validation (C-BUD).
 */

import type {
  BudgetComparator,
  BudgetCoreResult,
  BudgetDefinition,
  BudgetDefinitionKind,
  BudgetStatistic,
} from "./types";

const STATISTICS: readonly BudgetStatistic[] = ["count", "sum", "min", "max"];
const COMPARATORS: readonly BudgetComparator[] = ["lte", "gte", "lt", "gt", "eq"];
const KINDS: readonly BudgetDefinitionKind[] = ["fixture", "policy"];

const isNonEmpty = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export function validateBudgetDefinition(
  input: BudgetDefinition,
): BudgetCoreResult<BudgetDefinition> {
  if (!isNonEmpty(input.budgetId)) {
    return { ok: false, error: "budgetId must be a non-empty string" };
  }
  if (!isNonEmpty(input.label)) {
    return { ok: false, error: "label must be a non-empty string" };
  }
  if (!isNonEmpty(input.sourceLabel)) {
    return { ok: false, error: "sourceLabel must be a non-empty string" };
  }
  if (!isNonEmpty(input.signalName)) {
    return { ok: false, error: "signalName must be a non-empty string" };
  }
  if (!STATISTICS.includes(input.statistic)) {
    return { ok: false, error: "statistic must be count|sum|min|max" };
  }
  if (!COMPARATORS.includes(input.comparator)) {
    return { ok: false, error: "comparator must be lte|gte|lt|gt|eq" };
  }
  if (!Number.isFinite(input.threshold)) {
    return { ok: false, error: "threshold must be a finite number" };
  }
  if (!KINDS.includes(input.kind)) {
    return { ok: false, error: "kind must be fixture|policy" };
  }

  return {
    ok: true,
    value: {
      budgetId: input.budgetId.trim(),
      label: input.label.trim(),
      sourceLabel: input.sourceLabel.trim(),
      signalName: input.signalName.trim(),
      statistic: input.statistic,
      comparator: input.comparator,
      threshold: input.threshold,
      kind: input.kind,
    },
  };
}
