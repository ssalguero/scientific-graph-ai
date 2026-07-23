/**
 * D67.4 — Session Restore Foundation · Restore Report.
 * Authority: D67.0 Architecture Freeze · API Freeze.
 * Immutable data container only — no calculations, no timers, no IO, no React.
 */

import type { RestoreError } from "./RestoreErrors";

/** API Freeze — restore process report (data-only). */
export interface RestoreReport {
  readonly warnings: readonly RestoreError[];
  readonly errors: readonly RestoreError[];
  readonly restoredItems: number;
  readonly skippedItems: number;
  readonly elapsedTime: number;
}

/**
 * Returns a typed immutable RestoreReport copy.
 * Does not compute fields — caller supplies all values.
 */
export function createRestoreReport(report: RestoreReport): RestoreReport {
  return {
    warnings: report.warnings.slice(),
    errors: report.errors.slice(),
    restoredItems: report.restoredItems,
    skippedItems: report.skippedItems,
    elapsedTime: report.elapsedTime,
  };
}
