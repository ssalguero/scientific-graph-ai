/**
 * COLLAB-I9 — Hardening principles (cite P10 · Charter; do not redefine Freezes).
 *
 * Domain Certification (I10) remains DEFERRED — I10 NOT AUTHORIZED.
 */

export const COLLAB_HARDENING_OBJECTIVES = [
  "permission-consistency",
  "audit-traceability",
  "metadata-only-boundary",
  "peer-ownership-preservation",
  "non-blocking",
  "readiness-before-i10",
] as const;

export const COLLAB_HARDENING_SECURITY_RULES = {
  leastCollaborativePrivilege:
    "Conceptual roles SHALL not silently escalate beyond intended collaborative authority",
  permissionIntegrity:
    "Permission evaluation remains consistent with Contract Freeze and Membership/Role model",
  failClosedOnCollabAuthz:
    "Unauthorized collaboration actions SHALL be denied; peers remain operable",
  auditAlways:
    "Denied and allowed collaboration actions remain auditable",
  asyncThreatModel:
    "Hardening targets async v1; realtime attack surfaces are out of scope",
} as const;

export const COLLAB_I9_DEFERRED = [
  "DomainCertification",
  "EncryptionAuthnMechanisms",
  "OperationalMonitoring",
  "RealtimeAttackSurfaces",
] as const;

export const COLLAB_HARDENING_IDENTITY = {
  phase: "COLLAB-I9" as const,
  title: "Hardening" as const,
  purpose:
    "Security of permissions, shared-access abuse resistance, activity-trail integrity" as const,
  dependsOn: ["COLLAB-I8"] as const,
  ownsScientificTruth: false as const,
  redesignsPermissionMatrix: false as const,
} as const;

export type CollabHardeningIdentity = typeof COLLAB_HARDENING_IDENTITY;
