import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { AssumptionTrackerAnalysis } from "../src/lib/scientific/methodology/assumptions";
import type { ConsistencyEngineAnalysis } from "../src/lib/scientific/methodology/consistency";
import type { EvidenceStrengthEngineAnalysis } from "../src/lib/scientific/methodology/evidence";
import type { ReportQualityEngineAnalysis } from "../src/lib/scientific/methodology/report-quality";
import type { ReproducibilityExplorerAnalysis } from "../src/lib/scientific/methodology/reproducibility";
import {
  buildPublicationReadinessAnalyzerAnalysis,
  getPublicationReadinessAnalyzerClassificationLabel,
  getPublicationReadinessAnalyzerReportLines,
  hasPublicationReadinessAnalyzerInput,
  hasPublicationReadinessAnalyzerNotReady,
  hasPublicationReadinessAnalyzerReady,
} from "../src/lib/scientific/methodology/readiness";
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

const emptyReadinessInput = {
  consistencyEngineAnalysis: null,
  reportQualityEngineAnalysis: null,
  reproducibilityExplorerAnalysis: null,
  evidenceStrengthEngineAnalysis: null,
  assumptionTrackerAnalysis: null,
};

// --- SCI-55 behavioral ---

assertCase(
  "sci55.builder.empty-input",
  buildPublicationReadinessAnalyzerAnalysis(emptyReadinessInput) === null,
  "empty upstream returns null"
);

assertCase(
  "sci55.builder.has-input-gate",
  hasPublicationReadinessAnalyzerInput({
    ...emptyReadinessInput,
    consistencyEngineAnalysis: mockConsistencyStrong,
  }),
  "consistency alone satisfies input gate"
);

const readyReadiness = buildPublicationReadinessAnalyzerAnalysis({
  consistencyEngineAnalysis: mockConsistencyStrong,
  reportQualityEngineAnalysis: mockReportQualityStrong,
  reproducibilityExplorerAnalysis: mockReproducibilityStrong,
  evidenceStrengthEngineAnalysis: mockEvidenceStrong,
  assumptionTrackerAnalysis: mockAssumptionsExcellent,
});

assertCase("sci55.builder.ready-not-null", readyReadiness !== null);
assertCase(
  "sci55.classification.publication-ready",
  readyReadiness?.classification === "publication-ready",
  readyReadiness?.classification
);
assertCase(
  "sci55.classification.score",
  readyReadiness !== null && approxEqual(readyReadiness.readinessScore, 90),
  readyReadiness ? String(readyReadiness.readinessScore) : "null"
);
assertCase(
  "sci55.flags.ready",
  hasPublicationReadinessAnalyzerReady(readyReadiness),
  "ready helper"
);
assertCase(
  "sci55.flags.not-ready-false",
  hasPublicationReadinessAnalyzerNotReady(readyReadiness) === false,
  "not-ready helper false when ready"
);

const notReadyReadiness = buildPublicationReadinessAnalyzerAnalysis({
  ...emptyReadinessInput,
  consistencyEngineAnalysis: {
    consistencyScore: 30,
    classification: "weak",
    evidenceCount: 1,
    supportingModules: [],
    interpretation: ["Weak consistency."],
  },
});

assertCase("sci55.builder.not-ready-not-null", notReadyReadiness !== null);
assertCase(
  "sci55.classification.not-ready",
  notReadyReadiness?.classification === "not-ready",
  notReadyReadiness?.classification
);
assertCase(
  "sci55.classification.not-ready-score",
  notReadyReadiness !== null && notReadyReadiness.readinessScore < 50,
  notReadyReadiness ? String(notReadyReadiness.readinessScore) : "null"
);
assertCase(
  "sci55.flags.not-ready",
  hasPublicationReadinessAnalyzerNotReady(notReadyReadiness),
  "not-ready helper"
);
assertCase(
  "sci55.flags.ready-false",
  hasPublicationReadinessAnalyzerReady(notReadyReadiness) === false,
  "ready helper false when not-ready"
);

const nearReadyReadiness = buildPublicationReadinessAnalyzerAnalysis({
  consistencyEngineAnalysis: {
    consistencyScore: 75,
    classification: "strong",
    evidenceCount: 3,
    supportingModules: ["pca"],
    interpretation: ["Strong."],
  },
  reportQualityEngineAnalysis: {
    qualityScore: 75,
    classification: "good",
    evaluatedCriteria: 4,
    interpretation: ["Good quality."],
  },
  reproducibilityExplorerAnalysis: {
    reproducibilityScore: 75,
    classification: "high",
    evaluatedFactors: 4,
    interpretation: ["High reproducibility."],
  },
  evidenceStrengthEngineAnalysis: {
    evidenceScore: 75,
    classification: "strong",
    evidenceSources: 4,
    interpretation: ["Strong evidence."],
  },
  assumptionTrackerAnalysis: {
    overallScore: 75,
    classification: "good",
    assumptions: [],
    interpretation: ["Good assumptions."],
  },
});

assertCase("sci55.builder.near-ready-not-null", nearReadyReadiness !== null);
assertCase(
  "sci55.classification.near-ready",
  nearReadyReadiness?.classification === "near-ready",
  nearReadyReadiness?.classification
);

assertCase(
  "sci55.labels.publication-ready",
  getPublicationReadinessAnalyzerClassificationLabel("publication-ready") ===
    "Publication Ready"
);
assertCase(
  "sci55.labels.near-ready",
  getPublicationReadinessAnalyzerClassificationLabel("near-ready") === "Near Ready"
);
assertCase(
  "sci55.labels.requires-review",
  getPublicationReadinessAnalyzerClassificationLabel("requires-review") ===
    "Requires Review"
);
assertCase(
  "sci55.labels.not-ready",
  getPublicationReadinessAnalyzerClassificationLabel("not-ready") === "Not Ready"
);

const readyReadinessReport = getPublicationReadinessAnalyzerReportLines(readyReadiness);
assertCase(
  "sci55.report-lines.present",
  readyReadinessReport.length >= 3 &&
    readyReadinessReport[0].startsWith("Readiness Score:") &&
    readyReadinessReport.some((line) => line.includes("Publication Ready")),
  readyReadinessReport.join(" | ")
);
assertCase(
  "sci55.report-lines.empty",
  getPublicationReadinessAnalyzerReportLines(null)[0] ===
    "No hay datos suficientes para generar Publication Readiness Analyzer."
);

// --- Structural: page.tsx has no inline SCI-55 domain ---

const pageSource = readFileSync(join(repoRoot, "src/app/page.tsx"), "utf8");

assertPageNoInlinePatterns(assertCase, pageSource, [
  /const\s+buildPublicationReadinessAnalyzerAnalysis\s*=/,
  /const\s+hasPublicationReadinessAnalyzerInput\s*=/,
  /const\s+hasPublicationReadinessAnalyzerReady\s*=/,
  /const\s+hasPublicationReadinessAnalyzerNotReady\s*=/,
  /const\s+classifyPublicationReadinessAnalyzer\s*=/,
  /type\s+PublicationReadinessAnalyzerAnalysis\s*=\s*\{/,
]);

assertPageImportsBarrels(assertCase, pageSource, [
  {
    id: "readiness-barrel",
    needle: 'from "@/lib/scientific/methodology/readiness"',
  },
]);

// --- Structural: barrel public API ---

assertBarrelApiFreeze(assertCase, repoRoot, {
  "src/lib/scientific/methodology/readiness/index.ts": [
    "PublicationReadinessAnalyzerAnalysis",
    "PublicationReadinessAnalyzerClassification",
    "PublicationReadinessAnalyzerBuildInput",
    "buildPublicationReadinessAnalyzerAnalysis",
    "hasPublicationReadinessAnalyzerInput",
    "hasPublicationReadinessAnalyzerReady",
    "hasPublicationReadinessAnalyzerNotReady",
    "getPublicationReadinessAnalyzerClassificationLabel",
    "getPublicationReadinessAnalyzerReportLines",
  ],
});

// --- Structural: boundary-clean ---

assertMethodologyBoundaryClean(assertCase, repoRoot);

// --- Structural: acyclic imports ---

const methodologyRoot = join(repoRoot, "src/lib/scientific/methodology");
const methodologyFiles = collectMethodologyTsFiles(repoRoot);

const readinessSources = methodologyFiles
  .filter((path) => path.includes(`${join("methodology", "readiness")}`))
  .map((path) => readFileSync(path, "utf8"));

assertCase(
  "structure.acyclic.readiness-no-downstream",
  readinessSources.every(
    (source) =>
      !source.includes("methodology/summary") &&
      !source.includes("methodology/publication")
  )
);

assertCase(
  "structure.acyclic.readiness-imports-upstream",
  readFileSync(join(methodologyRoot, "readiness", "build.ts"), "utf8").includes(
    'from "@/lib/scientific/methodology/assumptions"'
  ) &&
    readFileSync(join(methodologyRoot, "readiness", "build.ts"), "utf8").includes(
      'from "@/lib/scientific/methodology/consistency"'
    ) &&
    readFileSync(join(methodologyRoot, "readiness", "build.ts"), "utf8").includes(
      'from "@/lib/scientific/methodology/evidence"'
    ) &&
    readFileSync(join(methodologyRoot, "readiness", "build.ts"), "utf8").includes(
      'from "@/lib/scientific/methodology/report-quality"'
    ) &&
    readFileSync(join(methodologyRoot, "readiness", "build.ts"), "utf8").includes(
      'from "@/lib/scientific/methodology/reproducibility"'
    )
);

// --- Module presence ---

assertModuleFilesPresent(
  assertCase,
  repoRoot,
  ["readiness"],
  [
    "types.ts",
    "input-types.ts",
    "build.ts",
    "labels.ts",
    "reporting.ts",
    "index.ts",
  ]
);

emitGateSummary("methodology-f5c-unit", results);
