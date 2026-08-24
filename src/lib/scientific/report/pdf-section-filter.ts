/**
 * EXPORT-2 — PDF toggle-aware section filter (ownership: EXPORT-2 / scientific/report).
 * Consumes pdfSectionIds from ARCH-6 resolvePdfSectionsForState; does not own visibility policy.
 */

import { getScientificCapabilityIdentity } from "@/lib/scientific/contracts";
import { COMPOSITE_METHODOLOGY_PRIMARY_LABELS } from "@/lib/scientific/methodology/disclosure";

const EXPLORER_REPORT_TITLES = {
  manova: getScientificCapabilityIdentity(
    "multivariate-separation-indicator"
  ).primaryLabelEs,
  lda: getScientificCapabilityIdentity(
    "discrimination-structure-indicator"
  ).primaryLabelEs,
  canonical: getScientificCapabilityIdentity(
    "association-network-indicator"
  ).primaryLabelEs,
  pcr: getScientificCapabilityIdentity(
    "component-importance-predictive-indicator"
  ).primaryLabelEs,
  pls: getScientificCapabilityIdentity(
    "composite-explanatory-indicator"
  ).primaryLabelEs,
  bootstrap: getScientificCapabilityIdentity(
    "evidence-stability-indicator"
  ).primaryLabelEs,
  sensitivity: getScientificCapabilityIdentity(
    "composite-robustness-indicator"
  ).primaryLabelEs,
  tsne: getScientificCapabilityIdentity("mds-neighborhood-view").primaryLabelEs,
  umap: getScientificCapabilityIdentity("mds-connectivity-view").primaryLabelEs,
} as const;

export type PdfSectionAllowRule =
  | { kind: "always" }
  | { kind: "id"; id: string }
  | { kind: "anyOf"; ids: readonly string[] };

/** Report section title → pdfSectionId rule (registry / toPdfSectionId fallback). */
export const SCIENTIFIC_REPORT_PDF_SECTION_RULES: Readonly<
  Record<string, PdfSectionAllowRule>
> = {
  "Descripción de datos": { kind: "always" },
  Normalidad: { kind: "id", id: "panel--normality" },
  "Evaluación integrada de normalidad": {
    kind: "anyOf",
    ids: [
      "panel--normality",
      "panel--q-q-plot",
      "panel--violin-plot",
      "panel--kernel-density",
    ],
  },
  "Q-Q Plot": { kind: "id", id: "panel--q-q-plot" },
  "Violin Plot": { kind: "id", id: "panel--violin-plot" },
  Heatmap: { kind: "id", id: "panel--heatmap" },
  "Bubble Plot": { kind: "id", id: "panel--bubble-plot" },
  "Radar Plot": { kind: "id", id: "panel--radar-plot" },
  "Kernel Density Plot": { kind: "id", id: "panel--kernel-density" },
  "Forest Plot": { kind: "id", id: "panel--forest-plot" },
  PCA: { kind: "id", id: "panel--p-c-a" },
  "PCA Loadings": { kind: "id", id: "panel--p-c-a" },
  "Scatter Matrix": { kind: "id", id: "panel--scatter-matrix" },
  "Parallel Coordinates Plot": {
    kind: "id",
    id: "panel--parallel-coordinates",
  },
  "Correlation Network": { kind: "id", id: "panel--correlation-network" },
  MDS: { kind: "id", id: "panel--m-d-s" },
  "Distance Matrix": { kind: "id", id: "panel--distance-matrix" },
  "Similarity Network": { kind: "id", id: "panel--similarity-network" },
  "Variable Importance": { kind: "id", id: "panel--variable-importance" },
  "Cluster Heatmap": { kind: "id", id: "panel--cluster-heatmap" },
  "Clustered Distance Heatmap": {
    kind: "id",
    id: "panel--clustered-distance-heatmap",
  },
  "Multivariate Dashboard": {
    kind: "id",
    id: "sci-40-multivariate-dashboard",
  },
  [EXPLORER_REPORT_TITLES.manova]: {
    kind: "id",
    id: "panel--manova-explorer",
  },
  [EXPLORER_REPORT_TITLES.lda]: { kind: "id", id: "panel--lda-explorer" },
  [EXPLORER_REPORT_TITLES.canonical]: {
    kind: "id",
    id: "panel--canonical-correlation-explorer",
  },
  [EXPLORER_REPORT_TITLES.pcr]: { kind: "id", id: "panel--pcr-explorer" },
  [EXPLORER_REPORT_TITLES.pls]: { kind: "id", id: "panel--pls-explorer" },
  [EXPLORER_REPORT_TITLES.bootstrap]: {
    kind: "id",
    id: "panel--bootstrap-explorer",
  },
  [EXPLORER_REPORT_TITLES.sensitivity]: {
    kind: "id",
    id: "panel--sensitivity-explorer",
  },
  [EXPLORER_REPORT_TITLES.tsne]: {
    kind: "id",
    id: "panel--t-sne-explorer",
  },
  [EXPLORER_REPORT_TITLES.umap]: { kind: "id", id: "panel--umap-explorer" },
  [COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-50"]]: {
    kind: "id",
    id: "sci-50-consistency",
  },
  [COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-51"]]: {
    kind: "id",
    id: "sci-51-report-quality",
  },
  [COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-52"]]: {
    kind: "id",
    id: "sci-52-reproducibility",
  },
  [COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-53"]]: {
    kind: "id",
    id: "sci-53-evidence",
  },
  [COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-54"]]: {
    kind: "id",
    id: "sci-54-assumptions",
  },
  [COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-55"]]: {
    kind: "id",
    id: "sci-55-readiness",
  },
  [COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-56"]]: {
    kind: "id",
    id: "sci-56-methodological-dashboard",
  },
  [COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-60"]]: {
    kind: "id",
    id: "sci-60-publication-dashboard",
  },
  "Clusterización jerárquica": {
    kind: "id",
    id: "panel--hierarchical-clustering",
  },
  Correlaciones: { kind: "id", id: "panel--correlation" },
  "Valores atípicos": { kind: "id", id: "panel--outliers" },
  "Pruebas estadísticas": {
    kind: "anyOf",
    ids: [
      "panel--t-test",
      "panel--anova",
      "panel--post-hoc",
      "panel--non-parametric",
    ],
  },
  "Effect Size & Power": { kind: "id", id: "sci-57-effect-size-power" },
  "Recomendación final": { kind: "id", id: "scientific-advisor" },
  "Comparación Multi-Dataset (SCI-58)": {
    kind: "id",
    id: "sci-58-comparison-dashboard",
  },
};

export const PDF_BLOCK_COMPARISON_ID = "sci-58-comparison-dashboard";
export const PDF_BLOCK_ADVISOR_ID = "scientific-advisor";

export const isPdfSectionTitleAllowed = (
  title: string,
  allowedIds: ReadonlySet<string>
): boolean => {
  const rule = SCIENTIFIC_REPORT_PDF_SECTION_RULES[title];
  if (!rule) {
    // Unknown titles: keep (append-only report growth / no silent drop).
    return true;
  }
  if (rule.kind === "always") {
    return true;
  }
  if (rule.kind === "id") {
    return allowedIds.has(rule.id);
  }
  return rule.ids.some((id) => allowedIds.has(id));
};

export const filterScientificReportSectionsForPdf = <
  T extends { title: string },
>(
  sections: readonly T[],
  allowedPdfSectionIds: readonly string[]
): T[] => {
  const allowed = new Set(allowedPdfSectionIds);
  return sections.filter((section) =>
    isPdfSectionTitleAllowed(section.title, allowed)
  );
};

/**
 * When `allowedPdfSectionIds` is omitted, preserve historical always-include
 * behavior for PDF-only blocks (comparison / advisor).
 */
export const shouldIncludePdfExportBlock = (
  blockId: string,
  allowedPdfSectionIds: readonly string[] | undefined
): boolean => {
  if (allowedPdfSectionIds === undefined) {
    return true;
  }
  return allowedPdfSectionIds.includes(blockId);
};
