import fs from "node:fs";
import path from "node:path";

import type { ExperimentalSeries } from "@/lib/experimentalData";
import {
  hydrateProjectJson,
  SCHEMA_VERSION_V2,
  serializeProjectV2,
} from "@/lib/project";
import { collectProjectSnapshotV2 } from "@/lib/project/collect-project-snapshot-v2";
import type { EditorProjectCollectContextV2 } from "@/lib/project/editor-collect-context-v2";
import type { HydrateProjectV2Patch } from "@/lib/project/editor-hydrate-context-v2";
import { applyHydrateProjectV2Patch } from "@/lib/project/apply-hydrate-project-v2-patch";
import { toPrimaryDatasetId, toSequencedDatasetId } from "@/lib/project/domain";
import type { SessionDataset } from "@/lib/sessionDatasetRegistry";
import { GUIDED_WORKFLOW_IDLE_SESSION } from "@/lib/scientific/workflow/catalog";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

const APP_VERSION = "0.1.0";
const FIXTURES_DIR = path.join(process.cwd(), "scripts", "fixtures");

const readFixture = (name: string) =>
  fs.readFileSync(path.join(FIXTURES_DIR, name), "utf8");

const SAMPLE_SERIES_A: ExperimentalSeries[] = [
  {
    id: "s1",
    name: "Series A",
    color: "#3366cc",
    points: [{ x: 1, y: 10 }],
  },
];

const SAMPLE_SERIES_B: ExperimentalSeries[] = [
  {
    id: "s2",
    name: "Series B",
    color: "#dc3912",
    points: [
      { x: 1, y: 5 },
      { x: 2, y: 6 },
    ],
  },
];

const buildSessionDataset = (
  id: string,
  name: string,
  series: ExperimentalSeries[]
): SessionDataset => ({
  id,
  name,
  importedAt: "2026-06-17T12:00:00.000Z",
  seriesCount: series.length,
  observationCount: series.reduce((total, item) => total + item.points.length, 0),
  worksheetModified: false,
  datasetPayload: {
    series,
    importReport: null,
  },
});

type CapturedUiRuntime = {
  sessionDatasets: SessionDataset[] | null;
  activeDatasetId: string | null;
  comparisonSourceA: string | null;
  comparisonSourceB: string | null;
  experimentalSeriesLength: number;
};

const captureApplyFromPatch = (patch: HydrateProjectV2Patch): CapturedUiRuntime => {
  const captured: CapturedUiRuntime = {
    sessionDatasets: null,
    activeDatasetId: null,
    comparisonSourceA: null,
    comparisonSourceB: null,
    experimentalSeriesLength: 0,
  };

  applyHydrateProjectV2Patch(patch, {
    setProjectMetadata: () => undefined,
    setExperimentalSeries: (value) => {
      captured.experimentalSeriesLength = value.length;
    },
    setCurrentDatasetInfo: () => undefined,
    setLastImportReport: () => undefined,
    setPreserveAnalysisConfiguration: () => undefined,
    setSessionDatasets: (value) => {
      captured.sessionDatasets = value;
    },
    setActiveDatasetId: (value) => {
      captured.activeDatasetId = value;
    },
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
    setComparisonSlots: (value) => {
      captured.comparisonSourceA = value.A.sourceDatasetId;
      captured.comparisonSourceB = value.B.sourceDatasetId;
    },
    setActiveWorkspaceSection: () => undefined,
    setAnalysisInspectorSection: () => undefined,
    setEnabledModules: () => undefined,
    setControlPanelTab: () => undefined,
    visibilitySetters: {},
    clearEphemeralUiState: () => undefined,
    assignNextCurveIds: () => undefined,
    generateGraph: () => undefined,
  });

  return captured;
};

const buildMultiCollectContext = (
  projectId: string
): EditorProjectCollectContextV2 => {
  const primaryId = toPrimaryDatasetId(projectId);
  const datasetBId = toSequencedDatasetId(projectId, 2);
  const sessionA = buildSessionDataset(primaryId, "DatasetA.csv", SAMPLE_SERIES_A);
  const sessionB = buildSessionDataset(datasetBId, "DatasetB.csv", SAMPLE_SERIES_B);

  return {
    metadata: {
      id: projectId,
      name: "UI pipeline multi test",
      createdAt: "2026-06-17T10:00:00.000Z",
      updatedAt: "2026-06-17T12:00:00.000Z",
    },
    experimentalSeries: SAMPLE_SERIES_B,
    currentDatasetInfo: {
      fileName: "DatasetB.csv",
      importedAt: "2026-06-17T12:00:00.000Z",
      seriesCount: 1,
      observationCount: 2,
    },
    lastImportReport: null,
    preserveAnalysisConfiguration: true,
    visibility: {},
    modes: {
      regressionModel: "linear",
      errorBarMode: "sd",
      correlationMethod: "pearson",
      outlierMethod: "iqr",
      heatmapMode: "correlation",
      nonParametricMode: "mann-whitney",
      histogramBins: 10,
      axisScaleMode: "linear",
      naturalLanguageEnabled: false,
    },
    selections: {
      tTestSeriesA: "s2",
      tTestSeriesB: null,
      mannWhitneySeriesA: null,
      mannWhitneySeriesB: null,
    },
    hiddenLegendKeys: [],
    guidedWorkflowSession: GUIDED_WORKFLOW_IDLE_SESSION,
    comparisonSlots: {
      A: { label: "Slot A", profile: null, sourceDatasetId: primaryId },
      B: { label: "Slot B", profile: null, sourceDatasetId: datasetBId },
    },
    workspace: {
      activeSection: "data",
      inspectorSection: "visualization",
      enabledModules: {},
      controlPanelTab: "data",
    },
    title: "",
    minX: -10,
    maxX: 10,
    visibleMinX: -10,
    visibleMaxX: 10,
    autoScaleY: false,
    useSecondaryYAxis: false,
    curves: [{ expression: "", color: "#3b82f6" }],
    sessionDatasets: [sessionA, sessionB],
    activeDatasetId: datasetBId,
    worksheetModified: false,
  };
};

/** B2.9 prep: Save/Open round-trip through the UI pipeline primitives. */
export const runUiSaveOpenRoundTrip = (
  collectContext: EditorProjectCollectContextV2
): {
  savedJson: string;
  captured: CapturedUiRuntime;
} => {
  const project = collectProjectSnapshotV2(collectContext);
  const serialized = serializeProjectV2({
    project,
    appVersion: APP_VERSION,
    options: { includeChecksum: false },
  });
  if (!serialized.ok) {
    throw new Error("UI save round-trip failed to serialize.");
  }

  const hydrated = hydrateProjectJson(serialized.json);
  if (!hydrated.ok) {
    throw new Error("UI open round-trip failed to hydrate.");
  }

  return {
    savedJson: serialized.json,
    captured: captureApplyFromPatch(hydrated.patch),
  };
};

export const runUiProjectPipelineV2CaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  const projectId = "00000000-0000-4000-8000-000000000066";
  const primaryId = toPrimaryDatasetId(projectId);
  const datasetBId = toSequencedDatasetId(projectId, 2);

  const multiRoundTrip = runUiSaveOpenRoundTrip(buildMultiCollectContext(projectId));
  assertCase(
    "ui.saveOpen.multi.sessionDatasets",
    multiRoundTrip.captured.sessionDatasets?.length === 2
  );
  assertCase(
    "ui.saveOpen.multi.activeDatasetId",
    multiRoundTrip.captured.activeDatasetId === datasetBId
  );
  assertCase(
    "ui.saveOpen.multi.sourceDatasetIds",
    multiRoundTrip.captured.comparisonSourceA === primaryId &&
      multiRoundTrip.captured.comparisonSourceB === datasetBId
  );
  assertCase(
    "ui.saveOpen.multi.activeSeriesLoaded",
    multiRoundTrip.captured.experimentalSeriesLength === 1
  );

  const parsedSaved = JSON.parse(multiRoundTrip.savedJson);
  assertCase(
    "ui.save.v2Schema",
    parsedSaved.schemaVersion === SCHEMA_VERSION_V2
  );
  assertCase(
    "ui.save.multi.datasetsPersisted",
    parsedSaved.project.datasets.length === 2
  );

  const dataset5V1 = readFixture("project-v1-dataset5-minimal.sgproj");
  const migratedHydrated = hydrateProjectJson(dataset5V1);
  assertCase("ui.open.v1Migrated.ok", migratedHydrated.ok === true);
  if (migratedHydrated.ok) {
    const capturedV1 = captureApplyFromPatch(migratedHydrated.patch);
    assertCase(
      "ui.open.v1Migrated.registry",
      capturedV1.sessionDatasets !== null &&
        capturedV1.sessionDatasets.length >= 1
    );
    assertCase(
      "ui.open.v1Migrated.activeDatasetId",
      typeof capturedV1.activeDatasetId === "string" &&
        capturedV1.activeDatasetId.length > 0
    );
  }

  const dataset5V2 = readFixture("project-v2-dataset5-minimal.sgproj");
  const hydratedV2 = hydrateProjectJson(dataset5V2);
  assertCase("ui.open.v2Fixture.ok", hydratedV2.ok === true);
  if (hydratedV2.ok) {
    const capturedMono = captureApplyFromPatch(hydratedV2.patch);
    assertCase(
      "ui.open.v2Mono.registry",
      capturedMono.sessionDatasets?.length === 1
    );

    const monoSaveOpen = runUiSaveOpenRoundTrip({
      metadata: hydratedV2.patch.project.metadata,
      experimentalSeries: capturedMono.sessionDatasets?.[0]?.datasetPayload.series ?? [],
      currentDatasetInfo: {
        fileName: capturedMono.sessionDatasets?.[0]?.name ?? "Dataset",
        importedAt: capturedMono.sessionDatasets?.[0]?.importedAt ?? "",
        seriesCount: capturedMono.sessionDatasets?.[0]?.seriesCount ?? 0,
        observationCount: capturedMono.sessionDatasets?.[0]?.observationCount ?? 0,
      },
      lastImportReport: null,
      preserveAnalysisConfiguration: false,
      visibility: hydratedV2.patch.project.analysisConfig.visibility,
      modes: hydratedV2.patch.project.analysisConfig.modes,
      selections: hydratedV2.patch.project.analysisConfig.selections,
      hiddenLegendKeys: hydratedV2.patch.project.analysisConfig.legend.hiddenKeys,
      guidedWorkflowSession: hydratedV2.patch.project.workflow.session,
      comparisonSlots: {
        A: {
          label: hydratedV2.patch.project.comparison.slots.A.label,
          profile: hydratedV2.patch.project.comparison.slots.A.profile,
          sourceDatasetId:
            hydratedV2.patch.project.comparison.slots.A.sourceDatasetId,
        },
        B: {
          label: hydratedV2.patch.project.comparison.slots.B.label,
          profile: hydratedV2.patch.project.comparison.slots.B.profile,
          sourceDatasetId:
            hydratedV2.patch.project.comparison.slots.B.sourceDatasetId,
        },
      },
      workspace: hydratedV2.patch.project.workspace,
      title: hydratedV2.patch.project.graphContext?.title ?? "",
      minX: hydratedV2.patch.project.graphContext?.minX ?? -10,
      maxX: hydratedV2.patch.project.graphContext?.maxX ?? 10,
      visibleMinX: hydratedV2.patch.project.graphContext?.visibleMinX ?? -10,
      visibleMaxX: hydratedV2.patch.project.graphContext?.visibleMaxX ?? 10,
      autoScaleY: hydratedV2.patch.project.graphContext?.autoScaleY ?? false,
      useSecondaryYAxis:
        hydratedV2.patch.project.graphContext?.useSecondaryYAxis ?? false,
      curves:
        hydratedV2.patch.project.graphContext?.curves.map((curve) => ({
          expression: curve.expression,
          color: curve.color,
        })) ?? [{ expression: "", color: "#3b82f6" }],
      sessionDatasets: hydratedV2.patch.sessionDatasets,
      activeDatasetId: hydratedV2.patch.activeDatasetId,
      worksheetModified: false,
    });
    assertCase(
      "ui.saveOpen.v2FixtureRoundTrip.registry",
      monoSaveOpen.captured.sessionDatasets?.length === 1
    );
  }

  return results;
};
