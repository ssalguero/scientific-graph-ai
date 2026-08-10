/**
 * COLLAB-I7 — Governance & Audit barrel (package-internal).
 *
 * Consumers outside COLLAB must not import this module — use `@/collab` status markers.
 * Peer integration / hardening / domain certification remain deferred.
 */

export {
  COLLAB_GOVERNANCE_AUDIT_PHASE,
  COLLAB_GOVERNANCE_AUDIT_STATUS,
} from "./status";
export type { CollabGovernanceAuditStatus } from "./status";

export {
  COLLAB_AUDIT_PRINCIPLE_CITATION,
  COLLAB_AUDIT_PRINCIPLE_SOURCE,
  COLLAB_AUDIT_REQUIRED_FIELDS,
  COLLAB_AUDIT_NEVER_MODIFIES_SCIENCE,
  COLLAB_GOVERNANCE_AUDIT_IDENTITY,
} from "./principle";
export type { CollabGovernanceAuditIdentity } from "./principle";

export {
  COLLAB_I7_GOVERNANCE_STAGE,
  COLLAB_I7_GOVERNANCE_MEANING,
  COLLAB_I7_DEFERRED,
} from "./lifecycle";
export type { CollabI7GovernanceStage } from "./lifecycle";

export type {
  CollabGovernedAuditEntryId,
  CollabArchiveRecordId,
  CollabGovernedAuditEntry,
  CollabArchiveRecord,
  CollabActorId,
  CollabPeerIdentityRef,
} from "./types";

export {
  computeAuditIntegrityDigest,
  hasRequiredAuditFields,
  verifyEntryIntegrity,
} from "./integrity";

export { createGovernanceAuditRegistry } from "./registry";
export type {
  CollabGovernanceAuditRegistry,
  CollabGovernanceAuditRegistrySnapshot,
} from "./registry";

export {
  recordGovernedAuditEntry,
  verifyAuditTrailIntegrity,
  archiveCollaborationContext,
} from "./operations";
export type {
  RecordGovernedAuditInput,
  ArchiveCollaborationInput,
  CollabGovernanceAuditOperationResult,
  CollabAuditTrailIntegrityReport,
} from "./operations";
