/**
 * PERFORMANCE-I6 — Cross-domain scenarios barrel.
 */

export {
  PERFORMANCE_CROSS_DOMAIN_PHASE,
  PERFORMANCE_CROSS_DOMAIN_STATUS,
} from "./identity";

export type { PerformanceCrossDomainStatus } from "./identity";

export type {
  CrossDomainScenarioKind,
  CrossDomainScenarioDefinition,
  CrossDomainScenarioOutcome,
  CrossDomainScenarioRequest,
  DomainStepObservation,
  CrossDomainScenarioResult,
} from "./types";

export {
  PRIMARY_CROSS_DOMAIN_SCENARIO,
  CROSS_DOMAIN_SCENARIO_CATALOG,
  getCrossDomainScenario,
  listCrossDomainScenarios,
} from "./scenarios";

export {
  validateCrossDomainScenario,
  isUnsupportedOptionalSequence,
} from "./sequence";
export type { SequenceValidation } from "./sequence";

export { observeDomainSequence } from "./observe";
export type { CrossDomainObservationBundle } from "./observe";

export {
  runCrossDomainScenario,
  rejectUnsupportedCrossDomainPath,
} from "./run";
