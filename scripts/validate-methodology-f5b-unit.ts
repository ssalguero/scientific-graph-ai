import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { ConsistencyEngineAnalysis } from "../src/lib/scientific/methodology/consistency";
import type { ReportQualityEngineAnalysis } from "../src/lib/scientific/methodology/report-quality";
import type { ReproducibilityExplorerAnalysis } from "../src/lib/scientific/methodology/reproducibility";
import {
  buildAssumptionTrackerAnalysis,
  getAssumptionTrackerClassificationLabel,
  getAssumptionTrackerReportLines,
  getAssumptionTrackerStatusIcon,
  getAssumptionTrackerStatusLabel,
  hasAssumptionTrackerExcellent,
  hasAssumptionTrackerInput,
  hasAssumptionTrackerLimited,
} from "../src/lib/scientific/methodology/assumptions";
import {
  buildEvidenceStrengthEngineAnalysis,
  getEvidenceStrengthEngineClassificationLabel,
  getEvidenceStrengthEngineReportLines,
  hasEvidenceStrengthEngineInput,
  hasEvidenceStrengthEngineLimited,
  hasEvidenceStrengthEngineVeryStrong,
} from "../src/lib/scientific/methodology/evidence";
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

const emptyEvidenceInput = {
  consistencyEngineAnalysis: null,
  reportQualityEngineAnalysis: null,
  reproducibilityExplorerAnalysis: null,
  bootstrapExplorerAnalysis: null,
  effectSizePowerAnalysis: null,
  anovaAnalysis: null,
  mannWhitneyResult: null,
  kruskalWallisResult: null,
};

// --- SCI-53 behavioral ---

assertCase(
  "sci53.builder.empty-input",
  buildEvidenceStrengthEngineAnalysis(emptyEvidenceInput) === null,
  "empty upstream returns null"
);

assertCase(
  "sci53.builder.has-input-gate",
  hasEvidenceStrengthEngineInput({
    consistencyEngineAnalysis: null,
    reportQualityEngineAnalysis: null,
    reproducibilityExplorerAnalysis: null,
    bootstrapExplorerAnalysis: { stabilityScore: 70 },
  }),
  "bootstrap alone satisfies input gate"
);

const strongEvidence = buildEvidenceStrengthEngineAnalysis({
  ...emptyEvidenceInput,
  consistencyEngineAnalysis: mockConsistencyStrong,
  reportQualityEngineAnalysis: mockReportQualityStrong,
  reproducibilityExplorerAnalysis: mockReproducibilityStrong,
  bootstrapExplorerAnalysis: { stabilityScore: 90 },
  effectSizePowerAnalysis: {
    dominantMagnitude: "large",
    insufficientSampleWarning: null,
  },
  anovaAnalysis: {},
});

assertCase("sci53.builder.strong-not-null", strongEvidence !== null);
assertCase(
  "sci53.classification.very-strong",
  strongEvidence?.classification === "very-strong",
  strongEvidence?.classification
);
assertCase(
  "sci53.classification.score",
  strongEvidence !== null && approxEqual(strongEvidence.evidenceScore, 91),
  strongEvidence ? String(strongEvidence.evidenceScore) : "null"
);
assertCase(
  "sci53.flags.very-strong",
  hasEvidenceStrengthEngineVeryStrong(strongEvidence),
  "very-strong helper"
);

const limitedEvidence = buildEvidenceStrengthEngineAnalysis({
  ...emptyEvidenceInput,
  bootstrapExplorerAnalysis: { stabilityScore: 20 },
});

assertCase("sci53.builder.limited-not-null", limitedEvidence !== null);
assertCase(
  "sci53.classification.limited",
  limitedEvidence?.classification === "limited",
  limitedEvidence?.classification
);
assertCase(
  "sci53.flags.limited",
  hasEvidenceStrengthEngineLimited(limitedEvidence),
  "limited helper"
);

assertCase(
  "sci53.labels.very-strong",
  getEvidenceStrengthEngineClassificationLabel("very-strong") === "Very Strong"
);
assertCase(
  "sci53.labels.strong",
  getEvidenceStrengthEngineClassificationLabel("strong") === "Strong"
);
assertCase(
  "sci53.labels.moderate",
  getEvidenceStrengthEngineClassificationLabel("moderate") === "Moderate"
);
assertCase(
  "sci53.labels.limited",
  getEvidenceStrengthEngineClassificationLabel("limited") === "Limited"
);

const strongEvidenceReport = getEvidenceStrengthEngineReportLines(strongEvidence);
assertCase(
  "sci53.report-lines.present",
  strongEvidenceReport.length >= 3 &&
    strongEvidenceReport[0].startsWith("Evidence Score:") &&
    strongEvidenceReport.some((line) => line.includes("Very Strong")),
  strongEvidenceReport.join(" | ")
);
assertCase(
  "sci53.report-lines.empty",
  getEvidenceStrengthEngineReportLines(null)[0] ===
    "No hay datos suficientes para generar Evidence Strength Engine."
);

// --- SCI-54 behavioral ---

const emptyAssumptionsInput = {
  normalityAnalyses: [],
  normalityConsensus: [],
  qqPlotAnalyses: [],
  violinPlotAnalyses: [],
  kernelDensityAnalyses: [],
  varianceHomogeneityAnalysis: null,
  independenceAnalysis: null,
};

assertCase(
  "sci54.builder.empty-input",
  buildAssumptionTrackerAnalysis(emptyAssumptionsInput) === null,
  "empty upstream returns null"
);

assertCase(
  "sci54.builder.has-input-gate",
  hasAssumptionTrackerInput({
    normalityAnalyses: [{}],
    qqPlotAnalyses: [],
    violinPlotAnalyses: [],
    kernelDensityAnalyses: [],
  }),
  "normality analyses alone satisfy input gate"
);

const excellentAssumptions = buildAssumptionTrackerAnalysis({
  normalityAnalyses: [{}],
  normalityConsensus: [{ conclusion: "normal" }],
  qqPlotAnalyses: [{ interpretation: "excellent" }],
  violinPlotAnalyses: [{ shapeInterpretation: "symmetric" }],
  kernelDensityAnalyses: [{ distributionShape: "symmetric" }],
  varianceHomogeneityAnalysis: { classification: "homogeneous" },
  independenceAnalysis: { status: "satisfied" },
});

assertCase("sci54.builder.excellent-not-null", excellentAssumptions !== null);
assertCase(
  "sci54.classification.excellent",
  excellentAssumptions?.classification === "excellent",
  excellentAssumptions?.classification
);
assertCase(
  "sci54.flags.excellent",
  hasAssumptionTrackerExcellent(excellentAssumptions),
  "excellent helper"
);

const limitedAssumptions = buildAssumptionTrackerAnalysis({
  normalityAnalyses: [{}],
  normalityConsensus: [{ conclusion: "non-normal" }],
  qqPlotAnalyses: [{ interpretation: "poor" }],
  violinPlotAnalyses: [{ shapeInterpretation: "right-skewed" }],
  kernelDensityAnalyses: [{ distributionShape: "right-skewed" }],
  varianceHomogeneityAnalysis: { classification: "heterogeneous" },
  independenceAnalysis: { status: "questionable" },
});

assertCase("sci54.builder.limited-not-null", limitedAssumptions !== null);
assertCase(
  "sci54.classification.limited",
  limitedAssumptions?.classification === "limited",
  limitedAssumptions?.classification
);
assertCase(
  "sci54.flags.limited",
  hasAssumptionTrackerLimited(limitedAssumptions),
  "limited helper"
);

assertCase(
  "sci54.labels.excellent",
  getAssumptionTrackerClassificationLabel("excellent") === "Excellent"
);
assertCase(
  "sci54.labels.good",
  getAssumptionTrackerClassificationLabel("good") === "Good"
);
assertCase(
  "sci54.labels.moderate",
  getAssumptionTrackerClassificationLabel("moderate") === "Moderate"
);
assertCase(
  "sci54.labels.limited",
  getAssumptionTrackerClassificationLabel("limited") === "Limited"
);

assertCase(
  "sci54.status-labels.satisfied",
  getAssumptionTrackerStatusLabel("satisfied") === "Satisfied"
);
assertCase(
  "sci54.status-labels.partially-satisfied",
  getAssumptionTrackerStatusLabel("partially-satisfied") === "Partial"
);
assertCase(
  "sci54.status-labels.questionable",
  getAssumptionTrackerStatusLabel("questionable") === "Questionable"
);
assertCase(
  "sci54.status-labels.not-evaluated",
  getAssumptionTrackerStatusLabel("not-evaluated") === "Not Evaluated"
);

assertCase(
  "sci54.status-icons.satisfied",
  getAssumptionTrackerStatusIcon("satisfied") === "✔"
);
assertCase(
  "sci54.status-icons.partially-satisfied",
  getAssumptionTrackerStatusIcon("partially-satisfied") === "◐"
);
assertCase(
  "sci54.status-icons.questionable",
  getAssumptionTrackerStatusIcon("questionable") === "⚠"
);
assertCase(
  "sci54.status-icons.not-evaluated",
  getAssumptionTrackerStatusIcon("not-evaluated") === "?"
);

const excellentAssumptionsReport =
  getAssumptionTrackerReportLines(excellentAssumptions);
assertCase(
  "sci54.report-lines.present",
  excellentAssumptionsReport.length >= 4 &&
    excellentAssumptionsReport[0].startsWith("Assumption Score:") &&
    excellentAssumptionsReport.some((line) => line.includes("Excellent")) &&
    excellentAssumptionsReport.some((line) => line.includes("Normalidad:")),
  excellentAssumptionsReport.join(" | ")
);
assertCase(
  "sci54.report-lines.empty",
  getAssumptionTrackerReportLines(null)[0] ===
    "No hay datos suficientes para generar Assumption Tracker."
);

// --- Structural: page.tsx has no inline SCI-53/54 domain ---

const pageSource = readFileSync(join(repoRoot, "src/app/page.tsx"), "utf8");

assertPageNoInlinePatterns(assertCase, pageSource, [
  /const\s+buildEvidenceStrengthEngineAnalysis\s*=/,
  /const\s+buildAssumptionTrackerAnalysis\s*=/,
  /const\s+hasEvidenceStrengthEngineInput\s*=/,
  /const\s+hasAssumptionTrackerInput\s*=/,
  /const\s+classifyEvidenceStrengthEngine\s*=/,
  /const\s+classifyAssumptionTracker\s*=/,
  /type\s+EvidenceStrengthEngineAnalysis\s*=\s*\{/,
  /type\s+AssumptionTrackerAnalysis\s*=\s*\{/,
]);

assertPageImportsBarrels(assertCase, pageSource, [
  {
    id: "evidence-barrel",
    needle: 'from "@/lib/scientific/methodology/evidence"',
  },
  {
    id: "assumptions-barrel",
    needle: 'from "@/lib/scientific/methodology/assumptions"',
  },
]);

// --- Structural: barrel public API ---

assertBarrelApiFreeze(assertCase, repoRoot, {
  "src/lib/scientific/methodology/evidence/index.ts": [
    "EvidenceStrengthEngineAnalysis",
    "EvidenceStrengthEngineClassification",
    "EvidenceStrengthEngineBuildInput",
    "buildEvidenceStrengthEngineAnalysis",
    "hasEvidenceStrengthEngineInput",
    "hasEvidenceStrengthEngineVeryStrong",
    "hasEvidenceStrengthEngineLimited",
    "getEvidenceStrengthEngineClassificationLabel",
    "getEvidenceStrengthEngineReportLines",
  ],
  "src/lib/scientific/methodology/assumptions/index.ts": [
    "AssumptionTrackerAnalysis",
    "AssumptionTrackerClassification",
    "AssumptionTrackerBuildInput",
    "buildAssumptionTrackerAnalysis",
    "hasAssumptionTrackerInput",
    "hasAssumptionTrackerExcellent",
    "hasAssumptionTrackerLimited",
    "getAssumptionTrackerClassificationLabel",
    "getAssumptionTrackerStatusLabel",
    "getAssumptionTrackerStatusIcon",
    "getAssumptionTrackerReportLines",
  ],
});

// --- Structural: boundary-clean ---

assertMethodologyBoundaryClean(assertCase, repoRoot);

// --- Structural: acyclic imports ---

const methodologyRoot = join(repoRoot, "src/lib/scientific/methodology");
const methodologyFiles = collectMethodologyTsFiles(repoRoot);

const evidenceSources = methodologyFiles
  .filter((path) => path.includes(`${join("methodology", "evidence")}`))
  .map((path) => readFileSync(path, "utf8"));
const assumptionsSources = methodologyFiles
  .filter((path) => path.includes(`${join("methodology", "assumptions")}`))
  .map((path) => readFileSync(path, "utf8"));

assertCase(
  "structure.acyclic.evidence-no-downstream",
  evidenceSources.every(
    (source) =>
      !source.includes("methodology/assumptions") &&
      !source.includes("methodology/readiness") &&
      !source.includes("methodology/summary") &&
      !source.includes("methodology/publication")
  )
);

assertCase(
  "structure.acyclic.evidence-imports-upstream",
  readFileSync(join(methodologyRoot, "evidence", "build.ts"), "utf8").includes(
    'from "@/lib/scientific/methodology/consistency"'
  ) &&
    readFileSync(join(methodologyRoot, "evidence", "build.ts"), "utf8").includes(
      'from "@/lib/scientific/methodology/report-quality"'
    ) &&
    readFileSync(join(methodologyRoot, "evidence", "build.ts"), "utf8").includes(
      'from "@/lib/scientific/methodology/reproducibility"'
    )
);

assertCase(
  "structure.acyclic.assumptions-no-methodology-imports",
  assumptionsSources.every((source) => !source.includes("methodology/"))
);

// --- Module presence ---

assertModuleFilesPresent(
  assertCase,
  repoRoot,
  ["evidence", "assumptions"],
  [
    "types.ts",
    "input-types.ts",
    "build.ts",
    "labels.ts",
    "reporting.ts",
    "index.ts",
  ]
);

emitGateSummary("methodology-f5b-unit", results);
