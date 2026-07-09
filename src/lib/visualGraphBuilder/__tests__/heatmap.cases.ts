import type { ExperimentalSeries } from "@/lib/experimentalData";
import {
  DEFAULT_COLUMN_METADATA,
  seriesToWorksheet,
} from "@/lib/experimentalWorksheet";
import { serializeProjectV2 } from "@/lib/project";
import { collectProjectSnapshotV2 } from "@/lib/project/collect-project-snapshot-v2";
import { projectVisualGraphEntryToPersistedV2 } from "@/lib/project/domain/mappers/visual-graph";
import {
  buildVisualGraphHydrateContextFromSeries,
  hasOnlyPersistedVisualGraphKeys,
  PREVIEW_ONLY_EPHEMERAL_KEYS,
  SAMPLE_VGB_DATASET_ID,
  SAMPLE_VGB_HEATMAP_SPEC_INPUT,
  SAMPLE_VGB_REGISTRY,
  SAMPLE_VGB_SCATTER_SPEC_INPUT,
  SAMPLE_VGB_SERIES,
  buildSampleVisualGraphEntry,
  buildSampleVisualGraphPersisted,
} from "@/lib/project/__tests__/visual-graph-mapper-helpers";
import { projectVisualGraphPersistedV2ToRuntimeEntry } from "@/lib/project/domain/mappers/visual-graph";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

import {
  applyVisualGraphSpecification,
  buildGraphSpecification,
  buildHeatmapMatrixFromWorksheet,
  buildVisualGraphPreview,
  incorporateVisualGraphIntoProject,
  validateVisualGraphConfiguration,
} from "@/lib/visualGraphBuilder";

import { buildVisualGraphHydrateCollectContext } from "@/lib/project/__tests__/visual-graph-hydrate-helpers";

const heatmapSpec = { ...SAMPLE_VGB_HEATMAP_SPEC_INPUT };
const model = seriesToWorksheet(SAMPLE_VGB_SERIES);
const singleNumericModel = seriesToWorksheet([SAMPLE_VGB_SERIES[0]!]);

const isSymmetric = (cells: { row: string; column: string; value: number }[]) => {
  const lookup = new Map(
    cells.map((cell) => [`${cell.row}|${cell.column}`, cell.value])
  );
  return cells.every((cell) => {
    const pair = lookup.get(`${cell.column}|${cell.row}`);
    return pair !== undefined && Math.abs(pair - cell.value) < 1e-12;
  });
};

export const runHeatmapCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  assertCase(
    "visual-graph.heatmap.valid",
    validateVisualGraphConfiguration(heatmapSpec, model, SAMPLE_VGB_REGISTRY).ok ===
      true
  );

  const insufficient = validateVisualGraphConfiguration(
    heatmapSpec,
    singleNumericModel,
    SAMPLE_VGB_REGISTRY
  );
  assertCase(
    "visual-graph.heatmap.insufficient-columns",
    !insufficient.ok &&
      insufficient.message === "Se requieren al menos 2 columnas numéricas."
  );

  const withColor = validateVisualGraphConfiguration(
    { ...heatmapSpec, colorVariable: "control1" },
    model,
    SAMPLE_VGB_REGISTRY
  );
  assertCase("visual-graph.heatmap.colorVariable.valid", withColor.ok === true);

  const invalidColor = validateVisualGraphConfiguration(
    { ...heatmapSpec, colorVariable: "missing-column" },
    model,
    SAMPLE_VGB_REGISTRY
  );
  assertCase(
    "visual-graph.heatmap.colorVariable.invalid",
    !invalidColor.ok &&
      invalidColor.message.includes('Variable "missing-column" no encontrada')
  );

  const preview = buildVisualGraphPreview(heatmapSpec, model, SAMPLE_VGB_REGISTRY);
  const matrixOk =
    !("error" in preview) &&
    preview.heatmapData.length >= 4 &&
    preview.heatmapData.every(
      (cell) =>
        cell.row === cell.column
          ? Math.abs(cell.value - 1) < 1e-12
          : Number.isFinite(cell.value)
    );
  assertCase("visual-graph.heatmap.preview.matrix", matrixOk);

  const columnIds = model.columns.map((column) => column.seriesId);
  const matrix = buildHeatmapMatrixFromWorksheet(
    model,
    columnIds,
    SAMPLE_VGB_REGISTRY
  );
  assertCase(
    "visual-graph.heatmap.algorithm.symmetry",
    matrix.cells.length > 0 && isSymmetric(matrix.cells)
  );

  const nanSeries: ExperimentalSeries = {
    id: "nan-col",
    name: "NaNCol",
    color: "#000000",
    points: [
      { x: 1, y: Number.NaN },
      { x: 2, y: 10 },
      { x: 3, y: 20 },
    ],
  };
  const nanModel = seriesToWorksheet([SAMPLE_VGB_SERIES[0]!, nanSeries]);
  const nanMatrix = buildHeatmapMatrixFromWorksheet(
    nanModel,
    nanModel.columns.map((column) => column.seriesId),
    {
      ...SAMPLE_VGB_REGISTRY,
      "nan-col": DEFAULT_COLUMN_METADATA,
    }
  );
  assertCase(
    "visual-graph.heatmap.algorithm.nan-to-zero",
    nanMatrix.cells.every((cell) => Number.isFinite(cell.value))
  );

  const previewA = buildVisualGraphPreview(heatmapSpec, model, SAMPLE_VGB_REGISTRY);
  const previewB = buildVisualGraphPreview(heatmapSpec, model, SAMPLE_VGB_REGISTRY);
  assertCase(
    "visual-graph.heatmap.determinism",
    !("error" in previewA) &&
      !("error" in previewB) &&
      JSON.stringify(previewA.heatmapData) === JSON.stringify(previewB.heatmapData)
  );

  const builtSpec = buildGraphSpecification(heatmapSpec, model, SAMPLE_VGB_REGISTRY);
  assertCase(
    "visual-graph.heatmap.spec-built",
    !("error" in builtSpec) &&
      builtSpec.graphType === "heatmap" &&
      builtSpec.colorVariable === null
  );

  const applied = applyVisualGraphSpecification(
    heatmapSpec,
    SAMPLE_VGB_SERIES,
    SAMPLE_VGB_REGISTRY
  );
  assertCase(
    "visual-graph.heatmap.apply",
    applied.ok &&
      applied.preview.graphType === "heatmap" &&
      applied.preview.heatmapData.length > 0 &&
      applied.displaySeries.length === 0
  );

  const incorporated = incorporateVisualGraphIntoProject(
    [],
    heatmapSpec,
    SAMPLE_VGB_SERIES,
    SAMPLE_VGB_REGISTRY
  );
  assertCase(
    "visual-graph.heatmap.incorporate",
    incorporated.ok &&
      incorporated.graphs.length === 1 &&
      incorporated.entry.graphSpec.graphType === "heatmap"
  );

  const heatmapEntry = buildSampleVisualGraphEntry({
    graphId: "vg-heatmap-gate",
    specInput: heatmapSpec,
  });
  const persisted = projectVisualGraphEntryToPersistedV2(
    heatmapEntry,
    SAMPLE_VGB_DATASET_ID
  );
  const serialized = serializeProjectV2({
    project: collectProjectSnapshotV2(
      buildVisualGraphHydrateCollectContext({
        projectVisualGraphEntries: [heatmapEntry],
      })
    ),
    appVersion: "0.1.0",
    options: { includeChecksum: false, pretty: true },
  });

  assertCase(
    "visual-graph.heatmap.vgbR1.noPreviewInPersist",
    hasOnlyPersistedVisualGraphKeys(persisted as unknown as Record<string, unknown>) &&
      !("preview" in (persisted as unknown as Record<string, unknown>)) &&
      !("displaySeries" in (persisted as unknown as Record<string, unknown>)) &&
      PREVIEW_ONLY_EPHEMERAL_KEYS.every(
        (key) => !(key in (persisted.graphSpec as unknown as Record<string, unknown>))
      ) &&
      serialized.ok === true &&
      !serialized.json.includes('"preview"') &&
      !serialized.json.includes('"displaySeries"') &&
      !serialized.json.includes('"heatmapData"')
  );

  const persistedHeatmap = buildSampleVisualGraphPersisted({
    graphId: "vg-heatmap-hydrate",
    specInput: heatmapSpec,
  });
  const rebuilt = projectVisualGraphPersistedV2ToRuntimeEntry(
    persistedHeatmap,
    buildVisualGraphHydrateContextFromSeries()
  );
  assertCase(
    "visual-graph.heatmap.hydrate.rebuilds",
    rebuilt !== null &&
      rebuilt.preview.graphType === "heatmap" &&
      rebuilt.preview.heatmapData.length > 0
  );

  assertCase(
    "visual-graph.heatmap.v1-regression.scatter",
    validateVisualGraphConfiguration(
      SAMPLE_VGB_SCATTER_SPEC_INPUT,
      model,
      SAMPLE_VGB_REGISTRY
    ).ok === true
  );

  return results;
};
