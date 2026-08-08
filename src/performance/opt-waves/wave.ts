/**
 * PERFORMANCE-I7 — Optimization wave runner (C-OPT + C-CMP).
 *
 * Lifecycle: evidence gate → (optional) fixture execute → re-measure → compare.
 * Never mutates peers. Never invents peer optimization APIs.
 */

import { assessOptimizationEligibility } from "./eligibility";
import { compareBeforeAfter } from "./compare";
import type { FixtureOptimizationStore } from "./fixture-store";
import type {
  OptimizationCandidate,
  OptimizationEvidenceContext,
  OptimizationWaveResult,
} from "./types";

export type RunOptimizationWaveInput = {
  readonly candidate: OptimizationCandidate;
  readonly evidence: OptimizationEvidenceContext | null | undefined;
  /**
   * Required for fixture-controlled execution.
   * Must not be used to imply peer mutation.
   */
  readonly fixtureStore?: FixtureOptimizationStore;
  readonly adjustmentAmount?: number;
  readonly remeasureBatchId: string;
  readonly remeasureCollectedAtMs: number;
};

/**
 * Run one evidence-gated optimization wave.
 */
export function runOptimizationWave(
  input: RunOptimizationWaveInput,
): OptimizationWaveResult {
  const eligibility = assessOptimizationEligibility(
    input.candidate,
    input.evidence,
  );

  const base = {
    candidateId: input.candidate.candidateId,
    eligibility,
    executed: false,
    remeasured: false,
    beforeAggregation: input.evidence?.beforeAggregation ?? null,
    afterAggregation: null,
    comparison: null,
  };

  if (eligibility.outcome !== "ELIGIBLE") {
    const mapped =
      eligibility.outcome === "CONDITIONAL"
        ? "CONDITIONAL"
        : eligibility.outcome === "EVIDENCE_DEPENDENCY"
          ? "EVIDENCE_DEPENDENCY"
          : eligibility.outcome === "INCONCLUSIVE"
            ? "INCONCLUSIVE"
            : "BLOCKED";
    return {
      ...base,
      outcome: mapped,
      reason: eligibility.reason,
    };
  }

  if (!input.evidence) {
    return {
      ...base,
      outcome: "EVIDENCE_DEPENDENCY",
      reason: "NO EVIDENCE → NO OPTIMIZATION",
    };
  }

  if (input.candidate.mechanism !== "fixture-controlled") {
    return {
      ...base,
      outcome: "EVIDENCE_DEPENDENCY",
      reason: "only fixture-controlled mechanism is executable in I7",
    };
  }

  if (!input.fixtureStore) {
    return {
      ...base,
      outcome: "BLOCKED",
      reason: "fixtureStore required for fixture-controlled execution",
    };
  }

  const amount = input.adjustmentAmount ?? 1;
  const applied = input.fixtureStore.applyFixtureAdjustment(
    input.candidate.expectedEffect,
    amount,
  );
  if (!applied.ok) {
    return {
      ...base,
      outcome: "BLOCKED",
      reason: applied.error,
    };
  }

  const after = input.fixtureStore.measure({
    batchId: input.remeasureBatchId,
    sourceLabel: input.candidate.sourceLabel,
    signalName: input.candidate.signalName,
    collectedAtMs: input.remeasureCollectedAtMs,
  });

  if (!after.ok) {
    return {
      ...base,
      executed: true,
      remeasured: false,
      outcome: "INCONCLUSIVE",
      reason: `re-measurement failed — optimization cannot PASS: ${after.error}`,
    };
  }

  const comparison = compareBeforeAfter({
    candidate: input.candidate,
    before: input.evidence.beforeAggregation,
    after: after.value,
    beforeWorkloadId: input.evidence.workloadId,
    afterWorkloadId: input.candidate.workloadId,
    mechanismExecuted: true,
  });

  if (comparison.outcome === "IMPROVED" && comparison.attributed) {
    return {
      candidateId: input.candidate.candidateId,
      outcome: "PASS",
      reason: `optimization wave PASS — ${comparison.reason}`,
      eligibility,
      executed: true,
      remeasured: true,
      beforeAggregation: input.evidence.beforeAggregation,
      afterAggregation: after.value,
      comparison,
    };
  }

  if (comparison.outcome === "REGRESSED") {
    return {
      candidateId: input.candidate.candidateId,
      outcome: "FAIL",
      reason: `optimization wave FAIL — regression explicit: ${comparison.reason}`,
      eligibility,
      executed: true,
      remeasured: true,
      beforeAggregation: input.evidence.beforeAggregation,
      afterAggregation: after.value,
      comparison,
    };
  }

  const waveOutcome =
    comparison.outcome === "BLOCKED"
      ? "BLOCKED"
      : comparison.outcome === "EVIDENCE_DEPENDENCY"
        ? "EVIDENCE_DEPENDENCY"
        : "INCONCLUSIVE";

  return {
    candidateId: input.candidate.candidateId,
    outcome: waveOutcome,
    reason: `optimization wave ${waveOutcome} — ${comparison.reason}`,
    eligibility,
    executed: true,
    remeasured: true,
    beforeAggregation: input.evidence.beforeAggregation,
    afterAggregation: after.value,
    comparison,
  };
}
