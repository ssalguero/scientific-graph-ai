/**
 * PERFORMANCE-I3 — C-BUD identity / phase markers.
 *
 * Authority: PERFORMANCE-P3 · P6 I3 · P2 Budget Model.
 */

export const PERFORMANCE_COMPONENT_C_BUD = "C-BUD" as const;

export const PERFORMANCE_BUDGET_PHASE = "PERFORMANCE-I3" as const;
export const PERFORMANCE_BUDGET_STATUS = "BUDGETS_SLO_COMPLETE" as const;

export type PerformanceBudgetStatus = typeof PERFORMANCE_BUDGET_STATUS;
