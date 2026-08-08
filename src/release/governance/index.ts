/**
 * RELEASE-P1 — Governance barrel.
 */

export {
  RELEASE_MAY_DECIDE,
  RELEASE_MAY_REQUEST,
  RELEASE_MAY_REJECT_OR_BLOCK,
  RELEASE_MUST_NOT,
  releaseMay,
  releaseMustNot,
  requestTransfersPeerOwnership,
} from "./authority";

export type {
  ReleaseGovernanceCapability,
  ReleaseGovernanceProhibition,
} from "./authority";

export {
  CERTIFICATION_BOUNDARY_INVARIANT,
  listCertificationBoundaryLevels,
  isDomainCertificationGlobalRelease,
  evidenceAcceptanceAuthorizesProductionRelease,
  p1ClaimsGlobalReleaseCertification,
} from "./certification-boundary";
