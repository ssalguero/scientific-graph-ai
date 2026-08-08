/**
 * PERFORMANCE-I2 — Shared adapter types (read-only observation → C-COL inputs).
 */

import type { MeasurementObservationInput } from "../measurement/types";
import type { PerformanceSeamId } from "./identity";

export type AdapterObservationBatch = {
  readonly seamId: PerformanceSeamId;
  readonly collectedAtMs: number;
  readonly observations: readonly MeasurementObservationInput[];
};

/** Passive timing observation supplied by the rightful peer caller — PERFORMANCE does not dispatch. */
export type PassivePublicTimingInput = {
  readonly observationId: string;
  readonly seamId: "engine" | "data" | "ux";
  readonly operationLabel: string;
  readonly durationMs: number;
  readonly collectedAtMs: number;
};
