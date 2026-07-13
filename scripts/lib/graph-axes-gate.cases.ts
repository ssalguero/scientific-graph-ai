/**
 * GRAPH-2c axes gate extension cases (PROD-2E D33.4).
 */
import fs from "node:fs";
import path from "node:path";

import * as axesBarrel from "@/lib/graph/axes";
import {
  assertPageNoInlinePatterns,
  collectTsFilesUnder,
  createCaseRecorder,
  readRepoFile,
  type CaseResult,
} from "./methodology-gate-utils";

const REPO_ROOT = process.cwd();
const AXES_MODULE_ROOT = path.join(REPO_ROOT, "src/lib/graph/axes");
const VIEWPORT_PATH = path.join(REPO_ROOT, "src/lib/graph/viewport.ts");

const FROZEN_AXES_BARREL_SOURCE = [
  'export * from "../viewport";',
  'export * from "./types";',
  'export * from "./scales";',
  'export * from "./ranges";',
  'export * from "./grid";',
  'export * from "./synchronization";',
].join("\n");

const FROZEN_AXES_PUBLIC_SYMBOLS = [
  "VIEWPORT_PADDING_RATIO",
  "collectExperimentalXExtent",
  "computeXViewportWithPadding",
  "fitXViewportToExperimentalSeries",
  "applyXViewportRange",
  "applyExperimentalXViewportFit",
  "collectExperimentalYExtent",
  "computePaddedDomain",
  "computeYViewportWithPadding",
  "fitYViewportToExperimentalSeries",
  "computeYAxisDomainFromValues",
  "getAxisScaleModeLabel",
  "usesLogXScale",
  "usesLogYScale",
  "getAxisScaleViolations",
  "getAxisScaleWarnings",
  "clampVisibleXRange",
  "computeWheelZoomVisibleRange",
  "computePanVisibleRange",
  "clampPositiveLogDomain",
  "adaptYDomainForLogScale",
  "computeXAxisDomainForChart",
  "getChartTheme",
  "alignVisibleRangeToDataRange",
];

const REQUIRED_AXES_FILES = [
  "types.ts",
  "scales.ts",
  "ranges.ts",
  "grid.ts",
  "synchronization.ts",
  "index.ts",
  "__tests__/axes.cases.ts",
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

export const runGraphAxesGateExtensionCaseSuite = (): CaseResult[] => {
  const { results, assertCase } = createCaseRecorder();

  for (const relFile of REQUIRED_AXES_FILES) {
    assertCase(
      `governance.axesDomain.${relFile.replace(/[./]/g, "_")}`,
      fs.existsSync(path.join(AXES_MODULE_ROOT, relFile))
    );
  }

  assertCase(
    "governance.axes.noViewportSubmodule",
    !fs.existsSync(path.join(AXES_MODULE_ROOT, "viewport.ts"))
  );

  const barrelSource = readRepoFile(REPO_ROOT, "src/lib/graph/axes/index.ts")
    .replace(/\r\n/g, "\n")
    .trim();
  assertCase(
    "structure.barrel.axes.exact-source",
    barrelSource === FROZEN_AXES_BARREL_SOURCE
  );

  for (const symbol of FROZEN_AXES_PUBLIC_SYMBOLS) {
    assertCase(
      `structure.barrel.axes.export.${symbol}`,
      symbol in axesBarrel &&
        (axesBarrel as Record<string, unknown>)[symbol] !== undefined
    );
  }

  const axesSources = collectTsFilesUnder(AXES_MODULE_ROOT).map((filePath) =>
    fs.readFileSync(filePath, "utf8")
  );

  assertCase(
    "governance.axes.noReact",
    axesSources.every(
      (source) =>
        !/from\s+["']react(?:\/|["'])/.test(source) &&
        !source.includes('"use client"')
    )
  );

  assertCase(
    "governance.axes.noRecharts",
    axesSources.every((source) => !/from\s+["']recharts/.test(source))
  );

  assertCase(
    "governance.axes.noAppImports",
    axesSources.every(
      (source) =>
        !/from\s+["']@\/app\//.test(source) &&
        !/from\s+["'].*src\/app\//.test(source)
    )
  );

  assertCase(
    "governance.axes.noHooks",
    axesSources.every(
      (source) =>
        !/\buseState\b/.test(source) &&
        !/\buseMemo\b/.test(source) &&
        !/\buseEffect\b/.test(source) &&
        !/\buseRef\b/.test(source) &&
        !/\buseCallback\b/.test(source)
    )
  );

  const viewportSource = readRepoFile(REPO_ROOT, "src/lib/graph/viewport.ts");
  assertCase(
    "governance.viewport.ssot.noClampVisibleXRange",
    !viewportSource.includes("clampVisibleXRange")
  );

  assertCase(
    "governance.viewport.ssot.noGetChartTheme",
    !viewportSource.includes("getChartTheme")
  );

  assertCase(
    "governance.clampVisibleXRange.singleImplementation",
    countImplementationMatches(
      REPO_ROOT,
      /export const clampVisibleXRange/g,
      ["src/lib/graph/axes/ranges.ts"]
    ) === 0
  );

  assertCase(
    "governance.getChartTheme.singleImplementation",
    countImplementationMatches(
      REPO_ROOT,
      /export const getChartTheme/g,
      ["src/lib/graph/axes/grid.ts"]
    ) === 0
  );

  const pageSource = readRepoFile(REPO_ROOT, "src/app/page.tsx");

  assertCase(
    "governance.page.importsAxesBarrel",
    pageSource.includes('from "@/lib/graph/axes"')
  );

  assertCase(
    "governance.page.noChartViewportImport",
    !pageSource.includes('from "./chartViewport"') &&
      !pageSource.includes("from './chartViewport'")
  );

  assertCase(
    "governance.page.noViewportDirectImport",
    !pageSource.includes('from "@/lib/graph/viewport"')
  );

  assertPageNoInlinePatterns(assertCase, pageSource, [
    /const clampVisibleXRange\s*=/,
    /const getChartTheme\s*=/,
    /const usesLogXScale\s*=/,
    /const usesLogYScale\s*=/,
    /const getAxisScaleWarnings\s*=/,
    /const getAxisScaleViolations\s*=/,
    /const adaptYDomainForLogScale\s*=/,
    /const computeXAxisDomainForChart\s*=/,
    /const getAxisScaleModeLabel\s*=/,
    /const clampPositiveLogDomain\s*=/,
    /type AxisScaleMode\s*=\s*"/,
    /type ChartScaleSample\s*=\s*\{/,
  ]);

  assertCase(
    "compat.viewport.fileExists",
    fs.existsSync(VIEWPORT_PATH)
  );

  assertCase(
    "compat.chartViewport.shimUnchanged",
    readRepoFile(REPO_ROOT, "src/app/chartViewport.ts").includes(
      'from "@/lib/graph/viewport"'
    )
  );

  assertCase(
    "compat.curves.metrics.viewportDirect",
    readRepoFile(REPO_ROOT, "src/lib/graph/curves/metrics.ts").includes(
      'from "@/lib/graph/viewport"'
    )
  );

  return results;
};
