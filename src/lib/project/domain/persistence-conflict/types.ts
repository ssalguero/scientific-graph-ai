/** Branded project identity for revision comparison. */
export type ProjectRevisionProjectId = string;

/** Origin of a comparable project revision. */
export type ProjectRevisionSource =
  | "session"
  | "sgproj-file"
  | "local-committed"
  | "local-draft";

/** Minimal revision identity used before hydrate decisions. */
export type ProjectRevisionRef = {
  projectId: ProjectRevisionProjectId;
  updatedAt: string;
  exportedAt?: string;
  source: ProjectRevisionSource;
};

/** Classification of a persistence conflict scenario. */
export type PersistenceConflictKind =
  | "SESSION_DIRTY"
  | "INCOMING_NEWER"
  | "INCOMING_OLDER_THAN_LOCAL"
  | "RECOVERABLE_DRAFT";

/** Whether a conflict blocks hydrate or only warns the user. */
export type PersistenceConflictSeverity = "blocking" | "warning";

/** Detected conflict between session, incoming and optional local revisions. */
export type PersistenceConflict = {
  kind: PersistenceConflictKind;
  severity: PersistenceConflictSeverity;
  sessionRevision?: ProjectRevisionRef;
  incomingRevision: ProjectRevisionRef;
  localCommittedRevision?: ProjectRevisionRef;
};

/** Explicit user decision when a conflict is presented. */
export type PersistenceConflictResolution =
  | "KEEP_CURRENT"
  | "LOAD_INCOMING"
  | "DISCARD_AND_LOAD"
  | "CANCEL";
