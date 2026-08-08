/**
 * PERFORMANCE-I6 — Cross-domain scenarios readiness + behavioral gate.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  PERFORMANCE_CROSS_DOMAIN_STATUS,
  PRIMARY_CROSS_DOMAIN_SCENARIO,
  getCrossDomainScenario,
  listCrossDomainScenarios,
  observeDomainSequence,
  rejectUnsupportedCrossDomainPath,
  runCrossDomainScenario,
  validateCrossDomainScenario,
} from "../src/performance/cross-domain";
import {
  createBudgetRegistry,
  validateBudgetDefinition,
} from "../src/performance/budgets";
import { createBaselineRegistry } from "../src/performance/workloads";
import { rejectCrossDomainWaveAttempt } from "../src/performance/domain-waves";

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
  "src/performance/cross-domain/index.ts",
  "src/performance/cross-domain/identity.ts",
  "src/performance/cross-domain/types.ts",
  "src/performance/cross-domain/scenarios.ts",
  "src/performance/cross-domain/sequence.ts",
  "src/performance/cross-domain/observe.ts",
  "src/performance/cross-domain/run.ts",
  "docs/PERFORMANCE/implementation/PERFORMANCE-I6-Cross-Domain-Scenarios.md",
];

const FORBIDDEN_DIRS = [
  "src/performance/optimization",
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

assertCase(
  "status",
  PERFORMANCE_CROSS_DOMAIN_STATUS === "CROSS_DOMAIN_SCENARIOS_COMPLETE",
  "I6 status",
);

assertCase(
  "primary.sequence",
  PRIMARY_CROSS_DOMAIN_SCENARIO.domainSequence.join("→") === "ux→engine→data",
  PRIMARY_CROSS_DOMAIN_SCENARIO.domainSequence.join("→"),
);

assertCase(
  "catalog.has.primary",
  getCrossDomainScenario("ux-engine-data")?.scenarioId === "ux-engine-data" &&
    listCrossDomainScenarios().length === 1,
  "catalog",
);

const seqOk = validateCrossDomainScenario(PRIMARY_CROSS_DOMAIN_SCENARIO);
assertCase("sequence.valid", seqOk.ok === true, "primary sequence valid");

const withAi = validateCrossDomainScenario({
  ...PRIMARY_CROSS_DOMAIN_SCENARIO,
  scenarioId: "ux-engine-ai",
  domainSequence: ["ux", "engine", "ai"],
});
assertCase(
  "sequence.ai.conditional",
  withAi.ok === false && withAi.outcome === "CONDITIONAL",
  "AI remains conditional",
);

const observed = observeDomainSequence(
  ["ux", "engine", "data"],
  "i6-obs",
  1000,
);
assertCase("observe.sequence", observed.ok === true, "UX→ENGINE→DATA observe");
if (observed.ok) {
  assertCase(
    "observe.steps",
    observed.value.steps.map((s) => s.domain).join("→") === "ux→engine→data" &&
      observed.value.steps.every((s) => s.observationCount > 0),
    "ordered steps with observations",
  );
  const labels = new Set(
    observed.value.aggregation.signals.map((s) => s.sourceLabel),
  );
  assertCase(
    "observe.attribution",
    labels.has("ux") && labels.has("engine") && labels.has("data"),
    `labels=${[...labels].join(",")}`,
  );
}

const primary = runCrossDomainScenario({
  scenario: PRIMARY_CROSS_DOMAIN_SCENARIO,
  runId: "r1",
  collectedAtMs: 2000,
});
assertCase(
  "run.primary",
  primary.outcome === "PASS" &&
    primary.measured &&
    primary.domainSequence.join("→") === "ux→engine→data" &&
    primary.budgetEvaluation === null,
  `outcome=${primary.outcome}`,
);

const conditionalRun = runCrossDomainScenario({
  scenario: {
    scenarioId: "with-plugins",
    label: "unsupported optional",
    kind: "fixture",
    domainSequence: ["ux", "engine", "plugins"],
  },
  runId: "r2",
  collectedAtMs: 3000,
});
assertCase(
  "run.plugins.conditional",
  conditionalRun.outcome === "CONDITIONAL" && !conditionalRun.measured,
  `outcome=${conditionalRun.outcome}`,
);

const unsupported = rejectUnsupportedCrossDomainPath(["ai", "collab"]);
assertCase(
  "reject.unsupported",
  unsupported.outcome === "BLOCKED",
  "unsupported path blocked",
);

const i5reject = rejectCrossDomainWaveAttempt(["engine", "data"]);
assertCase(
  "i5.still.rejects.cross",
  i5reject.outcome === "BLOCKED",
  "I5 domain waves stay single-domain",
);

const budgets = createBudgetRegistry();
const fixtureBudget = {
  budgetId: "fixture.i6.ux.token",
  label: "Fixture — not product budget",
  sourceLabel: "ux",
  signalName: "public.token.contract.version.length",
  statistic: "max" as const,
  comparator: "gte" as const,
  threshold: 1,
  kind: "fixture" as const,
};
const vb = validateBudgetDefinition(fixtureBudget);
assertCase("budget.fixture", vb.ok === true, "fixture budget");
if (vb.ok) {
  budgets.register(vb.value);
}

const withBudget = runCrossDomainScenario({
  scenario: PRIMARY_CROSS_DOMAIN_SCENARIO,
  runId: "r-budget",
  collectedAtMs: 4000,
  budgetId: fixtureBudget.budgetId,
  budgetRegistry: budgets,
});
assertCase(
  "run.budget",
  withBudget.measured &&
    withBudget.budgetEvaluation !== null &&
    (withBudget.outcome === "PASS" ||
      withBudget.outcome === "FAIL" ||
      withBudget.outcome === "INCONCLUSIVE" ||
      withBudget.outcome === "BLOCKED" ||
      withBudget.outcome === "EVIDENCE_DEPENDENCY"),
  `outcome=${withBudget.outcome} budget=${withBudget.budgetEvaluation?.outcome}`,
);

const missingBudget = runCrossDomainScenario({
  scenario: PRIMARY_CROSS_DOMAIN_SCENARIO,
  runId: "r-missing",
  collectedAtMs: 5000,
  budgetId: "missing",
  budgetRegistry: budgets,
});
assertCase(
  "missing.budget.never.pass",
  missingBudget.outcome === "INCONCLUSIVE" && missingBudget.measured,
  `outcome=${missingBudget.outcome}`,
);

const baselines = createBaselineRegistry();
const withBaseline = runCrossDomainScenario({
  scenario: PRIMARY_CROSS_DOMAIN_SCENARIO,
  runId: "r-base",
  collectedAtMs: 6000,
  createBaseline: true,
  baselineId: "base.i6.1",
  baselineRegistry: baselines,
});
assertCase(
  "run.baseline",
  withBaseline.outcome === "PASS" &&
    withBaseline.baseline?.isBudget === false &&
    withBaseline.workload?.workloadClass === "cross-domain" &&
    Boolean(withBaseline.evidence?.notes.includes("ux→engine→data")),
  "baseline+evidence",
);

const emptyRun = runCrossDomainScenario({
  scenario: PRIMARY_CROSS_DOMAIN_SCENARIO,
  runId: "",
  collectedAtMs: 7000,
});
assertCase("blocked.empty.run", emptyRun.outcome === "BLOCKED", "empty runId");

const singleDomain = validateCrossDomainScenario({
  scenarioId: "only-engine",
  label: "not cross",
  kind: "fixture",
  domainSequence: ["engine"],
});
assertCase(
  "reject.single.domain",
  singleDomain.ok === false && singleDomain.outcome === "BLOCKED",
  "single domain is not cross-domain",
);

const barrel = readFileSync(join(performanceDir, "index.ts"), "utf8");
assertCase(
  "barrel.exports.i6",
  /runCrossDomainScenario/.test(barrel) &&
    /PRIMARY_CROSS_DOMAIN_SCENARIO/.test(barrel) &&
    /PERFORMANCE_CROSS_DOMAIN_STATUS/.test(barrel),
  "barrel exports I6",
);
assertCase(
  "barrel.no.optimize",
  !/\b(OptimizationEngine|autoOptimize)\b/.test(barrel),
  "no optimization",
);
assertCase(
  "barrel.no.ci",
  !/\b(PerformanceCiGate|registerPerformanceGate)\b/.test(barrel),
  "no CI",
);

const observeSrc = readFileSync(
  join(performanceDir, "cross-domain/observe.ts"),
  "utf8",
);
assertCase(
  "reuses.i2.adapters",
  /observeUxPublicSurface/.test(observeSrc) &&
    /observeEnginePublicSurface/.test(observeSrc) &&
    /observeDataPublicSurface/.test(observeSrc) &&
    /bindAdapterObservations/.test(observeSrc),
  "I2 adapters reused",
);
assertCase(
  "no.new.adapter.imports",
  !/@\/(engine|data|ui|ai|plugins)/.test(observeSrc),
  "no direct peer imports in I6 observe",
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
  if (rel.includes("/cross-domain/")) {
    assertCase(
      `no.product.orch.${rel}`,
      !/\b(executeCommand|configureEngine|configureData|ProductOrchestrator)\b/.test(
        src,
      ),
      "no peer lifecycle dispatch",
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
  console.error(`\nvalidate-performance-cross-domain: ${failed.length} failure(s)`);
  process.exit(1);
}
console.log(`\nvalidate-performance-cross-domain: ${results.length} checks PASS`);
