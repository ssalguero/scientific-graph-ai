import type { ProjectDatasetV2 } from "./types-v2";

/** Ephemeral runtime prefix — must never appear in `ProjectDatasetV2.id`. */
export const SESSION_RUNTIME_DATASET_ID_PREFIX = "session-ds-" as const;

export const PERSISTED_DATASET_ID_SEPARATOR = "::" as const;

/** Migrator-only suffix for the V1 primary dataset. Not required for native V2 files. */
export const PRIMARY_DATASET_ID_SUFFIX = "primary" as const;

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SEQUENCED_DATASET_ID_PATTERN = /^(.+)::ds-(\d+)$/;

export class DatasetIdPolicyError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "DatasetIdPolicyError";
    this.code = code;
  }
}

export const isSessionRuntimeDatasetId = (id: string): boolean =>
  id.startsWith(SESSION_RUNTIME_DATASET_ID_PREFIX);

export const isUuidDatasetId = (id: string): boolean =>
  UUID_V4_PATTERN.test(id.trim());

/**
 * Migrator-only rule: `{projectMetadataId}::primary`.
 * See `migrations/README.md`.
 */
export const toPrimaryDatasetId = (projectMetadataId: string): string => {
  const normalizedProjectId = projectMetadataId.trim();
  if (!normalizedProjectId) {
    throw new DatasetIdPolicyError(
      "DS-ID-PROJECT-METADATA-EMPTY",
      "Project metadata id is required to build a primary dataset id."
    );
  }

  return `${normalizedProjectId}${PERSISTED_DATASET_ID_SEPARATOR}${PRIMARY_DATASET_ID_SUFFIX}`;
};

/** Native multi-dataset id: `{projectMetadataId}::ds-{sequence}`. */
export const toSequencedDatasetId = (
  projectMetadataId: string,
  sequence: number
): string => {
  const normalizedProjectId = projectMetadataId.trim();
  if (!normalizedProjectId) {
    throw new DatasetIdPolicyError(
      "DS-ID-PROJECT-METADATA-EMPTY",
      "Project metadata id is required to build a sequenced dataset id."
    );
  }

  if (!Number.isInteger(sequence) || sequence < 1) {
    throw new DatasetIdPolicyError(
      "DS-ID-SEQUENCE-INVALID",
      "Sequenced dataset id requires a positive integer sequence."
    );
  }

  return `${normalizedProjectId}${PERSISTED_DATASET_ID_SEPARATOR}ds-${sequence}`;
};

/** New native dataset id — UUID v4 (runtime-independent). */
export const createPersistedDatasetUuid = (): string => crypto.randomUUID();

export const isPrimaryMigratedDatasetId = (
  id: string,
  projectMetadataId?: string
): boolean => {
  const trimmed = id.trim();
  if (!trimmed.endsWith(`${PERSISTED_DATASET_ID_SEPARATOR}${PRIMARY_DATASET_ID_SUFFIX}`)) {
    return false;
  }

  if (projectMetadataId === undefined) {
    return true;
  }

  return trimmed === toPrimaryDatasetId(projectMetadataId);
};

export const isPersistedDomainDatasetId = (id: string): boolean => {
  const trimmed = id.trim();
  return trimmed.length > 0 && !isSessionRuntimeDatasetId(trimmed);
};

export const assertPersistedDomainDatasetId = (id: string): void => {
  const trimmed = id.trim();

  if (!trimmed) {
    throw new DatasetIdPolicyError(
      "DS-ID-EMPTY",
      "Persisted dataset id must be a non-empty string."
    );
  }

  if (isSessionRuntimeDatasetId(trimmed)) {
    throw new DatasetIdPolicyError(
      "DS-ID-RUNTIME-LEAK",
      "Session runtime ids cannot be written to persisted domain datasets."
    );
  }
};

/**
 * Returns the canonical persisted id unchanged after validation.
 * Never generates, transforms, or rewrites ids.
 */
export const preservePersistedDatasetId = (id: string): string => {
  assertPersistedDomainDatasetId(id);
  return id.trim();
};

export const enforcePersistedDatasetIdentity = (
  dataset: Pick<ProjectDatasetV2, "id">
): string => preservePersistedDatasetId(dataset.id);

export const assertStableDatasetId = (before: string, after: string): void => {
  const canonicalBefore = preservePersistedDatasetId(before);
  const canonicalAfter = preservePersistedDatasetId(after);

  if (canonicalBefore !== canonicalAfter) {
    throw new DatasetIdPolicyError(
      "DS-ID-UNSTABLE",
      `Dataset id changed from "${canonicalBefore}" to "${canonicalAfter}".`
    );
  }
};

export const assertUniquePersistedDatasetIds = (ids: readonly string[]): void => {
  const seen = new Set<string>();

  for (const rawId of ids) {
    const id = preservePersistedDatasetId(rawId);
    if (seen.has(id)) {
      throw new DatasetIdPolicyError(
        "DS-ID-DUP",
        `Duplicate persisted dataset id "${id}".`
      );
    }
    seen.add(id);
  }
};

export const parseSequencedDatasetId = (
  id: string
): { projectMetadataId: string; sequence: number } | null => {
  const match = id.trim().match(SEQUENCED_DATASET_ID_PATTERN);
  if (!match) {
    return null;
  }

  return {
    projectMetadataId: match[1],
    sequence: Number.parseInt(match[2], 10),
  };
};
