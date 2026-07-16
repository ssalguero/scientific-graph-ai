/**
 * GRAPH-2e rendering gate extension cases (PROD-2E D35.4).
 */
import fs from "node:fs";
import path from "node:path";

import * as renderingBarrel from "@/components/graph/chart-rendering";
import {
  curveLegendKey,
  derivativeLegendKey,
  experimentalLegendKey,
  integralLegendKey,
  regressionLegendKey,
} from "@/components/graph/chart-rendering";
import { mapExperimentalScatterData } from "@/components/graph/chart-rendering/scatterAdapters";
import {
  DERIVATIVE_STROKE_OPACITY,
  INTEGRAL_STROKE_OPACITY,
} from "@/components/graph/chart-rendering/tokens";
import {
  assertBarrelApiFreeze,
  assertPageNoInlinePatterns,
  createCaseRecorder,
  readRepoFile,
  type CaseResult,
} from "./methodology-gate-utils";

const REPO_ROOT = process.cwd();
const RENDERING_MODULE_ROOT = path.join(
  REPO_ROOT,
  "src/components/graph/chart-rendering"
);
const AXES_BARREL_PATH = "src/lib/graph/axes/index.ts";
const INTERACTION_BARREL_PATH = "src/components/graph/chart-interaction/index.ts";

const FROZEN_RENDERING_BARREL_SOURCE = [
  "export {",
  "  curveLegendKey,",
  "  derivativeLegendKey,",
  "  integralLegendKey,",
  "  experimentalLegendKey,",
  "  regressionLegendKey,",
  '} from "./legendKeys";',
  'export { MainChartLegend } from "./MainChartLegend";',
  'export { MainComposedChart } from "./MainComposedChart";',
].join("\n");

const FROZEN_RENDERING_BARREL_API: Record<string, string[]> = {
  "src/components/graph/chart-rendering/index.ts": [
    "MainChartLegend",
    "MainComposedChart",
    "curveLegendKey",
    "derivativeLegendKey",
    "experimentalLegendKey",
    "integralLegendKey",
    "regressionLegendKey",
  ],
};

const FROZEN_INTERACTION_BARREL_SOURCE = [
  'export { useChartViewportInteraction } from "./useChartViewportInteraction";',
  'export { ChartInteractionSurface } from "./ChartInteractionSurface";',
].join("\n");

const FROZEN_AXES_BARREL_SOURCE = [
  'export * from "../viewport";',
  'export * from "./types";',
  'export * from "./scales";',
  'export * from "./ranges";',
  'export * from "./grid";',
  'export * from "./synchronization";',
].join("\n");

const REQUIRED_RENDERING_FILES = [
  "types.ts",
  "legendKeys.ts",
  "scatterAdapters.ts",
  "markers.tsx",
  "tokens.ts",
  "MainChartLegend.tsx",
  "MainComposedChart.tsx",
  "index.ts",
];

const DOMAIN_MATH_PATTERNS: RegExp[] = [
  /\bgetChartTheme\s*\(/,
  /\bclampVisibleXRange\s*\(/,
  /\bcomputeWheelZoomVisibleRange\s*\(/,
  /\bcomputePanVisibleRange\s*\(/,
  /\badaptYDomainForLogScale\s*\(/,
  /\bcomputeXAxisDomainForChart\s*\(/,
  /\bbuildErrorBarSeries\s*\(/,
  /\bgenerateDerivativePoints\s*\(/,
  /\bgenerateIntegralPoints\s*\(/,
  /\bcalculateCriticalPoints\s*\(/,
  /\bcalculateCurveRoots\s*\(/,
];

const PAGE_INLINE_MOVE_PATTERNS: RegExp[] = [
  /\bconst\s+renderMaximumMarker\b/,
  /\bconst\s+renderMinimumMarker\b/,
  /\bconst\s+curveLegendKey\s*=/,
  /\bconst\s+derivativeLegendKey\s*=/,
  /\bconst\s+integralLegendKey\s*=/,
  /\bconst\s+experimentalLegendKey\s*=/,
  /\bconst\s+regressionLegendKey\s*=/,
  /\bconst\s+getExperimentalPointReactKey\b/,
  /\bconst\s+mapExperimentalScatterData\b/,
  /\bconst\s+DERIVATIVE_STROKE_OPACITY\b/,
  /\bconst\s+INTEGRAL_STROKE_OPACITY\b/,
  /<ComposedChart\b/,
];

const collectRenderingSources = (): string[] => {
  return REQUIRED_RENDERING_FILES.filter((name) => name !== "index.ts").map(
    (name) => readRepoFile(REPO_ROOT, `src/components/graph/chart-rendering/${name}`)
  );
};

const extractImportBlocks = (
  source: string
): { isTypeOnly: boolean; specifier: string }[] => {
  const blocks: { isTypeOnly: boolean; specifier: string }[] = [];
  const pattern =
    /import\s+(type\s+)?(?:[\s\S]*?)from\s+["']([^"']+)["']/g;
  for (const match of source.matchAll(pattern)) {
    blocks.push({
      isTypeOnly: Boolean(match[1]),
      specifier: match[2],
    });
  }
  return blocks;
};

const isAllowedRenderingImport = (
  specifier: string,
  isTypeOnly: boolean
): boolean => {
  if (specifier === "react" || specifier.startsWith("react/")) return true;
  if (specifier === "recharts" || specifier.startsWith("recharts/")) return true;
  if (specifier.startsWith("./") || specifier.startsWith("../")) return true;
  if (specifier === "@/lib/graph/series") return isTypeOnly;
  return false;
};

export const runGraphRenderingGateExtensionCaseSuite = (): CaseResult[] => {
  const { results, assertCase } = createCaseRecorder();

  for (const relFile of REQUIRED_RENDERING_FILES) {
    assertCase(
      `structure.rendering.${relFile.replace(/[./]/g, "_")}`,
      fs.existsSync(path.join(RENDERING_MODULE_ROOT, relFile))
    );
  }

  const barrelSource = readRepoFile(
    REPO_ROOT,
    "src/components/graph/chart-rendering/index.ts"
  )
    .replace(/\r\n/g, "\n")
    .trim();

  assertCase(
    "structure.barrel.rendering.exact-source",
    barrelSource === FROZEN_RENDERING_BARREL_SOURCE
  );

  assertBarrelApiFreeze(assertCase, REPO_ROOT, FROZEN_RENDERING_BARREL_API);

  assertCase(
    "structure.barrel.rendering.symbol.MainChartLegend",
    typeof renderingBarrel.MainChartLegend === "function"
  );
  assertCase(
    "structure.barrel.rendering.symbol.MainComposedChart",
    typeof renderingBarrel.MainComposedChart === "function"
  );
  assertCase(
    "structure.barrel.rendering.symbol.curveLegendKey",
    typeof renderingBarrel.curveLegendKey === "function"
  );
  assertCase(
    "structure.barrel.rendering.symbol.derivativeLegendKey",
    typeof renderingBarrel.derivativeLegendKey === "function"
  );
  assertCase(
    "structure.barrel.rendering.symbol.integralLegendKey",
    typeof renderingBarrel.integralLegendKey === "function"
  );
  assertCase(
    "structure.barrel.rendering.symbol.experimentalLegendKey",
    typeof renderingBarrel.experimentalLegendKey === "function"
  );
  assertCase(
    "structure.barrel.rendering.symbol.regressionLegendKey",
    typeof renderingBarrel.regressionLegendKey === "function"
  );

  assertCase(
    "structure.barrel.rendering.typesNotExported",
    !barrelSource.includes("MainComposedChartProps") &&
      !barrelSource.includes("MainChartLegendProps") &&
      !barrelSource.includes("ChartThemeTokens") &&
      !barrelSource.includes("ChartOutlierMethod")
  );

  assertCase("tokens.derivativeOpacity", DERIVATIVE_STROKE_OPACITY === 0.55);
  assertCase("tokens.integralOpacity", INTEGRAL_STROKE_OPACITY === 0.5);

  assertCase("legendKeys.curve", curveLegendKey(2) === "curve:2");
  assertCase("legendKeys.derivative", derivativeLegendKey(3) === "derivative:3");
  assertCase("legendKeys.integral", integralLegendKey(4) === "integral:4");
  assertCase(
    "legendKeys.experimental",
    experimentalLegendKey("abc") === "exp:abc"
  );
  assertCase(
    "legendKeys.regression",
    regressionLegendKey("r1") === "regression:r1"
  );

  const mapped = mapExperimentalScatterData("S", [
    { x: 1, y: 2 },
    { x: 3, y: 4 },
  ]);
  assertCase(
    "scatterAdapters.pointKey",
    mapped.length === 2 &&
      mapped[0].pointKey === "S-1-2-0" &&
      mapped[1].pointKey === "S-3-4-1" &&
      mapped[0].x === 1 &&
      mapped[0].y === 2
  );

  const markersSource = readRepoFile(
    REPO_ROOT,
    "src/components/graph/chart-rendering/markers.tsx"
  );
  assertCase(
    "markers.maximum.frozen",
    markersSource.includes('fill="var(--app-success)"') &&
      markersSource.includes("${cx},${cy - 6} ${cx - 5},${cy + 4} ${cx + 5},${cy + 4}")
  );
  assertCase(
    "markers.minimum.frozen",
    markersSource.includes('fill="var(--app-danger)"') &&
      markersSource.includes("${cx},${cy + 6} ${cx - 5},${cy - 4} ${cx + 5},${cy - 4}")
  );
  assertCase(
    "markers.useClient",
    markersSource.includes('"use client"')
  );

  const typesSource = readRepoFile(
    REPO_ROOT,
    "src/components/graph/chart-rendering/types.ts"
  );
  assertCase(
    "types.structural.MainComposedChartProps",
    typesSource.includes("export type MainComposedChartProps")
  );
  assertCase(
    "types.structural.MainChartLegendProps",
    typesSource.includes("export type MainChartLegendProps")
  );
  assertCase(
    "types.structural.ChartThemeTokens",
    typesSource.includes("export type ChartThemeTokens")
  );
  assertCase(
    "types.seriesTypeOnly",
    /import\s+type\s*\{[\s\S]*ErrorBarSeries[\s\S]*ExperimentalSeries[\s\S]*\}\s*from\s*["']@\/lib\/graph\/series["']/.test(
      typesSource
    ) ||
      /import\s+type\s*\{[\s\S]*ExperimentalSeries[\s\S]*ErrorBarSeries[\s\S]*\}\s*from\s*["']@\/lib\/graph\/series["']/.test(
        typesSource
      )
  );

  const legendSource = readRepoFile(
    REPO_ROOT,
    "src/components/graph/chart-rendering/MainChartLegend.tsx"
  );
  const chartSource = readRepoFile(
    REPO_ROOT,
    "src/components/graph/chart-rendering/MainComposedChart.tsx"
  );
  assertCase(
    "governance.rendering.useClientLegend",
    legendSource.includes('"use client"')
  );
  assertCase(
    "governance.rendering.useClientChart",
    chartSource.includes('"use client"')
  );

  const renderingSources = [
    ...collectRenderingSources(),
    barrelSource,
  ];

  assertCase(
    "governance.rendering.noAppImports",
    renderingSources.every(
      (source) =>
        !/from\s+["']@\/app\//.test(source) &&
        !/from\s+["'][^"']*src\/app\//.test(source)
    )
  );

  assertCase(
    "governance.rendering.noChartInteractionImport",
    renderingSources.every(
      (source) => !/from\s+["']@\/components\/graph\/chart-interaction/.test(source)
    )
  );

  assertCase(
    "governance.rendering.noAxesValueImport",
    renderingSources.every(
      (source) => !/from\s+["']@\/lib\/graph\/axes["']/.test(source)
    )
  );

  assertCase(
    "governance.rendering.noViewportImport",
    renderingSources.every(
      (source) => !/from\s+["']@\/lib\/graph\/viewport["']/.test(source)
    )
  );

  assertCase(
    "governance.rendering.noCurvesImport",
    renderingSources.every(
      (source) => !/from\s+["']@\/lib\/graph\/curves/.test(source)
    )
  );

  const importBlocks = renderingSources.flatMap(extractImportBlocks);
  const forbiddenImports = importBlocks.filter(
    (block) => !isAllowedRenderingImport(block.specifier, block.isTypeOnly)
  );
  assertCase(
    "governance.rendering.allowedImportsOnly",
    forbiddenImports.length === 0,
    forbiddenImports
      .map((block) => `${block.isTypeOnly ? "type:" : "value:"}${block.specifier}`)
      .join(", ") || undefined
  );

  const stripComments = (source: string): string =>
    source
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");

  assertCase(
    "governance.rendering.noDomainMath",
    renderingSources.every((source) =>
      DOMAIN_MATH_PATTERNS.every(
        (pattern) => !pattern.test(stripComments(source))
      )
    )
  );

  const pageSource = readRepoFile(REPO_ROOT, "src/app/page.tsx");

  assertCase(
    "governance.rendering.pageUsesMainComposedChart",
    pageSource.includes("<MainComposedChart")
  );

  assertCase(
    "governance.rendering.pageUsesMainChartLegend",
    pageSource.includes("<MainChartLegend")
  );

  assertCase(
    "governance.rendering.importsBarrelOnly",
    pageSource.includes('from "@/components/graph/chart-rendering"') &&
      !/@\/components\/graph\/chart-rendering\//.test(pageSource)
  );

  assertPageNoInlinePatterns(
    assertCase,
    pageSource,
    PAGE_INLINE_MOVE_PATTERNS
  );

  const axesBarrelSource = readRepoFile(REPO_ROOT, AXES_BARREL_PATH)
    .replace(/\r\n/g, "\n")
    .trim();
  assertCase(
    "governance.axes.barrelUnchanged",
    axesBarrelSource === FROZEN_AXES_BARREL_SOURCE
  );

  const interactionBarrelSource = readRepoFile(
    REPO_ROOT,
    INTERACTION_BARREL_PATH
  )
    .replace(/\r\n/g, "\n")
    .trim();
  assertCase(
    "governance.interaction.barrelUnchanged",
    interactionBarrelSource === FROZEN_INTERACTION_BARREL_SOURCE
  );

  return results;
};
