/**
 * PERFORMANCE-I4 — Minimal baseline comparison primitive (not C-CMP / regression).
 *
 * Only checks whether two baselines are comparable by workload identity and evidence.
 * Does not evaluate budgets or declare regressions.
 */

import type {
  BaselineComparisonResult,
  PerformanceBaseline,
} from "./types";

export function compareBaselineComparability(
  left: PerformanceBaseline | null | undefined,
  right: PerformanceBaseline | null | undefined,
): BaselineComparisonResult {
  if (left == null || right == null) {
    return {
      outcome: "INCONCLUSIVE",
      reason: "missing baseline — comparison not established",
    };
  }

  if (left.isBudget || right.isBudget) {
    return {
      outcome: "BLOCKED",
      reason: "baseline must not be treated as budget",
      leftBaselineId: left.baselineId,
      rightBaselineId: right.baselineId,
    };
  }

  if (!left.evidence.reproducible || !right.evidence.reproducible) {
    return {
      outcome: "INCONCLUSIVE",
      reason: "reproducibility not established for one or both baselines",
      leftBaselineId: left.baselineId,
      rightBaselineId: right.baselineId,
    };
  }

  if (left.workloadId !== right.workloadId) {
    return {
      outcome: "BLOCKED",
      reason: "baselines belong to different workloads — not comparable",
      leftBaselineId: left.baselineId,
      rightBaselineId: right.baselineId,
    };
  }

  if (
    left.aggregation.observationCount <= 0 ||
    right.aggregation.observationCount <= 0
  ) {
    return {
      outcome: "INCONCLUSIVE",
      reason: "incomplete aggregation evidence",
      leftBaselineId: left.baselineId,
      rightBaselineId: right.baselineId,
    };
  }

  return {
    outcome: "COMPARABLE",
    reason: "same workload identity with reproducible evidence",
    leftBaselineId: left.baselineId,
    rightBaselineId: right.baselineId,
  };
}
