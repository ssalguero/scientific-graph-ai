import type { ExperimentalSeries } from "./experimentalData";
import {
  DEFAULT_COLUMN_METADATA,
  seriesToWorksheet,
  type WorksheetColumnRegistry,
  type WorksheetColumnType,
  type WorksheetModel,
} from "./experimentalWorksheet";
import {
  isFormulaDerivedColumnFromMetadata,
  isTransformDerivedColumn,
} from "./worksheetLineage";

export type VisualGraphType =
  | "scatter"
  | "line"
  | "bar"
  | "histogram"
  | "boxPlot"
  | "violin"
  | "heatmap"
  | "bubble"
  | "pca";

export type VisualGraphMarkerStyle = "none" | "circle" | "square" | "diamond";
export type VisualGraphLineStyle = "solid" | "dashed" | "dotted";
export type VisualGraphErrorBars = "none" | "sd" | "sem" | "ci95";

export type VisualGraphSpecification = {
  graphType: VisualGraphType;
  xVariable: string | null;
  yVariable: string | null;
  groupVariable: string | null;
  color: string;
  marker: VisualGraphMarkerStyle;
  lineStyle: VisualGraphLineStyle;
  markerSize: number;
  errorBars: VisualGraphErrorBars;
  bins: number;
  title?: string;
  colorVariable?: string | null;
  sizeVariable?: string | null;
  pcaVariables?: string[];
  pcaStandardize?: boolean;
};

export type GraphSpecification = VisualGraphSpecification & {
  id: string;
  createdAt: string;
  xLabel: string;
  yLabel: string;
  groupLabel: string | null;
};

export type VisualGraphVariableBadge = "fx" | "transform";

export type VisualGraphVariable = {
  seriesId: string;
  label: string;
  kind: "x" | "column";
  columnType: WorksheetColumnType;
  badges: VisualGraphVariableBadge[];
  numericCompatible: boolean;
};

export type VisualGraphPreviewPoint = {
  x: number;
  y: number;
  group?: string;
};

export type VisualGraphPreviewLineSeries = {
  name: string;
  color: string;
  points: Array<{ x: number; y: number }>;
};

export type VisualGraphPreviewBarItem = {
  category: string;
  value: number;
  error?: number;
};

export type VisualGraphPreviewHistogramBin = {
  label: string;
  count: number;
};

export type VisualGraphPreviewBoxPlotItem = {
  group: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
};

export type VisualGraphPreviewViolinItem = {
  group: string;
  values: number[];
};

export type VisualGraphPreviewHeatmapCell = {
  row: string;
  column: string;
  value: number;
};

export type HeatmapMatrixAnalysis = {
  rows: string[];
  columns: string[];
  cells: VisualGraphPreviewHeatmapCell[];
};

export type VisualGraphPreviewBubblePoint = {
  x: number;
  y: number;
  size: number;
  group?: string;
};

export type VisualGraphPreviewPcaPoint = {
  pc1: number;
  pc2: number;
  label: string;
};

export type VisualGraphPreviewPcaMeta = {
  component1Variance: number;
  component2Variance: number;
  cumulativeVariance: number;
};

export type PCAWorksheetAnalysis = {
  pcaData: VisualGraphPreviewPcaPoint[];
  pcaMeta: VisualGraphPreviewPcaMeta;
};

export type VisualGraphPreview = {
  graphType: VisualGraphType;
  title: string;
  xLabel: string;
  yLabel: string;
  scatterPoints: VisualGraphPreviewPoint[];
  lineSeries: VisualGraphPreviewLineSeries[];
  barData: VisualGraphPreviewBarItem[];
  histogramBins: VisualGraphPreviewHistogramBin[];
  boxPlotData: VisualGraphPreviewBoxPlotItem[];
  violinData: VisualGraphPreviewViolinItem[];
  heatmapData: VisualGraphPreviewHeatmapCell[];
  bubbleData: VisualGraphPreviewBubblePoint[];
  pcaData: VisualGraphPreviewPcaPoint[];
  pcaMeta: VisualGraphPreviewPcaMeta | null;
};

export const VISUAL_GRAPH_TYPES_V1: VisualGraphType[] = [
  "scatter",
  "line",
  "bar",
  "histogram",
  "boxPlot",
  "violin",
  "heatmap",
  "bubble",
  "pca",
];

export const VISUAL_GRAPH_TYPE_LABELS: Record<VisualGraphType, string> = {
  scatter: "Scatter",
  line: "Line",
  bar: "Bar",
  histogram: "Histogram",
  boxPlot: "Box Plot",
  violin: "Violin Plot",
  heatmap: "Heatmap",
  bubble: "Bubble",
  pca: "PCA",
};

export const VISUAL_GRAPH_TYPES_FUTURE: Array<{ id: string; label: string }> = [
  { id: "clustering", label: "Clustering" },
  { id: "parallel", label: "Parallel Coordinates" },
  { id: "radar", label: "Radar" },
  { id: "3d", label: "3D" },
];

export type VisualGraphBuilderDraft = Omit<
  VisualGraphSpecification,
  "graphType"
> & {
  graphType: VisualGraphType | null;
};

export const DEFAULT_VISUAL_GRAPH_SPECIFICATION: VisualGraphSpecification = {
  graphType: "scatter",
  xVariable: "x",
  yVariable: null,
  groupVariable: null,
  color: "#3b82f6",
  marker: "circle",
  lineStyle: "solid",
  markerSize: 6,
  errorBars: "none",
  bins: 10,
  colorVariable: null,
  sizeVariable: null,
  pcaVariables: [],
  pcaStandardize: true,
};

/** Estado inicial del Constructor Visual: sin tipo preseleccionado. */
export const INITIAL_VISUAL_GRAPH_BUILDER_DRAFT: VisualGraphBuilderDraft = {
  graphType: null,
  xVariable: "x",
  yVariable: null,
  groupVariable: null,
  color: "#3b82f6",
  marker: "circle",
  lineStyle: "solid",
  markerSize: 6,
  errorBars: "none",
  bins: 10,
  colorVariable: null,
  sizeVariable: null,
  pcaVariables: [],
  pcaStandardize: true,
};

export const BUBBLE_SIZE_MIN = 0.25;
export const BUBBLE_SIZE_MAX = 1.0;
export const BUBBLE_SIZE_FIXED = 1.0;

export const SCATTER_MARKER_MIN = 2;
export const SCATTER_MARKER_MAX = 20;

const GRAPH_TYPES_USING_GROUP_VARIABLE = new Set<VisualGraphType>([
  "bar",
  "boxPlot",
  "violin",
  "bubble",
  "scatter",
]);

export function clampScatterMarkerSize(markerSize: number): number {
  return Math.min(
    SCATTER_MARKER_MAX,
    Math.max(SCATTER_MARKER_MIN, markerSize || 6)
  );
}

function normalizeGroupVariableForGraphType(
  graphType: VisualGraphType,
  groupVariable: string | null
): string | null {
  return GRAPH_TYPES_USING_GROUP_VARIABLE.has(graphType)
    ? groupVariable
    : null;
}

const HEATMAP_CORRELATION_EPSILON = 1e-12;

const NUMERIC_COLUMN_TYPES = new Set<WorksheetColumnType>(["numeric", "date"]);

export function buildVisualGraphVariables(
  model: WorksheetModel,
  registry: WorksheetColumnRegistry = {}
): VisualGraphVariable[] {
  const variables: VisualGraphVariable[] = [
    {
      seriesId: "x",
      label: model.xColumnLabel.trim() || "X",
      kind: "x",
      columnType: "numeric",
      badges: [],
      numericCompatible: true,
    },
  ];

  for (const column of model.columns) {
    const metadata = registry[column.seriesId] ?? DEFAULT_COLUMN_METADATA;
    const badges: VisualGraphVariableBadge[] = [];
    if (isFormulaDerivedColumnFromMetadata(metadata)) {
      badges.push("fx");
    }
    if (isTransformDerivedColumn(metadata)) {
      badges.push("transform");
    }

    variables.push({
      seriesId: column.seriesId,
      label: column.label,
      kind: "column",
      columnType: metadata.columnType,
      badges,
      numericCompatible: NUMERIC_COLUMN_TYPES.has(metadata.columnType),
    });
  }

  return variables;
}

function findVariable(
  variables: VisualGraphVariable[],
  seriesId: string | null
): VisualGraphVariable | null {
  if (!seriesId) return null;
  return variables.find((variable) => variable.seriesId === seriesId) ?? null;
}

function readNumericColumnValues(
  model: WorksheetModel,
  seriesId: string
): number[] {
  if (seriesId === "x") {
    return model.rows
      .map((row) => row.x)
      .filter((value) => Number.isFinite(value));
  }

  return model.rows
    .map((row) => row.values[seriesId] ?? null)
    .filter((value): value is number => value !== null && Number.isFinite(value));
}

function readCellNumeric(
  row: WorksheetModel["rows"][number],
  variable: string
): number {
  if (variable === "x") {
    return row.x;
  }
  return row.values[variable] ?? Number.NaN;
}

function readAlignedPairs(
  model: WorksheetModel,
  xVariable: string,
  yVariable: string
): VisualGraphPreviewPoint[] {
  return buildScatterPointsFromWorksheet(model, xVariable, yVariable, null);
}

export function buildScatterPointsFromWorksheet(
  model: WorksheetModel,
  xVariable: string,
  yVariable: string,
  groupVariable: string | null = null
): VisualGraphPreviewPoint[] {
  const points: VisualGraphPreviewPoint[] = [];

  model.rows.forEach((row, rowIndex) => {
    const x = readCellNumeric(row, xVariable);
    const y = readCellNumeric(row, yVariable);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return;
    }

    const point: VisualGraphPreviewPoint = { x, y };
    if (groupVariable) {
      point.group = readGroupLabel(model, rowIndex, groupVariable);
    }
    points.push(point);
  });

  return points;
}

function normalizeBubbleSizeValue(
  value: number,
  minValue: number,
  maxValue: number
): number {
  if (minValue === maxValue) {
    return BUBBLE_SIZE_FIXED;
  }

  return (
    BUBBLE_SIZE_MIN +
    ((value - minValue) / (maxValue - minValue)) *
      (BUBBLE_SIZE_MAX - BUBBLE_SIZE_MIN)
  );
}

function resolveBubbleSizeRange(
  model: WorksheetModel,
  sizeVariable: string
): { min: number; max: number; hasFiniteValues: boolean } {
  const finiteValues = model.rows
    .map((row) => readCellNumeric(row, sizeVariable))
    .filter((value) => Number.isFinite(value));

  if (finiteValues.length === 0) {
    return { min: 0, max: 0, hasFiniteValues: false };
  }

  return {
    min: Math.min(...finiteValues),
    max: Math.max(...finiteValues),
    hasFiniteValues: true,
  };
}

export function buildBubblePointsFromWorksheet(
  model: WorksheetModel,
  xVariable: string,
  yVariable: string,
  sizeVariable: string | null,
  groupVariable: string | null = null
): VisualGraphPreviewBubblePoint[] {
  const sizeRange = sizeVariable
    ? resolveBubbleSizeRange(model, sizeVariable)
    : null;
  const useFixedSize =
    !sizeVariable ||
    !sizeRange?.hasFiniteValues ||
    sizeRange.min === sizeRange.max;

  const points: VisualGraphPreviewBubblePoint[] = [];

  model.rows.forEach((row, rowIndex) => {
    const x = readCellNumeric(row, xVariable);
    const y = readCellNumeric(row, yVariable);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return;
    }

    let size = BUBBLE_SIZE_FIXED;
    if (!useFixedSize && sizeVariable && sizeRange) {
      const rawSize = readCellNumeric(row, sizeVariable);
      if (!Number.isFinite(rawSize)) {
        return;
      }
      size = normalizeBubbleSizeValue(rawSize, sizeRange.min, sizeRange.max);
    }

    const point: VisualGraphPreviewBubblePoint = { x, y, size };
    if (groupVariable) {
      point.group = readGroupLabel(model, rowIndex, groupVariable);
    }
    points.push(point);
  });

  return points;
}

function readGroupLabel(
  model: WorksheetModel,
  rowIndex: number,
  groupVariable: string | null
): string {
  if (!groupVariable) return "Todos";
  if (groupVariable === "x") {
    const value = model.rows[rowIndex]?.x;
    return Number.isFinite(value) ? String(value) : "—";
  }
  const value = model.rows[rowIndex]?.values[groupVariable];
  return value === null || value === undefined ? "—" : String(value);
}

function getQuantile(sorted: number[], quantile: number): number {
  if (sorted.length === 0) return 0;
  const position = (sorted.length - 1) * quantile;
  const base = Math.floor(position);
  const rest = position - base;
  if (sorted[base + 1] === undefined) {
    return sorted[base] ?? 0;
  }
  return (sorted[base] ?? 0) * (1 - rest) + (sorted[base + 1] ?? 0) * rest;
}

function computeBoxPlot(values: number[]): Omit<VisualGraphPreviewBoxPlotItem, "group"> {
  if (values.length === 0) {
    return { min: 0, q1: 0, median: 0, q3: 0, max: 0 };
  }

  const sorted = [...values].sort((left, right) => left - right);
  return {
    min: sorted[0] ?? 0,
    q1: getQuantile(sorted, 0.25),
    median: getQuantile(sorted, 0.5),
    q3: getQuantile(sorted, 0.75),
    max: sorted[sorted.length - 1] ?? 0,
  };
}

function computeHistogramBins(
  values: number[],
  binCount: number
): VisualGraphPreviewHistogramBin[] {
  if (values.length === 0) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const safeBins = Math.max(1, Math.floor(binCount));
  const range = max - min || 1;
  const width = range / safeBins;
  const counts = Array.from({ length: safeBins }, () => 0);

  for (const value of values) {
    let index = Math.floor((value - min) / width);
    if (index >= safeBins) index = safeBins - 1;
    counts[index] = (counts[index] ?? 0) + 1;
  }

  return counts.map((count, index) => {
    const start = min + index * width;
    const end = index === safeBins - 1 ? max : start + width;
    return {
      label: `${start.toFixed(2)}–${end.toFixed(2)}`,
      count,
    };
  });
}

function computeErrorMargin(values: number[], mode: VisualGraphErrorBars): number {
  if (values.length === 0 || mode === "none") return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.length > 1
      ? values.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
        (values.length - 1)
      : 0;
  const sd = Math.sqrt(variance);
  if (mode === "sd") return sd;
  if (mode === "sem") return sd / Math.sqrt(values.length);
  return (1.96 * sd) / Math.sqrt(values.length);
}

function sanitizeHeatmapValue(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

function readHeatmapColumnValues(
  model: WorksheetModel,
  seriesId: string
): number[] {
  if (seriesId === "x") {
    return model.rows.map((row) => sanitizeHeatmapValue(row.x));
  }

  return model.rows.map((row) =>
    sanitizeHeatmapValue(row.values[seriesId] ?? Number.NaN)
  );
}

function computePearsonCorrelation(left: number[], right: number[]): number {
  const length = Math.min(left.length, right.length);
  if (length === 0) {
    return 0;
  }

  const xs = left.slice(0, length);
  const ys = right.slice(0, length);
  const meanX = xs.reduce((sum, value) => sum + value, 0) / length;
  const meanY = ys.reduce((sum, value) => sum + value, 0) / length;

  let covariance = 0;
  let varianceX = 0;
  let varianceY = 0;

  for (let index = 0; index < length; index += 1) {
    const deltaX = xs[index] - meanX;
    const deltaY = ys[index] - meanY;
    covariance += deltaX * deltaY;
    varianceX += deltaX * deltaX;
    varianceY += deltaY * deltaY;
  }

  if (
    varianceX < HEATMAP_CORRELATION_EPSILON ||
    varianceY < HEATMAP_CORRELATION_EPSILON
  ) {
    return 0;
  }

  const denominator = Math.sqrt(varianceX * varianceY);
  if (Math.abs(denominator) < HEATMAP_CORRELATION_EPSILON) {
    return 0;
  }

  const correlation = covariance / denominator;
  return Math.max(-1, Math.min(1, correlation));
}

function resolveHeatmapColumnIds(
  model: WorksheetModel,
  registry: WorksheetColumnRegistry,
  xVariable: string | null,
  yVariable: string | null
): string[] {
  const variables = buildVisualGraphVariables(model, registry);
  const numericColumnIds = model.columns
    .map((column) => column.seriesId)
    .filter((seriesId) => findVariable(variables, seriesId)?.numericCompatible);

  if (xVariable && yVariable) {
    const startIndex = numericColumnIds.indexOf(xVariable);
    const endIndex = numericColumnIds.indexOf(yVariable);
    if (startIndex === -1 || endIndex === -1) {
      return numericColumnIds;
    }

    const lowerBound = Math.min(startIndex, endIndex);
    const upperBound = Math.max(startIndex, endIndex);
    return numericColumnIds.slice(lowerBound, upperBound + 1);
  }

  return numericColumnIds;
}

export function buildHeatmapMatrixFromWorksheet(
  model: WorksheetModel,
  columnIds: readonly string[],
  registry: WorksheetColumnRegistry = {},
  variables: VisualGraphVariable[] = buildVisualGraphVariables(model, registry)
): HeatmapMatrixAnalysis {
  const rows = columnIds.map(
    (seriesId) => findVariable(variables, seriesId)?.label ?? seriesId
  );
  const columns = [...rows];
  const valueSeries = columnIds.map((seriesId) =>
    readHeatmapColumnValues(model, seriesId)
  );
  const cells: VisualGraphPreviewHeatmapCell[] = [];

  for (let rowIndex = 0; rowIndex < columnIds.length; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < columnIds.length; columnIndex += 1) {
      const value =
        rowIndex === columnIndex
          ? 1
          : computePearsonCorrelation(
              valueSeries[rowIndex],
              valueSeries[columnIndex]
            );

      cells.push({
        row: rows[rowIndex],
        column: columns[columnIndex],
        value,
      });
    }
  }

  return { rows, columns, cells };
}

const PCA_EIGENVALUE_EPSILON = 1e-9;
const PCA_POWER_ITERATION_MAX = 200;

const pcaDotProduct = (left: number[], right: number[]) =>
  left.reduce((sum, value, index) => sum + value * right[index], 0);

const pcaVectorNorm = (values: number[]) =>
  Math.sqrt(pcaDotProduct(values, values));

const pcaNormalizeVector = (values: number[]) => {
  const norm = pcaVectorNorm(values);
  if (norm === 0) return values.map(() => 0);
  return values.map((value) => value / norm);
};

const normalizePCAEigenvectorSign = (eigenvector: number[]): number[] => {
  const firstNonZeroIndex = eigenvector.findIndex(
    (value) => Math.abs(value) > PCA_EIGENVALUE_EPSILON
  );
  if (firstNonZeroIndex === -1) {
    return eigenvector;
  }
  if ((eigenvector[firstNonZeroIndex] ?? 0) < 0) {
    return eigenvector.map((value) => -value);
  }
  return eigenvector;
};

const isDegeneratePCAComponent = (
  eigenvalue: number,
  eigenvector: number[]
) =>
  eigenvalue <= PCA_EIGENVALUE_EPSILON ||
  pcaVectorNorm(eigenvector) <= PCA_EIGENVALUE_EPSILON;

const getPCAVariableStandardDeviations = (matrix: number[][]) => {
  const observationCount = matrix.length;
  const variableCount = matrix[0]?.length ?? 0;
  const standardDeviations = Array.from({ length: variableCount }, () => 0);

  for (let columnIndex = 0; columnIndex < variableCount; columnIndex += 1) {
    const mean =
      matrix.reduce((sum, row) => sum + row[columnIndex], 0) / observationCount;

    if (observationCount <= 1) {
      standardDeviations[columnIndex] = 0;
      continue;
    }

    const variance =
      matrix.reduce(
        (sum, row) => sum + (row[columnIndex] - mean) ** 2,
        0
      ) / (observationCount - 1);
    standardDeviations[columnIndex] = Math.sqrt(variance);
  }

  return standardDeviations;
};

const filterPCADataMatrixByActiveColumns = (
  matrix: number[][],
  activeColumnIndices: number[]
) =>
  matrix.map((row) => activeColumnIndices.map((columnIndex) => row[columnIndex]));

function buildPCADataMatrixFromWorksheet(
  model: WorksheetModel,
  variableIds: readonly string[]
): number[][] | null {
  const matrix: number[][] = [];

  for (const row of model.rows) {
    const values: number[] = [];
    let rowValid = true;

    for (const variableId of variableIds) {
      const value = readCellNumeric(row, variableId);
      if (!Number.isFinite(value)) {
        rowValid = false;
        break;
      }
      values.push(value);
    }

    if (rowValid) {
      matrix.push(values);
    }
  }

  if (matrix.length < 2) {
    return null;
  }

  return matrix;
}

const centerPCADataMatrix = (matrix: number[][]) => {
  const observationCount = matrix.length;
  const variableCount = matrix[0]?.length ?? 0;

  if (observationCount === 0 || variableCount === 0) {
    return matrix;
  }

  const means = Array.from({ length: variableCount }, () => 0);

  for (let columnIndex = 0; columnIndex < variableCount; columnIndex += 1) {
    means[columnIndex] =
      matrix.reduce((sum, row) => sum + row[columnIndex], 0) / observationCount;
  }

  return matrix.map((row) =>
    row.map((value, columnIndex) => value - means[columnIndex])
  );
};

const standardizePCADataMatrix = (matrix: number[][]) => {
  const observationCount = matrix.length;
  const variableCount = matrix[0]?.length ?? 0;

  if (observationCount === 0 || variableCount === 0) {
    return matrix;
  }

  const means = Array.from({ length: variableCount }, () => 0);
  const standardDeviations = Array.from({ length: variableCount }, () => 0);

  for (let columnIndex = 0; columnIndex < variableCount; columnIndex += 1) {
    means[columnIndex] =
      matrix.reduce((sum, row) => sum + row[columnIndex], 0) / observationCount;

    if (observationCount <= 1) {
      standardDeviations[columnIndex] = 0;
      continue;
    }

    const variance =
      matrix.reduce(
        (sum, row) => sum + (row[columnIndex] - means[columnIndex]) ** 2,
        0
      ) / (observationCount - 1);
    standardDeviations[columnIndex] = Math.sqrt(variance);
  }

  return matrix.map((row) =>
    row.map((value, columnIndex) => {
      const standardDeviation = standardDeviations[columnIndex];
      if (standardDeviation === 0) return 0;
      return (value - means[columnIndex]) / standardDeviation;
    })
  );
};

const computePCACovarianceMatrix = (matrix: number[][]) => {
  const observationCount = matrix.length;
  const variableCount = matrix[0]?.length ?? 0;
  const covariance = Array.from({ length: variableCount }, () =>
    Array.from({ length: variableCount }, () => 0)
  );

  if (observationCount <= 1) {
    return covariance;
  }

  for (let rowIndex = 0; rowIndex < variableCount; rowIndex += 1) {
    for (let columnIndex = rowIndex; columnIndex < variableCount; columnIndex += 1) {
      let sum = 0;

      for (
        let observationIndex = 0;
        observationIndex < observationCount;
        observationIndex += 1
      ) {
        sum +=
          matrix[observationIndex][rowIndex] *
          matrix[observationIndex][columnIndex];
      }

      const value = sum / (observationCount - 1);
      covariance[rowIndex][columnIndex] = value;
      covariance[columnIndex][rowIndex] = value;
    }
  }

  return covariance;
};

const multiplySymmetricMatrixVector = (matrix: number[][], vector: number[]) => {
  const size = vector.length;
  const result = Array.from({ length: size }, () => 0);

  for (let rowIndex = 0; rowIndex < size; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < size; columnIndex += 1) {
      result[rowIndex] += matrix[rowIndex][columnIndex] * vector[columnIndex];
    }
  }

  return result;
};

const powerIterationEigen = (
  matrix: number[][],
  orthogonalTo: number[] | null = null,
  iterations = PCA_POWER_ITERATION_MAX
) => {
  const size = matrix.length;
  let vector = pcaNormalizeVector(
    Array.from({ length: size }, (_, index) => (index === 0 ? 1 : 0.1))
  );

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    let nextVector = multiplySymmetricMatrixVector(matrix, vector);

    if (orthogonalTo) {
      const projection = pcaDotProduct(nextVector, orthogonalTo);
      nextVector = nextVector.map(
        (value, index) => value - projection * orthogonalTo[index]
      );
    }

    const normalized = pcaNormalizeVector(nextVector);
    if (normalized.every((value) => value === 0)) break;
    vector = normalized;
  }

  const transformed = multiplySymmetricMatrixVector(matrix, vector);
  const eigenvalue = Math.max(0, pcaDotProduct(vector, transformed));

  if (isDegeneratePCAComponent(eigenvalue, vector)) {
    return {
      eigenvalue: 0,
      eigenvector: Array.from({ length: size }, () => 0),
    };
  }

  return { eigenvalue, eigenvector: vector };
};

const normalizePCAExplainedVariance = (
  eigenvalue1: number,
  eigenvalue2: number,
  totalVariance: number
): VisualGraphPreviewPcaMeta => {
  if (totalVariance <= PCA_EIGENVALUE_EPSILON) {
    return {
      component1Variance: 0,
      component2Variance: 0,
      cumulativeVariance: 0,
    };
  }

  const cappedEigenvalue1 = Math.min(Math.max(0, eigenvalue1), totalVariance);
  const remainingVariance = Math.max(0, totalVariance - cappedEigenvalue1);
  const cappedEigenvalue2 = Math.min(Math.max(0, eigenvalue2), remainingVariance);

  const component1Variance = Math.min(
    100,
    (cappedEigenvalue1 / totalVariance) * 100
  );
  const component2Variance = Math.min(
    Math.max(0, 100 - component1Variance),
    (cappedEigenvalue2 / totalVariance) * 100
  );
  const cumulativeVariance = component1Variance + component2Variance;

  return {
    component1Variance,
    component2Variance,
    cumulativeVariance,
  };
};

const projectOntoPrincipalComponent = (
  matrix: number[][],
  eigenvector: number[]
) => matrix.map((row) => pcaDotProduct(row, eigenvector));

function assessPCAWorksheetAvailability(
  model: WorksheetModel,
  pcaVariables: readonly string[],
  pcaStandardize: boolean
): { ok: true } | { ok: false; message: string } {
  const rawMatrix = buildPCADataMatrixFromWorksheet(model, pcaVariables);
  if (!rawMatrix) {
    return { ok: false, message: "Datos insuficientes para PCA." };
  }

  const standardDeviations = getPCAVariableStandardDeviations(rawMatrix);
  const activeColumnIndices = standardDeviations
    .map((standardDeviation, index) =>
      standardDeviation > PCA_EIGENVALUE_EPSILON ? index : -1
    )
    .filter((index) => index >= 0);

  if (activeColumnIndices.length < 2) {
    return { ok: false, message: "Datos insuficientes para PCA." };
  }

  const activeMatrix = filterPCADataMatrixByActiveColumns(
    rawMatrix,
    activeColumnIndices
  );
  const analysisMatrix = pcaStandardize
    ? standardizePCADataMatrix(activeMatrix)
    : centerPCADataMatrix(activeMatrix);
  const covarianceMatrix = computePCACovarianceMatrix(analysisMatrix);
  const totalVariance = covarianceMatrix.reduce(
    (sum, row, index) => sum + row[index],
    0
  );

  if (totalVariance <= PCA_EIGENVALUE_EPSILON) {
    return { ok: false, message: "Datos insuficientes para PCA." };
  }

  return { ok: true };
}

export function buildPCAFromWorksheet(
  model: WorksheetModel,
  pcaVariables: readonly string[],
  pcaStandardize = true
): PCAWorksheetAnalysis | null {
  const rawMatrix = buildPCADataMatrixFromWorksheet(model, pcaVariables);
  if (!rawMatrix) {
    return null;
  }

  const standardDeviations = getPCAVariableStandardDeviations(rawMatrix);
  const activeColumnIndices = standardDeviations
    .map((standardDeviation, index) =>
      standardDeviation > PCA_EIGENVALUE_EPSILON ? index : -1
    )
    .filter((index) => index >= 0);

  if (activeColumnIndices.length < 2) {
    return null;
  }

  const activeMatrix = filterPCADataMatrixByActiveColumns(
    rawMatrix,
    activeColumnIndices
  );
  const analysisMatrix = pcaStandardize
    ? standardizePCADataMatrix(activeMatrix)
    : centerPCADataMatrix(activeMatrix);
  const covarianceMatrix = computePCACovarianceMatrix(analysisMatrix);
  const totalVariance = covarianceMatrix.reduce(
    (sum, row, index) => sum + row[index],
    0
  );

  if (totalVariance <= PCA_EIGENVALUE_EPSILON) {
    return null;
  }

  const firstComponent = powerIterationEigen(covarianceMatrix);
  const normalizedPc1Eigenvector = normalizePCAEigenvectorSign(
    firstComponent.eigenvector
  );
  let secondComponent = powerIterationEigen(
    covarianceMatrix,
    normalizedPc1Eigenvector
  );

  const remainingVariance = Math.max(
    0,
    totalVariance - firstComponent.eigenvalue
  );

  if (
    isDegeneratePCAComponent(
      secondComponent.eigenvalue,
      secondComponent.eigenvector
    ) ||
    Math.abs(
      pcaDotProduct(normalizedPc1Eigenvector, secondComponent.eigenvector)
    ) > 0.99 ||
    secondComponent.eigenvalue > remainingVariance + PCA_EIGENVALUE_EPSILON
  ) {
    secondComponent = {
      eigenvalue: 0,
      eigenvector: Array.from({ length: activeColumnIndices.length }, () => 0),
    };
  } else {
    secondComponent = {
      eigenvalue: Math.min(secondComponent.eigenvalue, remainingVariance),
      eigenvector: secondComponent.eigenvector,
    };
  }

  const normalizedPc2Eigenvector = normalizePCAEigenvectorSign(
    secondComponent.eigenvector
  );

  const pc1Scores = projectOntoPrincipalComponent(
    analysisMatrix,
    normalizedPc1Eigenvector
  );
  const pc2Scores = isDegeneratePCAComponent(
    secondComponent.eigenvalue,
    normalizedPc2Eigenvector
  )
    ? analysisMatrix.map(() => 0)
    : projectOntoPrincipalComponent(analysisMatrix, normalizedPc2Eigenvector);

  const pcaMeta = normalizePCAExplainedVariance(
    firstComponent.eigenvalue,
    secondComponent.eigenvalue,
    totalVariance
  );

  const pcaData: VisualGraphPreviewPcaPoint[] = pc1Scores.map((pc1, index) => ({
    label: `Obs ${index + 1}`,
    pc1,
    pc2: pc2Scores[index] ?? 0,
  }));

  return { pcaData, pcaMeta };
}

export function validateVisualGraphConfiguration(
  spec: VisualGraphSpecification | VisualGraphBuilderDraft,
  model: WorksheetModel,
  registry: WorksheetColumnRegistry = {}
): { ok: true } | { ok: false; message: string } {
  if (spec.graphType === null) {
    return { ok: false, message: "Seleccione un tipo de gráfico." };
  }

  const variables = buildVisualGraphVariables(model, registry);

  const requireVariable = (
    seriesId: string | null,
    role: "x" | "y" | "group" | "value" | "variable"
  ) => {
    const variable = findVariable(variables, seriesId);
    if (!variable) {
      return {
        ok: false as const,
        message: `Variable "${seriesId ?? ""}" no encontrada.`,
      };
    }
    if (
      (role === "y" || role === "value" || role === "variable") &&
      !variable.numericCompatible
    ) {
      return {
        ok: false as const,
        message: "Variable no compatible con este gráfico.",
      };
    }
    return null;
  };

  switch (spec.graphType) {
    case "scatter": {
      const xError = requireVariable(spec.xVariable, "x");
      if (xError) return xError;
      const yError = requireVariable(spec.yVariable, "y");
      if (yError) return yError;
      if (!spec.xVariable || !spec.yVariable) {
        return { ok: false, message: "Seleccione variables X e Y." };
      }
      if (spec.groupVariable) {
        const group = findVariable(variables, spec.groupVariable);
        if (!group) {
          return {
            ok: false,
            message: `Variable "${spec.groupVariable}" no encontrada.`,
          };
        }
      }
      return { ok: true };
    }
    case "line": {
      const xError = requireVariable(spec.xVariable, "x");
      if (xError) return xError;
      const yError = requireVariable(spec.yVariable, "y");
      if (yError) return yError;
      if (!spec.xVariable || !spec.yVariable) {
        return { ok: false, message: "Seleccione variables X e Y." };
      }
      return { ok: true };
    }
    case "histogram": {
      const variableError = requireVariable(spec.yVariable, "variable");
      if (variableError) return variableError;
      if (!spec.yVariable) {
        return { ok: false, message: "Seleccione una variable numérica." };
      }
      if (spec.bins < 1) {
        return { ok: false, message: "Indique al menos 1 bin." };
      }
      return { ok: true };
    }
    case "bar":
    case "boxPlot":
    case "violin": {
      const valueError = requireVariable(spec.yVariable, "value");
      if (valueError) return valueError;
      if (!spec.yVariable) {
        return { ok: false, message: "Seleccione una variable de valor." };
      }
      if (spec.groupVariable) {
        const group = findVariable(variables, spec.groupVariable);
        if (!group) {
          return {
            ok: false,
            message: `Variable "${spec.groupVariable}" no encontrada.`,
          };
        }
      }
      return { ok: true };
    }
    case "heatmap": {
      const columnIds = resolveHeatmapColumnIds(
        model,
        registry,
        spec.xVariable,
        spec.yVariable
      );
      if (columnIds.length < 2) {
        return {
          ok: false,
          message: "Se requieren al menos 2 columnas numéricas.",
        };
      }

      if (spec.colorVariable) {
        const colorError = requireVariable(spec.colorVariable, "variable");
        if (colorError) return colorError;
      }

      return { ok: true };
    }
    case "bubble": {
      const xError = requireVariable(spec.xVariable, "x");
      if (xError) return xError;
      const yError = requireVariable(spec.yVariable, "y");
      if (yError) return yError;
      if (!spec.xVariable || !spec.yVariable) {
        return { ok: false, message: "Seleccione variables X e Y." };
      }

      if (spec.sizeVariable) {
        const sizeError = requireVariable(spec.sizeVariable, "variable");
        if (sizeError) return sizeError;
      }

      if (spec.groupVariable) {
        const group = findVariable(variables, spec.groupVariable);
        if (!group) {
          return {
            ok: false,
            message: `Variable "${spec.groupVariable}" no encontrada.`,
          };
        }
      }

      return { ok: true };
    }
    case "pca": {
      const pcaVariables = spec.pcaVariables ?? [];
      if (pcaVariables.length < 2) {
        return {
          ok: false,
          message: "Se requieren al menos 2 variables numéricas.",
        };
      }

      for (const variableId of pcaVariables) {
        const variableError = requireVariable(variableId, "variable");
        if (variableError) {
          return variableError;
        }
      }

      const availability = assessPCAWorksheetAvailability(
        model,
        pcaVariables,
        spec.pcaStandardize ?? true
      );
      if (!availability.ok) {
        return availability;
      }

      return { ok: true };
    }
    default:
      return { ok: false, message: "Tipo de gráfico no soportado." };
  }
}

function resolveLabel(
  variables: VisualGraphVariable[],
  seriesId: string | null
): string {
  return findVariable(variables, seriesId)?.label ?? "";
}

export function buildGraphSpecification(
  spec: VisualGraphSpecification | VisualGraphBuilderDraft,
  model: WorksheetModel,
  registry: WorksheetColumnRegistry = {}
): GraphSpecification | { error: string } {
  const validation = validateVisualGraphConfiguration(spec, model, registry);
  if (!validation.ok) {
    return { error: validation.message };
  }

  const graphType = spec.graphType;
  if (graphType === null) {
    return { error: "Seleccione un tipo de gráfico." };
  }

  const variables = buildVisualGraphVariables(model, registry);
  const resolved: VisualGraphSpecification = { ...spec, graphType };
  if (graphType === "heatmap" || spec.colorVariable !== undefined) {
    resolved.colorVariable = spec.colorVariable ?? null;
  }
  if (graphType === "bubble") {
    resolved.sizeVariable = spec.sizeVariable ?? null;
  } else {
    delete resolved.sizeVariable;
  }
  if (graphType === "pca") {
    resolved.pcaVariables = [...(spec.pcaVariables ?? [])];
    resolved.pcaStandardize = spec.pcaStandardize ?? true;
  } else {
    delete resolved.pcaVariables;
    delete resolved.pcaStandardize;
  }
  resolved.groupVariable = normalizeGroupVariableForGraphType(
    graphType,
    resolved.groupVariable ?? null
  );
  if (graphType === "scatter") {
    resolved.markerSize = clampScatterMarkerSize(resolved.markerSize);
  }

  return {
    ...resolved,
    id: `visual-graph-${Date.now()}`,
    createdAt: new Date().toISOString(),
    xLabel: resolveLabel(variables, resolved.xVariable),
    yLabel: resolveLabel(variables, resolved.yVariable),
    groupLabel: resolveLabel(variables, resolved.groupVariable),
  };
}

export function buildVisualGraphPreview(
  spec: VisualGraphSpecification | VisualGraphBuilderDraft,
  model: WorksheetModel,
  registry: WorksheetColumnRegistry = {}
): VisualGraphPreview | { error: string } {
  const validation = validateVisualGraphConfiguration(spec, model, registry);
  if (!validation.ok) {
    return { error: validation.message };
  }

  const graphType = spec.graphType;
  if (graphType === null) {
    return { error: "Seleccione un tipo de gráfico." };
  }

  const variables = buildVisualGraphVariables(model, registry);
  const title =
    spec.title?.trim() ||
    (graphType === "heatmap"
      ? `${VISUAL_GRAPH_TYPE_LABELS[graphType]} · ${resolveHeatmapColumnIds(model, registry, spec.xVariable, spec.yVariable).length} columnas`
      : graphType === "pca"
        ? `${VISUAL_GRAPH_TYPE_LABELS[graphType]} · ${spec.pcaVariables?.length ?? 0} variables`
        : `${VISUAL_GRAPH_TYPE_LABELS[graphType]} · ${resolveLabel(variables, spec.yVariable) || resolveLabel(variables, spec.xVariable)}`);

  const emptyPreview: VisualGraphPreview = {
    graphType,
    title,
    xLabel: resolveLabel(variables, spec.xVariable),
    yLabel: resolveLabel(variables, spec.yVariable),
    scatterPoints: [],
    lineSeries: [],
    barData: [],
    histogramBins: [],
    boxPlotData: [],
    violinData: [],
    heatmapData: [],
    bubbleData: [],
    pcaData: [],
    pcaMeta: null,
  };

  switch (graphType) {
    case "scatter": {
      const points = buildScatterPointsFromWorksheet(
        model,
        spec.xVariable!,
        spec.yVariable!,
        spec.groupVariable
      );
      return { ...emptyPreview, scatterPoints: points };
    }
    case "line": {
      const points = readAlignedPairs(model, spec.xVariable!, spec.yVariable!);
      return {
        ...emptyPreview,
        lineSeries: [
          {
            name: resolveLabel(variables, spec.yVariable),
            color: spec.color,
            points,
          },
        ],
      };
    }
    case "histogram": {
      const values = readNumericColumnValues(model, spec.yVariable!);
      return {
        ...emptyPreview,
        xLabel: "Bins",
        yLabel: "Frecuencia",
        histogramBins: computeHistogramBins(values, spec.bins),
      };
    }
    case "bar": {
      const grouped = new Map<string, number[]>();
      model.rows.forEach((row, rowIndex) => {
        const value = row.values[spec.yVariable!] ?? null;
        if (value === null || !Number.isFinite(value)) return;
        const group = readGroupLabel(model, rowIndex, spec.groupVariable);
        const bucket = grouped.get(group) ?? [];
        bucket.push(value);
        grouped.set(group, bucket);
      });

      const barData = [...grouped.entries()].map(([category, values]) => ({
        category,
        value: values.reduce((sum, item) => sum + item, 0) / values.length,
        error: computeErrorMargin(values, spec.errorBars),
      }));

      return {
        ...emptyPreview,
        xLabel: resolveLabel(variables, spec.groupVariable) || "Categoría",
        yLabel: resolveLabel(variables, spec.yVariable),
        barData,
      };
    }
    case "boxPlot": {
      const grouped = new Map<string, number[]>();
      model.rows.forEach((row, rowIndex) => {
        const value = row.values[spec.yVariable!] ?? null;
        if (value === null || !Number.isFinite(value)) return;
        const group = readGroupLabel(model, rowIndex, spec.groupVariable);
        const bucket = grouped.get(group) ?? [];
        bucket.push(value);
        grouped.set(group, bucket);
      });

      return {
        ...emptyPreview,
        xLabel: resolveLabel(variables, spec.groupVariable) || "Grupo",
        yLabel: resolveLabel(variables, spec.yVariable),
        boxPlotData: [...grouped.entries()].map(([group, values]) => ({
          group,
          ...computeBoxPlot(values),
        })),
      };
    }
    case "violin": {
      const grouped = new Map<string, number[]>();
      model.rows.forEach((row, rowIndex) => {
        const value = row.values[spec.yVariable!] ?? null;
        if (value === null || !Number.isFinite(value)) return;
        const group = readGroupLabel(model, rowIndex, spec.groupVariable);
        const bucket = grouped.get(group) ?? [];
        bucket.push(value);
        grouped.set(group, bucket);
      });

      return {
        ...emptyPreview,
        xLabel: resolveLabel(variables, spec.groupVariable) || "Grupo",
        yLabel: resolveLabel(variables, spec.yVariable),
        violinData: [...grouped.entries()].map(([group, values]) => ({
          group,
          values,
        })),
      };
    }
    case "heatmap": {
      const columnIds = resolveHeatmapColumnIds(
        model,
        registry,
        spec.xVariable,
        spec.yVariable
      );
      const matrix = buildHeatmapMatrixFromWorksheet(
        model,
        columnIds,
        registry,
        variables
      );

      return {
        ...emptyPreview,
        xLabel: "Correlación",
        yLabel: "",
        heatmapData: matrix.cells,
      };
    }
    case "bubble": {
      const bubbleData = buildBubblePointsFromWorksheet(
        model,
        spec.xVariable!,
        spec.yVariable!,
        spec.sizeVariable ?? null,
        spec.groupVariable
      );

      return {
        ...emptyPreview,
        bubbleData,
      };
    }
    case "pca": {
      const analysis = buildPCAFromWorksheet(
        model,
        spec.pcaVariables ?? [],
        spec.pcaStandardize ?? true
      );

      if (!analysis) {
        return { error: "Datos insuficientes para PCA." };
      }

      return {
        ...emptyPreview,
        xLabel: "PC1",
        yLabel: "PC2",
        pcaData: analysis.pcaData,
        pcaMeta: analysis.pcaMeta,
      };
    }
    default:
      return { error: "Tipo de gráfico no soportado." };
  }
}

export function buildVisualGraphSeries(
  graphSpec: GraphSpecification,
  model: WorksheetModel
): ExperimentalSeries[] {
  if (graphSpec.graphType !== "scatter" && graphSpec.graphType !== "line") {
    return [];
  }

  if (!graphSpec.xVariable || !graphSpec.yVariable) {
    return [];
  }

  const points = readAlignedPairs(
    model,
    graphSpec.xVariable,
    graphSpec.yVariable
  ).map((point) => ({ x: point.x, y: point.y }));

  if (points.length === 0) {
    return [];
  }

  return [
    {
      id: graphSpec.id,
      name: graphSpec.title?.trim() || graphSpec.yLabel || "Gráfico visual",
      color: graphSpec.color,
      points,
    },
  ];
}

export function applyVisualGraphSpecification(
  spec: VisualGraphSpecification | VisualGraphBuilderDraft,
  series: ExperimentalSeries[],
  registry: WorksheetColumnRegistry = {}
):
  | {
      ok: true;
      graphSpec: GraphSpecification;
      preview: VisualGraphPreview;
      displaySeries: ExperimentalSeries[];
    }
  | { ok: false; message: string } {
  const model = seriesToWorksheet(series);
  const graphResult = buildGraphSpecification(spec, model, registry);
  if ("error" in graphResult) {
    return { ok: false, message: graphResult.error };
  }

  const previewResult = buildVisualGraphPreview(spec, model, registry);
  if ("error" in previewResult) {
    return { ok: false, message: previewResult.error };
  }

  return {
    ok: true,
    graphSpec: graphResult,
    preview: previewResult,
    displaySeries: buildVisualGraphSeries(graphResult, model),
  };
}

export function hasVisualGraphPreviewChanged(
  previous: VisualGraphPreview | null,
  next: VisualGraphPreview | null
): boolean {
  return JSON.stringify(previous) !== JSON.stringify(next);
}

export type ProjectVisualGraphEntry = {
  id: string;
  graphSpec: GraphSpecification;
  preview: VisualGraphPreview;
  displaySeries: ExperimentalSeries[];
  createdAt: string;
};

export function createProjectVisualGraphEntry(applied: {
  ok: true;
  graphSpec: GraphSpecification;
  preview: VisualGraphPreview;
  displaySeries: ExperimentalSeries[];
}): ProjectVisualGraphEntry {
  return {
    id: applied.graphSpec.id,
    graphSpec: applied.graphSpec,
    preview: applied.preview,
    displaySeries: applied.displaySeries,
    createdAt: applied.graphSpec.createdAt,
  };
}

export function incorporateVisualGraphIntoProject(
  currentGraphs: ProjectVisualGraphEntry[],
  spec: VisualGraphSpecification,
  series: ExperimentalSeries[],
  registry: WorksheetColumnRegistry = {}
):
  | {
      ok: true;
      graphs: ProjectVisualGraphEntry[];
      entry: ProjectVisualGraphEntry;
    }
  | { ok: false; message: string } {
  const applied = applyVisualGraphSpecification(spec, series, registry);
  if (!applied.ok) {
    return { ok: false, message: applied.message };
  }

  const entry = createProjectVisualGraphEntry(applied);
  return {
    ok: true,
    graphs: [...currentGraphs, entry],
    entry,
  };
}

export function suggestDefaultYVariable(
  variables: VisualGraphVariable[]
): string | null {
  const numericColumn = variables.find(
    (variable) => variable.kind === "column" && variable.numericCompatible
  );
  return numericColumn?.seriesId ?? null;
}
