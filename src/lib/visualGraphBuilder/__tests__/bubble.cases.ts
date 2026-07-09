import fs from "node:fs";
import path from "node:path";

import type { ExperimentalSeries } from "@/lib/experimentalData";
import {
  DEFAULT_COLUMN_METADATA,
  seriesToWorksheet,
} from "@/lib/experimentalWorksheet";
import { hydrateProjectJson, serializeProjectV2 } from "@/lib/project";
import { collectProjectSnapshotV2 } from "@/lib/project/collect-project-snapshot-v2";
import { projectVisualGraphEntryToPersistedV2 } from "@/lib/project/domain/mappers/visual-graph";
import {
  buildVisualGraphHydrateContextFromSeries,
  hasOnlyPersistedVisualGraphKeys,
  PREVIEW_ONLY_EPHEMERAL_KEYS,
  SAMPLE_VGB_BUBBLE_SPEC_INPUT,
  SAMPLE_VGB_DATASET_ID,
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
  BUBBLE_SIZE_FIXED,
  BUBBLE_SIZE_MAX,
  BUBBLE_SIZE_MIN,
  applyVisualGraphSpecification,
  buildBubblePointsFromWorksheet,
  buildGraphSpecification,
  buildVisualGraphPreview,
  incorporateVisualGraphIntoProject,
  validateVisualGraphConfiguration,
} from "@/lib/visualGraphBuilder";

import {
  buildVisualGraphHydrateCollectContext,
  patchToCollectContextV2WithVisualGraphs,
} from "@/lib/project/__tests__/visual-graph-hydrate-helpers";

const BUBBLE_GOLDEN_FIXTURE = path.join(
  process.cwd(),
  "scripts",
  "fixtures",
  "project-v2-dataset5-with-bubble.sgproj"
);

const bubbleSpec = { ...SAMPLE_VGB_BUBBLE_SPEC_INPUT };
const bubbleFixedSizeSpec = {
  ...SAMPLE_VGB_BUBBLE_SPEC_INPUT,
  sizeVariable: null,
};
const model = seriesToWorksheet(SAMPLE_VGB_SERIES);

const negativeSizeSeries: ExperimentalSeries = {
  id: "neg-size",
  name: "NegSize",
  color: "#000000",
  points: [
    { x: 1, y: -10 },
    { x: 2, y: 0 },
    { x: 3, y: 10 },
  ],
};

const constantSizeSeries: ExperimentalSeries = {
  id: "const-size",
  name: "ConstSize",
  color: "#111111",
  points: [
    { x: 1, y: 5 },
    { x: 2, y: 5 },
    { x: 3, y: 5 },
  ],
};

const dirtyYSeries: ExperimentalSeries = {
  id: "dirty-y",
  name: "DirtyY",
  color: "#222222",
  points: [
    { x: 1, y: 10 },
    { x: 2, y: Number.NaN },
    { x: 3, y: Number.POSITIVE_INFINITY },
  ],
};

const negativeSizeModel = seriesToWorksheet([
  SAMPLE_VGB_SERIES[0]!,
  negativeSizeSeries,
]);
const negativeSizeRegistry = {
  ...SAMPLE_VGB_REGISTRY,
  "neg-size": DEFAULT_COLUMN_METADATA,
};

const constantSizeModel = seriesToWorksheet([
  SAMPLE_VGB_SERIES[0]!,
  constantSizeSeries,
]);
const constantSizeRegistry = {
  ...SAMPLE_VGB_REGISTRY,
  "const-size": DEFAULT_COLUMN_METADATA,
};

const dirtyModel = seriesToWorksheet([SAMPLE_VGB_SERIES[0]!, dirtyYSeries]);
const dirtyRegistry = {
  ...SAMPLE_VGB_REGISTRY,
  "dirty-y": DEFAULT_COLUMN_METADATA,
};

const readCellNumeric = (
  row: ReturnType<typeof seriesToWorksheet>["rows"][number],
  variable: string
): number => {
  if (variable === "x") {
    return row.x;
  }
  return row.values[variable] ?? Number.NaN;
};

export const runBubbleCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  assertCase(
    "visual-graph.bubble.valid",
    validateVisualGraphConfiguration(bubbleSpec, model, SAMPLE_VGB_REGISTRY).ok ===
      true
  );

  assertCase(
    "visual-graph.bubble.sizeVariable.valid",
    validateVisualGraphConfiguration(
      { ...bubbleSpec, sizeVariable: "tratamiento1" },
      model,
      SAMPLE_VGB_REGISTRY
    ).ok === true
  );

  const invalidSize = validateVisualGraphConfiguration(
    { ...bubbleSpec, sizeVariable: "missing-column" },
    model,
    SAMPLE_VGB_REGISTRY
  );
  assertCase(
    "visual-graph.bubble.sizeVariable.invalid",
    !invalidSize.ok &&
      invalidSize.message.includes('Variable "missing-column" no encontrada')
  );

  const missingX = validateVisualGraphConfiguration(
    { ...bubbleSpec, xVariable: null },
    model,
    SAMPLE_VGB_REGISTRY
  );
  const missingY = validateVisualGraphConfiguration(
    { ...bubbleSpec, yVariable: null },
    model,
    SAMPLE_VGB_REGISTRY
  );
  assertCase(
    "visual-graph.bubble.missing-xy",
    !missingX.ok &&
      !missingY.ok &&
      missingX.message === 'Variable "" no encontrada.' &&
      missingY.message === 'Variable "" no encontrada.'
  );

  const preview = buildVisualGraphPreview(bubbleSpec, model, SAMPLE_VGB_REGISTRY);
  assertCase(
    "visual-graph.bubble.preview.points",
    !("error" in preview) &&
      preview.bubbleData.length === 3 &&
      preview.bubbleData.every(
        (point) => Number.isFinite(point.x) && Number.isFinite(point.y) && Number.isFinite(point.size)
      )
  );

  const fixedPreview = buildVisualGraphPreview(
    bubbleFixedSizeSpec,
    model,
    SAMPLE_VGB_REGISTRY
  );
  assertCase(
    "visual-graph.bubble.preview.fixed-size",
    !("error" in fixedPreview) &&
      fixedPreview.bubbleData.length > 0 &&
      fixedPreview.bubbleData.every(
        (point) => Math.abs(point.size - BUBBLE_SIZE_FIXED) < 1e-12
      )
  );

  const normalizedPreview = buildVisualGraphPreview(
    { ...bubbleSpec, sizeVariable: "tratamiento1" },
    model,
    SAMPLE_VGB_REGISTRY
  );
  assertCase(
    "visual-graph.bubble.preview.normalized-size",
    !("error" in normalizedPreview) &&
      normalizedPreview.bubbleData.length > 0 &&
      normalizedPreview.bubbleData.every(
        (point) => point.size >= BUBBLE_SIZE_MIN - 1e-12 && point.size <= BUBBLE_SIZE_MAX + 1e-12
      ) &&
      normalizedPreview.bubbleData.some(
        (point) => Math.abs(point.size - BUBBLE_SIZE_MIN) < 1e-12
      ) &&
      normalizedPreview.bubbleData.some(
        (point) => Math.abs(point.size - BUBBLE_SIZE_MAX) < 1e-12
      )
  );

  const constantPoints = buildBubblePointsFromWorksheet(
    constantSizeModel,
    "x",
    "control1",
    "const-size",
    null
  );
  assertCase(
    "visual-graph.bubble.algorithm.constant-size-column",
    constantPoints.length === 3 &&
      constantPoints.every((point) => Math.abs(point.size - BUBBLE_SIZE_FIXED) < 1e-12)
  );

  const negativePoints = buildBubblePointsFromWorksheet(
    negativeSizeModel,
    "x",
    "control1",
    "neg-size",
    null
  );
  assertCase(
    "visual-graph.bubble.algorithm.negative-values",
    negativePoints.length === 3 &&
      Math.abs(negativePoints[0]!.size - BUBBLE_SIZE_MIN) < 1e-12 &&
      Math.abs(negativePoints[1]!.size - 0.625) < 1e-12 &&
      Math.abs(negativePoints[2]!.size - BUBBLE_SIZE_MAX) < 1e-12
  );

  const dirtyBubbleSpec = {
    ...bubbleFixedSizeSpec,
    yVariable: "dirty-y" as const,
    sizeVariable: null,
    groupVariable: null,
  };
  const dirtyPreview = buildVisualGraphPreview(
    dirtyBubbleSpec,
    dirtyModel,
    dirtyRegistry
  );
  assertCase(
    "visual-graph.bubble.algorithm.nan-infinity-discard",
    !("error" in dirtyPreview) && dirtyPreview.bubbleData.length === 1
  );

  const previewA = buildVisualGraphPreview(bubbleSpec, model, SAMPLE_VGB_REGISTRY);
  const previewB = buildVisualGraphPreview(bubbleSpec, model, SAMPLE_VGB_REGISTRY);
  assertCase(
    "visual-graph.bubble.determinism",
    !("error" in previewA) &&
      !("error" in previewB) &&
      JSON.stringify(previewA.bubbleData) === JSON.stringify(previewB.bubbleData)
  );

  if (!("error" in preview)) {
    const expectedOrder = model.rows
      .map((row) => ({
        x: readCellNumeric(row, bubbleSpec.xVariable!),
        y: readCellNumeric(row, bubbleSpec.yVariable!),
      }))
      .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));

    assertCase(
      "visual-graph.bubble.points.order",
      preview.bubbleData.length === expectedOrder.length &&
        preview.bubbleData.every(
          (point, index) =>
            Math.abs(point.x - expectedOrder[index]!.x) < 1e-12 &&
            Math.abs(point.y - expectedOrder[index]!.y) < 1e-12
        )
    );
  } else {
    assertCase("visual-graph.bubble.points.order", false);
  }

  const bubbleGoldenHydrated = hydrateProjectJson(
    fs.readFileSync(BUBBLE_GOLDEN_FIXTURE, "utf8")
  );
  const bubbleCollectContext =
    bubbleGoldenHydrated.ok === true
      ? patchToCollectContextV2WithVisualGraphs(bubbleGoldenHydrated.patch)
      : null;
  const firstProject =
    bubbleCollectContext !== null
      ? collectProjectSnapshotV2(bubbleCollectContext)
      : null;
  const firstSerialized =
    firstProject !== null
      ? serializeProjectV2({
          project: firstProject,
          appVersion: "0.1.0",
          exportedAt: "2026-06-30T10:00:00.000Z",
          options: { includeChecksum: false },
        })
      : { ok: false as const, errors: [] as string[] };
  const reloaded =
    firstSerialized.ok === true
      ? hydrateProjectJson(firstSerialized.json)
      : { ok: false as const, errors: [] as string[] };
  const secondProject =
    reloaded.ok === true
      ? collectProjectSnapshotV2(patchToCollectContextV2WithVisualGraphs(reloaded.patch))
      : null;
  const secondSerialized =
    secondProject !== null
      ? serializeProjectV2({
          project: secondProject,
          appVersion: "0.1.0",
          exportedAt: "2026-06-30T10:00:00.000Z",
          options: { includeChecksum: false },
        })
      : { ok: false as const, errors: [] as string[] };

  assertCase(
    "visual-graph.bubble.roundtrip.idempotent",
    bubbleGoldenHydrated.ok === true &&
      firstSerialized.ok === true &&
      reloaded.ok === true &&
      secondSerialized.ok === true &&
      firstSerialized.json === secondSerialized.json
  );

  const scatterWithSize = {
    ...SAMPLE_VGB_SCATTER_SPEC_INPUT,
    sizeVariable: "tratamiento1" as const,
  };
  const scatterBuilt = buildGraphSpecification(
    scatterWithSize,
    model,
    SAMPLE_VGB_REGISTRY
  );
  const scatterPreview = buildVisualGraphPreview(
    scatterWithSize,
    model,
    SAMPLE_VGB_REGISTRY
  );
  assertCase(
    "visual-graph.sizeVariable.ignored-when-not-bubble",
    validateVisualGraphConfiguration(scatterWithSize, model, SAMPLE_VGB_REGISTRY).ok ===
      true &&
      !("error" in scatterBuilt) &&
      !("sizeVariable" in scatterBuilt) &&
      !("error" in scatterPreview) &&
      scatterPreview.graphType === "scatter" &&
      scatterPreview.scatterPoints.length > 0 &&
      scatterPreview.bubbleData.length === 0
  );

  const builtSpec = buildGraphSpecification(bubbleSpec, model, SAMPLE_VGB_REGISTRY);
  assertCase(
    "visual-graph.bubble.spec-built",
    !("error" in builtSpec) &&
      builtSpec.graphType === "bubble" &&
      builtSpec.sizeVariable === "tratamiento1"
  );

  const applied = applyVisualGraphSpecification(
    bubbleSpec,
    SAMPLE_VGB_SERIES,
    SAMPLE_VGB_REGISTRY
  );
  assertCase(
    "visual-graph.bubble.apply",
    applied.ok &&
      applied.preview.graphType === "bubble" &&
      applied.preview.bubbleData.length > 0 &&
      applied.displaySeries.length === 0
  );

  const incorporated = incorporateVisualGraphIntoProject(
    [],
    bubbleSpec,
    SAMPLE_VGB_SERIES,
    SAMPLE_VGB_REGISTRY
  );
  assertCase(
    "visual-graph.bubble.incorporate",
    incorporated.ok &&
      incorporated.graphs.length === 1 &&
      incorporated.entry.graphSpec.graphType === "bubble"
  );

  const bubbleEntry = buildSampleVisualGraphEntry({
    graphId: "vg-bubble-gate",
    specInput: bubbleSpec,
  });
  const persisted = projectVisualGraphEntryToPersistedV2(
    bubbleEntry,
    SAMPLE_VGB_DATASET_ID
  );
  const serialized = serializeProjectV2({
    project: collectProjectSnapshotV2(
      buildVisualGraphHydrateCollectContext({
        projectVisualGraphEntries: [bubbleEntry],
      })
    ),
    appVersion: "0.1.0",
    options: { includeChecksum: false, pretty: true },
  });

  assertCase(
    "visual-graph.bubble.vgbR1.noBubbleDataLeak",
    hasOnlyPersistedVisualGraphKeys(persisted as unknown as Record<string, unknown>) &&
      !("preview" in (persisted as unknown as Record<string, unknown>)) &&
      !("displaySeries" in (persisted as unknown as Record<string, unknown>)) &&
      PREVIEW_ONLY_EPHEMERAL_KEYS.every(
        (key) => !(key in (persisted.graphSpec as unknown as Record<string, unknown>))
      ) &&
      serialized.ok === true &&
      !serialized.json.includes('"preview"') &&
      !serialized.json.includes('"displaySeries"') &&
      !serialized.json.includes('"bubbleData"') &&
      !serialized.json.includes('"heatmapData"')
  );

  const persistedBubble = buildSampleVisualGraphPersisted({
    graphId: "vg-bubble-hydrate",
    specInput: bubbleSpec,
  });
  const rebuilt = projectVisualGraphPersistedV2ToRuntimeEntry(
    persistedBubble,
    buildVisualGraphHydrateContextFromSeries()
  );
  assertCase(
    "visual-graph.bubble.hydrate.rebuildsPreview",
    rebuilt !== null &&
      rebuilt.preview.graphType === "bubble" &&
      rebuilt.preview.bubbleData.length > 0
  );

  assertCase(
    "visual-graph.bubble.scatter-regression",
    validateVisualGraphConfiguration(
      SAMPLE_VGB_SCATTER_SPEC_INPUT,
      model,
      SAMPLE_VGB_REGISTRY
    ).ok === true
  );

  return results;
};
