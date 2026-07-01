/**
 * Domain types for toggle-aware visibility (ARCH-6.1 / PROD-2D D4).
 * Pure TypeScript — no React, Next.js, or persistence imports.
 */

import type { VisibilityKeyV1 } from "@/lib/project/keys";

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

/** Aligned with persisted {@link VisibilityKeyV1} — parity enforced in validate.ts. */
export type VisibilityToggleKey = VisibilityKeyV1;

export type MethodologyRegistryToggleKey = Extract<
  VisibilityToggleKey,
  | "showConsistencyEngine"
  | "showReportQualityEngine"
  | "showReproducibilityExplorer"
  | "showEvidenceStrengthEngine"
  | "showAssumptionTracker"
  | "showPublicationReadinessAnalyzer"
>;

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
  Record<VisibilityToggleKey, ToggleRegistryEntry>
>;

export type RegistryValidationIssue = {
  code: string;
  message: string;
};
