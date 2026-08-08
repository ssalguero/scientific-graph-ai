/**
 * PERFORMANCE-I1 — Measurement observation model (Collect → Aggregate only).
 *
 * Minimal structures for C-COL / C-AGG. No budgets, workloads, baselines,
 * regression schemas, peer APIs, or metric catalogs.
 */

export type MeasurementObservationInput = {
  readonly observationId: string;
  readonly sourceLabel: string;
  readonly signalName: string;
  readonly numericValue: number;
  readonly collectedAtMs: number;
};

export type MeasurementObservation = {
  readonly observationId: string;
  readonly sourceLabel: string;
  readonly signalName: string;
  readonly numericValue: number;
  readonly collectedAtMs: number;
};

export type CollectionBatch = {
  readonly batchId: string;
  readonly observations: readonly MeasurementObservation[];
};

export type AggregatedSignalView = {
  readonly sourceLabel: string;
  readonly signalName: string;
  readonly count: number;
  readonly sum: number;
  readonly min: number;
  readonly max: number;
};

/** Comparable aggregation view produced by C-AGG (not evidence packaging / budgets). */
export type AggregationView = {
  readonly batchId: string;
  readonly observationCount: number;
  readonly signals: readonly AggregatedSignalView[];
};

export type MeasurementCoreResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: string };
