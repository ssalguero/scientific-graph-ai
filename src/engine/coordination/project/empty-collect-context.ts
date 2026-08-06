/**
 * Minimal empty editor collect context for Product Flow create (no UX / science package imports).
 * Mirrors the idle defaults used by GraphEditor "new project" without pulling React or
 * science workflow catalog modules into ENGINE.
 */

import type { ProjectCollectContext } from "../../business/project/types";

const IDLE_GUIDED_WORKFLOW_SESSION = {
  status: "idle",
  templateId: null,
  currentStepIndex: 0,
  completedStepIds: [] as string[],
  skippedStepIds: [] as string[],
  startedAt: null,
  completedAt: null,
} as const;

const DEFAULT_MODES = {
  regressionModel: "linear",
  errorBarMode: "sd",
  correlationMethod: "pearson",
  outlierMethod: "iqr",
  heatmapMode: "correlation",
  nonParametricMode: "mann-whitney",
  histogramBins: 10,
  axisScaleMode: "linear",
  naturalLanguageEnabled: false,
} as const;

const DEFAULT_SELECTIONS = {
  tTestSeriesA: null,
  tTestSeriesB: null,
  mannWhitneySeriesA: null,
  mannWhitneySeriesB: null,
} as const;

const DEFAULT_WORKSPACE = {
  activeSection: "data",
  inspectorSection: "visualization",
  enabledModules: {},
  controlPanelTab: "data",
} as const;

/** Default untitled name — aligned with `@/lib/project` DEFAULT_PROJECT_NAME. */
export const ENGINE_DEFAULT_PROJECT_NAME = "Proyecto sin título";

export type EmptyCollectContextOptions = {
  readonly id?: string;
  readonly name?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
};

/**
 * Build an empty ProjectCollectContext suitable for saveLocalProject / create.
 */
export function buildEmptyProjectCollectContext(
  options: EmptyCollectContextOptions = {},
): ProjectCollectContext {
  const now = new Date().toISOString();
  const id = options.id ?? crypto.randomUUID();
  const name =
    (options.name?.trim() || ENGINE_DEFAULT_PROJECT_NAME).trim() ||
    ENGINE_DEFAULT_PROJECT_NAME;
  const createdAt = options.createdAt ?? now;
  const updatedAt = options.updatedAt ?? now;

  return {
    metadata: { id, name, createdAt, updatedAt },
    experimentalSeries: [],
    currentDatasetInfo: null,
    lastImportReport: null,
    preserveAnalysisConfiguration: true,
    visibility: {},
    modes: { ...DEFAULT_MODES },
    selections: { ...DEFAULT_SELECTIONS },
    hiddenLegendKeys: [],
    guidedWorkflowSession: { ...IDLE_GUIDED_WORKFLOW_SESSION },
    comparisonSlots: {
      A: { label: "Slot A", profile: null, sourceDatasetId: null },
      B: { label: "Slot B", profile: null, sourceDatasetId: null },
    },
    workspace: { ...DEFAULT_WORKSPACE, enabledModules: {} },
    title: "",
    minX: -10,
    maxX: 10,
    visibleMinX: -10,
    visibleMaxX: 10,
    autoScaleY: false,
    useSecondaryYAxis: false,
    curves: [{ expression: "", color: "#3b82f6" }],
    sessionDatasets: [],
    activeDatasetId: null,
    worksheetModified: false,
  };
}
