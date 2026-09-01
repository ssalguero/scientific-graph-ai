import { isProductScreenId, type ProductScreenId } from "./screens";

/**
 * Legacy IDE workspace section. Derived from ProductScreenId.
 * Compatibility / leftover renderer only. Not the Product Face router.
 * Face routing remains ProductScreenId → openProductScreen → URL.
 */
export type LegacyWorkspaceSection =
  | "home"
  | "data"
  | "analysis"
  | "results"
  | "reports";

export type LegacyDataWorkspaceView =
  | "experimental"
  | "curves"
  | "advanced"
  | "visual-builder";

export type LegacyAnalysisInspectorSection =
  | "visualization"
  | "mathematics"
  | "statistics"
  | "inference"
  | "advisor";

export type LegacyDataSectionOpen = {
  constructor: boolean;
  import: boolean;
  multiDataset: boolean;
};

/**
 * ProductScreenId → legacy renderer flags.
 * Direction: screen → render. Never the reverse as Product Face router.
 */
export type LegacyRenderPlan = {
  workspaceSection: LegacyWorkspaceSection;
  dataWorkspaceView: LegacyDataWorkspaceView;
  importDestinationActive: boolean;
  dataSectionOpen: LegacyDataSectionOpen;
  analysisInspectorSection: LegacyAnalysisInspectorSection | null;
  showMultiDatasetComparison: boolean;
  showCompareStepsBanner: boolean;
  statisticsDashboardsOpen: boolean;
  highlightPublicationDashboards: boolean;
  controlPanelTab: "graph" | "library" | "data" | null;
};

export function legacyWorkspaceSectionFromScreen(
  screen: ProductScreenId
): LegacyWorkspaceSection {
  switch (screen) {
    case "home":
      return "home";
    case "importar":
      // Legacy IDE section only. Product Face ownership is ProductScreenId(importar),
      // not the Datos tabpanel (FASE 1). Do not treat this as the Face router.
      return "data";
    case "comparar":
      // Legacy IDE section only. Product Face ownership is ProductScreenId(comparar),
      // not the Datos tabpanel (FASE 3). Do not treat this as the Face router.
      return "data";
    case "graph":
      // Legacy IDE section only. Product Face ownership is ProductScreenId(graph),
      // not the Datos tabpanel (FASE 2). Do not treat this as the Face router.
      return "data";
    case "vgb":
      // Legacy IDE section only. Product Face ownership is ProductScreenId(vgb),
      // not the Datos tabpanel (R4). Do not treat this as the Face router.
      return "data";
    case "analizar":
      // Legacy IDE section only. Product Face ownership is ProductScreenId(analizar),
      // not the Análisis tabpanel (FASE 4). Do not treat this as the Face router.
      return "analysis";
    case "evaluar-metodologia":
      return "analysis";
    case "results":
      return "results";
    case "reports":
      return "reports";
  }
}

export function legacyRenderPlanForScreen(
  screen: ProductScreenId
): LegacyRenderPlan {
  const workspaceSection = legacyWorkspaceSectionFromScreen(screen);
  const base: LegacyRenderPlan = {
    workspaceSection,
    dataWorkspaceView: "experimental",
    importDestinationActive: false,
    dataSectionOpen: {
      constructor: false,
      import: false,
      multiDataset: false,
    },
    analysisInspectorSection: null,
    showMultiDatasetComparison: false,
    showCompareStepsBanner: false,
    statisticsDashboardsOpen: false,
    highlightPublicationDashboards: false,
    controlPanelTab: null,
  };

  switch (screen) {
    case "home":
      return base;
    case "importar":
      return {
        ...base,
        importDestinationActive: true,
        dataSectionOpen: {
          constructor: false,
          import: true,
          multiDataset: false,
        },
      };
    case "comparar":
      return {
        ...base,
        showMultiDatasetComparison: true,
        showCompareStepsBanner: true,
        dataSectionOpen: {
          constructor: false,
          import: false,
          multiDataset: true,
        },
      };
    case "graph":
      return {
        ...base,
        dataWorkspaceView: "curves",
        controlPanelTab: "graph",
        dataSectionOpen: {
          constructor: true,
          import: false,
          multiDataset: false,
        },
      };
    case "vgb":
      return {
        ...base,
        dataWorkspaceView: "visual-builder",
        dataSectionOpen: {
          constructor: false,
          import: false,
          multiDataset: false,
        },
      };
    case "analizar":
      return base;
    case "evaluar-metodologia":
      return {
        ...base,
        analysisInspectorSection: "statistics",
        statisticsDashboardsOpen: true,
        highlightPublicationDashboards: true,
      };
    case "results":
    case "reports":
      return base;
  }
}

/**
 * TEMPORARY: persisted IDE section → ProductScreenId.
 * Used only when `workspace.productScreen` is absent (pre-R11 / V1 files).
 *
 * Deterministic fallbacks — do not invent Face identity:
 * - results → results
 * - reports → reports
 * - analysis → analizar (NOT evaluar-metodologia)
 * - data + graph|library tab → graph
 * - data otherwise → importar (NOT comparar, NOT vgb)
 * - home / unknown → home
 */
export function persistedWorkspaceToProductScreen(input: {
  activeSection: string;
  controlPanelTab?: string | null;
}): ProductScreenId {
  if (input.activeSection === "home") return "home";
  if (input.activeSection === "results") return "results";
  if (input.activeSection === "reports") return "reports";
  if (input.activeSection === "analysis") return "analizar";
  if (input.activeSection === "data") {
    if (input.controlPanelTab === "graph") return "graph";
    if (input.controlPanelTab === "library") return "graph";
    return "importar";
  }
  return "home";
}

/**
 * R11 restore landing. Authoritative Face id when present and valid.
 * Never reads DOM hosts, Tabs, or scroll targets.
 */
export function resolvePersistedProductScreen(input: {
  productScreen?: string | null;
  activeSection: string;
  controlPanelTab?: string | null;
}): ProductScreenId {
  if (
    typeof input.productScreen === "string" &&
    isProductScreenId(input.productScreen)
  ) {
    return input.productScreen;
  }
  return persistedWorkspaceToProductScreen({
    activeSection: input.activeSection,
    controlPanelTab: input.controlPanelTab,
  });
}

export type GuidedWorkflowWorkspaceTab =
  | "data"
  | "analysis"
  | "results"
  | "reports";

/**
 * Unambiguous workflow tab → screen. `data` is undefined (ADR / FASE 9).
 * evaluate-publication on analysis → evaluar-metodologia.
 */
export function guidedWorkflowTabToProductScreen(
  tab: GuidedWorkflowWorkspaceTab,
  templateId: string | null
): ProductScreenId | null {
  if (tab === "results") return "results";
  if (tab === "reports") return "reports";
  if (tab === "analysis") {
    return templateId === "evaluate-publication"
      ? "evaluar-metodologia"
      : "analizar";
  }
  return null;
}

/**
 * R10: workflow host metadata may match a Product Face.
 * `workspaceTab` is not a router; this only answers "does this Face host the step?".
 */
export function guidedWorkflowHostMatchesProductScreen(
  hostTab: GuidedWorkflowWorkspaceTab | null,
  templateId: string | null,
  productScreen: ProductScreenId
): boolean {
  if (!hostTab) return false;
  const screen = guidedWorkflowTabToProductScreen(hostTab, templateId);
  return screen !== null && screen === productScreen;
}

const WORKFLOW_HOST_SCREEN_LABEL: Partial<Record<ProductScreenId, string>> = {
  analizar: "Analizar",
  "evaluar-metodologia": "Evaluar metodología",
  results: "Resultados",
  reports: "Reportes",
};

/** Face label for off-host workflow hints. Not a Tab name. */
export function guidedWorkflowHostProductScreenLabel(
  hostTab: GuidedWorkflowWorkspaceTab | null,
  templateId: string | null
): string | null {
  if (!hostTab) return null;
  const screen = guidedWorkflowTabToProductScreen(hostTab, templateId);
  if (!screen) return null;
  return WORKFLOW_HOST_SCREEN_LABEL[screen] ?? null;
}
