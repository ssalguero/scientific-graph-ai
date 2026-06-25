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
  | "violin";

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
};

export const VISUAL_GRAPH_TYPES_V1: VisualGraphType[] = [
  "scatter",
  "line",
  "bar",
  "histogram",
  "boxPlot",
  "violin",
];

export const VISUAL_GRAPH_TYPE_LABELS: Record<VisualGraphType, string> = {
  scatter: "Scatter",
  line: "Line",
  bar: "Bar",
  histogram: "Histogram",
  boxPlot: "Box Plot",
  violin: "Violin Plot",
};

export const VISUAL_GRAPH_TYPES_FUTURE: Array<{ id: string; label: string }> = [
  { id: "heatmap", label: "Heatmap" },
  { id: "pca", label: "PCA" },
  { id: "clustering", label: "Clustering" },
  { id: "parallel", label: "Parallel Coordinates" },
  { id: "radar", label: "Radar" },
  { id: "bubble", label: "Bubble" },
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
};

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

function readAlignedPairs(
  model: WorksheetModel,
  xVariable: string,
  yVariable: string
): VisualGraphPreviewPoint[] {
  return model.rows.flatMap((row) => {
    const x =
      xVariable === "x" ? row.x : (row.values[xVariable] ?? Number.NaN);
    const y =
      yVariable === "x" ? row.x : (row.values[yVariable] ?? Number.NaN);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return [];
    }
    return [{ x, y }];
  });
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
    case "scatter":
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
    `${VISUAL_GRAPH_TYPE_LABELS[graphType]} · ${resolveLabel(variables, spec.yVariable) || resolveLabel(variables, spec.xVariable)}`;

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
  };

  switch (graphType) {
    case "scatter": {
      const points = readAlignedPairs(model, spec.xVariable!, spec.yVariable!);
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
