/**
 * D70.2 — Restore Points Foundation · Restore Point Factory.
 * Authority: D70.0 Architecture Freeze · HR-rp-on-snapshot · HR-rp-reason ·
 * HR-rp-immutable · HR-rp-snapshot-identity · HR-rp-consume-only.
 * Pure factory only: options → SessionSnapshot (D69) → RestorePoint.
 * No registry, serializer, persistence, React, Provider, or side effects.
 */

import {
  createSessionSnapshot,
  SnapshotReason,
  type CreateSessionSnapshotOptions,
} from "@/components/session/snapshots";

import type {
  RestorePointMetadata,
  RestorePointOrigin,
} from "./RestorePointMetadata";
import type { RestorePoint, RestorePointId } from "./RestorePointTypes";

export type CreateRestorePointOptions = {
  readonly sessionId: CreateSessionSnapshotOptions["sessionId"];
  readonly state: CreateSessionSnapshotOptions["state"];
  readonly name: string;
  readonly description?: string;
  readonly origin: RestorePointOrigin;
  readonly metadata?: RestorePointMetadata;
};

let restorePointIdFallbackSeq = 0;

/**
 * Generates a RestorePointId — prefers crypto.randomUUID(); falls back to a
 * prefix + monotonic sequence when crypto UUID is unavailable.
 * Mirrors Session Snapshot createSnapshotId pattern (local — not exported).
 */
function createRestorePointId(): RestorePointId {
  const cryptoApi =
    typeof globalThis !== "undefined"
      ? (globalThis as { crypto?: { randomUUID?: () => string } }).crypto
      : undefined;

  if (typeof cryptoApi?.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }

  restorePointIdFallbackSeq += 1;
  return `restore-point:${restorePointIdFallbackSeq}`;
}

/**
 * Completes descriptive metadata — defensive clone; never retains input refs.
 */
function completeMetadata(
  metadata?: RestorePointMetadata
): RestorePointMetadata {
  if (metadata === undefined) {
    return {};
  }

  return {
    ...(metadata.correlationId !== undefined
      ? { correlationId: metadata.correlationId }
      : {}),
    ...(metadata.tags !== undefined ? { tags: [...metadata.tags] } : {}),
  };
}

/**
 * Options → RestorePoint.
 * Pipeline (LOCKED): createSessionSnapshot(RESTORE_POINT) → wrap.
 * Never builds SessionSnapshot manually; never mutates callers.
 */
export function createRestorePoint(
  options: CreateRestorePointOptions
): RestorePoint {
  const snapshot = createSessionSnapshot({
    sessionId: options.sessionId,
    state: options.state,
    reason: SnapshotReason.RESTORE_POINT,
  });

  return {
    id: createRestorePointId(),
    name: options.name,
    ...(options.description !== undefined
      ? { description: options.description }
      : {}),
    createdAt: Date.now(),
    origin: options.origin,
    snapshot,
    metadata: completeMetadata(options.metadata),
  };
}
