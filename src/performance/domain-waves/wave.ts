/**
 * PERFORMANCE-I5 — Domain-scoped measurement wave runner.
 *
 * Lifecycle: Domain Workload → I2 single-domain seam → C-COL → C-AGG
 * → optional C-BUD → optional C-BASE/C-EVD.
 *
 * Not a cross-domain orchestrator. Not an optimizer. Not a CI gate.
 */

import { evaluateBudget } from "../budgets/evaluate";
import type { BudgetEvaluationResult } from "../budgets/types";
import { validateWorkloadDefinition } from "../workloads/workload";
import type {
  PerformanceBaseline,
  WorkloadDefinition,
  WorkloadRunResult,
} from "../workloads/types";
import { observeSingleDomainSurface } from "./observe";
import { getDomainWaveTarget } from "./targets";
import type {
  DomainWaveOutcome,
  DomainWaveRequest,
  DomainWaveResult,
} from "./types";

function domainWorkload(
  domain: DomainWaveRequest["domain"],
  runId: string,
): WorkloadDefinition {
  return {
    workloadId: `i5.${domain}.${runId}`,
    label: `I5 domain-scoped wave — ${domain} (measurement target, not PERFORMANCE ownership)`,
    kind: "fixture",
    workloadClass: "isolated",
    sourceLabel: domain,
    signalName: `domain.wave.${domain}`,
  };
}

function finalize(
  partial: Omit<DomainWaveResult, "outcome" | "reason"> & {
    outcome: DomainWaveOutcome;
    reason: string;
  },
): DomainWaveResult {
  return {
    domain: partial.domain,
    outcome: partial.outcome,
    reason: partial.reason,
    runId: partial.runId,
    workload: partial.workload,
    aggregation: partial.aggregation,
    budgetEvaluation: partial.budgetEvaluation,
    baseline: partial.baseline,
    evidence: partial.evidence,
    measured: partial.measured,
  };
}

/**
 * Execute one domain-scoped measurement wave.
 * Rejects multi-domain / cross-domain requests by accepting a single domain only.
 */
export function runDomainMeasurementWave(
  request: DomainWaveRequest,
): DomainWaveResult {
  const empty = {
    runId: request.runId,
    workload: null as WorkloadDefinition | null,
    aggregation: null,
    budgetEvaluation: null as BudgetEvaluationResult | null,
    baseline: null as PerformanceBaseline | null,
    evidence: null,
    measured: false,
  };

  if (!request.runId.trim()) {
    return finalize({
      ...empty,
      domain: request.domain,
      outcome: "BLOCKED",
      reason: "runId must be non-empty",
    });
  }

  if (!Number.isFinite(request.collectedAtMs)) {
    return finalize({
      ...empty,
      domain: request.domain,
      outcome: "BLOCKED",
      reason: "collectedAtMs must be finite",
    });
  }

  const target = getDomainWaveTarget(request.domain);
  if (target.kind === "conditional") {
    return finalize({
      ...empty,
      domain: request.domain,
      outcome: "CONDITIONAL",
      reason: `EVIDENCE_DEPENDENCY: domain '${request.domain}' is conditional — ${target.notes}`,
    });
  }

  const workload = domainWorkload(request.domain, request.runId.trim());
  const wl = validateWorkloadDefinition(workload);
  if (!wl.ok) {
    return finalize({
      ...empty,
      domain: request.domain,
      outcome: "BLOCKED",
      reason: wl.error,
    });
  }

  const batchId = `i5-${request.domain}-${request.runId.trim()}`;
  const measured = observeSingleDomainSurface(
    request.domain,
    batchId,
    request.collectedAtMs,
  );

  if (!measured.ok) {
    const dep = measured.error.includes("EVIDENCE_DEPENDENCY");
    return finalize({
      ...empty,
      domain: request.domain,
      workload: wl.value,
      outcome: dep ? "EVIDENCE_DEPENDENCY" : "BLOCKED",
      reason: measured.error,
    });
  }

  if (measured.value.observationCount <= 0) {
    return finalize({
      ...empty,
      domain: request.domain,
      workload: wl.value,
      aggregation: measured.value,
      outcome: "INCONCLUSIVE",
      reason: "empty aggregation — domain measurement incomplete; never PASS",
    });
  }

  let budgetEvaluation: BudgetEvaluationResult | null = null;
  if (request.budgetId !== undefined) {
    if (!request.budgetId.trim()) {
      return finalize({
        ...empty,
        domain: request.domain,
        workload: wl.value,
        aggregation: measured.value,
        measured: true,
        outcome: "BLOCKED",
        reason: "budgetId must be non-empty when provided",
      });
    }
    if (!request.budgetRegistry) {
      return finalize({
        ...empty,
        domain: request.domain,
        workload: wl.value,
        aggregation: measured.value,
        measured: true,
        outcome: "BLOCKED",
        reason: "budgetRegistry required when budgetId is set",
      });
    }
    const budget = request.budgetRegistry.get(request.budgetId.trim());
    if (!budget) {
      return finalize({
        ...empty,
        domain: request.domain,
        workload: wl.value,
        aggregation: measured.value,
        measured: true,
        outcome: "INCONCLUSIVE",
        reason: `budget '${request.budgetId.trim()}' not registered — no invented threshold; never PASS`,
      });
    }
    if (budget.sourceLabel !== request.domain) {
      return finalize({
        ...empty,
        domain: request.domain,
        workload: wl.value,
        aggregation: measured.value,
        measured: true,
        outcome: "BLOCKED",
        reason: `budget sourceLabel '${budget.sourceLabel}' does not match domain '${request.domain}'`,
      });
    }
    budgetEvaluation = evaluateBudget(budget, measured.value);
  }

  let baseline: PerformanceBaseline | null = null;
  let evidence = null as DomainWaveResult["evidence"];

  if (request.createBaseline) {
    if (!request.baselineRegistry || !request.baselineId?.trim()) {
      return finalize({
        domain: request.domain,
        runId: request.runId.trim(),
        workload: wl.value,
        aggregation: measured.value,
        budgetEvaluation,
        baseline: null,
        evidence: null,
        measured: true,
        outcome: "BLOCKED",
        reason: "createBaseline requires baselineId and baselineRegistry",
      });
    }

    const run: WorkloadRunResult = {
      workloadId: wl.value.workloadId,
      runId: request.runId.trim(),
      aggregation: measured.value,
      collectedAtMs: request.collectedAtMs,
    };
    const created = request.baselineRegistry.createFromRun(
      request.baselineId.trim(),
      run,
      {
        reproducible: true,
        notes: `I5 domain wave baseline for ${request.domain}`,
      },
    );
    if (!created.ok) {
      return finalize({
        domain: request.domain,
        runId: request.runId.trim(),
        workload: wl.value,
        aggregation: measured.value,
        budgetEvaluation,
        baseline: null,
        evidence: null,
        measured: true,
        outcome: "INCONCLUSIVE",
        reason: created.error,
      });
    }
    baseline = created.value;
    evidence = created.value.evidence;
  }

  if (budgetEvaluation) {
    if (budgetEvaluation.outcome === "PASS") {
      return finalize({
        domain: request.domain,
        runId: request.runId.trim(),
        workload: wl.value,
        aggregation: measured.value,
        budgetEvaluation,
        baseline,
        evidence,
        measured: true,
        outcome: "PASS",
        reason: `domain '${request.domain}' measured; budget ${budgetEvaluation.outcome}`,
      });
    }
    if (budgetEvaluation.outcome === "FAIL") {
      return finalize({
        domain: request.domain,
        runId: request.runId.trim(),
        workload: wl.value,
        aggregation: measured.value,
        budgetEvaluation,
        baseline,
        evidence,
        measured: true,
        outcome: "FAIL",
        reason: `domain '${request.domain}' measured; budget FAIL — ${budgetEvaluation.reason}`,
      });
    }
    return finalize({
      domain: request.domain,
      runId: request.runId.trim(),
      workload: wl.value,
      aggregation: measured.value,
      budgetEvaluation,
      baseline,
      evidence,
      measured: true,
      outcome: budgetEvaluation.outcome,
      reason: `domain '${request.domain}' measured; budget ${budgetEvaluation.outcome} — ${budgetEvaluation.reason}`,
    });
  }

  return finalize({
    domain: request.domain,
    runId: request.runId.trim(),
    workload: wl.value,
    aggregation: measured.value,
    budgetEvaluation: null,
    baseline,
    evidence,
    measured: true,
    outcome: "PASS",
    reason: `domain '${request.domain}' measured via I2 public seam; no budget evaluated (not a product SLO claim)`,
  });
}

/**
 * Reject explicit cross-domain / multi-domain orchestration attempts.
 * I5 accepts only a single PerformanceMeasurementDomain per wave.
 */
export function rejectCrossDomainWaveAttempt(domains: readonly string[]): DomainWaveResult {
  return finalize({
    domain: "engine",
    runId: "",
    workload: null,
    aggregation: null,
    budgetEvaluation: null,
    baseline: null,
    evidence: null,
    measured: false,
    outcome: "BLOCKED",
    reason: `I6 owns cross-domain scenarios — refused domains=[${domains.join(",")}]`,
  });
}
