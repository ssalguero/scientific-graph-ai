/**
 * PERFORMANCE-I9 — Measurement-integrity / hardening behavioral gate.
 *
 * Verifies objective integrity hardenings without redesigning I0–I8.
 * Authority: P10 · P6 I9 · PERFORMANCE-I9 record.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  PERFORMANCE_HARDENING_PHASE,
  PERFORMANCE_HARDENING_STATUS,
} from "../src/performance/integrity";
import { aggregateBatch } from "../src/performance/measurement";
import type { AggregationView, CollectionBatch } from "../src/performance/measurement";
import {
  createBaselineEvidence,
  createBaselineRegistry,
} from "../src/performance/workloads";
import { evaluateBudget, validateBudgetDefinition } from "../src/performance/budgets";
import type { BudgetDefinition } from "../src/performance/budgets";
import {
  assessOptimizationEligibility,
  compareBeforeAfter,
  validateOptimizationCandidate,
} from "../src/performance/opt-waves";
import type { OptimizationCandidate } from "../src/performance/opt-waves";
import {
  evaluateGateReadiness,
  gateOutcomeRequiresCiFailure,
  validateGateDefinition,
} from "../src/performance/gates";
import type { GateDefinition, GateEvidencePackage } from "../src/performance/gates";

const repoRoot = process.cwd();
const performanceDir = join(repoRoot, "src/performance");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const toPosix = (p: string) => p.replace(/\\/g, "/");
const relFromRepo = (abs: string) => toPosix(relative(repoRoot, abs));

const collectTsFiles = (dir: string): string[] => {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  const walk = (abs: string) => {
    for (const name of readdirSync(abs)) {
      const child = join(abs, name);
      if (statSync(child).isDirectory()) walk(child);
      else if (/\.(ts|tsx)$/.test(name)) out.push(child);
    }
  };
  walk(dir);
  return out;
};

const REQUIRED_FILES = [
  "src/performance/integrity/identity.ts",
  "src/performance/integrity/index.ts",
  "docs/PERFORMANCE/implementation/PERFORMANCE-I9-Hardening-Measurement-Integrity.md",
  "scripts/validate-performance-integrity.ts",
  "scripts/validate-performance-boundaries.ts",
];

const FORBIDDEN_DIRS = [
  "src/performance/certification",
  "src/performance/validation",
  "src/performance/optimization",
  "src/performance/benchmarks",
  "src/collab",
];

const FORBIDDEN_FUTURE = [
  /\bGPU\b/,
  /\bCRDT\b/,
  /\bAdaptiveTuner\b/,
  /\bautoOptimize\b/,
  /\bOptimizationEngine\b/,
  /\bPerformanceCiGate\b/,
];

for (const rel of REQUIRED_FILES) {
  assertCase(`layout.file.${rel}`, existsSync(join(repoRoot, rel)), "present");
}
for (const rel of FORBIDDEN_DIRS) {
  assertCase(
    `no.forbidden.dir.${rel}`,
    !existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "forbidden" : "absent",
  );
}

assertCase(
  "id.phase",
  PERFORMANCE_HARDENING_PHASE === "PERFORMANCE-I9",
  PERFORMANCE_HARDENING_PHASE,
);
assertCase(
  "id.status",
  PERFORMANCE_HARDENING_STATUS === "HARDENING_MEASUREMENT_INTEGRITY_COMPLETE",
  PERFORMANCE_HARDENING_STATUS,
);

const barrel = readFileSync(join(performanceDir, "index.ts"), "utf8");
assertCase(
  "barrel.exports.integrity",
  /PERFORMANCE_HARDENING_PHASE/.test(barrel) &&
    /PERFORMANCE_HARDENING_STATUS/.test(barrel),
  "I9 markers exported",
);

// --- Measurement integrity ---
const badBatch: CollectionBatch = {
  batchId: "bad",
  observations: [
    {
      observationId: "o1",
      sourceLabel: "s",
      signalName: "x",
      numericValue: Number.NaN,
      collectedAtMs: 1,
    },
  ],
};
const nanAgg = aggregateBatch(badBatch);
assertCase(
  "agg.reject.nan",
  nanAgg.ok === false,
  nanAgg.ok ? "accepted NaN" : nanAgg.error,
);

const dupBatch: CollectionBatch = {
  batchId: "dup",
  observations: [
    {
      observationId: "same",
      sourceLabel: "s",
      signalName: "x",
      numericValue: 1,
      collectedAtMs: 1,
    },
    {
      observationId: "same",
      sourceLabel: "s",
      signalName: "x",
      numericValue: 2,
      collectedAtMs: 2,
    },
  ],
};
const dupAgg = aggregateBatch(dupBatch);
assertCase(
  "agg.reject.dup",
  dupAgg.ok === false,
  dupAgg.ok ? "accepted dup" : dupAgg.error,
);

const goodAgg: AggregationView = {
  batchId: "g",
  observationCount: 2,
  signals: [
    {
      sourceLabel: "s",
      signalName: "x",
      count: 2,
      sum: 3,
      min: 1,
      max: 2,
    },
  ],
};

const forgedEvidence = createBaselineEvidence({
  evidenceId: "e-forged",
  workloadId: "wl",
  baselineId: "b",
  aggregation: {
    batchId: "g",
    observationCount: 99,
    signals: goodAgg.signals,
  },
  createdAtMs: 1,
  reproducible: true,
});
assertCase(
  "evd.reject.inconsistent",
  forgedEvidence.ok === false,
  forgedEvidence.ok ? "forged count accepted" : forgedEvidence.error,
);

const registry = createBaselineRegistry();
const noClaim = registry.createFromRun(
  "b1",
  {
    runId: "r1",
    workloadId: "wl",
    collectedAtMs: 1,
    aggregation: goodAgg,
  },
  undefined,
);
assertCase(
  "base.reject.implicit.repro",
  noClaim.ok === false,
  noClaim.ok ? "implicit repro accepted" : noClaim.error,
);

const explicit = registry.createFromRun(
  "b1",
  {
    runId: "r1",
    workloadId: "wl",
    collectedAtMs: 1,
    aggregation: goodAgg,
  },
  { reproducible: true },
);
assertCase("base.accept.explicit.repro", explicit.ok === true, "explicit true");

// --- Budget integrity ---
const invalidBudget = { budgetId: "", label: "x" } as unknown as BudgetDefinition;
const invalidEval = evaluateBudget(invalidBudget, goodAgg);
assertCase(
  "budget.invalid.blocked",
  invalidEval.outcome === "BLOCKED",
  `outcome=${invalidEval.outcome}`,
);
const missingAgg = evaluateBudget(
  {
    budgetId: "bud.1",
    label: "test",
    sourceLabel: "s",
    signalName: "x",
    statistic: "max",
    comparator: "lte",
    threshold: 10,
    kind: "fixture",
  },
  null,
);
assertCase(
  "budget.missing.never.pass",
  missingAgg.outcome !== "PASS",
  `outcome=${missingAgg.outcome}`,
);
assertCase(
  "budget.validate.helper",
  validateBudgetDefinition({
    budgetId: "bud.1",
    label: "test",
    sourceLabel: "s",
    signalName: "x",
    statistic: "max",
    comparator: "lte",
    threshold: 10,
    kind: "fixture",
  }).ok === true,
  "valid definition",
);

// --- Comparison integrity ---
const candidate: OptimizationCandidate = {
  candidateId: "c1",
  label: "fixture",
  kind: "fixture",
  mechanism: "fixture-controlled",
  targetScope: "fixture",
  workloadId: "wl",
  sourceLabel: "s",
  signalName: "x",
  statistic: "max",
  expectedEffect: "decrease",
};
assertCase(
  "opt.candidate.valid",
  validateOptimizationCandidate(candidate).ok === true,
  "candidate",
);

const nonFiniteAfter: AggregationView = {
  batchId: "a",
  observationCount: 1,
  signals: [
    {
      sourceLabel: "s",
      signalName: "x",
      count: 1,
      sum: Number.NaN,
      min: Number.NaN,
      max: Number.NaN,
    },
  ],
};
const cmpNan = compareBeforeAfter({
  candidate,
  before: goodAgg,
  after: nonFiniteAfter,
  beforeWorkloadId: "wl",
  afterWorkloadId: "wl",
  mechanismExecuted: true,
});
assertCase(
  "cmp.nonfinite.inconclusive",
  cmpNan.outcome === "INCONCLUSIVE" && cmpNan.attributed === false,
  `outcome=${cmpNan.outcome}`,
);

const noEv = assessOptimizationEligibility(candidate, null);
assertCase(
  "opt.no.evidence",
  noEv.outcome === "EVIDENCE_DEPENDENCY",
  `outcome=${noEv.outcome}`,
);

const peerCand: OptimizationCandidate = {
  ...candidate,
  candidateId: "c-peer",
  mechanism: "peer-public",
  targetScope: "engine",
};
const peerElig = assessOptimizationEligibility(peerCand, {
  beforeAggregation: goodAgg,
  workloadId: "wl",
  reproducible: true,
});
assertCase(
  "opt.peer.public.blocked",
  peerElig.outcome === "EVIDENCE_DEPENDENCY",
  `outcome=${peerElig.outcome} reason=${peerElig.reason}`,
);

// --- Gate integrity ---
const gate: GateDefinition = {
  gateId: "g.integrity",
  label: "integrity",
  kind: "fixture",
  requireComparison: true,
  requireBudget: false,
  requireBaseline: false,
  requireWorkloadId: true,
};
assertCase("gate.def.valid", validateGateDefinition(gate).ok === true, "gate");

const improvedUnattributed: GateEvidencePackage = {
  workloadId: "wl",
  measured: true,
  reproducible: true,
  comparison: {
    outcome: "IMPROVED",
    reason: "forged",
    attributed: false,
    beforeValue: 2,
    afterValue: 1,
  },
};
const unattr = evaluateGateReadiness(gate, improvedUnattributed);
assertCase(
  "gate.improved.unattributed.inconclusive",
  unattr.outcome === "INCONCLUSIVE" && gateOutcomeRequiresCiFailure(unattr),
  `outcome=${unattr.outcome} ci=${unattr.ciShouldFail}`,
);

const unmeasured: GateEvidencePackage = {
  workloadId: "wl",
  comparison: {
    outcome: "IMPROVED",
    reason: "ok",
    attributed: true,
    beforeValue: 2,
    afterValue: 1,
  },
  reproducible: true,
};
const um = evaluateGateReadiness(gate, unmeasured);
assertCase(
  "gate.unmeasured.inconclusive",
  um.outcome === "INCONCLUSIVE" && gateOutcomeRequiresCiFailure(um),
  `outcome=${um.outcome}`,
);

const missingGate = evaluateGateReadiness(gate, null);
assertCase(
  "gate.missing.evidence",
  missingGate.outcome === "EVIDENCE_DEPENDENCY" &&
    gateOutcomeRequiresCiFailure(missingGate),
  `outcome=${missingGate.outcome}`,
);

const conditional = evaluateGateReadiness(gate, {
  workloadId: "wl",
  measured: true,
  reproducible: true,
  domainOrScenarioId: "ai",
  comparison: {
    outcome: "IMPROVED",
    reason: "n/a",
    attributed: true,
    beforeValue: 2,
    afterValue: 1,
  },
});
assertCase(
  "gate.conditional.ai",
  conditional.outcome === "CONDITIONAL" &&
    gateOutcomeRequiresCiFailure(conditional),
  `outcome=${conditional.outcome}`,
);

const passPkg: GateEvidencePackage = {
  workloadId: "wl",
  measured: true,
  reproducible: true,
  comparison: {
    outcome: "IMPROVED",
    reason: "ok",
    attributed: true,
    beforeValue: 2,
    afterValue: 1,
  },
};
const pass = evaluateGateReadiness(gate, passPkg);
assertCase(
  "gate.pass.aligned",
  pass.outcome === "PASS" &&
    pass.ciShouldFail === false &&
    !gateOutcomeRequiresCiFailure(pass),
  `outcome=${pass.outcome}`,
);

// CI field/helper alignment for non-PASS
for (const outcome of [
  "FAIL",
  "BLOCKED",
  "INCONCLUSIVE",
  "EVIDENCE_DEPENDENCY",
  "CONDITIONAL",
] as const) {
  const synthetic = {
    gateId: "x",
    outcome,
    reason: "synthetic",
    ciShouldFail: true,
  };
  assertCase(
    `ci.align.${outcome}`,
    gateOutcomeRequiresCiFailure(synthetic) === true,
    "requires CI failure",
  );
}

// --- CI script integrity ---
const ciScript = readFileSync(
  join(repoRoot, "scripts/ci-performance-gates.ts"),
  "utf8",
);
assertCase(
  "ci.measurement.backed",
  ciScript.includes("createFixtureOptimizationStore") &&
    ciScript.includes("compareBeforeAfter") &&
    ciScript.includes("measured: true"),
  "CI builds evidence",
);
assertCase(
  "ci.selfcheck.unmeasured",
  ciScript.includes("unmeasured") || ciScript.includes("measured!==true"),
  "unmeasured self-check",
);

const workflow = readFileSync(
  join(repoRoot, ".github/workflows/performance-gates.yml"),
  "utf8",
);
assertCase(
  "ci.workflow.integrity.step",
  workflow.includes("validate:performance-integrity"),
  "integrity step",
);
assertCase(
  "ci.workflow.boundaries.step",
  workflow.includes("validate:performance-boundaries"),
  "boundaries step",
);
assertCase(
  "ci.workflow.peer.paths",
  workflow.includes("src/engine/index.ts") &&
    workflow.includes("src/data/index.ts") &&
    workflow.includes("src/ui/index.ts"),
  "peer public barrel path filters",
);

// --- No I10 / Future Evolution in PERFORMANCE sources ---
const tsFiles = collectTsFiles(performanceDir);
for (const file of tsFiles) {
  const src = readFileSync(file, "utf8");
  const rel = relFromRepo(file);
  for (const re of FORBIDDEN_FUTURE) {
    const hit = re.test(src);
    assertCase(
      `no.future.${re.source}.${rel}`,
      !hit,
      hit ? "forbidden future token" : "clean",
    );
  }
  assertCase(
    `no.i10.cert.pack.${rel}`,
    !/\bFinalCertificationPack\b|\breleaseCertification\b|\bDomainProductionCertification\b/.test(
      src,
    ),
    "no I10 certification APIs",
  );
}

assertCase(
  "no.i10.doc",
  !existsSync(
    join(
      repoRoot,
      "docs/PERFORMANCE/implementation/PERFORMANCE-I10-Domain-Production-Certification.md",
    ),
  ),
  "I10 record absent",
);

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  const mark = r.pass ? "PASS" : "FAIL";
  console.log(`[${mark}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(`\nvalidate-performance-integrity: ${failed.length} failure(s)`);
  process.exit(1);
}

console.log(`\nvalidate-performance-integrity: ${results.length} checks PASS`);
