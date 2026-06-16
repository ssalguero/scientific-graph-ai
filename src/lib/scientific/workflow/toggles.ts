export type GuidedWorkflowToggleKey =
  | "showStatistics"
  | "showErrorBars"
  | "showNormality"
  | "showQQPlot"
  | "showCorrelation"
  | "showHeatmap"
  | "showPCA"
  | "showHierarchicalClustering"
  | "showMultivariateDashboard"
  | "showTTest"
  | "showAnova"
  | "showPostHoc"
  | "showNonParametric"
  | "showEffectSizePower"
  | "showConsistencyEngine"
  | "showReportQualityEngine"
  | "showReproducibilityExplorer"
  | "showEvidenceStrengthEngine"
  | "showAssumptionTracker"
  | "showPublicationReadinessAnalyzer"
  | "showMethodologicalDashboard"
  | "showPublicationDashboard"
  | "showStatisticalAdvisor"
  | "showScientificInterpretation"
  | "showScientificReport";

export type GuidedWorkflowToggleSetters = Record<
  GuidedWorkflowToggleKey,
  (value: boolean) => void
>;
