import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { AssumptionTrackerAnalysis } from "../src/lib/scientific/methodology/assumptions";
import type { ConsistencyEngineAnalysis } from "../src/lib/scientific/methodology/consistency";
import type { EvidenceStrengthEngineAnalysis } from "../src/lib/scientific/methodology/evidence";
import type { PublicationReadinessAnalyzerAnalysis } from "../src/lib/scientific/methodology/readiness";
import type { ReportQualityEngineAnalysis } from "../src/lib/scientific/methodology/report-quality";
import type { ReproducibilityExplorerAnalysis } from "../src/lib/scientific/methodology/reproducibility";
import {
  buildMethodologicalDashboardAnalysis,
  canBuildMethodologicalDashboard,
  getMethodologicalDashboardReportLines,
} from "../src/lib/scientific/methodology/summary";
import {
  assertBarrelApiFreeze,
  assertMethodologyBoundaryClean,
  assertModuleFilesPresent,
  assertPageImportsBarrels,
  assertPageNoInlinePatterns,
  approxEqual,
  collectMethodologyTsFiles,
  createCaseRecorder,
  emitGateSummary,
  getRepoRoot,
} from "./lib/methodology-gate-utils";

const repoRoot = getRepoRoot(import.meta.url);
const { results, assertCase } = createCaseRecorder();

const mockConsistencyStrong: ConsistencyEngineAnalysis = {
  consistencyScore: 90,
  classification: "very-strong",
  evidenceCount: 4,
  supportingModules: ["pca"],
  interpretation: ["Strong consistency."],
};

const mockReportQualityStrong: ReportQualityEngineAnalysis = {
  qualityScore: 90,
  classification: "excellent",
  evaluatedCriteria: 5,
  interpretation: ["Excellent quality."],
};

const mockReproducibilityStrong: ReproducibilityExplorerAnalysis = {
  reproducibilityScore: 90,
  classification: "very-high",
  evaluatedFactors: 5,
  interpretation: ["Very high reproducibility."],
};

const mockEvidenceStrong: EvidenceStrengthEngineAnalysis = {
  evidenceScore: 90,
  classification: "very-strong",
  evidenceSources: 5,
  interpretation: ["Very strong evidence."],
};

const mockAssumptionsExcellent: AssumptionTrackerAnalysis = {
  overallScore: 90,
  classification: "excellent",
  assumptions: [],
  interpretation: ["Excellent assumptions."],
};

const mockReadinessReady: PublicationReadinessAnalyzerAnalysis = {
  readinessScore: 90,
  classification: "publication-ready",
  evaluatedAreas: 5,
  interpretation: ["Ready for publication."],
};

const emptyDashboardInput = {
  consistencyEngineAnalysis: null,
  reportQualityEngineAnalysis: null,
  reproducibilityExplorerAnalysis: null,
  evidenceStrengthEngineAnalysis: null,
  assumptionTrackerAnalysis: null,
  publicationReadinessAnalyzerAnalysis: null,
};

// --- SCI-56 behavioral ---

assertCase(
  "sci56.builder.empty-input",
  buildMethodologicalDashboardAnalysis(emptyDashboardInput) === null,
  "empty upstream returns null"
);

assertCase(
  "sci56.can-build.empty-input",
  canBuildMethodologicalDashboard(emptyDashboardInput) === false,
  "canBuild false when all upstream null"
);

assertCase(
  "sci56.can-build.single-upstream",
  canBuildMethodologicalDashboard({
    ...emptyDashboardInput,
    consistencyEngineAnalysis: mockConsistencyStrong,
  }),
  "consistency alone satisfies canBuild gate"
);

const fullChainDashboard = buildMethodologicalDashboardAnalysis({
  consistencyEngineAnalysis: mockConsistencyStrong,
  reportQualityEngineAnalysis: mockReportQualityStrong,
  reproducibilityExplorerAnalysis: mockReproducibilityStrong,
  evidenceStrengthEngineAnalysis: mockEvidenceStrong,
  assumptionTrackerAnalysis: mockAssumptionsExcellent,
  publicationReadinessAnalyzerAnalysis: mockReadinessReady,
});

assertCase("sci56.builder.full-chain-not-null", fullChainDashboard !== null);
assertCase(
  "sci56.integration.sci50-to-sci55-cards",
  fullChainDashboard !== null &&
    fullChainDashboard.summaryCards.consistencyScore !== undefined &&
    fullChainDashboard.summaryCards.qualityScore !== undefined &&
    fullChainDashboard.summaryCards.reproducibilityScore !== undefined &&
    fullChainDashboard.summaryCards.evidenceScore !== undefined &&
    fullChainDashboard.summaryCards.assumptionScore !== undefined &&
    fullChainDashboard.summaryCards.readinessScore !== undefined,
  fullChainDashboard
    ? Object.keys(fullChainDashboard.summaryCards).join(", ")
    : "null"
);
assertCase(
  "sci56.integration.evaluated-engines",
  fullChainDashboard?.evaluatedEngines === 6,
  fullChainDashboard ? String(fullChainDashboard.evaluatedEngines) : "null"
);
assertCase(
  "sci56.integration.overall-health-score",
  fullChainDashboard !== null &&
    approxEqual(fullChainDashboard.overallHealthScore, 90),
  fullChainDashboard ? String(fullChainDashboard.overallHealthScore) : "null"
);
assertCase(
  "sci56.integration.readiness-classification",
  fullChainDashboard?.summaryCards.readinessClassification === "publication-ready",
  fullChainDashboard?.summaryCards.readinessClassification
);

const partialDashboard = buildMethodologicalDashboardAnalysis({
  ...emptyDashboardInput,
  consistencyEngineAnalysis: mockConsistencyStrong,
});

assertCase("sci56.builder.partial-not-null", partialDashboard !== null);
assertCase(
  "sci56.builder.partial-engines",
  partialDashboard?.evaluatedEngines === 1,
  partialDashboard ? String(partialDashboard.evaluatedEngines) : "null"
);
assertCase(
  "sci56.builder.partial-health-score",
  partialDashboard !== null &&
    approxEqual(partialDashboard.overallHealthScore, 90),
  partialDashboard ? String(partialDashboard.overallHealthScore) : "null"
);

const fullChainReport = getMethodologicalDashboardReportLines(fullChainDashboard);
assertCase(
  "sci56.report-lines.present",
  fullChainReport.length >= 5 &&
    fullChainReport[0].startsWith("Overall Health Score:") &&
    fullChainReport.some((line) => line.startsWith("Consistency:")) &&
    fullChainReport.some((line) => line.startsWith("Publication Readiness:")),
  fullChainReport.join(" | ")
);
assertCase(
  "sci56.report-lines.empty",
  getMethodologicalDashboardReportLines(null)[0] ===
    "No hay datos suficientes para generar Methodological Summary Dashboard."
);

// --- Structural: page.tsx has no inline SCI-56 domain ---

const pageSource = readFileSync(join(repoRoot, "src/app/page.tsx"), "utf8");

assertPageNoInlinePatterns(assertCase, pageSource, [
  /const\s+buildMethodologicalDashboardAnalysis\s*=/,
  /const\s+canBuildMethodologicalDashboard\s*=/,
  /type\s+MethodologicalDashboardAnalysis\s*=\s*\{/,
]);

assertPageImportsBarrels(assertCase, pageSource, [
  {
    id: "summary-barrel",
    needle: 'from "@/lib/scientific/methodology/summary"',
  },
]);

// --- Structural: barrel public API ---

assertBarrelApiFreeze(assertCase, repoRoot, {
  "src/lib/scientific/methodology/summary/index.ts": [
    "MethodologicalDashboardAnalysis",
    "MethodologicalDashboardBuildInput",
    "buildMethodologicalDashboardAnalysis",
    "canBuildMethodologicalDashboard",
    "getMethodologicalDashboardReportLines",
  ],
});

// --- Structural: boundary-clean ---

assertMethodologyBoundaryClean(assertCase, repoRoot);

// --- Structural: acyclic imports ---

const methodologyRoot = join(repoRoot, "src/lib/scientific/methodology");
const methodologyFiles = collectMethodologyTsFiles(repoRoot);

const summarySources = methodologyFiles
  .filter((path) => path.includes(`${join("methodology", "summary")}`))
  .map((path) => readFileSync(path, "utf8"));

assertCase(
  "structure.acyclic.summary-no-publication",
  summarySources.every((source) => !source.includes("methodology/publication"))
);

assertCase(
  "structure.acyclic.summary-imports-readiness",
  readFileSync(join(methodologyRoot, "summary", "input-types.ts"), "utf8").includes(
    'from "@/lib/scientific/methodology/readiness"'
  ) &&
    readFileSync(join(methodologyRoot, "summary", "types.ts"), "utf8").includes(
      'from "@/lib/scientific/methodology/readiness"'
    ) &&
    readFileSync(join(methodologyRoot, "summary", "reporting.ts"), "utf8").includes(
      'from "@/lib/scientific/methodology/readiness"'
    )
);

assertCase(
  "structure.acyclic.summary-build-input-chain",
  readFileSync(join(methodologyRoot, "summary", "input-types.ts"), "utf8").includes(
    "consistencyEngineAnalysis"
  ) &&
    readFileSync(join(methodologyRoot, "summary", "input-types.ts"), "utf8").includes(
      "publicationReadinessAnalyzerAnalysis"
    )
);

// --- Module presence ---

assertModuleFilesPresent(
  assertCase,
  repoRoot,
  ["summary"],
  ["types.ts", "input-types.ts", "build.ts", "reporting.ts", "index.ts"]
);

emitGateSummary("methodology-f5d-unit", results);
