/**
 * PERFORMANCE Domain — Public barrel.
 *
 * Consumers may import ONLY from `@/performance`.
 *
 * I0 foundation · I1 measurement · I2 instrumentation · I3 budgets · I4 workloads · I5 domain waves · I6 cross-domain · I7 C-OPT/C-CMP · I8 C-GRD · I9 integrity.
 *
 * @packageDocumentation
 */

export {
  PERFORMANCE_DOMAIN_ID,
  PERFORMANCE_DOMAIN_NAME,
  PERFORMANCE_DOMAIN_ARCHITECTURAL_ROLE,
  PERFORMANCE_DOMAIN_MOTTO,
  PERFORMANCE_OWNERSHIP_PRINCIPLE,
  PERFORMANCE_FOUNDATION_PHASE,
  PERFORMANCE_FOUNDATION_STATUS,
} from "./foundation";

export type {
  PerformanceFoundationIdentity,
  PerformanceFoundationStatus,
} from "./foundation";

export {
  PERFORMANCE_COMPONENT_C_COL,
  PERFORMANCE_COMPONENT_C_AGG,
  PERFORMANCE_MEASUREMENT_PHASE,
  PERFORMANCE_MEASUREMENT_STATUS,
  validateObservationInput,
  collectObservation,
  createCollectionBatch,
  appendObservation,
  collectObservations,
  aggregateBatch,
  collectThenAggregate,
} from "./measurement";

export type {
  PerformanceMeasurementStatus,
  MeasurementObservationInput,
  MeasurementObservation,
  CollectionBatch,
  AggregatedSignalView,
  AggregationView,
  MeasurementCoreResult,
} from "./measurement";

export {
  PERFORMANCE_INSTRUMENTATION_PHASE,
  PERFORMANCE_INSTRUMENTATION_STATUS,
  PERFORMANCE_SEAM_REGISTRY,
  getSeamDescriptor,
  listImplementedSeams,
  listUnavailableOrDeferredSeams,
  ENGINE_PUBLIC_OPERATION_LABELS,
  isEnginePublicOperationLabel,
  observeEnginePublicSurface,
  observeDataPublicSurface,
  observeUxPublicSurface,
  observePassivePublicTiming,
  bindAdapterObservations,
  observeSupportedPublicSeams,
} from "./instrumentation";

export type {
  PerformanceInstrumentationStatus,
  PerformanceSeamId,
  PerformanceSeamAvailability,
  PerformanceSeamDescriptor,
  AdapterObservationBatch,
  PassivePublicTimingInput,
  EnginePublicOperationLabel,
} from "./instrumentation";

export {
  PERFORMANCE_COMPONENT_C_BUD,
  PERFORMANCE_BUDGET_PHASE,
  PERFORMANCE_BUDGET_STATUS,
  validateBudgetDefinition,
  createBudgetRegistry,
  evaluateBudget,
  evaluateBudgets,
  collectAggregateThenEvaluateBudget,
} from "./budgets";

export type {
  PerformanceBudgetStatus,
  BudgetStatistic,
  BudgetComparator,
  BudgetDefinitionKind,
  BudgetDefinition,
  BudgetEvaluationOutcome,
  BudgetEvaluationResult,
  BudgetRegistrySnapshot,
  BudgetCoreResult,
  BudgetRegistry,
  MeasureAndEvaluateResult,
} from "./budgets";

export {
  PERFORMANCE_COMPONENT_C_WL,
  PERFORMANCE_COMPONENT_C_BASE,
  PERFORMANCE_COMPONENT_C_EVD,
  PERFORMANCE_WORKLOAD_PHASE,
  PERFORMANCE_WORKLOAD_STATUS,
  validateWorkloadDefinition,
  isConditionalWorkloadSource,
  runWorkloadHarness,
  createBaselineEvidence,
  createBaselineRegistry,
  compareBaselineComparability,
  runWorkloadAndCreateBaseline,
} from "./workloads";

export type {
  PerformanceWorkloadStatus,
  WorkloadKind,
  WorkloadClass,
  WorkloadDefinition,
  WorkloadRunConfig,
  WorkloadRunResult,
  BaselineEvidence,
  PerformanceBaseline,
  BaselineComparisonOutcome,
  BaselineComparisonResult,
  WorkloadCoreResult,
  BaselineRegistry,
} from "./workloads";

export {
  PERFORMANCE_DOMAIN_WAVE_PHASE,
  PERFORMANCE_DOMAIN_WAVE_STATUS,
  PERFORMANCE_MEASUREMENT_DOMAINS,
  isPerformanceMeasurementDomain,
  listActiveDomainWaveTargets,
  listConditionalDomainWaveTargets,
  getDomainWaveTarget,
  observeSingleDomainSurface,
  runDomainMeasurementWave,
  rejectCrossDomainWaveAttempt,
} from "./domain-waves";

export type {
  PerformanceDomainWaveStatus,
  PerformanceMeasurementDomain,
  DomainWaveOutcome,
  DomainWaveRequest,
  DomainWaveResult,
  DomainWaveCoreResult,
  DomainWaveTargetKind,
  DomainWaveTargetDescriptor,
} from "./domain-waves";

export {
  PERFORMANCE_CROSS_DOMAIN_PHASE,
  PERFORMANCE_CROSS_DOMAIN_STATUS,
  PRIMARY_CROSS_DOMAIN_SCENARIO,
  CROSS_DOMAIN_SCENARIO_CATALOG,
  getCrossDomainScenario,
  listCrossDomainScenarios,
  validateCrossDomainScenario,
  isUnsupportedOptionalSequence,
  observeDomainSequence,
  runCrossDomainScenario,
  rejectUnsupportedCrossDomainPath,
} from "./cross-domain";

export type {
  PerformanceCrossDomainStatus,
  CrossDomainScenarioKind,
  CrossDomainScenarioDefinition,
  CrossDomainScenarioOutcome,
  CrossDomainScenarioRequest,
  DomainStepObservation,
  CrossDomainScenarioResult,
  SequenceValidation,
  CrossDomainObservationBundle,
} from "./cross-domain";

export {
  PERFORMANCE_COMPONENT_C_OPT,
  PERFORMANCE_COMPONENT_C_CMP,
  PERFORMANCE_OPTIMIZE_PHASE,
  PERFORMANCE_OPTIMIZE_STATUS,
  validateOptimizationCandidate,
  assessOptimizationEligibility,
  createFixtureOptimizationStore,
  compareBeforeAfter,
  runOptimizationWave,
} from "./opt-waves";

export type {
  PerformanceOptimizeStatus,
  OptimizationCandidateKind,
  OptimizationMechanism,
  OptimizationTargetScope,
  OptimizationStatistic,
  OptimizationExpectedEffect,
  OptimizationCandidate,
  OptimizationEvidenceContext,
  OptimizationEligibilityOutcome,
  OptimizationEligibilityResult,
  ComparisonOutcome,
  ComparisonResult,
  OptimizationWaveOutcome,
  OptimizationWaveResult,
  OptimizeCoreResult,
  FixtureOptimizationStore,
  CompareBeforeAfterInput,
  RunOptimizationWaveInput,
} from "./opt-waves";

export {
  PERFORMANCE_COMPONENT_C_GRD,
  PERFORMANCE_GATES_PHASE,
  PERFORMANCE_GATES_STATUS,
  validateGateDefinition,
  evaluateGateReadiness,
  gateOutcomeRequiresCiFailure,
} from "./gates";

export type {
  PerformanceGatesStatus,
  GateDefinitionKind,
  GateDefinition,
  GateEvidencePackage,
  GateOutcome,
  GateEvaluationResult,
  GateCoreResult,
} from "./gates";

export {
  PERFORMANCE_HARDENING_PHASE,
  PERFORMANCE_HARDENING_STATUS,
} from "./integrity";

export type { PerformanceHardeningStatus } from "./integrity";
