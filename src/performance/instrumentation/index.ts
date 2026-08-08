/**
 * PERFORMANCE-I2 — Instrumentation seams barrel.
 */

export {
  PERFORMANCE_INSTRUMENTATION_PHASE,
  PERFORMANCE_INSTRUMENTATION_STATUS,
} from "./identity";

export type {
  PerformanceInstrumentationStatus,
  PerformanceSeamId,
  PerformanceSeamAvailability,
} from "./identity";

export type { PerformanceSeamDescriptor } from "./seams";
export {
  PERFORMANCE_SEAM_REGISTRY,
  getSeamDescriptor,
  listImplementedSeams,
  listUnavailableOrDeferredSeams,
} from "./seams";

export type { AdapterObservationBatch, PassivePublicTimingInput } from "./types";

export {
  ENGINE_PUBLIC_OPERATION_LABELS,
  isEnginePublicOperationLabel,
  observeEnginePublicSurface,
} from "./engine-adapter";

export type { EnginePublicOperationLabel } from "./engine-adapter";

export { observeDataPublicSurface } from "./data-adapter";

export { observeUxPublicSurface } from "./ux-adapter";

export {
  adapterBatchToInputs,
  observePassivePublicTiming,
  bindAdapterObservations,
  observeSupportedPublicSeams,
} from "./bind";
