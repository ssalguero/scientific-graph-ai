/**
 * D44.3 EXPORT-2 testing harness — static integrity + integration path (no scope expansion).
 * Complements unit gates and browser smokes S-E2-01…S-E2-08.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  captureChartAsPngDataUrl,
  DEFAULT_CHART_EXPORT_PIXEL_RATIO,
  DEFAULT_EXPORT_SAMPLE_STEP,
  DEFAULT_LIVE_CHART_SAMPLE_STEP,
  getChartCapturePngOptions,
  getChartCaptureSvgOptions,
  resolveChartExportSampleStep,
  buildChartExportSeriesPoints,
} from "../src/app/chartExport";
import { resolvePdfSectionsForState } from "../src/lib/scientific/visibility";
import type { VisibilityState } from "../src/lib/scientific/visibility";
import {
  PDF_BLOCK_ADVISOR_ID,
  PDF_BLOCK_COMPARISON_ID,
  filterScientificReportSectionsForPdf,
  shouldIncludePdfExportBlock,
} from "../src/lib/scientific/report/pdf-section-filter";

const root = process.cwd();
let passed = 0;
const failures: string[] = [];
const perf: Record<string, number> = {};

const check = (name: string, condition: boolean, detail?: string) => {
  if (!condition) {
    failures.push(detail ? `${name}: ${detail}` : name);
    console.error(`FAIL ${name}${detail ? ` — ${detail}` : ""}`);
    return;
  }
  passed += 1;
  console.log(`PASS ${name}`);
};

const pageSrc = readFileSync(join(root, "src/app/page.tsx"), "utf8");
const exportSrc = readFileSync(join(root, "src/app/chartExport.ts"), "utf8");
const filterSrc = readFileSync(
  join(root, "src/lib/scientific/report/pdf-section-filter.ts"),
  "utf8"
);
const disclaimerSrc = readFileSync(
  join(root, "src/components/reports/resolve-pdf-export-disclaimer.ts"),
  "utf8"
);
const serializeSrc = readFileSync(
  join(root, "src/lib/project/adapters/sgproj/serialize-v2.ts"),
  "utf8"
);
const curvesConstants = readFileSync(
  join(root, "src/lib/graph/curves/constants.ts"),
  "utf8"
);
const curvesIndex = readFileSync(
  join(root, "src/lib/graph/curves/index.ts"),
  "utf8"
);

// --- Freeze / compat static ---
check(
  "schemaVersion remains 2",
  /schemaVersion:\s*2/.test(serializeSrc)
);
check(
  "GRAPH CURVE_SAMPLE_STEP frozen 0.5",
  /export const CURVE_SAMPLE_STEP = 0\.5/.test(curvesConstants)
);
check(
  "GRAPH barrel does not export CURVE_SAMPLE_STEP",
  !curvesIndex.includes("CURVE_SAMPLE_STEP")
);
check(
  "chartExport.ts has no GRAPH imports",
  !exportSrc.includes("@/lib/graph") && !exportSrc.includes("src/lib/graph")
);
check(
  "captureChartAsPngDataUrl signature present (EXPORT-1 floor)",
  /export (async )?function captureChartAsPngDataUrl|export const captureChartAsPngDataUrl/.test(
    exportSrc
  ) || exportSrc.includes("captureChartAsPngDataUrl")
);
check(
  "PNG options baseline pixelRatio ≥ 2",
  getChartCapturePngOptions().pixelRatio >= 2 &&
    DEFAULT_CHART_EXPORT_PIXEL_RATIO >= 2
);
check(
  "SVG options present",
  getChartCaptureSvgOptions().cacheBust === true
);

// --- EXPORT-2 wiring static ---
check(
  "page imports resolvePdfSectionsForState",
  pageSrc.includes("resolvePdfSectionsForState")
);
check(
  "page imports pdf-section-filter helpers",
  pageSrc.includes("filterScientificReportSectionsForPdf") &&
    pageSrc.includes("shouldIncludePdfExportBlock")
);
check(
  "page passes allowedPdfSectionIds to PDF export",
  pageSrc.includes("allowedPdfSectionIds")
);
check(
  "page keeps PDF shared PNG capture",
  pageSrc.includes('captureChartAsPngDataUrl') &&
    pageSrc.includes('"pdf-export"')
);
check(
  "page keeps PNG/SVG export handlers",
  pageSrc.includes("exportChartPng") && pageSrc.includes("exportChartSvg")
);
check(
  "page error path without scientific report",
  pageSrc.includes("No hay reporte disponible para exportar")
);
check(
  "disclaimer EXPORT-2 toggle-aware copy",
  disclaimerSrc.includes("when-visible") &&
    disclaimerSrc.includes("EXPORT-2") &&
    !disclaimerSrc.includes("puede incluir secciones metodológicas aunque")
);
check(
  "filter module owns title→id rules",
  filterSrc.includes("SCIENTIFIC_REPORT_PDF_SECTION_RULES") &&
    filterSrc.includes("sci-50-consistency")
);

// --- Integration: Visibility → resolve → filter → PDF assembly inputs ---
const sampleSections = [
  { title: "Descripción de datos", content: ["a"] },
  { title: "Consistency Engine", content: ["b"] },
  { title: "Normalidad", content: ["c"] },
  { title: "Effect Size & Power", content: ["d"] },
  { title: "Recomendación final", content: ["e"] },
] as const;

const defaultState: VisibilityState = {};
const tResolve0 = performance.now();
const defaultIds = resolvePdfSectionsForState(defaultState);
perf["resolvePdfSectionsForState.default.ms"] = performance.now() - tResolve0;

const tFilter0 = performance.now();
const filteredDefault = filterScientificReportSectionsForPdf(
  sampleSections,
  defaultIds
);
perf["filterScientificReportSectionsForPdf.default.ms"] =
  performance.now() - tFilter0;

check(
  "S-E2-01 default excludes when-visible methodology",
  filteredDefault.some((s) => s.title === "Descripción de datos") &&
    !filteredDefault.some((s) => s.title === "Consistency Engine") &&
    !filteredDefault.some((s) => s.title === "Normalidad")
);

const hiddenMethodology: VisibilityState = {
  showConsistencyEngine: false,
  showNormality: false,
  showEffectSizePower: false,
  showStatisticalAdvisor: false,
};
const hiddenIds = resolvePdfSectionsForState(hiddenMethodology);
const filteredHidden = filterScientificReportSectionsForPdf(
  sampleSections,
  hiddenIds
);
check(
  "S-E2-02 when-visible sections omitted when toggles off",
  !filteredHidden.some((s) => s.title === "Consistency Engine") &&
    !filteredHidden.some((s) => s.title === "Normalidad") &&
    !filteredHidden.some((s) => s.title === "Effect Size & Power") &&
    !filteredHidden.some((s) => s.title === "Recomendación final") &&
    !shouldIncludePdfExportBlock(PDF_BLOCK_ADVISOR_ID, hiddenIds) &&
    !shouldIncludePdfExportBlock(PDF_BLOCK_COMPARISON_ID, hiddenIds)
);

const visible: VisibilityState = {
  showConsistencyEngine: true,
  showNormality: true,
  showEffectSizePower: true,
  showStatisticalAdvisor: true,
  showMultiDatasetComparison: true,
};
const tResolve1 = performance.now();
const visibleIds = resolvePdfSectionsForState(visible);
perf["resolvePdfSectionsForState.visible.ms"] = performance.now() - tResolve1;
const filteredVisible = filterScientificReportSectionsForPdf(
  sampleSections,
  visibleIds
);
check(
  "integration visible includes policy sections",
  filteredVisible.some((s) => s.title === "Consistency Engine") &&
    filteredVisible.some((s) => s.title === "Normalidad") &&
    filteredVisible.some((s) => s.title === "Effect Size & Power") &&
    filteredVisible.some((s) => s.title === "Recomendación final") &&
    shouldIncludePdfExportBlock(PDF_BLOCK_ADVISOR_ID, visibleIds) &&
    shouldIncludePdfExportBlock(PDF_BLOCK_COMPARISON_ID, visibleIds)
);

const visibleIds2 = resolvePdfSectionsForState(visible);
const filteredVisible2 = filterScientificReportSectionsForPdf(
  sampleSections,
  visibleIds2
);
check(
  "PDF section set deterministic (stable order + membership)",
  visibleIds.join("|") === visibleIds2.join("|") &&
    filteredVisible.map((s) => s.title).join("|") ===
      filteredVisible2.map((s) => s.title).join("|") &&
    filteredVisible.map((s) => s.title).join("|") ===
      "Descripción de datos|Consistency Engine|Normalidad|Effect Size & Power|Recomendación final"
);

check(
  "historical omit allowedPdfSectionIds keeps blocks",
  shouldIncludePdfExportBlock(PDF_BLOCK_ADVISOR_ID, undefined) &&
    shouldIncludePdfExportBlock(PDF_BLOCK_COMPARISON_ID, undefined)
);

// --- S-E2-03 / S-E2-04 / S-E2-05 / S-E2-06 EXPORT-1 floor ---
check(
  "S-E2-03 PDF path still wires captureChartAsPngDataUrl pdf-export",
  pageSrc.includes('captureChartAsPngDataUrl') &&
    pageSrc.includes('"pdf-export"') &&
    pageSrc.includes("handleExportScientificReportPdf")
);
check(
  "S-E2-04 PNG export surface intact",
  pageSrc.includes("exportChartPng") &&
    pageSrc.includes("captureChartAsPngDataUrl")
);
check(
  "S-E2-05 SVG export surface intact",
  pageSrc.includes("exportChartSvg") &&
    pageSrc.includes("captureChartAsSvgDataUrl")
);

const sparse = buildChartExportSeriesPoints(
  [{ idx: 0, expression: "x" }],
  0,
  2,
  0.5,
  (_e, x) => x
);
const dense = buildChartExportSeriesPoints(
  [{ idx: 0, expression: "x" }],
  0,
  2,
  0.25,
  (_e, x) => x
);
check(
  "S-E2-06 sampleStep export-only densifies helper; live step unchanged",
  dense.length > sparse.length &&
    resolveChartExportSampleStep(0.25) === 0.25 &&
    DEFAULT_EXPORT_SAMPLE_STEP === DEFAULT_LIVE_CHART_SAMPLE_STEP &&
    /export const CURVE_SAMPLE_STEP = 0\.5/.test(curvesConstants)
);

check(
  "S-E2-07 error path message present (no report)",
  pageSrc.includes("No hay reporte disponible para exportar") &&
    pageSrc.includes("handleExportScientificReportPdf")
);

check(
  "S-E2-08 scientific report PDF assembly filter + gates wired",
  pageSrc.includes("filterScientificReportSectionsForPdf") &&
    pageSrc.includes("allowedPdfSectionIds") &&
    pageSrc.includes("PDF_BLOCK_COMPARISON_ID") &&
    pageSrc.includes("PDF_BLOCK_ADVISOR_ID") &&
    pageSrc.includes("exportScientificReportPdf")
);

// Controlled null path for shared PNG helper (Node)
async function runPngNullPath(): Promise<void> {
  if (typeof (globalThis as { requestAnimationFrame?: unknown }).requestAnimationFrame !== "function") {
    (globalThis as { requestAnimationFrame: typeof requestAnimationFrame }).requestAnimationFrame =
      (cb: FrameRequestCallback) =>
        setTimeout(() => cb(performance.now()), 0) as unknown as number;
  }
  const fakeNode = {
    tagName: "DIV",
    className: "chart-export-fake",
    offsetWidth: 0,
    offsetHeight: 0,
    closest: () => null,
  } as unknown as HTMLElement;
  const t0 = performance.now();
  const pngNull = await captureChartAsPngDataUrl(fakeNode, "pdf-export", {
    pixelRatio: 2,
  });
  perf["captureChartAsPngDataUrl.zeroSize.ms"] = performance.now() - t0;
  check(
    "S-E2-03 helper pdf-export zero-size returns null (controlled)",
    pngNull === null
  );
}

void runPngNullPath().then(() => {
  console.log("\nPERF", JSON.stringify(perf, null, 2));
  console.log(
    `\nvalidate-export2-d44-3-testing: ${passed} PASS · ${failures.length} FAIL`
  );
  if (failures.length > 0) {
    process.exit(1);
  }
});
