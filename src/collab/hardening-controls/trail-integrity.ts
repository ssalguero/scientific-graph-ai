/**
 * COLLAB-I9 — Activity-trail / audit integrity hardening (P6 I9 · P10 §6).
 *
 * Builds on I7 governed audit; does not redesign Archive or I7 contracts.
 */

import {
  createGovernanceAuditRegistry,
  recordGovernedAuditEntry,
  verifyAuditTrailIntegrity,
  archiveCollaborationContext,
} from "../governance-audit";
import { COLLAB_AUDIT_REQUIRED_FIELDS } from "../governance-audit";

export type CollabTrailIntegrityReport = {
  readonly ok: boolean;
  readonly requiredFieldsPresent: boolean;
  readonly trailIntegrityHolds: boolean;
  readonly archiveRetainsAccountability: boolean;
  readonly neverModifiesScience: true;
  readonly details: readonly string[];
};

/** Verify activity-trail / audit integrity under hardening probes. */
export function verifyActivityTrailIntegrity(): CollabTrailIntegrityReport {
  const details: string[] = [];
  const registry = createGovernanceAuditRegistry();

  const requiredFieldsPresent =
    COLLAB_AUDIT_REQUIRED_FIELDS.includes("actorId") &&
    COLLAB_AUDIT_REQUIRED_FIELDS.includes("timestamp") &&
    COLLAB_AUDIT_REQUIRED_FIELDS.includes("operation") &&
    COLLAB_AUDIT_REQUIRED_FIELDS.includes("targetRef");
  if (!requiredFieldsPresent) details.push("required audit fields incomplete");

  const deniedAudit = recordGovernedAuditEntry(registry, {
    actorId: "actor-viewer",
    operation: "permission-denied:share-project",
    targetRef: "peer-entity-harden-1",
    sourcePhase: "COLLAB-I7",
    now: "1970-01-01T00:00:00.000Z",
  });
  if (!deniedAudit.ok) details.push(`denied-action audit failed: ${deniedAudit.error}`);

  const allowedAudit = recordGovernedAuditEntry(registry, {
    actorId: "actor-editor",
    operation: "contribute-metadata",
    targetRef: "peer-entity-harden-1",
    sourcePhase: "COLLAB-I6",
    now: "1970-01-01T00:00:01.000Z",
  });
  if (!allowedAudit.ok) details.push(`allowed-action audit failed: ${allowedAudit.error}`);

  const beforeArchive = verifyAuditTrailIntegrity(registry);
  if (!beforeArchive.ok) details.push("trail integrity failed before archive");

  const archived = archiveCollaborationContext(registry, {
    peerIdentityRef: "peer-entity-harden-1",
    archivedByActorId: "actor-owner",
    reason: "hardening-accountability-check",
    now: "1970-01-01T00:00:02.000Z",
  });
  if (!archived.ok) details.push(`archive failed: ${archived.error}`);

  const afterArchive = verifyAuditTrailIntegrity(registry);
  const archiveRetainsAccountability =
    archived.ok &&
    afterArchive.ok &&
    afterArchive.entryCount >= 3 &&
    Boolean(archived.value.auditEntryId);
  if (!archiveRetainsAccountability) {
    details.push("archive did not retain auditable accountability");
  }

  const trailIntegrityHolds = beforeArchive.ok && afterArchive.ok;

  return {
    ok:
      requiredFieldsPresent &&
      trailIntegrityHolds &&
      archiveRetainsAccountability &&
      details.length === 0,
    requiredFieldsPresent,
    trailIntegrityHolds,
    archiveRetainsAccountability,
    neverModifiesScience: true,
    details,
  };
}
