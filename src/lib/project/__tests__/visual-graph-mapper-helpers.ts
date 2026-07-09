import type { ExperimentalSeries } from "@/lib/experimentalData";
import {
  DEFAULT_COLUMN_METADATA,
  seriesToWorksheet,
  type WorksheetColumnRegistry,
} from "@/lib/experimentalWorksheet";
import {
  applyVisualGraphSpecification,
  DEFAULT_VISUAL_GRAPH_SPECIFICATION,
  type GraphSpecification,
  type ProjectVisualGraphEntry,
  type VisualGraphPreview,
  type VisualGraphSpecification,
} from "@/lib/visualGraphBuilder";
import { toPrimaryDatasetId } from "@/lib/project/domain";
import type { ProjectVisualGraphPersistedV2 } from "@/lib/project/domain/types-v2";
import type { VisualGraphHydrateContext } from "@/lib/project/domain/mappers/visual-graph";

export const SAMPLE_VGB_PROJECT_ID = "00000000-0000-4000-8000-00000000c401";
export const SAMPLE_VGB_DATASET_ID = toPrimaryDatasetId(SAMPLE_VGB_PROJECT_ID);

export const SAMPLE_VGB_CONTROL_SERIES: ExperimentalSeries = {
  id: "control1",
  name: "Control1",
  color: "#3b82f6",
  points: [
    { x: 1, y: 10 },
    { x: 2, y: 20 },
    { x: 3, y: 30 },
  ],
};

export const SAMPLE_VGB_TREATMENT_SERIES: ExperimentalSeries = {
  id: "tratamiento1",
  name: "Tratamiento1",
  color: "#ef4444",
  points: [
    { x: 1, y: 30 },
    { x: 2, y: 40 },
    { x: 3, y: 50 },
  ],
};

export const SAMPLE_VGB_GROUP_SERIES: ExperimentalSeries = {
  id: "grupo",
  name: "Grupo",
  color: "#22c55e",
  points: [
    { x: 1, y: 1 },
    { x: 2, y: 2 },
    { x: 3, y: 1 },
  ],
};

export const SAMPLE_VGB_SERIES = [
  SAMPLE_VGB_CONTROL_SERIES,
  SAMPLE_VGB_TREATMENT_SERIES,
  SAMPLE_VGB_GROUP_SERIES,
];

export const SAMPLE_VGB_REGISTRY: WorksheetColumnRegistry = {
  control1: DEFAULT_COLUMN_METADATA,
  tratamiento1: DEFAULT_COLUMN_METADATA,
  grupo: {
    columnType: "category",
    transforms: [],
  },
};

export const SAMPLE_VGB_SCATTER_SPEC_INPUT = {
  ...DEFAULT_VISUAL_GRAPH_SPECIFICATION,
  graphType: "scatter" as const,
  xVariable: "x",
  yVariable: "control1",
};

export const SAMPLE_VGB_LINE_SPEC_INPUT = {
  ...DEFAULT_VISUAL_GRAPH_SPECIFICATION,
  graphType: "line" as const,
  xVariable: "x",
  yVariable: "tratamiento1",
};

export const SAMPLE_VGB_HEATMAP_SPEC_INPUT = {
  ...DEFAULT_VISUAL_GRAPH_SPECIFICATION,
  graphType: "heatmap" as const,
  xVariable: null,
  yVariable: null,
  colorVariable: null,
};

export const SAMPLE_VGB_BUBBLE_SPEC_INPUT = {
  ...DEFAULT_VISUAL_GRAPH_SPECIFICATION,
  graphType: "bubble" as const,
  xVariable: "x",
  yVariable: "control1",
  sizeVariable: "tratamiento1",
  groupVariable: "grupo",
};

const buildGraphSpecFromInput = (
  input: VisualGraphSpecification,
  graphId: string,
  createdAt: string
): GraphSpecification | null => {
  const model = seriesToWorksheet(SAMPLE_VGB_SERIES);
  const applied = applyVisualGraphSpecification(
    input,
    SAMPLE_VGB_SERIES,
    SAMPLE_VGB_REGISTRY
  );

  if (!applied.ok) {
    return null;
  }

  return {
    ...applied.graphSpec,
    id: graphId,
    createdAt,
  };
};

export const buildSampleVisualGraphEntry = (
  options?: {
    graphId?: string;
    createdAt?: string;
    specInput?: VisualGraphSpecification;
  }
): ProjectVisualGraphEntry => {
  const graphId = options?.graphId ?? "vg-spec-scatter-1";
  const createdAt = options?.createdAt ?? "2026-06-29T12:00:00.000Z";
  const specInput = options?.specInput ?? SAMPLE_VGB_SCATTER_SPEC_INPUT;

  const applied = applyVisualGraphSpecification(
    specInput,
    SAMPLE_VGB_SERIES,
    SAMPLE_VGB_REGISTRY
  );

  if (!applied.ok) {
    throw new Error(`Failed to build sample visual graph entry: ${applied.message}`);
  }

  const graphSpec = buildGraphSpecFromInput(specInput, graphId, createdAt);
  if (graphSpec === null) {
    throw new Error("Failed to build sample graph specification.");
  }

  return {
    id: graphId,
    graphSpec,
    preview: applied.preview,
    displaySeries: applied.displaySeries,
    createdAt,
  };
};

export const buildSampleVisualGraphPersisted = (
  options?: {
    graphId?: string;
    createdAt?: string;
    sourceDatasetId?: string;
    specInput?: VisualGraphSpecification;
  }
): ProjectVisualGraphPersistedV2 => {
  const entry = buildSampleVisualGraphEntry(options);

  return {
    id: entry.id,
    graphSpec: entry.graphSpec,
    sourceDatasetId: options?.sourceDatasetId ?? SAMPLE_VGB_DATASET_ID,
    createdAt: entry.createdAt,
  };
};

export const buildVisualGraphHydrateContextFromSeries = (
  series: ExperimentalSeries[] = SAMPLE_VGB_SERIES,
  columnRegistry: WorksheetColumnRegistry = SAMPLE_VGB_REGISTRY
): VisualGraphHydrateContext => ({
  series: series.map((item) => ({
    ...item,
    points: item.points.map((point) => ({ x: point.x, y: point.y })),
  })),
  columnRegistry,
});

export const buildInvalidVisualGraphPersisted = (): ProjectVisualGraphPersistedV2 => ({
  id: "vg-invalid-1",
  sourceDatasetId: SAMPLE_VGB_DATASET_ID,
  createdAt: "2026-06-29T12:00:00.000Z",
  graphSpec: {
    id: "vg-invalid-1",
    createdAt: "2026-06-29T12:00:00.000Z",
    graphType: "scatter",
    xVariable: "x",
    yVariable: "missing-series",
    groupVariable: null,
    color: "#3b82f6",
    marker: "circle",
    lineStyle: "solid",
    markerSize: 4,
    errorBars: "none",
    bins: 12,
    xLabel: "X",
    yLabel: "Missing",
    groupLabel: null,
  },
});

export const PREVIEW_ONLY_EPHEMERAL_KEYS = [
  "scatterPoints",
  "lineSeries",
  "bars",
  "histogramBins",
  "boxPlots",
  "violinPlots",
] as const;

export const hasOnlyPersistedVisualGraphKeys = (
  value: Record<string, unknown>
): boolean => {
  const keys = Object.keys(value).sort();
  return (
    keys.length === 4 &&
    keys[0] === "createdAt" &&
    keys[1] === "graphSpec" &&
    keys[2] === "id" &&
    keys[3] === "sourceDatasetId"
  );
};

export const cloneVisualGraphPreview = (
  preview: VisualGraphPreview
): VisualGraphPreview => JSON.parse(JSON.stringify(preview)) as VisualGraphPreview;
