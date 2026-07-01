import type {
  MethodologyRegistryToggleKey,
  ToggleRegistryEntry,
  VisibilityToggleRegistry,
} from "./types";

const entry = (
  config: ToggleRegistryEntry
): ToggleRegistryEntry => config;

/**
 * Declarative registry — methodology SCI-50→SCI-60, related dashboards, inference
 * and report toggles (QA-1 §7.1–7.3). Full {@link VISIBILITY_KEYS_V1} parity in D4.2.
 */
export const VISIBILITY_TOGGLE_REGISTRY: VisibilityToggleRegistry = {
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

export const METHODOLOGY_REGISTRY_TOGGLE_KEYS = Object.keys(
  VISIBILITY_TOGGLE_REGISTRY
) as MethodologyRegistryToggleKey[];

export const getToggleRegistryEntry = (
  key: MethodologyRegistryToggleKey
): ToggleRegistryEntry => VISIBILITY_TOGGLE_REGISTRY[key];
