/**
 * COLLAB-I7 — Governance & Audit status markers.
 */

export const COLLAB_GOVERNANCE_AUDIT_PHASE = "COLLAB-I7" as const;

export const COLLAB_GOVERNANCE_AUDIT_STATUS =
  "GOVERNANCE_AUDIT_COMPLETE" as const;

export type CollabGovernanceAuditStatus =
  typeof COLLAB_GOVERNANCE_AUDIT_STATUS;
