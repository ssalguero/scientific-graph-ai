import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { ExperimentalSeries } from "@/lib/experimentalData";
import {
  applyHydrateProjectV2Patch,
  buildHydrateProjectV2Patch,
} from "@/lib/project/apply-hydrate-project-v2-patch";
import { collectProjectSnapshotV2 } from "@/lib/project/collect-project-snapshot-v2";
import { CURRENT_SCHEMA_VERSION, SCHEMA_VERSION_V2 } from "@/lib/project/constants";
import type {
  EditorProjectApplyContextV2,
} from "@/lib/project/editor-hydrate-context-v2";
import type { EditorProjectCollectContextV2 } from "@/lib/project/editor-collect-context-v2";
import { toPrimaryDatasetId } from "@/lib/project/domain";
import type { ScientificProjectV2 } from "@/lib/project/domain/types-v2";
import { hydrateProjectJson, serializeProjectV2, validateScientificProjectV2 } from "@/lib/project";
import { sanitizeScientificProjectV2 } from "@/lib/project/sanitize-project-v2";
import { VISIBILITY_KEYS_V1 } from "@/lib/project/keys";
import {
  PRODUCT_SCREEN_IDS,
  type ProductScreenId,
  resolvePersistedProductScreen,
} from "@/lib/product-navigation";
import { GUIDED_WORKFLOW_IDLE_SESSION } from "@/lib/scientific/workflow/catalog";
import type { GuidedWorkflowSession } from "@/lib/scientific/workflow/types";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

const PROJECT_ID = "00000000-0000-4000-8000-000000000011";
const PRIMARY_ID = toPrimaryDatasetId(PROJECT_ID);
const FIXTURES_DIR = join(process.cwd(), "scripts", "fixtures");
const APP_VERSION = "0.1.0";
const EXPORTED_AT = "2026-08-31T15:00:00.000Z";

const SAMPLE_SERIES: ExperimentalSeries[] = [
  {
    id: "s1",
    name: "Series A",
    color: "#3366cc",
    points: [{ x: 1, y: 10 }, { x: 2, y: 20 }],
  },
];

const ACTIVE_WORKFLOW: GuidedWorkflowSession = {
  status: "active",
  templateId: "compare-groups",
  currentStepIndex: 1,
  completedStepIds: ["describe"],
  skippedStepIds: [],
  startedAt: "2026-08-31T12:00:00.000Z",
  completedAt: null,
};

const COMPAT_SECTION: Record<
  ProductScreenId,
  EditorProjectCollectContextV2["workspace"]["activeSection"]
> = {
  home: "data",
  importar: "data",
  comparar: "data",
  graph: "data",
  vgb: "data",
  analizar: "analysis",
  "evaluar-metodologia": "analysis",
  results: "results",
  reports: "reports",
};

const buildCollectContext = (
  overrides?: Partial<EditorProjectCollectContextV2>
): EditorProjectCollectContextV2 => ({
  metadata: {
    id: PROJECT_ID,
    name: "R11 persist test",
    createdAt: "2026-08-31T10:00:00.000Z",
    updatedAt: "2026-08-31T12:00:00.000Z",
  },
  experimentalSeries: SAMPLE_SERIES,
  currentDatasetInfo: {
    fileName: "DatasetA.csv",
    importedAt: "2026-08-31T12:00:00.000Z",
    seriesCount: 1,
    observationCount: 2,
  },
  lastImportReport: null,
  preserveAnalysisConfiguration: true,
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
  hiddenLegendKeys: [],
  guidedWorkflowSession: GUIDED_WORKFLOW_IDLE_SESSION,
  comparisonSlots: {
    A: { label: "Slot A", profile: null, sourceDatasetId: PRIMARY_ID },
    B: { label: "Slot B", profile: null, sourceDatasetId: null },
  },
  workspace: {
    activeSection: "data",
    inspectorSection: "visualization",
    enabledModules: {},
    controlPanelTab: "data",
  },
  title: "Graph title",
  minX: -5,
  maxX: 15,
  visibleMinX: -2,
  visibleMaxX: 12,
  autoScaleY: true,
  useSecondaryYAxis: false,
  curves: [{ expression: "x^2", color: "#ff0000" }],
  sessionDatasets: [],
  activeDatasetId: PRIMARY_ID,
  ...overrides,
});

const createApplyCapture = () => {
  let productScreen: ProductScreenId | null = null;
  let workflow: GuidedWorkflowSession | null = null;
  const apply: EditorProjectApplyContextV2 = {
    setProjectMetadata: () => undefined,
    setExperimentalSeries: () => undefined,
    setCurrentDatasetInfo: () => undefined,
    setLastImportReport: () => undefined,
    setPreserveAnalysisConfiguration: () => undefined,
    setSessionDatasets: () => undefined,
    setActiveDatasetId: () => undefined,
    setProjectVisualGraphs: () => undefined,
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
    setGuidedWorkflowSession: (value) => {
      workflow = value;
    },
    setComparisonSlots: () => undefined,
    setActiveWorkspaceSection: () => undefined,
    setProductScreen: (value) => {
      productScreen = value;
    },
    setAnalysisInspectorSection: () => undefined,
    setEnabledModules: () => undefined,
    setControlPanelTab: () => undefined,
    visibilitySetters: Object.fromEntries(
      VISIBILITY_KEYS_V1.map((key) => [key, () => undefined])
    ) as EditorProjectApplyContextV2["visibilitySetters"],
    clearEphemeralUiState: () => undefined,
    assignNextCurveIds: () => undefined,
    generateGraph: () => undefined,
  };
  return {
    apply,
    get productScreen() {
      return productScreen;
    },
    get workflow() {
      return workflow;
    },
  };
};

const restoreScreen = (snapshot: ScientificProjectV2): ProductScreenId | null => {
  const capture = createApplyCapture();
  applyHydrateProjectV2Patch(buildHydrateProjectV2Patch(snapshot), capture.apply);
  return capture.productScreen;
};

const collectForScreen = (screen: ProductScreenId): ScientificProjectV2 =>
  collectProjectSnapshotV2(
    buildCollectContext({
      workspace: {
        activeSection: COMPAT_SECTION[screen],
        inspectorSection:
          screen === "evaluar-metodologia" ? "statistics" : "visualization",
        enabledModules: {},
        controlPanelTab: screen === "graph" ? "graph" : "data",
        productScreen: screen,
      },
    })
  );

export const runR11ProductScreenPersistCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  assertCase(
    "r11.schema.remains-v2",
    CURRENT_SCHEMA_VERSION === SCHEMA_VERSION_V2 && CURRENT_SCHEMA_VERSION === 2
  );

  const compararSnapshot = collectForScreen("comparar");
  const serialized = serializeProjectV2({
    project: compararSnapshot,
    appVersion: APP_VERSION,
    exportedAt: EXPORTED_AT,
    options: { includeChecksum: false, pretty: false },
  });
  assertCase("r11.serialize.ok", serialized.ok === true);
  const serializedJson = serialized.ok ? serialized.json : "";
  assertCase(
    "r11.serialize.schemaVersion-2",
    serialized.ok && JSON.parse(serializedJson).schemaVersion === 2
  );
  assertCase(
    "r11.serialize.productScreen-comparar",
    serialized.ok &&
      JSON.parse(serializedJson).project.workspace.productScreen === "comparar" &&
      JSON.parse(serializedJson).project.workspace.activeSection === "data"
  );
  assertCase(
    "r11.serialize.no-dom-host-ids",
    !/workspace-panel-|role="tabpanel"|#workspace-panel/.test(serializedJson)
  );

  const loaded = serialized.ok ? hydrateProjectJson(serializedJson) : { ok: false as const };
  assertCase("r11.deserialize.ok", loaded.ok === true);
  if (loaded.ok) {
    assertCase(
      "r11.deserialize.productScreen",
      loaded.patch.project.workspace.productScreen === "comparar"
    );
    const capture = createApplyCapture();
    applyHydrateProjectV2Patch(loaded.patch, capture.apply);
    assertCase("r11.restore.comparar", capture.productScreen === "comparar");
  }

  const validation = validateScientificProjectV2(compararSnapshot);
  assertCase("r11.validation.valid-productScreen", validation.ok === true);

  const invalid = structuredClone(compararSnapshot);
  (invalid.workspace as { productScreen?: string }).productScreen = "wizard";
  const invalidValidation = validateScientificProjectV2(invalid);
  assertCase(
    "r11.validation.invalid-productScreen-fails",
    invalidValidation.ok === false &&
      invalidValidation.errors.some((item) => item.code === "V2-WS-PRODUCT-SCREEN")
  );

  const sanitizedInvalid = sanitizeScientificProjectV2(invalid);
  assertCase(
    "r11.sanitize.invalid-productScreen-omitted",
    sanitizedInvalid.project.workspace.productScreen === undefined &&
      sanitizedInvalid.warnings.some((item) => item.code === "H-WS-PRODUCT-SCREEN")
  );

  for (const screen of PRODUCT_SCREEN_IDS) {
    const snapshot = collectForScreen(screen);
    assertCase(
      `r11.persist.${screen}`,
      snapshot.workspace.productScreen === screen &&
        snapshot.workspace.activeSection === COMPAT_SECTION[screen]
    );
    assertCase(`r11.restore.${screen}`, restoreScreen(snapshot) === screen);
  }

  assertCase(
    "r11.fallback.data-without-screen-is-importar",
    resolvePersistedProductScreen({
      activeSection: "data",
      controlPanelTab: "data",
    }) === "importar" &&
      restoreScreen(
        collectProjectSnapshotV2(
          buildCollectContext({
            workspace: {
              activeSection: "data",
              inspectorSection: "visualization",
              enabledModules: {},
              controlPanelTab: "data",
            },
          })
        )
      ) === "importar"
  );
  assertCase(
    "r11.fallback.data-graph-tab-is-graph",
    resolvePersistedProductScreen({
      activeSection: "data",
      controlPanelTab: "graph",
    }) === "graph"
  );
  assertCase(
    "r11.fallback.analysis-without-screen-is-analizar",
    resolvePersistedProductScreen({ activeSection: "analysis" }) === "analizar" &&
      restoreScreen(
        collectProjectSnapshotV2(
          buildCollectContext({
            workspace: {
              activeSection: "analysis",
              inspectorSection: "statistics",
              enabledModules: {},
              controlPanelTab: "data",
            },
          })
        )
      ) === "analizar"
  );
  assertCase(
    "r11.fallback.does-not-invent-comparar-or-evaluar",
    resolvePersistedProductScreen({ activeSection: "data" }) !== "comparar" &&
      resolvePersistedProductScreen({ activeSection: "data" }) !== "vgb" &&
      resolvePersistedProductScreen({ activeSection: "analysis" }) !==
        "evaluar-metodologia"
  );
  assertCase(
    "r11.fallback.results-reports-1to1",
    resolvePersistedProductScreen({ activeSection: "results" }) === "results" &&
      resolvePersistedProductScreen({ activeSection: "reports" }) === "reports"
  );

  const emptyFixture = readFileSync(
    join(FIXTURES_DIR, "project-v2-empty.sgproj"),
    "utf8"
  );
  const emptyHydrated = hydrateProjectJson(emptyFixture);
  assertCase("r11.compat.v2-fixture-loadable", emptyHydrated.ok === true);
  if (emptyHydrated.ok) {
    assertCase(
      "r11.compat.v2-fixture-no-productScreen",
      emptyHydrated.patch.project.workspace.productScreen === undefined
    );
    const capture = createApplyCapture();
    applyHydrateProjectV2Patch(emptyHydrated.patch, capture.apply);
    assertCase(
      "r11.compat.v2-fixture-fallback-importar",
      capture.productScreen === "importar"
    );
  }

  const v1Fixture = readFileSync(
    join(FIXTURES_DIR, "project-v1-empty.sgproj"),
    "utf8"
  );
  const v1Hydrated = hydrateProjectJson(v1Fixture);
  assertCase("r11.compat.v1-fixture-loadable", v1Hydrated.ok === true);
  if (v1Hydrated.ok) {
    assertCase(
      "r11.compat.v1-no-fabricated-productScreen",
      v1Hydrated.patch.project.workspace.productScreen === undefined
    );
  }

  const workflowSnapshot = collectProjectSnapshotV2(
    buildCollectContext({
      guidedWorkflowSession: ACTIVE_WORKFLOW,
      workspace: {
        activeSection: "data",
        inspectorSection: "visualization",
        enabledModules: {},
        controlPanelTab: "data",
        productScreen: "comparar",
      },
    })
  );
  assertCase(
    "r11.workflow.session-persisted",
    workflowSnapshot.workflow.session.status === "active" &&
      workflowSnapshot.workflow.session.templateId === "compare-groups" &&
      workflowSnapshot.workflow.session.currentStepIndex === 1 &&
      workflowSnapshot.workspace.productScreen === "comparar"
  );
  const workflowCapture = createApplyCapture();
  applyHydrateProjectV2Patch(
    buildHydrateProjectV2Patch(workflowSnapshot),
    workflowCapture.apply
  );
  assertCase(
    "r11.workflow.session-restored-distinct-from-screen",
    workflowCapture.workflow?.status === "active" &&
      workflowCapture.workflow.templateId === "compare-groups" &&
      workflowCapture.productScreen === "comparar"
  );

  assertCase(
    "r11.science.series-and-graph-survive",
    workflowSnapshot.datasets[0]?.series[0]?.points.length === 2 &&
      workflowSnapshot.graphContext?.curves[0]?.expression === "x^2" &&
      workflowSnapshot.analysisConfig.modes.regressionModel === "linear" &&
      workflowSnapshot.comparison.slots.A.sourceDatasetId === PRIMARY_ID
  );

  assertCase(
    "r11.restore.not-tab-router",
    resolvePersistedProductScreen({
      productScreen: "vgb",
      activeSection: "data",
      controlPanelTab: "data",
    }) === "vgb"
  );

  return results;
};
