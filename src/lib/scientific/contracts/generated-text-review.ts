import {
  isCitableScientificSnapshot,
  type CitableScientificSnapshot,
} from "./citable-snapshot";
import type { ScientificArtifactKind } from "./artifacts";
import type {
  ScientificProvenanceDescriptor,
  ScientificProvenanceValue,
} from "./provenance";
import {
  getScientificResultContract,
  type ScientificResultContractId,
} from "./result-inventory";
import {
  canonicalizeScientificValue,
  toScientificValue,
} from "./semantic-values";

export const SCIENTIFIC_GENERATED_TEXT_REVIEW_SCHEMA =
  "scientific-generated-text-review/v1" as const;

export type GeneratedTextReviewState =
  | "GENERATED"
  | "RESEARCHER_REVIEWED"
  | "RESEARCHER_APPROVED";

export type GeneratedTextReviewValidity =
  | "CURRENT"
  | "STALE"
  | "INVALID"
  | "UNKNOWN";

export type GeneratedTextClassification =
  | "factual"
  | "interpretive"
  | "advisory"
  | "mixed";

export type GeneratedTextProducer = {
  kind: "system" | "researcher" | "external-tool";
  id: string;
  label?: string;
  version?: string;
};

export type GeneratedTextReviewer = {
  kind: "researcher";
  id: string;
  name?: string;
};

export type GeneratedTextContentIdentity = {
  algorithm: "canonical-scientific-value/fnv1a-dual-v1";
  fingerprint: string;
};

export type GeneratedTextEvidenceIdentity = {
  basis: "live-semantic-evidence" | "immutable-snapshot-evidence";
  algorithm: "canonical-scientific-value/fnv1a-dual-v1";
  fingerprint: string;
};

export type GeneratedTextArtifactIdentity =
  | {
      kind: "live-derived-result";
      artifactId: string;
      artifactKind: ScientificArtifactKind;
      lifecycle: "ephemeral";
      evidenceBinding: "live";
    }
  | {
      kind: "citable-scientific-snapshot";
      artifactId: string;
      artifactKind: ScientificArtifactKind;
      lifecycle: "immutable";
      evidenceBinding: "captured";
      snapshotId: string;
      snapshotVersion: 1;
      capturedAt: string;
    };

export type GeneratedTextReviewTransitionKind =
  | "GENERATED"
  | "REVIEWED"
  | "APPROVED"
  | "VALIDITY_CHANGED";

export type GeneratedTextReviewTransition = {
  kind: GeneratedTextReviewTransitionKind;
  at: string;
  fromState: GeneratedTextReviewState | null;
  toState: GeneratedTextReviewState;
  fromValidity: GeneratedTextReviewValidity | null;
  toValidity: GeneratedTextReviewValidity;
  actor?: GeneratedTextProducer | GeneratedTextReviewer;
  reason?: string;
};

export type GeneratedTextReviewRecord = {
  schema: typeof SCIENTIFIC_GENERATED_TEXT_REVIEW_SCHEMA;
  recordId: string;
  authority: "generated-non-authoritative";
  state: GeneratedTextReviewState;
  validity: GeneratedTextReviewValidity;
  classification: GeneratedTextClassification;
  producer: GeneratedTextProducer;
  generatedAt: string;
  content: string;
  contentIdentity: GeneratedTextContentIdentity;
  artifactIdentity: GeneratedTextArtifactIdentity;
  resultContractId: ScientificResultContractId;
  provenance: ScientificProvenanceDescriptor;
  evidenceIdentity: GeneratedTextEvidenceIdentity;
  reviewedBy?: GeneratedTextReviewer;
  reviewedAt?: string;
  approvedBy?: GeneratedTextReviewer;
  approvedAt?: string;
  transitions: readonly GeneratedTextReviewTransition[];
};

export type CreateGeneratedTextReviewRecordInput = Omit<
  GeneratedTextReviewRecord,
  | "schema"
  | "authority"
  | "state"
  | "validity"
  | "contentIdentity"
  | "reviewedBy"
  | "reviewedAt"
  | "approvedBy"
  | "approvedAt"
  | "transitions"
> & {
  validity?: GeneratedTextReviewValidity;
};

const REVIEW_STATES: readonly GeneratedTextReviewState[] = [
  "GENERATED",
  "RESEARCHER_REVIEWED",
  "RESEARCHER_APPROVED",
];

const REVIEW_VALIDITIES: readonly GeneratedTextReviewValidity[] = [
  "CURRENT",
  "STALE",
  "INVALID",
  "UNKNOWN",
];

const CLASSIFICATIONS: readonly GeneratedTextClassification[] = [
  "factual",
  "interpretive",
  "advisory",
  "mixed",
];

const ARTIFACT_KINDS: readonly ScientificArtifactKind[] = [
  "dataset",
  "source",
  "series",
  "configuration",
  "scientific-result",
  "aggregate-result",
  "comparison-snapshot",
  "workflow-state",
  "visualization",
  "preview-values",
  "report",
  "live-derived-result",
  "citable-scientific-snapshot",
];

export const isGeneratedTextReviewIsoTimestamp = (
  value: unknown,
): value is string => {
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

const isRecord = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isOptionalString = (value: unknown): boolean =>
  value === undefined || typeof value === "string";

const isScientificValue = (
  value: unknown,
): value is ScientificProvenanceValue => {
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
  if (Array.isArray(value)) {
    return value.every(isScientificValue);
  }
  return isRecord(value) && Object.values(value).every(isScientificValue);
};

const isProducer = (value: unknown): value is GeneratedTextProducer =>
  isRecord(value) &&
  ["system", "researcher", "external-tool"].includes(String(value.kind)) &&
  isNonEmptyString(value.id) &&
  isOptionalString(value.label) &&
  isOptionalString(value.version);

const isReviewer = (value: unknown): value is GeneratedTextReviewer =>
  isRecord(value) &&
  value.kind === "researcher" &&
  isNonEmptyString(value.id) &&
  isOptionalString(value.name);

const isFingerprint = (value: unknown): value is string =>
  typeof value === "string" && /^sga-v1-[0-9a-f]{16}$/.test(value);

const isContentIdentity = (
  value: unknown,
): value is GeneratedTextContentIdentity =>
  isRecord(value) &&
  value.algorithm === "canonical-scientific-value/fnv1a-dual-v1" &&
  isFingerprint(value.fingerprint);

const isEvidenceIdentity = (
  value: unknown,
): value is GeneratedTextEvidenceIdentity =>
  isRecord(value) &&
  ["live-semantic-evidence", "immutable-snapshot-evidence"].includes(
    String(value.basis),
  ) &&
  value.algorithm === "canonical-scientific-value/fnv1a-dual-v1" &&
  isFingerprint(value.fingerprint);

const isProvenanceWarning = (value: unknown): boolean =>
  isRecord(value) &&
  typeof value.code === "string" &&
  typeof value.message === "string" &&
  ["info", "warning", "error"].includes(String(value.severity));

const isArtifactIdentity = (
  value: unknown,
): value is GeneratedTextArtifactIdentity => {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.artifactId) ||
    !ARTIFACT_KINDS.includes(value.artifactKind as ScientificArtifactKind)
  ) {
    return false;
  }
  if (value.kind === "live-derived-result") {
    return (
      value.lifecycle === "ephemeral" && value.evidenceBinding === "live"
    );
  }
  return (
    value.kind === "citable-scientific-snapshot" &&
    value.lifecycle === "immutable" &&
    value.evidenceBinding === "captured" &&
    isNonEmptyString(value.snapshotId) &&
    value.snapshotVersion === 1 &&
    isGeneratedTextReviewIsoTimestamp(value.capturedAt)
  );
};

const isProvenance = (
  value: unknown,
): value is ScientificProvenanceDescriptor => {
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
    isNonEmptyString(dataset.id) &&
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
        isNonEmptyString(series.id) &&
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
    isNonEmptyString(method.id) &&
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
    value.warnings.every(isProvenanceWarning)
  );
};

const isKnownResultContract = (
  value: unknown,
): value is ScientificResultContractId => {
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

const isTransition = (
  value: unknown,
): value is GeneratedTextReviewTransition =>
  isRecord(value) &&
  ["GENERATED", "REVIEWED", "APPROVED", "VALIDITY_CHANGED"].includes(
    String(value.kind),
  ) &&
  isGeneratedTextReviewIsoTimestamp(value.at) &&
  (value.fromState === null ||
    REVIEW_STATES.includes(value.fromState as GeneratedTextReviewState)) &&
  REVIEW_STATES.includes(value.toState as GeneratedTextReviewState) &&
  (value.fromValidity === null ||
    REVIEW_VALIDITIES.includes(
      value.fromValidity as GeneratedTextReviewValidity,
    )) &&
  REVIEW_VALIDITIES.includes(
    value.toValidity as GeneratedTextReviewValidity,
  ) &&
  (value.actor === undefined ||
    isProducer(value.actor) ||
    isReviewer(value.actor)) &&
  isOptionalString(value.reason);

const REVIEW_VALIDITY_RANK: Record<GeneratedTextReviewValidity, number> = {
  CURRENT: 0,
  UNKNOWN: 1,
  STALE: 2,
  INVALID: 3,
};

const hasCoherentTransitionHistory = (
  record: GeneratedTextReviewRecord,
): boolean => {
  let state: GeneratedTextReviewState | null = null;
  let validity: GeneratedTextReviewValidity | null = null;
  let previousAt: string | null = null;
  let reviewedTransition: GeneratedTextReviewTransition | undefined;
  let approvedTransition: GeneratedTextReviewTransition | undefined;

  for (const transition of record.transitions) {
    if (
      transition.fromState !== state ||
      transition.fromValidity !== validity ||
      (previousAt !== null && Date.parse(transition.at) < Date.parse(previousAt))
    ) {
      return false;
    }
    if (transition.kind === "GENERATED") {
      if (
        state !== null ||
        transition.toState !== "GENERATED" ||
        !isProducer(transition.actor) ||
        transition.actor.id !== record.producer.id ||
        transition.at !== record.generatedAt
      ) {
        return false;
      }
    } else if (transition.kind === "REVIEWED") {
      if (
        state !== "GENERATED" ||
        transition.toState !== "RESEARCHER_REVIEWED" ||
        validity !== "CURRENT" ||
        transition.toValidity !== validity ||
        !isReviewer(transition.actor) ||
        reviewedTransition !== undefined
      ) {
        return false;
      }
      reviewedTransition = transition;
    } else if (transition.kind === "APPROVED") {
      if (
        state !== "RESEARCHER_REVIEWED" ||
        transition.toState !== "RESEARCHER_APPROVED" ||
        validity !== "CURRENT" ||
        transition.toValidity !== validity ||
        !isReviewer(transition.actor) ||
        approvedTransition !== undefined
      ) {
        return false;
      }
      approvedTransition = transition;
    } else {
      if (
        transition.toState !== state ||
        transition.fromValidity === null ||
        REVIEW_VALIDITY_RANK[transition.toValidity] <
          REVIEW_VALIDITY_RANK[transition.fromValidity]
      ) {
        return false;
      }
    }
    state = transition.toState;
    validity = transition.toValidity;
    previousAt = transition.at;
  }

  return (
    state === record.state &&
    validity === record.validity &&
    (reviewedTransition === undefined
      ? record.reviewedAt === undefined
      : reviewedTransition.at === record.reviewedAt &&
        isReviewer(reviewedTransition.actor) &&
        reviewedTransition.actor.id === record.reviewedBy?.id) &&
    (approvedTransition === undefined
      ? record.approvedAt === undefined
      : approvedTransition.at === record.approvedAt &&
        isReviewer(approvedTransition.actor) &&
        approvedTransition.actor.id === record.approvedBy?.id)
  );
};

const hasCoherentReviewState = (
  value: Partial<GeneratedTextReviewRecord>,
): boolean => {
  if (value.state === "GENERATED") {
    return (
      value.reviewedBy === undefined &&
      value.reviewedAt === undefined &&
      value.approvedBy === undefined &&
      value.approvedAt === undefined
    );
  }
  if (!isReviewer(value.reviewedBy) || !isGeneratedTextReviewIsoTimestamp(value.reviewedAt)) {
    return false;
  }
  if (value.state === "RESEARCHER_REVIEWED") {
    return value.approvedBy === undefined && value.approvedAt === undefined;
  }
  return (
    isReviewer(value.approvedBy) &&
    isGeneratedTextReviewIsoTimestamp(value.approvedAt)
  );
};

export const fingerprintGeneratedTextValue = (value: unknown): string => {
  const canonical = canonicalizeScientificValue(toScientificValue(value));
  let first = 0x811c9dc5;
  let second = 0x9e3779b9;
  for (let index = 0; index < canonical.length; index += 1) {
    const code = canonical.charCodeAt(index);
    first ^= code;
    first = Math.imul(first, 0x01000193) >>> 0;
    second ^= code + index;
    second = Math.imul(second, 0x85ebca6b) >>> 0;
  }
  return `sga-v1-${first.toString(16).padStart(8, "0")}${second
    .toString(16)
    .padStart(8, "0")}`;
};

export const createGeneratedTextContentIdentity = (
  content: string,
): GeneratedTextContentIdentity => ({
  algorithm: "canonical-scientific-value/fnv1a-dual-v1",
  fingerprint: fingerprintGeneratedTextValue(content.replace(/\r\n/g, "\n")),
});

export const createGeneratedTextEvidenceIdentity = (
  evidence: unknown,
  basis: GeneratedTextEvidenceIdentity["basis"],
): GeneratedTextEvidenceIdentity => ({
  basis,
  algorithm: "canonical-scientific-value/fnv1a-dual-v1",
  fingerprint: fingerprintGeneratedTextValue(evidence),
});

export const createGeneratedTextArtifactIdentityFromSnapshot = (
  snapshot: CitableScientificSnapshot,
): GeneratedTextArtifactIdentity => {
  if (!isCitableScientificSnapshot(snapshot)) {
    throw new Error("Generated text requires a valid scientific snapshot.");
  }
  return {
    kind: "citable-scientific-snapshot",
    artifactId: snapshot.identity.snapshotId,
    artifactKind: snapshot.artifactKind,
    lifecycle: "immutable",
    evidenceBinding: "captured",
    snapshotId: snapshot.identity.snapshotId,
    snapshotVersion: snapshot.identity.version,
    capturedAt: snapshot.identity.capturedAt,
  };
};

export const isGeneratedTextReviewRecord = (
  value: unknown,
): value is GeneratedTextReviewRecord => {
  try {
    if (!isRecord(value)) {
      return false;
    }
    const candidate = value as Partial<GeneratedTextReviewRecord>;
    if (
      candidate.schema !== SCIENTIFIC_GENERATED_TEXT_REVIEW_SCHEMA ||
      !isNonEmptyString(candidate.recordId) ||
      candidate.authority !== "generated-non-authoritative" ||
      !REVIEW_STATES.includes(candidate.state as GeneratedTextReviewState) ||
      !REVIEW_VALIDITIES.includes(
        candidate.validity as GeneratedTextReviewValidity,
      ) ||
      !CLASSIFICATIONS.includes(
        candidate.classification as GeneratedTextClassification,
      ) ||
      !isProducer(candidate.producer) ||
      !isGeneratedTextReviewIsoTimestamp(candidate.generatedAt) ||
      typeof candidate.content !== "string" ||
      !isContentIdentity(candidate.contentIdentity) ||
      !isArtifactIdentity(candidate.artifactIdentity) ||
      !isKnownResultContract(candidate.resultContractId) ||
      !isProvenance(candidate.provenance) ||
      !isEvidenceIdentity(candidate.evidenceIdentity) ||
      !Array.isArray(candidate.transitions) ||
      candidate.transitions.length === 0 ||
      !candidate.transitions.every(isTransition) ||
      !hasCoherentReviewState(candidate)
    ) {
      return false;
    }
    const contract = getScientificResultContract(candidate.resultContractId);
    const first = candidate.transitions[0];
    const last = candidate.transitions[candidate.transitions.length - 1];
    return (
      candidate.artifactIdentity.artifactKind === contract.artifactKind &&
      candidate.contentIdentity.fingerprint ===
        createGeneratedTextContentIdentity(candidate.content).fingerprint &&
      candidate.evidenceIdentity.basis ===
        (candidate.artifactIdentity.evidenceBinding === "captured"
          ? "immutable-snapshot-evidence"
          : "live-semantic-evidence") &&
      first?.kind === "GENERATED" &&
      first.fromState === null &&
      first.toState === "GENERATED" &&
      last?.toState === candidate.state &&
      last.toValidity === candidate.validity &&
      hasCoherentTransitionHistory(candidate as GeneratedTextReviewRecord)
    );
  } catch {
    return false;
  }
};

const deepFreeze = <T>(value: T): Readonly<T> => {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value as Record<string, unknown>).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
};

export const freezeGeneratedTextReviewRecord = (
  value: GeneratedTextReviewRecord,
): GeneratedTextReviewRecord =>
  deepFreeze(structuredClone(value)) as GeneratedTextReviewRecord;

export const reviveGeneratedTextReviewRecord = (
  value: unknown,
): GeneratedTextReviewRecord | null => {
  if (!isGeneratedTextReviewRecord(value)) {
    return null;
  }
  return freezeGeneratedTextReviewRecord(value);
};
