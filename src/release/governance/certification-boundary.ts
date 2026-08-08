/**
 * RELEASE-P1 — Certification boundary (P1 §16).
 *
 * Domain Certification ≠ Evidence Acceptance ≠ RELEASE Certification ≠ Production Release
 */

import {
  RELEASE_CERTIFICATION_BOUNDARY_LEVELS,
  type ReleaseCertificationBoundaryLevel,
} from "../types";

export const CERTIFICATION_BOUNDARY_INVARIANT =
  "Domain Certification ≠ RELEASE Evidence Acceptance ≠ RELEASE Certification ≠ Production Release" as const;

export function listCertificationBoundaryLevels(): readonly ReleaseCertificationBoundaryLevel[] {
  return RELEASE_CERTIFICATION_BOUNDARY_LEVELS;
}

/**
 * Peer domain certification is authoritative for that peer only.
 * It never equals global RELEASE Certification or Production Release.
 */
export function isDomainCertificationGlobalRelease(
  level: ReleaseCertificationBoundaryLevel,
): boolean {
  return (
    level === "RELEASE_CERTIFICATION" || level === "PRODUCTION_RELEASE"
  );
}

/**
 * Evidence acceptance is a RELEASE concern and does not authorize Production Release.
 */
export function evidenceAcceptanceAuthorizesProductionRelease(): false {
  return false;
}

/**
 * P1 implementation must not claim global release certification.
 */
export function p1ClaimsGlobalReleaseCertification(): false {
  return false;
}
