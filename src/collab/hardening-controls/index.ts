/**
 * COLLAB-I9 — Hardening controls barrel (package-internal).
 *
 * Consumers outside COLLAB must not import this module — use `@/collab` status markers.
 * Domain Certification remains DEFERRED — I10 NOT AUTHORIZED.
 */

export {
  COLLAB_HARDENING_PHASE,
  COLLAB_HARDENING_STATUS,
} from "./status";
export type { CollabHardeningStatus } from "./status";

export {
  COLLAB_HARDENING_OBJECTIVES,
  COLLAB_HARDENING_SECURITY_RULES,
  COLLAB_I9_DEFERRED,
  COLLAB_HARDENING_IDENTITY,
} from "./principles";
export type { CollabHardeningIdentity } from "./principles";

export { verifyPermissionIntegrity } from "./permission-integrity";
export type { CollabPermissionIntegrityReport } from "./permission-integrity";

export {
  resistSharedAccessAbuse,
  verifySharedAccessAbuseResistance,
} from "./abuse-resistance";
export type {
  CollabPrivilegeEscalationAttempt,
  CollabAbuseResistanceReport,
} from "./abuse-resistance";

export { verifyActivityTrailIntegrity } from "./trail-integrity";
export type { CollabTrailIntegrityReport } from "./trail-integrity";

export { attestHardeningReadiness } from "./readiness";
export type {
  CollabHardeningReadinessCriterion,
  CollabHardeningReadinessReport,
} from "./readiness";

export { verifyHardeningGates } from "./verify";
export type { CollabHardeningGateReport } from "./verify";
