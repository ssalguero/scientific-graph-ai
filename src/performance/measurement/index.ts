/**
 * PERFORMANCE-I1 — Measurement core barrel.
 */

export {
  PERFORMANCE_COMPONENT_C_COL,
  PERFORMANCE_COMPONENT_C_AGG,
  PERFORMANCE_MEASUREMENT_PHASE,
  PERFORMANCE_MEASUREMENT_STATUS,
} from "./identity";

export type { PerformanceMeasurementStatus } from "./identity";

export type {
  MeasurementObservationInput,
  MeasurementObservation,
  CollectionBatch,
  AggregatedSignalView,
  AggregationView,
  MeasurementCoreResult,
} from "./types";

export {
  validateObservationInput,
  collectObservation,
  createCollectionBatch,
  appendObservation,
  collectObservations,
} from "./collection";

export { aggregateBatch } from "./aggregation";

export { collectThenAggregate } from "./pipeline";
