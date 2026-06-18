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
const inputParams = keys
  .flatMap((key) => [`${key}: boolean`, `${setter(key)}: (value: boolean) => void`])
  .join(";\n  ");
const stateEntries = keys.map((key) => `      ${key}: input.${key},`).join("\n");
const setterEntries = keys
  .map((key) => `      ${key}: input.${setter(key)},`)
  .join("\n");

const content = `import type { VisibilityKeyV1 } from "@/lib/project";

export type EditorVisibilityBindingsInput = {
  ${inputParams};
};

export type EditorVisibilityBindings = {
  state: Record<VisibilityKeyV1, boolean>;
  setters: Record<VisibilityKeyV1, (value: boolean) => void>;
};

export const buildEditorVisibilityBindings = (
  input: EditorVisibilityBindingsInput
): EditorVisibilityBindings => ({
  state: {
${stateEntries}
  },
  setters: {
${setterEntries}
  },
});

export const resetEditorVisibility = (
  setters: EditorVisibilityBindings["setters"]
) => {
  for (const key of Object.keys(setters) as VisibilityKeyV1[]) {
    setters[key]?.(false);
  }
};
`;

writeFileSync("src/app/editorVisibilityBindings.ts", content);
console.log(`Generated editorVisibilityBindings.ts (${keys.length} keys)`);
