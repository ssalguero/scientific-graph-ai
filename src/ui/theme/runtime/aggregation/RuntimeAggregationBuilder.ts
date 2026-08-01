/**
 * UX-3.13 — Sole constructor for RuntimeAggregation (private).
 *
 * API: create(...) only.
 * Pure — no accumulation, no average math, no cache.
 * Every create() returns a newly frozen instance.
 */

import type { RuntimeAggregation } from "./RuntimeAggregation";

function create(
  totalSamples: number,
  okCount: number,
  warningCount: number,
  errorCount: number,
  averageResolutionCount: number,
  averageFallbackCount: number,
  averageObserverCount: number,
  averageDiagnosticCount: number,
): RuntimeAggregation {
  const result: RuntimeAggregation = {
    totalSamples,
    okCount,
    warningCount,
    errorCount,
    averageResolutionCount,
    averageFallbackCount,
    averageObserverCount,
    averageDiagnosticCount,
  };
  return Object.freeze(result);
}

export const RuntimeAggregationBuilder = Object.freeze({
  create,
});
