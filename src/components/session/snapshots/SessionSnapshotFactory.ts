/**
 * D69.3 — Session Snapshots Foundation · Snapshot Factory.
 * Authority: D69 API Freeze · HR-factory-single-responsibility.
 * Pure factory only: SessionState → SessionSnapshot.
 * No store, register, restore, persistence, React, or side effects.
 */

import { cloneSessionState } from "../SessionState";
import type { SessionState } from "../SessionState";
import type { SessionId } from "../SessionTypes";
import type { SnapshotReason } from "./SnapshotReason";
import type {
  SessionSnapshot,
  SnapshotId,
} from "./SessionSnapshotTypes";

export type CreateSessionSnapshotOptions = {
  readonly sessionId: SessionId;
  readonly state: SessionState;
  readonly reason: SnapshotReason;
};

let snapshotIdFallbackSeq = 0;

/**
 * Generates a SnapshotId — prefers crypto.randomUUID(); falls back to a
 * prefix + monotonic sequence when crypto UUID is unavailable.
 * Mirrors SessionDefinition createSessionId (local copy — not exported there).
 */
function createSnapshotId(): SnapshotId {
  const cryptoApi =
    typeof globalThis !== "undefined"
      ? (globalThis as { crypto?: { randomUUID?: () => string } }).crypto
      : undefined;

  if (typeof cryptoApi?.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }

  snapshotIdFallbackSeq += 1;
  return `snapshot:${snapshotIdFallbackSeq}`;
}

/**
 * SessionState → SessionSnapshot.
 * Deep-clones state via cloneSessionState; never retains input references.
 * Does not persist, register, restore, or mutate callers.
 */
export function createSessionSnapshot(
  options: CreateSessionSnapshotOptions
): SessionSnapshot {
  return {
    id: createSnapshotId(),
    sessionId: options.sessionId,
    createdAt: Date.now(),
    reason: options.reason,
    state: cloneSessionState(options.state),
  };
}
