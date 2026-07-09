import fs from "node:fs";
import path from "node:path";

import {
  applyHydrateProjectV2Patch,
  extractVisualGraphRuntimeState,
} from "@/lib/project/apply-hydrate-project-v2-patch";
import { collectProjectSnapshotV2 } from "@/lib/project/collect-project-snapshot-v2";
import type { EditorProjectApplyContextV2 } from "@/lib/project/editor-hydrate-context-v2";
import { persistedVisualGraphsEquivalent } from "@/lib/project/domain/mappers/visual-graph";
import { serializeProjectV2 } from "@/lib/project/serialize-project-v2";
import { hydrateProjectJson } from "@/lib/project";
import { VISIBILITY_KEYS_V1 } from "@/lib/project/keys";
import type { ProjectVisualGraphEntry } from "@/lib/visualGraphBuilder";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

import { runApplyHydrateProjectV2PatchCaseSuite } from "./apply-hydrate-project-v2-patch.cases";
import { runHydrateV2PipelineCaseSuite } from "./hydrate-v2-pipeline.cases";
import {
  buildInvalidVisualGraphPersisted,
  buildSampleVisualGraphEntry,
  buildSampleVisualGraphPersisted,
  hasOnlyPersistedVisualGraphKeys,
  PREVIEW_ONLY_EPHEMERAL_KEYS,
  SAMPLE_VGB_LINE_SPEC_INPUT,
  SAMPLE_VGB_HEATMAP_SPEC_INPUT,
  SAMPLE_VGB_BUBBLE_SPEC_INPUT,
  SAMPLE_VGB_REGISTRY,
  SAMPLE_VGB_SCATTER_SPEC_INPUT,
  SAMPLE_VGB_SERIES,
} from "./visual-graph-mapper-helpers";
import {
  buildHydratePatchFromProject,
  buildMultiDatasetVisualGraphIds,
  buildVisualGraphHydrateCollectContext,
  buildVisualGraphSessionDataset,
  HYDRATE_VGB_PRIMARY_ID,
  patchToCollectContextV2WithVisualGraphs,
  runVisualGraphHydrateRoundTrip,
} from "./visual-graph-hydrate-helpers";

const FIXTURES_DIR = path.join(process.cwd(), "scripts", "fixtures");

const readFixture = (name: string) =>
  fs.readFileSync(path.join(FIXTURES_DIR, name), "utf8");

const createNoOpApplyContext = (
  onProjectVisualGraphs?: (value: ProjectVisualGraphEntry[]) => void
): EditorProjectApplyContextV2 => ({
  setProjectMetadata: () => undefined,
  setExperimentalSeries: () => undefined,
  setCurrentDatasetInfo: () => undefined,
  setLastImportReport: () => undefined,
  setPreserveAnalysisConfiguration: () => undefined,
  setSessionDatasets: () => undefined,
  setActiveDatasetId: () => undefined,
  setProjectVisualGraphs: onProjectVisualGraphs ?? (() => undefined),
  setTitle: () => undefined,
  setCurves: () => undefined,
  setMinX: () => undefined,
  setMaxX: () => undefined,
  setVisibleMinX: () => undefined,
  setVisibleMaxX: () => undefined,
  setAutoScaleY: () => undefined,
  setUseSecondaryYAxis: () => undefined,
  setRegressionModel: () => undefined,
  setErrorBarMode: () => undefined,
  setCorrelationMethod: () => undefined,
  setOutlierMethod: () => undefined,
  setHeatmapMode: () => undefined,
  setNonParametricMode: () => undefined,
  setHistogramBins: () => undefined,
  setAxisScaleMode: () => undefined,
  setNaturalLanguageEnabled: () => undefined,
  setSelectedTTestSeriesA: () => undefined,
  setSelectedTTestSeriesB: () => undefined,
  setSelectedMannWhitneySeriesA: () => undefined,
  setSelectedMannWhitneySeriesB: () => undefined,
  setHiddenLegendKeys: () => undefined,
  setGuidedWorkflowSession: () => undefined,
  setComparisonSlots: () => undefined,
  setActiveWorkspaceSection: () => undefined,
  setAnalysisInspectorSection: () => undefined,
  setEnabledModules: () => undefined,
  setControlPanelTab: () => undefined,
  visibilitySetters: Object.fromEntries(
    VISIBILITY_KEYS_V1.map((key) => [key, () => undefined])
  ) as EditorProjectApplyContextV2["visibilitySetters"],
  clearEphemeralUiState: () => undefined,
  assignNextCurveIds: () => undefined,
  generateGraph: () => undefined,
});

export const runVisualGraphHydrateCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  const runtimeEntry = buildSampleVisualGraphEntry();
  const collectContext = buildVisualGraphHydrateCollectContext({
    projectVisualGraphEntries: [runtimeEntry],
  });

  const emptyProject = collectProjectSnapshotV2(buildVisualGraphHydrateCollectContext());
  const emptyPatch = buildHydratePatchFromProject(emptyProject);
  assertCase(
    "hydrate.vgb.emptyClearsRuntime",
    extractVisualGraphRuntimeState(emptyPatch).length === 0
  );

  const withGraphRoundTrip = runVisualGraphHydrateRoundTrip(collectContext);
  const hydratedRuntime = extractVisualGraphRuntimeState(withGraphRoundTrip.hydratedPatch);

  assertCase(
    "hydrate.vgb.singleRebuildsPreview",
    hydratedRuntime.length === 1 &&
      hydratedRuntime[0]?.preview !== undefined &&
      Object.keys(hydratedRuntime[0]?.preview ?? {}).length > 0
  );

  assertCase(
    "hydrate.vgb.singleRebuildsDisplaySeries",
    hydratedRuntime.length === 1 &&
      hydratedRuntime[0]?.displaySeries.length === 1 &&
      (hydratedRuntime[0]?.displaySeries[0]?.points.length ?? 0) > 0
  );

  assertCase(
    "hydrate.vgb.specStableAfterRoundTrip",
    hydratedRuntime.length === 1 &&
      JSON.stringify(hydratedRuntime[0]?.graphSpec) === JSON.stringify(runtimeEntry.graphSpec)
  );

  const { datasetBId } = buildMultiDatasetVisualGraphIds();
  const sessionA = buildVisualGraphSessionDataset(HYDRATE_VGB_PRIMARY_ID, "DatasetA.csv");
  const sessionB = buildVisualGraphSessionDataset(datasetBId, "DatasetB.csv");
  const scatterEntry = buildSampleVisualGraphEntry({
    graphId: "vg-hydrate-scatter",
    specInput: SAMPLE_VGB_SCATTER_SPEC_INPUT,
  });
  const lineEntry = buildSampleVisualGraphEntry({
    graphId: "vg-hydrate-line",
    createdAt: "2026-06-29T12:01:00.000Z",
    specInput: SAMPLE_VGB_LINE_SPEC_INPUT,
  });
  const multiDatasetRoundTrip = runVisualGraphHydrateRoundTrip(
    buildVisualGraphHydrateCollectContext({
      sessionDatasets: [sessionA, sessionB],
      activeDatasetId: datasetBId,
      projectVisualGraphEntries: [scatterEntry, lineEntry],
    })
  );
  const multiRuntime = extractVisualGraphRuntimeState(multiDatasetRoundTrip.hydratedPatch);
  assertCase(
    "hydrate.vgb.multiEntryCrossDataset",
    multiRuntime.length === 2 &&
      new Set(multiRuntime.map((entry) => entry.id)).size === 2
  );

  const worksheetRoundTrip = runVisualGraphHydrateRoundTrip(
    buildVisualGraphHydrateCollectContext({
      projectVisualGraphEntries: [runtimeEntry],
      activeColumnRegistry: SAMPLE_VGB_REGISTRY,
      worksheetModified: true,
    })
  );
  assertCase(
    "hydrate.vgb.worksheetRegistryUsed",
    extractVisualGraphRuntimeState(worksheetRoundTrip.hydratedPatch).length === 1 &&
      worksheetRoundTrip.hydratedPatch.project.datasets[0]?.worksheet?.columnRegistry !==
        undefined
  );

  const validPersisted = buildSampleVisualGraphPersisted({
    sourceDatasetId: HYDRATE_VGB_PRIMARY_ID,
  });
  const invalidPersisted = {
    ...buildInvalidVisualGraphPersisted(),
    sourceDatasetId: HYDRATE_VGB_PRIMARY_ID,
  };
  const mixedProject = collectProjectSnapshotV2(buildVisualGraphHydrateCollectContext());
  mixedProject.visualGraphs = [validPersisted, invalidPersisted];
  const mixedPatch = buildHydratePatchFromProject(mixedProject);
  const mixedRuntime = extractVisualGraphRuntimeState(mixedPatch);
  assertCase(
    "hydrate.vgb.rebuildFailureSkipped",
    mixedRuntime.length === 1 && mixedRuntime[0]?.id === validPersisted.id
  );

  const applyCapturedRef: { current: ProjectVisualGraphEntry[] | null } = {
    current: null,
  };
  applyHydrateProjectV2Patch(
    withGraphRoundTrip.hydratedPatch,
    createNoOpApplyContext((value) => {
      applyCapturedRef.current = value;
    })
  );
  const applyCaptured = applyCapturedRef.current;
  assertCase(
    "hydrate.vgb.applySetsRuntime",
    applyCaptured !== null &&
      applyCaptured.length === 1 &&
      applyCaptured[0]?.id === runtimeEntry.id &&
      applyCaptured[0]?.preview !== undefined
  );

  const extractedForApply = extractVisualGraphRuntimeState(withGraphRoundTrip.hydratedPatch);
  assertCase(
    "hydrate.vgb.extractMatchesApply",
    applyCaptured !== null &&
      extractedForApply.length === applyCaptured.length &&
      extractedForApply.every(
        (entry, index) =>
          entry.id === applyCaptured![index]?.id &&
          JSON.stringify(entry.graphSpec) ===
            JSON.stringify(applyCaptured![index]?.graphSpec) &&
          entry.createdAt === applyCaptured![index]?.createdAt &&
          (entry.preview !== undefined || applyCaptured![index]?.preview !== undefined) &&
          entry.displaySeries.length === applyCaptured![index]?.displaySeries.length
      )
  );

  const reCollected = withGraphRoundTrip.secondProject;
  assertCase(
    "hydrate.vgbR1.reCollectNoEphemeralKeys",
    reCollected.visualGraphs !== undefined &&
      reCollected.visualGraphs.every((entry) =>
        hasOnlyPersistedVisualGraphKeys(entry as unknown as Record<string, unknown>)
      )
  );

  const reSerialized = serializeProjectV2({
    project: reCollected,
    appVersion: "0.1.0",
    options: { includeChecksum: false, pretty: true },
  });
  assertCase(
    "hydrate.vgbR1.reCollectNoPreviewLeak",
    reSerialized.ok === true &&
      reCollected.visualGraphs !== undefined &&
      reCollected.visualGraphs.every((entry) =>
        PREVIEW_ONLY_EPHEMERAL_KEYS.every(
          (key) => !(key in (entry.graphSpec as unknown as Record<string, unknown>))
        )
      ) &&
      !reSerialized.json.includes('"preview"') &&
      !reSerialized.json.includes('"displaySeries"') &&
      !reSerialized.json.includes('"heatmapData"')
  );

  const heatmapPersisted = buildSampleVisualGraphPersisted({
    graphId: "vg-heatmap-hydrate",
    sourceDatasetId: HYDRATE_VGB_PRIMARY_ID,
    specInput: SAMPLE_VGB_HEATMAP_SPEC_INPUT,
  });
  const heatmapProject = collectProjectSnapshotV2(buildVisualGraphHydrateCollectContext());
  heatmapProject.visualGraphs = [heatmapPersisted];
  const heatmapPatch = buildHydratePatchFromProject(heatmapProject);
  const heatmapRuntime = extractVisualGraphRuntimeState(heatmapPatch);

  assertCase(
    "hydrate.vgb.heatmap.rebuildsPreview",
    heatmapRuntime.length === 1 &&
      heatmapRuntime[0]?.preview.graphType === "heatmap" &&
      (heatmapRuntime[0]?.preview.heatmapData.length ?? 0) > 0
  );

  const heatmapRoundTrip = runVisualGraphHydrateRoundTrip(
    patchToCollectContextV2WithVisualGraphs(heatmapPatch)
  );
  const heatmapReSerialized = serializeProjectV2({
    project: heatmapRoundTrip.secondProject,
    appVersion: "0.1.0",
    options: { includeChecksum: false, pretty: true },
  });

  assertCase(
    "hydrate.vgbR1.heatmap.noHeatmapDataLeak",
    heatmapReSerialized.ok === true &&
      !heatmapReSerialized.json.includes('"heatmapData"') &&
      !heatmapReSerialized.json.includes('"preview"') &&
      !heatmapReSerialized.json.includes('"displaySeries"')
  );

  const bubblePersisted = buildSampleVisualGraphPersisted({
    graphId: "vg-bubble-hydrate",
    sourceDatasetId: HYDRATE_VGB_PRIMARY_ID,
    specInput: SAMPLE_VGB_BUBBLE_SPEC_INPUT,
  });
  const bubbleProject = collectProjectSnapshotV2(buildVisualGraphHydrateCollectContext());
  bubbleProject.visualGraphs = [bubblePersisted];
  const bubblePatch = buildHydratePatchFromProject(bubbleProject);
  const bubbleRuntime = extractVisualGraphRuntimeState(bubblePatch);

  assertCase(
    "hydrate.vgb.bubble.rebuildsPreview",
    bubbleRuntime.length === 1 &&
      bubbleRuntime[0]?.preview.graphType === "bubble" &&
      (bubbleRuntime[0]?.preview.bubbleData.length ?? 0) > 0
  );

  const bubbleRoundTrip = runVisualGraphHydrateRoundTrip(
    patchToCollectContextV2WithVisualGraphs(bubblePatch)
  );
  const bubbleReSerialized = serializeProjectV2({
    project: bubbleRoundTrip.secondProject,
    appVersion: "0.1.0",
    options: { includeChecksum: false, pretty: true },
  });

  assertCase(
    "hydrate.vgbR1.bubble.noBubbleDataLeak",
    bubbleReSerialized.ok === true &&
      !bubbleReSerialized.json.includes('"bubbleData"') &&
      !bubbleReSerialized.json.includes('"preview"') &&
      !bubbleReSerialized.json.includes('"displaySeries"')
  );

  const firstPersisted = withGraphRoundTrip.firstProject.visualGraphs ?? [];
  const secondPersisted = withGraphRoundTrip.secondProject.visualGraphs ?? [];
  assertCase(
    "hydrate.vgb.pipelineRoundTrip",
    firstPersisted.length === secondPersisted.length &&
      firstPersisted.every((entry, index) =>
        persistedVisualGraphsEquivalent(entry, secondPersisted[index]!)
      )
  );

  const patchBeforeExtract = buildHydratePatchFromProject(
    collectProjectSnapshotV2(collectContext)
  );
  const persistedBefore = JSON.stringify(patchBeforeExtract.project.visualGraphs);
  extractVisualGraphRuntimeState(patchBeforeExtract);
  applyHydrateProjectV2Patch(patchBeforeExtract, createNoOpApplyContext());
  assertCase(
    "hydrate.vgb.immutabilityPatchUntouched",
    JSON.stringify(patchBeforeExtract.project.visualGraphs) === persistedBefore
  );

  const b2Hydrated = hydrateProjectJson(readFixture("project-v2-dataset5-minimal.sgproj"));
  assertCase(
    "hydrate.b2Compat.noVisualGraphs",
    b2Hydrated.ok === true &&
      extractVisualGraphRuntimeState(b2Hydrated.patch).length === 0
  );

  const b2HydrateResults = runApplyHydrateProjectV2PatchCaseSuite();
  assertCase(
    "hydrate.b2Compat.existingHydrateCases",
    b2HydrateResults.every((item) => item.pass)
  );

  const b2WireResults = runHydrateV2PipelineCaseSuite();
  assertCase(
    "hydrate.b2Compat.existingHydrateWireCases",
    b2WireResults.every((item) => item.pass)
  );

  return results;
};
