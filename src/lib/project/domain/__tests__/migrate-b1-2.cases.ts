import { readFileSync } from "node:fs";
import { join } from "node:path";

import { PROJECT_KIND } from "../../constants";
import {
  DOMAIN_SCHEMA_VERSION_V1,
  DOMAIN_SCHEMA_VERSION_V2,
  isScientificProjectV2,
  migrateDomainProjectFileToV2,
  migrateProjectToV2,
  migrateV1ToV2,
  toPrimaryDatasetId,
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

const loadV1FixtureFile = (fileName: string): DomainScientificProjectFile => {
  const text = readFileSync(join(FIXTURES_DIR, fileName), "utf8");
  return JSON.parse(text) as DomainScientificProjectFile;
};

const sampleV1WithProfile: ScientificProjectV1 = {
  metadata: {
    id: "proj-profile",
    name: "Profile sample",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  dataset: {
    series: [{ id: "s1", name: "S1", color: "#000", points: [{ x: 1, y: 2 }] }],
    info: {
      fileName: "sample.csv",
      importedAt: "2026-01-01T00:00:00.000Z",
      seriesCount: 1,
      observationCount: 1,
    },
  },
  importProvenance: {
    report: null,
    preserveAnalysisOnReimport: true,
  },
  analysisConfig: {
    visibility: { showStatistics: true },
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
      tTestSeriesA: "s1",
      tTestSeriesB: null,
      mannWhitneySeriesA: null,
      mannWhitneySeriesB: null,
    },
    legend: { hiddenKeys: ["k1"] },
  },
  workflow: {
    session: {
      status: "active",
      templateId: "compare-groups",
      currentStepIndex: 1,
      completedStepIds: ["step-1"],
      skippedStepIds: [],
      startedAt: "2026-01-01T00:00:00.000Z",
      completedAt: null,
    },
  },
  comparison: {
    slots: {
      A: {
        label: "Slot A",
        profile: {
          slotLabel: "A",
          datasetInfo: {
            fileName: "sample.csv",
            importedAt: "2026-01-01T00:00:00.000Z",
            seriesCount: 1,
            observationCount: 1,
          },
          capturedAt: "2026-01-01T00:00:00.000Z",
          seriesCount: 1,
          totalObservations: 1,
          isComplete: true,
        },
      },
      B: { label: "Slot B", profile: null },
    },
  },
  workspace: {
    activeSection: "analysis",
    inspectorSection: "statistics",
    enabledModules: { statistics: true },
  },
  graphContext: null,
};

export const runMigrateB12Cases = (
  assertCase: (id: string, pass: boolean, detail?: string) => void
): void => {
  const emptyV1 = loadV1FixtureProject("project-v1-empty.sgproj");
  const dataset5V1 = loadV1FixtureProject("project-v1-dataset5-minimal.sgproj");
  const primaryEmptyId = toPrimaryDatasetId(emptyV1.metadata.id);
  const primaryDataset5Id = toPrimaryDatasetId(dataset5V1.metadata.id);

  const emptyMigrated = migrateV1ToV2(emptyV1);
  assertCase(
    "migrate.v1.empty.datasets",
    emptyMigrated.project.datasets.length === 1 &&
      emptyMigrated.project.datasets[0].series.length === 0
  );
  assertCase(
    "migrate.v1.empty.activeDatasetId",
    emptyMigrated.project.activeDatasetId === primaryEmptyId &&
      emptyMigrated.project.datasets[0].id === primaryEmptyId
  );
  assertCase(
    "migrate.v1.empty.importFolded",
    emptyMigrated.project.datasets[0].importReport === null &&
      emptyMigrated.project.datasets[0].preserveAnalysisOnReimport === false
  );
  assertCase(
    "migrate.v1.empty.analysisConfig",
    emptyMigrated.project.analysisConfig.modes.regressionModel === "none" &&
      emptyMigrated.project.analysisConfig.selections.tTestSeriesA === null
  );

  const dataset5Migrated = migrateV1ToV2(dataset5V1);
  assertCase(
    "migrate.v1.dataset5.series",
    dataset5Migrated.project.datasets[0].series.length === 4 &&
      dataset5Migrated.project.datasets[0].series[0].id === "d5-control1"
  );
  assertCase(
    "migrate.v1.dataset5.selections",
    dataset5Migrated.project.analysisConfig.selections.tTestSeriesA ===
      "d5-control1" &&
      dataset5Migrated.project.analysisConfig.selections.tTestSeriesB ===
        "d5-tratamiento1"
  );
  assertCase(
    "migrate.v1.dataset5.info",
    dataset5Migrated.project.datasets[0].info?.fileName === "Dataset5.csv" &&
      dataset5Migrated.project.activeDatasetId === primaryDataset5Id
  );

  const profileMigrated = migrateV1ToV2(sampleV1WithProfile);
  const profilePrimaryId = toPrimaryDatasetId(sampleV1WithProfile.metadata.id);
  assertCase(
    "migrate.v1.profile.sourceDatasetId",
    profileMigrated.project.comparison.slots.A.sourceDatasetId ===
      profilePrimaryId &&
      profileMigrated.project.comparison.slots.A.profile?.slotLabel === "A" &&
      profileMigrated.project.comparison.slots.B.sourceDatasetId === null
  );
  assertCase(
    "migrate.v1.profile.preserveAnalysis",
    profileMigrated.project.datasets[0].preserveAnalysisOnReimport === true
  );

  const emptyFile = loadV1FixtureFile("project-v1-empty.sgproj");
  const migratedFile = migrateDomainProjectFileToV2(emptyFile);
  assertCase(
    "migrate.file.schemaVersion",
    migratedFile.file.schemaVersion === DOMAIN_SCHEMA_VERSION_V2 &&
      isScientificProjectV2(migratedFile.file.project)
  );
  assertCase(
    "migrate.file.revisionHistory",
    isScientificProjectV2(migratedFile.file.project) &&
      (migratedFile.file.project.metadata.revisionHistory?.length ?? 0) === 1 &&
      migratedFile.file.project.metadata.revisionHistory?.[0]?.schemaVersion ===
        DOMAIN_SCHEMA_VERSION_V2
  );
  assertCase(
    "migrate.file.warnings",
    migratedFile.warnings.some((item) => item.code === "MIG-V1-IMPORT-FOLD")
  );

  const v2Project = migratedFile.file.project;
  const idempotentProject = migrateProjectToV2(v2Project);
  assertCase(
    "migrate.idempotent.project",
    idempotentProject.project === v2Project &&
      idempotentProject.warnings.length === 0
  );

  const v2File: DomainScientificProjectFile = {
    kind: PROJECT_KIND,
    schemaVersion: DOMAIN_SCHEMA_VERSION_V2,
    appVersion: "0.1.0",
    exportedAt: "2026-01-01T00:00:00.000Z",
    project: v2Project,
  };
  const idempotentFile = migrateDomainProjectFileToV2(v2File);
  assertCase(
    "migrate.idempotent.file",
    idempotentFile.file === v2File && idempotentFile.warnings.length === 0
  );

  const roundTripJson = JSON.stringify(migratedFile.file);
  const reparsed = JSON.parse(roundTripJson) as {
    project: ScientificProjectV2;
  };
  assertCase(
    "migrate.roundtrip.json",
    reparsed.project.datasets[0].series.length === 0 &&
      reparsed.project.activeDatasetId === primaryEmptyId
  );

  assertCase(
    "migrate.v1.notV2Before",
    !("datasets" in emptyV1) && "dataset" in emptyV1
  );
  assertCase(
    "migrate.v2.notV1After",
    isScientificProjectV2(emptyMigrated.project) &&
      !("dataset" in emptyMigrated.project)
  );
};

export const runMigrateB12CaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);
  runMigrateB12Cases(assertCase);
  return results;
};
