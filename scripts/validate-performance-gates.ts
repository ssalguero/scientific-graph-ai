/**
 * PERFORMANCE-I8 — Regression / CI gates (C-GRD) readiness + behavioral gate.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  PERFORMANCE_COMPONENT_C_GRD,
  PERFORMANCE_GATES_STATUS,
  evaluateGateReadiness,
  gateOutcomeRequiresCiFailure,
  validateGateDefinition,
} from "../src/performance/gates";
import type { GateDefinition, GateEvidencePackage } from "../src/performance/gates";
import type { ComparisonResult } from "../src/performance/opt-waves";
import type { BudgetEvaluationResult } from "../src/performance/budgets";

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
  "src/performance/gates/index.ts",
  "src/performance/gates/identity.ts",
  "src/performance/gates/types.ts",
  "src/performance/gates/definition.ts",
  "src/performance/gates/evaluate.ts",
  "scripts/ci-performance-gates.ts",
  ".github/workflows/performance-gates.yml",
  "docs/PERFORMANCE/implementation/PERFORMANCE-I8-Regression-CI-Gates.md",
];

const FORBIDDEN_DIRS = [
  "src/performance/benchmarks",
  "src/performance/certification",
  "src/performance/validation",
  "src/performance/optimization",
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
    `no.forbidden.dir.${rel}`,
    !existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "forbidden" : "absent",
  );
}

assertCase("id.c-grd", PERFORMANCE_COMPONENT_C_GRD === "C-GRD", "C-GRD");
assertCase(
  "status",
  PERFORMANCE_GATES_STATUS === "REGRESSION_CI_GATES_COMPLETE",
  "I8 status",
);

const gate: GateDefinition = {
  gateId: "fixture.gate.cmp",
  label: "Fixture comparison gate",
  kind: "fixture",
  requireComparison: true,
  requireBudget: false,
  requireBaseline: false,
  requireWorkloadId: true,
};

const bad = validateGateDefinition({ ...gate, gateId: "" });
assertCase("def.reject", bad.ok === false, "rejects empty gateId");

const okDef = validateGateDefinition(gate);
assertCase("def.accept", okDef.ok === true, "accepts fixture gate");

const cmpOk: ComparisonResult = {
  outcome: "IMPROVED",
  reason: "fixture improved",
  attributed: true,
  beforeValue: 10,
  afterValue: 8,
};

const evidenceOk: GateEvidencePackage = {
  workloadId: "wl.1",
  comparison: cmpOk,
  measured: true,
  reproducible: true,
};

const pass = evaluateGateReadiness(gate, evidenceOk);
assertCase(
  "gate.pass",
  pass.outcome === "PASS" && !pass.ciShouldFail,
  `outcome=${pass.outcome}`,
);

const noEv = evaluateGateReadiness(gate, null);
assertCase(
  "gate.no.evidence",
  noEv.outcome === "EVIDENCE_DEPENDENCY" &&
    gateOutcomeRequiresCiFailure(noEv) &&
    noEv.reason.includes("NO REQUIRED EVIDENCE"),
  "missing evidence never PASS",
);

const missingCmp = evaluateGateReadiness(gate, {
  workloadId: "wl.1",
  measured: true,
});
assertCase(
  "gate.missing.cmp",
  missingCmp.outcome === "EVIDENCE_DEPENDENCY",
  `outcome=${missingCmp.outcome}`,
);

const regressed: ComparisonResult = {
  outcome: "REGRESSED",
  reason: "fixture regression",
  attributed: true,
  beforeValue: 1,
  afterValue: 5,
};
const fail = evaluateGateReadiness(gate, {
  workloadId: "wl.1",
  comparison: regressed,
  measured: true,
});
assertCase(
  "gate.regression.fail",
  fail.outcome === "FAIL" && gateOutcomeRequiresCiFailure(fail),
  `outcome=${fail.outcome}`,
);

const blockedCmp: ComparisonResult = {
  outcome: "BLOCKED",
  reason: "incompatible workloads",
  attributed: false,
};
const blocked = evaluateGateReadiness(gate, {
  workloadId: "wl.1",
  comparison: blockedCmp,
  measured: true,
});
assertCase(
  "gate.blocked",
  blocked.outcome === "BLOCKED" && blocked.outcome !== "PASS",
  `outcome=${blocked.outcome}`,
);

const inconclusCmp: ComparisonResult = {
  outcome: "INCONCLUSIVE",
  reason: "no attribution",
  attributed: false,
};
const inconclus = evaluateGateReadiness(gate, {
  workloadId: "wl.1",
  comparison: inconclusCmp,
  measured: true,
});
assertCase(
  "gate.inconclusive",
  inconclus.outcome === "INCONCLUSIVE" && inconclus.outcome !== "PASS",
  `outcome=${inconclus.outcome}`,
);

const budgetGate: GateDefinition = {
  ...gate,
  gateId: "fixture.gate.budget",
  requireComparison: false,
  requireBudget: true,
};
const budgetPass: BudgetEvaluationResult = {
  budgetId: "b1",
  outcome: "PASS",
  threshold: 10,
  reason: "ok",
  observedValue: 5,
};
const budgetOk = evaluateGateReadiness(budgetGate, {
  workloadId: "wl.1",
  budgetEvaluation: budgetPass,
  measured: true,
});
assertCase("gate.budget.pass", budgetOk.outcome === "PASS", "budget PASS");

const budgetMissing = evaluateGateReadiness(budgetGate, {
  workloadId: "wl.1",
  measured: true,
});
assertCase(
  "gate.budget.missing",
  budgetMissing.outcome === "EVIDENCE_DEPENDENCY",
  "missing budget never PASS",
);

const budgetFail: BudgetEvaluationResult = {
  budgetId: "b1",
  outcome: "FAIL",
  threshold: 1,
  reason: "over",
  observedValue: 9,
};
const budgetFailGate = evaluateGateReadiness(budgetGate, {
  workloadId: "wl.1",
  budgetEvaluation: budgetFail,
  measured: true,
});
assertCase(
  "gate.budget.fail",
  budgetFailGate.outcome === "FAIL",
  `outcome=${budgetFailGate.outcome}`,
);

const conditional = evaluateGateReadiness(gate, {
  workloadId: "wl.1",
  domainOrScenarioId: "ai",
  comparison: cmpOk,
  measured: true,
});
assertCase(
  "gate.conditional.ai",
  conditional.outcome === "CONDITIONAL",
  `outcome=${conditional.outcome}`,
);

const workflow = readFileSync(
  join(repoRoot, ".github/workflows/performance-gates.yml"),
  "utf8",
);
assertCase(
  "ci.workflow",
  workflow.includes("validate:performance-gates") &&
    workflow.includes("ci:performance-gates") &&
    workflow.includes("PERFORMANCE"),
  "PERFORMANCE CI workflow present",
);

const ciScript = readFileSync(
  join(repoRoot, "scripts/ci-performance-gates.ts"),
  "utf8",
);
assertCase(
  "ci.script.exits",
  ciScript.includes("process.exit") &&
    ciScript.includes("evaluateGateReadiness") &&
    ciScript.includes("gateOutcomeRequiresCiFailure"),
  "CI entry uses gate outcomes",
);

const barrel = readFileSync(join(performanceDir, "index.ts"), "utf8");
assertCase(
  "barrel.exports.i8",
  /evaluateGateReadiness/.test(barrel) &&
    /PERFORMANCE_COMPONENT_C_GRD/.test(barrel) &&
    /gateOutcomeRequiresCiFailure/.test(barrel),
  "barrel exports I8",
);
assertCase(
  "barrel.no.forbidden.ci.names",
  !/\b(PerformanceCiGate|registerPerformanceGate)\b/.test(barrel),
  "uses C-GRD names not forbidden stubs",
);
assertCase(
  "barrel.no.autonomous",
  !/\b(OptimizationEngine|autoOptimize|AdaptiveTuner)\b/.test(barrel),
  "no autonomous optimizer",
);
assertCase(
  "barrel.no.cert",
  !/\b(FinalCertificationPack|ReleaseCertificationEngine)\b/.test(barrel),
  "no I10 cert",
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
    `no.forbidden.ci.name.${rel}`,
    !/\b(PerformanceCiGate|registerPerformanceGate)\b/.test(src),
    "clean",
  );
  assertCase(
    `no.autonomous.${rel}`,
    !/\b(OptimizationEngine|autoOptimize|AdaptiveTuner)\b/.test(src),
    "clean",
  );
  if (rel.includes("/gates/")) {
    assertCase(
      `no.peer.dispatch.${rel}`,
      !/\b(executeCommand|configureEngine|configureData)\b/.test(src),
      "no peer dispatch",
    );
    assertCase(
      `no.optimize.exec.${rel}`,
      !/\brunOptimizationWave\b/.test(src),
      "gate does not run optimization",
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
  console.error(`\nvalidate-performance-gates: ${failed.length} failure(s)`);
  process.exit(1);
}
console.log(`\nvalidate-performance-gates: ${results.length} checks PASS`);
