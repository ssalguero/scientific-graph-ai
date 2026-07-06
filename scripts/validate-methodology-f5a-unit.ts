import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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

type CaseResult = {
  id: string;
  pass: boolean;
  detail?: string;
};

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const results: CaseResult[] = [];

function assertCase(id: string, pass: boolean, detail?: string) {
  results.push({ id, pass, detail });
}

function approxEqual(actual: number, expected: number, epsilon = 0.05) {
  return Math.abs(actual - expected) <= epsilon;
}

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
const inlineDomainPatterns = [
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
];

for (const pattern of inlineDomainPatterns) {
  assertCase(
    `structure.page.no-inline.${pattern.source}`,
    !pattern.test(pageSource),
    pattern.source
  );
}

assertCase(
  "structure.page.imports-consistency-barrel",
  pageSource.includes('from "@/lib/scientific/methodology/consistency"')
);
assertCase(
  "structure.page.imports-report-quality-barrel",
  pageSource.includes('from "@/lib/scientific/methodology/report-quality"')
);
assertCase(
  "structure.page.imports-reproducibility-barrel",
  pageSource.includes('from "@/lib/scientific/methodology/reproducibility"')
);

// --- Structural: barrel public API ---

const allowedBarrelExports: Record<string, string[]> = {
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
};

function extractBarrelExports(source: string): string[] {
  const exports: string[] = [];
  const typeExportBlocks = source.matchAll(
    /export\s+type\s*\{([^}]+)\}/g
  );
  for (const match of typeExportBlocks) {
    for (const item of match[1].split(",")) {
      const name = item.trim().split(/\s+as\s+/)[0].trim();
      if (name) exports.push(name);
    }
  }
  const valueExportBlocks = source.matchAll(
    /export\s*\{([^}]+)\}/g
  );
  for (const match of valueExportBlocks) {
    for (const item of match[1].split(",")) {
      const name = item.trim().split(/\s+as\s+/)[0].trim();
      if (name && !name.startsWith("type ")) exports.push(name);
    }
  }
  return exports.sort();
}

for (const [relPath, allowed] of Object.entries(allowedBarrelExports)) {
  const source = readFileSync(join(repoRoot, relPath), "utf8");
  const actual = extractBarrelExports(source);
  const allowedSorted = [...allowed].sort();
  const unexpected = actual.filter((name) => !allowedSorted.includes(name));
  const missing = allowedSorted.filter((name) => !actual.includes(name));
  assertCase(
    `structure.barrel.${relPath.split("/").slice(-2, -1)[0]}.exact-api`,
    unexpected.length === 0 && missing.length === 0,
    unexpected.length > 0
      ? `unexpected: ${unexpected.join(", ")}`
      : missing.length > 0
        ? `missing: ${missing.join(", ")}`
        : actual.join(", ")
  );
}

// --- Structural: acyclic imports + no React/page ---

const methodologyRoot = join(repoRoot, "src/lib/scientific/methodology");
const methodologyFiles: string[] = [];

function collectTsFiles(dir: string) {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) {
      collectTsFiles(abs);
    } else if (name.endsWith(".ts")) {
      methodologyFiles.push(abs);
    }
  }
}

collectTsFiles(methodologyRoot);

const forbiddenImportPatterns = [
  { id: "react", pattern: /from\s+["']react["']/ },
  { id: "page", pattern: /from\s+["']@\/app\/page/ },
  { id: "page-relative", pattern: /from\s+["'].*page\.tsx["']/ },
];

for (const filePath of methodologyFiles) {
  const rel = filePath.replace(repoRoot + "\\", "").replace(repoRoot + "/", "");
  const source = readFileSync(filePath, "utf8");
  for (const { id, pattern } of forbiddenImportPatterns) {
    assertCase(
      `structure.methodology.no-${id}.${rel.split("/").pop()}`,
      !pattern.test(source),
      rel
    );
  }
}

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

for (const moduleName of ["consistency", "report-quality", "reproducibility"]) {
  for (const fileName of [
    "types.ts",
    "input-types.ts",
    "build.ts",
    "labels.ts",
    "reporting.ts",
    "index.ts",
  ]) {
    assertCase(
      `structure.module.${moduleName}.${fileName}`,
      existsSync(join(methodologyRoot, moduleName, fileName))
    );
  }
}

const summary = {
  phase: "methodology-f5a-unit",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
