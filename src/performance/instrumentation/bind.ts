/**
 * PERFORMANCE-I2 — Bind read-only adapter observations into C-COL → C-AGG.
 *
 * PERFORMANCE never dispatches peer commands. Passive timing inputs are accepted
 * only for allowlisted public operation labels on supported active seams.
 */

import { collectThenAggregate } from "../measurement/pipeline";
import type {
  AggregationView,
  MeasurementCoreResult,
  MeasurementObservationInput,
} from "../measurement/types";
import { observeDataPublicSurface } from "./data-adapter";
import { isEnginePublicOperationLabel, observeEnginePublicSurface } from "./engine-adapter";
import { getSeamDescriptor } from "./seams";
import type { AdapterObservationBatch, PassivePublicTimingInput } from "./types";
import { observeUxPublicSurface } from "./ux-adapter";

export function adapterBatchToInputs(
  batch: AdapterObservationBatch,
): readonly MeasurementObservationInput[] {
  return batch.observations;
}

/**
 * Convert a caller-supplied timing sample into a C-COL input.
 * Rejects unsupported seams and non-allowlisted ENGINE operation labels.
 * Does not invoke peer APIs.
 */
export function observePassivePublicTiming(
  input: PassivePublicTimingInput,
): MeasurementCoreResult<MeasurementObservationInput> {
  const seam = getSeamDescriptor(input.seamId);
  if (!seam || !seam.adapterImplemented) {
    return {
      ok: false,
      error: `seam '${input.seamId}' is not an implemented I2 adapter (availability: ${seam?.availability ?? "unknown"})`,
    };
  }

  if (!Number.isFinite(input.durationMs) || input.durationMs < 0) {
    return { ok: false, error: "durationMs must be a non-negative finite number" };
  }

  if (input.seamId === "engine" && !isEnginePublicOperationLabel(input.operationLabel)) {
    return {
      ok: false,
      error: `operationLabel '${input.operationLabel}' is not an ENGINE public allowlist label`,
    };
  }

  if (!input.observationId.trim() || !input.operationLabel.trim()) {
    return { ok: false, error: "observationId and operationLabel must be non-empty" };
  }

  return {
    ok: true,
    value: {
      observationId: input.observationId.trim(),
      sourceLabel: input.seamId,
      signalName: `timing.${input.operationLabel.trim()}`,
      numericValue: input.durationMs,
      collectedAtMs: input.collectedAtMs,
    },
  };
}

/** Feed adapter observations through Collect → Aggregate. */
export function bindAdapterObservations(
  batchId: string,
  batches: readonly AdapterObservationBatch[],
): MeasurementCoreResult<AggregationView> {
  const inputs = batches.flatMap((batch) => [...adapterBatchToInputs(batch)]);
  return collectThenAggregate(batchId, inputs);
}

/** Observe all implemented active seams (ENGINE/DATA/UX) and aggregate. */
export function observeSupportedPublicSeams(
  batchId: string,
  collectedAtMs: number,
): MeasurementCoreResult<AggregationView> {
  return bindAdapterObservations(batchId, [
    observeEnginePublicSurface(collectedAtMs),
    observeDataPublicSurface(collectedAtMs + 1000),
    observeUxPublicSurface(collectedAtMs + 2000),
  ]);
}
