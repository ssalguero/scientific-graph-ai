/**
 * PERFORMANCE-I7 — Optimization waves barrel (C-OPT / C-CMP).
 */

export {
  PERFORMANCE_COMPONENT_C_OPT,
  PERFORMANCE_COMPONENT_C_CMP,
  PERFORMANCE_OPTIMIZE_PHASE,
  PERFORMANCE_OPTIMIZE_STATUS,
} from "./identity";

export type { PerformanceOptimizeStatus } from "./identity";

export type {
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
} from "./types";

export { validateOptimizationCandidate } from "./candidate";
export { assessOptimizationEligibility } from "./eligibility";
export { createFixtureOptimizationStore } from "./fixture-store";
export type { FixtureOptimizationStore } from "./fixture-store";
export { compareBeforeAfter } from "./compare";
export type { CompareBeforeAfterInput } from "./compare";
export { runOptimizationWave } from "./wave";
export type { RunOptimizationWaveInput } from "./wave";
