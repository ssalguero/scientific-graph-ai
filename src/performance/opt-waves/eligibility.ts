/**
 * PERFORMANCE-I7 — C-OPT evidence gate / eligibility.
 *
 * NO EVIDENCE → NO OPTIMIZATION.
 */

import type {
  OptimizationCandidate,
  OptimizationEligibilityResult,
  OptimizationEvidenceContext,
} from "./types";
import { validateOptimizationCandidate } from "./candidate";

const CONDITIONAL_SCOPES = new Set(["ai", "collab", "plugins"]);

/**
 * Assess whether a candidate may execute.
 * Does not execute optimization.
 */
export function assessOptimizationEligibility(
  candidate: OptimizationCandidate,
  evidence: OptimizationEvidenceContext | null | undefined,
): OptimizationEligibilityResult {
  const validated = validateOptimizationCandidate(candidate);
  if (!validated.ok) {
    return {
      outcome: "BLOCKED",
      reason: validated.error,
      candidateId: candidate.candidateId || "(invalid)",
    };
  }
  const c = validated.value;

  if (evidence == null) {
    return {
      outcome: "EVIDENCE_DEPENDENCY",
      reason: "NO EVIDENCE → NO OPTIMIZATION — evidence context missing",
      candidateId: c.candidateId,
    };
  }

  if (!evidence.reproducible) {
    return {
      outcome: "INCONCLUSIVE",
      reason: "evidence not reproducible — cannot gate optimization",
      candidateId: c.candidateId,
    };
  }

  if (
    !evidence.beforeAggregation ||
    evidence.beforeAggregation.observationCount <= 0
  ) {
    return {
      outcome: "EVIDENCE_DEPENDENCY",
      reason: "NO EVIDENCE → NO OPTIMIZATION — empty/missing before aggregation",
      candidateId: c.candidateId,
    };
  }

  if (!evidence.workloadId.trim()) {
    return {
      outcome: "BLOCKED",
      reason: "workload identity required",
      candidateId: c.candidateId,
    };
  }

  if (evidence.workloadId.trim() !== c.workloadId) {
    return {
      outcome: "BLOCKED",
      reason: "candidate workloadId does not match evidence workloadId",
      candidateId: c.candidateId,
    };
  }

  if (evidence.baseline) {
    if (evidence.baseline.isBudget) {
      return {
        outcome: "BLOCKED",
        reason: "baseline must not be treated as budget",
        candidateId: c.candidateId,
      };
    }
    if (evidence.baseline.workloadId !== c.workloadId) {
      return {
        outcome: "BLOCKED",
        reason: "baseline workload identity incompatible with candidate",
        candidateId: c.candidateId,
      };
    }
  }

  if (CONDITIONAL_SCOPES.has(c.targetScope)) {
    return {
      outcome: "CONDITIONAL",
      reason: `EVIDENCE_DEPENDENCY: targetScope '${c.targetScope}' has no authorized public optimization surface`,
      candidateId: c.candidateId,
    };
  }

  if (c.mechanism === "peer-public") {
    return {
      outcome: "EVIDENCE_DEPENDENCY",
      reason:
        "peer-public optimization surface not authorized for mutation in I7 — no fabricated peer opt API",
      candidateId: c.candidateId,
    };
  }

  const signal = evidence.beforeAggregation.signals.find(
    (s) =>
      s.sourceLabel === c.sourceLabel && s.signalName === c.signalName,
  );
  if (!signal) {
    return {
      outcome: "INCONCLUSIVE",
      reason: `signal ${c.sourceLabel}/${c.signalName} absent from before aggregation`,
      candidateId: c.candidateId,
    };
  }

  // fixture-controlled + fixture scope only reaches here after checks
  return {
    outcome: "ELIGIBLE",
    reason: "evidence present; fixture-controlled mechanism eligible",
    candidateId: c.candidateId,
  };
}
