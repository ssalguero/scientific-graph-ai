/**
 * UX-3.12 — Frozen global runtime health status (private).
 *
 * Derived exclusively from diagnostic error/warning counts.
 * INFO never affects status. No configurable priorities.
 */

function status(
  errorCount: number,
  warningCount: number,
): "OK" | "WARNING" | "ERROR" {
  if (errorCount > 0) {
    return "ERROR";
  }
  if (warningCount > 0) {
    return "WARNING";
  }
  return "OK";
}

export const RuntimeHealthStatus = Object.freeze({
  OK: "OK",
  WARNING: "WARNING",
  ERROR: "ERROR",
  status,
} as const);

export type RuntimeHealthStatus =
  | (typeof RuntimeHealthStatus)["OK"]
  | (typeof RuntimeHealthStatus)["WARNING"]
  | (typeof RuntimeHealthStatus)["ERROR"];
