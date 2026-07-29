/**
 * D69.5 — Session Snapshots Foundation · Snapshot Deserializer.
 * Authority: D69 API Freeze · HR-deserialize-pure · schemaVersion gate.
 * Pure function only: SessionSnapshotRecord → SessionSnapshot.
 * No I/O, IndexedDB, React, Store, or Registry.
 */

import { cloneSessionState } from "../SessionState";
import {
  SNAPSHOT_SCHEMA_VERSION,
  type SessionSnapshot,
  type SessionSnapshotRecord,
} from "./SessionSnapshotTypes";

/**
 * SessionSnapshotRecord → SessionSnapshot.
 * Rejects unsupported schemaVersion with a descriptive Error.
 * Deep-clones state; never returns input references.
 */
export function deserializeSessionSnapshot(
  record: SessionSnapshotRecord
): SessionSnapshot {
  if (record.schemaVersion !== SNAPSHOT_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported SessionSnapshot schemaVersion: ${record.schemaVersion} (expected ${SNAPSHOT_SCHEMA_VERSION})`
    );
  }

  return {
    id: record.id,
    sessionId: record.sessionId,
    createdAt: record.createdAt,
    reason: record.reason,
    state: cloneSessionState(record.state),
  };
}
