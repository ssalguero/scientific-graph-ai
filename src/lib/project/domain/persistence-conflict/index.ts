export type {
  PersistenceConflict,
  PersistenceConflictKind,
  PersistenceConflictResolution,
  PersistenceConflictSeverity,
  ProjectRevisionProjectId,
  ProjectRevisionRef,
  ProjectRevisionSource,
} from "./types";

export {
  areProjectRevisionIdsEqual,
  areRevisionsEquivalent,
  compareRevisionTimes,
  createProjectRevisionRef,
  getEffectiveRevisionTimestamp,
  isIncomingRevisionNewerThan,
  isIncomingRevisionOlderThan,
  parseRevisionIsoTimestamp,
  type RevisionTimeComparison,
} from "./compare-revision";
