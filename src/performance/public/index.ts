/**
 * PERFORMANCE public aggregate — I0–I8 exports.
 * Not a consumer import path; consumers use `@/performance` only.
 */

export {
  PERFORMANCE_DOMAIN_ID,
  PERFORMANCE_DOMAIN_NAME,
  PERFORMANCE_DOMAIN_ARCHITECTURAL_ROLE,
  PERFORMANCE_DOMAIN_MOTTO,
  PERFORMANCE_OWNERSHIP_PRINCIPLE,
  PERFORMANCE_FOUNDATION_PHASE,
  PERFORMANCE_FOUNDATION_STATUS,
  PERFORMANCE_FOUNDATION_IDENTITY,
} from "../foundation";

export type {
  PerformanceFoundationIdentity,
  PerformanceFoundationStatus,
} from "../foundation";

export {
  PERFORMANCE_COMPONENT_C_COL,
  PERFORMANCE_COMPONENT_C_AGG,
  PERFORMANCE_MEASUREMENT_PHASE,
  PERFORMANCE_MEASUREMENT_STATUS,
  collectThenAggregate,
} from "../measurement";

export type {
  PerformanceMeasurementStatus,
  AggregationView,
  MeasurementObservationInput,
} from "../measurement";

export {
  PERFORMANCE_INSTRUMENTATION_PHASE,
  PERFORMANCE_INSTRUMENTATION_STATUS,
  PERFORMANCE_SEAM_REGISTRY,
  observeSupportedPublicSeams,
} from "../instrumentation";

export type {
  PerformanceInstrumentationStatus,
  PerformanceSeamDescriptor,
} from "../instrumentation";

export {
  PERFORMANCE_COMPONENT_C_BUD,
  PERFORMANCE_BUDGET_PHASE,
  PERFORMANCE_BUDGET_STATUS,
  createBudgetRegistry,
  evaluateBudget,
} from "../budgets";

export type {
  PerformanceBudgetStatus,
  BudgetDefinition,
  BudgetEvaluationResult,
} from "../budgets";

export {
  PERFORMANCE_COMPONENT_C_WL,
  PERFORMANCE_COMPONENT_C_BASE,
  PERFORMANCE_COMPONENT_C_EVD,
  PERFORMANCE_WORKLOAD_PHASE,
  PERFORMANCE_WORKLOAD_STATUS,
  runWorkloadHarness,
  createBaselineRegistry,
} from "../workloads";

export type {
  PerformanceWorkloadStatus,
  WorkloadDefinition,
  PerformanceBaseline,
} from "../workloads";

export {
  PERFORMANCE_DOMAIN_WAVE_PHASE,
  PERFORMANCE_DOMAIN_WAVE_STATUS,
  runDomainMeasurementWave,
  listActiveDomainWaveTargets,
  listConditionalDomainWaveTargets,
} from "../domain-waves";

export type {
  PerformanceDomainWaveStatus,
  PerformanceMeasurementDomain,
  DomainWaveResult,
} from "../domain-waves";

export {
  PERFORMANCE_CROSS_DOMAIN_PHASE,
  PERFORMANCE_CROSS_DOMAIN_STATUS,
  PRIMARY_CROSS_DOMAIN_SCENARIO,
  runCrossDomainScenario,
  listCrossDomainScenarios,
} from "../cross-domain";

export type {
  PerformanceCrossDomainStatus,
  CrossDomainScenarioDefinition,
  CrossDomainScenarioResult,
} from "../cross-domain";

export {
  PERFORMANCE_COMPONENT_C_OPT,
  PERFORMANCE_COMPONENT_C_CMP,
  PERFORMANCE_OPTIMIZE_PHASE,
  PERFORMANCE_OPTIMIZE_STATUS,
  runOptimizationWave,
  assessOptimizationEligibility,
  compareBeforeAfter,
  createFixtureOptimizationStore,
} from "../opt-waves";

export type {
  PerformanceOptimizeStatus,
  OptimizationCandidate,
  OptimizationWaveResult,
  ComparisonResult,
} from "../opt-waves";

export {
  PERFORMANCE_COMPONENT_C_GRD,
  PERFORMANCE_GATES_PHASE,
  PERFORMANCE_GATES_STATUS,
  evaluateGateReadiness,
  validateGateDefinition,
  gateOutcomeRequiresCiFailure,
} from "../gates";

export type {
  PerformanceGatesStatus,
  GateDefinition,
  GateEvidencePackage,
  GateEvaluationResult,
} from "../gates";

export {
  PERFORMANCE_HARDENING_PHASE,
  PERFORMANCE_HARDENING_STATUS,
} from "../integrity";

export type { PerformanceHardeningStatus } from "../integrity";
