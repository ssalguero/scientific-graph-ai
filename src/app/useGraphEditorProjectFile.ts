"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { EditorVisibilityBindingsInput } from "./editorVisibilityBindings";
import {
  createGraphEditorProjectIntegration,
  type GraphEditorProjectIntegrationInput,
} from "./graphEditorProjectIntegration";
import { buildEditorVisibilityBindings } from "./editorVisibilityBindings";
import { collectProjectSnapshotV2, createInitialProjectMetadata } from "./projectPersistence";
import { useLocalProjectPersistence } from "./useLocalProjectPersistence";
import { useProjectDraftAutosave } from "./useProjectDraftAutosave";
import { DEFAULT_PROJECT_NAME } from "@/lib/project";

export type UseGraphEditorProjectFileParams = Omit<
  GraphEditorProjectIntegrationInput,
  "visibilityBindings" | "suppressProjectDirtyRef"
> &
  EditorVisibilityBindingsInput;

export function useGraphEditorProjectFile(params: UseGraphEditorProjectFileParams) {
  const suppressProjectDirtyRef = useRef(false);
  const projectDirtyInitRef = useRef(false);
  const previousSignatureRef = useRef<string | null>(null);

  const visibilityBindings = useMemo(
    () =>
      buildEditorVisibilityBindings({
      showDerivative: params.showDerivative,
      setShowDerivative: params.setShowDerivative,
      showIntegral: params.showIntegral,
      setShowIntegral: params.setShowIntegral,
      showIntersections: params.showIntersections,
      setShowIntersections: params.setShowIntersections,
      showCriticalPoints: params.showCriticalPoints,
      setShowCriticalPoints: params.setShowCriticalPoints,
      showRoots: params.showRoots,
      setShowRoots: params.setShowRoots,
      showStatistics: params.showStatistics,
      setShowStatistics: params.setShowStatistics,
      showErrorBars: params.showErrorBars,
      setShowErrorBars: params.setShowErrorBars,
      showCorrelation: params.showCorrelation,
      setShowCorrelation: params.setShowCorrelation,
      showOutliers: params.showOutliers,
      setShowOutliers: params.setShowOutliers,
      showHistogram: params.showHistogram,
      setShowHistogram: params.setShowHistogram,
      showBoxPlot: params.showBoxPlot,
      setShowBoxPlot: params.setShowBoxPlot,
      showNormality: params.showNormality,
      setShowNormality: params.setShowNormality,
      showQQPlot: params.showQQPlot,
      setShowQQPlot: params.setShowQQPlot,
      showViolinPlot: params.showViolinPlot,
      setShowViolinPlot: params.setShowViolinPlot,
      showHeatmap: params.showHeatmap,
      setShowHeatmap: params.setShowHeatmap,
      showBubblePlot: params.showBubblePlot,
      setShowBubblePlot: params.setShowBubblePlot,
      showRadarPlot: params.showRadarPlot,
      setShowRadarPlot: params.setShowRadarPlot,
      showKernelDensity: params.showKernelDensity,
      setShowKernelDensity: params.setShowKernelDensity,
      showForestPlot: params.showForestPlot,
      setShowForestPlot: params.setShowForestPlot,
      showPCA: params.showPCA,
      setShowPCA: params.setShowPCA,
      showScatterMatrix: params.showScatterMatrix,
      setShowScatterMatrix: params.setShowScatterMatrix,
      showParallelCoordinates: params.showParallelCoordinates,
      setShowParallelCoordinates: params.setShowParallelCoordinates,
      showCorrelationNetwork: params.showCorrelationNetwork,
      setShowCorrelationNetwork: params.setShowCorrelationNetwork,
      showMDS: params.showMDS,
      setShowMDS: params.setShowMDS,
      showDistanceMatrix: params.showDistanceMatrix,
      setShowDistanceMatrix: params.setShowDistanceMatrix,
      showSimilarityNetwork: params.showSimilarityNetwork,
      setShowSimilarityNetwork: params.setShowSimilarityNetwork,
      showVariableImportance: params.showVariableImportance,
      setShowVariableImportance: params.setShowVariableImportance,
      showClusterHeatmap: params.showClusterHeatmap,
      setShowClusterHeatmap: params.setShowClusterHeatmap,
      showClusteredDistanceHeatmap: params.showClusteredDistanceHeatmap,
      setShowClusteredDistanceHeatmap: params.setShowClusteredDistanceHeatmap,
      showMultivariateDashboard: params.showMultivariateDashboard,
      setShowMultivariateDashboard: params.setShowMultivariateDashboard,
      showManovaExplorer: params.showManovaExplorer,
      setShowManovaExplorer: params.setShowManovaExplorer,
      showLdaExplorer: params.showLdaExplorer,
      setShowLdaExplorer: params.setShowLdaExplorer,
      showCanonicalCorrelationExplorer: params.showCanonicalCorrelationExplorer,
      setShowCanonicalCorrelationExplorer: params.setShowCanonicalCorrelationExplorer,
      showPcrExplorer: params.showPcrExplorer,
      setShowPcrExplorer: params.setShowPcrExplorer,
      showPlsExplorer: params.showPlsExplorer,
      setShowPlsExplorer: params.setShowPlsExplorer,
      showBootstrapExplorer: params.showBootstrapExplorer,
      setShowBootstrapExplorer: params.setShowBootstrapExplorer,
      showSensitivityExplorer: params.showSensitivityExplorer,
      setShowSensitivityExplorer: params.setShowSensitivityExplorer,
      showTsneExplorer: params.showTsneExplorer,
      setShowTsneExplorer: params.setShowTsneExplorer,
      showUmapExplorer: params.showUmapExplorer,
      setShowUmapExplorer: params.setShowUmapExplorer,
      showConsistencyEngine: params.showConsistencyEngine,
      setShowConsistencyEngine: params.setShowConsistencyEngine,
      showReportQualityEngine: params.showReportQualityEngine,
      setShowReportQualityEngine: params.setShowReportQualityEngine,
      showReproducibilityExplorer: params.showReproducibilityExplorer,
      setShowReproducibilityExplorer: params.setShowReproducibilityExplorer,
      showEvidenceStrengthEngine: params.showEvidenceStrengthEngine,
      setShowEvidenceStrengthEngine: params.setShowEvidenceStrengthEngine,
      showAssumptionTracker: params.showAssumptionTracker,
      setShowAssumptionTracker: params.setShowAssumptionTracker,
      showPublicationReadinessAnalyzer: params.showPublicationReadinessAnalyzer,
      setShowPublicationReadinessAnalyzer: params.setShowPublicationReadinessAnalyzer,
      showMethodologicalDashboard: params.showMethodologicalDashboard,
      setShowMethodologicalDashboard: params.setShowMethodologicalDashboard,
      showPublicationDashboard: params.showPublicationDashboard,
      setShowPublicationDashboard: params.setShowPublicationDashboard,
      showMultiDatasetComparison: params.showMultiDatasetComparison,
      setShowMultiDatasetComparison: params.setShowMultiDatasetComparison,
      showHierarchicalClustering: params.showHierarchicalClustering,
      setShowHierarchicalClustering: params.setShowHierarchicalClustering,
      showTTest: params.showTTest,
      setShowTTest: params.setShowTTest,
      showAnova: params.showAnova,
      setShowAnova: params.setShowAnova,
      showPostHoc: params.showPostHoc,
      setShowPostHoc: params.setShowPostHoc,
      showNonParametric: params.showNonParametric,
      setShowNonParametric: params.setShowNonParametric,
      showEffectSizePower: params.showEffectSizePower,
      setShowEffectSizePower: params.setShowEffectSizePower,
      showStatisticalAdvisor: params.showStatisticalAdvisor,
      setShowStatisticalAdvisor: params.setShowStatisticalAdvisor,
      showScientificReport: params.showScientificReport,
      setShowScientificReport: params.setShowScientificReport,
      showScientificInterpretation: params.showScientificInterpretation,
      setShowScientificInterpretation: params.setShowScientificInterpretation,
      showScientificAssistant: params.showScientificAssistant,
      setShowScientificAssistant: params.setShowScientificAssistant,
      }),
    [
    params.showDerivative,
    params.showIntegral,
    params.showIntersections,
    params.showCriticalPoints,
    params.showRoots,
    params.showStatistics,
    params.showErrorBars,
    params.showCorrelation,
    params.showOutliers,
    params.showHistogram,
    params.showBoxPlot,
    params.showNormality,
    params.showQQPlot,
    params.showViolinPlot,
    params.showHeatmap,
    params.showBubblePlot,
    params.showRadarPlot,
    params.showKernelDensity,
    params.showForestPlot,
    params.showPCA,
    params.showScatterMatrix,
    params.showParallelCoordinates,
    params.showCorrelationNetwork,
    params.showMDS,
    params.showDistanceMatrix,
    params.showSimilarityNetwork,
    params.showVariableImportance,
    params.showClusterHeatmap,
    params.showClusteredDistanceHeatmap,
    params.showMultivariateDashboard,
    params.showManovaExplorer,
    params.showLdaExplorer,
    params.showCanonicalCorrelationExplorer,
    params.showPcrExplorer,
    params.showPlsExplorer,
    params.showBootstrapExplorer,
    params.showSensitivityExplorer,
    params.showTsneExplorer,
    params.showUmapExplorer,
    params.showConsistencyEngine,
    params.showReportQualityEngine,
    params.showReproducibilityExplorer,
    params.showEvidenceStrengthEngine,
    params.showAssumptionTracker,
    params.showPublicationReadinessAnalyzer,
    params.showMethodologicalDashboard,
    params.showPublicationDashboard,
    params.showMultiDatasetComparison,
    params.showHierarchicalClustering,
    params.showTTest,
    params.showAnova,
    params.showPostHoc,
    params.showNonParametric,
    params.showEffectSizePower,
    params.showStatisticalAdvisor,
    params.showScientificReport,
    params.showScientificInterpretation,
    params.showScientificAssistant,
    ]
  );

  const projectActions = createGraphEditorProjectIntegration({
    ...params,
    visibilityBindings,
    suppressProjectDirtyRef,
  });

  const projectReadSignature = JSON.stringify(
    collectProjectSnapshotV2(projectActions.buildCollectContextV2())
  );

  useEffect(() => {
    if (!projectDirtyInitRef.current) {
      projectDirtyInitRef.current = true;
      previousSignatureRef.current = projectReadSignature;
      return;
    }
    if (suppressProjectDirtyRef.current) {
      suppressProjectDirtyRef.current = false;
      previousSignatureRef.current = projectReadSignature;
      return;
    }
    if (previousSignatureRef.current !== projectReadSignature) {
      previousSignatureRef.current = projectReadSignature;
      params.setIsProjectDirty(true);
    }
  }, [projectReadSignature, params.setIsProjectDirty]);

  const localPersistence = useLocalProjectPersistence({
    buildCollectContextV2: projectActions.buildCollectContextV2,
    buildApplyContext: projectActions.buildApplyContext,
    setProjectFileFeedback: params.setProjectFileFeedback,
    setIsProjectDirty: params.setIsProjectDirty,
    suppressProjectDirtyRef,
    onProjectOpened: params.onProjectOpened,
  });

  const [autosaveTick, setAutosaveTick] = useState(0);

  useProjectDraftAutosave({
    enabled: localPersistence.activeLocalProjectId != null,
    isProjectDirty: params.isProjectDirty,
    projectName: params.projectMetadata.name.trim() || DEFAULT_PROJECT_NAME,
    activeLocalProjectId: localPersistence.activeLocalProjectId,
    repo: localPersistence.repo,
    buildCollectContextV2: projectActions.buildCollectContextV2,
    onAutosaved: () => setAutosaveTick((value) => value + 1),
  });

  const handleSaveLocalProject = useCallback(
    async (projectName: string) => {
      const summary = await localPersistence.handleSaveLocalProject(projectName);
      if (summary) {
        await localPersistence.refreshProjects();
      }
    },
    [localPersistence]
  );

  const handleOpenLocalProject = useCallback(
    async (id: string) => {
      const ok = await localPersistence.handleOpenLocalProject(id);
      if (ok) {
        localPersistence.closeLibrary();
        await localPersistence.refreshProjects();
      }
    },
    [localPersistence]
  );

  return {
    suppressProjectDirtyRef,
    createInitialProjectMetadata,
    autosaveTick,
    ...projectActions,
    ...localPersistence,
    handleSaveLocalProject,
    handleOpenLocalProject,
  };
}
