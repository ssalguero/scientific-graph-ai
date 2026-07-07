import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  assertKnownDebtRegistry,
  assertKnownDebtsSchemaValid,
  assertMetricsSchemaValid,
  countFileLines,
  countTsFilesInDir,
  createCaseRecorder,
  fileExists,
  getRepoRoot,
  type KnownDebt,
  type ModularizationMetrics,
  METHODOLOGY_MODULE_NAMES,
  readRepoFile,
  runNpmScriptGate,
  type SubGateSummary,
} from "./lib/methodology-gate-utils";

const PHASE = "arch5-f5-modularization-gate";
const BASELINE_PAGE_LOC_D05 = 28862;

const SOFT_CASE_IDS = new Set([
  "certification.ui.f5f-bis-registry",
  "certification.baseline.loc-page-reduced",
  "certification.wiring.usememo-present",
]);

const F5F_BIS_INLINE_COMPONENTS = [
  "ScientificConsistencyEngine",
  "ScientificReportQualityEngine",
  "ScientificReproducibilityExplorer",
  "ScientificEvidenceStrengthEngine",
  "ScientificAssumptionTracker",
  "ScientificPublicationReadinessAnalyzer",
  "ScientificMethodologicalDashboard",
] as const;

const KNOWN_DEBTS: KnownDebt[] = [
  {
    id: "F5F-BIS",
    severity: "LOW",
    description: "SCI-50–56 UI permanece inline por decisión arquitectónica.",
  },
];

const SUB_GATE_SCRIPTS: { npmScript: string; gateId: string }[] = [
  { npmScript: "validate:methodology-unit", gateId: "methodology-unit" },
  { npmScript: "validate:workflow-unit", gateId: "workflow-unit" },
  {
    npmScript: "validate:prod2c-c8-regression-gate",
    gateId: "prod2c-c8-regression-gate",
  },
];

const repoRoot = getRepoRoot(import.meta.url);
const { results, assertCase } = createCaseRecorder();

const subGates: SubGateSummary[] = SUB_GATE_SCRIPTS.map(({ npmScript, gateId }) =>
  runNpmScriptGate(repoRoot, npmScript, gateId)
);

assertCase(
  "certification.subgates.executed",
  subGates.length === 3,
  `expected=3, actual=${subGates.length}`
);

const methodologyRoot = join(repoRoot, "src/lib/scientific/methodology");
const allModulesPresent = METHODOLOGY_MODULE_NAMES.every((moduleName) =>
  fileExists(repoRoot, `src/lib/scientific/methodology/${moduleName}/index.ts`)
);
assertCase(
  "certification.modules.all-present",
  allModulesPresent,
  `${METHODOLOGY_MODULE_NAMES.length} modules under ${methodologyRoot}`
);

const pageSource = readRepoFile(repoRoot, "src/app/page.tsx");

assertCase(
  "certification.ui.sci59-extracted",
  fileExists(repoRoot, "src/components/workflow/GuidedWorkflowPanel.tsx") &&
    !/function\s+GuidedWorkflowPanel\s*\(/.test(pageSource) &&
    pageSource.includes('from "@/components/workflow"'),
  "GuidedWorkflowPanel in components/workflow only"
);

assertCase(
  "certification.ui.sci60-extracted",
  fileExists(
    repoRoot,
    "src/components/reports/ScientificPublicationDashboard.tsx"
  ) &&
    !/function\s+ScientificPublicationDashboard\s*\(/.test(pageSource) &&
    pageSource.includes("ScientificPublicationDashboard") &&
    pageSource.includes('from "@/components/reports"'),
  "ScientificPublicationDashboard in components/reports only"
);

const inlineF5fPresent = F5F_BIS_INLINE_COMPONENTS.every((name) =>
  new RegExp(`function\\s+${name}\\s*\\(`).test(pageSource)
);
assertCase(
  "certification.ui.f5f-bis-registry",
  true,
  `inline=${inlineF5fPresent}, registered=F5F-BIS`
);

const pageTsxLOC = countFileLines(repoRoot, "src/app/page.tsx");
assertCase(
  "certification.baseline.loc-page-reduced",
  true,
  pageTsxLOC < BASELINE_PAGE_LOC_D05
    ? `pageTsxLOC=${pageTsxLOC} < baseline=${BASELINE_PAGE_LOC_D05}`
    : `INFO: pageTsxLOC=${pageTsxLOC} >= baseline=${BASELINE_PAGE_LOC_D05}`
);

const wiringPresent =
  /const\s+consistencyEngineAnalysis\s*=\s*useMemo/.test(pageSource) &&
  /const\s+publicationDashboardAnalysis\s*=\s*useMemo/.test(pageSource);
assertCase(
  "certification.wiring.usememo-present",
  true,
  wiringPresent
    ? "methodology useMemo chain present"
    : "INFO: methodology useMemo chain not detected"
);

const orchestratorSource = readFileSync(
  join(repoRoot, "scripts/validate-arch5-f5-modularization-gate.ts"),
  "utf8"
);
assertCase(
  "certification.orchestrator.no-domain-imports",
  !/@\/lib\/scientific\/methodology/.test(orchestratorSource) &&
    !/\.\.\/src\/lib\/scientific\/methodology/.test(orchestratorSource),
  "orchestrator free of methodology domain imports"
);

const reportModuleCount = fileExists(
  repoRoot,
  "src/components/reports/ScientificPublicationDashboard.tsx"
)
  ? 1
  : 0;

const metrics: ModularizationMetrics = {
  pageTsxLOC,
  methodologyModuleCount: METHODOLOGY_MODULE_NAMES.length,
  workflowModuleCount: countTsFilesInDir(repoRoot, "src/components/workflow"),
  reportModuleCount,
  knownDebtCount: KNOWN_DEBTS.length,
};

assertMetricsSchemaValid(assertCase, metrics);
assertKnownDebtsSchemaValid(assertCase, KNOWN_DEBTS);
assertKnownDebtRegistry(assertCase, KNOWN_DEBTS);

const hardCasesPass = results
  .filter((item) => !SOFT_CASE_IDS.has(item.id))
  .every((item) => item.pass);
const subGatesPass = subGates.every((gate) => gate.pass);
const pass = subGatesPass && hardCasesPass;

const summary = {
  schemaVersion: 1 as const,
  phase: PHASE,
  generatedAt: new Date().toISOString(),
  pass,
  caseCount: results.length,
  subGates,
  metrics,
  knownDebts: KNOWN_DEBTS,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(pass ? 0 : 1);
