/**
 * PERFORMANCE-I2 — Instrumentation seam identity / phase markers.
 */

export const PERFORMANCE_INSTRUMENTATION_PHASE = "PERFORMANCE-I2" as const;
export const PERFORMANCE_INSTRUMENTATION_STATUS =
  "INSTRUMENTATION_SEAMS_COMPLETE" as const;

export type PerformanceInstrumentationStatus =
  typeof PERFORMANCE_INSTRUMENTATION_STATUS;

export type PerformanceSeamId =
  | "engine"
  | "data"
  | "ux"
  | "ai"
  | "collab"
  | "plugins"
  | "cross-domain";

export type PerformanceSeamAvailability =
  | "supported"
  | "conditional"
  | "evidence-dependency"
  | "partial"
  | "unavailable";
