/**
 * D69.2 — Session Snapshots Foundation · SnapshotReason.
 * Authority: D69 API Freeze · frozen reason set (no additional values).
 * Types / const surface only — no runtime logic, React, Registry, or I/O.
 */

/**
 * Frozen snapshot creation reasons.
 * Value + type surface (repo pattern — no TypeScript enum).
 */
export const SnapshotReason = {
  MANUAL: "MANUAL",
  AUTOSAVE: "AUTOSAVE",
  RESTORE_POINT: "RESTORE_POINT",
  EXPORT: "EXPORT",
  BACKUP: "BACKUP",
} as const;

export type SnapshotReason =
  (typeof SnapshotReason)[keyof typeof SnapshotReason];
