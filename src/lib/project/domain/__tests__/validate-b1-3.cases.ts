import { readFileSync } from "node:fs";
import { join } from "node:path";

import { PROJECT_KIND } from "../../constants";
import {
  migrateDomainProjectFileToV2,
  migrateV1ToV2,
  validateDomainProjectFileV2,
  validateScientificProjectV2,
  type DomainScientificProjectFile,
  type ScientificProjectV1,
  type ScientificProjectV2,
} from "..";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

const FIXTURES_DIR = join(process.cwd(), "scripts", "fixtures");

const loadV1FixtureProject = (fileName: string): ScientificProjectV1 => {
  const text = readFileSync(join(FIXTURES_DIR, fileName), "utf8");
  const parsed = JSON.parse(text) as { project: ScientificProjectV1 };
  return parsed.project;
};

const cloneV2 = (project: ScientificProjectV2): ScientificProjectV2 =>
  JSON.parse(JSON.stringify(project)) as ScientificProjectV2;

const buildNativeV2Project = (): ScientificProjectV2 => ({
  metadata: {
    id: "native-v2-project",
    name: "Native V2",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  datasets: [
    {
      id: "native-dataset-alpha",
      label: "Alpha",
      series: [],
      info: null,
      importReport: null,
    },
  ],
  activeDatasetId: "native-dataset-alpha",
  analysisConfig: {
    visibility: {},
    modes: {
      regressionModel: "none",
      errorBarMode: "sd",
      correlationMethod: "pearson",
      outlierMethod: "iqr",
      heatmapMode: "correlation",
      nonParametricMode: "mann-whitney",
      histogramBins: 10,
      axisScaleMode: "linear",
      naturalLanguageEnabled: true,
    },
    selections: {
      tTestSeriesA: null,
      tTestSeriesB: null,
      mannWhitneySeriesA: null,
      mannWhitneySeriesB: null,
    },
    legend: { hiddenKeys: [] },
  },
  workflow: {
    session: {
      status: "idle",
      templateId: null,
      currentStepIndex: 0,
      completedStepIds: [],
      skippedStepIds: [],
      startedAt: null,
      completedAt: null,
    },
  },
  comparison: {
    slots: {
      A: { label: "Slot A", profile: null, sourceDatasetId: null },
      B: { label: "Slot B", profile: null, sourceDatasetId: null },
    },
  },
  workspace: {
    activeSection: "data",
    inspectorSection: "visualization",
    enabledModules: { basic: true },
  },
  graphContext: null,
});

export const runValidateB13Cases = (
  assertCase: (id: string, pass: boolean, detail?: string) => void
): void => {
  const emptyMigrated = migrateV1ToV2(loadV1FixtureProject("project-v1-empty.sgproj"));
  const dataset5Migrated = migrateV1ToV2(
    loadV1FixtureProject("project-v1-dataset5-minimal.sgproj")
  );

  assertCase(
    "validate.migrated.empty.ok",
    validateScientificProjectV2(emptyMigrated.project).ok === true
  );
  assertCase(
    "validate.migrated.dataset5.ok",
    validateScientificProjectV2(dataset5Migrated.project).ok === true
  );

  const emptyFile = migrateDomainProjectFileToV2(
    JSON.parse(
      readFileSync(join(FIXTURES_DIR, "project-v1-empty.sgproj"), "utf8")
    ) as DomainScientificProjectFile
  );
  assertCase(
    "validate.file.migrated.ok",
    validateDomainProjectFileV2(emptyFile.file).ok === true
  );

  const native = buildNativeV2Project();
  assertCase(
    "validate.native.id.withoutPrimarySuffix",
    validateScientificProjectV2(native).ok === true
  );

  const badActive = cloneV2(emptyMigrated.project);
  badActive.activeDatasetId = "missing-dataset";
  assertCase(
    "validate.activeDatasetId.unknown",
    validateScientificProjectV2(badActive).ok === false &&
      validateScientificProjectV2(badActive).errors.some(
        (item) => item.code === "V2-ACTIVE-MISS"
      )
  );

  const emptyDatasets = cloneV2(emptyMigrated.project);
  emptyDatasets.datasets = [];
  assertCase(
    "validate.datasets.empty",
    validateScientificProjectV2(emptyDatasets).ok === false &&
      validateScientificProjectV2(emptyDatasets).errors.some(
        (item) => item.code === "V2-DATASETS-EMPTY"
      )
  );

  const duplicateIds = cloneV2(emptyMigrated.project);
  duplicateIds.datasets.push({
    ...duplicateIds.datasets[0],
    label: "Duplicate",
  });
  assertCase(
    "validate.datasets.duplicateId",
    validateScientificProjectV2(duplicateIds).ok === false &&
      validateScientificProjectV2(duplicateIds).errors.some(
        (item) => item.code === "V2-DS-DUP"
      )
  );

  const badSlotRef = cloneV2(emptyMigrated.project);
  badSlotRef.comparison.slots.A.sourceDatasetId = "does-not-exist";
  assertCase(
    "validate.comparison.sourceDatasetId.invalid",
    validateScientificProjectV2(badSlotRef).ok === false &&
      validateScientificProjectV2(badSlotRef).errors.some(
        (item) => item.code === "V2-DS-REF-MISS"
      )
  );

  assertCase(
    "validate.comparison.sourceDatasetId.null.ok",
    emptyMigrated.project.comparison.slots.B.sourceDatasetId === null &&
      validateScientificProjectV2(emptyMigrated.project).ok === true
  );

  const withVisualGraph = cloneV2(native);
  withVisualGraph.visualGraphs = [
    {
      id: "vg-1",
      sourceDatasetId: "wrong-id",
      createdAt: "2026-01-01T00:00:00.000Z",
      graphSpec: {
        id: "vg-spec-1",
        createdAt: "2026-01-01T00:00:00.000Z",
        graphType: "scatter",
        xVariable: null,
        yVariable: null,
        groupVariable: null,
        color: "#000000",
        marker: "circle",
        lineStyle: "solid",
        markerSize: 4,
        errorBars: "none",
        bins: 10,
        xLabel: "X",
        yLabel: "Y",
        groupLabel: null,
      },
    },
  ];
  assertCase(
    "validate.visualGraphs.invalidSource",
    validateScientificProjectV2(withVisualGraph).ok === false &&
      validateScientificProjectV2(withVisualGraph).errors.some(
        (item) => item.code === "V2-VGB-SOURCE-MISS"
      )
  );

  const validVisualGraph = cloneV2(native);
  validVisualGraph.visualGraphs = [
    {
      id: "vg-2",
      sourceDatasetId: "native-dataset-alpha",
      createdAt: "2026-01-01T00:00:00.000Z",
      graphSpec: {
        id: "vg-spec-2",
        createdAt: "2026-01-01T00:00:00.000Z",
        graphType: "line",
        xVariable: "x",
        yVariable: "y",
        groupVariable: null,
        color: "#3b82f6",
        marker: "none",
        lineStyle: "solid",
        markerSize: 4,
        errorBars: "sd",
        bins: 12,
        xLabel: "X",
        yLabel: "Y",
        groupLabel: null,
      },
    },
  ];
  assertCase(
    "validate.visualGraphs.valid",
    validateScientificProjectV2(validVisualGraph).ok === true
  );

  const enrichedProfile = cloneV2(dataset5Migrated.project);
  enrichedProfile.comparison.slots.A = {
    label: "Slot A",
    sourceDatasetId: enrichedProfile.activeDatasetId,
    profile: {
      slotLabel: "A",
      datasetInfo: {
        fileName: "Dataset5.csv",
        importedAt: "2026-06-17T11:00:00.000Z",
        seriesCount: 4,
        observationCount: 40,
      },
      capturedAt: "2026-06-17T12:00:00.000Z",
      seriesCount: 4,
      totalObservations: 40,
      methodological: { evaluatedEngines: 1 },
      isComplete: true,
    },
  };
  assertCase(
    "validate.profile.enrichedFieldsOptional",
    validateScientificProjectV2(enrichedProfile).ok === true
  );

  const badFile: DomainScientificProjectFile = {
    kind: PROJECT_KIND,
    schemaVersion: 2,
    appVersion: "0.1.0",
    exportedAt: "2026-01-01T00:00:00.000Z",
    project: badActive,
  };
  assertCase(
    "validate.file.v2.rejectsInvalidProject",
    validateDomainProjectFileV2(badFile).ok === false
  );
};

export const runValidateB13CaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);
  runValidateB13Cases(assertCase);
  return results;
};
