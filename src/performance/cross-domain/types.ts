/**
 * PERFORMANCE-I6 — Cross-domain scenario types.
 *
 * Scenarios are PERFORMANCE-owned measurement definitions.
 * They do not own peer lifecycle, state, or contracts.
 */

import type { BudgetEvaluationResult } from "../budgets/types";
import type { AggregationView } from "../measurement/types";
import type { PerformanceMeasurementDomain } from "../domain-waves/types";
import type {
  BaselineEvidence,
  PerformanceBaseline,
  WorkloadDefinition,
} from "../workloads/types";

export type CrossDomainScenarioKind = "fixture" | "definition";

export type CrossDomainScenarioDefinition = {
  readonly scenarioId: string;
  readonly label: string;
  readonly kind: CrossDomainScenarioKind;
  /** Explicit ordered domain sequence (e.g. ux → engine → data). */
  readonly domainSequence: readonly PerformanceMeasurementDomain[];
};

export type CrossDomainScenarioOutcome =
  | "PASS"
  | "FAIL"
  | "BLOCKED"
  | "INCONCLUSIVE"
  | "EVIDENCE_DEPENDENCY"
  | "CONDITIONAL";

export type CrossDomainScenarioRequest = {
  readonly scenario: CrossDomainScenarioDefinition;
  readonly runId: string;
  readonly collectedAtMs: number;
  readonly budgetId?: string;
  readonly budgetRegistry?: {
    get(budgetId: string):
      | import("../budgets/types").BudgetDefinition
      | undefined;
  };
  readonly createBaseline?: boolean;
  readonly baselineId?: string;
  readonly baselineRegistry?: import("../workloads/baseline").BaselineRegistry;
};

export type DomainStepObservation = {
  readonly domain: PerformanceMeasurementDomain;
  readonly order: number;
  readonly observationCount: number;
};

export type CrossDomainScenarioResult = {
  readonly scenarioId: string;
  readonly outcome: CrossDomainScenarioOutcome;
  readonly reason: string;
  readonly runId: string;
  readonly domainSequence: readonly PerformanceMeasurementDomain[];
  readonly steps: readonly DomainStepObservation[];
  readonly workload: WorkloadDefinition | null;
  readonly aggregation: AggregationView | null;
  readonly budgetEvaluation: BudgetEvaluationResult | null;
  readonly baseline: PerformanceBaseline | null;
  readonly evidence: BaselineEvidence | null;
  /** True only when every sequence step was observed and aggregated. */
  readonly measured: boolean;
};
