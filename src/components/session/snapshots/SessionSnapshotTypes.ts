/**
 * D69.2 — Session Snapshots Foundation · Snapshot type contracts.
 * Authority: D69 API Freeze · HR-snapshot-immutable · HR-snapshot-no-definition.
 * Types only — no runtime logic, factories, store, serializer, React, or I/O.
 */

import type { SessionState } from "../SessionState";
import type { SessionId } from "../SessionTypes";
import type { SnapshotReason } from "./SnapshotReason";

/** Opaque snapshot identity — plain string alias (repo pattern). */
export type SnapshotId = string;

/** Wire / persistence schema version for SessionSnapshotRecord. */
export const SNAPSHOT_SCHEMA_VERSION = 1 as const;

/**
 * Immutable in-memory session snapshot.
 * Captures SessionState only — never SessionDefinition.
 * Once created, never mutated (no update / mutate APIs).
 */
export interface SessionSnapshot {
  readonly id: SnapshotId;
  readonly sessionId: SessionId;
  readonly createdAt: number;
  readonly reason: SnapshotReason;
  readonly state: SessionState;
}

/**
 * Serializable snapshot payload (schema-versioned).
 * Independent of IndexedDB — serialize/deserialize only; no I/O here.
 */
export interface SessionSnapshotRecord {
  readonly schemaVersion: typeof SNAPSHOT_SCHEMA_VERSION;
  readonly id: SnapshotId;
  readonly sessionId: SessionId;
  readonly createdAt: number;
  readonly reason: SnapshotReason;
  readonly state: SessionState;
}
