/**
 * EXPORT-2 — PDF toggle-aware section filter (ownership: EXPORT-2 / scientific/report).
 * Consumes pdfSectionIds from ARCH-6 resolvePdfSectionsForState; does not own visibility policy.
 */

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
  "MANOVA Explorer": { kind: "id", id: "panel--manova-explorer" },
  "LDA Explorer": { kind: "id", id: "panel--lda-explorer" },
  "Canonical Correlation Explorer": {
    kind: "id",
    id: "panel--canonical-correlation-explorer",
  },
  "PCR Explorer": { kind: "id", id: "panel--pcr-explorer" },
  "PLS Explorer": { kind: "id", id: "panel--pls-explorer" },
  "Bootstrap Explorer": { kind: "id", id: "panel--bootstrap-explorer" },
  "Sensitivity Analysis Explorer": {
    kind: "id",
    id: "panel--sensitivity-explorer",
  },
  "t-SNE Explorer": { kind: "id", id: "panel--t-sne-explorer" },
  "UMAP Explorer": { kind: "id", id: "panel--umap-explorer" },
  "Consistency Engine": { kind: "id", id: "sci-50-consistency" },
  "Report Quality Engine": { kind: "id", id: "sci-51-report-quality" },
  "Reproducibility Explorer": { kind: "id", id: "sci-52-reproducibility" },
  "Evidence Strength Engine": { kind: "id", id: "sci-53-evidence" },
  "Assumption Tracker": { kind: "id", id: "sci-54-assumptions" },
  "Publication Readiness Analyzer": { kind: "id", id: "sci-55-readiness" },
  "Methodological Summary Dashboard": {
    kind: "id",
    id: "sci-56-methodological-dashboard",
  },
  "Executive Publication Dashboard": {
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
