/**
 * D69.5 — Session Snapshots Foundation · Snapshot Serializer.
 * Authority: D69 API Freeze · HR-serialize-pure · schemaVersion embed.
 * Pure function only: SessionSnapshot → SessionSnapshotRecord.
 * No I/O, IndexedDB, React, Store, or Registry.
 */

import { cloneSessionState } from "../SessionState";
import {
  SNAPSHOT_SCHEMA_VERSION,
  type SessionSnapshot,
  type SessionSnapshotRecord,
} from "./SessionSnapshotTypes";

/**
 * SessionSnapshot → SessionSnapshotRecord.
 * Copies all snapshot fields, embeds SNAPSHOT_SCHEMA_VERSION, deep-clones state.
 * Never mutates the input.
 */
export function serializeSessionSnapshot(
  snapshot: SessionSnapshot
): SessionSnapshotRecord {
  return {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    id: snapshot.id,
    sessionId: snapshot.sessionId,
    createdAt: snapshot.createdAt,
    reason: snapshot.reason,
    state: cloneSessionState(snapshot.state),
  };
}
