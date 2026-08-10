/**
 * COLLAB-I7 — In-memory governance & audit registry.
 *
 * Not Platform persistence. Not a remote collaboration backend.
 */

import type {
  CollabArchiveRecord,
  CollabArchiveRecordId,
  CollabGovernedAuditEntry,
  CollabGovernedAuditEntryId,
  CollabPeerIdentityRef,
} from "./types";

export type CollabGovernanceAuditRegistrySnapshot = {
  readonly auditEntries: readonly CollabGovernedAuditEntry[];
  readonly archives: readonly CollabArchiveRecord[];
};

export type CollabGovernanceAuditRegistry = {
  appendAuditEntry(entry: CollabGovernedAuditEntry): void;
  getAuditEntry(
    id: CollabGovernedAuditEntryId,
  ): CollabGovernedAuditEntry | undefined;
  listAuditEntries(): readonly CollabGovernedAuditEntry[];
  listAuditEntriesForTarget(
    targetRef: CollabPeerIdentityRef,
  ): readonly CollabGovernedAuditEntry[];
  upsertArchive(record: CollabArchiveRecord): void;
  getArchive(id: CollabArchiveRecordId): CollabArchiveRecord | undefined;
  listArchivesForPeer(
    peerIdentityRef: CollabPeerIdentityRef,
  ): readonly CollabArchiveRecord[];
  nextSequence(): number;
  snapshot(): CollabGovernanceAuditRegistrySnapshot;
};

export function createGovernanceAuditRegistry(): CollabGovernanceAuditRegistry {
  const auditEntries = new Map<string, CollabGovernedAuditEntry>();
  const archives = new Map<string, CollabArchiveRecord>();
  let sequence = 0;

  return {
    appendAuditEntry(entry) {
      auditEntries.set(entry.id, entry);
    },
    getAuditEntry(id) {
      return auditEntries.get(id);
    },
    listAuditEntries() {
      return [...auditEntries.values()].sort((a, b) => a.sequence - b.sequence);
    },
    listAuditEntriesForTarget(targetRef) {
      return [...auditEntries.values()]
        .filter((e) => e.targetRef === targetRef)
        .sort((a, b) => a.sequence - b.sequence);
    },
    upsertArchive(record) {
      archives.set(record.id, record);
    },
    getArchive(id) {
      return archives.get(id);
    },
    listArchivesForPeer(peerIdentityRef) {
      return [...archives.values()].filter(
        (a) => a.peerIdentityRef === peerIdentityRef,
      );
    },
    nextSequence() {
      sequence += 1;
      return sequence;
    },
    snapshot() {
      return {
        auditEntries: [...auditEntries.values()].sort(
          (a, b) => a.sequence - b.sequence,
        ),
        archives: [...archives.values()],
      };
    },
  };
}
