/**
 * PERFORMANCE-I1 — Measurement core readiness + behavioral gate.
 *
 * Authority: PERFORMANCE-P1 · P3 · P6 I1 · P9 ·
 * docs/PERFORMANCE/implementation/PERFORMANCE-I1-Measurement-Core.md
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  PERFORMANCE_COMPONENT_C_AGG,
  PERFORMANCE_COMPONENT_C_COL,
  PERFORMANCE_MEASUREMENT_STATUS,
  aggregateBatch,
  appendObservation,
  collectObservation,
  collectObservations,
  collectThenAggregate,
  createCollectionBatch,
} from "../src/performance/measurement";

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

const REQUIRED_DIRS = [
  "src/performance/measurement",
  "docs/PERFORMANCE/implementation",
];

const REQUIRED_FILES = [
  "src/performance/measurement/index.ts",
  "src/performance/measurement/identity.ts",
  "src/performance/measurement/types.ts",
  "src/performance/measurement/collection.ts",
  "src/performance/measurement/aggregation.ts",
  "src/performance/measurement/pipeline.ts",
  "docs/PERFORMANCE/implementation/PERFORMANCE-I1-Measurement-Core.md",
  "docs/PERFORMANCE/implementation/PERFORMANCE-I0-Foundation.md",
];

const FORBIDDEN_DIRS = [
  "src/performance/adapters",
  "src/performance/baselines",
  "src/performance/optimization",
  "src/performance/validation",
  "src/performance/benchmarks",
  "src/performance/certification",
];

for (const rel of REQUIRED_DIRS) {
  assertCase(`layout.dir.${rel}`, existsSync(join(repoRoot, rel)), "present");
}
for (const rel of REQUIRED_FILES) {
  assertCase(`layout.file.${rel}`, existsSync(join(repoRoot, rel)), "present");
}
for (const rel of FORBIDDEN_DIRS) {
  assertCase(
    `no.future.dir.${rel}`,
    !existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "must not exist in I1" : "absent",
  );
}

assertCase(
  "identity.components",
  PERFORMANCE_COMPONENT_C_COL === "C-COL" && PERFORMANCE_COMPONENT_C_AGG === "C-AGG",
  "C-COL / C-AGG identity labels",
);
assertCase(
  "identity.status",
  PERFORMANCE_MEASUREMENT_STATUS === "MEASUREMENT_CORE_COMPLETE",
  "measurement core status marker",
);

const barrel = readFileSync(join(performanceDir, "index.ts"), "utf8");
assertCase(
  "barrel.exports.measurement",
  /collectThenAggregate/.test(barrel) &&
    /PERFORMANCE_MEASUREMENT_STATUS/.test(barrel) &&
    /PERFORMANCE_COMPONENT_C_COL/.test(barrel),
  "public barrel exports I1 measurement core",
);
assertCase(
  "barrel.no.adapter.api",
  !/\b(createEngineAdapter|instrumentEngine|attachProbe)\b/.test(barrel),
  "no instrumentation adapter APIs on barrel",
);
// I3 authorizes evaluateBudget / createBudgetRegistry on the public barrel.

// --- Behavioral: C-COL ---
const okObs = collectObservation({
  observationId: "o1",
  sourceLabel: "seam.a",
  signalName: "latency",
  numericValue: 10,
  collectedAtMs: 100,
});
assertCase("ccol.accept.valid", okObs.ok === true, "accepts valid observation");

const badObs = collectObservation({
  observationId: "",
  sourceLabel: "seam.a",
  signalName: "latency",
  numericValue: 10,
  collectedAtMs: 100,
});
assertCase("ccol.reject.empty.id", badObs.ok === false, "rejects empty observationId");

const nanObs = collectObservation({
  observationId: "o2",
  sourceLabel: "seam.a",
  signalName: "latency",
  numericValue: Number.NaN,
  collectedAtMs: 100,
});
assertCase("ccol.reject.nan", nanObs.ok === false, "rejects NaN numericValue");

const batchCreated = createCollectionBatch("batch-1");
assertCase("ccol.batch.create", batchCreated.ok === true, "creates empty batch");

let batch = batchCreated.ok ? batchCreated.value : null;
if (batch) {
  const a1 = appendObservation(batch, {
    observationId: "o1",
    sourceLabel: "seam.a",
    signalName: "latency",
    numericValue: 10,
    collectedAtMs: 100,
  });
  assertCase("ccol.append", a1.ok === true, "appends observation");
  batch = a1.ok ? a1.value : batch;
  const dup = appendObservation(batch, {
    observationId: "o1",
    sourceLabel: "seam.a",
    signalName: "latency",
    numericValue: 11,
    collectedAtMs: 101,
  });
  assertCase("ccol.reject.duplicate", dup.ok === false, "rejects duplicate observationId");
}

// --- Behavioral: Collect → Aggregate ---
const inputs = [
  {
    observationId: "b",
    sourceLabel: "ux",
    signalName: "render",
    numericValue: 5,
    collectedAtMs: 200,
  },
  {
    observationId: "a",
    sourceLabel: "engine",
    signalName: "flow",
    numericValue: 3,
    collectedAtMs: 100,
  },
  {
    observationId: "c",
    sourceLabel: "engine",
    signalName: "flow",
    numericValue: 7,
    collectedAtMs: 150,
  },
] as const;

const collected = collectObservations("run-1", inputs);
assertCase("ccol.batch.collect", collected.ok === true && collected.value.observations.length === 3, "collects batch");

const aggregated = collected.ok ? aggregateBatch(collected.value) : { ok: false as const, error: "skip" };
assertCase("cagg.ok", aggregated.ok === true, "aggregates batch");

if (aggregated.ok) {
  const view = aggregated.value;
  assertCase("cagg.count", view.observationCount === 3, `observationCount=${view.observationCount}`);
  assertCase("cagg.signals.len", view.signals.length === 2, `signals=${view.signals.length}`);
  const engineFlow = view.signals.find((s) => s.sourceLabel === "engine" && s.signalName === "flow");
  assertCase(
    "cagg.engine.flow",
    !!engineFlow &&
      engineFlow.count === 2 &&
      engineFlow.sum === 10 &&
      engineFlow.min === 3 &&
      engineFlow.max === 7,
    "engine/flow aggregates deterministically",
  );
  assertCase(
    "cagg.order",
    view.signals[0]?.sourceLabel === "engine" && view.signals[1]?.sourceLabel === "ux",
    "signals sorted by sourceLabel then signalName",
  );
}

const pipeline = collectThenAggregate("run-2", inputs);
assertCase("pipeline.ok", pipeline.ok === true, "collectThenAggregate succeeds");

const pipeline2 = collectThenAggregate("run-2", inputs);
assertCase(
  "pipeline.deterministic",
  pipeline.ok &&
    pipeline2.ok &&
    JSON.stringify(pipeline.value) === JSON.stringify(pipeline2.value),
  "identical inputs produce identical AggregationView",
);

const incomplete = collectThenAggregate("run-3", [
  {
    observationId: "x",
    sourceLabel: "",
    signalName: "flow",
    numericValue: 1,
    collectedAtMs: 1,
  },
]);
assertCase("pipeline.reject.incomplete", incomplete.ok === false, "rejects incomplete input");

// --- Isolation / scope ---
const tsFiles = collectTsFiles(performanceDir);
for (const file of tsFiles) {
  const src = readFileSync(file, "utf8");
  const rel = relFromRepo(file);
  const peerHit = /from\s+["']@\/(engine|data|ai|ui|plugins|collab|components|app)(\/|["'])/.test(src);
  const inInstrumentation = rel.includes("/instrumentation/");
  if (inInstrumentation) {
    // I2 may import @/engine|/data|/ui public barrels; checked by I2 validator.
    assertCase(`peer.import.deferred.${rel}`, true, "I2 instrumentation peer imports validated separately");
  } else {
    assertCase(`no.peer.import.${rel}`, !peerHit, peerHit ? "peer import forbidden outside instrumentation" : "clean");
  }
  const inBudgets =
    rel.includes("/budgets/") ||
    rel.endsWith("src/performance/index.ts") ||
    rel.endsWith("src/performance/public/index.ts");
  // I3 authorizes budget policy APIs in budgets/ and public barrel re-exports.
  if (!inBudgets) {
    const budgetHit = /\b(SloRegistry|numericBudget)\b/.test(src);
    assertCase(
      `no.invented.budget.${rel}`,
      !budgetHit,
      budgetHit ? "invented budget API forbidden" : "clean",
    );
  }
  const optHit = /\b(autoOptimize|OptimizationEngine|AdaptiveTuner)\b/.test(src);
  assertCase(`no.optimize.${rel}`, !optHit, optHit ? "optimization API forbidden" : "clean");
  const harnessHit = /\b(BenchmarkSuite|runBenchmark)\b/.test(src);
  assertCase(`no.benchmark.${rel}`, !harnessHit, harnessHit ? "benchmark suite forbidden" : "clean");
  const adapterHit = /\b(InstrumentationAdapter|createEngineAdapter|attachProbe)\b/.test(src);
  assertCase(`no.adapter.${rel}`, !adapterHit, adapterHit ? "adapter API forbidden" : "clean");
}

assertCase(
  "package.ts.count.bounded",
  tsFiles.length <= 90,
  `I1+ package remains lean (found ${tsFiles.length} .ts files)`,
);

for (const peer of ["src/engine", "src/data", "src/ai", "src/ui", "src/plugins"]) {
  assertCase(`peer.root.${peer}`, existsSync(join(repoRoot, peer)), "peer untouched structurally");
}

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(`\nvalidate-performance-measurement-core: ${failed.length} failure(s)`);
  process.exit(1);
}

console.log(`\nvalidate-performance-measurement-core: ${results.length} checks PASS`);
