/**
 * PERFORMANCE-I7 — C-OPT / C-CMP identity markers.
 */

export const PERFORMANCE_COMPONENT_C_OPT = "C-OPT" as const;
export const PERFORMANCE_COMPONENT_C_CMP = "C-CMP" as const;

export const PERFORMANCE_OPTIMIZE_PHASE = "PERFORMANCE-I7" as const;
export const PERFORMANCE_OPTIMIZE_STATUS =
  "OPTIMIZATION_WAVES_COMPLETE" as const;

export type PerformanceOptimizeStatus = typeof PERFORMANCE_OPTIMIZE_STATUS;
