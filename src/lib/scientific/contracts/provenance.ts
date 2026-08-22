/**
 * CTR-03 — Provenance vocabulary is domain-owned and has no dependency on
 * DATA internals or persistence models.
 */
export type ScientificProvenancePrimitive = string | number | boolean | null;

export type ScientificProvenanceValue =
  | ScientificProvenancePrimitive
  | readonly ScientificProvenanceValue[]
  | { readonly [key: string]: ScientificProvenanceValue };

export type ScientificDatasetProvenance = {
  id: string;
  label?: string;
  checksum?: string;
};

export type ScientificSourceProvenance = {
  kind:
    | "worksheet"
    | "experimental-series"
    | "import"
    | "manual"
    | "comparison-profile"
    | "unknown";
  id?: string;
  label?: string;
};

export type ScientificSeriesProvenance = {
  id: string;
  label?: string;
  role?: "input" | "group" | "response" | "predictor" | "weight" | "other";
};

export type ScientificConfigurationProvenance = {
  id?: string;
  values: Readonly<Record<string, ScientificProvenanceValue>>;
};

export type ScientificMethodProvenance = {
  id: string;
  label: string;
  version?: string;
  parameters: Readonly<Record<string, ScientificProvenanceValue>>;
};

export type ScientificApproximationKind =
  | "exact-formula"
  | "numerical"
  | "asymptotic"
  | "simulation"
  | "heuristic"
  | "mixed"
  | "unknown";

export type ScientificApproximationProvenance = {
  kind: ScientificApproximationKind;
  details: string;
};

export type ScientificProvenanceWarning = {
  code: string;
  message: string;
  severity: "info" | "warning" | "error";
};

export type ScientificProvenanceDescriptor = {
  schema: "scientific-provenance/v1";
  dataset: ScientificDatasetProvenance;
  source: ScientificSourceProvenance;
  series: readonly ScientificSeriesProvenance[];
  config: ScientificConfigurationProvenance;
  method: ScientificMethodProvenance;
  approximation: ScientificApproximationProvenance;
  warnings: readonly ScientificProvenanceWarning[];
};

export type ComposeScientificProvenanceInput = Omit<
  ScientificProvenanceDescriptor,
  "schema"
>;

const cloneProvenanceValue = (
  value: ScientificProvenanceValue
): ScientificProvenanceValue => {
  if (Array.isArray(value)) {
    return value.map(cloneProvenanceValue);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key,
        cloneProvenanceValue(child),
      ])
    );
  }
  return value;
};

const cloneValues = (
  values: Readonly<Record<string, ScientificProvenanceValue>>
): Readonly<Record<string, ScientificProvenanceValue>> =>
  Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      cloneProvenanceValue(value),
    ])
  );

/**
 * Pure, deterministic composition: no timestamps, generated ids, storage
 * reads, global state, or mutation of caller-owned objects.
 */
export const composeScientificProvenance = (
  input: ComposeScientificProvenanceInput
): ScientificProvenanceDescriptor => ({
  schema: "scientific-provenance/v1",
  dataset: { ...input.dataset },
  source: { ...input.source },
  series: input.series.map((series) => ({ ...series })),
  config: {
    ...input.config,
    values: cloneValues(input.config.values),
  },
  method: {
    ...input.method,
    parameters: cloneValues(input.method.parameters),
  },
  approximation: { ...input.approximation },
  warnings: input.warnings.map((warning) => ({ ...warning })),
});
