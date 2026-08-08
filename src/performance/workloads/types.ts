/**
 * PERFORMANCE-I4 — Workload / baseline / evidence types (C-WL, C-BASE, C-EVD).
 *
 * Baseline ≠ Budget. No product workloads invented as authoritative scenarios.
 */

import type { AggregationView } from "../measurement/types";

export type WorkloadKind = "fixture" | "definition";

/** I4 isolated/baseline; I6 adds cross-domain scenario workloads. */
export type WorkloadClass = "isolated" | "baseline" | "cross-domain";

export type WorkloadDefinition = {
  readonly workloadId: string;
  readonly label: string;
  readonly kind: WorkloadKind;
  readonly workloadClass: WorkloadClass;
  /** Opaque source dimension for measurement association (not peer ownership). */
  readonly sourceLabel: string;
  readonly signalName: string;
};

export type WorkloadRunConfig = {
  readonly runId: string;
  readonly collectedAtMs: number;
  /** Explicit observation values supplied by caller/fixture — harness does not invent peer ops. */
  readonly numericValues: readonly number[];
};

export type WorkloadRunResult = {
  readonly workloadId: string;
  readonly runId: string;
  readonly aggregation: AggregationView;
  readonly collectedAtMs: number;
};

export type BaselineEvidence = {
  readonly evidenceId: string;
  readonly workloadId: string;
  readonly baselineId: string;
  readonly batchId: string;
  readonly observationCount: number;
  readonly createdAtMs: number;
  readonly reproducible: boolean;
  readonly notes: string;
};

export type PerformanceBaseline = {
  readonly baselineId: string;
  readonly workloadId: string;
  readonly aggregation: AggregationView;
  readonly evidence: BaselineEvidence;
  /** Explicit: baselines are reference observations, not budget policy. */
  readonly isBudget: false;
};

export type BaselineComparisonOutcome =
  | "COMPARABLE"
  | "INCONCLUSIVE"
  | "BLOCKED"
  | "EVIDENCE_DEPENDENCY";

export type BaselineComparisonResult = {
  readonly outcome: BaselineComparisonOutcome;
  readonly reason: string;
  readonly leftBaselineId?: string;
  readonly rightBaselineId?: string;
};

export type WorkloadCoreResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: string };
