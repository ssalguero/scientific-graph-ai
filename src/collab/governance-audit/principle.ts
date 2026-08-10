/**
 * COLLAB-I7 — Audit Principle citation (Charter · P5 Audit Lifecycle).
 *
 * Cite only — do not redefine Charter principles.
 */

export const COLLAB_AUDIT_PRINCIPLE_CITATION =
  "Every collaboration action SHALL be auditable." as const;

export const COLLAB_AUDIT_PRINCIPLE_SOURCE =
  "COLLAB-Planning-Charter · Audit Principle" as const;

export const COLLAB_AUDIT_REQUIRED_FIELDS = [
  "actorId",
  "timestamp",
  "operation",
  "targetRef",
] as const;

export const COLLAB_AUDIT_NEVER_MODIFIES_SCIENCE = true as const;

export const COLLAB_GOVERNANCE_AUDIT_IDENTITY = {
  phase: "COLLAB-I7" as const,
  title: "Governance & Audit" as const,
  purpose:
    "Audit trail integrity and collaboration governance aligned with Audit Principle" as const,
  dependsOn: ["COLLAB-I5", "COLLAB-I6"] as const,
  conceptualAuditTrail: "C8 Activity Timeline" as const,
  ownsScientificTruth: false as const,
  mutatesPeerEntities: false as const,
  metadataOnly: true as const,
} as const;

export type CollabGovernanceAuditIdentity =
  typeof COLLAB_GOVERNANCE_AUDIT_IDENTITY;
