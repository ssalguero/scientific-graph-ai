/**
 * PERFORMANCE-I6 — Cross-domain scenario identity markers.
 */

export const PERFORMANCE_CROSS_DOMAIN_PHASE = "PERFORMANCE-I6" as const;
export const PERFORMANCE_CROSS_DOMAIN_STATUS =
  "CROSS_DOMAIN_SCENARIOS_COMPLETE" as const;

export type PerformanceCrossDomainStatus =
  typeof PERFORMANCE_CROSS_DOMAIN_STATUS;
