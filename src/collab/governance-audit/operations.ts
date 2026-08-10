/**
 * COLLAB-I7 — Governance & Audit operations (Charter · P5 Audit · P6 I7).
 *
 * Depends conceptually on I5/I6 actions to audit. Does not mutate peer science.
 * Peer runtime integration remains deferred to I8.
 */

import {
  asCollabActorId,
  asCollabPeerIdentityRef,
} from "../membership/types";
import {
  computeAuditIntegrityDigest,
  verifyEntryIntegrity,
} from "./integrity";
import { COLLAB_I7_GOVERNANCE_STAGE } from "./lifecycle";
import type { CollabGovernanceAuditRegistry } from "./registry";
import type {
  CollabArchiveRecord,
  CollabGovernedAuditEntry,
} from "./types";

export type RecordGovernedAuditInput = {
  readonly actorId: string;
  readonly operation: string;
  readonly targetRef: string;
  readonly sourcePhase: CollabGovernedAuditEntry["sourcePhase"];
  readonly now?: string;
};

export type ArchiveCollaborationInput = {
  readonly peerIdentityRef: string;
  readonly archivedByActorId: string;
  readonly reason?: string;
  readonly now?: string;
};

export type CollabGovernanceAuditOperationResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: string };

export type CollabAuditTrailIntegrityReport = {
  readonly ok: boolean;
  readonly entryCount: number;
  readonly invalidEntryIds: readonly string[];
};

let seq = 0;
const nextId = (prefix: string): string => {
  seq += 1;
  return `${prefix}-${seq}`;
};

const stamp = (now?: string): string => now ?? new Date(0).toISOString();

/** Record a governed audit entry with integrity digest (Audit Principle fields). */
export function recordGovernedAuditEntry(
  registry: CollabGovernanceAuditRegistry,
  input: RecordGovernedAuditInput,
): CollabGovernanceAuditOperationResult<CollabGovernedAuditEntry> {
  const actorId = input.actorId.trim();
  const operation = input.operation.trim();
  const targetRef = input.targetRef.trim();
  if (!actorId) return { ok: false, error: "actorId is required" };
  if (!operation) return { ok: false, error: "operation is required" };
  if (!targetRef) return { ok: false, error: "targetRef is required" };
  if (
    input.sourcePhase !== "COLLAB-I5" &&
    input.sourcePhase !== "COLLAB-I6" &&
    input.sourcePhase !== "COLLAB-I7"
  ) {
    return { ok: false, error: "sourcePhase must be COLLAB-I5, I6, or I7" };
  }

  const timestamp = stamp(input.now);
  const sequence = registry.nextSequence();
  const brandedActor = asCollabActorId(actorId);
  const brandedTarget = asCollabPeerIdentityRef(targetRef);
  const integrityDigest = computeAuditIntegrityDigest({
    actorId: brandedActor,
    timestamp,
    operation,
    targetRef: brandedTarget,
    sequence,
  });

  const entry: CollabGovernedAuditEntry = {
    id: nextId("cga") as CollabGovernedAuditEntry["id"],
    actorId: brandedActor,
    timestamp,
    operation,
    targetRef: brandedTarget,
    sourcePhase: input.sourcePhase,
    integrityDigest,
    sequence,
  };
  registry.appendAuditEntry(entry);
  return { ok: true, value: entry };
}

/** Verify integrity of the governed audit trail (required fields + digests). */
export function verifyAuditTrailIntegrity(
  registry: CollabGovernanceAuditRegistry,
): CollabAuditTrailIntegrityReport {
  const entries = registry.listAuditEntries();
  const invalidEntryIds: string[] = [];
  for (const entry of entries) {
    if (!verifyEntryIntegrity(entry)) {
      invalidEntryIds.push(entry.id);
    }
  }
  return {
    ok: invalidEntryIds.length === 0,
    entryCount: entries.length,
    invalidEntryIds,
  };
}

/**
 * Archive collaboration context (P5 Archive under I7 governance).
 * Closes active participation; does not imply scientific delete.
 */
export function archiveCollaborationContext(
  registry: CollabGovernanceAuditRegistry,
  input: ArchiveCollaborationInput,
): CollabGovernanceAuditOperationResult<CollabArchiveRecord> {
  const peerIdentityRef = input.peerIdentityRef.trim();
  const archivedByActorId = input.archivedByActorId.trim();
  const reason = (input.reason ?? "collaboration-context-closed").trim();
  if (!peerIdentityRef) return { ok: false, error: "peerIdentityRef is required" };
  if (!archivedByActorId) {
    return { ok: false, error: "archivedByActorId is required" };
  }
  if (!reason) return { ok: false, error: "reason is required" };

  const existing = registry.listArchivesForPeer(
    asCollabPeerIdentityRef(peerIdentityRef),
  );
  if (existing.some((a) => a.lifecycleStage === COLLAB_I7_GOVERNANCE_STAGE)) {
    return { ok: false, error: "collaboration context already archived" };
  }

  const now = stamp(input.now);
  const audit = recordGovernedAuditEntry(registry, {
    actorId: archivedByActorId,
    operation: "archive-collaboration-context",
    targetRef: peerIdentityRef,
    sourcePhase: "COLLAB-I7",
    now,
  });
  if (!audit.ok) return audit;

  const record: CollabArchiveRecord = {
    id: nextId("car") as CollabArchiveRecord["id"],
    peerIdentityRef: asCollabPeerIdentityRef(peerIdentityRef),
    archivedByActorId: asCollabActorId(archivedByActorId),
    lifecycleStage: COLLAB_I7_GOVERNANCE_STAGE,
    reason,
    archivedAt: now,
    auditEntryId: audit.value.id,
  };
  registry.upsertArchive(record);
  return { ok: true, value: record };
}
