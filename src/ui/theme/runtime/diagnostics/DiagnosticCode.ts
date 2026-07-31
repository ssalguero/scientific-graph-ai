/**
 * UX-3.11 — Closed frozen diagnostic codes (private).
 */

export const DiagnosticCode = Object.freeze({
  EMPTY_REGISTRY: "EMPTY_REGISTRY",
  NO_THEME_REGISTERED: "NO_THEME_REGISTERED",
  RESOLUTION_MISS: "RESOLUTION_MISS",
  CACHE_ACTIVITY_MISSING: "CACHE_ACTIVITY_MISSING",
  OBSERVER_INACTIVE: "OBSERVER_INACTIVE",
  METRICS_UNAVAILABLE: "METRICS_UNAVAILABLE",
} as const);

export type DiagnosticCode =
  (typeof DiagnosticCode)[keyof typeof DiagnosticCode];
