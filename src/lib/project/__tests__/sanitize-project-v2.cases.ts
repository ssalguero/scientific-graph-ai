import { cloneScientificProjectV2 } from "@/lib/project/apply-hydrate-project-v2-patch";
import { toPrimaryDatasetId, toSequencedDatasetId } from "@/lib/project/domain";
import type { ScientificProjectV2 } from "@/lib/project/domain/types-v2";
import {
  sanitizeComparisonV2,
  sanitizeScientificProjectV2,
} from "@/lib/project/sanitize-project-v2";
import { validateScientificProjectV2 } from "@/lib/project/validate";
import { MODULE_KEYS_V1 } from "@/lib/project/keys";
import { GUIDED_WORKFLOW_IDLE_SESSION } from "@/lib/scientific/workflow/catalog";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

const PROJECT_ID = "00000000-0000-4000-8000-000000000044";
const PRIMARY_ID = toPrimaryDatasetId(PROJECT_ID);
const DATASET_B_ID = toSequencedDatasetId(PROJECT_ID, 2);

const buildDefaultEnabledModules = (): Record<string, boolean> =>
  Object.fromEntries(MODULE_KEYS_V1.map((key) => [key, true]));

const buildValidProject = (): ScientificProjectV2 => ({
  metadata: {
    id: PROJECT_ID,
    name: "Sanitize V2 test",
    createdAt: "2026-06-17T10:00:00.000Z",
    updatedAt: "2026-06-17T12:00:00.000Z",
  },
  datasets: [
    {
      id: PRIMARY_ID,
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
      id: DATASET_B_ID,
      label: "Dataset B",
      series: [
        {
          id: "s2",
          name: "Series B",
          color: "#dc3912",
          points: [{ x: 1, y: 5 }],
        },
      ],
      info: {
        fileName: "DatasetB.csv",
        importedAt: "2026-06-17T12:00:00.000Z",
        seriesCount: 1,
        observationCount: 1,
      },
      importReport: null,
    },
  ],
  activeDatasetId: DATASET_B_ID,
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
      A: { label: "Slot A", profile: null, sourceDatasetId: PRIMARY_ID },
      B: { label: "Slot B", profile: null, sourceDatasetId: DATASET_B_ID },
    },
  },
  workspace: {
    activeSection: "data",
    inspectorSection: "visualization",
    enabledModules: buildDefaultEnabledModules(),
    controlPanelTab: "data",
  },
  graphContext: {
    title: "Graph",
    curves: [{ expression: "x", color: "#000000" }],
    minX: -10,
    maxX: 10,
    visibleMinX: -10,
    visibleMaxX: 10,
    autoScaleY: false,
    useSecondaryYAxis: false,
  },
});

const cloneProject = (project: ScientificProjectV2): ScientificProjectV2 =>
  cloneScientificProjectV2(project);

export const runSanitizeProjectV2CaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  const valid = buildValidProject();
  const validClone = cloneProject(valid);
  const validSanitized = sanitizeScientificProjectV2(valid);
  assertCase(
    "sanitize.valid.unchanged",
    JSON.stringify(validSanitized.project) === JSON.stringify(validClone)
  );
  assertCase(
    "sanitize.valid.noWarnings",
    validSanitized.warnings.length === 0
  );

  const badActive = cloneProject(valid);
  badActive.activeDatasetId = "missing-active-id";
  const activeSanitized = sanitizeScientificProjectV2(badActive);
  assertCase(
    "sanitize.activeDatasetId.fallback",
    activeSanitized.project.activeDatasetId === PRIMARY_ID
  );
  assertCase(
    "sanitize.activeDatasetId.warning",
    activeSanitized.warnings.some((item) => item.code === "H-V2-ACTIVE")
  );

  const orphanSource = cloneProject(valid);
  orphanSource.comparison.slots.A.sourceDatasetId = "orphan-dataset-id";
  const sourceSanitized = sanitizeScientificProjectV2(orphanSource);
  assertCase(
    "sanitize.sourceDatasetId.cleared",
    sourceSanitized.project.comparison.slots.A.sourceDatasetId === null
  );
  assertCase(
    "sanitize.sourceDatasetId.profilePreserved",
    sourceSanitized.project.comparison.slots.B.sourceDatasetId === DATASET_B_ID
  );
  assertCase(
    "sanitize.sourceDatasetId.warning",
    sourceSanitized.warnings.some((item) => item.code === "H-V2-CMP-SOURCE")
  );

  const partialComparison = cloneProject(valid);
  partialComparison.comparison.slots.A.sourceDatasetId = "orphan-dataset-id";
  partialComparison.comparison.slots.A.label = "";
  const partialSanitized = sanitizeScientificProjectV2(partialComparison);
  assertCase(
    "sanitize.comparison.partiallyInvalid.fixed",
    partialSanitized.project.comparison.slots.A.sourceDatasetId === null &&
      partialSanitized.project.comparison.slots.A.label === "Slot A" &&
      partialSanitized.project.comparison.slots.B.sourceDatasetId === DATASET_B_ID
  );

  const badWorkspace = cloneProject(valid);
  badWorkspace.workspace.activeSection = "invalid-section" as "data";
  const workspaceSanitized = sanitizeScientificProjectV2(badWorkspace);
  assertCase(
    "sanitize.workspace.invalidSection",
    workspaceSanitized.project.workspace.activeSection === "data"
  );
  assertCase(
    "sanitize.workspace.warning",
    workspaceSanitized.warnings.some((item) => item.code === "H-WS-SECTION")
  );

  const badWorkflow = cloneProject(valid);
  badWorkflow.activeDatasetId = PRIMARY_ID;
  badWorkflow.workflow.session = {
    status: "active",
    templateId: "compare-groups",
    currentStepIndex: 999,
    completedStepIds: [],
    skippedStepIds: [],
    startedAt: "2026-06-17T12:00:00.000Z",
    completedAt: null,
  };
  badWorkflow.datasets[0] = {
    ...badWorkflow.datasets[0]!,
    series: [
      badWorkflow.datasets[0]!.series[0]!,
      {
        id: "s1b",
        name: "Series A2",
        color: "#3366cc",
        points: [{ x: 2, y: 11 }],
      },
    ],
  };
  const workflowSanitized = sanitizeScientificProjectV2(badWorkflow);
  assertCase(
    "sanitize.workflow.stepClamped",
    workflowSanitized.project.workflow.session.currentStepIndex === 6
  );
  assertCase(
    "sanitize.workflow.warning",
    workflowSanitized.warnings.some((item) => item.code === "H-WF-STEP")
  );

  const orphanSelection = cloneProject(valid);
  orphanSelection.analysisConfig.selections.tTestSeriesA = "missing-series";
  const selectionSanitized = sanitizeScientificProjectV2(orphanSelection);
  assertCase(
    "sanitize.selections.orphanCleared",
    selectionSanitized.project.analysisConfig.selections.tTestSeriesA === null
  );
  assertCase(
    "sanitize.selections.warning",
    selectionSanitized.warnings.some((item) => item.code === "H-SEL-ORPHAN")
  );

  const badGraph = cloneProject(valid);
  badGraph.graphContext = {
    title: " Graph ",
    curves: [{ expression: "  sin(x)  ", color: "#111111" }],
    minX: -10,
    maxX: 10,
    visibleMinX: -10,
    visibleMaxX: 10,
    autoScaleY: false,
    useSecondaryYAxis: false,
  };
  const graphSanitized = sanitizeScientificProjectV2(badGraph);
  assertCase(
    "sanitize.graphContext.curvesTrimmed",
    graphSanitized.project.graphContext?.curves[0]?.expression === "sin(x)"
  );

  const badVisualGraphs = cloneProject(valid);
  badVisualGraphs.visualGraphs = [
    {
      id: "vg-1",
      sourceDatasetId: "orphan-dataset-id",
      createdAt: "2026-06-17T12:00:00.000Z",
      graphSpec: {
        id: "vg-spec-1",
        createdAt: "2026-06-17T12:00:00.000Z",
        graphType: "scatter",
        xVariable: "s1",
        yVariable: "s1",
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
    {
      id: "vg-2",
      sourceDatasetId: PRIMARY_ID,
      createdAt: "2026-06-17T12:00:00.000Z",
      graphSpec: {
        id: "vg-spec-2",
        createdAt: "2026-06-17T12:00:00.000Z",
        graphType: "line",
        xVariable: "s1",
        yVariable: "s1",
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
  const visualSanitized = sanitizeScientificProjectV2(badVisualGraphs);
  assertCase(
    "sanitize.visualGraphs.invalidRemoved",
    visualSanitized.project.visualGraphs?.length === 1 &&
      visualSanitized.project.visualGraphs[0]?.sourceDatasetId === PRIMARY_ID
  );
  assertCase(
    "sanitize.visualGraphs.warning",
    visualSanitized.warnings.some((item) => item.code === "H-V2-VGB-SOURCE")
  );

  const once = sanitizeScientificProjectV2(orphanSource);
  const twice = sanitizeScientificProjectV2(once.project);
  assertCase(
    "sanitize.idempotent",
    JSON.stringify(once.project) === JSON.stringify(twice.project)
  );
  assertCase(
    "sanitize.idempotent.noExtraWarnings",
    twice.warnings.length === 0
  );

  const inconsistent = sanitizeScientificProjectV2(badActive).project;
  const validated = validateScientificProjectV2(inconsistent);
  assertCase(
    "sanitize.inconsistentBecomesValid",
    validated.ok === true
  );

  const frozen = Object.freeze(cloneProject(valid)) as ScientificProjectV2;
  const before = JSON.stringify(frozen);
  sanitizeScientificProjectV2(frozen);
  assertCase(
    "sanitize.immutable.input",
    JSON.stringify(frozen) === before
  );

  const datasetIds = new Set([PRIMARY_ID, DATASET_B_ID]);
  const warnings: { code: string }[] = [];
  const comparisonOnly = sanitizeComparisonV2(
    {
      slots: {
        A: { label: "A", profile: null, sourceDatasetId: "orphan" },
        B: { label: "B", profile: null, sourceDatasetId: DATASET_B_ID },
      },
    },
    datasetIds,
    warnings as never
  );
  assertCase(
    "sanitize.comparisonV2.helper",
    comparisonOnly.slots.A.sourceDatasetId === null &&
      comparisonOnly.slots.B.sourceDatasetId === DATASET_B_ID
  );

  return results;
};
