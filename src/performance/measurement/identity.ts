/**
 * PERFORMANCE-I1 — Component identity for measurement core roles.
 *
 * Authority: PERFORMANCE-P3 Component Inventory (C-COL, C-AGG).
 */

export const PERFORMANCE_COMPONENT_C_COL = "C-COL" as const;
export const PERFORMANCE_COMPONENT_C_AGG = "C-AGG" as const;

export const PERFORMANCE_MEASUREMENT_PHASE = "PERFORMANCE-I1" as const;
export const PERFORMANCE_MEASUREMENT_STATUS = "MEASUREMENT_CORE_COMPLETE" as const;

export type PerformanceMeasurementStatus = typeof PERFORMANCE_MEASUREMENT_STATUS;
