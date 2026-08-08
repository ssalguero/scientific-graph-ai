/**
 * PERFORMANCE-I8 — Gates / C-GRD barrel.
 */

export {
  PERFORMANCE_COMPONENT_C_GRD,
  PERFORMANCE_GATES_PHASE,
  PERFORMANCE_GATES_STATUS,
} from "./identity";

export type { PerformanceGatesStatus } from "./identity";

export type {
  GateDefinitionKind,
  GateDefinition,
  GateEvidencePackage,
  GateOutcome,
  GateEvaluationResult,
  GateCoreResult,
} from "./types";

export { validateGateDefinition } from "./definition";
export {
  evaluateGateReadiness,
  gateOutcomeRequiresCiFailure,
} from "./evaluate";
