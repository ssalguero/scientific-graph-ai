import type {
  ScientificApproximationKind,
  ScientificProvenanceValue,
  ScientificProvenanceWarning,
} from "./provenance";

export type ScientificSemanticValueStatus = "known" | "unknown" | "unsupported" | "not-applicable";

export type ScientificSemanticAuthority = "system-factual" | "system-advisory" | "mixed-system";

export type ScientificSemanticEquivalencePolicy = "exact" | "non-comparable";

export type ScientificSemanticUncertainty = {
  kind: "sd" | "sem" | "ci" | "range" | "custom";
  value: ScientificProvenanceValue;
  unit?: string;
  confidenceLevel?: number;
};

export type ScientificSemanticValue = {
  field: string;
  label?: string;
  value: ScientificProvenanceValue;
  unit?: string;
  status: ScientificSemanticValueStatus;
  authority: ScientificSemanticAuthority;
  approximation: ScientificApproximationKind;
  uncertainty?: ScientificSemanticUncertainty;
  warnings: readonly ScientificProvenanceWarning[];
  equivalencePolicy: ScientificSemanticEquivalencePolicy;
};

export type CreateScientificSemanticValueInput = Omit<
  ScientificSemanticValue,
  "value" | "warnings"
> & {
  value: ScientificProvenanceValue;
  warnings?: readonly ScientificProvenanceWarning[];
};

export const cloneScientificValue = (
  value: ScientificProvenanceValue,
): ScientificProvenanceValue => {
  if (Array.isArray(value)) {
    return value.map(cloneScientificValue);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, cloneScientificValue(child)]),
    );
  }
  return value;
};

const sortScientificValue = (value: ScientificProvenanceValue): ScientificProvenanceValue => {
  if (Array.isArray(value)) {
    return value.map(sortScientificValue);
  }
  if (value !== null && typeof value === "object") {
    const record = value as {
      readonly [key: string]: ScientificProvenanceValue;
    };
    return Object.fromEntries(
      Object.keys(record)
        .sort()
        .map((key) => [key, sortScientificValue(record[key]!)]),
    );
  }
  return value;
};

export const canonicalizeScientificValue = (value: ScientificProvenanceValue): string =>
  JSON.stringify(sortScientificValue(value));

export const toScientificValue = (input: unknown): ScientificProvenanceValue => {
  if (input === null || typeof input === "string" || typeof input === "boolean") {
    return input;
  }
  if (typeof input === "number") {
    return Number.isFinite(input) ? input : null;
  }
  if (Array.isArray(input)) {
    return input.map(toScientificValue);
  }
  if (typeof input === "object") {
    return Object.fromEntries(
      Object.entries(input)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, toScientificValue(value)]),
    );
  }
  return null;
};

export const createScientificSemanticValue = (
  input: CreateScientificSemanticValueInput,
): ScientificSemanticValue => ({
  ...input,
  value: cloneScientificValue(input.value),
  warnings: (input.warnings ?? []).map((warning) => ({ ...warning })),
  uncertainty: input.uncertainty
    ? {
        ...input.uncertainty,
        value: cloneScientificValue(input.uncertainty.value),
      }
    : undefined,
});

export const cloneScientificSemanticValue = (
  value: ScientificSemanticValue,
): ScientificSemanticValue =>
  createScientificSemanticValue({
    ...value,
    warnings: value.warnings,
  });
