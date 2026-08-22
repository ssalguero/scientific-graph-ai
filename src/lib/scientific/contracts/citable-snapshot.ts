import type { ScientificArtifactKind } from "./artifacts";
import type { ScientificProvenanceDescriptor, ScientificProvenanceValue } from "./provenance";
import {
  canonicalizeScientificValue,
  cloneScientificSemanticValue,
  type ScientificSemanticValue,
} from "./semantic-values";
import { getScientificResultContract, type ScientificResultContractId } from "./result-inventory";

export type CitableScientificSnapshotIdentity = {
  kind: "citable-scientific-snapshot";
  snapshotId: string;
  version: 1;
  capturedAt: string;
  lifecycle: "immutable";
  citable: true;
  persistencePolicy: "project";
};

export type CitableScientificSnapshotStatus = "captured";

export type CitableScientificSnapshot = {
  schema: "scientific-snapshot/v1";
  identity: CitableScientificSnapshotIdentity;
  status: CitableScientificSnapshotStatus;
  resultContractId: ScientificResultContractId;
  artifactKind: ScientificArtifactKind;
  sourceIdentity: Pick<ScientificProvenanceDescriptor, "dataset" | "source" | "series">;
  configurationIdentity: ScientificProvenanceDescriptor["config"];
  methodIdentity: ScientificProvenanceDescriptor["method"];
  provenance: ScientificProvenanceDescriptor;
  semanticValues: readonly ScientificSemanticValue[];
  approximation: ScientificProvenanceDescriptor["approximation"];
  warnings: readonly ScientificProvenanceDescriptor["warnings"][number][];
  limitations: readonly string[];
};

export type CreateCitableScientificSnapshotInput = {
  snapshotId?: string;
  capturedAt?: string;
  resultContractId: ScientificResultContractId;
  provenance: ScientificProvenanceDescriptor;
  semanticValues: readonly ScientificSemanticValue[];
  limitations?: readonly string[];
};

let fallbackSnapshotSequence = 0;

export const createCitableSnapshotId = (): string => {
  const cryptoApi =
    typeof globalThis !== "undefined"
      ? (globalThis as { crypto?: { randomUUID?: () => string } }).crypto
      : undefined;
  if (typeof cryptoApi?.randomUUID === "function") {
    return `scientific-snapshot-${cryptoApi.randomUUID()}`;
  }
  fallbackSnapshotSequence += 1;
  return `scientific-snapshot-${Date.now()}-${fallbackSnapshotSequence}`;
};

const cloneProvenance = (
  provenance: ScientificProvenanceDescriptor,
): ScientificProvenanceDescriptor => ({
  schema: provenance.schema,
  dataset: { ...provenance.dataset },
  source: { ...provenance.source },
  series: provenance.series.map((series) => ({ ...series })),
  config: {
    ...provenance.config,
    values: structuredClone(provenance.config.values),
  },
  method: {
    ...provenance.method,
    parameters: structuredClone(provenance.method.parameters),
  },
  approximation: { ...provenance.approximation },
  warnings: provenance.warnings.map((warning) => ({ ...warning })),
});

const deepFreeze = <T>(value: T): Readonly<T> => {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value as Record<string, unknown>).forEach((child) => {
      deepFreeze(child);
    });
    Object.freeze(value);
  }
  return value;
};

const isValidIsoTimestamp = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
    return false;
  }
  try {
    return new Date(value).toISOString() === value;
  } catch {
    return false;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const isOptionalString = (value: unknown): boolean =>
  value === undefined || typeof value === "string";

const isScientificValue = (value: unknown): value is ScientificProvenanceValue => {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return true;
  }
  if (typeof value === "number") {
    return Number.isFinite(value);
  }
  if (Array.isArray(value)) {
    return value.every(isScientificValue);
  }
  return isRecord(value) && Object.values(value).every(isScientificValue);
};

const isWarning = (value: unknown): boolean =>
  isRecord(value) &&
  typeof value.code === "string" &&
  typeof value.message === "string" &&
  ["info", "warning", "error"].includes(String(value.severity));

const isProvenance = (value: unknown): value is ScientificProvenanceDescriptor => {
  if (!isRecord(value) || value.schema !== "scientific-provenance/v1") {
    return false;
  }
  const dataset = value.dataset;
  const source = value.source;
  const config = value.config;
  const method = value.method;
  const approximation = value.approximation;
  return (
    isRecord(dataset) &&
    typeof dataset.id === "string" &&
    dataset.id.trim().length > 0 &&
    isOptionalString(dataset.label) &&
    isOptionalString(dataset.checksum) &&
    isRecord(source) &&
    [
      "worksheet",
      "experimental-series",
      "import",
      "manual",
      "comparison-profile",
      "unknown",
    ].includes(String(source.kind)) &&
    isOptionalString(source.id) &&
    isOptionalString(source.label) &&
    Array.isArray(value.series) &&
    value.series.every(
      (series) =>
        isRecord(series) &&
        typeof series.id === "string" &&
        series.id.trim().length > 0 &&
        isOptionalString(series.label) &&
        (series.role === undefined ||
          ["input", "group", "response", "predictor", "weight", "other"].includes(
            String(series.role),
          )),
    ) &&
    isRecord(config) &&
    isOptionalString(config.id) &&
    isRecord(config.values) &&
    isScientificValue(config.values) &&
    isRecord(method) &&
    typeof method.id === "string" &&
    method.id.trim().length > 0 &&
    typeof method.label === "string" &&
    isOptionalString(method.version) &&
    isRecord(method.parameters) &&
    isScientificValue(method.parameters) &&
    isRecord(approximation) &&
    [
      "exact-formula",
      "numerical",
      "asymptotic",
      "simulation",
      "heuristic",
      "mixed",
      "unknown",
    ].includes(String(approximation.kind)) &&
    typeof approximation.details === "string" &&
    Array.isArray(value.warnings) &&
    value.warnings.every(isWarning)
  );
};

const isSemanticValue = (value: unknown): value is ScientificSemanticValue => {
  if (!isRecord(value)) {
    return false;
  }
  const uncertainty = value.uncertainty;
  return (
    typeof value.field === "string" &&
    value.field.trim().length > 0 &&
    isOptionalString(value.label) &&
    isOptionalString(value.unit) &&
    isScientificValue(value.value) &&
    ["known", "unknown", "unsupported", "not-applicable"].includes(String(value.status)) &&
    ["system-factual", "system-advisory", "mixed-system"].includes(String(value.authority)) &&
    [
      "exact-formula",
      "numerical",
      "asymptotic",
      "simulation",
      "heuristic",
      "mixed",
      "unknown",
    ].includes(String(value.approximation)) &&
    ["exact", "non-comparable"].includes(String(value.equivalencePolicy)) &&
    Array.isArray(value.warnings) &&
    value.warnings.every(isWarning) &&
    (uncertainty === undefined ||
      (isRecord(uncertainty) &&
        ["sd", "sem", "ci", "range", "custom"].includes(String(uncertainty.kind)) &&
        isScientificValue(uncertainty.value) &&
        (uncertainty.confidenceLevel === undefined ||
          (typeof uncertainty.confidenceLevel === "number" &&
            Number.isFinite(uncertainty.confidenceLevel))) &&
        isOptionalString(uncertainty.label)))
  );
};

const canonical = (value: ScientificProvenanceValue): string => canonicalizeScientificValue(value);

const isKnownResultContractId = (value: unknown): value is ScientificResultContractId => {
  if (typeof value !== "string") {
    return false;
  }
  try {
    getScientificResultContract(value as ScientificResultContractId);
    return true;
  } catch {
    return false;
  }
};

export const createCitableScientificSnapshot = (
  input: CreateCitableScientificSnapshotInput,
): CitableScientificSnapshot => {
  const snapshotId = input.snapshotId?.trim() || createCitableSnapshotId();
  const capturedAt = input.capturedAt ?? new Date().toISOString();
  if (!isValidIsoTimestamp(capturedAt)) {
    throw new Error("Citable snapshot capturedAt must be an ISO timestamp.");
  }

  const contract = getScientificResultContract(input.resultContractId);
  const provenance = cloneProvenance(input.provenance);
  const snapshot: CitableScientificSnapshot = {
    schema: "scientific-snapshot/v1",
    identity: {
      kind: "citable-scientific-snapshot",
      snapshotId,
      version: 1,
      capturedAt,
      lifecycle: "immutable",
      citable: true,
      persistencePolicy: "project",
    },
    status: "captured",
    resultContractId: input.resultContractId,
    artifactKind: contract.artifactKind,
    sourceIdentity: {
      dataset: { ...provenance.dataset },
      source: { ...provenance.source },
      series: provenance.series.map((series) => ({ ...series })),
    },
    configurationIdentity: {
      ...provenance.config,
      values: structuredClone(provenance.config.values),
    },
    methodIdentity: {
      ...provenance.method,
      parameters: structuredClone(provenance.method.parameters),
    },
    provenance,
    semanticValues: input.semanticValues.map(cloneScientificSemanticValue),
    approximation: { ...provenance.approximation },
    warnings: provenance.warnings.map((warning) => ({ ...warning })),
    limitations: [...(input.limitations ?? [])],
  };

  return deepFreeze(snapshot) as CitableScientificSnapshot;
};

export const isCitableScientificSnapshot = (value: unknown): value is CitableScientificSnapshot => {
  try {
    if (value === null || typeof value !== "object") {
      return false;
    }
    const candidate = value as Partial<CitableScientificSnapshot>;
    if (
      candidate.schema === "scientific-snapshot/v1" &&
      candidate.identity?.kind === "citable-scientific-snapshot" &&
      typeof candidate.identity.snapshotId === "string" &&
      candidate.identity.snapshotId.trim().length > 0 &&
      candidate.identity.version === 1 &&
      typeof candidate.identity.capturedAt === "string" &&
      isValidIsoTimestamp(candidate.identity.capturedAt) &&
      candidate.identity.lifecycle === "immutable" &&
      candidate.identity.citable === true &&
      candidate.identity.persistencePolicy === "project" &&
      candidate.status === "captured" &&
      isKnownResultContractId(candidate.resultContractId) &&
      isProvenance(candidate.provenance) &&
      Array.isArray(candidate.semanticValues) &&
      candidate.semanticValues.every(isSemanticValue) &&
      Array.isArray(candidate.limitations) &&
      candidate.limitations.every((item) => typeof item === "string") &&
      Array.isArray(candidate.warnings) &&
      candidate.warnings.every(isWarning) &&
      isRecord(candidate.sourceIdentity) &&
      isRecord(candidate.configurationIdentity) &&
      isRecord(candidate.methodIdentity) &&
      isRecord(candidate.approximation)
    ) {
      const contract = getScientificResultContract(candidate.resultContractId);
      return (
        candidate.artifactKind === contract.artifactKind &&
        canonical(candidate.sourceIdentity as ScientificProvenanceValue) ===
          canonical({
            dataset: candidate.provenance.dataset,
            source: candidate.provenance.source,
            series: candidate.provenance.series,
          }) &&
        canonical(candidate.configurationIdentity as ScientificProvenanceValue) ===
          canonical(candidate.provenance.config) &&
        canonical(candidate.methodIdentity as ScientificProvenanceValue) ===
          canonical(candidate.provenance.method) &&
        canonical(candidate.approximation as ScientificProvenanceValue) ===
          canonical(candidate.provenance.approximation) &&
        canonical(candidate.warnings as ScientificProvenanceValue) ===
          canonical(candidate.provenance.warnings)
      );
    }
    return false;
  } catch {
    return false;
  }
};

export const reviveCitableScientificSnapshot = (
  value: unknown,
): CitableScientificSnapshot | null => {
  if (!isCitableScientificSnapshot(value)) {
    return null;
  }
  try {
    return createCitableScientificSnapshot({
      snapshotId: value.identity.snapshotId,
      capturedAt: value.identity.capturedAt,
      resultContractId: value.resultContractId,
      provenance: value.provenance,
      semanticValues: value.semanticValues,
      limitations: value.limitations,
    });
  } catch {
    return null;
  }
};
