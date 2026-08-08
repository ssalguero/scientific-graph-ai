/**
 * PERFORMANCE-I4 — C-WL / C-BASE / C-EVD identity markers.
 */

export const PERFORMANCE_COMPONENT_C_WL = "C-WL" as const;
export const PERFORMANCE_COMPONENT_C_BASE = "C-BASE" as const;
export const PERFORMANCE_COMPONENT_C_EVD = "C-EVD" as const;

export const PERFORMANCE_WORKLOAD_PHASE = "PERFORMANCE-I4" as const;
export const PERFORMANCE_WORKLOAD_STATUS = "WORKLOADS_BASELINES_COMPLETE" as const;

export type PerformanceWorkloadStatus = typeof PERFORMANCE_WORKLOAD_STATUS;
