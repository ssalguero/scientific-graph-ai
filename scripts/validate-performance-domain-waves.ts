/**
 * PERFORMANCE-I5 — Domain-scoped measurement waves readiness + behavioral gate.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  PERFORMANCE_DOMAIN_WAVE_STATUS,
  getDomainWaveTarget,
  listActiveDomainWaveTargets,
  listConditionalDomainWaveTargets,
  observeSingleDomainSurface,
  rejectCrossDomainWaveAttempt,
  runDomainMeasurementWave,
} from "../src/performance/domain-waves";
import {
  createBudgetRegistry,
  validateBudgetDefinition,
} from "../src/performance/budgets";
import { createBaselineRegistry } from "../src/performance/workloads";

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
  "src/performance/domain-waves/index.ts",
  "src/performance/domain-waves/identity.ts",
  "src/performance/domain-waves/types.ts",
  "src/performance/domain-waves/targets.ts",
  "src/performance/domain-waves/observe.ts",
  "src/performance/domain-waves/wave.ts",
  "docs/PERFORMANCE/implementation/PERFORMANCE-I5-Domain-Measurement-Waves.md",
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
  PERFORMANCE_DOMAIN_WAVE_STATUS === "DOMAIN_MEASUREMENT_WAVES_COMPLETE",
  "I5 status",
);

const active = listActiveDomainWaveTargets();
assertCase(
  "active.domains",
  active.map((t) => t.domain).join(",") === "engine,data,ux",
  `active=${active.map((t) => t.domain).join(",")}`,
);

const conditional = listConditionalDomainWaveTargets();
assertCase(
  "conditional.domains",
  conditional.map((t) => t.domain).sort().join(",") === "ai,collab,plugins",
  `conditional=${conditional.map((t) => t.domain).join(",")}`,
);

assertCase(
  "target.engine.active",
  getDomainWaveTarget("engine").kind === "active",
  "engine active",
);
assertCase(
  "target.ai.conditional",
  getDomainWaveTarget("ai").kind === "conditional",
  "ai conditional",
);

const engObs = observeSingleDomainSurface("engine", "i5-eng", 1000);
assertCase("observe.engine", engObs.ok === true, "engine surface");
if (engObs.ok) {
  assertCase(
    "observe.engine.domain-only",
    engObs.value.signals.every((s) => s.sourceLabel === "engine"),
    "engine-only signals",
  );
}

const aiObs = observeSingleDomainSurface("ai", "i5-ai", 2000);
assertCase(
  "observe.ai.blocked",
  aiObs.ok === false && String(aiObs.error).includes("EVIDENCE_DEPENDENCY"),
  "ai not fabricated",
);

const engineWave = runDomainMeasurementWave({
  domain: "engine",
  runId: "eng-1",
  collectedAtMs: 3000,
});
assertCase(
  "wave.engine",
  engineWave.outcome === "PASS" &&
    engineWave.measured &&
    engineWave.domain === "engine" &&
    engineWave.budgetEvaluation === null,
  `outcome=${engineWave.outcome}`,
);

const dataWave = runDomainMeasurementWave({
  domain: "data",
  runId: "data-1",
  collectedAtMs: 4000,
});
assertCase(
  "wave.data",
  dataWave.outcome === "PASS" && dataWave.measured && dataWave.domain === "data",
  `outcome=${dataWave.outcome}`,
);

const uxWave = runDomainMeasurementWave({
  domain: "ux",
  runId: "ux-1",
  collectedAtMs: 5000,
});
assertCase(
  "wave.ux",
  uxWave.outcome === "PASS" && uxWave.measured && uxWave.domain === "ux",
  `outcome=${uxWave.outcome}`,
);

for (const domain of ["ai", "collab", "plugins"] as const) {
  const wave = runDomainMeasurementWave({
    domain,
    runId: `${domain}-1`,
    collectedAtMs: 6000,
  });
  assertCase(
    `wave.${domain}.conditional`,
    wave.outcome === "CONDITIONAL" &&
      !wave.measured &&
      wave.reason.includes("EVIDENCE_DEPENDENCY"),
    `outcome=${wave.outcome}`,
  );
}

const cross = rejectCrossDomainWaveAttempt(["engine", "data"]);
assertCase(
  "cross.domain.rejected",
  cross.outcome === "BLOCKED" && cross.reason.includes("I6"),
  "cross-domain blocked",
);

const budgets = createBudgetRegistry();
const fixtureBudget = {
  budgetId: "fixture.i5.engine.available",
  label: "Fixture — not product budget",
  sourceLabel: "engine",
  signalName: "public.createProject.available",
  statistic: "max" as const,
  comparator: "gte" as const,
  threshold: 1,
  kind: "fixture" as const,
};
const vb = validateBudgetDefinition(fixtureBudget);
assertCase("budget.fixture.valid", vb.ok === true, "fixture budget");
if (vb.ok) {
  const reg = budgets.register(vb.value);
  assertCase("budget.register", reg.ok === true, "registered");
}

const withBudget = runDomainMeasurementWave({
  domain: "engine",
  runId: "eng-budget",
  collectedAtMs: 7000,
  budgetId: "fixture.i5.engine.available",
  budgetRegistry: budgets,
});
assertCase(
  "wave.budget.pass",
  withBudget.outcome === "PASS" &&
    withBudget.budgetEvaluation?.outcome === "PASS" &&
    withBudget.measured,
  `outcome=${withBudget.outcome} budget=${withBudget.budgetEvaluation?.outcome}`,
);

const missingBudget = runDomainMeasurementWave({
  domain: "engine",
  runId: "eng-missing-budget",
  collectedAtMs: 8000,
  budgetId: "does.not.exist",
  budgetRegistry: budgets,
});
assertCase(
  "wave.budget.missing.never.pass",
  missingBudget.outcome === "INCONCLUSIVE" && missingBudget.measured,
  `outcome=${missingBudget.outcome}`,
);

const baselines = createBaselineRegistry();
const withBaseline = runDomainMeasurementWave({
  domain: "data",
  runId: "data-base",
  collectedAtMs: 9000,
  createBaseline: true,
  baselineId: "base.data.1",
  baselineRegistry: baselines,
});
assertCase(
  "wave.baseline",
  withBaseline.outcome === "PASS" &&
    withBaseline.baseline?.isBudget === false &&
    withBaseline.evidence?.workloadId === withBaseline.workload?.workloadId &&
    baselines.get("base.data.1") !== undefined,
  "baseline+evidence associated",
);

const emptyRun = runDomainMeasurementWave({
  domain: "engine",
  runId: "",
  collectedAtMs: 10000,
});
assertCase("wave.blocked.empty.run", emptyRun.outcome === "BLOCKED", "empty runId");

const observeSrc = readFileSync(
  join(performanceDir, "domain-waves/observe.ts"),
  "utf8",
);
assertCase(
  "no.multi.domain.helper",
  !/\bobserveSupportedPublicSeams\b/.test(observeSrc),
  "single-domain only",
);

const barrel = readFileSync(join(performanceDir, "index.ts"), "utf8");
assertCase(
  "barrel.exports.i5",
  /runDomainMeasurementWave/.test(barrel) &&
    /PERFORMANCE_DOMAIN_WAVE_STATUS/.test(barrel) &&
    /listActiveDomainWaveTargets/.test(barrel),
  "barrel exports I5",
);
assertCase(
  "barrel.no.optimize",
  !/\b(OptimizationEngine|autoOptimize)\b/.test(barrel),
  "no optimization",
);
assertCase(
  "barrel.no.ci",
  !/\b(PerformanceCiGate|registerPerformanceGate)\b/.test(barrel),
  "no CI gates",
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
  if (rel.includes("/domain-waves/")) {
    assertCase(
      `no.cross.orch.${rel}`,
      !/\b(runCrossDomain|CrossDomainScenario|endToEndScenario)\b/.test(src),
      "no I6 orchestration",
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
  console.error(`\nvalidate-performance-domain-waves: ${failed.length} failure(s)`);
  process.exit(1);
}
console.log(`\nvalidate-performance-domain-waves: ${results.length} checks PASS`);
