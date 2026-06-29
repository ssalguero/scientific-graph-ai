import fs from "node:fs";
import path from "node:path";

import type { ExperimentalSeries } from "@/lib/experimentalData";
import {
  hydrateProject,
  hydrateProjectJson,
  migrateProjectJson,
  projectFileToHydrateV1,
  SCHEMA_VERSION_V2,
  type HydrateProjectV2Patch,
} from "@/lib/project";
import { toPrimaryDatasetId, toSequencedDatasetId } from "@/lib/project/domain";
import type { ScientificProjectV2 } from "@/lib/project/domain/types-v2";
import { GUIDED_WORKFLOW_IDLE_SESSION } from "@/lib/scientific/workflow/catalog";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

const FIXTURES_DIR = path.join(process.cwd(), "scripts", "fixtures");

const readFixture = (name: string) =>
  fs.readFileSync(path.join(FIXTURES_DIR, name), "utf8");

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

export const getHydratedActiveSeries = (
  patch: HydrateProjectV2Patch
): ExperimentalSeries[] => {
  const active = patch.sessionDatasets.find(
    (dataset) => dataset.id === patch.activeDatasetId
  );
  return active?.datasetPayload.series ?? [];
};

const buildMultiDatasetV2Project = (
  projectId: string,
  activeId: string,
  sourceA: string,
  sourceB: string
): ScientificProjectV2 => {
  const primaryId = toPrimaryDatasetId(projectId);
  const datasetBId = toSequencedDatasetId(projectId, 2);

  return {
    metadata: {
      id: projectId,
      name: "Multi hydrate wire test",
      createdAt: "2026-06-17T10:00:00.000Z",
      updatedAt: "2026-06-17T12:00:00.000Z",
    },
    datasets: [
      {
        id: primaryId,
        label: "Dataset A",
        series: [
          {
            id: "s1",
            name: "Series A",
            color: "#3366cc",
            points: [{ x: 1, y: 10 }],
          },
        ],
        info: {
          fileName: "DatasetA.csv",
          importedAt: "2026-06-17T12:00:00.000Z",
          seriesCount: 1,
          observationCount: 1,
        },
        importReport: null,
      },
      {
        id: datasetBId,
        label: "Dataset B",
        series: SAMPLE_SERIES_B,
        info: {
          fileName: "DatasetB.csv",
          importedAt: "2026-06-17T12:00:00.000Z",
          seriesCount: 1,
          observationCount: 2,
        },
        importReport: null,
        preserveAnalysisOnReimport: true,
      },
    ],
    activeDatasetId: activeId,
    analysisConfig: {
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
      legend: { hiddenKeys: [] },
    },
    workflow: { session: GUIDED_WORKFLOW_IDLE_SESSION },
    comparison: {
      slots: {
        A: { label: "Slot A", profile: null, sourceDatasetId: sourceA },
        B: { label: "Slot B", profile: null, sourceDatasetId: sourceB },
      },
    },
    workspace: {
      activeSection: "data",
      inspectorSection: "visualization",
      enabledModules: {},
      controlPanelTab: "data",
    },
    graphContext: null,
  };
};

export const runHydrateV2PipelineCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  const dataset5V1 = readFixture("project-v1-dataset5-minimal.sgproj");
  const dataset5V2 = readFixture("project-v2-dataset5-minimal.sgproj");
  const emptyV2 = readFixture("project-v2-empty.sgproj");

  const migratedV1 = migrateProjectJson(dataset5V1);
  assertCase("wire.hydrate.v1Migrated.ok", migratedV1.ok === true);

  if (migratedV1.ok) {
    const hydratedMigrated = hydrateProject(migratedV1.file);
    assertCase("wire.hydrate.v1Migrated.nativePatch", hydratedMigrated.ok === true);
    if (hydratedMigrated.ok) {
      assertCase(
        "wire.hydrate.v1Migrated.series",
        getHydratedActiveSeries(hydratedMigrated.patch).length === 4
      );
      assertCase(
        "wire.hydrate.v1Migrated.selections",
        hydratedMigrated.patch.project.analysisConfig.selections.tTestSeriesA ===
          "d5-control1"
      );
      assertCase(
        "wire.hydrate.v1Migrated.noCollapse",
        hydratedMigrated.patch.project.datasets.length ===
          hydratedMigrated.patch.sessionDatasets.length &&
          hydratedMigrated.patch.sessionDatasets.length >= 1
      );
    }
  }

  const hydratedV2Mono = hydrateProjectJson(dataset5V2);
  assertCase("wire.hydrate.v2Mono.ok", hydratedV2Mono.ok === true);
  if (hydratedV2Mono.ok) {
    assertCase(
      "wire.hydrate.v2Mono.singleDataset",
      hydratedV2Mono.patch.sessionDatasets.length === 1
    );
    assertCase(
      "wire.hydrate.v2Mono.series",
      getHydratedActiveSeries(hydratedV2Mono.patch).length === 4
    );
    assertCase(
      "wire.hydrate.v2Mono.activeDatasetId",
      hydratedV2Mono.patch.activeDatasetId ===
        hydratedV2Mono.patch.project.activeDatasetId
    );
  }

  const projectId = "00000000-0000-4000-8000-000000000055";
  const primaryId = toPrimaryDatasetId(projectId);
  const datasetBId = toSequencedDatasetId(projectId, 2);
  const multiProject = buildMultiDatasetV2Project(
    projectId,
    datasetBId,
    primaryId,
    datasetBId
  );
  const multiFile = {
    kind: "scientific-graph-ai.project" as const,
    schemaVersion: SCHEMA_VERSION_V2,
    appVersion: "0.1.0",
    exportedAt: "2026-06-17T12:00:00.000Z",
    project: multiProject,
  };
  const hydratedMulti = hydrateProject(multiFile);
  assertCase("wire.hydrate.v2Multi.ok", hydratedMulti.ok === true);
  if (hydratedMulti.ok) {
    assertCase(
      "wire.hydrate.v2Multi.datasets.length",
      hydratedMulti.patch.sessionDatasets.length === 2
    );
    assertCase(
      "wire.hydrate.v2Multi.activeDatasetId",
      hydratedMulti.patch.activeDatasetId === datasetBId
    );
    assertCase(
      "wire.hydrate.v2Multi.sourceDatasetIds",
      hydratedMulti.patch.project.comparison.slots.A.sourceDatasetId ===
        primaryId &&
        hydratedMulti.patch.project.comparison.slots.B.sourceDatasetId ===
          datasetBId
    );
    assertCase(
      "wire.hydrate.v2Multi.noCollapse",
      hydratedMulti.patch.project.datasets.length === 2 &&
        hydratedMulti.patch.sessionDatasets.length === 2
    );
    assertCase(
      "wire.hydrate.v2Multi.activeSeriesFromSecondDataset",
      getHydratedActiveSeries(hydratedMulti.patch)[0]?.points.length === 2
    );
    assertCase(
      "wire.hydrate.v2Multi.idsPreserved",
      hydratedMulti.patch.sessionDatasets[0]?.id === primaryId &&
        hydratedMulti.patch.sessionDatasets[1]?.id === datasetBId
    );
  }

  const hydratedEmpty = hydrateProjectJson(emptyV2);
  assertCase("wire.hydrate.v2Empty.ok", hydratedEmpty.ok === true);
  if (hydratedEmpty.ok) {
    assertCase(
      "wire.hydrate.v2Empty.primaryFallback",
      hydratedEmpty.patch.sessionDatasets.length === 1 &&
        hydratedEmpty.patch.activeDatasetId ===
          hydratedEmpty.patch.sessionDatasets[0]?.id
    );
  }

  if (migratedV1.ok) {
    const serializedSnapshot = projectFileToHydrateV1(migratedV1.file);
    assertCase(
      "wire.hydrate.legacyCollapseHelperStillAvailable",
      serializedSnapshot.dataset.series.length === 4
    );
  }

  assertCase(
    "wire.hydrate.patchIsNativeV2Shape",
    hydratedV2Mono.ok === true &&
      Array.isArray(hydratedV2Mono.patch.sessionDatasets) &&
      typeof hydratedV2Mono.patch.activeDatasetId === "string" &&
      !("dataset" in hydratedV2Mono.patch.project)
  );

  return results;
};
