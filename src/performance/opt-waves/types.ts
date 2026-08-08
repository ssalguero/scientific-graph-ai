/**
 * PERFORMANCE-I7 — Optimization / comparison types (C-OPT, C-CMP).
 *
 * NO EVIDENCE → NO OPTIMIZATION.
 * Peer mutation is never implied; fixture mechanisms are PERFORMANCE-owned only.
 */

import type { AggregationView } from "../measurement/types";
import type { PerformanceBaseline } from "../workloads/types";

export type OptimizationCandidateKind = "fixture" | "definition";

/**
 * Execution mechanism:
 * - fixture-controlled: PERFORMANCE-owned test harness (not a peer API)
 * - peer-public: requires an authorized peer public optimization surface (none implemented for mutation)
 */
export type OptimizationMechanism = "fixture-controlled" | "peer-public";

export type OptimizationTargetScope =
  | "fixture"
  | "engine"
  | "data"
  | "ux"
  | "ai"
  | "collab"
  | "plugins"
  | "cross-domain";

export type OptimizationStatistic = "count" | "sum" | "min" | "max";

export type OptimizationExpectedEffect = "decrease" | "increase";

export type OptimizationCandidate = {
  readonly candidateId: string;
  readonly label: string;
  readonly kind: OptimizationCandidateKind;
  readonly mechanism: OptimizationMechanism;
  readonly targetScope: OptimizationTargetScope;
  readonly workloadId: string;
  readonly sourceLabel: string;
  readonly signalName: string;
  readonly statistic: OptimizationStatistic;
  readonly expectedEffect: OptimizationExpectedEffect;
};

/** Evidence required before any optimization may execute. */
export type OptimizationEvidenceContext = {
  readonly beforeAggregation: AggregationView;
  readonly workloadId: string;
  readonly domainOrScenarioId?: string;
  readonly baseline?: PerformanceBaseline;
  readonly reproducible: boolean;
};

export type OptimizationEligibilityOutcome =
  | "ELIGIBLE"
  | "BLOCKED"
  | "INCONCLUSIVE"
  | "EVIDENCE_DEPENDENCY"
  | "CONDITIONAL";

export type OptimizationEligibilityResult = {
  readonly outcome: OptimizationEligibilityOutcome;
  readonly reason: string;
  readonly candidateId: string;
};

export type ComparisonOutcome =
  | "IMPROVED"
  | "REGRESSED"
  | "UNCHANGED"
  | "INCONCLUSIVE"
  | "EVIDENCE_DEPENDENCY"
  | "BLOCKED";

export type ComparisonResult = {
  readonly outcome: ComparisonOutcome;
  readonly reason: string;
  readonly beforeValue?: number;
  readonly afterValue?: number;
  /** Conservative: true only when mechanism + compatible context support attribution. */
  readonly attributed: boolean;
};

export type OptimizationWaveOutcome =
  | "PASS"
  | "FAIL"
  | "BLOCKED"
  | "INCONCLUSIVE"
  | "EVIDENCE_DEPENDENCY"
  | "CONDITIONAL";

export type OptimizationWaveResult = {
  readonly candidateId: string;
  readonly outcome: OptimizationWaveOutcome;
  readonly reason: string;
  readonly eligibility: OptimizationEligibilityResult;
  readonly executed: boolean;
  readonly remeasured: boolean;
  readonly beforeAggregation: AggregationView | null;
  readonly afterAggregation: AggregationView | null;
  readonly comparison: ComparisonResult | null;
};

export type OptimizeCoreResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: string };
