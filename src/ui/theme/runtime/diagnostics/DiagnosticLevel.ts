/**
 * UX-3.11 — Frozen diagnostic severity levels (private).
 */

export const DiagnosticLevel = Object.freeze({
  OK: "OK",
  INFO: "INFO",
  WARNING: "WARNING",
  ERROR: "ERROR",
} as const);

export type DiagnosticLevel =
  (typeof DiagnosticLevel)[keyof typeof DiagnosticLevel];
