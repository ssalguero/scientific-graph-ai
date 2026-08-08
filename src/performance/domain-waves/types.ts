/**
 * PERFORMANCE-I5 — Domain-scoped measurement wave types.
 *
 * Domains are measurement targets, not PERFORMANCE-owned product packages.
 * Cross-domain scenarios belong to I6 — not represented here as executable waves.
 */

import type { BudgetEvaluationResult } from "../budgets/types";
import type { AggregationView } from "../measurement/types";
import type {
  BaselineEvidence,
  PerformanceBaseline,
  WorkloadDefinition,
} from "../workloads/types";

/** Peer baseline domains eligible as I5 measurement targets. */
export type PerformanceMeasurementDomain =
  | "engine"
  | "data"
  | "ux"
  | "ai"
  | "collab"
  | "plugins";

/**
 * P8-aligned wave outcomes plus CONDITIONAL for unavailable peer prerequisites.
 * Missing evidence never becomes PASS.
 */
export type DomainWaveOutcome =
  | "PASS"
  | "FAIL"
  | "BLOCKED"
  | "INCONCLUSIVE"
  | "EVIDENCE_DEPENDENCY"
  | "CONDITIONAL";

export type DomainWaveRequest = {
  readonly domain: PerformanceMeasurementDomain;
  readonly runId: string;
  readonly collectedAtMs: number;
  /**
   * Optional registered budget id. When omitted, measurement may complete
   * without inventing a budget decision (budgetEvaluation remains null).
   */
  readonly budgetId?: string;
  /** Required when budgetId is set. */
  readonly budgetRegistry?: {
    get(budgetId: string):
      | import("../budgets/types").BudgetDefinition
      | undefined;
  };
  /** When true, create an in-memory baseline from the domain aggregation. */
  readonly createBaseline?: boolean;
  readonly baselineId?: string;
  readonly baselineRegistry?: import("../workloads/baseline").BaselineRegistry;
};

export type DomainWaveResult = {
  readonly domain: PerformanceMeasurementDomain;
  readonly outcome: DomainWaveOutcome;
  readonly reason: string;
  readonly runId: string;
  readonly workload: WorkloadDefinition | null;
  readonly aggregation: AggregationView | null;
  /** null when no budget was requested or evaluation was skipped. */
  readonly budgetEvaluation: BudgetEvaluationResult | null;
  readonly baseline: PerformanceBaseline | null;
  readonly evidence: BaselineEvidence | null;
  /** True only when C-COL → C-AGG produced a usable aggregation for this domain. */
  readonly measured: boolean;
};

export type DomainWaveCoreResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: string };

export type DomainWaveTargetKind = "active" | "conditional";

export type DomainWaveTargetDescriptor = {
  readonly domain: PerformanceMeasurementDomain;
  readonly kind: DomainWaveTargetKind;
  readonly seamId: PerformanceMeasurementDomain;
  readonly notes: string;
};
