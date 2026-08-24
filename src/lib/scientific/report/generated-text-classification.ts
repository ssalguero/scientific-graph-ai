import type {
  GeneratedTextClassification,
} from "../contracts/generated-text-review";
import type {
  ScientificSemanticAuthority,
  ScientificSemanticValue,
} from "../contracts/semantic-values";
import type { ScientificResultContractId } from "../contracts/result-inventory";

const GENERATED_TEXT_CLASSIFICATIONS: readonly GeneratedTextClassification[] =
  ["factual", "interpretive", "advisory", "mixed"];

export const isGeneratedTextClassification = (
  value: unknown,
): value is GeneratedTextClassification =>
  GENERATED_TEXT_CLASSIFICATIONS.includes(
    value as GeneratedTextClassification,
  );

/**
 * Classification is explicit metadata, never a linguistic or AI inference.
 * Combining unlike fragments is conservatively classified as mixed.
 */
export const combineGeneratedTextClassifications = (
  classifications: readonly GeneratedTextClassification[],
): GeneratedTextClassification => {
  const unique = new Set(classifications);
  if (unique.size === 0 || unique.size > 1 || unique.has("mixed")) {
    return "mixed";
  }
  return classifications[0]!;
};

export const classifyScientificSemanticAuthority = (
  authority: ScientificSemanticAuthority,
): GeneratedTextClassification => {
  switch (authority) {
    case "system-factual":
      return "factual";
    case "system-advisory":
      return "advisory";
    case "mixed-system":
      return "mixed";
  }
};

export const classifyGeneratedTextFromSemanticValues = (
  values: readonly ScientificSemanticValue[],
): GeneratedTextClassification =>
  combineGeneratedTextClassifications(
    values.map((value) =>
      classifyScientificSemanticAuthority(value.authority),
    ),
  );

export const generatedTextRequiresResearcherApproval = (
  classification: GeneratedTextClassification,
): boolean => classification !== "factual";

export type ScientificReportBlockReviewDescriptor = {
  blockId: string;
  classification: GeneratedTextClassification;
  resultContractId: ScientificResultContractId;
};

const REPORT_BLOCK_RULES: Readonly<
  Record<
    string,
    Pick<
      ScientificReportBlockReviewDescriptor,
      "classification" | "resultContractId"
    >
  >
> = {
  "Descripción de datos": {
    classification: "factual",
    resultContractId: "descriptive.series-statistics",
  },
  Normalidad: {
    classification: "mixed",
    resultContractId: "distribution.exploration",
  },
  "Evaluación integrada de normalidad": {
    classification: "mixed",
    resultContractId: "distribution.exploration",
  },
  "Q-Q Plot": {
    classification: "mixed",
    resultContractId: "distribution.exploration",
  },
  "Violin Plot": {
    classification: "mixed",
    resultContractId: "distribution.exploration",
  },
  PCA: { classification: "mixed", resultContractId: "ge.pca" },
  "PCA Loadings": {
    classification: "mixed",
    resultContractId: "ge.pca",
  },
  Correlaciones: {
    classification: "mixed",
    resultContractId: "distribution.exploration",
  },
  "Pruebas estadísticas": {
    classification: "mixed",
    resultContractId: "inference.parametric",
  },
  "Effect Size & Power": {
    classification: "mixed",
    resultContractId: "sci-57.effect-size-power",
  },
  "Recomendación final": {
    classification: "advisory",
    resultContractId: "sci-60.publication-dashboard",
  },
  "Comparación Multi-Dataset (SCI-58)": {
    classification: "mixed",
    resultContractId: "sci-58.comparison",
  },
};

const stableBlockSlug = (title: string): string => {
  const normalized = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "unclassified";
};

/**
 * Report authority is registry-driven. Unknown append-only sections are
 * conservatively mixed and therefore cannot bypass researcher approval.
 */
export const getScientificReportBlockReviewDescriptor = (
  title: string,
): ScientificReportBlockReviewDescriptor => {
  const rule = REPORT_BLOCK_RULES[title] ?? {
    classification: "mixed" as const,
    resultContractId: "sci-60.publication-dashboard" as const,
  };
  return {
    blockId: `scientific-report.section.${stableBlockSlug(title)}`,
    ...rule,
  };
};

export const SCIENTIFIC_REPORT_SUMMARY_REVIEW_DESCRIPTOR: ScientificReportBlockReviewDescriptor =
  {
    blockId: "scientific-report.summary",
    classification: "mixed",
    resultContractId: "sci-60.publication-dashboard",
  };
