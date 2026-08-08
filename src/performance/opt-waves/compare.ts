/**
 * PERFORMANCE-I7 — C-CMP before/after comparison (conservative attribution).
 */

import type { AggregationView, AggregatedSignalView } from "../measurement/types";
import type {
  ComparisonResult,
  OptimizationCandidate,
  OptimizationStatistic,
} from "./types";

const readStatistic = (
  signal: AggregatedSignalView,
  statistic: OptimizationStatistic,
): number => {
  switch (statistic) {
    case "count":
      return signal.count;
    case "sum":
      return signal.sum;
    case "min":
      return signal.min;
    case "max":
      return signal.max;
    default: {
      const _exhaustive: never = statistic;
      return _exhaustive;
    }
  }
};

export type CompareBeforeAfterInput = {
  readonly candidate: OptimizationCandidate;
  readonly before: AggregationView | null | undefined;
  readonly after: AggregationView | null | undefined;
  readonly beforeWorkloadId: string;
  readonly afterWorkloadId: string;
  /** True only when an authorized mechanism actually executed. */
  readonly mechanismExecuted: boolean;
};

/**
 * Compare before/after aggregations for a candidate.
 * Never reports IMPROVED without compatible context.
 * Attribution is conservative.
 */
export function compareBeforeAfter(
  input: CompareBeforeAfterInput,
): ComparisonResult {
  const { candidate, before, after } = input;

  if (before == null || after == null) {
    return {
      outcome: "INCONCLUSIVE",
      reason: "missing before/after aggregation",
      attributed: false,
    };
  }

  if (
    !input.beforeWorkloadId.trim() ||
    input.beforeWorkloadId !== input.afterWorkloadId ||
    input.beforeWorkloadId !== candidate.workloadId
  ) {
    return {
      outcome: "BLOCKED",
      reason: "workload identity incompatible — not comparable",
      attributed: false,
    };
  }

  if (before.observationCount <= 0 || after.observationCount <= 0) {
    return {
      outcome: "INCONCLUSIVE",
      reason: "incomplete aggregation evidence",
      attributed: false,
    };
  }

  const beforeSignal = before.signals.find(
    (s) =>
      s.sourceLabel === candidate.sourceLabel &&
      s.signalName === candidate.signalName,
  );
  const afterSignal = after.signals.find(
    (s) =>
      s.sourceLabel === candidate.sourceLabel &&
      s.signalName === candidate.signalName,
  );

  if (!beforeSignal || !afterSignal) {
    return {
      outcome: "EVIDENCE_DEPENDENCY",
      reason: "required signal missing from before/after aggregation",
      attributed: false,
    };
  }

  const beforeValue = readStatistic(beforeSignal, candidate.statistic);
  const afterValue = readStatistic(afterSignal, candidate.statistic);

  if (!Number.isFinite(beforeValue) || !Number.isFinite(afterValue)) {
    return {
      outcome: "INCONCLUSIVE",
      reason: "non-finite statistic values — comparison integrity failure",
      beforeValue,
      afterValue,
      attributed: false,
    };
  }

  if (beforeValue === afterValue) {
    return {
      outcome: "UNCHANGED",
      reason: "observed statistic unchanged",
      beforeValue,
      afterValue,
      attributed: false,
    };
  }

  const movedDown = afterValue < beforeValue;
  const movedUp = afterValue > beforeValue;
  const matchesExpected =
    (candidate.expectedEffect === "decrease" && movedDown) ||
    (candidate.expectedEffect === "increase" && movedUp);

  if (!matchesExpected) {
    return {
      outcome: "REGRESSED",
      reason: `observed change opposes expectedEffect '${candidate.expectedEffect}'`,
      beforeValue,
      afterValue,
      attributed: input.mechanismExecuted,
    };
  }

  if (!input.mechanismExecuted) {
    return {
      outcome: "INCONCLUSIVE",
      reason:
        "observed change matches expected direction but mechanism did not execute — no causal attribution",
      beforeValue,
      afterValue,
      attributed: false,
    };
  }

  return {
    outcome: "IMPROVED",
    reason: "compatible before/after change matches expectedEffect after executed mechanism",
    beforeValue,
    afterValue,
    attributed: true,
  };
}
