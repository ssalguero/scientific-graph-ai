import {
  VISIBILITY_KEYS_V1,
  type VisibilityKeyV1,
} from "@/lib/project/keys";

import type {
  ToggleCategory,
  ToggleRegistryEntry,
  VisibilityToggleKey,
  VisibilityToggleRegistry,
} from "./types";

const entry = (config: ToggleRegistryEntry): ToggleRegistryEntry => config;

const GRAPH_MATH_KEYS = new Set<VisibilityKeyV1>([
  "showDerivative",
  "showIntegral",
  "showIntersections",
  "showCriticalPoints",
  "showRoots",
]);

const DESCRIPTIVE_KEYS = new Set<VisibilityKeyV1>([
  "showStatistics",
  "showErrorBars",
  "showCorrelation",
  "showOutliers",
  "showHistogram",
  "showBoxPlot",
  "showNormality",
  "showQQPlot",
  "showViolinPlot",
  "showHeatmap",
  "showBubblePlot",
  "showRadarPlot",
  "showKernelDensity",
  "showForestPlot",
]);

const MULTIVARIATE_KEYS = new Set<VisibilityKeyV1>([
  "showPCA",
  "showScatterMatrix",
  "showParallelCoordinates",
  "showCorrelationNetwork",
  "showMDS",
  "showDistanceMatrix",
  "showSimilarityNetwork",
  "showVariableImportance",
  "showClusterHeatmap",
  "showClusteredDistanceHeatmap",
  "showManovaExplorer",
  "showLdaExplorer",
  "showCanonicalCorrelationExplorer",
  "showPcrExplorer",
  "showPlsExplorer",
  "showBootstrapExplorer",
  "showSensitivityExplorer",
  "showTsneExplorer",
  "showUmapExplorer",
  "showHierarchicalClustering",
]);

const INFERENCE_KEYS = new Set<VisibilityKeyV1>([
  "showTTest",
  "showAnova",
  "showPostHoc",
  "showNonParametric",
  "showEffectSizePower",
]);

const REPORT_KEYS = new Set<VisibilityKeyV1>([
  "showStatisticalAdvisor",
  "showScientificInterpretation",
  "showScientificReport",
  "showScientificAssistant",
]);

const inferCategory = (key: VisibilityKeyV1): ToggleCategory => {
  if (GRAPH_MATH_KEYS.has(key)) return "graph-math";
  if (DESCRIPTIVE_KEYS.has(key)) return "descriptive";
  if (MULTIVARIATE_KEYS.has(key)) return "multivariate";
  if (INFERENCE_KEYS.has(key)) return "inference";
  if (REPORT_KEYS.has(key)) return "report";
  if (
    key === "showMultivariateDashboard" ||
    key === "showMultiDatasetComparison" ||
    key === "showMethodologicalDashboard" ||
    key === "showPublicationDashboard"
  ) {
    return "dashboard";
  }
  return "methodology";
};

const inferWorkspaceTab = (
  key: VisibilityKeyV1
): ToggleRegistryEntry["workspaceTab"] => {
  if (GRAPH_MATH_KEYS.has(key)) return "analysis";
  if (REPORT_KEYS.has(key)) {
    return key === "showScientificReport" ? "reports" : "results";
  }
  if (key === "showStatisticalAdvisor") return "analysis";
  return "results";
};

const inferPdfExportPolicy = (
  key: VisibilityKeyV1
): ToggleRegistryEntry["pdfExportPolicy"] => {
  if (GRAPH_MATH_KEYS.has(key)) return "never";
  return "when-visible";
};

const toPdfSectionId = (key: VisibilityKeyV1): string =>
  key.replace(/^show/, "panel-").replace(/([A-Z])/g, "-$1").toLowerCase();

const CORE_ENTRIES: Partial<Record<VisibilityKeyV1, ToggleRegistryEntry>> = {
  showConsistencyEngine: entry({
    key: "showConsistencyEngine",
    category: "methodology",
    defaultVisible: false,
    sciId: "SCI-50",
    inspectorGroup: "Metodología y publicación",
    workspaceTab: "results",
    pdfExportPolicy: "when-visible",
    pdfSectionIds: ["sci-50-consistency"],
  }),
  showReportQualityEngine: entry({
    key: "showReportQualityEngine",
    category: "methodology",
    defaultVisible: false,
    sciId: "SCI-51",
    inspectorGroup: "Metodología y publicación",
    workspaceTab: "results",
    pdfExportPolicy: "when-visible",
    pdfSectionIds: ["sci-51-report-quality"],
  }),
  showReproducibilityExplorer: entry({
    key: "showReproducibilityExplorer",
    category: "methodology",
    defaultVisible: false,
    sciId: "SCI-52",
    inspectorGroup: "Metodología y publicación",
    workspaceTab: "results",
    pdfExportPolicy: "when-visible",
    pdfSectionIds: ["sci-52-reproducibility"],
  }),
  showEvidenceStrengthEngine: entry({
    key: "showEvidenceStrengthEngine",
    category: "methodology",
    defaultVisible: false,
    sciId: "SCI-53",
    inspectorGroup: "Metodología y publicación",
    workspaceTab: "results",
    pdfExportPolicy: "when-visible",
    pdfSectionIds: ["sci-53-evidence"],
  }),
  showAssumptionTracker: entry({
    key: "showAssumptionTracker",
    category: "methodology",
    defaultVisible: false,
    sciId: "SCI-54",
    inspectorGroup: "Inferencia avanzada",
    workspaceTab: "results",
    pdfExportPolicy: "when-visible",
    pdfSectionIds: ["sci-54-assumptions"],
  }),
  showPublicationReadinessAnalyzer: entry({
    key: "showPublicationReadinessAnalyzer",
    category: "methodology",
    defaultVisible: false,
    sciId: "SCI-55",
    inspectorGroup: "Metodología y publicación",
    workspaceTab: "results",
    pdfExportPolicy: "when-visible",
    pdfSectionIds: ["sci-55-readiness"],
  }),
  showMethodologicalDashboard: entry({
    key: "showMethodologicalDashboard",
    category: "dashboard",
    defaultVisible: false,
    sciId: "SCI-56",
    inspectorGroup: "Dashboards",
    workspaceTab: "results",
    pdfExportPolicy: "when-visible",
    pdfSectionIds: ["sci-56-methodological-dashboard"],
  }),
  showPublicationDashboard: entry({
    key: "showPublicationDashboard",
    category: "dashboard",
    defaultVisible: false,
    sciId: "SCI-60",
    inspectorGroup: "Dashboards",
    workspaceTab: "results",
    pdfExportPolicy: "when-visible",
    pdfSectionIds: ["sci-60-publication-dashboard"],
  }),
  showMultivariateDashboard: entry({
    key: "showMultivariateDashboard",
    category: "dashboard",
    defaultVisible: false,
    sciId: "SCI-40",
    inspectorGroup: "Dashboards",
    workspaceTab: "results",
    pdfExportPolicy: "when-visible",
    pdfSectionIds: ["sci-40-multivariate-dashboard"],
  }),
  showMultiDatasetComparison: entry({
    key: "showMultiDatasetComparison",
    category: "dashboard",
    defaultVisible: false,
    sciId: "SCI-58",
    inspectorGroup: "Dashboards",
    workspaceTab: "results",
    pdfExportPolicy: "when-visible",
    pdfSectionIds: ["sci-58-comparison-dashboard"],
  }),
  showEffectSizePower: entry({
    key: "showEffectSizePower",
    category: "inference",
    defaultVisible: false,
    sciId: "SCI-57",
    inspectorGroup: "Inferencia avanzada",
    workspaceTab: "results",
    pdfExportPolicy: "when-visible",
    pdfSectionIds: ["sci-57-effect-size-power"],
  }),
  showStatisticalAdvisor: entry({
    key: "showStatisticalAdvisor",
    category: "report",
    defaultVisible: false,
    inspectorGroup: "Asistente",
    workspaceTab: "analysis",
    pdfExportPolicy: "when-visible",
    pdfSectionIds: ["scientific-advisor"],
  }),
  showScientificInterpretation: entry({
    key: "showScientificInterpretation",
    category: "report",
    defaultVisible: false,
    inspectorGroup: "Asistente",
    workspaceTab: "results",
    pdfExportPolicy: "when-visible",
    pdfSectionIds: ["scientific-interpretation"],
  }),
  showScientificReport: entry({
    key: "showScientificReport",
    category: "report",
    defaultVisible: false,
    inspectorGroup: "Reportes",
    workspaceTab: "reports",
    pdfExportPolicy: "when-visible",
    pdfSectionIds: ["scientific-report"],
  }),
};

const buildFallbackEntry = (key: VisibilityKeyV1): ToggleRegistryEntry => {
  const category = inferCategory(key);
  const pdfExportPolicy = inferPdfExportPolicy(key);

  return entry({
    key,
    category,
    defaultVisible: false,
    workspaceTab: inferWorkspaceTab(key),
    pdfExportPolicy,
    pdfSectionIds:
      pdfExportPolicy === "when-visible" ? [toPdfSectionId(key)] : undefined,
  });
};

const buildRegistry = (): VisibilityToggleRegistry => {
  const registry = {} as Record<VisibilityKeyV1, ToggleRegistryEntry>;

  for (const key of VISIBILITY_KEYS_V1) {
    registry[key] = CORE_ENTRIES[key] ?? buildFallbackEntry(key);
  }

  return registry;
};

export const VISIBILITY_TOGGLE_REGISTRY: VisibilityToggleRegistry = buildRegistry();

export const VISIBILITY_TOGGLE_KEYS = [...VISIBILITY_KEYS_V1] as VisibilityToggleKey[];

export const METHODOLOGY_REGISTRY_TOGGLE_KEYS = VISIBILITY_TOGGLE_KEYS.filter(
  (key) => VISIBILITY_TOGGLE_REGISTRY[key].category === "methodology"
);

export const getToggleRegistryEntry = (
  key: VisibilityToggleKey
): ToggleRegistryEntry => VISIBILITY_TOGGLE_REGISTRY[key];

export const isVisibilityToggleKey = (
  key: string
): key is VisibilityToggleKey =>
  (VISIBILITY_KEYS_V1 as readonly string[]).includes(key);
