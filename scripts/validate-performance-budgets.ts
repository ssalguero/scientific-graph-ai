/**
 * PERFORMANCE-I3 — Budgets / SLOs (C-BUD) readiness + behavioral gate.
 *
 * Authority: PERFORMANCE-P2 · P3 · P6 I3 · P8 ·
 * docs/PERFORMANCE/implementation/PERFORMANCE-I3-Budgets-SLOs.md
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  PERFORMANCE_BUDGET_STATUS,
  PERFORMANCE_COMPONENT_C_BUD,
  collectAggregateThenEvaluateBudget,
  createBudgetRegistry,
  evaluateBudget,
  validateBudgetDefinition,
} from "../src/performance/budgets";
import { collectThenAggregate } from "../src/performance/measurement";
import type { BudgetDefinition } from "../src/performance/budgets";

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
  "src/performance/budgets/index.ts",
  "src/performance/budgets/identity.ts",
  "src/performance/budgets/types.ts",
  "src/performance/budgets/validate.ts",
  "src/performance/budgets/registry.ts",
  "src/performance/budgets/evaluate.ts",
  "src/performance/budgets/pipeline.ts",
  "docs/PERFORMANCE/implementation/PERFORMANCE-I3-Budgets-SLOs.md",
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

assertCase(
  "identity.c-bud",
  PERFORMANCE_COMPONENT_C_BUD === "C-BUD",
  "C-BUD identity",
);
assertCase(
  "status.marker",
  PERFORMANCE_BUDGET_STATUS === "BUDGETS_SLO_COMPLETE",
  "I3 status",
);

const fixtureBudget: BudgetDefinition = {
  budgetId: "fixture.max-lte-10",
  label: "Fixture only — not a product budget",
  sourceLabel: "engine",
  signalName: "flow",
  statistic: "max",
  comparator: "lte",
  threshold: 10,
  kind: "fixture",
};

const invalid = validateBudgetDefinition({
  ...fixtureBudget,
  budgetId: "",
});
assertCase("validate.reject.empty", invalid.ok === false, "rejects empty budgetId");

const valid = validateBudgetDefinition(fixtureBudget);
assertCase("validate.accept", valid.ok === true, "accepts fixture definition");

const registry = createBudgetRegistry();
assertCase("registry.empty", registry.size() === 0, "starts empty — no invented product budgets");

const reg1 = registry.register(fixtureBudget);
assertCase("registry.register", reg1.ok === true, "registers fixture");
const dup = registry.register(fixtureBudget);
assertCase("registry.duplicate", dup.ok === false, "rejects duplicate");
assertCase("registry.lookup", registry.get("fixture.max-lte-10")?.kind === "fixture", "lookup");
assertCase("registry.list", registry.list().length === 1, "list");

const agg = collectThenAggregate("b1", [
  {
    observationId: "a",
    sourceLabel: "engine",
    signalName: "flow",
    numericValue: 3,
    collectedAtMs: 1,
  },
  {
    observationId: "b",
    sourceLabel: "engine",
    signalName: "flow",
    numericValue: 7,
    collectedAtMs: 2,
  },
]);
assertCase("agg.ok", agg.ok === true, "aggregation for evaluation");

if (agg.ok) {
  const passEval = evaluateBudget(fixtureBudget, agg.value);
  assertCase(
    "eval.pass",
    passEval.outcome === "PASS" && passEval.observedValue === 7,
    `outcome=${passEval.outcome} observed=${passEval.observedValue}`,
  );

  const failBudget: BudgetDefinition = {
    ...fixtureBudget,
    budgetId: "fixture.max-lte-5",
    threshold: 5,
  };
  const failEval = evaluateBudget(failBudget, agg.value);
  assertCase("eval.fail", failEval.outcome === "FAIL", `outcome=${failEval.outcome}`);

  const missing = evaluateBudget(
    { ...fixtureBudget, budgetId: "missing-signal", signalName: "absent" },
    agg.value,
  );
  assertCase(
    "eval.inconclusive.missing",
    missing.outcome === "INCONCLUSIVE",
    "missing signal never PASS",
  );

  const nullAgg = evaluateBudget(fixtureBudget, null);
  assertCase(
    "eval.inconclusive.null",
    nullAgg.outcome === "INCONCLUSIVE",
    "null aggregation never PASS",
  );

  const blocked = evaluateBudget(fixtureBudget, {
    batchId: "",
    observationCount: 0,
    signals: [],
  });
  assertCase("eval.blocked", blocked.outcome === "BLOCKED", "invalid batch blocked");

  const conditional = evaluateBudget(
    {
      ...fixtureBudget,
      budgetId: "fixture.ai",
      sourceLabel: "ai",
      signalName: "pathway",
    },
    agg.value,
  );
  assertCase(
    "eval.evidence.dependency",
    conditional.outcome === "EVIDENCE_DEPENDENCY",
    "conditional AI missing evidence",
  );
}

const pipeline = collectAggregateThenEvaluateBudget(
  "pipe-1",
  [
    {
      observationId: "p1",
      sourceLabel: "engine",
      signalName: "flow",
      numericValue: 4,
      collectedAtMs: 1,
    },
  ],
  fixtureBudget,
);
assertCase(
  "pipeline.ok",
  pipeline.ok === true && pipeline.value.evaluation.outcome === "PASS",
  "Collect→Aggregate→BudgetEvaluate",
);

const barrel = readFileSync(join(performanceDir, "index.ts"), "utf8");
assertCase(
  "barrel.exports.i3",
  /createBudgetRegistry/.test(barrel) &&
    /evaluateBudget/.test(barrel) &&
    /PERFORMANCE_COMPONENT_C_BUD/.test(barrel),
  "barrel exports C-BUD",
);
assertCase(
  "barrel.no.workload",
  !/\b(BenchmarkSuite)\b/.test(barrel),
  "no benchmark suites",
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
    assertCase(`peer.forbid.${rel}::${spec}`, false, `disallowed peer import ${spec}`);
  }
  assertCase(
    `no.benchmark-suite.${rel}`,
    !/\b(BenchmarkSuite)\b/.test(src),
    "clean",
  );
  assertCase(
    `no.optimize.${rel}`,
    !/\b(OptimizationEngine|autoOptimize|AdaptiveTuner)\b/.test(src),
    "clean",
  );
  assertCase(
    `no.ci.gate.${rel}`,
    !/\b(PerformanceCiGate|registerPerformanceGate)\b/.test(src),
    "clean",
  );
}

assertCase(
  "no.product.budget.preload",
  !readFileSync(join(performanceDir, "budgets/registry.ts"), "utf8").includes(
    "PRODUCT_BUDGET",
  ),
  "registry has no product budget preload",
);

assertCase("package.ts.count.bounded", tsFiles.length <= 90, `found ${tsFiles.length}`);
assertCase("no.collab.src", !existsSync(join(repoRoot, "src/collab")), "no src/collab");

for (const peer of ["src/engine", "src/data", "src/ai", "src/ui", "src/plugins"]) {
  assertCase(`peer.root.${peer}`, existsSync(join(repoRoot, peer)), "present");
}

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(`\nvalidate-performance-budgets: ${failed.length} failure(s)`);
  process.exit(1);
}

console.log(`\nvalidate-performance-budgets: ${results.length} checks PASS`);
