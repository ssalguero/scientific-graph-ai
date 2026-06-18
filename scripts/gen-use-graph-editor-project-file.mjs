import { writeFileSync } from "node:fs";

const keys = [
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
];

const setter = (key) => `set${key.charAt(0).toUpperCase()}${key.slice(1)}`;

const bindingArgs = keys
  .flatMap((key) => [
    `      ${key}: params.${key},`,
    `      ${setter(key)}: params.${setter(key)},`,
  ])
  .join("\n");

const bindingDeps = keys.map((key) => `    params.${key},`).join("\n");

const content = `"use client";

import { useEffect, useMemo, useRef } from "react";

import {
  createGraphEditorProjectIntegration,
  type GraphEditorProjectIntegrationInput,
} from "./graphEditorProjectIntegration";
import { buildEditorVisibilityBindings } from "./editorVisibilityBindings";
import { collectProjectSnapshot, createInitialProjectMetadata } from "./projectPersistence";

export type UseGraphEditorProjectFileParams = Omit<
  GraphEditorProjectIntegrationInput,
  "visibilityBindings"
>;

export function useGraphEditorProjectFile(params: UseGraphEditorProjectFileParams) {
  const projectFileInputRef = useRef<HTMLInputElement>(null);
  const suppressProjectDirtyRef = useRef(false);
  const projectDirtyInitRef = useRef(false);
  const previousSignatureRef = useRef<string | null>(null);

  const visibilityBindings = useMemo(
    () =>
      buildEditorVisibilityBindings({
${bindingArgs}
      }),
    [
${bindingDeps}
    ]
  );

  const projectActions = createGraphEditorProjectIntegration({
    ...params,
    visibilityBindings,
  });

  const projectReadSignature = JSON.stringify(
    collectProjectSnapshot(projectActions.buildReadContext())
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

  return {
    projectFileInputRef,
    suppressProjectDirtyRef,
    createInitialProjectMetadata,
    ...projectActions,
  };
}
`;

writeFileSync("src/app/useGraphEditorProjectFile.ts", content);
console.log("Generated useGraphEditorProjectFile.ts");
