export type CompositeMethodologyCoverageStatus =
  | "evaluated"
  | "defaulted"
  | "not-evaluated";

export type CompositeMethodologyFactorRole =
  | "score"
  | "interpretation"
  | "display";

export type CompositeMethodologyProvenance =
  | "direct-input-summary"
  | "upstream-composite-output"
  | "neutral-fallback";

export type CompositeMethodologyFactorInput = {
  id: string;
  label: string;
  role: CompositeMethodologyFactorRole;
  status: CompositeMethodologyCoverageStatus;
  provenance: CompositeMethodologyProvenance;
  fallback?: string;
};

export type CompositeMethodologyContributor = {
  id: string;
  label: string;
  role: CompositeMethodologyFactorRole;
  provenance: CompositeMethodologyProvenance;
};

export type CompositeMethodologyDisclosure = {
  methodology: "composite-decision-support";
  contributingFactors: CompositeMethodologyContributor[];
  coverage: {
    evaluated: string[];
    defaulted: string[];
    notEvaluated: string[];
  };
  defaultsAndFallbacks: string[];
  provenanceLabels: string[];
  limitations: string[];
};

export const COMPOSITE_METHODOLOGY_PRIMARY_LABELS = {
  "SCI-50": "Indicador compuesto de consistencia",
  "SCI-51": "Indicador compuesto de calidad metodológica",
  "SCI-52": "Indicador compuesto de reproducibilidad potencial",
  "SCI-53": "Indicador compuesto de soporte evidenciario",
  "SCI-54": "Indicador compuesto de cobertura de supuestos",
  "SCI-55": "Indicador compuesto de preparación para revisión",
  "SCI-56": "Resumen compuesto metodológico",
  "SCI-60": "Resumen compuesto de preparación científica",
} as const;

const COMPOSITE_METHODOLOGY_LIMITATIONS = [
  "This composite decision-support output is not an independent validation.",
  "It does not demonstrate reproducibility.",
  "It does not establish suitability for any journal.",
  "It does not attest that upstream methods were executed; it only summarizes supplied upstream outputs.",
];

export const buildCompositeMethodologyDisclosure = (
  factors: CompositeMethodologyFactorInput[]
): CompositeMethodologyDisclosure => {
  const contributingFactors = factors
    .filter((factor) => factor.status !== "not-evaluated")
    .map(({ id, label, role, provenance }) => ({
      id,
      label,
      role,
      provenance,
    }));

  return {
    methodology: "composite-decision-support",
    contributingFactors,
    coverage: {
      evaluated: factors
        .filter((factor) => factor.status === "evaluated")
        .map((factor) => factor.label),
      defaulted: factors
        .filter((factor) => factor.status === "defaulted")
        .map((factor) => factor.label),
      notEvaluated: factors
        .filter((factor) => factor.status === "not-evaluated")
        .map((factor) => factor.label),
    },
    defaultsAndFallbacks: factors.flatMap((factor) =>
      factor.fallback ? [`${factor.label}: ${factor.fallback}`] : []
    ),
    provenanceLabels: contributingFactors.map(
      (factor) => `${factor.label}: ${factor.provenance}`
    ),
    limitations: [...COMPOSITE_METHODOLOGY_LIMITATIONS],
  };
};

const formatCoverage = (items: string[]) =>
  items.length > 0 ? items.join(", ") : "none";

export const getCompositeMethodologyDisclosureReportLines = (
  disclosure: CompositeMethodologyDisclosure
): string[] => [
  "Metodología: apoyo compuesto a decisiones; no constituye validación independiente.",
  `Factores contribuyentes: ${formatCoverage(
    disclosure.contributingFactors.map((factor) => factor.label)
  )}.`,
  `Cobertura — evaluados: ${formatCoverage(
    disclosure.coverage.evaluated
  )}; predeterminados: ${formatCoverage(
    disclosure.coverage.defaulted
  )}; no evaluados: ${formatCoverage(disclosure.coverage.notEvaluated)}.`,
  `Predeterminados y fallbacks: ${formatCoverage(
    disclosure.defaultsAndFallbacks
  )}.`,
  `Proveniencia de factores: ${formatCoverage(disclosure.provenanceLabels)}.`,
  "Límites: no demuestra reproducibilidad ni idoneidad para una revista, y no acredita la ejecución de métodos upstream.",
];
