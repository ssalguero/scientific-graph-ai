/**
 * COLLAB-I9 — Aggregate hardening verification (P6 I9 · P10).
 */

import { verifyCrossDomainIntegrationGates } from "../cross-domain";
import { verifySharedAccessAbuseResistance } from "./abuse-resistance";
import { verifyPermissionIntegrity } from "./permission-integrity";
import {
  attestHardeningReadiness,
  type CollabHardeningReadinessReport,
} from "./readiness";
import { verifyActivityTrailIntegrity } from "./trail-integrity";

export type CollabHardeningGateReport = {
  readonly ok: boolean;
  readonly permissionIntegrity: ReturnType<typeof verifyPermissionIntegrity>;
  readonly abuseResistance: ReturnType<typeof verifySharedAccessAbuseResistance>;
  readonly trailIntegrity: ReturnType<typeof verifyActivityTrailIntegrity>;
  readonly crossDomainStillOk: boolean;
  readonly readiness: CollabHardeningReadinessReport;
};

/** Run full I9 hardening gate suite. Does not certify the domain (I10). */
export function verifyHardeningGates(): CollabHardeningGateReport {
  const permissionIntegrity = verifyPermissionIntegrity();
  const abuseResistance = verifySharedAccessAbuseResistance();
  const trailIntegrity = verifyActivityTrailIntegrity();
  const xd = verifyCrossDomainIntegrationGates();
  const readiness = attestHardeningReadiness({
    permissionIntegrityOk: permissionIntegrity.ok,
    auditTrailIntegrityOk: trailIntegrity.ok,
    abuseResistanceOk: abuseResistance.ok,
    crossDomainGatesOk: xd.ok,
  });

  return {
    ok:
      permissionIntegrity.ok &&
      abuseResistance.ok &&
      trailIntegrity.ok &&
      xd.ok &&
      readiness.ok &&
      readiness.domainCertificationAuthorized === false,
    permissionIntegrity,
    abuseResistance,
    trailIntegrity,
    crossDomainStillOk: xd.ok,
    readiness,
  };
}
