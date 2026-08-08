/**
 * PERFORMANCE-I5 — Domain-scoped measurement wave identity markers.
 *
 * I5 orchestrates existing C-COL…C-EVD; it does not introduce a new P3 component id.
 */

export const PERFORMANCE_DOMAIN_WAVE_PHASE = "PERFORMANCE-I5" as const;
export const PERFORMANCE_DOMAIN_WAVE_STATUS =
  "DOMAIN_MEASUREMENT_WAVES_COMPLETE" as const;

export type PerformanceDomainWaveStatus = typeof PERFORMANCE_DOMAIN_WAVE_STATUS;
