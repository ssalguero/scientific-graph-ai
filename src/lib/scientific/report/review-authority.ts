import {
  SCIENTIFIC_GENERATED_TEXT_REVIEW_SCHEMA,
  createGeneratedTextArtifactIdentityFromSnapshot,
  createGeneratedTextContentIdentity,
  createGeneratedTextEvidenceIdentity,
  freezeGeneratedTextReviewRecord,
  isGeneratedTextReviewIsoTimestamp,
  isGeneratedTextReviewRecord,
  type CreateGeneratedTextReviewRecordInput,
  type GeneratedTextArtifactIdentity,
  type GeneratedTextClassification,
  type GeneratedTextProducer,
  type GeneratedTextReviewRecord,
  type GeneratedTextReviewer,
  type GeneratedTextReviewTransition,
  type GeneratedTextReviewValidity,
} from "../contracts/generated-text-review";
import {
  isCitableScientificSnapshot,
  type CitableScientificSnapshot,
} from "../contracts/citable-snapshot";
import type { ScientificProvenanceDescriptor } from "../contracts/provenance";
import {
  getScientificResultContract,
  type ScientificResultContractId,
} from "../contracts/result-inventory";

export type CreateLiveGeneratedTextReviewInput = {
  recordId: string;
  artifactId: string;
  producer: GeneratedTextProducer;
  generatedAt: string;
  content: string;
  classification: GeneratedTextClassification;
  resultContractId: ScientificResultContractId;
  provenance: ScientificProvenanceDescriptor;
  semanticEvidence: unknown;
  validity?: GeneratedTextReviewValidity;
};

export type CreateSnapshotGeneratedTextReviewInput = {
  recordId: string;
  producer: GeneratedTextProducer;
  generatedAt: string;
  content: string;
  classification: GeneratedTextClassification;
  snapshot: CitableScientificSnapshot;
  validity?: GeneratedTextReviewValidity;
};

export type GeneratedTextReviewAction = {
  reviewer: GeneratedTextReviewer;
  at: string;
  reason?: string;
};

export type AssessGeneratedTextReviewValidityInput = {
  record: GeneratedTextReviewRecord | unknown;
  currentContent?: string;
  contentAvailable?: boolean | "unknown";
  currentSemanticEvidence?: unknown;
  evidenceAvailable?: boolean | "unknown";
  capturedSnapshot?: CitableScientificSnapshot | unknown;
};

export type GeneratedTextReviewValidityAssessment = {
  validity: GeneratedTextReviewValidity;
  reason:
    | "RECORD_INVALID"
    | "CONTENT_UNAVAILABLE"
    | "CONTENT_CONTEXT_UNKNOWN"
    | "CONTENT_CHANGED"
    | "RECORD_EXPLICITLY_INVALID"
    | "SNAPSHOT_STABLE"
    | "SNAPSHOT_CONTEXT_UNKNOWN"
    | "SNAPSHOT_INVALID"
    | "SNAPSHOT_CHANGED"
    | "SNAPSHOT_MUTATED"
    | "EVIDENCE_UNAVAILABLE"
    | "EVIDENCE_CONTEXT_UNKNOWN"
    | "LIVE_EVIDENCE_CHANGED"
    | "EVIDENCE_MATCHES";
  message: string;
};

const assertTimestamp = (value: string, label: string): void => {
  if (!isGeneratedTextReviewIsoTimestamp(value)) {
    throw new Error(`${label} must be an ISO timestamp.`);
  }
};

const assertNonEmpty = (value: string, label: string): void => {
  if (value.trim().length === 0) {
    throw new Error(`${label} must not be empty.`);
  }
};

const assertRecord: (
  value: GeneratedTextReviewRecord | unknown,
) => asserts value is GeneratedTextReviewRecord = (value) => {
  if (!isGeneratedTextReviewRecord(value)) {
    throw new Error(
      "Generated text review record must satisfy scientific-generated-text-review/v1.",
    );
  }
};

const assertChronological = (
  earlier: string,
  later: string,
  label: string,
): void => {
  if (Date.parse(later) < Date.parse(earlier)) {
    throw new Error(`${label} cannot precede the prior transition.`);
  }
};

const cloneReviewer = (
  reviewer: GeneratedTextReviewer,
): GeneratedTextReviewer => ({ ...reviewer });

const transitionRecord = (
  record: GeneratedTextReviewRecord,
  transition: GeneratedTextReviewTransition,
  patch: Partial<GeneratedTextReviewRecord>,
): GeneratedTextReviewRecord => {
  const next = {
    ...structuredClone(record),
    ...patch,
    transitions: [
      ...record.transitions.map((item) => structuredClone(item)),
      transition,
    ],
  } as GeneratedTextReviewRecord;
  if (!isGeneratedTextReviewRecord(next)) {
    throw new Error("Review transition produced an invalid review record.");
  }
  return freezeGeneratedTextReviewRecord(next);
};

export const createLiveGeneratedTextArtifactIdentity = (input: {
  artifactId: string;
  resultContractId: ScientificResultContractId;
}): GeneratedTextArtifactIdentity => {
  assertNonEmpty(input.artifactId, "artifactId");
  const contract = getScientificResultContract(input.resultContractId);
  return {
    kind: "live-derived-result",
    artifactId: input.artifactId,
    artifactKind: contract.artifactKind,
    lifecycle: "ephemeral",
    evidenceBinding: "live",
  };
};

export const createGeneratedTextReview = (
  input: CreateGeneratedTextReviewRecordInput,
): GeneratedTextReviewRecord => {
  assertNonEmpty(input.recordId, "recordId");
  assertTimestamp(input.generatedAt, "generatedAt");
  const validity = input.validity ?? "CURRENT";
  const contentIdentity = createGeneratedTextContentIdentity(input.content);
  const transition: GeneratedTextReviewTransition = {
    kind: "GENERATED",
    at: input.generatedAt,
    fromState: null,
    toState: "GENERATED",
    fromValidity: null,
    toValidity: validity,
    actor: { ...input.producer },
    reason: "Generated text entered researcher review as non-authoritative.",
  };
  const record: GeneratedTextReviewRecord = {
    schema: SCIENTIFIC_GENERATED_TEXT_REVIEW_SCHEMA,
    recordId: input.recordId,
    authority: "generated-non-authoritative",
    state: "GENERATED",
    validity,
    classification: input.classification,
    producer: { ...input.producer },
    generatedAt: input.generatedAt,
    content: input.content.replace(/\r\n/g, "\n"),
    contentIdentity,
    artifactIdentity: structuredClone(input.artifactIdentity),
    resultContractId: input.resultContractId,
    provenance: structuredClone(input.provenance),
    evidenceIdentity: { ...input.evidenceIdentity },
    transitions: [transition],
  };
  if (!isGeneratedTextReviewRecord(record)) {
    throw new Error(
      "Cannot create generated text review: input violates the review contract.",
    );
  }
  return freezeGeneratedTextReviewRecord(record);
};

export const createLiveGeneratedTextReview = (
  input: CreateLiveGeneratedTextReviewInput,
): GeneratedTextReviewRecord =>
  createGeneratedTextReview({
    recordId: input.recordId,
    producer: input.producer,
    generatedAt: input.generatedAt,
    content: input.content,
    classification: input.classification,
    artifactIdentity: createLiveGeneratedTextArtifactIdentity(input),
    resultContractId: input.resultContractId,
    provenance: input.provenance,
    evidenceIdentity: createGeneratedTextEvidenceIdentity(
      input.semanticEvidence,
      "live-semantic-evidence",
    ),
    validity: input.validity,
  });

export const createSnapshotGeneratedTextReview = (
  input: CreateSnapshotGeneratedTextReviewInput,
): GeneratedTextReviewRecord => {
  if (!isCitableScientificSnapshot(input.snapshot)) {
    throw new Error("Snapshot review requires scientific-snapshot/v1.");
  }
  return createGeneratedTextReview({
    recordId: input.recordId,
    producer: input.producer,
    generatedAt: input.generatedAt,
    content: input.content,
    classification: input.classification,
    artifactIdentity: createGeneratedTextArtifactIdentityFromSnapshot(
      input.snapshot,
    ),
    resultContractId: input.snapshot.resultContractId,
    provenance: input.snapshot.provenance,
    evidenceIdentity: createGeneratedTextEvidenceIdentity(
      input.snapshot,
      "immutable-snapshot-evidence",
    ),
    validity: input.validity,
  });
};

export const markGeneratedTextResearcherReviewed = (
  value: GeneratedTextReviewRecord | unknown,
  action: GeneratedTextReviewAction,
): GeneratedTextReviewRecord => {
  assertRecord(value);
  assertTimestamp(action.at, "reviewedAt");
  if (value.state !== "GENERATED") {
    throw new Error("Only GENERATED text can enter researcher-reviewed state.");
  }
  if (value.validity !== "CURRENT") {
    throw new Error("Only CURRENT generated text can be researcher-reviewed.");
  }
  assertChronological(value.generatedAt, action.at, "Research review");
  const reviewedBy = cloneReviewer(action.reviewer);
  return transitionRecord(
    value,
    {
      kind: "REVIEWED",
      at: action.at,
      fromState: value.state,
      toState: "RESEARCHER_REVIEWED",
      fromValidity: value.validity,
      toValidity: value.validity,
      actor: reviewedBy,
      reason: action.reason,
    },
    {
      state: "RESEARCHER_REVIEWED",
      reviewedBy,
      reviewedAt: action.at,
    },
  );
};

export const approveGeneratedTextReview = (
  value: GeneratedTextReviewRecord | unknown,
  action: GeneratedTextReviewAction,
): GeneratedTextReviewRecord => {
  assertRecord(value);
  assertTimestamp(action.at, "approvedAt");
  if (value.state !== "RESEARCHER_REVIEWED") {
    throw new Error(
      "Only RESEARCHER_REVIEWED text can enter researcher-approved state.",
    );
  }
  if (value.validity !== "CURRENT") {
    throw new Error("Only CURRENT reviewed text can be researcher-approved.");
  }
  assertChronological(value.reviewedAt!, action.at, "Research approval");
  const approvedBy = cloneReviewer(action.reviewer);
  return transitionRecord(
    value,
    {
      kind: "APPROVED",
      at: action.at,
      fromState: value.state,
      toState: "RESEARCHER_APPROVED",
      fromValidity: value.validity,
      toValidity: value.validity,
      actor: approvedBy,
      reason: action.reason,
    },
    {
      state: "RESEARCHER_APPROVED",
      approvedBy,
      approvedAt: action.at,
    },
  );
};

export const assessGeneratedTextReviewValidity = (
  input: AssessGeneratedTextReviewValidityInput,
): GeneratedTextReviewValidityAssessment => {
  if (!isGeneratedTextReviewRecord(input.record)) {
    return {
      validity: "INVALID",
      reason: "RECORD_INVALID",
      message:
        "The review record does not satisfy scientific-generated-text-review/v1.",
    };
  }
  const record = input.record;
  if (input.contentAvailable === false) {
    return {
      validity: "INVALID",
      reason: "CONTENT_UNAVAILABLE",
      message: "The reviewed generated content is no longer available.",
    };
  }
  if (
    input.contentAvailable === "unknown" &&
    input.currentContent === undefined
  ) {
    return {
      validity: "UNKNOWN",
      reason: "CONTENT_CONTEXT_UNKNOWN",
      message: "Content identity cannot be checked.",
    };
  }
  if (
    input.currentContent !== undefined &&
    createGeneratedTextContentIdentity(input.currentContent).fingerprint !==
      record.contentIdentity.fingerprint
  ) {
    return {
      validity: "INVALID",
      reason: "CONTENT_CHANGED",
      message: "Generated content changed after review.",
    };
  }
  if (record.validity === "INVALID") {
    return {
      validity: "INVALID",
      reason: "RECORD_EXPLICITLY_INVALID",
      message: "The historical review record was explicitly invalidated.",
    };
  }

  if (record.artifactIdentity.evidenceBinding === "captured") {
    if (input.capturedSnapshot === undefined) {
      return {
        validity: "UNKNOWN",
        reason: "SNAPSHOT_CONTEXT_UNKNOWN",
        message:
          "The reviewed immutable snapshot is not available for positive evidence verification.",
      };
    }
    if (!isCitableScientificSnapshot(input.capturedSnapshot)) {
      return {
        validity: "INVALID",
        reason: "SNAPSHOT_INVALID",
        message: "The referenced captured snapshot is invalid.",
      };
    }
    if (
      input.capturedSnapshot.identity.snapshotId !==
      record.artifactIdentity.snapshotId
    ) {
      return {
        validity: "STALE",
        reason: "SNAPSHOT_CHANGED",
        message:
          "The reviewed content refers to a different immutable snapshot identity.",
      };
    }
    if (
      createGeneratedTextEvidenceIdentity(
        input.capturedSnapshot,
        "immutable-snapshot-evidence",
      ).fingerprint !== record.evidenceIdentity.fingerprint
    ) {
      return {
        validity: "INVALID",
        reason: "SNAPSHOT_MUTATED",
        message:
          "The immutable snapshot identity now has divergent semantic evidence.",
      };
    }
    return {
      validity: "CURRENT",
      reason: "SNAPSHOT_STABLE",
      message:
        "The historical approval remains attached to its immutable captured evidence.",
    };
  }

  if (input.evidenceAvailable === false) {
    return {
      validity: "INVALID",
      reason: "EVIDENCE_UNAVAILABLE",
      message: "Live semantic evidence is no longer available.",
    };
  }
  if (
    input.currentSemanticEvidence === undefined ||
    input.evidenceAvailable === "unknown"
  ) {
    return {
      validity: "UNKNOWN",
      reason: "EVIDENCE_CONTEXT_UNKNOWN",
      message: "Current live semantic evidence cannot be compared.",
    };
  }
  const currentIdentity = createGeneratedTextEvidenceIdentity(
    input.currentSemanticEvidence,
    "live-semantic-evidence",
  );
  if (currentIdentity.fingerprint !== record.evidenceIdentity.fingerprint) {
    return {
      validity: "STALE",
      reason: "LIVE_EVIDENCE_CHANGED",
      message:
        "Live semantic evidence changed after the generated text was reviewed.",
    };
  }
  return {
    validity: "CURRENT",
    reason: "EVIDENCE_MATCHES",
    message: "Current live semantic evidence matches the reviewed evidence.",
  };
};

export const applyGeneratedTextValidityAssessment = (
  value: GeneratedTextReviewRecord | unknown,
  assessment: GeneratedTextReviewValidityAssessment,
  at: string,
): GeneratedTextReviewRecord => {
  assertRecord(value);
  assertTimestamp(at, "validityChangedAt");
  const lastTransition = value.transitions[value.transitions.length - 1]!;
  assertChronological(lastTransition.at, at, "Validity transition");
  if (assessment.validity === value.validity) {
    return value;
  }
  const validityRank: Record<GeneratedTextReviewValidity, number> = {
    CURRENT: 0,
    UNKNOWN: 1,
    STALE: 2,
    INVALID: 3,
  };
  if (validityRank[assessment.validity] < validityRank[value.validity]) {
    throw new Error(
      "Historical review validity cannot be upgraded; changed evidence requires a new review record.",
    );
  }
  return transitionRecord(
    value,
    {
      kind: "VALIDITY_CHANGED",
      at,
      fromState: value.state,
      toState: value.state,
      fromValidity: value.validity,
      toValidity: assessment.validity,
      reason: `${assessment.reason}: ${assessment.message}`,
    },
    { validity: assessment.validity },
  );
};

export const invalidateGeneratedTextForContentChange = (
  value: GeneratedTextReviewRecord | unknown,
  currentContent: string,
  at: string,
): GeneratedTextReviewRecord => {
  assertRecord(value);
  const assessment = assessGeneratedTextReviewValidity({
    record: value,
    currentContent,
    contentAvailable: true,
  });
  if (assessment.validity !== "INVALID") {
    throw new Error("Content identity has not changed.");
  }
  return applyGeneratedTextValidityAssessment(value, assessment, at);
};

export const refreshGeneratedTextForEvidence = (
  value: GeneratedTextReviewRecord | unknown,
  currentSemanticEvidence: unknown,
  at: string,
): GeneratedTextReviewRecord => {
  assertRecord(value);
  const assessment = assessGeneratedTextReviewValidity({
    record: value,
    currentSemanticEvidence,
    evidenceAvailable: true,
  });
  return applyGeneratedTextValidityAssessment(value, assessment, at);
};

export const reviewGeneratedText = markGeneratedTextResearcherReviewed;
export const approveGeneratedText = approveGeneratedTextReview;
