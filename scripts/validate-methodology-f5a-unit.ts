import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  assertBarrelApiFreeze,
  assertMethodologyLegacyForbiddenImports,
  assertModuleFilesPresent,
  assertPageImportsBarrels,
  assertPageNoInlinePatterns,
  approxEqual,
  collectMethodologyTsFiles,
  createCaseRecorder,
  emitGateSummary,
  getRepoRoot,
} from "./lib/methodology-gate-utils";
import {
  buildConsistencyEngineAnalysis,
  getConsistencyEngineClassificationLabel,
  getConsistencyEngineReportLines,
  hasConsistencyEngineInput,
  hasConsistencyEngineVeryStrong,
  hasConsistencyEngineWeak,
} from "../src/lib/scientific/methodology/consistency";
import {
  buildReportQualityEngineAnalysis,
  getReportQualityEngineClassificationLabel,
  getReportQualityEngineReportLines,
  hasReportQualityEngineExcellent,
  hasReportQualityEngineInput,
} from "../src/lib/scientific/methodology/report-quality";
import {
  buildReproducibilityExplorerAnalysis,
  getReproducibilityExplorerClassificationLabel,
  getReproducibilityExplorerReportLines,
  hasReproducibilityExplorerLow,
  hasReproducibilityExplorerVeryHigh,
} from "../src/lib/scientific/methodology/reproducibility";

const repoRoot = getRepoRoot(import.meta.url);
const { results, assertCase } = createCaseRecorder();

const emptyConsistencyInput = {
  pcaAnalysis: null,
  hierarchicalClusteringAnalysis: null,
  mdsAnalysis: null,
  similarityNetworkAnalysis: null,
  manovaExplorerAnalysis: null,
  ldaExplorerAnalysis: null,
  pcrExplorerAnalysis: null,
  plsExplorerAnalysis: null,
  bootstrapExplorerAnalysis: null,
  sensitivityExplorerAnalysis: null,
  tsneExplorerAnalysis: null,
  umapExplorerAnalysis: null,
};

const strongConsistencyInput = {
  ...emptyConsistencyInput,
  pcaAnalysis: { cumulativeVariance: 90 },
  hierarchicalClusteringAnalysis: { root: {} },
  mdsAnalysis: { stress: 0.05 },
  bootstrapExplorerAnalysis: { stabilityScore: 90 },
  sensitivityExplorerAnalysis: { sensitivityScore: 90 },
};

const weakConsistencyInput = {
  ...emptyConsistencyInput,
  mdsAnalysis: { stress: 0.5 },
};

// --- SCI-50 behavioral ---

assertCase(
  "sci50.builder.empty-input",
  buildConsistencyEngineAnalysis(emptyConsistencyInput) === null,
  "empty upstream returns null"
);

assertCase(
  "sci50.builder.has-input-gate",
  hasConsistencyEngineInput({
    ...emptyConsistencyInput,
    pcaAnalysis: { cumulativeVariance: 50 },
  }),
  "pca alone satisfies input gate"
);

const strongConsistency = buildConsistencyEngineAnalysis(strongConsistencyInput);
assertCase("sci50.builder.strong-not-null", strongConsistency !== null);
assertCase(
  "sci50.classification.very-strong",
  strongConsistency?.classification === "very-strong",
  strongConsistency?.classification
);
assertCase(
  "sci50.classification.score",
  strongConsistency !== null && approxEqual(strongConsistency.consistencyScore, 100),
  strongConsistency ? String(strongConsistency.consistencyScore) : "null"
);
assertCase(
  "sci50.classification.label",
  getConsistencyEngineClassificationLabel("very-strong") === "Very Strong"
);
assertCase(
  "sci50.flags.very-strong",
  hasConsistencyEngineVeryStrong(strongConsistency),
  "very-strong helper"
);

const weakConsistency = buildConsistencyEngineAnalysis(weakConsistencyInput);
assertCase(
  "sci50.classification.weak",
  weakConsistency?.classification === "weak",
  weakConsistency?.classification
);
assertCase(
  "sci50.flags.weak",
  hasConsistencyEngineWeak(weakConsistency),
  "weak helper"
);

const strongConsistencyReport = getConsistencyEngineReportLines(strongConsistency);
assertCase(
  "sci50.report-lines.present",
  strongConsistencyReport.length >= 4 &&
    strongConsistencyReport[0].startsWith("Consistency Score:") &&
    strongConsistencyReport.some((line) => line.includes("Very Strong")),
  strongConsistencyReport.join(" | ")
);
assertCase(
  "sci50.report-lines.empty",
  getConsistencyEngineReportLines(null)[0] ===
    "No hay datos suficientes para generar Consistency Engine."
);

// --- SCI-51 behavioral ---

const emptyReportQualityInput = {
  experimentalStatistics: [],
  normalityAnalyses: [],
  normalityConsensus: [],
  anovaAnalysis: null,
  mannWhitneyResult: null,
  kruskalWallisResult: null,
  bootstrapExplorerAnalysis: null,
  consistencyEngineAnalysis: null,
};

assertCase(
  "sci51.builder.empty-input",
  buildReportQualityEngineAnalysis(emptyReportQualityInput) === null
);

const reportQualityWithConsistency = buildReportQualityEngineAnalysis({
  experimentalStatistics: [{ count: 30 }],
  normalityAnalyses: [],
  normalityConsensus: [{ conclusion: "normal" }],
  anovaAnalysis: {},
  mannWhitneyResult: null,
  kruskalWallisResult: null,
  bootstrapExplorerAnalysis: { stabilityScore: 85 },
  consistencyEngineAnalysis: strongConsistency,
});

assertCase("sci51.builder.with-consistency", reportQualityWithConsistency !== null);
assertCase(
  "sci51.dependency.consistency-score",
  reportQualityWithConsistency !== null &&
    reportQualityWithConsistency.qualityScore >= 85,
  reportQualityWithConsistency
    ? String(reportQualityWithConsistency.qualityScore)
    : "null"
);
assertCase(
  "sci51.classification.excellent",
  reportQualityWithConsistency?.classification === "excellent",
  reportQualityWithConsistency?.classification
);
assertCase(
  "sci51.flags.excellent",
  hasReportQualityEngineExcellent(reportQualityWithConsistency)
);
assertCase(
  "sci51.input-gate",
  hasReportQualityEngineInput({
    experimentalStatistics: [],
    normalityAnalyses: [],
    normalityConsensus: [],
    consistencyEngineAnalysis: strongConsistency,
    bootstrapExplorerAnalysis: null,
  })
);

const reportQualityReport = getReportQualityEngineReportLines(
  reportQualityWithConsistency
);
assertCase(
  "sci51.report-lines.present",
  reportQualityReport.length >= 3 &&
    reportQualityReport[0].startsWith("Quality Score:") &&
    reportQualityReport.some((line) => line.includes("Excellent")),
  reportQualityReport.join(" | ")
);
assertCase(
  "sci51.report-lines.label",
  getReportQualityEngineClassificationLabel("good") === "Good"
);

// --- SCI-52 behavioral ---

const emptyReproducibilityInput = {
  experimentalStatistics: [],
  normalityConsensus: [],
  bootstrapExplorerAnalysis: null,
  sensitivityExplorerAnalysis: null,
  reportQualityEngineAnalysis: null,
  consistencyEngineAnalysis: null,
};

assertCase(
  "sci52.builder.empty-input",
  buildReproducibilityExplorerAnalysis(emptyReproducibilityInput) === null
);

const reproducibilityPartial = buildReproducibilityExplorerAnalysis({
  experimentalStatistics: [{ count: 30 }],
  normalityConsensus: [],
  bootstrapExplorerAnalysis: null,
  sensitivityExplorerAnalysis: null,
  reportQualityEngineAnalysis: null,
  consistencyEngineAnalysis: null,
});

assertCase("sci52.builder.partial-factors", reproducibilityPartial !== null);
assertCase(
  "sci52.factors.sample-only-score",
  reproducibilityPartial !== null &&
    approxEqual(reproducibilityPartial.reproducibilityScore, 60),
  reproducibilityPartial
    ? String(reproducibilityPartial.reproducibilityScore)
    : "null"
);
assertCase(
  "sci52.classification.moderate",
  reproducibilityPartial?.classification === "moderate",
  reproducibilityPartial?.classification
);
assertCase(
  "sci52.factors.evaluated-count",
  reproducibilityPartial?.evaluatedFactors === 5,
  reproducibilityPartial ? String(reproducibilityPartial.evaluatedFactors) : "null"
);

const reproducibilityFull = buildReproducibilityExplorerAnalysis({
  experimentalStatistics: [{ count: 30 }],
  normalityConsensus: [{ conclusion: "normal" }],
  bootstrapExplorerAnalysis: { stabilityScore: 90 },
  sensitivityExplorerAnalysis: { sensitivityScore: 90 },
  reportQualityEngineAnalysis: reportQualityWithConsistency,
  consistencyEngineAnalysis: strongConsistency,
});

assertCase("sci52.builder.full-chain", reproducibilityFull !== null);
assertCase(
  "sci52.factors.full-chain-score",
  reproducibilityFull !== null &&
    reproducibilityFull.reproducibilityScore >= 85,
  reproducibilityFull ? String(reproducibilityFull.reproducibilityScore) : "null"
);
assertCase(
  "sci52.classification.very-high",
  reproducibilityFull?.classification === "very-high",
  reproducibilityFull?.classification
);
assertCase(
  "sci52.flags.very-high",
  hasReproducibilityExplorerVeryHigh(reproducibilityFull)
);
assertCase(
  "sci52.flags.low",
  hasReproducibilityExplorerLow(reproducibilityPartial) === false
);

const reproducibilityReport = getReproducibilityExplorerReportLines(
  reproducibilityFull
);
assertCase(
  "sci52.report-lines.present",
  reproducibilityReport.length >= 3 &&
    reproducibilityReport[0].startsWith("Reproducibility Score:") &&
    reproducibilityReport.some((line) => line.includes("Very High")),
  reproducibilityReport.join(" | ")
);
assertCase(
  "sci52.report-lines.label",
  getReproducibilityExplorerClassificationLabel("low") === "Low"
);

// --- Structural: page.tsx has no inline SCI-50/51/52 domain ---

const pageSource = readFileSync(join(repoRoot, "src/app/page.tsx"), "utf8");

assertPageNoInlinePatterns(assertCase, pageSource, [
  /const\s+buildConsistencyEngineAnalysis\s*=/,
  /const\s+buildReportQualityEngineAnalysis\s*=/,
  /const\s+buildReproducibilityExplorerAnalysis\s*=/,
  /const\s+hasConsistencyEngineInput\s*=/,
  /const\s+hasReportQualityEngineInput\s*=/,
  /const\s+hasReproducibilityExplorerInput\s*=/,
  /const\s+classifyConsistencyEngine\s*=/,
  /const\s+classifyReportQualityEngine\s*=/,
  /const\s+classifyReproducibilityExplorer\s*=/,
  /type\s+ConsistencyEngineAnalysis\s*=\s*\{/,
  /type\s+ReportQualityEngineAnalysis\s*=\s*\{/,
  /type\s+ReproducibilityExplorerAnalysis\s*=\s*\{/,
]);

assertPageImportsBarrels(assertCase, pageSource, [
  {
    id: "consistency-barrel",
    needle: 'from "@/lib/scientific/methodology/consistency"',
  },
  {
    id: "report-quality-barrel",
    needle: 'from "@/lib/scientific/methodology/report-quality"',
  },
  {
    id: "reproducibility-barrel",
    needle: 'from "@/lib/scientific/methodology/reproducibility"',
  },
]);

// --- Structural: barrel public API ---

assertBarrelApiFreeze(assertCase, repoRoot, {
  "src/lib/scientific/methodology/consistency/index.ts": [
    "ConsistencyEngineAnalysis",
    "ConsistencyEngineClassification",
    "ConsistencyEngineBuildInput",
    "buildConsistencyEngineAnalysis",
    "hasConsistencyEngineInput",
    "hasConsistencyEngineVeryStrong",
    "hasConsistencyEngineWeak",
    "getConsistencyEngineClassificationLabel",
    "getConsistencyEngineReportLines",
  ],
  "src/lib/scientific/methodology/report-quality/index.ts": [
    "ReportQualityEngineAnalysis",
    "ReportQualityEngineClassification",
    "ReportQualityEngineBuildInput",
    "buildReportQualityEngineAnalysis",
    "hasReportQualityEngineInput",
    "hasReportQualityEngineExcellent",
    "hasReportQualityEngineLimited",
    "getReportQualityEngineClassificationLabel",
    "getReportQualityEngineReportLines",
  ],
  "src/lib/scientific/methodology/reproducibility/index.ts": [
    "ReproducibilityExplorerAnalysis",
    "ReproducibilityExplorerClassification",
    "ReproducibilityExplorerBuildInput",
    "buildReproducibilityExplorerAnalysis",
    "hasReproducibilityExplorerInput",
    "hasReproducibilityExplorerVeryHigh",
    "hasReproducibilityExplorerLow",
    "getReproducibilityExplorerClassificationLabel",
    "getReproducibilityExplorerReportLines",
  ],
});

// --- Structural: acyclic imports + no React/page ---

const methodologyRoot = join(repoRoot, "src/lib/scientific/methodology");
const methodologyFiles = collectMethodologyTsFiles(repoRoot);

assertMethodologyLegacyForbiddenImports(assertCase, repoRoot, methodologyFiles);

const consistencySources = methodologyFiles
  .filter((path) => path.includes(`${join("methodology", "consistency")}`))
  .map((path) => readFileSync(path, "utf8"));
const reportQualitySources = methodologyFiles
  .filter((path) => path.includes(`${join("methodology", "report-quality")}`))
  .map((path) => readFileSync(path, "utf8"));

assertCase(
  "structure.acyclic.consistency-no-report-quality",
  consistencySources.every(
    (source) =>
      !source.includes("methodology/report-quality") &&
      !source.includes("methodology/reproducibility")
  )
);
assertCase(
  "structure.acyclic.report-quality-no-reproducibility",
  reportQualitySources.every(
    (source) => !source.includes("methodology/reproducibility")
  )
);

assertCase(
  "structure.acyclic.reproducibility-imports-upstream",
  existsSync(join(methodologyRoot, "reproducibility", "build.ts")) &&
    readFileSync(join(methodologyRoot, "reproducibility", "build.ts"), "utf8").includes(
      'from "@/lib/scientific/methodology/consistency"'
    ) &&
    readFileSync(join(methodologyRoot, "reproducibility", "build.ts"), "utf8").includes(
      'from "@/lib/scientific/methodology/report-quality"'
    )
);

// --- Module presence ---

assertModuleFilesPresent(
  assertCase,
  repoRoot,
  ["consistency", "report-quality", "reproducibility"],
  [
    "types.ts",
    "input-types.ts",
    "build.ts",
    "labels.ts",
    "reporting.ts",
    "index.ts",
  ]
);

emitGateSummary("methodology-f5a-unit", results);
