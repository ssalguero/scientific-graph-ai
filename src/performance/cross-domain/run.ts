/**
 * PERFORMANCE-I6 — Cross-domain scenario runner.
 *
 * Lifecycle: Scenario → sequential public-seam observe → C-COL → C-AGG
 * → optional C-BUD → optional C-BASE/C-EVD.
 *
 * Not a product orchestrator. Not an optimizer. Not a CI gate.
 */

import { evaluateBudget } from "../budgets/evaluate";
import type { BudgetEvaluationResult } from "../budgets/types";
import { validateWorkloadDefinition } from "../workloads/workload";
import type {
  PerformanceBaseline,
  WorkloadDefinition,
  WorkloadRunResult,
} from "../workloads/types";
import { observeDomainSequence } from "./observe";
import { validateCrossDomainScenario } from "./sequence";
import type {
  CrossDomainScenarioOutcome,
  CrossDomainScenarioRequest,
  CrossDomainScenarioResult,
  DomainStepObservation,
} from "./types";

function scenarioWorkload(
  scenarioId: string,
  runId: string,
): WorkloadDefinition {
  return {
    workloadId: `i6.${scenarioId}.${runId}`,
    label: `I6 cross-domain scenario — ${scenarioId}`,
    kind: "fixture",
    workloadClass: "cross-domain",
    sourceLabel: "cross-domain",
    signalName: `scenario.${scenarioId}`,
  };
}

function finalize(
  partial: Omit<CrossDomainScenarioResult, "outcome" | "reason"> & {
    outcome: CrossDomainScenarioOutcome;
    reason: string;
  },
): CrossDomainScenarioResult {
  return {
    scenarioId: partial.scenarioId,
    outcome: partial.outcome,
    reason: partial.reason,
    runId: partial.runId,
    domainSequence: partial.domainSequence,
    steps: partial.steps,
    workload: partial.workload,
    aggregation: partial.aggregation,
    budgetEvaluation: partial.budgetEvaluation,
    baseline: partial.baseline,
    evidence: partial.evidence,
    measured: partial.measured,
  };
}

/**
 * Execute one cross-domain measurement scenario.
 */
export function runCrossDomainScenario(
  request: CrossDomainScenarioRequest,
): CrossDomainScenarioResult {
  const emptySteps: DomainStepObservation[] = [];
  const empty = {
    scenarioId: request.scenario.scenarioId,
    runId: request.runId,
    domainSequence: request.scenario.domainSequence,
    steps: emptySteps,
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
      outcome: "BLOCKED",
      reason: "runId must be non-empty",
    });
  }

  if (!Number.isFinite(request.collectedAtMs)) {
    return finalize({
      ...empty,
      outcome: "BLOCKED",
      reason: "collectedAtMs must be finite",
    });
  }

  const validated = validateCrossDomainScenario(request.scenario);
  if (!validated.ok) {
    return finalize({
      ...empty,
      outcome: validated.outcome,
      reason: validated.reason,
    });
  }

  const wl = validateWorkloadDefinition(
    scenarioWorkload(request.scenario.scenarioId, request.runId.trim()),
  );
  if (!wl.ok) {
    return finalize({
      ...empty,
      outcome: "BLOCKED",
      reason: wl.error,
    });
  }

  const batchId = `i6-${request.scenario.scenarioId}-${request.runId.trim()}`;
  const observed = observeDomainSequence(
    validated.sequence,
    batchId,
    request.collectedAtMs,
  );

  if (!observed.ok) {
    const dep = observed.error.includes("EVIDENCE_DEPENDENCY");
    return finalize({
      ...empty,
      workload: wl.value,
      outcome: dep ? "EVIDENCE_DEPENDENCY" : "BLOCKED",
      reason: observed.error,
    });
  }

  if (observed.value.aggregation.observationCount <= 0) {
    return finalize({
      ...empty,
      workload: wl.value,
      steps: observed.value.steps,
      aggregation: observed.value.aggregation,
      outcome: "INCONCLUSIVE",
      reason: "empty cross-domain aggregation — never PASS",
    });
  }

  // Require every declared step to have contributed observations.
  const incomplete = observed.value.steps.find((s) => s.observationCount <= 0);
  if (incomplete) {
    return finalize({
      ...empty,
      workload: wl.value,
      steps: observed.value.steps,
      aggregation: observed.value.aggregation,
      measured: false,
      outcome: "INCONCLUSIVE",
      reason: `partial scenario at domain '${incomplete.domain}' — never PASS as complete cross-domain measurement`,
    });
  }

  let budgetEvaluation: BudgetEvaluationResult | null = null;
  if (request.budgetId !== undefined) {
    if (!request.budgetId.trim()) {
      return finalize({
        ...empty,
        workload: wl.value,
        steps: observed.value.steps,
        aggregation: observed.value.aggregation,
        measured: true,
        outcome: "BLOCKED",
        reason: "budgetId must be non-empty when provided",
      });
    }
    if (!request.budgetRegistry) {
      return finalize({
        ...empty,
        workload: wl.value,
        steps: observed.value.steps,
        aggregation: observed.value.aggregation,
        measured: true,
        outcome: "BLOCKED",
        reason: "budgetRegistry required when budgetId is set",
      });
    }
    const budget = request.budgetRegistry.get(request.budgetId.trim());
    if (!budget) {
      return finalize({
        ...empty,
        workload: wl.value,
        steps: observed.value.steps,
        aggregation: observed.value.aggregation,
        measured: true,
        outcome: "INCONCLUSIVE",
        reason: `budget '${request.budgetId.trim()}' not registered — no invented threshold; never PASS`,
      });
    }
    budgetEvaluation = evaluateBudget(budget, observed.value.aggregation);
  }

  let baseline: PerformanceBaseline | null = null;
  let evidence = null as CrossDomainScenarioResult["evidence"];

  if (request.createBaseline) {
    if (!request.baselineRegistry || !request.baselineId?.trim()) {
      return finalize({
        scenarioId: request.scenario.scenarioId,
        runId: request.runId.trim(),
        domainSequence: validated.sequence,
        steps: observed.value.steps,
        workload: wl.value,
        aggregation: observed.value.aggregation,
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
      aggregation: observed.value.aggregation,
      collectedAtMs: request.collectedAtMs,
    };
    const created = request.baselineRegistry.createFromRun(
      request.baselineId.trim(),
      run,
      {
        reproducible: true,
        notes: `I6 cross-domain baseline for ${request.scenario.scenarioId} [${validated.sequence.join("→")}]`,
      },
    );
    if (!created.ok) {
      return finalize({
        scenarioId: request.scenario.scenarioId,
        runId: request.runId.trim(),
        domainSequence: validated.sequence,
        steps: observed.value.steps,
        workload: wl.value,
        aggregation: observed.value.aggregation,
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
        scenarioId: request.scenario.scenarioId,
        runId: request.runId.trim(),
        domainSequence: validated.sequence,
        steps: observed.value.steps,
        workload: wl.value,
        aggregation: observed.value.aggregation,
        budgetEvaluation,
        baseline,
        evidence,
        measured: true,
        outcome: "PASS",
        reason: `scenario '${request.scenario.scenarioId}' [${validated.sequence.join("→")}] measured; budget PASS`,
      });
    }
    if (budgetEvaluation.outcome === "FAIL") {
      return finalize({
        scenarioId: request.scenario.scenarioId,
        runId: request.runId.trim(),
        domainSequence: validated.sequence,
        steps: observed.value.steps,
        workload: wl.value,
        aggregation: observed.value.aggregation,
        budgetEvaluation,
        baseline,
        evidence,
        measured: true,
        outcome: "FAIL",
        reason: `scenario measured; budget FAIL — ${budgetEvaluation.reason}`,
      });
    }
    return finalize({
      scenarioId: request.scenario.scenarioId,
      runId: request.runId.trim(),
      domainSequence: validated.sequence,
      steps: observed.value.steps,
      workload: wl.value,
      aggregation: observed.value.aggregation,
      budgetEvaluation,
      baseline,
      evidence,
      measured: true,
      outcome: budgetEvaluation.outcome,
      reason: `scenario measured; budget ${budgetEvaluation.outcome} — ${budgetEvaluation.reason}`,
    });
  }

  return finalize({
    scenarioId: request.scenario.scenarioId,
    runId: request.runId.trim(),
    domainSequence: validated.sequence,
    steps: observed.value.steps,
    workload: wl.value,
    aggregation: observed.value.aggregation,
    budgetEvaluation: null,
    baseline,
    evidence,
    measured: true,
    outcome: "PASS",
    reason: `scenario '${request.scenario.scenarioId}' [${validated.sequence.join("→")}] measured via I2 public seams; no budget evaluated`,
  });
}

/**
 * Explicit rejection helper for unsupported optional-peer paths.
 */
export function rejectUnsupportedCrossDomainPath(
  domains: readonly string[],
): CrossDomainScenarioResult {
  return finalize({
    scenarioId: "unsupported",
    runId: "",
    domainSequence: [],
    steps: [],
    workload: null,
    aggregation: null,
    budgetEvaluation: null,
    baseline: null,
    evidence: null,
    measured: false,
    outcome: "BLOCKED",
    reason: `unsupported cross-domain path [${domains.join("→")}] — conditional peers require authorized public seams`,
  });
}
