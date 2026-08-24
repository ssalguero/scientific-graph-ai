import { getScientificResultContract } from "../contracts/result-inventory";
import type {
  ScientificApproximationProvenance,
  ScientificConfigurationProvenance,
  ScientificMethodProvenance,
  ScientificProvenanceDescriptor,
  ScientificProvenanceValue,
  ScientificProvenanceWarning,
  ScientificSeriesProvenance,
} from "../contracts/provenance";
import type {
  ScientificProjectionArtifactIdentity,
  ScientificSemanticProjection,
} from "../contracts/semantic-parity";
import type { ScientificSemanticValue } from "../contracts/semantic-values";

export const SCIENTIFIC_NUMERIC_EXPORT_SCHEMA =
  "scientific-numeric-export/v1" as const;
export const SCIENTIFIC_NUMERIC_EXPORT_KIND =
  "scientific-graph-ai.numeric-scientific-export" as const;
export const SCIENTIFIC_NUMERIC_EXPORT_MEDIA_TYPE =
  "application/vnd.scientific-graph-ai.numeric-scientific-export+json" as const;

export type ScientificNumericExportIdentity = {
  exportId: string;
  exportedAt: string;
};

export type ScientificNumericExportCompatibility = {
  format: "json";
  version: 1;
  sourceProjection: "scientific-semantic-projection/v1";
  sourceSurface: "numeric-export-foundation";
  numberEncoding: "ieee-754-json-number-round-trip";
  generatedContentPolicy: "exclude-non-factual-semantic-values";
};

export type ScientificNumericExport = {
  schema: typeof SCIENTIFIC_NUMERIC_EXPORT_SCHEMA;
  kind: typeof SCIENTIFIC_NUMERIC_EXPORT_KIND;
  exportIdentity: ScientificNumericExportIdentity;
  artifactIdentity: ScientificProjectionArtifactIdentity;
  resultContractId: ScientificSemanticProjection["resultContractId"];
  artifactKind: ScientificSemanticProjection["artifactKind"];
  semanticValues: readonly ScientificSemanticValue[];
  sourceIdentity: ScientificSemanticProjection["sourceIdentity"];
  configurationIdentity: ScientificSemanticProjection["configurationIdentity"];
  methodIdentity: ScientificSemanticProjection["methodIdentity"];
  approximation: ScientificSemanticProjection["approximation"];
  warnings: ScientificSemanticProjection["warnings"];
  limitations: readonly string[];
  provenance: ScientificProvenanceDescriptor;
  freshness: ScientificSemanticProjection["freshness"];
  compatibility: ScientificNumericExportCompatibility;
};

export type CreateScientificNumericExportInput = {
  projection: ScientificSemanticProjection;
  exportId?: string;
  exportedAt?: string;
};

let fallbackExportSequence = 0;

export const createScientificNumericExportId = (): string => {
  const cryptoApi =
    typeof globalThis !== "undefined"
      ? (globalThis as { crypto?: { randomUUID?: () => string } }).crypto
      : undefined;
  if (typeof cryptoApi?.randomUUID === "function") {
    return `scientific-numeric-export-${cryptoApi.randomUUID()}`;
  }
  fallbackExportSequence += 1;
  return `scientific-numeric-export-${Date.now()}-${fallbackExportSequence}`;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const hasOnlyKeys = (
  value: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[] = [],
): boolean => {
  const keys = Object.keys(value);
  const allowed = new Set([...required, ...optional]);
  return (
    required.every((key) => Object.prototype.hasOwnProperty.call(value, key)) &&
    keys.every((key) => allowed.has(key)) &&
    Object.getOwnPropertySymbols(value).length === 0
  );
};

const isOptionalString = (value: unknown): boolean =>
  value === undefined || typeof value === "string";

const isIsoTimestamp = (value: unknown): value is string => {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
  ) {
    return false;
  }
  try {
    return new Date(value).toISOString() === value;
  } catch {
    return false;
  }
};

const isScientificValue = (value: unknown): value is ScientificProvenanceValue => {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return true;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) && !Object.is(value, -0);
  }
  if (Array.isArray(value)) {
    return value.every(isScientificValue);
  }
  return (
    isRecord(value) &&
    Object.getOwnPropertySymbols(value).length === 0 &&
    Object.values(value).every(isScientificValue)
  );
};

const isJsonTree = (value: unknown, ancestors = new WeakSet<object>()): boolean => {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return true;
  }
  if (typeof value === "number") {
    return Number.isFinite(value);
  }
  if (typeof value !== "object") {
    return false;
  }
  if (ancestors.has(value)) {
    return false;
  }
  ancestors.add(value);
  const valid = Array.isArray(value)
    ? value.every((child) => isJsonTree(child, ancestors))
    : isRecord(value) &&
      Object.getOwnPropertySymbols(value).length === 0 &&
      Object.values(value).every((child) => isJsonTree(child, ancestors));
  ancestors.delete(value);
  return valid;
};

const isDataset = (value: unknown): boolean =>
  isRecord(value) &&
  hasOnlyKeys(value, ["id"], ["label", "checksum"]) &&
  typeof value.id === "string" &&
  value.id.trim().length > 0 &&
  isOptionalString(value.label) &&
  isOptionalString(value.checksum);

const isSource = (value: unknown): boolean =>
  isRecord(value) &&
  hasOnlyKeys(value, ["kind"], ["id", "label"]) &&
  [
    "worksheet",
    "experimental-series",
    "import",
    "manual",
    "comparison-profile",
    "unknown",
  ].includes(String(value.kind)) &&
  isOptionalString(value.id) &&
  isOptionalString(value.label);

const isSeries = (value: unknown): value is ScientificSeriesProvenance =>
  isRecord(value) &&
  hasOnlyKeys(value, ["id"], ["label", "role"]) &&
  typeof value.id === "string" &&
  value.id.trim().length > 0 &&
  isOptionalString(value.label) &&
  (value.role === undefined ||
    ["input", "group", "response", "predictor", "weight", "other"].includes(
      String(value.role),
    ));

const isConfiguration = (
  value: unknown,
): value is ScientificConfigurationProvenance =>
  isRecord(value) &&
  hasOnlyKeys(value, ["values"], ["id"]) &&
  isOptionalString(value.id) &&
  isRecord(value.values) &&
  isScientificValue(value.values);

const isMethod = (value: unknown): value is ScientificMethodProvenance =>
  isRecord(value) &&
  hasOnlyKeys(value, ["id", "label", "parameters"], ["version"]) &&
  typeof value.id === "string" &&
  value.id.trim().length > 0 &&
  typeof value.label === "string" &&
  isOptionalString(value.version) &&
  isRecord(value.parameters) &&
  isScientificValue(value.parameters);

const APPROXIMATION_KINDS = [
  "exact-formula",
  "numerical",
  "asymptotic",
  "simulation",
  "heuristic",
  "mixed",
  "unknown",
] as const;

const isApproximation = (
  value: unknown,
): value is ScientificApproximationProvenance =>
  isRecord(value) &&
  hasOnlyKeys(value, ["kind", "details"]) &&
  APPROXIMATION_KINDS.includes(
    value.kind as (typeof APPROXIMATION_KINDS)[number],
  ) &&
  typeof value.details === "string";

const isWarning = (value: unknown): value is ScientificProvenanceWarning =>
  isRecord(value) &&
  hasOnlyKeys(value, ["code", "message", "severity"]) &&
  typeof value.code === "string" &&
  typeof value.message === "string" &&
  ["info", "warning", "error"].includes(String(value.severity));

const isProvenance = (
  value: unknown,
): value is ScientificProvenanceDescriptor =>
  isRecord(value) &&
  hasOnlyKeys(value, [
    "schema",
    "dataset",
    "source",
    "series",
    "config",
    "method",
    "approximation",
    "warnings",
  ]) &&
  value.schema === "scientific-provenance/v1" &&
  isDataset(value.dataset) &&
  isSource(value.source) &&
  Array.isArray(value.series) &&
  value.series.every(isSeries) &&
  isConfiguration(value.config) &&
  isMethod(value.method) &&
  isApproximation(value.approximation) &&
  Array.isArray(value.warnings) &&
  value.warnings.every(isWarning);

const isUncertainty = (value: unknown): boolean =>
  isRecord(value) &&
  hasOnlyKeys(value, ["kind", "value"], ["unit", "confidenceLevel"]) &&
  ["sd", "sem", "ci", "range", "custom"].includes(String(value.kind)) &&
  isScientificValue(value.value) &&
  isOptionalString(value.unit) &&
  (value.confidenceLevel === undefined ||
    (typeof value.confidenceLevel === "number" &&
      Number.isFinite(value.confidenceLevel) &&
      !Object.is(value.confidenceLevel, -0)));

const isSemanticValue = (value: unknown): value is ScientificSemanticValue =>
  isRecord(value) &&
  hasOnlyKeys(
    value,
    [
      "field",
      "value",
      "status",
      "authority",
      "approximation",
      "warnings",
      "equivalencePolicy",
    ],
    ["label", "unit", "uncertainty"],
  ) &&
  typeof value.field === "string" &&
  value.field.trim().length > 0 &&
  isOptionalString(value.label) &&
  isOptionalString(value.unit) &&
  isScientificValue(value.value) &&
  ["known", "unknown", "unsupported", "not-applicable"].includes(
    String(value.status),
  ) &&
  ["system-factual", "system-advisory", "mixed-system"].includes(
    String(value.authority),
  ) &&
  APPROXIMATION_KINDS.includes(
    value.approximation as (typeof APPROXIMATION_KINDS)[number],
  ) &&
  ["exact", "non-comparable"].includes(String(value.equivalencePolicy)) &&
  Array.isArray(value.warnings) &&
  value.warnings.every(isWarning) &&
  (value.uncertainty === undefined || isUncertainty(value.uncertainty));

const isArtifactIdentity = (
  value: unknown,
): value is ScientificProjectionArtifactIdentity => {
  if (!isRecord(value)) {
    return false;
  }
  if (value.kind === "live-derived-result") {
    return (
      hasOnlyKeys(value, [
        "kind",
        "identityScope",
        "lifecycle",
        "citable",
        "persistencePolicy",
        "requiresProvenance",
        "description",
      ]) &&
      value.identityScope === "runtime-session" &&
      value.lifecycle === "ephemeral" &&
      value.citable === false &&
      value.persistencePolicy === "forbidden" &&
      value.requiresProvenance === true &&
      typeof value.description === "string"
    );
  }
  return (
    value.kind === "citable-scientific-snapshot" &&
    hasOnlyKeys(value, [
      "kind",
      "snapshotId",
      "version",
      "capturedAt",
      "lifecycle",
      "citable",
      "persistencePolicy",
    ]) &&
    typeof value.snapshotId === "string" &&
    value.snapshotId.trim().length > 0 &&
    value.version === 1 &&
    isIsoTimestamp(value.capturedAt) &&
    value.lifecycle === "immutable" &&
    value.citable === true &&
    value.persistencePolicy === "project"
  );
};

const sortJsonValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sortJsonValue);
  }
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortJsonValue(value[key])]),
    );
  }
  return value;
};

const cloneExportValue = (
  value: unknown,
  ancestors = new WeakSet<object>(),
): unknown => {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (ancestors.has(value)) {
    throw new Error("Scientific numeric export input must not be cyclic.");
  }
  ancestors.add(value);
  const clone = Array.isArray(value)
    ? value.map((child) => cloneExportValue(child, ancestors))
    : Object.fromEntries(
        Object.entries(value)
          .filter(([, child]) => child !== undefined)
          .map(([key, child]) => [key, cloneExportValue(child, ancestors)]),
      );
  ancestors.delete(value);
  return clone;
};

const equivalentJson = (left: unknown, right: unknown): boolean =>
  JSON.stringify(sortJsonValue(left)) === JSON.stringify(sortJsonValue(right));

const deepFreeze = <T>(value: T, seen = new WeakSet<object>()): Readonly<T> => {
  if (value !== null && typeof value === "object" && !seen.has(value)) {
    seen.add(value);
    Object.values(value).forEach((child) => deepFreeze(child, seen));
    Object.freeze(value);
  }
  return value;
};

const isKnownContract = (
  value: unknown,
): value is ScientificSemanticProjection["resultContractId"] => {
  if (typeof value !== "string") {
    return false;
  }
  try {
    getScientificResultContract(
      value as ScientificSemanticProjection["resultContractId"],
    );
    return true;
  } catch {
    return false;
  }
};

export const isScientificNumericExport = (
  value: unknown,
): value is ScientificNumericExport => {
  try {
    if (!isJsonTree(value) || !isRecord(value)) {
      return false;
    }
    if (
      !hasOnlyKeys(value, [
        "schema",
        "kind",
        "exportIdentity",
        "artifactIdentity",
        "resultContractId",
        "artifactKind",
        "semanticValues",
        "sourceIdentity",
        "configurationIdentity",
        "methodIdentity",
        "approximation",
        "warnings",
        "limitations",
        "provenance",
        "freshness",
        "compatibility",
      ]) ||
      value.schema !== SCIENTIFIC_NUMERIC_EXPORT_SCHEMA ||
      value.kind !== SCIENTIFIC_NUMERIC_EXPORT_KIND ||
      !isRecord(value.exportIdentity) ||
      !hasOnlyKeys(value.exportIdentity, ["exportId", "exportedAt"]) ||
      typeof value.exportIdentity.exportId !== "string" ||
      value.exportIdentity.exportId.trim().length === 0 ||
      !isIsoTimestamp(value.exportIdentity.exportedAt) ||
      !isArtifactIdentity(value.artifactIdentity) ||
      !isKnownContract(value.resultContractId) ||
      !Array.isArray(value.semanticValues) ||
      !value.semanticValues.every(
        (semanticValue) =>
          isSemanticValue(semanticValue) &&
          semanticValue.authority === "system-factual",
      ) ||
      !isRecord(value.sourceIdentity) ||
      !hasOnlyKeys(value.sourceIdentity, ["dataset", "source", "series"]) ||
      !isDataset(value.sourceIdentity.dataset) ||
      !isSource(value.sourceIdentity.source) ||
      !Array.isArray(value.sourceIdentity.series) ||
      !value.sourceIdentity.series.every(isSeries) ||
      !isConfiguration(value.configurationIdentity) ||
      !isMethod(value.methodIdentity) ||
      !isApproximation(value.approximation) ||
      !Array.isArray(value.warnings) ||
      !value.warnings.every(isWarning) ||
      !Array.isArray(value.limitations) ||
      !value.limitations.every((item) => typeof item === "string") ||
      !isProvenance(value.provenance) ||
      !isRecord(value.freshness) ||
      !hasOnlyKeys(value.freshness, ["state", "reasons"]) ||
      !["CURRENT", "STALE", "INVALID", "UNKNOWN"].includes(
        String(value.freshness.state),
      ) ||
      !Array.isArray(value.freshness.reasons) ||
      !value.freshness.reasons.every((reason) => typeof reason === "string") ||
      !isRecord(value.compatibility) ||
      !hasOnlyKeys(value.compatibility, [
        "format",
        "version",
        "sourceProjection",
        "sourceSurface",
        "numberEncoding",
        "generatedContentPolicy",
      ]) ||
      value.compatibility.format !== "json" ||
      value.compatibility.version !== 1 ||
      value.compatibility.sourceProjection !==
        "scientific-semantic-projection/v1" ||
      value.compatibility.sourceSurface !== "numeric-export-foundation" ||
      value.compatibility.numberEncoding !==
        "ieee-754-json-number-round-trip" ||
      value.compatibility.generatedContentPolicy !==
        "exclude-non-factual-semantic-values"
    ) {
      return false;
    }

    const contract = getScientificResultContract(value.resultContractId);
    return (
      value.artifactKind === contract.artifactKind &&
      equivalentJson(value.sourceIdentity, {
        dataset: value.provenance.dataset,
        source: value.provenance.source,
        series: value.provenance.series,
      }) &&
      equivalentJson(value.configurationIdentity, value.provenance.config) &&
      equivalentJson(value.methodIdentity, value.provenance.method) &&
      equivalentJson(value.approximation, value.provenance.approximation) &&
      equivalentJson(value.warnings, value.provenance.warnings)
    );
  } catch {
    return false;
  }
};

export const createScientificNumericExport = (
  input: CreateScientificNumericExportInput,
): ScientificNumericExport => {
  if (
    input.projection.schema !== "scientific-semantic-projection/v1" ||
    input.projection.surface !== "numeric-export-foundation"
  ) {
    throw new Error(
      "Scientific numeric export requires a numeric-export-foundation projection.",
    );
  }
  const exportId = input.exportId?.trim() || createScientificNumericExportId();
  const exportedAt = input.exportedAt ?? new Date().toISOString();
  if (!isIsoTimestamp(exportedAt)) {
    throw new Error("Scientific numeric export exportedAt must be an ISO timestamp.");
  }

  let artifact: ScientificNumericExport;
  try {
    artifact = {
      schema: SCIENTIFIC_NUMERIC_EXPORT_SCHEMA,
      kind: SCIENTIFIC_NUMERIC_EXPORT_KIND,
      exportIdentity: { exportId, exportedAt },
      artifactIdentity: cloneExportValue(
        input.projection.artifactIdentity,
      ) as ScientificProjectionArtifactIdentity,
      resultContractId: input.projection.resultContractId,
      artifactKind: input.projection.artifactKind,
      semanticValues: cloneExportValue(
        input.projection.semanticValues.filter(
          (value) => value.authority === "system-factual",
        ),
      ) as readonly ScientificSemanticValue[],
      sourceIdentity: cloneExportValue(
        input.projection.sourceIdentity,
      ) as ScientificSemanticProjection["sourceIdentity"],
      configurationIdentity: cloneExportValue(
        input.projection.configurationIdentity,
      ) as ScientificSemanticProjection["configurationIdentity"],
      methodIdentity: cloneExportValue(
        input.projection.methodIdentity,
      ) as ScientificSemanticProjection["methodIdentity"],
      approximation: cloneExportValue(
        input.projection.approximation,
      ) as ScientificSemanticProjection["approximation"],
      warnings: cloneExportValue(
        input.projection.warnings,
      ) as ScientificSemanticProjection["warnings"],
      limitations: [...input.projection.limitations],
      provenance: cloneExportValue(
        input.projection.provenance,
      ) as ScientificProvenanceDescriptor,
      freshness: {
        state: input.projection.freshness.state,
        reasons: [...input.projection.freshness.reasons],
      },
      compatibility: {
        format: "json",
        version: 1,
        sourceProjection: input.projection.schema,
        sourceSurface: input.projection.surface,
        numberEncoding: "ieee-754-json-number-round-trip",
        generatedContentPolicy:
          "exclude-non-factual-semantic-values",
      },
    };
  } catch {
    throw new Error("Scientific numeric export projection is not cloneable.");
  }

  if (!isScientificNumericExport(artifact)) {
    throw new Error("Scientific numeric export projection is invalid.");
  }
  return deepFreeze(artifact) as ScientificNumericExport;
};

export const serializeScientificNumericExport = (
  artifact: ScientificNumericExport,
): string => {
  if (!isScientificNumericExport(artifact)) {
    throw new Error("Cannot serialize an invalid scientific numeric export.");
  }
  return `${JSON.stringify(sortJsonValue(artifact), null, 2)}\n`;
};

export const parseScientificNumericExport = (
  serialized: string,
): ScientificNumericExport | null => {
  try {
    const parsed: unknown = JSON.parse(serialized);
    if (!isScientificNumericExport(parsed)) {
      return null;
    }
    return deepFreeze(parsed) as ScientificNumericExport;
  } catch {
    return null;
  }
};

export type NumericScientificExport = ScientificNumericExport;
export const createNumericScientificExport = createScientificNumericExport;
export const isNumericScientificExport = isScientificNumericExport;
export const serializeNumericScientificExport =
  serializeScientificNumericExport;
export const parseNumericScientificExport = parseScientificNumericExport;
