/**
 * PERFORMANCE-I1 — C-COL Measurement Collection Role.
 *
 * Accepts explicit measurement observations without peer instrumentation,
 * peer adapters, or invented peer APIs. Suitable for later I2 seam bindings.
 */

import type {
  CollectionBatch,
  MeasurementCoreResult,
  MeasurementObservation,
  MeasurementObservationInput,
} from "./types";
import { PERFORMANCE_COMPONENT_C_COL } from "./identity";

export { PERFORMANCE_COMPONENT_C_COL };

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export function validateObservationInput(
  input: MeasurementObservationInput,
): MeasurementCoreResult<MeasurementObservation> {
  if (!isNonEmptyString(input.observationId)) {
    return { ok: false, error: "observationId must be a non-empty string" };
  }
  if (!isNonEmptyString(input.sourceLabel)) {
    return { ok: false, error: "sourceLabel must be a non-empty string" };
  }
  if (!isNonEmptyString(input.signalName)) {
    return { ok: false, error: "signalName must be a non-empty string" };
  }
  if (!isFiniteNumber(input.numericValue)) {
    return { ok: false, error: "numericValue must be a finite number" };
  }
  if (!isFiniteNumber(input.collectedAtMs)) {
    return { ok: false, error: "collectedAtMs must be a finite number" };
  }

  const observation: MeasurementObservation = {
    observationId: input.observationId.trim(),
    sourceLabel: input.sourceLabel.trim(),
    signalName: input.signalName.trim(),
    numericValue: input.numericValue,
    collectedAtMs: input.collectedAtMs,
  };
  return { ok: true, value: observation };
}

/** C-COL: accept a single validated observation. */
export function collectObservation(
  input: MeasurementObservationInput,
): MeasurementCoreResult<MeasurementObservation> {
  return validateObservationInput(input);
}

/** C-COL: create an empty collection batch owned by PERFORMANCE. */
export function createCollectionBatch(batchId: string): MeasurementCoreResult<CollectionBatch> {
  if (!isNonEmptyString(batchId)) {
    return { ok: false, error: "batchId must be a non-empty string" };
  }
  return {
    ok: true,
    value: {
      batchId: batchId.trim(),
      observations: [],
    },
  };
}

/**
 * C-COL: append a validated observation to a batch.
 * Rejects duplicate observationId within the batch (deterministic integrity).
 */
export function appendObservation(
  batch: CollectionBatch,
  input: MeasurementObservationInput,
): MeasurementCoreResult<CollectionBatch> {
  const collected = collectObservation(input);
  if (!collected.ok) return collected;

  if (batch.observations.some((o) => o.observationId === collected.value.observationId)) {
    return {
      ok: false,
      error: `duplicate observationId: ${collected.value.observationId}`,
    };
  }

  return {
    ok: true,
    value: {
      batchId: batch.batchId,
      observations: [...batch.observations, collected.value],
    },
  };
}

/**
 * C-COL: build a batch from explicit inputs (no peer probing).
 * Fails fast on the first invalid observation.
 */
export function collectObservations(
  batchId: string,
  inputs: readonly MeasurementObservationInput[],
): MeasurementCoreResult<CollectionBatch> {
  const created = createCollectionBatch(batchId);
  if (!created.ok) return created;

  let batch = created.value;
  for (const input of inputs) {
    const next = appendObservation(batch, input);
    if (!next.ok) return next;
    batch = next.value;
  }
  return { ok: true, value: batch };
}
