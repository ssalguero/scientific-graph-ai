import type { VisibilityKeyV1 } from "@/lib/project";

export type EditorVisibilityBindingsInput = {
  showDerivative: boolean;
  setShowDerivative: (value: boolean) => void;
  showIntegral: boolean;
  setShowIntegral: (value: boolean) => void;
  showIntersections: boolean;
  setShowIntersections: (value: boolean) => void;
  showCriticalPoints: boolean;
  setShowCriticalPoints: (value: boolean) => void;
  showRoots: boolean;
  setShowRoots: (value: boolean) => void;
  showStatistics: boolean;
  setShowStatistics: (value: boolean) => void;
  showErrorBars: boolean;
  setShowErrorBars: (value: boolean) => void;
  showCorrelation: boolean;
  setShowCorrelation: (value: boolean) => void;
  showOutliers: boolean;
  setShowOutliers: (value: boolean) => void;
  showHistogram: boolean;
  setShowHistogram: (value: boolean) => void;
  showBoxPlot: boolean;
  setShowBoxPlot: (value: boolean) => void;
  showNormality: boolean;
  setShowNormality: (value: boolean) => void;
  showQQPlot: boolean;
  setShowQQPlot: (value: boolean) => void;
  showViolinPlot: boolean;
  setShowViolinPlot: (value: boolean) => void;
  showHeatmap: boolean;
  setShowHeatmap: (value: boolean) => void;
  showBubblePlot: boolean;
  setShowBubblePlot: (value: boolean) => void;
  showRadarPlot: boolean;
  setShowRadarPlot: (value: boolean) => void;
  showKernelDensity: boolean;
  setShowKernelDensity: (value: boolean) => void;
  showForestPlot: boolean;
  setShowForestPlot: (value: boolean) => void;
  showPCA: boolean;
  setShowPCA: (value: boolean) => void;
  showScatterMatrix: boolean;
  setShowScatterMatrix: (value: boolean) => void;
  showParallelCoordinates: boolean;
  setShowParallelCoordinates: (value: boolean) => void;
  showCorrelationNetwork: boolean;
  setShowCorrelationNetwork: (value: boolean) => void;
  showMDS: boolean;
  setShowMDS: (value: boolean) => void;
  showDistanceMatrix: boolean;
  setShowDistanceMatrix: (value: boolean) => void;
  showSimilarityNetwork: boolean;
  setShowSimilarityNetwork: (value: boolean) => void;
  showVariableImportance: boolean;
  setShowVariableImportance: (value: boolean) => void;
  showClusterHeatmap: boolean;
  setShowClusterHeatmap: (value: boolean) => void;
  showClusteredDistanceHeatmap: boolean;
  setShowClusteredDistanceHeatmap: (value: boolean) => void;
  showMultivariateDashboard: boolean;
  setShowMultivariateDashboard: (value: boolean) => void;
  showManovaExplorer: boolean;
  setShowManovaExplorer: (value: boolean) => void;
  showLdaExplorer: boolean;
  setShowLdaExplorer: (value: boolean) => void;
  showCanonicalCorrelationExplorer: boolean;
  setShowCanonicalCorrelationExplorer: (value: boolean) => void;
  showPcrExplorer: boolean;
  setShowPcrExplorer: (value: boolean) => void;
  showPlsExplorer: boolean;
  setShowPlsExplorer: (value: boolean) => void;
  showBootstrapExplorer: boolean;
  setShowBootstrapExplorer: (value: boolean) => void;
  showSensitivityExplorer: boolean;
  setShowSensitivityExplorer: (value: boolean) => void;
  showTsneExplorer: boolean;
  setShowTsneExplorer: (value: boolean) => void;
  showUmapExplorer: boolean;
  setShowUmapExplorer: (value: boolean) => void;
  showConsistencyEngine: boolean;
  setShowConsistencyEngine: (value: boolean) => void;
  showReportQualityEngine: boolean;
  setShowReportQualityEngine: (value: boolean) => void;
  showReproducibilityExplorer: boolean;
  setShowReproducibilityExplorer: (value: boolean) => void;
  showEvidenceStrengthEngine: boolean;
  setShowEvidenceStrengthEngine: (value: boolean) => void;
  showAssumptionTracker: boolean;
  setShowAssumptionTracker: (value: boolean) => void;
  showPublicationReadinessAnalyzer: boolean;
  setShowPublicationReadinessAnalyzer: (value: boolean) => void;
  showMethodologicalDashboard: boolean;
  setShowMethodologicalDashboard: (value: boolean) => void;
  showPublicationDashboard: boolean;
  setShowPublicationDashboard: (value: boolean) => void;
  showMultiDatasetComparison: boolean;
  setShowMultiDatasetComparison: (value: boolean) => void;
  showHierarchicalClustering: boolean;
  setShowHierarchicalClustering: (value: boolean) => void;
  showTTest: boolean;
  setShowTTest: (value: boolean) => void;
  showAnova: boolean;
  setShowAnova: (value: boolean) => void;
  showPostHoc: boolean;
  setShowPostHoc: (value: boolean) => void;
  showNonParametric: boolean;
  setShowNonParametric: (value: boolean) => void;
  showEffectSizePower: boolean;
  setShowEffectSizePower: (value: boolean) => void;
  showStatisticalAdvisor: boolean;
  setShowStatisticalAdvisor: (value: boolean) => void;
  showScientificReport: boolean;
  setShowScientificReport: (value: boolean) => void;
  showScientificInterpretation: boolean;
  setShowScientificInterpretation: (value: boolean) => void;
  showScientificAssistant: boolean;
  setShowScientificAssistant: (value: boolean) => void;
};

export type EditorVisibilityBindings = {
  state: Record<VisibilityKeyV1, boolean>;
  setters: Record<VisibilityKeyV1, (value: boolean) => void>;
};

export const buildEditorVisibilityBindings = (
  input: EditorVisibilityBindingsInput
): EditorVisibilityBindings => ({
  state: {
      showDerivative: input.showDerivative,
      showIntegral: input.showIntegral,
      showIntersections: input.showIntersections,
      showCriticalPoints: input.showCriticalPoints,
      showRoots: input.showRoots,
      showStatistics: input.showStatistics,
      showErrorBars: input.showErrorBars,
      showCorrelation: input.showCorrelation,
      showOutliers: input.showOutliers,
      showHistogram: input.showHistogram,
      showBoxPlot: input.showBoxPlot,
      showNormality: input.showNormality,
      showQQPlot: input.showQQPlot,
      showViolinPlot: input.showViolinPlot,
      showHeatmap: input.showHeatmap,
      showBubblePlot: input.showBubblePlot,
      showRadarPlot: input.showRadarPlot,
      showKernelDensity: input.showKernelDensity,
      showForestPlot: input.showForestPlot,
      showPCA: input.showPCA,
      showScatterMatrix: input.showScatterMatrix,
      showParallelCoordinates: input.showParallelCoordinates,
      showCorrelationNetwork: input.showCorrelationNetwork,
      showMDS: input.showMDS,
      showDistanceMatrix: input.showDistanceMatrix,
      showSimilarityNetwork: input.showSimilarityNetwork,
      showVariableImportance: input.showVariableImportance,
      showClusterHeatmap: input.showClusterHeatmap,
      showClusteredDistanceHeatmap: input.showClusteredDistanceHeatmap,
      showMultivariateDashboard: input.showMultivariateDashboard,
      showManovaExplorer: input.showManovaExplorer,
      showLdaExplorer: input.showLdaExplorer,
      showCanonicalCorrelationExplorer: input.showCanonicalCorrelationExplorer,
      showPcrExplorer: input.showPcrExplorer,
      showPlsExplorer: input.showPlsExplorer,
      showBootstrapExplorer: input.showBootstrapExplorer,
      showSensitivityExplorer: input.showSensitivityExplorer,
      showTsneExplorer: input.showTsneExplorer,
      showUmapExplorer: input.showUmapExplorer,
      showConsistencyEngine: input.showConsistencyEngine,
      showReportQualityEngine: input.showReportQualityEngine,
      showReproducibilityExplorer: input.showReproducibilityExplorer,
      showEvidenceStrengthEngine: input.showEvidenceStrengthEngine,
      showAssumptionTracker: input.showAssumptionTracker,
      showPublicationReadinessAnalyzer: input.showPublicationReadinessAnalyzer,
      showMethodologicalDashboard: input.showMethodologicalDashboard,
      showPublicationDashboard: input.showPublicationDashboard,
      showMultiDatasetComparison: input.showMultiDatasetComparison,
      showHierarchicalClustering: input.showHierarchicalClustering,
      showTTest: input.showTTest,
      showAnova: input.showAnova,
      showPostHoc: input.showPostHoc,
      showNonParametric: input.showNonParametric,
      showEffectSizePower: input.showEffectSizePower,
      showStatisticalAdvisor: input.showStatisticalAdvisor,
      showScientificReport: input.showScientificReport,
      showScientificInterpretation: input.showScientificInterpretation,
      showScientificAssistant: input.showScientificAssistant,
  },
  setters: {
      showDerivative: input.setShowDerivative,
      showIntegral: input.setShowIntegral,
      showIntersections: input.setShowIntersections,
      showCriticalPoints: input.setShowCriticalPoints,
      showRoots: input.setShowRoots,
      showStatistics: input.setShowStatistics,
      showErrorBars: input.setShowErrorBars,
      showCorrelation: input.setShowCorrelation,
      showOutliers: input.setShowOutliers,
      showHistogram: input.setShowHistogram,
      showBoxPlot: input.setShowBoxPlot,
      showNormality: input.setShowNormality,
      showQQPlot: input.setShowQQPlot,
      showViolinPlot: input.setShowViolinPlot,
      showHeatmap: input.setShowHeatmap,
      showBubblePlot: input.setShowBubblePlot,
      showRadarPlot: input.setShowRadarPlot,
      showKernelDensity: input.setShowKernelDensity,
      showForestPlot: input.setShowForestPlot,
      showPCA: input.setShowPCA,
      showScatterMatrix: input.setShowScatterMatrix,
      showParallelCoordinates: input.setShowParallelCoordinates,
      showCorrelationNetwork: input.setShowCorrelationNetwork,
      showMDS: input.setShowMDS,
      showDistanceMatrix: input.setShowDistanceMatrix,
      showSimilarityNetwork: input.setShowSimilarityNetwork,
      showVariableImportance: input.setShowVariableImportance,
      showClusterHeatmap: input.setShowClusterHeatmap,
      showClusteredDistanceHeatmap: input.setShowClusteredDistanceHeatmap,
      showMultivariateDashboard: input.setShowMultivariateDashboard,
      showManovaExplorer: input.setShowManovaExplorer,
      showLdaExplorer: input.setShowLdaExplorer,
      showCanonicalCorrelationExplorer: input.setShowCanonicalCorrelationExplorer,
      showPcrExplorer: input.setShowPcrExplorer,
      showPlsExplorer: input.setShowPlsExplorer,
      showBootstrapExplorer: input.setShowBootstrapExplorer,
      showSensitivityExplorer: input.setShowSensitivityExplorer,
      showTsneExplorer: input.setShowTsneExplorer,
      showUmapExplorer: input.setShowUmapExplorer,
      showConsistencyEngine: input.setShowConsistencyEngine,
      showReportQualityEngine: input.setShowReportQualityEngine,
      showReproducibilityExplorer: input.setShowReproducibilityExplorer,
      showEvidenceStrengthEngine: input.setShowEvidenceStrengthEngine,
      showAssumptionTracker: input.setShowAssumptionTracker,
      showPublicationReadinessAnalyzer: input.setShowPublicationReadinessAnalyzer,
      showMethodologicalDashboard: input.setShowMethodologicalDashboard,
      showPublicationDashboard: input.setShowPublicationDashboard,
      showMultiDatasetComparison: input.setShowMultiDatasetComparison,
      showHierarchicalClustering: input.setShowHierarchicalClustering,
      showTTest: input.setShowTTest,
      showAnova: input.setShowAnova,
      showPostHoc: input.setShowPostHoc,
      showNonParametric: input.setShowNonParametric,
      showEffectSizePower: input.setShowEffectSizePower,
      showStatisticalAdvisor: input.setShowStatisticalAdvisor,
      showScientificReport: input.setShowScientificReport,
      showScientificInterpretation: input.setShowScientificInterpretation,
      showScientificAssistant: input.setShowScientificAssistant,
  },
});

export const resetEditorVisibility = (
  setters: EditorVisibilityBindings["setters"]
) => {
  for (const key of Object.keys(setters) as VisibilityKeyV1[]) {
    setters[key]?.(false);
  }
};
