/**
 * COLLAB-I7 — Governed audit / archive metadata types (Charter · P5).
 *
 * Audit metadata never modifies scientific data / truth.
 */

import type { CollabActorId, CollabPeerIdentityRef } from "../membership/types";
import type { CollabI7GovernanceStage } from "./lifecycle";

export type CollabGovernedAuditEntryId = string & {
  readonly __collabBrand: "CollabGovernedAuditEntryId";
};

export type CollabArchiveRecordId = string & {
  readonly __collabBrand: "CollabArchiveRecordId";
};

/** Integrity-sealed collaboration action audit entry (P5 Audit Lifecycle fields). */
export type CollabGovernedAuditEntry = {
  readonly id: CollabGovernedAuditEntryId;
  readonly actorId: CollabActorId;
  readonly timestamp: string;
  readonly operation: string;
  /** Opaque peer / collaboration target reference. */
  readonly targetRef: CollabPeerIdentityRef;
  readonly sourcePhase: "COLLAB-I5" | "COLLAB-I6" | "COLLAB-I7";
  /** Deterministic integrity digest over required fields (in-memory only). */
  readonly integrityDigest: string;
  readonly sequence: number;
};

export type CollabArchiveRecord = {
  readonly id: CollabArchiveRecordId;
  readonly peerIdentityRef: CollabPeerIdentityRef;
  readonly archivedByActorId: CollabActorId;
  readonly lifecycleStage: CollabI7GovernanceStage;
  readonly reason: string;
  readonly archivedAt: string;
  readonly auditEntryId: CollabGovernedAuditEntryId;
};

export type {
  CollabActorId,
  CollabPeerIdentityRef,
};
