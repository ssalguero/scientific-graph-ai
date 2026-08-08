/**
 * PERFORMANCE-I8 — C-GRD gate evaluation.
 *
 * Consumes C-CMP / C-BUD / C-BASE results. Never invents numeric thresholds.
 * Never transforms INCONCLUSIVE/BLOCKED/EVIDENCE_DEPENDENCY into PASS.
 */

import { validateGateDefinition } from "./definition";
import type {
  GateDefinition,
  GateEvaluationResult,
  GateEvidencePackage,
  GateOutcome,
} from "./types";

const CONDITIONAL_MARKERS = new Set(["ai", "collab", "plugins"]);

function failCi(outcome: GateOutcome): boolean {
  // I9: ciShouldFail must match gateOutcomeRequiresCiFailure (no field/helper drift).
  return (
    outcome === "FAIL" ||
    outcome === "BLOCKED" ||
    outcome === "EVIDENCE_DEPENDENCY" ||
    outcome === "INCONCLUSIVE" ||
    outcome === "CONDITIONAL"
  );
}

function mapNonPass(
  gateId: string,
  outcome: GateOutcome,
  reason: string,
  extras?: Partial<GateEvaluationResult>,
): GateEvaluationResult {
  return {
    gateId,
    outcome,
    reason,
    ciShouldFail: failCi(outcome),
    ...extras,
  };
}

/**
 * Evaluate gate readiness from an evidence package.
 * Does not run measurement, optimization, or peer code.
 */
export function evaluateGateReadiness(
  gate: GateDefinition,
  evidence: GateEvidencePackage | null | undefined,
): GateEvaluationResult {
  const validated = validateGateDefinition(gate);
  if (!validated.ok) {
    return mapNonPass(gate.gateId || "(invalid)", "BLOCKED", validated.error);
  }
  const g = validated.value;

  if (evidence == null) {
    return mapNonPass(
      g.gateId,
      "EVIDENCE_DEPENDENCY",
      "NO REQUIRED EVIDENCE → NO GATE PASS — evidence package missing",
    );
  }

  if (evidence.measured !== true) {
    return mapNonPass(
      g.gateId,
      "INCONCLUSIVE",
      "measurement/scenario completion not affirmed (measured !== true) — never PASS",
    );
  }

  if (
    evidence.domainOrScenarioId &&
    CONDITIONAL_MARKERS.has(evidence.domainOrScenarioId)
  ) {
    return mapNonPass(
      g.gateId,
      "CONDITIONAL",
      `EVIDENCE_DEPENDENCY: conditional domain '${evidence.domainOrScenarioId}' — gate cannot assume availability`,
    );
  }

  if (g.requireWorkloadId) {
    if (!evidence.workloadId?.trim()) {
      return mapNonPass(
        g.gateId,
        "EVIDENCE_DEPENDENCY",
        "workload identity required — missing",
      );
    }
  }

  if (g.requireBaseline) {
    if (!evidence.baseline) {
      return mapNonPass(
        g.gateId,
        "EVIDENCE_DEPENDENCY",
        "baseline required — missing",
      );
    }
    if (evidence.baseline.isBudget) {
      return mapNonPass(
        g.gateId,
        "BLOCKED",
        "baseline must not be treated as budget",
      );
    }
    if (evidence.reproducible === false || !evidence.baseline.evidence.reproducible) {
      return mapNonPass(
        g.gateId,
        "INCONCLUSIVE",
        "baseline provenance not reproducible",
      );
    }
    if (
      g.requireWorkloadId &&
      evidence.workloadId &&
      evidence.baseline.workloadId !== evidence.workloadId
    ) {
      return mapNonPass(
        g.gateId,
        "BLOCKED",
        "baseline workload identity incompatible",
      );
    }
  }

  let comparisonOutcome: string | undefined;
  if (g.requireComparison) {
    if (evidence.comparison == null) {
      return mapNonPass(
        g.gateId,
        "EVIDENCE_DEPENDENCY",
        "C-CMP comparison required — missing",
      );
    }
    comparisonOutcome = evidence.comparison.outcome;

    if (evidence.comparison.outcome === "REGRESSED") {
      return mapNonPass(g.gateId, "FAIL", `regression explicit — ${evidence.comparison.reason}`, {
        comparisonOutcome,
      });
    }
    if (evidence.comparison.outcome === "BLOCKED") {
      return mapNonPass(g.gateId, "BLOCKED", evidence.comparison.reason, {
        comparisonOutcome,
      });
    }
    if (evidence.comparison.outcome === "EVIDENCE_DEPENDENCY") {
      return mapNonPass(
        g.gateId,
        "EVIDENCE_DEPENDENCY",
        evidence.comparison.reason,
        { comparisonOutcome },
      );
    }
    if (evidence.comparison.outcome === "INCONCLUSIVE") {
      return mapNonPass(
        g.gateId,
        "INCONCLUSIVE",
        evidence.comparison.reason,
        { comparisonOutcome },
      );
    }
    // IMPROVED | UNCHANGED are acceptable comparison states for gate PASS
    if (
      evidence.comparison.outcome !== "IMPROVED" &&
      evidence.comparison.outcome !== "UNCHANGED"
    ) {
      return mapNonPass(
        g.gateId,
        "INCONCLUSIVE",
        `unsupported comparison outcome '${evidence.comparison.outcome}'`,
        { comparisonOutcome },
      );
    }
    // I9: IMPROVED without attribution cannot silently PASS a gate.
    if (
      evidence.comparison.outcome === "IMPROVED" &&
      evidence.comparison.attributed !== true
    ) {
      return mapNonPass(
        g.gateId,
        "INCONCLUSIVE",
        "IMPROVED comparison without attribution — never PASS",
        { comparisonOutcome },
      );
    }
  }

  let budgetOutcome: string | undefined;
  if (g.requireBudget) {
    if (evidence.budgetEvaluation == null) {
      return mapNonPass(
        g.gateId,
        "EVIDENCE_DEPENDENCY",
        "C-BUD evaluation required — missing (no invented thresholds)",
      );
    }
    budgetOutcome = evidence.budgetEvaluation.outcome;
    if (evidence.budgetEvaluation.outcome === "FAIL") {
      return mapNonPass(
        g.gateId,
        "FAIL",
        `budget FAIL — ${evidence.budgetEvaluation.reason}`,
        { comparisonOutcome, budgetOutcome },
      );
    }
    if (evidence.budgetEvaluation.outcome === "BLOCKED") {
      return mapNonPass(
        g.gateId,
        "BLOCKED",
        evidence.budgetEvaluation.reason,
        { comparisonOutcome, budgetOutcome },
      );
    }
    if (evidence.budgetEvaluation.outcome === "EVIDENCE_DEPENDENCY") {
      return mapNonPass(
        g.gateId,
        "EVIDENCE_DEPENDENCY",
        evidence.budgetEvaluation.reason,
        { comparisonOutcome, budgetOutcome },
      );
    }
    if (evidence.budgetEvaluation.outcome === "INCONCLUSIVE") {
      return mapNonPass(
        g.gateId,
        "INCONCLUSIVE",
        evidence.budgetEvaluation.reason,
        { comparisonOutcome, budgetOutcome },
      );
    }
    if (evidence.budgetEvaluation.outcome !== "PASS") {
      return mapNonPass(
        g.gateId,
        "INCONCLUSIVE",
        `unsupported budget outcome '${evidence.budgetEvaluation.outcome}'`,
        { comparisonOutcome, budgetOutcome },
      );
    }
  }

  return {
    gateId: g.gateId,
    outcome: "PASS",
    reason: "gate prerequisites satisfied; comparison/budget/baseline evidence accepted",
    comparisonOutcome,
    budgetOutcome,
    ciShouldFail: false,
  };
}

/**
 * Map gate outcome to process exit semantics for CI.
 * Required non-PASS outcomes must fail CI (aligned with ciShouldFail).
 */
export function gateOutcomeRequiresCiFailure(
  result: GateEvaluationResult,
): boolean {
  return result.ciShouldFail || result.outcome !== "PASS";
}
