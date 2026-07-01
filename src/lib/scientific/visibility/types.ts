/**
 * Domain types for toggle-aware visibility (ARCH-6.1 / PROD-2D D4).
 * Pure TypeScript — no React, Next.js, or persistence imports.
 */

export type ToggleCategory =
  | "graph-math"
  | "descriptive"
  | "multivariate"
  | "inference"
  | "methodology"
  | "dashboard"
  | "report";

export type PdfExportPolicy = "always-include" | "when-visible" | "never";

export type VisibilityWorkspaceTab = "analysis" | "results" | "reports";

/**
 * Toggle keys covered by the D4.1 methodology registry slice.
 * D4.2 extends {@link VisibilityToggleKey} to full parity with project keys.
 */
export type MethodologyRegistryToggleKey =
  | "showConsistencyEngine"
  | "showReportQualityEngine"
  | "showReproducibilityExplorer"
  | "showEvidenceStrengthEngine"
  | "showAssumptionTracker"
  | "showPublicationReadinessAnalyzer"
  | "showMethodologicalDashboard"
  | "showPublicationDashboard"
  | "showMultivariateDashboard"
  | "showMultiDatasetComparison"
  | "showEffectSizePower"
  | "showStatisticalAdvisor"
  | "showScientificInterpretation"
  | "showScientificReport";

/** Public toggle key alias — methodology slice until D4.2 completes the registry. */
export type VisibilityToggleKey = MethodologyRegistryToggleKey;

export type VisibilityState = Partial<Record<VisibilityToggleKey, boolean>>;

export type ToggleRegistryEntry = {
  key: VisibilityToggleKey;
  category: ToggleCategory;
  defaultVisible: false;
  sciId?: string;
  inspectorGroup?: string;
  workspaceTab?: VisibilityWorkspaceTab;
  pdfExportPolicy: PdfExportPolicy;
  pdfSectionIds?: readonly string[];
};

export type VisibilityToggleRegistry = Readonly<
  Record<MethodologyRegistryToggleKey, ToggleRegistryEntry>
>;
