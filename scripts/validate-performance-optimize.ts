/**
 * PERFORMANCE-I7 — Optimization waves (C-OPT / C-CMP) readiness + behavioral gate.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  PERFORMANCE_COMPONENT_C_CMP,
  PERFORMANCE_COMPONENT_C_OPT,
  PERFORMANCE_OPTIMIZE_STATUS,
  assessOptimizationEligibility,
  compareBeforeAfter,
  createFixtureOptimizationStore,
  runOptimizationWave,
  validateOptimizationCandidate,
} from "../src/performance/opt-waves";
import type { OptimizationCandidate } from "../src/performance/opt-waves";

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
  "src/performance/opt-waves/index.ts",
  "src/performance/opt-waves/identity.ts",
  "src/performance/opt-waves/types.ts",
  "src/performance/opt-waves/candidate.ts",
  "src/performance/opt-waves/eligibility.ts",
  "src/performance/opt-waves/fixture-store.ts",
  "src/performance/opt-waves/compare.ts",
  "src/performance/opt-waves/wave.ts",
  "docs/PERFORMANCE/implementation/PERFORMANCE-I7-Optimization-Waves.md",
];

const FORBIDDEN_DIRS = [
  "src/performance/benchmarks",
  "src/performance/certification",
  "src/performance/engine",
  "src/performance/data",
  "src/performance/ai",
  "src/performance/ux",
  "src/performance/collab",
  "src/performance/plugins",
];

for (const rel of REQUIRED_FILES) {
  assertCase(`layout.file.${rel}`, existsSync(join(repoRoot, rel)), "present");
}
for (const rel of FORBIDDEN_DIRS) {
  assertCase(
    `no.ownership.dir.${rel}`,
    !existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "forbidden" : "absent",
  );
}

assertCase("id.c-opt", PERFORMANCE_COMPONENT_C_OPT === "C-OPT", "C-OPT");
assertCase("id.c-cmp", PERFORMANCE_COMPONENT_C_CMP === "C-CMP", "C-CMP");
assertCase(
  "status",
  PERFORMANCE_OPTIMIZE_STATUS === "OPTIMIZATION_WAVES_COMPLETE",
  "I7 status",
);

const fixtureCandidate: OptimizationCandidate = {
  candidateId: "fixture.opt.decrease",
  label: "Fixture optimization — not a peer API",
  kind: "fixture",
  mechanism: "fixture-controlled",
  targetScope: "fixture",
  workloadId: "wl.fixture.opt",
  sourceLabel: "fixture",
  signalName: "opt.signal",
  statistic: "max",
  expectedEffect: "decrease",
};

const bad = validateOptimizationCandidate({
  ...fixtureCandidate,
  candidateId: "",
});
assertCase("candidate.reject", bad.ok === false, "rejects empty id");

const okCand = validateOptimizationCandidate(fixtureCandidate);
assertCase("candidate.accept", okCand.ok === true, "accepts fixture candidate");

// NO EVIDENCE → NO OPTIMIZATION
const noEvidence = assessOptimizationEligibility(fixtureCandidate, null);
assertCase(
  "gate.no.evidence",
  noEvidence.outcome === "EVIDENCE_DEPENDENCY" &&
    noEvidence.reason.includes("NO EVIDENCE"),
  "no evidence blocked",
);

const store = createFixtureOptimizationStore([10, 12, 14]);
const before = store.measure({
  batchId: "before-1",
  sourceLabel: "fixture",
  signalName: "opt.signal",
  collectedAtMs: 1000,
});
assertCase("fixture.measure.before", before.ok === true, "before measure");

const evidence = before.ok
  ? {
      beforeAggregation: before.value,
      workloadId: "wl.fixture.opt",
      reproducible: true,
    }
  : null;

const eligible = assessOptimizationEligibility(fixtureCandidate, evidence);
assertCase(
  "gate.eligible",
  eligible.outcome === "ELIGIBLE",
  `outcome=${eligible.outcome}`,
);

// Peer-public always evidence-dependent
const peerCand: OptimizationCandidate = {
  ...fixtureCandidate,
  candidateId: "peer.engine.opt",
  mechanism: "peer-public",
  targetScope: "engine",
  sourceLabel: "engine",
};
const peerGate = assessOptimizationEligibility(peerCand, evidence);
assertCase(
  "gate.peer.blocked",
  peerGate.outcome === "EVIDENCE_DEPENDENCY",
  "no fabricated peer opt API",
);

const aiCand: OptimizationCandidate = {
  ...fixtureCandidate,
  candidateId: "ai.opt",
  mechanism: "peer-public",
  targetScope: "ai",
  sourceLabel: "ai",
};
const aiGate = assessOptimizationEligibility(aiCand, evidence);
assertCase(
  "gate.ai.conditional",
  aiGate.outcome === "CONDITIONAL" ||
    aiGate.outcome === "EVIDENCE_DEPENDENCY",
  `outcome=${aiGate.outcome}`,
);

// Full wave PASS
const wave = runOptimizationWave({
  candidate: fixtureCandidate,
  evidence,
  fixtureStore: store,
  adjustmentAmount: 2,
  remeasureBatchId: "after-1",
  remeasureCollectedAtMs: 2000,
});
assertCase(
  "wave.pass",
  wave.outcome === "PASS" &&
    wave.executed &&
    wave.remeasured &&
    wave.comparison?.outcome === "IMPROVED" &&
    wave.comparison.attributed === true,
  `outcome=${wave.outcome} cmp=${wave.comparison?.outcome}`,
);

// No evidence wave
const waveNoEv = runOptimizationWave({
  candidate: fixtureCandidate,
  evidence: null,
  fixtureStore: store,
  remeasureBatchId: "x",
  remeasureCollectedAtMs: 3000,
});
assertCase(
  "wave.no.evidence",
  waveNoEv.outcome === "EVIDENCE_DEPENDENCY" && !waveNoEv.executed,
  "no evidence → no execution",
);

// Peer wave cannot execute
const wavePeer = runOptimizationWave({
  candidate: peerCand,
  evidence: evidence
    ? { ...evidence, workloadId: peerCand.workloadId }
    : null,
  remeasureBatchId: "peer-x",
  remeasureCollectedAtMs: 4000,
});
assertCase(
  "wave.peer.blocked",
  !wavePeer.executed &&
    (wavePeer.outcome === "EVIDENCE_DEPENDENCY" ||
      wavePeer.outcome === "BLOCKED" ||
      wavePeer.outcome === "INCONCLUSIVE" ||
      wavePeer.outcome === "CONDITIONAL"),
  `outcome=${wavePeer.outcome}`,
);

// Comparison: incompatible workloads
if (before.ok) {
  const after = store.measure({
    batchId: "cmp-after",
    sourceLabel: "fixture",
    signalName: "opt.signal",
    collectedAtMs: 5000,
  });
  if (after.ok) {
    const badCmp = compareBeforeAfter({
      candidate: fixtureCandidate,
      before: before.value,
      after: after.value,
      beforeWorkloadId: "wl.a",
      afterWorkloadId: "wl.b",
      mechanismExecuted: true,
    });
    assertCase(
      "cmp.incompatible",
      badCmp.outcome === "BLOCKED" && badCmp.attributed === false,
      "incompatible workloads",
    );

    const noMech = compareBeforeAfter({
      candidate: fixtureCandidate,
      before: before.value,
      after: after.value,
      beforeWorkloadId: "wl.fixture.opt",
      afterWorkloadId: "wl.fixture.opt",
      mechanismExecuted: false,
    });
    assertCase(
      "cmp.no.attribution",
      noMech.attributed === false &&
        (noMech.outcome === "INCONCLUSIVE" ||
          noMech.outcome === "UNCHANGED" ||
          noMech.outcome === "IMPROVED" ||
          noMech.outcome === "REGRESSED"),
      `outcome=${noMech.outcome} attributed=${noMech.attributed}`,
    );
  }
}

// Regression path: expect decrease but increase values
const store2 = createFixtureOptimizationStore([5, 5, 5]);
const before2 = store2.measure({
  batchId: "reg-before",
  sourceLabel: "fixture",
  signalName: "opt.signal",
  collectedAtMs: 6000,
});
const increaseCand: OptimizationCandidate = {
  ...fixtureCandidate,
  candidateId: "fixture.opt.increase.wrong",
  expectedEffect: "decrease",
};
if (before2.ok) {
  // Force increase while candidate expects decrease
  store2.applyFixtureAdjustment("increase", 3);
  const after2 = store2.measure({
    batchId: "reg-after",
    sourceLabel: "fixture",
    signalName: "opt.signal",
    collectedAtMs: 7000,
  });
  if (after2.ok) {
    const reg = compareBeforeAfter({
      candidate: increaseCand,
      before: before2.value,
      after: after2.value,
      beforeWorkloadId: "wl.fixture.opt",
      afterWorkloadId: "wl.fixture.opt",
      mechanismExecuted: true,
    });
    assertCase(
      "cmp.regression",
      reg.outcome === "REGRESSED",
      `outcome=${reg.outcome}`,
    );
  }
}

const fixtureSrc = readFileSync(
  join(performanceDir, "opt-waves/fixture-store.ts"),
  "utf8",
);
assertCase(
  "fixture.labeled",
  fixtureSrc.includes("NOT a peer API") ||
    fixtureSrc.includes("not a peer API") ||
    fixtureSrc.includes("PERFORMANCE-owned"),
  "fixture labeled non-peer",
);

const barrel = readFileSync(join(performanceDir, "index.ts"), "utf8");
assertCase(
  "barrel.exports.i7",
  /runOptimizationWave/.test(barrel) &&
    /PERFORMANCE_COMPONENT_C_OPT/.test(barrel) &&
    /PERFORMANCE_COMPONENT_C_CMP/.test(barrel) &&
    /compareBeforeAfter/.test(barrel),
  "barrel exports I7",
);
assertCase(
  "barrel.no.autonomous",
  !/\b(OptimizationEngine|autoOptimize|AdaptiveTuner)\b/.test(barrel),
  "no autonomous optimizer",
);
assertCase(
  "barrel.no.ci",
  !/\b(PerformanceCiGate|registerPerformanceGate)\b/.test(barrel),
  "no CI",
);

const tsFiles = collectTsFiles(performanceDir);
for (const file of tsFiles) {
  const src = readFileSync(file, "utf8");
  const rel = relFromRepo(file);
  const inInstrumentation = rel.includes("/instrumentation/");
  const specs = [...src.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]!);
  for (const spec of specs) {
    if (!spec.startsWith("@/")) continue;
    if (spec.startsWith("@/performance")) continue;
    if (inInstrumentation && ["@/engine", "@/data", "@/ui"].includes(spec)) continue;
    assertCase(`peer.forbid.${rel}::${spec}`, false, `disallowed ${spec}`);
  }
  assertCase(
    `no.autonomous.${rel}`,
    !/\b(OptimizationEngine|autoOptimize|AdaptiveTuner)\b/.test(src),
    "clean",
  );
  assertCase(
    `no.ci.${rel}`,
    !/\b(PerformanceCiGate|registerPerformanceGate)\b/.test(src),
    "clean",
  );
  if (rel.includes("/opt-waves/")) {
    assertCase(
      `no.peer.dispatch.${rel}`,
      !/\b(executeCommand|configureEngine|configureData)\b/.test(src),
      "no peer dispatch",
    );
  }
}

assertCase("ts.count", tsFiles.length <= 90, `found ${tsFiles.length}`);
assertCase("no.collab", !existsSync(join(repoRoot, "src/collab")), "no src/collab");
for (const peer of ["src/engine", "src/data", "src/ai", "src/ui", "src/plugins"]) {
  assertCase(`peer.${peer}`, existsSync(join(repoRoot, peer)), "present");
}

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.id}: ${r.detail}`);
}
if (failed.length > 0) {
  console.error(`\nvalidate-performance-optimize: ${failed.length} failure(s)`);
  process.exit(1);
}
console.log(`\nvalidate-performance-optimize: ${results.length} checks PASS`);
