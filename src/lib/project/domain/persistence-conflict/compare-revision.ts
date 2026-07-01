import type { ProjectRevisionProjectId, ProjectRevisionRef } from "./types";

/** Ordering of two revision timestamps. */
export type RevisionTimeComparison =
  | "before"
  | "equal"
  | "after"
  | "incomparable";

const normalizeProjectId = (projectId: ProjectRevisionProjectId): string =>
  projectId.trim();

export const areProjectRevisionIdsEqual = (
  leftId: ProjectRevisionProjectId,
  rightId: ProjectRevisionProjectId
): boolean => normalizeProjectId(leftId) === normalizeProjectId(rightId);

export const parseRevisionIsoTimestamp = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Date.parse(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
};

/** Effective revision instant: `exportedAt` when present, otherwise `updatedAt`. */
export const getEffectiveRevisionTimestamp = (
  revision: ProjectRevisionRef
): number | null => {
  const exportedAt = revision.exportedAt?.trim();
  if (exportedAt) {
    const exportedMs = parseRevisionIsoTimestamp(exportedAt);
    if (exportedMs !== null) return exportedMs;
  }
  return parseRevisionIsoTimestamp(revision.updatedAt);
};

export const compareRevisionTimes = (
  left: ProjectRevisionRef,
  right: ProjectRevisionRef
): RevisionTimeComparison => {
  const leftMs = getEffectiveRevisionTimestamp(left);
  const rightMs = getEffectiveRevisionTimestamp(right);

  if (leftMs === null || rightMs === null) {
    return "incomparable";
  }
  if (leftMs < rightMs) return "before";
  if (leftMs > rightMs) return "after";
  return "equal";
};

export const areRevisionsEquivalent = (
  left: ProjectRevisionRef,
  right: ProjectRevisionRef
): boolean =>
  areProjectRevisionIdsEqual(left.projectId, right.projectId) &&
  compareRevisionTimes(left, right) === "equal";

export const isIncomingRevisionNewerThan = (
  baseline: ProjectRevisionRef,
  incoming: ProjectRevisionRef
): boolean => compareRevisionTimes(baseline, incoming) === "before";

export const isIncomingRevisionOlderThan = (
  baseline: ProjectRevisionRef,
  incoming: ProjectRevisionRef
): boolean => compareRevisionTimes(baseline, incoming) === "after";

export const createProjectRevisionRef = (
  input: ProjectRevisionRef
): ProjectRevisionRef => ({
  projectId: input.projectId,
  updatedAt: input.updatedAt,
  exportedAt: input.exportedAt,
  source: input.source,
});
