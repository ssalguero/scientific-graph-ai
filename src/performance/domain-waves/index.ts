/**
 * PERFORMANCE-I5 — Domain-scoped measurement waves barrel.
 */

export {
  PERFORMANCE_DOMAIN_WAVE_PHASE,
  PERFORMANCE_DOMAIN_WAVE_STATUS,
} from "./identity";

export type { PerformanceDomainWaveStatus } from "./identity";

export type {
  PerformanceMeasurementDomain,
  DomainWaveOutcome,
  DomainWaveRequest,
  DomainWaveResult,
  DomainWaveCoreResult,
  DomainWaveTargetKind,
  DomainWaveTargetDescriptor,
} from "./types";

export {
  PERFORMANCE_MEASUREMENT_DOMAINS,
  isPerformanceMeasurementDomain,
  listActiveDomainWaveTargets,
  listConditionalDomainWaveTargets,
  getDomainWaveTarget,
} from "./targets";

export { observeSingleDomainSurface } from "./observe";

export {
  runDomainMeasurementWave,
  rejectCrossDomainWaveAttempt,
} from "./wave";
