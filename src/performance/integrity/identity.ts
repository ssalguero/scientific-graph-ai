/**
 * PERFORMANCE-I9 — Hardening / measurement-integrity phase markers.
 *
 * I9 does not introduce a new runtime subsystem — markers only.
 */

export const PERFORMANCE_HARDENING_PHASE = "PERFORMANCE-I9" as const;
export const PERFORMANCE_HARDENING_STATUS =
  "HARDENING_MEASUREMENT_INTEGRITY_COMPLETE" as const;

export type PerformanceHardeningStatus =
  typeof PERFORMANCE_HARDENING_STATUS;
