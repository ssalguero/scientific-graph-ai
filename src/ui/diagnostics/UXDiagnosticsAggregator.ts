/**
 * UX-6.9 — Diagnostics aggregator (receive · aggregate · freeze).
 *
 * Pure TypeScript · no React · no Runtime · no side effects · no class.
 * Does not recalculate orphans/duplicates or inspect subsystem internals.
 */

import type { UXDiagnosticsInput } from "./UXDiagnosticsTypes";
import type { UXDiagnosticsReport } from "./UXDiagnosticsReport";
import { createUXMetrics } from "./UXMetrics";

/**
 * Aggregates existing public subsystem reports into one frozen report.
 * Calls createUXMetrics(input) exactly once.
 */
export function createUXDiagnosticsReport(
  input: UXDiagnosticsInput,
): UXDiagnosticsReport {
  const metrics = createUXMetrics(input);

  return Object.freeze({
    ...input,
    metrics,
  });
}
