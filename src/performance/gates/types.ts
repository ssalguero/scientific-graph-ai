/**
 * PERFORMANCE-I8 — Gate-readiness types (C-GRD).
 *
 * Consumes C-CMP / C-BUD / C-BASE evidence. Does not invent thresholds.
 * NO REQUIRED EVIDENCE → NO GATE PASS.
 */

import type { BudgetEvaluationResult } from "../budgets/types";
import type { ComparisonResult } from "../opt-waves/types";
import type { PerformanceBaseline } from "../workloads/types";

export type GateDefinitionKind = "fixture" | "definition";

export type GateDefinition = {
  readonly gateId: string;
  readonly label: string;
  readonly kind: GateDefinitionKind;
  /** When true, a C-CMP ComparisonResult is required. */
  readonly requireComparison: boolean;
  /** When true, a C-BUD evaluation result is required. */
  readonly requireBudget: boolean;
  /** When true, a C-BASE baseline with provenance is required. */
  readonly requireBaseline: boolean;
  /** When true, workload identity must be present. */
  readonly requireWorkloadId: boolean;
};

/**
 * Evidence package assembled from prior phases — not created by the gate.
 */
export type GateEvidencePackage = {
  readonly workloadId?: string;
  readonly domainOrScenarioId?: string;
  readonly comparison?: ComparisonResult | null;
  readonly budgetEvaluation?: BudgetEvaluationResult | null;
  readonly baseline?: PerformanceBaseline | null;
  readonly reproducible?: boolean;
  /** False when measurement/scenario did not complete. */
  readonly measured?: boolean;
};

export type GateOutcome =
  | "PASS"
  | "FAIL"
  | "BLOCKED"
  | "INCONCLUSIVE"
  | "EVIDENCE_DEPENDENCY"
  | "CONDITIONAL";

export type GateEvaluationResult = {
  readonly gateId: string;
  readonly outcome: GateOutcome;
  readonly reason: string;
  readonly comparisonOutcome?: string;
  readonly budgetOutcome?: string;
  readonly ciShouldFail: boolean;
};

export type GateCoreResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: string };
