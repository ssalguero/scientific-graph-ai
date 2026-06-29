import fs from "node:fs";
import path from "node:path";

import type { ExperimentalSeries } from "@/lib/experimentalData";
import { collectProjectSnapshotV2 } from "@/lib/project/collect-project-snapshot-v2";
import type { EditorProjectCollectContextV2 } from "@/lib/project/editor-collect-context-v2";
import type { HydrateProjectV2Patch } from "@/lib/project/editor-hydrate-context-v2";
import { toPrimaryDatasetId, toSequencedDatasetId } from "@/lib/project/domain";
import type { ScientificProjectV2 } from "@/lib/project/domain/types-v2";
import {
  hydrateProject,
  hydrateProjectJson,
  migrateProjectJson,
  SCHEMA_VERSION_V2,
  serializeProjectV2,
} from "@/lib/project";
import { MODULE_KEYS_V1 } from "@/lib/project/keys";
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

/** Strip non-deterministic metadata for round-trip comparison (Invariant A). */
export const normalizeProjectForRoundTrip = (
  project: ScientificProjectV2
): ScientificProjectV2 => {
  const normalized = JSON.parse(JSON.stringify(project)) as ScientificProjectV2;
  normalized.metadata = {
    ...normalized.metadata,
    updatedAt: "NORMALIZED",
  };
  delete normalized.metadata.revisionHistory;
  delete normalized.metadata.cloudRef;
  return normalized;
};

export const patchToCollectContextV2 = (
  patch: HydrateProjectV2Patch
): EditorProjectCollectContextV2 => {
  const activeSession = patch.sessionDatasets.find(
    (dataset) => dataset.id === patch.activeDatasetId
  );

  return {
    metadata: patch.project.metadata,
    experimentalSeries: activeSession?.datasetPayload.series ?? [],
    currentDatasetInfo: activeSession
      ? {
          fileName: activeSession.name,
          importedAt: activeSession.importedAt,
          seriesCount: activeSession.seriesCount,
          observationCount: activeSession.observationCount,
        }
      : null,
    lastImportReport: activeSession?.datasetPayload.importReport ?? null,
    preserveAnalysisConfiguration:
      patch.project.datasets.find((dataset) => dataset.id === patch.activeDatasetId)
        ?.preserveAnalysisOnReimport ?? false,
    visibility: patch.project.analysisConfig.visibility,
    modes: patch.project.analysisConfig.modes,
    selections: patch.project.analysisConfig.selections,
    hiddenLegendKeys: patch.project.analysisConfig.legend.hiddenKeys,
    guidedWorkflowSession: patch.project.workflow.session,
    comparisonSlots: {
      A: {
        label: patch.project.comparison.slots.A.label,
        profile: patch.project.comparison.slots.A.profile,
        sourceDatasetId: patch.project.comparison.slots.A.sourceDatasetId,
      },
      B: {
        label: patch.project.comparison.slots.B.label,
        profile: patch.project.comparison.slots.B.profile,
        sourceDatasetId: patch.project.comparison.slots.B.sourceDatasetId,
      },
    },
    workspace: patch.project.workspace,
    title: patch.project.graphContext?.title ?? "",
    minX: patch.project.graphContext?.minX ?? -10,
    maxX: patch.project.graphContext?.maxX ?? 10,
    visibleMinX: patch.project.graphContext?.visibleMinX ?? -10,
    visibleMaxX: patch.project.graphContext?.visibleMaxX ?? 10,
    autoScaleY: patch.project.graphContext?.autoScaleY ?? false,
    useSecondaryYAxis: patch.project.graphContext?.useSecondaryYAxis ?? false,
    curves:
      patch.project.graphContext?.curves.map((curve) => ({
        expression: curve.expression,
        color: curve.color,
      })) ?? [{ expression: "", color: "#3b82f6" }],
    sessionDatasets: patch.sessionDatasets,
    activeDatasetId: patch.activeDatasetId,
    worksheetModified: activeSession?.worksheetModified ?? false,
  };
};

const buildDefaultEnabledModules = (): Record<string, boolean> =>
  Object.fromEntries(MODULE_KEYS_V1.map((key) => [key, true]));

export const buildMultiCollectContext = (
  projectId: string
): EditorProjectCollectContextV2 => {
  const primaryId = toPrimaryDatasetId(projectId);
  const datasetBId = toSequencedDatasetId(projectId, 2);

  return {
    metadata: {
      id: projectId,
      name: "B2.9 multi-dataset fixture",
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
      enabledModules: buildDefaultEnabledModules(),
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
    sessionDatasets: [
      buildSessionDataset(primaryId, "DatasetA.csv", SAMPLE_SERIES_A),
      buildSessionDataset(datasetBId, "DatasetB.csv", SAMPLE_SERIES_B),
    ],
    activeDatasetId: datasetBId,
    worksheetModified: false,
  };
};

export const runSaveLoadSaveRoundTrip = (
  collectContext: EditorProjectCollectContextV2
): {
  firstProject: ScientificProjectV2;
  secondProject: ScientificProjectV2;
} => {
  const firstProject = collectProjectSnapshotV2(collectContext);
  const firstSerialized = serializeProjectV2({
    project: firstProject,
    appVersion: APP_VERSION,
    exportedAt: "2026-06-17T12:00:00.000Z",
    options: { includeChecksum: false },
  });
  if (!firstSerialized.ok) {
    throw new Error("Invariant A: first serialize failed.");
  }

  const hydrated = hydrateProjectJson(firstSerialized.json);
  if (!hydrated.ok) {
    throw new Error("Invariant A: hydrate failed.");
  }

  const reloadedContext = patchToCollectContextV2(hydrated.patch);
  const secondProject = collectProjectSnapshotV2(reloadedContext);
  const secondSerialized = serializeProjectV2({
    project: secondProject,
    appVersion: APP_VERSION,
    exportedAt: "2026-06-17T13:00:00.000Z",
    options: { includeChecksum: false },
  });
  if (!secondSerialized.ok) {
    throw new Error("Invariant A: second serialize failed.");
  }

  return { firstProject, secondProject };
};

export const runB29InvariantCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  const projectId = "00000000-0000-4000-8000-000000009901";
  const primaryId = toPrimaryDatasetId(projectId);
  const datasetBId = toSequencedDatasetId(projectId, 2);

  const multiRoundTrip = runSaveLoadSaveRoundTrip(
    buildMultiCollectContext(projectId)
  );
  assertCase(
    "invariantA.multi.equivalent",
    JSON.stringify(normalizeProjectForRoundTrip(multiRoundTrip.firstProject)) ===
      JSON.stringify(normalizeProjectForRoundTrip(multiRoundTrip.secondProject))
  );
  assertCase(
    "invariantA.multi.activeDatasetId",
    multiRoundTrip.secondProject.activeDatasetId === datasetBId
  );
  assertCase(
    "invariantA.multi.sourceDatasetIds",
    multiRoundTrip.secondProject.comparison.slots.A.sourceDatasetId === primaryId &&
      multiRoundTrip.secondProject.comparison.slots.B.sourceDatasetId === datasetBId
  );

  const dataset5V2 = readFixture("project-v2-dataset5-minimal.sgproj");
  const hydratedD5 = hydrateProjectJson(dataset5V2);
  assertCase("invariantA.d5fixture.hydrate", hydratedD5.ok === true);
  if (hydratedD5.ok) {
    const d5RoundTrip = runSaveLoadSaveRoundTrip(
      patchToCollectContextV2(hydratedD5.patch)
    );
    assertCase(
      "invariantA.d5fixture.equivalent",
      JSON.stringify(normalizeProjectForRoundTrip(d5RoundTrip.firstProject)) ===
        JSON.stringify(normalizeProjectForRoundTrip(d5RoundTrip.secondProject))
    );
  }

  const dataset5V1 = readFixture("project-v1-dataset5-minimal.sgproj");
  const migrated = migrateProjectJson(dataset5V1);
  assertCase("invariantB.v1.migrate", migrated.ok === true);

  const hydratedV1 = hydrateProjectJson(dataset5V1);
  assertCase("invariantB.v1.hydrate", hydratedV1.ok === true);

  if (migrated.ok && hydratedV1.ok) {
    const savedFromRuntime = serializeProjectV2({
      project: collectProjectSnapshotV2(patchToCollectContextV2(hydratedV1.patch)),
      appVersion: APP_VERSION,
      options: { includeChecksum: false },
    });
    assertCase("invariantB.v1.saveV2", savedFromRuntime.ok === true);

    if (savedFromRuntime.ok) {
      const savedProject = savedFromRuntime.file.project as ScientificProjectV2;
      const migratedProject = migrated.file.project as ScientificProjectV2;

      assertCase(
        "invariantB.v1.schemaV2",
        savedFromRuntime.file.schemaVersion === SCHEMA_VERSION_V2
      );
      assertCase(
        "invariantB.v1.datasets.length",
        savedProject.datasets.length === migratedProject.datasets.length
      );
      assertCase(
        "invariantB.v1.activeDatasetId",
        savedProject.activeDatasetId === migratedProject.activeDatasetId
      );
      assertCase(
        "invariantB.v1.dataset.ids",
        savedProject.datasets.every(
          (dataset, index) => dataset.id === migratedProject.datasets[index]?.id
        )
      );
      assertCase(
        "invariantB.v1.analysisConfig.selections",
        savedProject.analysisConfig.selections.tTestSeriesA ===
          migratedProject.analysisConfig.selections.tTestSeriesA
      );
      assertCase(
        "invariantB.v1.workflow",
        JSON.stringify(savedProject.workflow) ===
          JSON.stringify(migratedProject.workflow)
      );
      assertCase(
        "invariantB.v1.workspace",
        JSON.stringify(savedProject.workspace) ===
          JSON.stringify(migratedProject.workspace)
      );
      assertCase(
        "invariantB.v1.comparison.sourceDatasetIds",
        savedProject.comparison.slots.A.sourceDatasetId ===
          migratedProject.comparison.slots.A.sourceDatasetId &&
          savedProject.comparison.slots.B.sourceDatasetId ===
            migratedProject.comparison.slots.B.sourceDatasetId
      );
    }
  }

  if (migrated.ok) {
    const orphanFile = structuredClone(migrated.file);
    orphanFile.project.analysisConfig.selections.tTestSeriesB =
      "missing-series-id";
    const orphanHydrated = hydrateProject(orphanFile);
    assertCase("invariantB.hydrateSanitize.orphan", orphanHydrated.ok === true);
    if (orphanHydrated.ok) {
      assertCase(
        "invariantB.hydrateSanitize.orphanCleared",
        orphanHydrated.patch.project.analysisConfig.selections.tTestSeriesB ===
          null
      );
      assertCase(
        "invariantB.hydrateSanitize.orphanWarning",
        orphanHydrated.patch.warnings.some((item) => item.code === "H-SEL-ORPHAN")
      );
    }
  }

  const multiFixtureSerialized = serializeProjectV2({
    project: collectProjectSnapshotV2(buildMultiCollectContext(projectId)),
    appVersion: APP_VERSION,
    exportedAt: "2026-06-17T12:00:00.000Z",
    options: { includeChecksum: false, pretty: true },
  });
  if (multiFixtureSerialized.ok) {
    const fixturePath = path.join(
      FIXTURES_DIR,
      "project-v2-dataset5-dataset6-comparison.sgproj"
    );
    fs.writeFileSync(fixturePath, multiFixtureSerialized.json, "utf8");
    const reloadedFixture = hydrateProjectJson(multiFixtureSerialized.json);
    assertCase(
      "invariantA.fixture.d5d6.written",
      fs.existsSync(fixturePath) && reloadedFixture.ok === true
    );
    if (reloadedFixture.ok) {
      assertCase(
        "invariantA.fixture.d5d6.multiDataset",
        reloadedFixture.patch.sessionDatasets.length === 2
      );
    }
  }

  return results;
};
