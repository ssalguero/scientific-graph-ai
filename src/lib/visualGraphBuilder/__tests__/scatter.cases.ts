import fs from "node:fs";
import path from "node:path";

import {
  DEFAULT_COLUMN_METADATA,
  seriesToWorksheet,
} from "@/lib/experimentalWorksheet";
import { hydrateProjectJson, serializeProjectV2 } from "@/lib/project";
import { collectProjectSnapshotV2 } from "@/lib/project/collect-project-snapshot-v2";
import {
  persistedVisualGraphsEquivalent,
  projectVisualGraphEntryToPersistedV2,
  projectVisualGraphPersistedV2ToRuntimeEntry,
} from "@/lib/project/domain/mappers/visual-graph";
import {
  buildVisualGraphHydrateContextFromSeries,
  hasOnlyPersistedVisualGraphKeys,
  PREVIEW_ONLY_EPHEMERAL_KEYS,
  SAMPLE_VGB_BUBBLE_SPEC_INPUT,
  SAMPLE_VGB_DATASET_ID,
  SAMPLE_VGB_LINE_SPEC_INPUT,
  SAMPLE_VGB_REGISTRY,
  SAMPLE_VGB_SCATTER_SPEC_INPUT,
  SAMPLE_VGB_SERIES,
  buildSampleVisualGraphEntry,
  buildSampleVisualGraphPersisted,
} from "@/lib/project/__tests__/visual-graph-mapper-helpers";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

import {
  SCATTER_MARKER_MAX,
  SCATTER_MARKER_MIN,
  applyVisualGraphSpecification,
  buildGraphSpecification,
  buildScatterPointsFromWorksheet,
  buildVisualGraphPreview,
  clampScatterMarkerSize,
  incorporateVisualGraphIntoProject,
  validateVisualGraphConfiguration,
} from "@/lib/visualGraphBuilder";

import {
  buildVisualGraphHydrateCollectContext,
  patchToCollectContextV2WithVisualGraphs,
} from "@/lib/project/__tests__/visual-graph-hydrate-helpers";

const SCATTER_PRO_GOLDEN_FIXTURE = path.join(
  process.cwd(),
  "scripts",
  "fixtures",
  "project-v2-dataset5-with-scatter-pro.sgproj"
);

const scatterSpec = { ...SAMPLE_VGB_SCATTER_SPEC_INPUT };
const scatterGroupSpec = {
  ...SAMPLE_VGB_SCATTER_SPEC_INPUT,
  groupVariable: "grupo" as const,
};
const model = seriesToWorksheet(SAMPLE_VGB_SERIES);

export const runScatterCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  assertCase(
    "scatter.config.valid",
    validateVisualGraphConfiguration(scatterSpec, model, SAMPLE_VGB_REGISTRY).ok ===
      true
  );

  assertCase(
    "scatter.config.missing-x",
    validateVisualGraphConfiguration(
      { ...scatterSpec, xVariable: null },
      model,
      SAMPLE_VGB_REGISTRY
    ).ok === false
  );

  assertCase(
    "scatter.config.missing-y",
    validateVisualGraphConfiguration(
      { ...scatterSpec, yVariable: null },
      model,
      SAMPLE_VGB_REGISTRY
    ).ok === false
  );

  assertCase(
    "scatter.config.invalid-group",
    validateVisualGraphConfiguration(
      { ...scatterSpec, groupVariable: "missing" },
      model,
      SAMPLE_VGB_REGISTRY
    ).ok === false
  );

  const basicPoints = buildScatterPointsFromWorksheet(
    model,
    "x",
    "control1",
    null
  );
  assertCase(
    "scatter.build.points-basic",
    basicPoints.length === 3 &&
      basicPoints.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
  );

  const dirtyModel = seriesToWorksheet([
    SAMPLE_VGB_SERIES[0]!,
    {
      id: "dirty-y",
      name: "DirtyY",
      color: "#222222",
      points: [
        { x: 1, y: 10 },
        { x: 2, y: Number.NaN },
        { x: 3, y: Number.POSITIVE_INFINITY },
      ],
    },
  ]);
  const dirtyRegistry = {
    ...SAMPLE_VGB_REGISTRY,
    "dirty-y": DEFAULT_COLUMN_METADATA,
  };
  const dirtyPoints = buildScatterPointsFromWorksheet(
    dirtyModel,
    "x",
    "dirty-y",
    null
  );
  assertCase(
    "scatter.build.omits-nan",
    dirtyPoints.length === 1 && dirtyPoints[0]?.x === 1
  );

  const groupPoints = buildScatterPointsFromWorksheet(
    model,
    "x",
    "control1",
    "grupo"
  );
  assertCase(
    "scatter.build.group-variable",
    groupPoints.length === 3 &&
      groupPoints.every((point) => typeof point.group === "string")
  );

  const previewA = buildVisualGraphPreview(scatterSpec, model, SAMPLE_VGB_REGISTRY);
  const previewB = buildVisualGraphPreview(scatterSpec, model, SAMPLE_VGB_REGISTRY);
  assertCase(
    "scatter.build.determinism",
    !("error" in previewA) &&
      !("error" in previewB) &&
      JSON.stringify(previewA.scatterPoints) === JSON.stringify(previewB.scatterPoints)
  );

  assertCase(
    "scatter.preview.shape",
    !("error" in previewA) &&
      previewA.scatterPoints.length > 0 &&
      previewA.bubbleData.length === 0 &&
      previewA.heatmapData.length === 0
  );

  const applied = applyVisualGraphSpecification(
    scatterSpec,
    SAMPLE_VGB_SERIES,
    SAMPLE_VGB_REGISTRY
  );
  assertCase(
    "scatter.apply.incorporate",
    applied.ok === true &&
      incorporateVisualGraphIntoProject([], scatterSpec, SAMPLE_VGB_SERIES, SAMPLE_VGB_REGISTRY)
        .ok === true
  );

  const scatterEntry = buildSampleVisualGraphEntry({
    graphId: "vg-scatter-gate",
    specInput: scatterSpec,
  });
  const persisted = projectVisualGraphEntryToPersistedV2(
    scatterEntry,
    SAMPLE_VGB_DATASET_ID
  );
  const serialized = serializeProjectV2({
    project: collectProjectSnapshotV2(
      buildVisualGraphHydrateCollectContext({
        projectVisualGraphEntries: [scatterEntry],
      })
    ),
    appVersion: "0.1.0",
    options: { includeChecksum: false, pretty: true },
  });
  assertCase(
    "scatter.vgbR1.no-leak",
    hasOnlyPersistedVisualGraphKeys(persisted as unknown as Record<string, unknown>) &&
      !("preview" in (persisted as unknown as Record<string, unknown>)) &&
      !("displaySeries" in (persisted as unknown as Record<string, unknown>)) &&
      serialized.ok === true &&
      !serialized.json.includes('"preview"') &&
      !serialized.json.includes('"displaySeries"') &&
      !serialized.json.includes('"scatterPoints"')
  );

  const persistedScatter = buildSampleVisualGraphPersisted({
    graphId: "vg-scatter-hydrate",
    specInput: scatterSpec,
  });
  const rebuilt = projectVisualGraphPersistedV2ToRuntimeEntry(
    persistedScatter,
    buildVisualGraphHydrateContextFromSeries()
  );
  assertCase(
    "scatter.hydrate.rebuild",
    rebuilt !== null &&
      rebuilt.preview.graphType === "scatter" &&
      rebuilt.preview.scatterPoints.length > 0
  );

  const roundTripEntry = buildSampleVisualGraphEntry({
    graphId: "vg-scatter-roundtrip",
    specInput: scatterSpec,
    createdAt: "2026-06-30T10:00:00.000Z",
  });
  const roundTripContext = buildVisualGraphHydrateCollectContext({
    projectVisualGraphEntries: [roundTripEntry],
  });
  const firstCollected = collectProjectSnapshotV2(roundTripContext);
  const firstSerialized = serializeProjectV2({
    project: firstCollected,
    appVersion: "0.1.0",
    exportedAt: "2026-06-30T10:00:00.000Z",
    options: { includeChecksum: false },
  });
  const hydratedRoundTrip = firstSerialized.ok
    ? hydrateProjectJson(firstSerialized.json)
    : { ok: false as const, errors: [] as string[] };
  const secondCollected =
    hydratedRoundTrip.ok === true
      ? collectProjectSnapshotV2(
          patchToCollectContextV2WithVisualGraphs(hydratedRoundTrip.patch)
        )
      : null;
  assertCase(
    "scatter.roundtrip.idempotent",
    firstSerialized.ok === true &&
      hydratedRoundTrip.ok === true &&
      secondCollected !== null &&
      (firstCollected.visualGraphs ?? []).length ===
        (secondCollected.visualGraphs ?? []).length &&
      (firstCollected.visualGraphs ?? []).every((entry, index) =>
        persistedVisualGraphsEquivalent(
          entry,
          (secondCollected.visualGraphs ?? [])[index]!
        )
      )
  );

  const linePreview = buildVisualGraphPreview(
    SAMPLE_VGB_LINE_SPEC_INPUT,
    model,
    SAMPLE_VGB_REGISTRY
  );
  assertCase(
    "scatter.regression.line",
    !("error" in linePreview) && linePreview.lineSeries.length === 1
  );

  const bubblePreview = buildVisualGraphPreview(
    SAMPLE_VGB_BUBBLE_SPEC_INPUT,
    model,
    SAMPLE_VGB_REGISTRY
  );
  assertCase(
    "scatter.regression.bubble",
    !("error" in bubblePreview) && bubblePreview.bubbleData.length > 0
  );

  assertCase(
    "scatter.markerSize.clamp",
    clampScatterMarkerSize(1) === SCATTER_MARKER_MIN &&
      clampScatterMarkerSize(99) === SCATTER_MARKER_MAX &&
      clampScatterMarkerSize(6) === 6
  );

  const groupedApplied = applyVisualGraphSpecification(
    scatterGroupSpec,
    SAMPLE_VGB_SERIES,
    SAMPLE_VGB_REGISTRY
  );
  assertCase(
    "scatter.displaySeries.single-series-with-groups",
    groupedApplied.ok === true &&
      groupedApplied.displaySeries.length === 1 &&
      groupedApplied.preview.scatterPoints.some((point) => point.group != null)
  );

  const scatterToLineSpec = buildGraphSpecification(
    { ...scatterGroupSpec, graphType: "line" },
    model,
    SAMPLE_VGB_REGISTRY
  );
  assertCase(
    "scatter.crossType.scatter-to-line.clears-group",
    !("error" in scatterToLineSpec) && scatterToLineSpec.groupVariable === null
  );

  const scatterToHistogramSpec = buildGraphSpecification(
    { ...scatterGroupSpec, graphType: "histogram", yVariable: "control1" },
    model,
    SAMPLE_VGB_REGISTRY
  );
  assertCase(
    "scatter.crossType.scatter-to-histogram.clears-group",
    !("error" in scatterToHistogramSpec) &&
      scatterToHistogramSpec.groupVariable === null
  );

  const bubbleToScatterSpec = buildGraphSpecification(
    { ...SAMPLE_VGB_BUBBLE_SPEC_INPUT, graphType: "scatter", sizeVariable: null },
    model,
    SAMPLE_VGB_REGISTRY
  );
  assertCase(
    "scatter.crossType.bubble-to-scatter.keeps-group",
    !("error" in bubbleToScatterSpec) &&
      bubbleToScatterSpec.groupVariable === "grupo"
  );

  assertCase(
    "scatter.amend.api-freeze-prerequisite",
    fs.existsSync(path.join(process.cwd(), "PROJECT_DISCOVERY_PROD_3.md")) &&
      fs.readFileSync(
        path.join(process.cwd(), "PROJECT_DISCOVERY_PROD_3.md"),
        "utf8"
      ).includes("Decisión J")
  );

  if (fs.existsSync(SCATTER_PRO_GOLDEN_FIXTURE)) {
    const goldenText = fs.readFileSync(SCATTER_PRO_GOLDEN_FIXTURE, "utf8");
    assertCase(
      "scatter.golden.fixtureLoads",
      hydrateProjectJson(goldenText).ok === true &&
        !goldenText.includes('"scatterPoints"')
    );
  } else {
    assertCase("scatter.golden.fixtureLoads", false);
  }

  return results;
};
