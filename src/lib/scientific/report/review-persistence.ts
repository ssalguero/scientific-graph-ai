import {
  fingerprintGeneratedTextValue,
  isGeneratedTextReviewRecord,
  reviveGeneratedTextReviewRecord,
  type GeneratedTextReviewRecord,
} from "../contracts/generated-text-review";
import { applyGeneratedTextValidityAssessment } from "./review-authority";

export const REVIEW_AUTHORITY_PROJECT_EXTENSION_KEY =
  "scientific-graph-ai.review-authority/v1" as const;

export const REVIEW_AUTHORITY_STORE_SCHEMA =
  "scientific-generated-text-review-store/v1" as const;

export type ReviewAuthorityStore = {
  schema: typeof REVIEW_AUTHORITY_STORE_SCHEMA;
  records: readonly GeneratedTextReviewRecord[];
};

export type ProjectWithExtensions = {
  extensions?: Record<string, unknown>;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const hasUniqueRecordIds = (
  records: readonly GeneratedTextReviewRecord[],
): boolean =>
  new Set(records.map((record) => record.recordId)).size === records.length;

const jsonClone = <T>(value: T): T =>
  JSON.parse(JSON.stringify(value)) as T;

export const isReviewAuthorityStore = (
  value: unknown,
): value is ReviewAuthorityStore =>
  isRecord(value) &&
  value.schema === REVIEW_AUTHORITY_STORE_SCHEMA &&
  Array.isArray(value.records) &&
  value.records.every(isGeneratedTextReviewRecord) &&
  hasUniqueRecordIds(value.records);

/**
 * Produces a JSON-safe extension payload. Invalid or duplicate records are
 * rejected rather than silently persisted.
 */
export const serializeReviewAuthorityRecords = (
  records: readonly GeneratedTextReviewRecord[],
): ReviewAuthorityStore => {
  if (!records.every(isGeneratedTextReviewRecord)) {
    throw new Error(
      "All persisted review records must satisfy scientific-generated-text-review/v1.",
    );
  }
  if (!hasUniqueRecordIds(records)) {
    throw new Error("Review record ids must be unique within a project.");
  }
  return jsonClone({
    schema: REVIEW_AUTHORITY_STORE_SCHEMA,
    records,
  });
};

/**
 * Revives valid records independently so malformed project extension data
 * cannot leak mutable or unvalidated state into review authority.
 */
export const reviveReviewAuthorityRecords = (
  value: unknown,
): readonly GeneratedTextReviewRecord[] => {
  if (
    !isRecord(value) ||
    value.schema !== REVIEW_AUTHORITY_STORE_SCHEMA ||
    !Array.isArray(value.records)
  ) {
    return [];
  }
  const revived: GeneratedTextReviewRecord[] = [];
  const ids = new Set<string>();
  for (const candidate of value.records) {
    const record = reviveGeneratedTextReviewRecord(candidate);
    if (!record || ids.has(record.recordId)) {
      continue;
    }
    ids.add(record.recordId);
    revived.push(record);
  }
  return Object.freeze(revived);
};

export const getReviewAuthorityRecordsFromExtensions = (
  extensions: Record<string, unknown> | undefined,
): readonly GeneratedTextReviewRecord[] =>
  reviveReviewAuthorityRecords(
    extensions?.[REVIEW_AUTHORITY_PROJECT_EXTENSION_KEY],
  );

export const getReviewAuthorityRecordsFromProject = (
  project: ProjectWithExtensions | unknown,
): readonly GeneratedTextReviewRecord[] => {
  if (!isRecord(project)) {
    return [];
  }
  const extensions = isRecord(project.extensions)
    ? project.extensions
    : undefined;
  return getReviewAuthorityRecordsFromExtensions(extensions);
};

export const setReviewAuthorityRecordsOnExtensions = (
  extensions: Record<string, unknown> | undefined,
  records: readonly GeneratedTextReviewRecord[],
): Record<string, unknown> => ({
  ...(extensions ?? {}),
  [REVIEW_AUTHORITY_PROJECT_EXTENSION_KEY]:
    serializeReviewAuthorityRecords(records),
});

/**
 * Returns a new project value and never mutates the caller-owned Project or
 * its extensions object.
 */
export const setReviewAuthorityRecordsOnProject = <
  T extends ProjectWithExtensions,
>(
  project: T,
  records: readonly GeneratedTextReviewRecord[],
): T => ({
  ...project,
  extensions: setReviewAuthorityRecordsOnExtensions(
    project.extensions,
    records,
  ),
});

export const serializeReviewAuthorityToProject =
  setReviewAuthorityRecordsOnProject;
export const reviveReviewAuthorityFromProject =
  getReviewAuthorityRecordsFromProject;

const hasSameReviewBinding = (
  left: GeneratedTextReviewRecord,
  right: GeneratedTextReviewRecord,
): boolean =>
  left.artifactIdentity.artifactId === right.artifactIdentity.artifactId &&
  left.resultContractId === right.resultContractId &&
  left.classification === right.classification &&
  left.producer.kind === right.producer.kind &&
  left.producer.id === right.producer.id &&
  left.producer.label === right.producer.label &&
  left.producer.version === right.producer.version &&
  left.contentIdentity.fingerprint === right.contentIdentity.fingerprint &&
  fingerprintGeneratedTextValue(left.provenance) ===
    fingerprintGeneratedTextValue(right.provenance) &&
  left.evidenceIdentity.fingerprint === right.evidenceIdentity.fingerprint;

/**
 * Preserves current approval for an unchanged identity, degrades historical
 * live bindings when evidence changes, and creates a fresh GENERATED revision
 * when a previously invalidated identity recurs.
 */
export const reconcileGeneratedTextReviewRecords = (
  existing: readonly GeneratedTextReviewRecord[],
  currentDrafts: readonly GeneratedTextReviewRecord[],
  changedAt: string,
): readonly GeneratedTextReviewRecord[] => {
  if (
    !existing.every(isGeneratedTextReviewRecord) ||
    !currentDrafts.every(isGeneratedTextReviewRecord)
  ) {
    throw new Error("Review reconciliation requires valid review records.");
  }
  const knownIds = new Set(existing.map((record) => record.recordId));
  const additions: GeneratedTextReviewRecord[] = [];
  currentDrafts.forEach((draft) => {
    if (
      existing.some(
        (record) =>
          record.validity === "CURRENT" &&
          hasSameReviewBinding(record, draft),
      )
    ) {
      return;
    }
    let candidate = draft;
    let ordinal = existing.length + additions.length + 1;
    while (knownIds.has(candidate.recordId)) {
      candidate = {
        ...structuredClone(draft),
        recordId: `${draft.recordId}:revision:${fingerprintGeneratedTextValue({
          generatedAt: draft.generatedAt,
          ordinal,
        })}`,
      };
      ordinal += 1;
    }
    knownIds.add(candidate.recordId);
    additions.push(candidate);
  });

  const currentByArtifactId = new Map(
    currentDrafts.map((record) => [record.artifactIdentity.artifactId, record]),
  );
  const historical = existing.map((record) => {
    const current = currentByArtifactId.get(record.artifactIdentity.artifactId);
    if (
      !current ||
      hasSameReviewBinding(record, current) ||
      record.artifactIdentity.evidenceBinding !== "live" ||
      record.validity !== "CURRENT"
    ) {
      return record;
    }
    const contentChanged =
      current.contentIdentity.fingerprint !== record.contentIdentity.fingerprint;
    const provenanceChanged =
      fingerprintGeneratedTextValue(current.provenance) !==
      fingerprintGeneratedTextValue(record.provenance);
    return applyGeneratedTextValidityAssessment(
      record,
      {
        validity: contentChanged ? "INVALID" : "STALE",
        reason: contentChanged ? "CONTENT_CHANGED" : "LIVE_EVIDENCE_CHANGED",
        message: contentChanged
          ? "A newer generated block has different content."
          : provenanceChanged
            ? "A newer generated block is bound to changed scientific provenance."
          : "A newer generated block is bound to changed live scientific evidence.",
      },
      changedAt,
    );
  });
  const changed =
    additions.length > 0 ||
    historical.some((record, index) => record !== existing[index]);
  return changed ? [...historical, ...additions] : existing;
};

export const resolveCurrentGeneratedTextReviewBinding = (
  draft: GeneratedTextReviewRecord,
  records: readonly GeneratedTextReviewRecord[],
): GeneratedTextReviewRecord | null => {
  for (let index = records.length - 1; index >= 0; index -= 1) {
    const record = records[index]!;
    if (record.validity === "CURRENT" && hasSameReviewBinding(record, draft)) {
      return record;
    }
  }
  return null;
};
