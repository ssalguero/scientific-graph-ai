/**
 * GRAPH-2d interaction gate extension cases (PROD-2E D34.4).
 */
import fs from "node:fs";
import path from "node:path";

import * as interactionBarrel from "@/components/graph/chart-interaction";
import {
  assertBarrelApiFreeze,
  assertPageNoInlinePatterns,
  collectTsFilesUnder,
  createCaseRecorder,
  readRepoFile,
  type CaseResult,
} from "./methodology-gate-utils";

const REPO_ROOT = process.cwd();
const INTERACTION_MODULE_ROOT = path.join(
  REPO_ROOT,
  "src/components/graph/chart-interaction"
);
const AXES_BARREL_PATH = "src/lib/graph/axes/index.ts";

const FROZEN_INTERACTION_BARREL_SOURCE = [
  'export { useChartViewportInteraction } from "./useChartViewportInteraction";',
  'export { ChartInteractionSurface } from "./ChartInteractionSurface";',
].join("\n");

const FROZEN_INTERACTION_BARREL_API: Record<string, string[]> = {
  "src/components/graph/chart-interaction/index.ts": [
    "ChartInteractionSurface",
    "useChartViewportInteraction",
  ],
};

const FROZEN_AXES_BARREL_SOURCE = [
  'export * from "../viewport";',
  'export * from "./types";',
  'export * from "./scales";',
  'export * from "./ranges";',
  'export * from "./grid";',
  'export * from "./synchronization";',
].join("\n");

const FROZEN_CHART_INTERACTION_SURFACE_CLASS_NAME =
  "w-full min-h-[360px] h-[min(42vh,480px)] sm:min-h-[400px] sm:h-[min(48vh,520px)] max-h-[520px] select-none cursor-grab active:cursor-grabbing";

const REQUIRED_INTERACTION_FILES = [
  "types.ts",
  "useChartViewportInteraction.ts",
  "ChartInteractionSurface.tsx",
  "index.ts",
];

const VIEWPORT_MATH_INLINE_PATTERNS: RegExp[] = [
  /\b1\.15\b/,
  /clampVisibleXRange\s*\(/,
  /\bzoomFactor\b/,
  /\bfocusX\s*=/,
  /\bnewSpan\s*=/,
  /\bdeltaData\s*=/,
];

const PAGE_INLINE_INTERACTION_PATTERNS: RegExp[] = [
  /\bchartInteractionRef\b/,
  /\bvisibleRangeRef\b/,
  /\bpanStateRef\b/,
  /\bhandleChartMouseDown\b/,
  /\bhandleChartMouseMove\b/,
  /\bhandleChartMouseUp\b/,
  /addEventListener\(\s*["']wheel["']/,
];

const extractImportSources = (source: string): string[] => {
  const imports: string[] = [];
  const pattern = /from\s+["']([^"']+)["']/g;
  for (const match of source.matchAll(pattern)) {
    imports.push(match[1]);
  }
  return imports;
};

const isAllowedInteractionImport = (specifier: string): boolean => {
  if (specifier === "react" || specifier.startsWith("react/")) return true;
  if (specifier === "@/lib/graph/axes") return true;
  if (specifier.startsWith("./") || specifier.startsWith("../")) return true;
  return false;
};

export const runGraphInteractionGateExtensionCaseSuite = (): CaseResult[] => {
  const { results, assertCase } = createCaseRecorder();

  for (const relFile of REQUIRED_INTERACTION_FILES) {
    assertCase(
      `structure.interaction.${relFile.replace(/[./]/g, "_")}`,
      fs.existsSync(path.join(INTERACTION_MODULE_ROOT, relFile))
    );
  }

  const barrelSource = readRepoFile(
    REPO_ROOT,
    "src/components/graph/chart-interaction/index.ts"
  )
    .replace(/\r\n/g, "\n")
    .trim();

  assertCase(
    "structure.barrel.interaction.exact-source",
    barrelSource === FROZEN_INTERACTION_BARREL_SOURCE
  );

  assertBarrelApiFreeze(assertCase, REPO_ROOT, FROZEN_INTERACTION_BARREL_API);

  assertCase(
    "structure.barrel.interaction.symbol.useChartViewportInteraction",
    typeof interactionBarrel.useChartViewportInteraction === "function"
  );

  assertCase(
    "structure.barrel.interaction.symbol.ChartInteractionSurface",
    typeof interactionBarrel.ChartInteractionSurface === "function"
  );

  const hookSource = readRepoFile(
    REPO_ROOT,
    "src/components/graph/chart-interaction/useChartViewportInteraction.ts"
  );
  const surfaceSource = readRepoFile(
    REPO_ROOT,
    "src/components/graph/chart-interaction/ChartInteractionSurface.tsx"
  );

  assertCase(
    "governance.interaction.importsComputeWheelZoomVisibleRange",
    hookSource.includes("computeWheelZoomVisibleRange")
  );

  assertCase(
    "governance.interaction.importsComputePanVisibleRange",
    hookSource.includes("computePanVisibleRange")
  );

  assertCase(
    "governance.interaction.delegatesWheelZoom",
    /computeWheelZoomVisibleRange\s*\(\s*\{/.test(hookSource)
  );

  assertCase(
    "governance.interaction.delegatesPan",
    /computePanVisibleRange\s*\(\s*\{/.test(hookSource)
  );

  assertCase(
    "governance.interaction.wheelPassiveFalse",
    hookSource.includes('addEventListener("wheel"') &&
      hookSource.includes("passive: false")
  );

  assertCase(
    "governance.interaction.wheelCleanup",
    hookSource.includes('removeEventListener("wheel"')
  );

  assertCase(
    "governance.interaction.mouseupCleanup",
    hookSource.includes('window.addEventListener("mouseup"') &&
      hookSource.includes('window.removeEventListener("mouseup"')
  );

  assertCase(
    "governance.interaction.resetVisibleRange",
    hookSource.includes("const resetVisibleRange") &&
      hookSource.includes("resetVisibleRange,")
  );

  assertCase(
    "governance.interaction.useClientHook",
    hookSource.includes('"use client"')
  );

  assertCase(
    "governance.interaction.useClientSurface",
    surfaceSource.includes('"use client"')
  );

  assertCase(
    "governance.interaction.frozenClassName",
    surfaceSource.includes(FROZEN_CHART_INTERACTION_SURFACE_CLASS_NAME)
  );

  const interactionSources = [
    ...collectTsFilesUnder(INTERACTION_MODULE_ROOT).map((filePath) =>
      fs.readFileSync(filePath, "utf8")
    ),
    surfaceSource,
  ];

  assertCase(
    "governance.interaction.noRecharts",
    interactionSources.every((source) => !/from\s+["']recharts/.test(source))
  );

  assertCase(
    "governance.interaction.typesNotExportedFromBarrel",
    !barrelSource.includes("PanState") &&
      !barrelSource.includes("VisibleRangeSnapshot") &&
      !barrelSource.includes("ChartViewportInteractionInput") &&
      !barrelSource.includes("ChartViewportInteractionResult")
  );

  const pageSource = readRepoFile(REPO_ROOT, "src/app/page.tsx");

  assertPageNoInlinePatterns(
    assertCase,
    pageSource,
    PAGE_INLINE_INTERACTION_PATTERNS
  );

  assertCase(
    "governance.interaction.importsBarrelOnly",
    pageSource.includes('from "@/components/graph/chart-interaction"') &&
      !/@\/components\/graph\/chart-interaction\//.test(pageSource) &&
      !/from\s+["'][^"']*chart-interaction\/(useChartViewportInteraction|ChartInteractionSurface|types)["']/.test(
        pageSource
      )
  );

  assertCase(
    "governance.interaction.pageUsesHook",
    pageSource.includes("useChartViewportInteraction(")
  );

  assertCase(
    "governance.interaction.pageUsesSurface",
    pageSource.includes("<ChartInteractionSurface")
  );

  assertCase(
    "governance.interaction.noAppImports",
    interactionSources.every(
      (source) =>
        !/from\s+["']@\/app\//.test(source) &&
        !/from\s+["'][^"']*src\/app\//.test(source)
    )
  );

  const interactionImportSources = interactionSources.flatMap(extractImportSources);
  assertCase(
    "governance.interaction.allowedImportsOnly",
    interactionImportSources.every(isAllowedInteractionImport),
    interactionImportSources
      .filter((specifier) => !isAllowedInteractionImport(specifier))
      .join(", ") || undefined
  );

  const hookAndSurfaceSources = [hookSource, surfaceSource];
  assertCase(
    "governance.interaction.noMathInline",
    hookAndSurfaceSources.every((source) =>
      VIEWPORT_MATH_INLINE_PATTERNS.every((pattern) => !pattern.test(source))
    )
  );

  const axesBarrelSource = readRepoFile(REPO_ROOT, AXES_BARREL_PATH)
    .replace(/\r\n/g, "\n")
    .trim();

  assertCase(
    "governance.axes.barrelUnchanged",
    axesBarrelSource === FROZEN_AXES_BARREL_SOURCE
  );

  return results;
};
