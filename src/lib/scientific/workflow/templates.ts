import { COMPOSITE_METHODOLOGY_PRIMARY_LABELS } from "@/lib/scientific/methodology/disclosure";

import { resolveInferentialWorkflowToggles } from "./inferential";
import type { GuidedWorkflowStep } from "./types";

export const buildCompareGroupsWorkflowSteps = (): GuidedWorkflowStep[] => [
  {
    id: "descriptive",
    title: "Estadística descriptiva",
    explanation:
      "Active descriptiva y barras de error para caracterizar cada grupo antes de inferencia.",
    workspaceTab: "analysis",
    inspectorSection: "statistics",
    toggles: ["showStatistics", "showErrorBars"],
  },
  {
    id: "normality",
    title: "Evaluación de normalidad",
    explanation:
      "Revise normalidad canónica con tests y Q-Q Plot antes de elegir pruebas paramétricas.",
    workspaceTab: "analysis",
    inspectorSection: "statistics",
    toggles: ["showNormality", "showQQPlot"],
  },
  {
    id: "inferential",
    title: "Inferencia principal",
    explanation:
      "Se activará la prueba recomendada según grupos visibles y normalidad canónica.",
    workspaceTab: "analysis",
    inspectorSection: "inference",
    toggles: [],
    conditionalToggles: resolveInferentialWorkflowToggles,
  },
  {
    id: "effect-size",
    title: "Magnitud y potencia",
    explanation:
      "Effect Size & Power (SCI-57) contextualiza el tamaño del efecto y la potencia prospectiva.",
    workspaceTab: "analysis",
    inspectorSection: "inference",
    toggles: ["showEffectSizePower"],
  },
  {
    id: "advisor",
    title: "Advisor Estadístico",
    explanation:
      "El Advisor confirma la prueba principal; correlación se activa para alimentar la recomendación.",
    workspaceTab: "analysis",
    inspectorSection: "advisor",
    toggles: ["showCorrelation", "showStatisticalAdvisor"],
  },
  {
    id: "interpretation",
    title: "Interpretación científica",
    explanation:
      "Revise la interpretación automática (SCI-19) con los resultados inferenciales visibles.",
    workspaceTab: "results",
    toggles: ["showScientificInterpretation"],
  },
  {
    id: "review-results",
    title: "Revisión de resultados",
    explanation:
      "Confirme paneles inferenciales y de effect size. El siguiente paso abre Informes con el reporte científico.",
    workspaceTab: "results",
    toggles: [],
    navigateAfterApply: false,
  },
  {
    id: "report",
    title: "Reporte científico",
    explanation:
      "Active el reporte científico en Informes para revisar el documento integrado y continuar hacia la exportación (PDF / figura).",
    workspaceTab: "reports",
    inspectorSection: "advisor",
    toggles: ["showScientificReport"],
  },
];

export const buildExploreStructureWorkflowSteps = (): GuidedWorkflowStep[] => [
  {
    id: "descriptive",
    title: "Descriptiva y correlación",
    explanation: "Base exploratoria para relaciones lineales entre series.",
    workspaceTab: "analysis",
    inspectorSection: "statistics",
    toggles: ["showStatistics", "showCorrelation"],
  },
  {
    id: "heatmap",
    title: "Heatmap de correlación",
    explanation: "Visualice la matriz de asociaciones entre variables.",
    workspaceTab: "analysis",
    inspectorSection: "statistics",
    toggles: ["showHeatmap"],
  },
  {
    id: "pca",
    title: "Análisis PCA",
    explanation: "Identifique componentes principales que resumen la variabilidad.",
    workspaceTab: "analysis",
    inspectorSection: "statistics",
    toggles: ["showPCA"],
  },
  {
    id: "clustering",
    title: "Clustering jerárquico",
    explanation: "Explore agrupamientos naturales entre series o observaciones.",
    workspaceTab: "analysis",
    inspectorSection: "statistics",
    toggles: ["showHierarchicalClustering"],
  },
  {
    id: "multivariate-dashboard",
    title: "Dashboard multivariante",
    explanation: "SCI-40 sintetiza PCA, clustering y métricas multivariantes.",
    workspaceTab: "results",
    toggles: ["showMultivariateDashboard"],
  },
  {
    id: "sci40-review",
    title: "Revisión SCI-40",
    explanation: "Confirme highlights multivariantes antes de profundizar manualmente.",
    workspaceTab: "results",
    toggles: [],
    navigateAfterApply: false,
  },
];

export const buildEvaluatePublicationWorkflowSteps = (): GuidedWorkflowStep[] => [
  {
    id: "methodology-engines",
    title: "Motores metodológicos",
    explanation:
      "Active SCI-50→55 para evaluar consistencia, calidad, evidencia y preparación.",
    workspaceTab: "analysis",
    inspectorSection: "statistics",
    toggles: [
      "showConsistencyEngine",
      "showReportQualityEngine",
      "showReproducibilityExplorer",
      "showEvidenceStrengthEngine",
      "showAssumptionTracker",
      "showPublicationReadinessAnalyzer",
    ],
  },
  {
    id: "effect-size",
    title: "Effect Size & Power",
    explanation: "SCI-57 aporta magnitud del efecto para la síntesis editorial.",
    workspaceTab: "analysis",
    inspectorSection: "inference",
    toggles: ["showEffectSizePower"],
  },
  {
    id: "sci56",
    title: COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-56"],
    explanation:
      "SCI-56 resume indicadores metodológicos compuestos; no certifica el análisis.",
    workspaceTab: "results",
    toggles: ["showMethodologicalDashboard"],
  },
  {
    id: "sci60",
    title: COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-60"],
    explanation:
      "SCI-60 consolida señales compuestas para revisión; no establece idoneidad editorial.",
    workspaceTab: "results",
    toggles: ["showPublicationDashboard"],
  },
  {
    id: "report",
    title: "Reporte científico",
    explanation: "Prepare la exportación PDF con el reporte científico integrado.",
    workspaceTab: "reports",
    inspectorSection: "advisor",
    toggles: ["showScientificReport"],
  },
];
