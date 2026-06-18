/**
 * PROD-2A size audit — estimates ScientificProjectV1 .sgproj byte sizes.
 * Read-only measurement script; not part of product validation gate.
 */
import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const DATASET5 =
  process.env.DATASET5_PATH ??
  "C:/Users/Santiago Salseguero/Desktop/IA CIENTIFICA/Dataset5.csv";
const DATASET6 =
  process.env.DATASET6_PATH ??
  "C:/Users/Santiago Salseguero/Desktop/IA CIENTIFICA/Dataset6.csv";

const RW_CASES = [
  {
    id: "RW-01",
    path:
      process.env.RW01_PATH ??
      "C:/Users/Santiago Salseguero/Desktop/JOSEFINA/JOSEFINA ARCHIVOS ESCRITORIO/Backup Josefina/Documents/Paper Pb/Biocomponente PbZn Up 26 octubre 2021.xlsx",
    sheet: "Pb",
  },
  {
    id: "RW-04",
    path:
      process.env.RW04_PATH ??
      "C:/Users/Santiago Salseguero/Desktop/JOSEFINA/JOSEFINA ARCHIVOS ESCRITORIO/Backup Josefina/Documents/Paper Pb/Copia de resultado cinetica 3 Mp Up.xls",
    sheet: "Up_PH3",
  },
];

// --- minimal parsers (aligned with experimentalData multi-series CSV) ---

const cellToNumber = (cell) => {
  if (typeof cell === "number" && Number.isFinite(cell)) return cell;
  if (typeof cell === "string") {
    const trimmed = cell.trim();
    if (!trimmed) return null;
    const value = Number(trimmed.replace(",", "."));
    return Number.isFinite(value) ? value : null;
  }
  return null;
};

const parseMultiSeriesCsv = (text) => {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return null;

  const headers = lines[0].split(",").map((part) => part.trim());
  if (headers.length < 3) return null;

  const xHeader = headers[0].toLowerCase();
  if (["x", "tiempo", "time"].every((hint) => xHeader !== hint && !xHeader.includes(hint))) {
    // Dataset5/6 use Tiempo/Time — accept any non-numeric first header
  }

  const seriesNames = headers.slice(1);
  const pointsBySeries = seriesNames.map(() => []);

  for (let i = 1; i < lines.length; i += 1) {
    const parts = lines[i].split(",").map((part) => part.trim());
    const x = Number(parts[0]);
    if (!Number.isFinite(x)) continue;
    for (let s = 0; s < seriesNames.length; s += 1) {
      const y = Number(parts[s + 1]);
      if (Number.isFinite(y)) pointsBySeries[s].push({ x, y });
    }
  }

  return seriesNames
    .map((name, index) => ({ name, points: pointsBySeries[index] }))
    .filter((item) => item.points.length > 0);
};

// RW fast-path style: single series from mapped columns (validate-prod1-rw-suite)

const getMatrixBounds = (matrix) => {
  let maxRow = 0;
  let maxCol = 0;
  matrix.forEach((row, rowIndex) => {
    if (!Array.isArray(row)) return;
    row.forEach((cell, colIndex) => {
      if (String(cell ?? "").trim() === "") return;
      maxRow = Math.max(maxRow, rowIndex);
      maxCol = Math.max(maxCol, colIndex);
    });
  });
  return { maxRow, maxCol };
};

const detectTableRegion = (matrix) => {
  const { maxRow, maxCol } = getMatrixBounds(matrix);
  let headerRowIndex = 0;
  for (let rowIndex = 0; rowIndex <= Math.min(maxRow, 30); rowIndex += 1) {
    const row = matrix[rowIndex] ?? [];
    const labels = row.map((cell) => String(cell ?? "").trim()).filter(Boolean);
    if (labels.length >= 2) {
      headerRowIndex = rowIndex;
      break;
    }
  }
  return {
    startRow: headerRowIndex,
    endRow: maxRow,
    startCol: 0,
    endCol: maxCol,
    headerRowIndex,
    metadataRowCount: headerRowIndex,
    confidence: 1,
  };
};

const buildColumnDescriptors = (matrix, region) => {
  const headerRow = matrix[region.headerRowIndex] ?? [];
  const descriptors = [];
  for (let col = region.startCol; col <= region.endCol; col += 1) {
    const label = String(headerRow[col] ?? "").trim() || `Column ${col + 1}`;
    let numeric = 0;
    let total = 0;
    for (let row = region.headerRowIndex + 1; row <= region.endRow; row += 1) {
      const cell = matrix[row]?.[col];
      if (String(cell ?? "").trim() === "") continue;
      total += 1;
      if (cellToNumber(cell) !== null) numeric += 1;
    }
    descriptors.push({
      index: col,
      label,
      sampleValues: [],
      numericRatio: total === 0 ? 0 : numeric / total,
    });
  }
  return descriptors;
};

const suggestAxisMapping = (matrix, region, descriptors) => {
  const numeric = descriptors.filter((d) => d.numericRatio >= 0.5);
  if (numeric.length < 2) return null;
  const sorted = [...numeric].sort((a, b) => a.index - b.index);
  const x = sorted[0];
  const y = sorted[sorted.length - 1];
  return {
    xColumnIndex: x.index,
    yColumnIndex: y.index,
    xLabel: x.label,
    yLabel: y.label,
    rowFilter: "skip-sparse",
  };
};

const buildImportPreview = (matrix, region, mapping) => {
  const points = [];
  for (let row = region.headerRowIndex + 1; row <= region.endRow; row += 1) {
    const x = cellToNumber(matrix[row]?.[mapping.xColumnIndex]);
    const y = cellToNumber(matrix[row]?.[mapping.yColumnIndex]);
    if (x === null || y === null) continue;
    points.push({ x, y, sourceRowIndex: row });
  }
  return { points, skippedRows: [], evaluatedRowCount: region.endRow - region.headerRowIndex };
};

const toExperimentalSeries = (parsedSeries, fileName, prefix = "series") =>
  parsedSeries.map((item, index) => ({
    id: `${prefix}-${index + 1}`,
    name: item.name || fileName,
    points: item.points,
    color: `#${((index + 1) * 111111) % 0xffffff}`.padStart(7, "0"),
  }));

const loadCsvMulti = (path) => {
  const text = fs.readFileSync(path, "utf8");
  const parsed = parseMultiSeriesCsv(text);
  if (!parsed) throw new Error(`Failed to parse CSV multi-series: ${path}`);
  return toExperimentalSeries(parsed, path.split(/[/\\]/).pop(), "csv");
};

const loadRwSingle = (testCase) => {
  const workbook = XLSX.readFile(testCase.path);
  const sheet = workbook.Sheets[testCase.sheet];
  if (!sheet) throw new Error(`Sheet not found: ${testCase.sheet}`);
  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  const region = detectTableRegion(matrix);
  const descriptors = buildColumnDescriptors(matrix, region);
  const mapping = suggestAxisMapping(matrix, region, descriptors);
  if (!mapping) throw new Error(`Mapping not found: ${testCase.id}`);
  const preview = buildImportPreview(matrix, region, mapping);
  const fileName = testCase.path.split(/[/\\]/).pop();
  return {
    series: toExperimentalSeries(
      [{ name: fileName.replace(/\.[^.]+$/, ""), points: preview.points.map(({ x, y }) => ({ x, y })) }],
      fileName,
      testCase.id.toLowerCase()
    ),
    mapping,
    pointCount: preview.points.length,
    matrixCells: matrix.length * (matrix[0]?.length ?? 0),
  };
};

// --- ScientificProjectV1 mock builders ---

const VISIBILITY_KEYS = [
  "showStatistics", "showErrorBars", "showCorrelation", "showOutliers",
  "showHistogram", "showBoxPlot", "showNormality", "showQQPlot", "showViolinPlot",
  "showHeatmap", "showBubblePlot", "showRadarPlot", "showKernelDensity", "showForestPlot",
  "showPCA", "showScatterMatrix", "showParallelCoordinates", "showCorrelationNetwork",
  "showMDS", "showDistanceMatrix", "showSimilarityNetwork", "showVariableImportance",
  "showClusterHeatmap", "showClusteredDistanceHeatmap", "showMultivariateDashboard",
  "showManovaExplorer", "showLdaExplorer", "showCanonicalCorrelationExplorer",
  "showPcrExplorer", "showPlsExplorer", "showBootstrapExplorer", "showSensitivityExplorer",
  "showTsneExplorer", "showUmapExplorer", "showConsistencyEngine", "showReportQualityEngine",
  "showReproducibilityExplorer", "showEvidenceStrengthEngine", "showAssumptionTracker",
  "showPublicationReadinessAnalyzer", "showMethodologicalDashboard", "showPublicationDashboard",
  "showMultiDatasetComparison", "showHierarchicalClustering", "showTTest", "showAnova",
  "showPostHoc", "showNonParametric", "showEffectSizePower", "showStatisticalAdvisor",
  "showScientificReport", "showScientificInterpretation", "showScientificAssistant",
  "showDerivative", "showIntegral", "showIntersections", "showCriticalPoints", "showRoots",
];

const buildAnalysisConfig = (series) => {
  const visibility = Object.fromEntries(VISIBILITY_KEYS.map((key) => [key, key.includes("Dashboard") || key.includes("Statistics") || key.includes("Normality")]));
  return {
    visibility,
    modes: {
      regressionModel: "none",
      errorBarMode: "sd",
      correlationMethod: "pearson",
      outlierMethod: "iqr",
      heatmapMode: "correlation",
      nonParametricMode: "mann-whitney",
      histogramBins: 10,
      axisScaleMode: "linear",
      naturalLanguageEnabled: true,
    },
    selections: {
      tTestSeriesA: series[0]?.id ?? null,
      tTestSeriesB: series[1]?.id ?? null,
      mannWhitneySeriesA: series[0]?.id ?? null,
      mannWhitneySeriesB: series[1]?.id ?? null,
    },
    legend: { hiddenKeys: [] },
  };
};

const buildImportReport = (fileName, series, mapping) => ({
  fileName,
  sheetName: "Sheet1",
  selectedSheet: "Sheet1",
  mode: "fast-path",
  importMode: "fast-path",
  mapping: mapping ?? {
    xColumnIndex: 0,
    yColumnIndex: 1,
    xLabel: "x",
    yLabel: "y",
    rowFilter: "skip-sparse",
  },
  selectedColumns: {
    xIndex: 0,
    yIndex: 1,
    xLabel: "x",
    yLabel: "y",
    xNumericRatio: 1,
    yNumericRatio: 1,
  },
  importedPointCount: series.reduce((sum, s) => sum + s.points.length, 0),
  discardedPointCount: 0,
  skippedRowCount: 0,
  warningCount: 2,
  errorCount: 0,
  unimportedSheetCount: 0,
  coverageRatio: 1,
  warnings: [
    { code: "Q-02", severity: "warning", message: "Q-02: cobertura baja (25%)" },
    { code: "Q-03", severity: "warning", message: "Q-03: más del 30% de filas descartadas" },
  ],
  errors: [],
  stats: {
    importablePointCount: series.reduce((sum, s) => sum + s.points.length, 0),
    skippedRowCount: 0,
    evaluatedRowCount: 100,
    coverageRatio: 0.25,
    xMin: 0,
    xMax: 10,
    yMin: 0,
    yMax: 100,
    duplicatePointCount: 0,
  },
  validation: { ok: true, errors: [], warnings: [] },
});

const buildComparisonProfile = (slotLabel, fileName, series, scores) => ({
  slotLabel,
  datasetInfo: {
    fileName,
    importedAt: "2026-06-17T12:00:00.000Z",
    seriesCount: series.length,
    observationCount: series.reduce((sum, s) => sum + s.points.length, 0),
  },
  capturedAt: "2026-06-17T12:00:00.000Z",
  seriesCount: series.length,
  totalObservations: series.reduce((sum, s) => sum + s.points.length, 0),
  readinessScore: scores.readiness,
  readinessClassification: "Near Ready",
  overallHealthScore: scores.overall,
  evidenceScore: scores.evidence,
  evidenceClassification: "Strong",
  publicationStatus: "Near Ready",
  publicationScore: scores.readiness,
  normality: {
    seriesEvaluated: series.length,
    normalCount: series.length - 1,
    nonNormalCount: 1,
    questionableCount: 0,
    contradictoryCount: 0,
    globalHeadline: "Mayoría normal con excepciones",
    hasWarnings: true,
  },
  inferential: {
    dominantMagnitude: "large",
    metric: "Cohen's d",
    valueDisplay: "-1.36",
    prospectiveSampleSize: 12,
  },
  multivariateHeadline: "PCA explica varianza principal",
  isComplete: true,
});

const buildProject = ({
  name,
  series,
  fileName,
  mapping,
  includeFullOverhead = true,
  comparisonProfiles = null,
}) => {
  const observationCount = series.reduce((sum, s) => sum + s.points.length, 0);
  const project = {
    metadata: {
      id: "00000000-0000-4000-8000-000000000001",
      name,
      description: "Size audit fixture",
      createdAt: "2026-06-17T10:00:00.000Z",
      updatedAt: "2026-06-17T12:00:00.000Z",
      author: "",
    },
    dataset: {
      series,
      info: {
        fileName: fileName ?? "dataset.csv",
        importedAt: "2026-06-17T11:00:00.000Z",
        seriesCount: series.length,
        observationCount,
      },
      checksum: null,
    },
    importProvenance: {
      report: includeFullOverhead ? buildImportReport(fileName ?? "dataset.csv", series, mapping) : null,
      preserveAnalysisOnReimport: true,
    },
    analysisConfig: includeFullOverhead ? buildAnalysisConfig(series) : { visibility: {}, modes: {}, selections: {}, legend: { hiddenKeys: [] } },
    workflow: {
      session: includeFullOverhead
        ? {
            status: "active",
            templateId: "compare-groups",
            currentStepIndex: 2,
            completedStepIds: ["step-1", "step-2"],
            skippedStepIds: [],
            startedAt: "2026-06-17T11:30:00.000Z",
            completedAt: null,
          }
        : {
            status: "idle",
            templateId: null,
            currentStepIndex: 0,
            completedStepIds: [],
            skippedStepIds: [],
            startedAt: null,
            completedAt: null,
          },
    },
    comparison: {
      slots: comparisonProfiles ?? {
        A: { label: "Slot A", profile: null },
        B: { label: "Slot B", profile: null },
      },
    },
    workspace: includeFullOverhead
      ? {
          activeSection: "results",
          inspectorSection: "statistics",
          enabledModules: {
            basic: true,
            mathematics: true,
            statistics: true,
            inference: true,
            assistant: true,
            reports: true,
          },
          controlPanelTab: "data",
        }
      : {
          activeSection: "data",
          inspectorSection: "visualization",
          enabledModules: { basic: true, mathematics: true, statistics: true, inference: true, assistant: true, reports: true },
        },
    graphContext: includeFullOverhead
      ? {
          title: "Audit graph",
          curves: [{ expression: "sin(x)", color: "#3b82f6" }],
          minX: -10,
          maxX: 10,
          visibleMinX: -10,
          visibleMaxX: 10,
          autoScaleY: false,
          useSecondaryYAxis: false,
        }
      : null,
  };

  const file = {
    kind: "scientific-graph-ai.project",
    schemaVersion: 1,
    appVersion: "0.1.0",
    exportedAt: "2026-06-17T12:00:00.000Z",
    project,
  };

  return file;
};

const measure = (file) => {
  const compact = JSON.stringify(file);
  const pretty = JSON.stringify(file, null, 2);
  const series = file.project.dataset.series;
  const points = series.reduce((sum, s) => sum + s.points.length, 0);
  return {
    bytesCompact: Buffer.byteLength(compact, "utf8"),
    bytesPretty: Buffer.byteLength(pretty, "utf8"),
    seriesCount: series.length,
    pointCount: points,
    bytesPerPointPretty: points > 0 ? Math.round(Buffer.byteLength(pretty, "utf8") / points) : 0,
  };
};

const formatKb = (bytes) => `${(bytes / 1024).toFixed(2)} KB`;

// --- load datasets ---

const d5Series = loadCsvMulti(DATASET5);
const d6Series = loadCsvMulti(DATASET6);
const rw01 = loadRwSingle(RW_CASES[0]);
const rw04 = loadRwSingle(RW_CASES[1]);

// 6-dataset stress: merge all series from D5, D6, RW-01..04 (RW-02/03 loaded similarly)
const rw02 = loadRwSingle({
  id: "RW-02",
  path:
    process.env.RW02_PATH ??
    "C:/Users/Santiago Salseguero/Desktop/JOSEFINA/JOSEFINA ARCHIVOS ESCRITORIO/Backup Josefina/Documents/Paper Pb/Pb Ca 1.25.xlsx",
  sheet: "Lang_Up",
});
const rw03 = loadRwSingle({
  id: "RW-03",
  path:
    process.env.RW03_PATH ??
    "C:/Users/Santiago Salseguero/Desktop/JOSEFINA/JOSEFINA ARCHIVOS ESCRITORIO/Backup Josefina/Documents/Paper Pb/Sistema Pb-Ca.xlsx",
  sheet: "resultados_Up",
});

const sixDatasetSeries = [
  ...d5Series.map((s) => ({ ...s, id: `d5-${s.id}`, name: `D5/${s.name}` })),
  ...d6Series.map((s) => ({ ...s, id: `d6-${s.id}`, name: `D6/${s.name}` })),
  ...rw01.series,
  ...rw02.series,
  ...rw03.series,
  ...rw04.series,
];

const d5Profile = buildComparisonProfile("A", "Dataset5.csv", d5Series, { evidence: 82.7, readiness: 77.0, overall: 77.0 });
const d6Profile = buildComparisonProfile("B", "Dataset6.csv", d6Series, { evidence: 73.3, readiness: 67.5, overall: 67.5 });

const scenarios = [
  {
    id: "Dataset5-minimal",
    file: buildProject({ name: "Dataset5 minimal", series: d5Series, fileName: "Dataset5.csv", includeFullOverhead: false }),
  },
  {
    id: "Dataset5-full",
    file: buildProject({
      name: "Dataset5 full",
      series: d5Series,
      fileName: "Dataset5.csv",
      includeFullOverhead: true,
      comparisonProfiles: {
        A: { label: "Slot A", profile: d5Profile },
        B: { label: "Slot B", profile: d6Profile },
      },
    }),
  },
  {
    id: "Dataset6-full",
    file: buildProject({ name: "Dataset6 full", series: d6Series, fileName: "Dataset6.csv", includeFullOverhead: true }),
  },
  {
    id: "RW-01-full",
    file: buildProject({
      name: "RW-01 full",
      series: rw01.series,
      fileName: "Biocomponente PbZn Up 26 octubre 2021.xlsx",
      mapping: rw01.mapping,
      includeFullOverhead: true,
    }),
  },
  {
    id: "RW-04-full",
    file: buildProject({
      name: "RW-04 full",
      series: rw04.series,
      fileName: "Copia de resultado cinetica 3 Mp Up.xls",
      mapping: rw04.mapping,
      includeFullOverhead: true,
    }),
  },
  {
    id: "6-datasets-merged-series",
    file: buildProject({
      name: "6 datasets merged (stress)",
      series: sixDatasetSeries,
      fileName: "merged-6-datasets.csv",
      includeFullOverhead: true,
      comparisonProfiles: {
        A: { label: "Slot A", profile: d5Profile },
        B: { label: "Slot B", profile: d6Profile },
      },
    }),
  },
];

// Extrapolation: what if N points at observed bytes/point?
const ref = measure(buildProject({ name: "ref", series: d5Series, fileName: "Dataset5.csv", includeFullOverhead: true }));
const overheadPretty = ref.bytesPretty - ref.pointCount * ref.bytesPerPointPretty;
const extrapolate = (points) => {
  const pretty = overheadPretty + points * ref.bytesPerPointPretty;
  return { points, bytesPretty: Math.round(pretty) };
};

const report = {
  rawSourceFiles: {
    Dataset5: fs.existsSync(DATASET5) ? fs.statSync(DATASET5).size : null,
    Dataset6: fs.existsSync(DATASET6) ? fs.statSync(DATASET6).size : null,
    "RW-01": fs.existsSync(RW_CASES[0].path) ? fs.statSync(RW_CASES[0].path).size : null,
    "RW-04": fs.existsSync(RW_CASES[1].path) ? fs.statSync(RW_CASES[1].path).size : null,
  },
  importedStats: {
    Dataset5: { series: d5Series.length, points: d5Series.reduce((s, x) => s + x.points.length, 0) },
    Dataset6: { series: d6Series.length, points: d6Series.reduce((s, x) => s + x.points.length, 0) },
    "RW-01": { series: rw01.series.length, points: rw01.pointCount, matrixCells: rw01.matrixCells },
    "RW-04": { series: rw04.series.length, points: rw04.pointCount, matrixCells: rw04.matrixCells },
    "6-merged": {
      series: sixDatasetSeries.length,
      points: sixDatasetSeries.reduce((s, x) => s + x.points.length, 0),
    },
  },
  scenarios: Object.fromEntries(
    scenarios.map((scenario) => [
      scenario.id,
      {
        ...measure(scenario.file),
        pretty: formatKb(measure(scenario.file).bytesPretty),
        compact: formatKb(measure(scenario.file).bytesCompact),
      },
    ])
  ),
  referenceOverhead: {
    fullProjectFixedOverheadPrettyBytes: Math.max(0, overheadPretty),
    bytesPerPointPretty: ref.bytesPerPointPretty,
  },
  extrapolation: {
    "10k_points": formatKb(extrapolate(10000).bytesPretty),
    "100k_points": formatKb(extrapolate(100000).bytesPretty),
    "500k_points": formatKb(extrapolate(500000).bytesPretty),
    "1M_points": formatKb(extrapolate(1000000).bytesPretty),
  },
  threshold10MB: {
    pointsToReach10MB: Math.round((10 * 1024 * 1024 - overheadPretty) / ref.bytesPerPointPretty),
  },
  notes: [
    "V1 persists ONE active dataset (series[]), not raw workbook matrix.",
    "SCI-58 slots store KPI profiles (~1-2 KB each), not full series.",
    "6-datasets stress merges all series into active dataset (upper bound for V1).",
    "Pretty-print JSON (serialize design) used; compact is ~30-40% smaller.",
  ],
};

console.log(JSON.stringify(report, null, 2));
