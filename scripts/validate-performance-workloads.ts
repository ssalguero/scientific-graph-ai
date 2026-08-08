/**
 * PERFORMANCE-I4 — Workloads / baselines / evidence readiness + behavioral gate.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  PERFORMANCE_COMPONENT_C_BASE,
  PERFORMANCE_COMPONENT_C_EVD,
  PERFORMANCE_COMPONENT_C_WL,
  PERFORMANCE_WORKLOAD_STATUS,
  compareBaselineComparability,
  createBaselineRegistry,
  runWorkloadAndCreateBaseline,
  runWorkloadHarness,
  validateWorkloadDefinition,
} from "../src/performance/workloads";
import type { WorkloadDefinition } from "../src/performance/workloads";
import { createBudgetRegistry, evaluateBudget } from "../src/performance/budgets";

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
  "src/performance/workloads/index.ts",
  "src/performance/workloads/identity.ts",
  "src/performance/workloads/types.ts",
  "src/performance/workloads/workload.ts",
  "src/performance/workloads/harness.ts",
  "src/performance/workloads/baseline.ts",
  "src/performance/workloads/evidence.ts",
  "src/performance/workloads/compare.ts",
  "docs/PERFORMANCE/implementation/PERFORMANCE-I4-Workloads-Baselines.md",
];

const FORBIDDEN_DIRS = [
  "src/performance/optimization",
  "src/performance/benchmarks",
  "src/performance/certification",
];

for (const rel of REQUIRED_FILES) {
  assertCase(`layout.file.${rel}`, existsSync(join(repoRoot, rel)), "present");
}
for (const rel of FORBIDDEN_DIRS) {
  assertCase(
    `no.future.dir.${rel}`,
    !existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "forbidden" : "absent",
  );
}

assertCase("id.c-wl", PERFORMANCE_COMPONENT_C_WL === "C-WL", "C-WL");
assertCase("id.c-base", PERFORMANCE_COMPONENT_C_BASE === "C-BASE", "C-BASE");
assertCase("id.c-evd", PERFORMANCE_COMPONENT_C_EVD === "C-EVD", "C-EVD");
assertCase(
  "status",
  PERFORMANCE_WORKLOAD_STATUS === "WORKLOADS_BASELINES_COMPLETE",
  "I4 status",
);

const fixtureWl: WorkloadDefinition = {
  workloadId: "fixture.wl.a",
  label: "Fixture workload — not a product scenario",
  kind: "fixture",
  workloadClass: "baseline",
  sourceLabel: "engine",
  signalName: "flow",
};

const bad = validateWorkloadDefinition({ ...fixtureWl, workloadId: "" });
assertCase("wl.reject", bad.ok === false, "rejects empty workloadId");

const ok = validateWorkloadDefinition(fixtureWl);
assertCase("wl.accept", ok.ok === true, "accepts fixture");

const cross = validateWorkloadDefinition({
  ...fixtureWl,
  workloadId: "fixture.wl.cross",
  workloadClass: "cross-domain",
  sourceLabel: "cross-domain",
  signalName: "scenario",
});
assertCase("wl.accept.cross", cross.ok === true, "cross-domain class accepted for I6 C-WL");

const run = runWorkloadHarness(fixtureWl, {
  runId: "r1",
  collectedAtMs: 1000,
  numericValues: [3, 7],
});
assertCase("harness.ok", run.ok === true, "harness executes");

const conditional = runWorkloadHarness(
  { ...fixtureWl, workloadId: "ai.wl", sourceLabel: "ai" },
  { runId: "r2", collectedAtMs: 2000, numericValues: [1] },
);
assertCase(
  "harness.conditional",
  conditional.ok === false &&
    String(conditional.error).includes("EVIDENCE_DEPENDENCY"),
  "conditional AI blocked",
);

const empty = runWorkloadHarness(fixtureWl, {
  runId: "r3",
  collectedAtMs: 3000,
  numericValues: [],
});
assertCase("harness.empty", empty.ok === false, "empty values rejected");

const registry = createBaselineRegistry();
assertCase("base.empty", registry.size() === 0, "baseline registry starts empty");

if (run.ok) {
  const created = registry.createFromRun("base-1", run.value, {
    reproducible: true,
  });
  assertCase("base.create", created.ok === true, "baseline created");
  if (created.ok) {
    assertCase("base.not.budget", created.value.isBudget === false, "baseline ≠ budget");
    assertCase(
      "base.evidence",
      created.value.evidence.workloadId === fixtureWl.workloadId &&
        created.value.evidence.observationCount === 2,
      "evidence provenance",
    );
    assertCase("base.lookup", registry.get("base-1")?.baselineId === "base-1", "lookup");
  }

  const incomplete = registry.createFromRun("base-bad", {
    ...run.value,
    aggregation: { batchId: "x", observationCount: 0, signals: [] },
  });
  assertCase("base.reject.empty", incomplete.ok === false, "empty agg cannot baseline");

  const unrepro = registry.createFromRun("base-u", run.value, {
    reproducible: false,
  });
  assertCase("base.reject.unrepro", unrepro.ok === false, "unreproducible rejected");
}

const piped = runWorkloadAndCreateBaseline(
  fixtureWl,
  { runId: "r4", collectedAtMs: 4000, numericValues: [2, 4] },
  "base-2",
);
assertCase("pipeline.ok", piped.ok === true, "workload→baseline pipeline");

if (piped.ok && registry.get("base-1")) {
  const left = registry.get("base-1")!;
  const right = piped.value.baseline;
  const cmp = compareBaselineComparability(left, right);
  assertCase(
    "compare.comparable",
    cmp.outcome === "COMPARABLE",
    `outcome=${cmp.outcome}`,
  );

  const other = {
    ...right,
    workloadId: "other",
    baselineId: "other-base",
  };
  const blocked = compareBaselineComparability(left, other);
  assertCase("compare.blocked", blocked.outcome === "BLOCKED", "different workload blocked");

  const missing = compareBaselineComparability(left, null);
  assertCase("compare.inconclusive", missing.outcome === "INCONCLUSIVE", "missing baseline");
}

// Baseline ≠ budget separation
const budgets = createBudgetRegistry();
assertCase("budget.still.separate", budgets.size() === 0, "budget registry independent");
if (piped.ok) {
  const evalAsBudget = evaluateBudget(
    {
      budgetId: "fixture",
      label: "fixture",
      sourceLabel: "engine",
      signalName: "flow",
      statistic: "max",
      comparator: "lte",
      threshold: 100,
      kind: "fixture",
    },
    piped.value.baseline.aggregation,
  );
  assertCase(
    "baseline.not.auto.budget",
    piped.value.baseline.isBudget === false && evalAsBudget.outcome === "PASS",
    "baseline remains non-budget; budget eval is separate C-BUD path",
  );
}

const barrel = readFileSync(join(performanceDir, "index.ts"), "utf8");
assertCase(
  "barrel.exports.i4",
  /runWorkloadHarness/.test(barrel) &&
    /createBaselineRegistry/.test(barrel) &&
    /PERFORMANCE_COMPONENT_C_WL/.test(barrel),
  "barrel exports I4",
);
assertCase(
  "barrel.no.optimize",
  !/\b(OptimizationEngine|autoOptimize)\b/.test(barrel),
  "no optimization",
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
    `no.optimize.${rel}`,
    !/\b(OptimizationEngine|autoOptimize|AdaptiveTuner)\b/.test(src),
    "clean",
  );
  assertCase(
    `no.ci.${rel}`,
    !/\b(PerformanceCiGate|registerPerformanceGate)\b/.test(src),
    "clean",
  );
}

assertCase(
  "persistence.scope",
  readFileSync(join(performanceDir, "workloads/baseline.ts"), "utf8").includes(
    "process-local Map",
  ),
  "in-memory persistence documented in code",
);

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
  console.error(`\nvalidate-performance-workloads: ${failed.length} failure(s)`);
  process.exit(1);
}
console.log(`\nvalidate-performance-workloads: ${results.length} checks PASS`);
