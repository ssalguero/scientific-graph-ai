/**
 * UX-3.13 — Immutable runtime health aggregation (private).
 *
 * Scalar summary of consecutive RuntimeHealth samples.
 * No arrays, references, timestamps, or history.
 */

export type RuntimeAggregation = Readonly<{
  totalSamples: number;
  okCount: number;
  warningCount: number;
  errorCount: number;
  averageResolutionCount: number;
  averageFallbackCount: number;
  averageObserverCount: number;
  averageDiagnosticCount: number;
}>;
