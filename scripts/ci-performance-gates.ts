/**
 * PERFORMANCE-I8/I9 — CI entry for gate evaluation (measurement-backed).
 *
 * Builds fixture evidence via Collect→Aggregate→Compare→Gate.
 * Exits non-zero when a required gate does not PASS.
 */
import {
  evaluateGateReadiness,
  gateOutcomeRequiresCiFailure,
  validateGateDefinition,
} from "../src/performance/gates";
import type { GateDefinition } from "../src/performance/gates";
import {
  compareBeforeAfter,
  createFixtureOptimizationStore,
  validateOptimizationCandidate,
} from "../src/performance/opt-waves";
import type { OptimizationCandidate } from "../src/performance/opt-waves";

const gate: GateDefinition = {
  gateId: "ci.performance.regression",
  label: "PERFORMANCE CI regression readiness (fixture)",
  kind: "fixture",
  requireComparison: true,
  requireBudget: false,
  requireBaseline: false,
  requireWorkloadId: true,
};

const candidate: OptimizationCandidate = {
  candidateId: "ci.fixture.decrease",
  label: "CI fixture optimization — not a peer API",
  kind: "fixture",
  mechanism: "fixture-controlled",
  targetScope: "fixture",
  workloadId: "ci.wl.fixture",
  sourceLabel: "fixture",
  signalName: "ci.signal",
  statistic: "max",
  expectedEffect: "decrease",
};

const validatedGate = validateGateDefinition(gate);
if (!validatedGate.ok) {
  console.error(`[PERFORMANCE-CI] BLOCKED: ${validatedGate.error}`);
  process.exit(1);
}

const validatedCand = validateOptimizationCandidate(candidate);
if (!validatedCand.ok) {
  console.error(`[PERFORMANCE-CI] BLOCKED: ${validatedCand.error}`);
  process.exit(1);
}

const store = createFixtureOptimizationStore([10, 12, 14]);
const before = store.measure({
  batchId: "ci-before",
  sourceLabel: candidate.sourceLabel,
  signalName: candidate.signalName,
  collectedAtMs: 1000,
});
if (!before.ok) {
  console.error(`[PERFORMANCE-CI] before measure failed: ${before.error}`);
  process.exit(1);
}

const applied = store.applyFixtureAdjustment("decrease", 2);
if (!applied.ok) {
  console.error(`[PERFORMANCE-CI] fixture adjust failed: ${applied.error}`);
  process.exit(1);
}

const after = store.measure({
  batchId: "ci-after",
  sourceLabel: candidate.sourceLabel,
  signalName: candidate.signalName,
  collectedAtMs: 2000,
});
if (!after.ok) {
  console.error(`[PERFORMANCE-CI] after measure failed: ${after.error}`);
  process.exit(1);
}

const comparison = compareBeforeAfter({
  candidate: validatedCand.value,
  before: before.value,
  after: after.value,
  beforeWorkloadId: candidate.workloadId,
  afterWorkloadId: candidate.workloadId,
  mechanismExecuted: true,
});

const result = evaluateGateReadiness(validatedGate.value, {
  workloadId: candidate.workloadId,
  comparison,
  measured: true,
  reproducible: true,
});

console.log(
  `[PERFORMANCE-CI] gateId=${result.gateId} outcome=${result.outcome} ciShouldFail=${result.ciShouldFail}`,
);
console.log(`[PERFORMANCE-CI] comparison=${comparison.outcome} attributed=${comparison.attributed}`);
console.log(`[PERFORMANCE-CI] reason=${result.reason}`);

if (result.outcome !== "PASS" || gateOutcomeRequiresCiFailure(result)) {
  console.error("[PERFORMANCE-CI] REQUIRED GATE DID NOT PASS — failing CI");
  process.exit(1);
}

// Self-check: regression must FAIL CI
const regressionCmp = compareBeforeAfter({
  candidate: { ...validatedCand.value, expectedEffect: "increase" },
  before: before.value,
  after: after.value,
  beforeWorkloadId: candidate.workloadId,
  afterWorkloadId: candidate.workloadId,
  mechanismExecuted: true,
});
const failResult = evaluateGateReadiness(validatedGate.value, {
  workloadId: candidate.workloadId,
  comparison: regressionCmp,
  measured: true,
  reproducible: true,
});
if (!gateOutcomeRequiresCiFailure(failResult) || failResult.outcome !== "FAIL") {
  console.error(
    `[PERFORMANCE-CI] self-check: regression must FAIL and fail CI (got ${failResult.outcome})`,
  );
  process.exit(1);
}
console.log(
  `[PERFORMANCE-CI] self-check regression outcome=${failResult.outcome} ciShouldFail=${failResult.ciShouldFail}`,
);

const missing = evaluateGateReadiness(validatedGate.value, null);
if (missing.outcome === "PASS" || !gateOutcomeRequiresCiFailure(missing)) {
  console.error("[PERFORMANCE-CI] self-check: missing evidence must not PASS");
  process.exit(1);
}
console.log(
  `[PERFORMANCE-CI] self-check missing evidence outcome=${missing.outcome}`,
);

// I9: unmeasured evidence must not PASS
const unmeasured = evaluateGateReadiness(validatedGate.value, {
  workloadId: candidate.workloadId,
  comparison,
  reproducible: true,
});
if (unmeasured.outcome === "PASS") {
  console.error("[PERFORMANCE-CI] self-check: measured!==true must not PASS");
  process.exit(1);
}
console.log(
  `[PERFORMANCE-CI] self-check unmeasured outcome=${unmeasured.outcome}`,
);

console.log("[PERFORMANCE-CI] PASS");
process.exit(0);
