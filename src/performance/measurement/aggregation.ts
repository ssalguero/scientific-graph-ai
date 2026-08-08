/**
 * PERFORMANCE-I1 — C-AGG Aggregation Role.
 *
 * Composes collected observations into a deterministic comparable view.
 * No budgets, thresholds, regression, optimization, or certification decisions.
 */

import type {
  AggregatedSignalView,
  AggregationView,
  CollectionBatch,
  MeasurementCoreResult,
  MeasurementObservation,
} from "./types";
import { PERFORMANCE_COMPONENT_C_AGG } from "./identity";

export { PERFORMANCE_COMPONENT_C_AGG };

const signalKey = (sourceLabel: string, signalName: string) =>
  `${sourceLabel}\u0000${signalName}`;

const compareObservations = (a: MeasurementObservation, b: MeasurementObservation): number => {
  if (a.collectedAtMs !== b.collectedAtMs) return a.collectedAtMs - b.collectedAtMs;
  if (a.observationId < b.observationId) return -1;
  if (a.observationId > b.observationId) return 1;
  return 0;
};

const compareSignals = (a: AggregatedSignalView, b: AggregatedSignalView): number => {
  if (a.sourceLabel < b.sourceLabel) return -1;
  if (a.sourceLabel > b.sourceLabel) return 1;
  if (a.signalName < b.signalName) return -1;
  if (a.signalName > b.signalName) return 1;
  return 0;
};

/** C-AGG: aggregate a collection batch into a deterministic AggregationView. */
export function aggregateBatch(
  batch: CollectionBatch,
): MeasurementCoreResult<AggregationView> {
  if (!batch.batchId || batch.batchId.trim().length === 0) {
    return { ok: false, error: "batchId must be a non-empty string" };
  }

  if (!Array.isArray(batch.observations)) {
    return { ok: false, error: "observations must be an array" };
  }

  const seenIds = new Set<string>();
  for (const observation of batch.observations) {
    if (!observation || typeof observation !== "object") {
      return { ok: false, error: "observation entry invalid" };
    }
    if (
      !observation.observationId?.trim() ||
      !observation.sourceLabel?.trim() ||
      !observation.signalName?.trim()
    ) {
      return {
        ok: false,
        error: "observation identity fields must be non-empty (integrity)",
      };
    }
    if (!Number.isFinite(observation.numericValue)) {
      return {
        ok: false,
        error: "observation numericValue must be finite (integrity)",
      };
    }
    if (!Number.isFinite(observation.collectedAtMs)) {
      return {
        ok: false,
        error: "observation collectedAtMs must be finite (integrity)",
      };
    }
    if (seenIds.has(observation.observationId)) {
      return {
        ok: false,
        error: `duplicate observationId in batch: ${observation.observationId}`,
      };
    }
    seenIds.add(observation.observationId);
  }

  const sorted = [...batch.observations].sort(compareObservations);
  const groups = new Map<string, AggregatedSignalView>();

  for (const observation of sorted) {
    const key = signalKey(observation.sourceLabel, observation.signalName);
    const existing = groups.get(key);
    if (!existing) {
      groups.set(key, {
        sourceLabel: observation.sourceLabel,
        signalName: observation.signalName,
        count: 1,
        sum: observation.numericValue,
        min: observation.numericValue,
        max: observation.numericValue,
      });
      continue;
    }

    groups.set(key, {
      sourceLabel: existing.sourceLabel,
      signalName: existing.signalName,
      count: existing.count + 1,
      sum: existing.sum + observation.numericValue,
      min: Math.min(existing.min, observation.numericValue),
      max: Math.max(existing.max, observation.numericValue),
    });
  }

  const signals = [...groups.values()].sort(compareSignals);
  const signalCount = signals.reduce((acc, s) => acc + s.count, 0);
  if (signalCount !== sorted.length) {
    return {
      ok: false,
      error: "aggregation integrity failure — signal counts mismatch observations",
    };
  }

  return {
    ok: true,
    value: {
      batchId: batch.batchId,
      observationCount: sorted.length,
      signals,
    },
  };
}
