import { readFileSync } from "node:fs";
import { join } from "node:path";

import { EPIC_B_BASELINE } from "../src/lib/import/epic-b-baseline";
import type { EffectSizePowerAnalysis } from "../src/lib/scientific/inference";
import type { CanonicalNormalityAssessment } from "../src/lib/scientific/normality";
import type { EvidenceStrengthEngineAnalysis } from "../src/lib/scientific/methodology/evidence";
import type { MethodologicalDashboardAnalysis } from "../src/lib/scientific/methodology/summary";
import type { PublicationReadinessAnalyzerAnalysis } from "../src/lib/scientific/methodology/readiness";
import {
  buildPublicationDashboardAnalysis,
  buildPublicationDashboardInferentialHighlight,
  buildPublicationDashboardMultivariateHighlights,
  buildPublicationDashboardNormalitySummary,
  canBuildPublicationDashboard,
  getPublicationDashboardReportLines,
} from "../src/lib/scientific/methodology/publication";
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

const emptyNormality: CanonicalNormalityAssessment = {
  seriesAssessments: [],
  globalConclusion: [],
  warnings: [],
};

const populatedNormality: CanonicalNormalityAssessment = {
  seriesAssessments: [
    {
      seriesName: "Control",
      conclusion: "normal",
      confidence: "high",
      reasons: ["Shapiro-Wilk p>0.05"],
      sourceSummary: ["normal"],
    },
    {
      seriesName: "Treatment",
      conclusion: "non-normal",
      confidence: "medium",
      reasons: ["Skew detected"],
      sourceSummary: ["non-normal"],
    },
  ],
  globalConclusion: ["Perfil mixto de normalidad."],
  warnings: ["Serie Treatment no normal."],
};

const mockReadinessNearReady: PublicationReadinessAnalyzerAnalysis = {
  readinessScore: EPIC_B_BASELINE.dataset5.readiness,
  classification: "near-ready",
  evaluatedAreas: 5,
  interpretation: ["Near ready for publication."],
};

const mockReadinessRequiresReview: PublicationReadinessAnalyzerAnalysis = {
  readinessScore: EPIC_B_BASELINE.dataset6.readiness,
  classification: "requires-review",
  evaluatedAreas: 5,
  interpretation: ["Requires methodological review."],
};

const mockMethodologicalDashboard: MethodologicalDashboardAnalysis = {
  summaryCards: {
    consistencyScore: 85,
    qualityScore: 80,
    assumptionScore: 65,
    reproducibilityScore: 72,
  },
  overallHealthScore: 75.5,
  evaluatedEngines: 4,
  diagnosis: ["Mixed methodological health."],
};

const mockEvidenceStrong: EvidenceStrengthEngineAnalysis = {
  evidenceScore: EPIC_B_BASELINE.dataset5.evidence,
  classification: "strong",
  evidenceSources: 5,
  interpretation: ["Strong evidence."],
};

const mockEffectSize: EffectSizePowerAnalysis = {
  entries: [],
  dominantMagnitude: "large",
  dominantEntry: {
    source: "t-test",
    comparison: "A vs B",
    metric: "Cohen d",
    value: 0.8,
    valueDisplay: "0.80",
    magnitude: "large",
    magnitudeLabel: "Large",
  },
  prospectiveSampleSize: 30,
  currentSampleSize: 28,
  observedPower: 0.82,
  powerDisclaimer: "",
  insufficientSampleWarning: null,
  interpretation: ["Large effect."],
};

const emptyPublicationInput = {
  publicationReadinessAnalyzerAnalysis: null,
  methodologicalDashboardAnalysis: null,
  multivariateDashboardAnalysis: null,
  evidenceStrengthEngineAnalysis: null,
  effectSizePowerAnalysis: null,
  canonicalNormalityAssessment: emptyNormality,
  statisticalRecommendation: null,
};

const emptyCanBuildInput = {
  publicationReadinessAnalyzerAnalysis: null,
  methodologicalDashboardAnalysis: null,
  multivariateDashboardAnalysis: null,
  effectSizePowerAnalysis: null,
  canonicalNormalityAssessment: emptyNormality,
};

// --- SCI-60 behavioral ---

assertCase(
  "sci60.builder.empty-input",
  buildPublicationDashboardAnalysis(emptyPublicationInput) === null,
  "empty upstream returns null"
);

assertCase(
  "sci60.can-build.empty-input",
  canBuildPublicationDashboard(emptyCanBuildInput) === false,
  "canBuild false when all upstream null"
);

assertCase(
  "sci60.can-build.normality-only",
  canBuildPublicationDashboard({
    ...emptyCanBuildInput,
    canonicalNormalityAssessment: populatedNormality,
  }),
  "normality assessments alone satisfy canBuild gate"
);

const dataset5Dashboard = buildPublicationDashboardAnalysis({
  ...emptyPublicationInput,
  publicationReadinessAnalyzerAnalysis: mockReadinessNearReady,
  methodologicalDashboardAnalysis: mockMethodologicalDashboard,
  evidenceStrengthEngineAnalysis: mockEvidenceStrong,
  canonicalNormalityAssessment: populatedNormality,
  statisticalRecommendation: {
    recommendedTest: "ANOVA",
    confidence: "high",
    reasoning: ["Balanced groups."],
    assumptionsPassed: ["normality"],
    assumptionsFailed: [],
    warnings: [],
  },
});

assertCase("sci60.builder.dataset5-not-null", dataset5Dashboard !== null);
assertCase(
  "sci60.baseline.qa1.frozen-primary",
  EPIC_B_BASELINE.dataset5.readiness === 77.0,
  String(EPIC_B_BASELINE.dataset5.readiness)
);
assertCase(
  "sci60.baseline.qa1.frozen-secondary",
  EPIC_B_BASELINE.dataset6.readiness === 67.5,
  String(EPIC_B_BASELINE.dataset6.readiness)
);
assertCase(
  "sci60.baseline.dataset5-score",
  dataset5Dashboard !== null &&
    approxEqual(dataset5Dashboard.publicationScore, EPIC_B_BASELINE.dataset5.readiness),
  dataset5Dashboard ? String(dataset5Dashboard.publicationScore) : "null"
);
assertCase(
  "sci60.baseline.dataset5-status",
  dataset5Dashboard?.publicationStatus === "near-ready",
  dataset5Dashboard?.publicationStatus
);

const dataset6Dashboard = buildPublicationDashboardAnalysis({
  ...emptyPublicationInput,
  publicationReadinessAnalyzerAnalysis: mockReadinessRequiresReview,
});

assertCase("sci60.builder.dataset6-not-null", dataset6Dashboard !== null);
assertCase(
  "sci60.baseline.dataset6-score",
  dataset6Dashboard !== null &&
    approxEqual(dataset6Dashboard.publicationScore, EPIC_B_BASELINE.dataset6.readiness),
  dataset6Dashboard ? String(dataset6Dashboard.publicationScore) : "null"
);
assertCase(
  "sci60.baseline.dataset6-status",
  dataset6Dashboard?.publicationStatus === "requires-review",
  dataset6Dashboard?.publicationStatus
);

const normalitySummary =
  buildPublicationDashboardNormalitySummary(populatedNormality);
assertCase("sci60.sub-builder.normality-not-null", normalitySummary !== null);
assertCase(
  "sci60.sub-builder.normality-counts",
  normalitySummary?.seriesEvaluated === 2 &&
    normalitySummary.normalCount === 1 &&
    normalitySummary.nonNormalCount === 1,
  normalitySummary
    ? `${normalitySummary.normalCount}/${normalitySummary.nonNormalCount}`
    : "null"
);
assertCase(
  "sci60.sub-builder.normality-empty",
  buildPublicationDashboardNormalitySummary(emptyNormality) === null
);

const multivariateHighlights = buildPublicationDashboardMultivariateHighlights({
  summaryCards: {
    pcaVariance: 82.5,
    clusterCount: 3,
    topVariable: "GeneA",
    topVariableTied: ["GeneA", "GeneB"],
    averageSimilarity: 0.72,
  },
  diagnosis: ["Estructura multivariante estable."],
});
assertCase(
  "sci60.sub-builder.multivariate-not-null",
  multivariateHighlights !== null
);
assertCase(
  "sci60.sub-builder.multivariate-fields",
  multivariateHighlights?.pcaVariance === 82.5 &&
    multivariateHighlights.clusterCount === 3 &&
    multivariateHighlights.topVariableTied?.length === 2,
  multivariateHighlights ? String(multivariateHighlights.pcaVariance) : "null"
);
assertCase(
  "sci60.sub-builder.multivariate-null",
  buildPublicationDashboardMultivariateHighlights(null) === null
);

const inferentialHighlight =
  buildPublicationDashboardInferentialHighlight(mockEffectSize);
assertCase(
  "sci60.sub-builder.inferential-not-null",
  inferentialHighlight !== null
);
assertCase(
  "sci60.sub-builder.inferential-fields",
  inferentialHighlight?.dominantMagnitude === "large" &&
    inferentialHighlight.metric === "Cohen d",
  inferentialHighlight?.metric
);
assertCase(
  "sci60.sub-builder.inferential-null",
  buildPublicationDashboardInferentialHighlight(null) === null
);

const fullDashboard = buildPublicationDashboardAnalysis({
  ...emptyPublicationInput,
  publicationReadinessAnalyzerAnalysis: mockReadinessNearReady,
  methodologicalDashboardAnalysis: mockMethodologicalDashboard,
  multivariateDashboardAnalysis: {
    summaryCards: { pcaVariance: 85, clusterCount: 2, topVariable: "X" },
    diagnosis: ["Aligned multivariate structure."],
  },
  evidenceStrengthEngineAnalysis: mockEvidenceStrong,
  effectSizePowerAnalysis: mockEffectSize,
  canonicalNormalityAssessment: populatedNormality,
  statisticalRecommendation: {
    recommendedTest: "t-Test",
    confidence: "medium",
    reasoning: ["Two groups."],
    assumptionsPassed: [],
    assumptionsFailed: [],
    warnings: [],
  },
});

assertCase("sci60.builder.full-not-null", fullDashboard !== null);
assertCase(
  "sci60.builder.evaluated-domains",
  fullDashboard !== null && fullDashboard.evaluatedDomains >= 5,
  fullDashboard ? String(fullDashboard.evaluatedDomains) : "null"
);

const fullDashboardReport = getPublicationDashboardReportLines(fullDashboard);
assertCase(
  "sci60.report-lines.present",
  fullDashboardReport.length >= 5 &&
    fullDashboardReport[0].startsWith("Publication Status:") &&
    fullDashboardReport.some((line) => line.includes("Near Ready")) &&
    fullDashboardReport.some((line) => line.includes("Diagnóstico editorial:")),
  fullDashboardReport.join(" | ")
);
assertCase(
  "sci60.report-lines.empty",
  getPublicationDashboardReportLines(null)[0] ===
    "No hay datos suficientes para generar Executive Publication Dashboard."
);

// --- Structural: page.tsx has no inline SCI-60 domain ---

const pageSource = readFileSync(join(repoRoot, "src/app/page.tsx"), "utf8");

assertPageNoInlinePatterns(assertCase, pageSource, [
  /const\s+buildPublicationDashboardAnalysis\s*=/,
  /const\s+canBuildPublicationDashboard\s*=/,
  /const\s+buildPublicationDashboardNormalitySummary\s*=/,
  /const\s+buildPublicationDashboardMultivariateHighlights\s*=/,
  /const\s+buildPublicationDashboardInferentialHighlight\s*=/,
  /type\s+PublicationDashboardAnalysis\s*=\s*\{/,
]);

assertPageImportsBarrels(assertCase, pageSource, [
  {
    id: "publication-barrel",
    needle: 'from "@/lib/scientific/methodology/publication"',
  },
]);

// --- Structural: barrel public API ---

assertBarrelApiFreeze(assertCase, repoRoot, {
  "src/lib/scientific/methodology/publication/index.ts": [
    "PublicationDashboardAnalysis",
    "PublicationDashboardBuildInput",
    "buildPublicationDashboardAnalysis",
    "canBuildPublicationDashboard",
    "buildPublicationDashboardNormalitySummary",
    "buildPublicationDashboardMultivariateHighlights",
    "buildPublicationDashboardInferentialHighlight",
    "getPublicationDashboardReportLines",
  ],
});

// --- Structural: boundary-clean ---

assertMethodologyBoundaryClean(assertCase, repoRoot);

// --- Structural: acyclic imports ---

const methodologyRoot = join(repoRoot, "src/lib/scientific/methodology");
const methodologyFiles = collectMethodologyTsFiles(repoRoot);

const publicationSources = methodologyFiles
  .filter((path) => path.includes(`${join("methodology", "publication")}`))
  .map((path) => readFileSync(path, "utf8"));

assertCase(
  "structure.acyclic.publication-no-app",
  publicationSources.every(
    (source) =>
      !source.includes("@/app/") &&
      !source.includes("@/components/") &&
      !source.includes('from "react')
  )
);

assertCase(
  "structure.acyclic.publication-imports-upstream",
  readFileSync(join(methodologyRoot, "publication", "build.ts"), "utf8").includes(
    'from "@/lib/scientific/methodology/readiness"'
  ) &&
    readFileSync(join(methodologyRoot, "publication", "input-types.ts"), "utf8").includes(
      'from "@/lib/scientific/methodology/summary"'
    ) &&
    readFileSync(join(methodologyRoot, "publication", "input-types.ts"), "utf8").includes(
      'from "@/lib/scientific/methodology/evidence"'
    )
);

// --- Module presence ---

assertModuleFilesPresent(
  assertCase,
  repoRoot,
  ["publication"],
  ["types.ts", "input-types.ts", "build.ts", "reporting.ts", "index.ts"]
);

emitGateSummary("methodology-f5e-unit", results);
