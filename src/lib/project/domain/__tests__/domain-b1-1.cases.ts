import { PROJECT_KIND } from "../../constants";
import {
  DOMAIN_SCHEMA_VERSION_V1,
  DOMAIN_SCHEMA_VERSION_V2,
  getDomainSchemaVersion,
  isDomainProjectFileV1,
  isDomainProjectFileV2,
  isScientificProjectV1,
  isScientificProjectV2,
  type DomainScientificProjectFile,
  type ScientificProjectV1,
  type ScientificProjectV2,
} from "..";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

const sampleV1: ScientificProjectV1 = {
  metadata: {
    id: "proj-v1",
    name: "V1 Sample",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  dataset: { series: [], info: null },
  importProvenance: { report: null, preserveAnalysisOnReimport: true },
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
      A: { label: "Slot A", profile: null },
      B: { label: "Slot B", profile: null },
    },
  },
  workspace: {
    activeSection: "data",
    inspectorSection: "statistics",
    enabledModules: {},
  },
  graphContext: null,
};

const sampleV2: ScientificProjectV2 = {
  metadata: sampleV1.metadata,
  datasets: [
    {
      id: "ds-1",
      label: "Dataset 1",
      series: [],
      info: null,
      importReport: null,
    },
  ],
  activeDatasetId: "ds-1",
  analysisConfig: sampleV1.analysisConfig,
  workflow: sampleV1.workflow,
  comparison: {
    slots: {
      A: { label: "Slot A", profile: null, sourceDatasetId: "ds-1" },
      B: { label: "Slot B", profile: null, sourceDatasetId: null },
    },
  },
  workspace: sampleV1.workspace,
  graphContext: null,
};

export const runDomainB11Cases = (
  assertCase: (id: string, pass: boolean, detail?: string) => void
): void => {
  assertCase("domain.v1.guard", isScientificProjectV1(sampleV1));
  assertCase("domain.v2.guard", isScientificProjectV2(sampleV2));
  assertCase(
    "domain.v1.notV2",
    isScientificProjectV1(sampleV1) && !isScientificProjectV2(sampleV1)
  );
  assertCase(
    "domain.v2.notV1",
    isScientificProjectV2(sampleV2) && !isScientificProjectV1(sampleV2)
  );
  assertCase(
    "domain.schemaVersion.v1",
    getDomainSchemaVersion(sampleV1) === DOMAIN_SCHEMA_VERSION_V1
  );
  assertCase(
    "domain.schemaVersion.v2",
    getDomainSchemaVersion(sampleV2) === DOMAIN_SCHEMA_VERSION_V2
  );

  const fileV1: DomainScientificProjectFile = {
    kind: PROJECT_KIND,
    schemaVersion: DOMAIN_SCHEMA_VERSION_V1,
    appVersion: "0.1.0",
    exportedAt: "2026-01-01T00:00:00.000Z",
    project: sampleV1,
  };
  const fileV2: DomainScientificProjectFile = {
    kind: PROJECT_KIND,
    schemaVersion: DOMAIN_SCHEMA_VERSION_V2,
    appVersion: "0.1.0",
    exportedAt: "2026-01-01T00:00:00.000Z",
    project: sampleV2,
  };

  assertCase("domain.file.v1", isDomainProjectFileV1(fileV1));
  assertCase("domain.file.v2", isDomainProjectFileV2(fileV2));
  assertCase(
    "domain.v2.profile.enrichedFieldsOptional",
    sampleV2.comparison.slots.A.profile === null
  );
};

export const runDomainB11CaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);
  runDomainB11Cases(assertCase);
  return results;
};
