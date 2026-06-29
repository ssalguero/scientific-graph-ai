import fs from "node:fs";
import path from "node:path";

import { collectProjectSnapshotV2 } from "@/lib/project/collect-project-snapshot-v2";
import { extractActiveWorksheetState } from "@/lib/project/apply-hydrate-project-v2-patch";
import { toPrimaryDatasetId, toSequencedDatasetId } from "@/lib/project/domain";
import type { ScientificProjectV2 } from "@/lib/project/domain/types-v2";
import { hydrateProjectJson } from "@/lib/project";
import type { WorksheetColumnRegistry } from "@/lib/experimentalWorksheet";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

import { runUiSaveOpenRoundTrip } from "./ui-project-pipeline-v2.cases";
import {
  activateSessionDatasetForTest,
  buildWorksheetCollectContext,
  buildWorksheetSessionDataset,
  loadSessionDatasetEditorState,
  patchToCollectContextV2WithWorksheet,
  prepareCollectContextForSaveForTest,
  runWorksheetPipelineRoundTrip,
  SAMPLE_WORKSHEET_AUXILIARY,
  SAMPLE_WORKSHEET_REGISTRY_A,
  SAMPLE_WORKSHEET_REGISTRY_B,
  SAMPLE_WORKSHEET_SERIES_A,
  SAMPLE_WORKSHEET_SERIES_B,
  worksheetsEquivalent,
  type WorksheetEditorState,
} from "./worksheet-pipeline-helpers";

const FIXTURES_DIR = path.join(process.cwd(), "scripts", "fixtures");

const readFixture = (name: string) =>
  fs.readFileSync(path.join(FIXTURES_DIR, name), "utf8");

const findDatasetWorksheet = (
  project: ScientificProjectV2,
  datasetId: string
) => project.datasets.find((dataset) => dataset.id === datasetId)?.worksheet;

export const runWorksheetPersistCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  const projectId = "00000000-0000-4000-8000-00000000c301";
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
    worksheetModified: true,
    comparisonSlots: {
      A: { label: "Slot A", profile: null, sourceDatasetId: primaryId },
      B: { label: "Slot B", profile: null, sourceDatasetId: null },
    },
  });

  const monoRoundTrip = runWorksheetPipelineRoundTrip(monoContext);
  assertCase(
    "ui.worksheet.single.roundtrip",
    worksheetsEquivalent(monoRoundTrip.firstProject, monoRoundTrip.secondProject)
  );

  const overlayRegistry: WorksheetColumnRegistry = {
    s2: {
      columnType: "text",
      transforms: [
        {
          kind: "scale",
          enabled: true,
          params: { factor: 2 },
          sourceSeriesIds: ["s2"],
        },
      ],
    },
  };

  const multiBase = buildWorksheetCollectContext(projectId, primaryId, datasetBId);
  const editorOverlay: WorksheetEditorState = {
    experimentalSeries: SAMPLE_WORKSHEET_SERIES_B,
    lastImportReport: null,
    worksheetModified: true,
    columnRegistry: overlayRegistry,
    auxiliaryColumns: [],
  };
  const savedOverlayContext = prepareCollectContextForSaveForTest(
    {
      ...multiBase,
      activeColumnRegistry: overlayRegistry,
      worksheetModified: true,
    },
    editorOverlay
  );
  const overlaySnapshot = collectProjectSnapshotV2(savedOverlayContext);
  assertCase(
    "ui.worksheet.saveOpen.activeOverlay",
    findDatasetWorksheet(overlaySnapshot, datasetBId)?.columnRegistry?.s2
      ?.columnType === "text" &&
      findDatasetWorksheet(overlaySnapshot, primaryId)?.columnRegistry?.s1
        ?.transforms[0]?.kind === "formula"
  );

  const staleSessionContext = buildWorksheetCollectContext(
    projectId,
    primaryId,
    datasetBId,
    {
      activeDatasetId: datasetBId,
      activeColumnRegistry: overlayRegistry,
      worksheetModified: true,
    }
  );
  const staleActive = staleSessionContext.sessionDatasets.find(
    (dataset) => dataset.id === datasetBId
  );
  assertCase(
    "ui.worksheet.persist.beforeSave",
    staleActive !== undefined &&
      staleActive.datasetPayload.columnRegistry?.s2?.columnType !== "text" &&
      findDatasetWorksheet(
        collectProjectSnapshotV2(
          prepareCollectContextForSaveForTest(staleSessionContext, editorOverlay)
        ),
        datasetBId
      )?.columnRegistry?.s2?.columnType === "text"
  );

  const openRoundTrip = runWorksheetPipelineRoundTrip(multiBase);
  const extracted = extractActiveWorksheetState(openRoundTrip.hydratedPatch);
  const activeSession = openRoundTrip.hydratedPatch.sessionDatasets.find(
    (dataset) => dataset.id === openRoundTrip.hydratedPatch.activeDatasetId
  );
  const loadedEditor = activeSession
    ? loadSessionDatasetEditorState(activeSession)
    : null;
  assertCase(
    "ui.worksheet.open.restoreEditor",
    extracted !== null &&
      loadedEditor !== null &&
      extracted.worksheetModified === loadedEditor.worksheetModified &&
      JSON.stringify(extracted.columnRegistry) ===
        JSON.stringify(loadedEditor.columnRegistry) &&
      JSON.stringify(extracted.auxiliaryColumns ?? []) ===
        JSON.stringify(loadedEditor.auxiliaryColumns)
  );

  let switchRegistry = [
    buildWorksheetSessionDataset(
      primaryId,
      "DatasetA.csv",
      SAMPLE_WORKSHEET_SERIES_A,
      { columnRegistry: SAMPLE_WORKSHEET_REGISTRY_A, worksheetModified: true }
    ),
    buildWorksheetSessionDataset(
      datasetBId,
      "DatasetB.csv",
      SAMPLE_WORKSHEET_SERIES_B,
      { columnRegistry: SAMPLE_WORKSHEET_REGISTRY_B, worksheetModified: true }
    ),
  ];
  let switchActiveId: string | null = primaryId;
  let switchEditor = loadSessionDatasetEditorState(switchRegistry[0]!);
  const originalRegistryA = JSON.stringify(
    switchRegistry[0]!.datasetPayload.columnRegistry
  );

  const toB = activateSessionDatasetForTest(
    switchRegistry,
    switchActiveId,
    datasetBId,
    switchEditor
  );
  if (toB) {
    switchRegistry = toB.registry;
    switchActiveId = toB.activeId;
    switchEditor = {
      ...toB.editor,
      columnRegistry: overlayRegistry,
      worksheetModified: true,
    };
  }

  const toA = activateSessionDatasetForTest(
    switchRegistry,
    switchActiveId,
    primaryId,
    switchEditor
  );
  const returnedSessionA = toA?.registry.find((dataset) => dataset.id === primaryId);
  const returnedSessionB = toA?.registry.find((dataset) => dataset.id === datasetBId);

  assertCase(
    "ui.worksheet.switch.noCrossContam",
    toB !== null &&
      toA !== null &&
      JSON.stringify(returnedSessionA?.datasetPayload.columnRegistry) ===
        originalRegistryA &&
      returnedSessionB?.datasetPayload.columnRegistry?.s2?.columnType === "text"
  );

  const goldenText = readFixture("project-v2-dataset5-with-worksheet.sgproj");
  const goldenHydrated = hydrateProjectJson(goldenText);
  assertCase(
    "ui.worksheet.golden.fixtureLoads",
    goldenHydrated.ok &&
      goldenHydrated.patch.project.datasets.some(
        (dataset) =>
          dataset.worksheet?.modified === true &&
          dataset.worksheet.columnRegistry?.["d5-control1"]?.transforms?.some(
            (transform) => transform.kind === "formula"
          ) &&
          (dataset.worksheet.auxiliaryColumns?.length ?? 0) > 0
      )
  );

  if (goldenHydrated.ok) {
    const goldenRoundTrip = runWorksheetPipelineRoundTrip(
      patchToCollectContextV2WithWorksheet(goldenHydrated.patch)
    );
    assertCase(
      "ui.worksheet.golden.roundtrip",
      worksheetsEquivalent(goldenRoundTrip.firstProject, goldenRoundTrip.secondProject)
    );
  } else {
    assertCase("ui.worksheet.golden.roundtrip", false);
  }

  const b2Fixture = readFixture("project-v2-dataset5-minimal.sgproj");
  const b2Hydrated = hydrateProjectJson(b2Fixture);
  if (b2Hydrated.ok) {
    const b2UiRoundTrip = runUiSaveOpenRoundTrip(
      patchToCollectContextV2WithWorksheet(b2Hydrated.patch)
    );
    const b2Reparsed = hydrateProjectJson(b2UiRoundTrip.savedJson);
    assertCase(
      "ui.worksheet.compat.b2.noRegression",
      b2Reparsed.ok &&
        b2Reparsed.patch.project.datasets.every(
          (dataset) => dataset.worksheet === undefined
        )
    );
  } else {
    assertCase("ui.worksheet.compat.b2.noRegression", false);
  }

  return results;
};
