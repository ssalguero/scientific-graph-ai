/**
 * PERFORMANCE-I4 — Workloads / baselines / evidence barrel.
 */

export {
  PERFORMANCE_COMPONENT_C_WL,
  PERFORMANCE_COMPONENT_C_BASE,
  PERFORMANCE_COMPONENT_C_EVD,
  PERFORMANCE_WORKLOAD_PHASE,
  PERFORMANCE_WORKLOAD_STATUS,
} from "./identity";

export type { PerformanceWorkloadStatus } from "./identity";

export type {
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
} from "./types";

export {
  validateWorkloadDefinition,
  isConditionalWorkloadSource,
} from "./workload";

export { runWorkloadHarness } from "./harness";

export { createBaselineEvidence } from "./evidence";

export { createBaselineRegistry } from "./baseline";
export type { BaselineRegistry } from "./baseline";

export { compareBaselineComparability } from "./compare";

export { runWorkloadAndCreateBaseline } from "./pipeline";
