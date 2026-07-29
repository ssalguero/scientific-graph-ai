/**
 * D69.4 — Session Snapshots Foundation · Snapshot Store.
 * Authority: D69 API Freeze · Map SSOT · clone-on-read/write · no update/mutate.
 * In-memory store only — no persistence, React, Registry, events, or singleton.
 */

import { cloneSessionState } from "../SessionState";
import type {
  SessionSnapshot,
  SnapshotId,
} from "./SessionSnapshotTypes";

/** Frozen store surface — D69.4 Snapshot Store API Freeze. */
export type SessionSnapshotStore = {
  create(snapshot: SessionSnapshot): boolean;
  get(id: SnapshotId): SessionSnapshot | undefined;
  remove(id: SnapshotId): boolean;
  clear(): void;
  list(): readonly SessionSnapshot[];
  count(): number;
};

/**
 * Defensive clone of a SessionSnapshot.
 * Reuses cloneSessionState — preserves id / sessionId / createdAt / reason.
 */
function cloneSnapshot(snapshot: SessionSnapshot): SessionSnapshot {
  return {
    id: snapshot.id,
    sessionId: snapshot.sessionId,
    createdAt: snapshot.createdAt,
    reason: snapshot.reason,
    state: cloneSessionState(snapshot.state),
  };
}

/**
 * Creates an isolated in-memory snapshot store.
 * - Private Map storage (insertion order preserved)
 * - Duplicate create returns false
 * - get / list return defensive clones (no live mutable refs)
 * - No update / replace / mutate
 */
export function createSessionSnapshotStore(): SessionSnapshotStore {
  const snapshots = new Map<SnapshotId, SessionSnapshot>();

  return {
    create(snapshot: SessionSnapshot): boolean {
      const id = snapshot.id;
      if (snapshots.has(id)) {
        return false;
      }
      snapshots.set(id, cloneSnapshot(snapshot));
      return true;
    },

    get(id: SnapshotId): SessionSnapshot | undefined {
      const existing = snapshots.get(id);
      return existing === undefined ? undefined : cloneSnapshot(existing);
    },

    remove(id: SnapshotId): boolean {
      return snapshots.delete(id);
    },

    clear(): void {
      snapshots.clear();
    },

    list(): readonly SessionSnapshot[] {
      return Array.from(snapshots.values(), cloneSnapshot);
    },

    count(): number {
      return snapshots.size;
    },
  };
}
