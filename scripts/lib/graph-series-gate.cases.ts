/**
 * GRAPH-2b series gate extension cases (PROD-2E D32.4).
 */
import fs from "node:fs";
import path from "node:path";

import { mergeYMetricsWithExperimental } from "@/lib/graph/curves";
import { computeYMetrics } from "@/lib/graph/curves";
import type { ExperimentalSeries } from "@/lib/graph/series";
import {
  cloneExperimentalSeries,
  computeDatasetMetrics,
} from "@/lib/graph/series";
import {
  assertBarrelApiFreeze,
  assertPageNoInlinePatterns,
  collectTsFilesUnder,
  createCaseRecorder,
  readRepoFile,
  type CaseResult,
} from "./methodology-gate-utils";

const REPO_ROOT = process.cwd();
const SERIES_MODULE_ROOT = path.join(REPO_ROOT, "src/lib/graph/series");

const FROZEN_SERIES_BARREL_API: Record<string, string[]> = {
  "src/lib/graph/series/index.ts": [
    "ErrorBarMode",
    "ErrorBarSeries",
    "ExperimentalDataLayout",
    "ExperimentalDataSource",
    "ExperimentalDataSourceId",
    "ExperimentalSeries",
    "ExperimentalStatistics",
    "SeriesPoint",
    "DEFAULT_EXPERIMENTAL_DATA_SOURCE_ID",
    "EXPERIMENTAL_DATA_SOURCES",
    "buildErrorBarSeries",
    "buildExperimentalSeriesCollection",
    "calculateExperimentalStatistics",
    "cloneExperimentalSeries",
    "computeDatasetMetrics",
    "createSessionDatasetFromImport",
    "createSessionDatasetId",
    "createSessionDatasetInfo",
    "detectExperimentalDataLayout",
    "getExperimentalDataSource",
    "getMostRecentSessionDatasetId",
    "getSeriesYValues",
    "hasMinimumSeriesPoints",
    "importExperimentalDataFile",
    "parseExperimentalDataFile",
    "parseMultiSeriesCsvContent",
    "parseMultiSeriesSpreadsheet",
    "parseOdsFile",
    "parseXlsxFile",
    "sessionDatasetIdentityKey",
    "updateSessionDatasetPayload",
    "validateExperimentalSeriesStructure",
  ],
};

const REQUIRED_SERIES_FILES = [
  "types.ts",
  "builders.ts",
  "transforms.ts",
  "validation.ts",
  "index.ts",
  "__tests__/series.cases.ts",
];

const SHIM_FILES: { relPath: string; allowFunctionExports?: string[] }[] = [
  { relPath: "src/lib/experimentalData.ts" },
  { relPath: "src/lib/project/domain/dataset-series-utils.ts" },
  { relPath: "src/lib/scientific/shared/series.ts" },
  {
    relPath: "src/lib/sessionDatasetRegistry.ts",
    allowFunctionExports: ["slotReferencesSessionDataset"],
  },
];

const countImplementationMatches = (
  repoRoot: string,
  pattern: RegExp,
  excludeRelPaths: string[]
): number => {
  const exclude = new Set(excludeRelPaths.map((item) => path.join(repoRoot, item)));
  let count = 0;

  const walk = (dir: string) => {
    for (const name of fs.readdirSync(dir)) {
      const abs = path.join(dir, name);
      if (fs.statSync(abs).isDirectory()) {
        if (name === "node_modules" || name === ".next") continue;
        walk(abs);
      } else if (name.endsWith(".ts") && !name.endsWith(".d.ts")) {
        if (exclude.has(abs)) continue;
        const source = fs.readFileSync(abs, "utf8");
        const matches = source.match(pattern);
        if (matches) count += matches.length;
      }
    }
  };

  walk(path.join(repoRoot, "src"));
  return count;
};

const isReExportShim = (
  source: string,
  allowFunctionExports: string[] = []
): boolean => {
  const implementationPatterns = [
    /export\s+async\s+function\s+/,
    /export\s+function\s+(\w+)/,
    /export\s+const\s+\w+\s*=\s*(?!type\b)/,
    /export\s+class\s+/,
  ];

  for (const pattern of implementationPatterns) {
    const match = pattern.exec(source);
    if (!match) continue;
    const fnName = match[1];
    if (fnName && allowFunctionExports.includes(fnName)) continue;
    return false;
  }

  return (
    source.includes("@/lib/graph/series") &&
    !source.includes("xlsx") &&
    !/parseCsvContent/.test(source)
  );
};

export const runGraphSeriesGateExtensionCaseSuite = (): CaseResult[] => {
  const { results, assertCase } = createCaseRecorder();

  for (const relFile of REQUIRED_SERIES_FILES) {
    assertCase(
      `governance.seriesDomain.${relFile.replace(/[./]/g, "_")}`,
      fs.existsSync(path.join(SERIES_MODULE_ROOT, relFile))
    );
  }

  assertBarrelApiFreeze(assertCase, REPO_ROOT, FROZEN_SERIES_BARREL_API);

  assertCase(
    "structure.barrel.series.noBuildSeriesFromPreview",
    !readRepoFile(REPO_ROOT, "src/lib/graph/series/index.ts").includes(
      "buildSeriesFromPreview"
    )
  );

  const seriesSources = collectTsFilesUnder(SERIES_MODULE_ROOT).map((filePath) =>
    fs.readFileSync(filePath, "utf8")
  );

  assertCase(
    "governance.series.noReact",
    seriesSources.every(
      (source) =>
        !/from\s+["']react(?:\/|["'])/.test(source) &&
        !source.includes('"use client"')
    )
  );

  assertCase(
    "governance.series.noRecharts",
    seriesSources.every((source) => !/from\s+["']recharts/.test(source))
  );

  assertCase(
    "governance.series.noAppImports",
    seriesSources.every(
      (source) =>
        !/from\s+["']@\/app\//.test(source) &&
        !/from\s+["'].*src\/app\//.test(source)
    )
  );

  assertCase(
    "governance.series.noExperimentalDataShimDependency",
    seriesSources.every(
      (source) => !/from\s+["']@\/lib\/experimentalData/.test(source)
    )
  );

  for (const shim of SHIM_FILES) {
    const source = readRepoFile(REPO_ROOT, shim.relPath);
    assertCase(
      `governance.shim.${shim.relPath.split("/").slice(-1)[0].replace(".ts", "")}.reexportOnly`,
      isReExportShim(source, shim.allowFunctionExports ?? [])
    );
  }

  assertCase(
    "governance.cloneExperimentalSeries.singleImplementation",
    countImplementationMatches(
      REPO_ROOT,
      /export function cloneExperimentalSeries/g,
      ["src/lib/graph/series/transforms.ts"]
    ) === 0
  );

  assertCase(
    "governance.computeDatasetMetrics.singleImplementation",
    countImplementationMatches(
      REPO_ROOT,
      /export function computeDatasetMetrics/g,
      ["src/lib/graph/series/transforms.ts"]
    ) === 0
  );

  const pageSource = readRepoFile(REPO_ROOT, "src/app/page.tsx");
  assertPageNoInlinePatterns(assertCase, pageSource, [
    /const calculateExperimentalStatistics\s*=/,
    /const buildErrorBarSeries\s*=/,
    /const getStandardError\s*=/,
    /const getCi95Margin\s*=/,
    /type ExperimentalStatistics\s*=\s*\{/,
    /type ErrorBarSeries\s*=\s*\{/,
  ]);

  assertCase(
    "governance.page.importsSeriesBarrel",
    pageSource.includes('from "@/lib/graph/series"')
  );

  const curvesMetricsSource = readRepoFile(
    REPO_ROOT,
    "src/lib/graph/curves/metrics.ts"
  );
  assertCase(
    "compat.curves.metricsSeriesTypePath",
    curvesMetricsSource.includes('from "@/lib/graph/series"')
  );

  const experimentalSeries: ExperimentalSeries[] = [
    {
      id: "compat-1",
      name: "Compat",
      color: "#3b82f6",
      points: [
        { x: 0, y: 1 },
        { x: 1, y: 3 },
      ],
    },
  ];
  const merged = mergeYMetricsWithExperimental(
    computeYMetrics([2, 4]),
    experimentalSeries
  );
  assertCase(
    "compat.curves.mergeYMetricsWithExperimental",
    merged.minObservedY === 1 && merged.maxObservedY === 4
  );

  const typesV2Source = readRepoFile(
    REPO_ROOT,
    "src/lib/project/domain/types-v2.ts"
  );
  assertCase(
    "compat.persistenceV2.experimentalSeriesTypeImport",
    typesV2Source.includes('from "@/lib/experimentalData"') &&
      typesV2Source.includes("ExperimentalSeries")
  );

  const visualGraphBuilderSource = readRepoFile(
    REPO_ROOT,
    "src/lib/visualGraphBuilder.ts"
  );
  const worksheetSource = readRepoFile(
    REPO_ROOT,
    "src/lib/experimentalWorksheet.ts"
  );
  assertCase(
    "compat.vgb.seriesToWorksheetStay",
    worksheetSource.includes("export function seriesToWorksheet") &&
      visualGraphBuilderSource.includes("seriesToWorksheet")
  );

  assertCase(
    "compat.shim.experimentalData.reexport",
    readRepoFile(REPO_ROOT, "src/lib/experimentalData.ts").includes(
      'from "@/lib/graph/series"'
    )
  );

  assertCase(
    "compat.shim.sessionRegistry.sessionTypesStay",
    readRepoFile(REPO_ROOT, "src/lib/sessionDatasetRegistry.ts").includes(
      "export type SessionDataset"
    ) &&
      readRepoFile(REPO_ROOT, "src/lib/sessionDatasetRegistry.ts").includes(
        "export type SessionDatasetPayload"
      )
  );

  const cloned = cloneExperimentalSeries(experimentalSeries);
  const metrics = computeDatasetMetrics(cloned);
  assertCase(
    "compat.shim.cloneAndMetrics.delegate",
    cloned[0]?.points !== experimentalSeries[0]?.points &&
      metrics.seriesCount === 1 &&
      metrics.observationCount === 2
  );

  return results;
};
