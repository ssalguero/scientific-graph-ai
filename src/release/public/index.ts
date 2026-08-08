/**
 * RELEASE public aggregate — not a consumer import path; consumers use `@/release`.
 */

export {
  RELEASE_DOMAIN_ID,
  RELEASE_DOMAIN_MOTTO,
  RELEASE_P1_PHASE,
  RELEASE_P1_STATUS,
  RELEASE_P1_CERTIFICATION_STATUS,
} from "../foundation";

export { CROSS_DOMAIN_BASELINE_FACTS } from "../baseline";

export {
  CERTIFICATION_BOUNDARY_INVARIANT,
  p1ClaimsGlobalReleaseCertification,
} from "../governance";

export {
  intakeCrossDomainBaseline,
  createEvidenceIndex,
  validateEvidenceRecord,
  transitionEvidenceLifecycle,
  evaluateEvidenceTrust,
  missingEvidenceBecomesPass,
  warningAuthorizesRelease,
  listReleaseGateCategories,
} from "../evidence";
