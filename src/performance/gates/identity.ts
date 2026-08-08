/**
 * PERFORMANCE-I8 — C-GRD identity markers.
 */

export const PERFORMANCE_COMPONENT_C_GRD = "C-GRD" as const;

export const PERFORMANCE_GATES_PHASE = "PERFORMANCE-I8" as const;
export const PERFORMANCE_GATES_STATUS = "REGRESSION_CI_GATES_COMPLETE" as const;

export type PerformanceGatesStatus = typeof PERFORMANCE_GATES_STATUS;
