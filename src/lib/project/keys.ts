/**
 * Persisted visibility toggle keys for ScientificProjectV1.analysisConfig.visibility.
 *
 * Audited against GraphEditor useState hooks and resetAnalysisSession() in page.tsx.
 * Includes math overlay toggles (not reset on import) and all SCI/analysis panels.
 */
export const VISIBILITY_KEYS_V1 = [
  "showDerivative",
  "showIntegral",
  "showIntersections",
  "showCriticalPoints",
  "showRoots",
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
  "showMultivariateDashboard",
  "showManovaExplorer",
  "showLdaExplorer",
  "showCanonicalCorrelationExplorer",
  "showPcrExplorer",
  "showPlsExplorer",
  "showBootstrapExplorer",
  "showSensitivityExplorer",
  "showTsneExplorer",
  "showUmapExplorer",
  "showConsistencyEngine",
  "showReportQualityEngine",
  "showReproducibilityExplorer",
  "showEvidenceStrengthEngine",
  "showAssumptionTracker",
  "showPublicationReadinessAnalyzer",
  "showMethodologicalDashboard",
  "showPublicationDashboard",
  "showMultiDatasetComparison",
  "showHierarchicalClustering",
  "showTTest",
  "showAnova",
  "showPostHoc",
  "showNonParametric",
  "showEffectSizePower",
  "showStatisticalAdvisor",
  "showScientificReport",
  "showScientificInterpretation",
  "showScientificAssistant",
] as const;

export type VisibilityKeyV1 = (typeof VISIBILITY_KEYS_V1)[number];

/** Module gate keys aligned with SCIENTIFIC_MODULES in page.tsx. */
export const MODULE_KEYS_V1 = [
  "basic",
  "mathematics",
  "statistics",
  "inference",
  "assistant",
  "reports",
] as const;

export type ModuleKeyV1 = (typeof MODULE_KEYS_V1)[number];

/** SCI-59 workflow toggles — must be a subset of VISIBILITY_KEYS_V1. */
export const GUIDED_WORKFLOW_TOGGLE_KEYS_V1 = [
  "showStatistics",
  "showErrorBars",
  "showNormality",
  "showQQPlot",
  "showCorrelation",
  "showHeatmap",
  "showPCA",
  "showHierarchicalClustering",
  "showMultivariateDashboard",
  "showTTest",
  "showAnova",
  "showPostHoc",
  "showNonParametric",
  "showEffectSizePower",
  "showConsistencyEngine",
  "showReportQualityEngine",
  "showReproducibilityExplorer",
  "showEvidenceStrengthEngine",
  "showAssumptionTracker",
  "showPublicationReadinessAnalyzer",
  "showMethodologicalDashboard",
  "showPublicationDashboard",
  "showStatisticalAdvisor",
  "showScientificInterpretation",
  "showScientificReport",
] as const satisfies readonly VisibilityKeyV1[];

export const ANALYSIS_MODE_KEYS_V1 = [
  "regressionModel",
  "errorBarMode",
  "correlationMethod",
  "outlierMethod",
  "heatmapMode",
  "nonParametricMode",
  "histogramBins",
  "axisScaleMode",
  "naturalLanguageEnabled",
] as const;

export const SELECTION_KEYS_V1 = [
  "tTestSeriesA",
  "tTestSeriesB",
  "mannWhitneySeriesA",
  "mannWhitneySeriesB",
] as const;
