/**
 * PERFORMANCE-I1 — Collect → Aggregate pipeline (P1 partial).
 *
 * Implements only Collect → Aggregate. Does not implement Budget Evaluate or Evidence.
 */

import { collectObservations } from "./collection";
import { aggregateBatch } from "./aggregation";
import type {
  AggregationView,
  MeasurementCoreResult,
  MeasurementObservationInput,
} from "./types";

/**
 * Run the I1 measurement core path:
 * Collect observations → Aggregate into a comparable view.
 */
export function collectThenAggregate(
  batchId: string,
  inputs: readonly MeasurementObservationInput[],
): MeasurementCoreResult<AggregationView> {
  const collected = collectObservations(batchId, inputs);
  if (!collected.ok) return collected;
  return aggregateBatch(collected.value);
}
