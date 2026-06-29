import fs from "node:fs";
import path from "node:path";

import type { WorksheetColumnRegistry } from "@/lib/experimentalWorksheet";
import { sessionDatasetToProjectDatasetV2 } from "@/lib/project/adapters/sgproj/map-session-dataset";
import {
  applyHydrateProjectV2Patch,
  buildHydrateProjectV2Patch,
  extractActiveWorksheetState,
} from "@/lib/project/apply-hydrate-project-v2-patch";
import { collectProjectSnapshotV2 } from "@/lib/project/collect-project-snapshot-v2";
import { toPrimaryDatasetId, toSequencedDatasetId } from "@/lib/project/domain";
import type { ScientificProjectV2 } from "@/lib/project/domain/types-v2";
import { hydrateProjectJson, serializeProjectV2 } from "@/lib/project";
import type { SessionDataset } from "@/lib/sessionDatasetRegistry";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

import {
  buildMultiCollectContext,
  normalizeProjectForRoundTrip,
  runSaveLoadSaveRoundTrip,
} from "./b2-9-invariants.cases";
import {
  buildWorksheetCollectContext,
  buildWorksheetSessionDataset,
  normalizeWorksheetForCompare,
  patchToCollectContextV2WithWorksheet,
  runWorksheetPipelineRoundTrip,
  SAMPLE_WORKSHEET_AUXILIARY,
  SAMPLE_WORKSHEET_REGISTRY_A,
  SAMPLE_WORKSHEET_REGISTRY_B,
  SAMPLE_WORKSHEET_SERIES_A,
  SAMPLE_WORKSHEET_SERIES_B,
  worksheetsEquivalent,
} from "./worksheet-pipeline-helpers";

const APP_VERSION = "0.1.0";
const FIXTURES_DIR = path.join(process.cwd(), "scripts", "fixtures");

const readFixture = (name: string) =>
  fs.readFileSync(path.join(FIXTURES_DIR, name), "utf8");

const findDatasetWorksheet = (
  project: ScientificProjectV2,
  datasetId: string
) => project.datasets.find((dataset) => dataset.id === datasetId)?.worksheet;

export const runWorksheetPipelineCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  const projectId = "00000000-0000-4000-8000-00000000c201";
  const primaryId = toPrimaryDatasetId(projectId);
  const datasetBId = toSequencedDatasetId(projectId, 2);

  const monoContext = buildWorksheetCollectContext(projectId, primaryId, datasetBId, {
    sessionDatasets: [
      buildWorksheetSessionDataset(
        primaryId,
        "DatasetA.csv",
        SAMPLE_WORKSHEET_SERIES_A,
        {
          columnRegistry: SAMPLE_WORKSHEET_REGISTRY_A,
          auxiliaryColumns: SAMPLE_WORKSHEET_AUXILIARY,
        }
      ),
    ],
    activeDatasetId: primaryId,
    experimentalSeries: SAMPLE_WORKSHEET_SERIES_A,
    activeColumnRegistry: SAMPLE_WORKSHEET_REGISTRY_A,
    activeAuxiliaryColumns: SAMPLE_WORKSHEET_AUXILIARY,
    comparisonSlots: {
      A: { label: "Slot A", profile: null, sourceDatasetId: primaryId },
      B: { label: "Slot B", profile: null, sourceDatasetId: null },
    },
  });

  const monoRoundTrip = runWorksheetPipelineRoundTrip(monoContext);
  assertCase(
    "pipeline.worksheet.single.roundtrip",
    worksheetsEquivalent(monoRoundTrip.firstProject, monoRoundTrip.secondProject)
  );

  const multiContext = buildWorksheetCollectContext(projectId, primaryId, datasetBId);
  const multiRoundTrip = runWorksheetPipelineRoundTrip(multiContext);
  assertCase(
    "pipeline.worksheet.multi.perDataset",
    worksheetsEquivalent(multiRoundTrip.firstProject, multiRoundTrip.secondProject) &&
      findDatasetWorksheet(multiRoundTrip.secondProject, primaryId)?.columnRegistry?.s1
        ?.transforms[0]?.kind === "formula" &&
      findDatasetWorksheet(multiRoundTrip.secondProject, datasetBId)?.columnRegistry?.s2
        ?.columnType === "numeric"
  );

  const overlayRegistry: WorksheetColumnRegistry = {
    s2: {
      columnType: "text",
      transforms: [
        {
          kind: "scale",
          enabled: true,
          params: { factor: 3 },
          sourceSeriesIds: ["s2"],
        },
      ],
    },
  };
  const overlaySnapshot = collectProjectSnapshotV2(
    buildWorksheetCollectContext(projectId, primaryId, datasetBId, {
      activeColumnRegistry: overlayRegistry,
      activeAuxiliaryColumns: [],
      worksheetModified: true,
    })
  );
  assertCase(
    "pipeline.worksheet.multi.activeOverlay",
    findDatasetWorksheet(overlaySnapshot, datasetBId)?.columnRegistry?.s2
      ?.columnType === "text" &&
      findDatasetWorksheet(overlaySnapshot, primaryId)?.columnRegistry?.s1
        ?.transforms[0]?.kind === "formula"
  );

  const patchBeforeSwitch = buildHydrateProjectV2Patch(
    collectProjectSnapshotV2(multiContext)
  );
  const originalWorksheetA = findDatasetWorksheet(
    patchBeforeSwitch.project,
    primaryId
  );
  const editBContext = patchToCollectContextV2WithWorksheet(patchBeforeSwitch);
  editBContext.activeDatasetId = datasetBId;
  editBContext.activeColumnRegistry = overlayRegistry;
  editBContext.worksheetModified = true;
  const afterEditB = collectProjectSnapshotV2(editBContext);
  const returnAContext = patchToCollectContextV2WithWorksheet(patchBeforeSwitch);
  returnAContext.activeDatasetId = primaryId;
  returnAContext.experimentalSeries = SAMPLE_WORKSHEET_SERIES_A;
  returnAContext.activeColumnRegistry = SAMPLE_WORKSHEET_REGISTRY_A;
  returnAContext.worksheetModified = true;
  const afterReturnA = collectProjectSnapshotV2(returnAContext);
  assertCase(
    "pipeline.worksheet.switch.noCrossContam",
    JSON.stringify(normalizeWorksheetForCompare(findDatasetWorksheet(afterReturnA, primaryId))) ===
      JSON.stringify(normalizeWorksheetForCompare(originalWorksheetA)) &&
      findDatasetWorksheet(afterEditB, datasetBId)?.columnRegistry?.s2
        ?.columnType === "text" &&
      JSON.stringify(normalizeWorksheetForCompare(findDatasetWorksheet(afterEditB, primaryId))) ===
        JSON.stringify(normalizeWorksheetForCompare(originalWorksheetA))
  );

  const emptyContext = buildWorksheetCollectContext(projectId, primaryId, datasetBId, {
    sessionDatasets: [
      buildWorksheetSessionDataset(
        primaryId,
        "DatasetA.csv",
        SAMPLE_WORKSHEET_SERIES_A,
        { worksheetModified: false }
      ),
    ],
    activeDatasetId: primaryId,
    experimentalSeries: SAMPLE_WORKSHEET_SERIES_A,
    worksheetModified: false,
    activeColumnRegistry: undefined,
    activeAuxiliaryColumns: undefined,
    comparisonSlots: {
      A: { label: "Slot A", profile: null, sourceDatasetId: primaryId },
      B: { label: "Slot B", profile: null, sourceDatasetId: null },
    },
  });
  const emptySnapshot = collectProjectSnapshotV2(emptyContext);
  assertCase(
    "pipeline.worksheet.empty.omit",
    findDatasetWorksheet(emptySnapshot, primaryId) === undefined
  );

  const orphanProject = collectProjectSnapshotV2(multiContext);
  orphanProject.datasets[0]!.worksheet = {
    modified: true,
    columnRegistry: {
      s1: { columnType: "numeric", transforms: [] },
      orphan: { columnType: "numeric", transforms: [] },
    },
  };
  const orphanSerialized = serializeProjectV2({
    project: orphanProject,
    appVersion: APP_VERSION,
    options: { includeChecksum: false },
  });
  const orphanHydrated =
    orphanSerialized.ok === true
      ? hydrateProjectJson(orphanSerialized.json)
      : null;
  assertCase(
    "pipeline.worksheet.sanitize.orphan",
    orphanHydrated?.ok === true &&
      findDatasetWorksheet(orphanHydrated.patch.project, primaryId)?.columnRegistry
        ?.orphan === undefined &&
      findDatasetWorksheet(orphanHydrated.patch.project, primaryId)?.columnRegistry
        ?.s1 !== undefined
  );

  const preserveRoundTrip = runWorksheetPipelineRoundTrip(multiContext);
  assertCase(
    "pipeline.preserve.inactive.roundtrip",
    preserveRoundTrip.secondProject.datasets.find((dataset) => dataset.id === primaryId)
      ?.preserveAnalysisOnReimport === true &&
      preserveRoundTrip.secondProject.datasets.find((dataset) => dataset.id === datasetBId)
        ?.preserveAnalysisOnReimport === false
  );

  const preserveOverrideSnapshot = collectProjectSnapshotV2(
    buildWorksheetCollectContext(projectId, primaryId, datasetBId, {
      preserveAnalysisConfiguration: true,
      sessionDatasets: [
        buildWorksheetSessionDataset(
          primaryId,
          "DatasetA.csv",
          SAMPLE_WORKSHEET_SERIES_A,
          { preserveAnalysisOnReimport: false }
        ),
        buildWorksheetSessionDataset(
          datasetBId,
          "DatasetB.csv",
          SAMPLE_WORKSHEET_SERIES_B,
          { preserveAnalysisOnReimport: false }
        ),
      ],
    })
  );
  assertCase(
    "pipeline.preserve.activeOverride",
    preserveOverrideSnapshot.datasets.find((dataset) => dataset.id === primaryId)
      ?.preserveAnalysisOnReimport === false &&
      preserveOverrideSnapshot.datasets.find((dataset) => dataset.id === datasetBId)
        ?.preserveAnalysisOnReimport === true
  );

  const b2Fixture = readFixture("project-v2-dataset5-minimal.sgproj");
  const b2Hydrated = hydrateProjectJson(b2Fixture);
  if (b2Hydrated.ok) {
    const b2RoundTrip = runWorksheetPipelineRoundTrip(
      patchToCollectContextV2WithWorksheet(b2Hydrated.patch)
    );
    assertCase(
      "pipeline.compat.b2.noWorksheet",
      b2RoundTrip.firstProject.datasets.every((dataset) => dataset.worksheet === undefined) &&
        b2RoundTrip.secondProject.datasets.every((dataset) => dataset.worksheet === undefined)
    );
  } else {
    assertCase("pipeline.compat.b2.noWorksheet", false);
  }

  const b2MultiRoundTrip = runSaveLoadSaveRoundTrip(
    buildMultiCollectContext("00000000-0000-4000-8000-000000009901")
  );
  assertCase(
    "pipeline.compat.b2.invariantsStillPass",
    JSON.stringify(normalizeProjectForRoundTrip(b2MultiRoundTrip.firstProject)) ===
      JSON.stringify(normalizeProjectForRoundTrip(b2MultiRoundTrip.secondProject))
  );

  const hydratePatch = buildHydrateProjectV2Patch(
    collectProjectSnapshotV2(multiContext)
  );
  assertCase(
    "pipeline.hydrate.sessionDatasets.worksheet",
    hydratePatch.sessionDatasets.every((session) => {
      const persisted = hydratePatch.project.datasets.find(
        (dataset) => dataset.id === session.id
      );
      return (
        session.worksheetModified === (persisted?.worksheet?.modified ?? false) &&
        JSON.stringify(session.datasetPayload.columnRegistry) ===
          JSON.stringify(persisted?.worksheet?.columnRegistry ?? undefined)
      );
    })
  );

  const applyCapture: { sessions: SessionDataset[] | null } = { sessions: null };
  applyHydrateProjectV2Patch(hydratePatch, {
    setProjectMetadata: () => undefined,
    setExperimentalSeries: () => undefined,
    setCurrentDatasetInfo: () => undefined,
    setLastImportReport: () => undefined,
    setPreserveAnalysisConfiguration: () => undefined,
    setSessionDatasets: (value) => {
      applyCapture.sessions = value;
    },
    setActiveDatasetId: () => undefined,
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
    visibilitySetters: {},
    clearEphemeralUiState: () => undefined,
    assignNextCurveIds: () => undefined,
    generateGraph: () => undefined,
  });
  const activeWorksheet = extractActiveWorksheetState(hydratePatch);
  assertCase(
    "pipeline.hydrate.apply.sessionDatasets.worksheet",
    applyCapture.sessions !== null &&
      applyCapture.sessions.find((session) => session.id === datasetBId)?.datasetPayload
        .columnRegistry?.s2 !== undefined &&
      activeWorksheet?.columnRegistry?.s2 !== undefined
  );

  const frozenSession = Object.freeze(
    buildWorksheetSessionDataset(
      primaryId,
      "DatasetA.csv",
      SAMPLE_WORKSHEET_SERIES_A,
      { columnRegistry: SAMPLE_WORKSHEET_REGISTRY_A }
    )
  );
  const beforeSnapshot = JSON.stringify(frozenSession);
  sessionDatasetToProjectDatasetV2(frozenSession as typeof frozenSession);
  assertCase(
    "pipeline.mapper.deepClone.immutable",
    JSON.stringify(frozenSession) === beforeSnapshot
  );

  return results;
};
