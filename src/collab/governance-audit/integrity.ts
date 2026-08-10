/**
 * COLLAB-I7 — Audit trail integrity helpers (in-memory; not Platform persistence).
 */

import type { CollabGovernedAuditEntry } from "./types";

export function computeAuditIntegrityDigest(parts: {
  readonly actorId: string;
  readonly timestamp: string;
  readonly operation: string;
  readonly targetRef: string;
  readonly sequence: number;
}): string {
  const payload = [
    parts.actorId,
    parts.timestamp,
    parts.operation,
    parts.targetRef,
    String(parts.sequence),
  ].join("|");
  let hash = 0;
  for (let i = 0; i < payload.length; i += 1) {
    hash = (hash * 31 + payload.charCodeAt(i)) | 0;
  }
  return `adig-${(hash >>> 0).toString(16)}`;
}

export function hasRequiredAuditFields(
  entry: Pick<
    CollabGovernedAuditEntry,
    "actorId" | "timestamp" | "operation" | "targetRef"
  >,
): boolean {
  return (
    Boolean(entry.actorId?.toString().trim()) &&
    Boolean(entry.timestamp?.trim()) &&
    Boolean(entry.operation?.trim()) &&
    Boolean(entry.targetRef?.toString().trim())
  );
}

export function verifyEntryIntegrity(entry: CollabGovernedAuditEntry): boolean {
  if (!hasRequiredAuditFields(entry)) return false;
  const expected = computeAuditIntegrityDigest({
    actorId: entry.actorId,
    timestamp: entry.timestamp,
    operation: entry.operation,
    targetRef: entry.targetRef,
    sequence: entry.sequence,
  });
  return expected === entry.integrityDigest;
}
