/**
 * COLLAB Domain — Public barrel.
 *
 * Consumers may import ONLY from `@/collab`.
 *
 * I0 Foundation · I1 Infrastructure · I2 Sharing & Membership ·
 * I3 Permissions · I4 Annotation & Discussion · I5 Review & Lifecycle ·
 * I6 Supporting · I7 Governance & Audit · I8 Cross-Domain Integration ·
 * I9 Hardening status markers · I10 Domain Certification status markers.
 *
 * @packageDocumentation
 */

export {
  COLLAB_DOMAIN_ID,
  COLLAB_DOMAIN_NAME,
  COLLAB_DOMAIN_ARCHITECTURAL_ROLE,
  COLLAB_DOMAIN_MOTTO,
  COLLAB_OWNERSHIP_PRINCIPLE,
  COLLAB_FOUNDATION_PHASE,
  COLLAB_FOUNDATION_STATUS,
} from "./foundation";

export type {
  CollabFoundationIdentity,
  CollabFoundationStatus,
} from "./foundation";

export {
  COLLAB_INFRASTRUCTURE_PHASE,
  COLLAB_INFRASTRUCTURE_STATUS,
} from "./infrastructure";

export type { CollabInfrastructureStatus } from "./infrastructure";

export {
  COLLAB_SHARING_MEMBERSHIP_PHASE,
  COLLAB_SHARING_MEMBERSHIP_STATUS,
} from "./membership";

export type { CollabSharingMembershipStatus } from "./membership";

export {
  COLLAB_PERMISSIONS_PHASE,
  COLLAB_PERMISSIONS_STATUS,
} from "./permissions";

export type { CollabPermissionsStatus } from "./permissions";

export {
  COLLAB_ANNOTATION_DISCUSSION_PHASE,
  COLLAB_ANNOTATION_DISCUSSION_STATUS,
} from "./annotation-discussion";

export type { CollabAnnotationDiscussionStatus } from "./annotation-discussion";

export {
  COLLAB_REVIEW_MANAGEMENT_PHASE,
  COLLAB_REVIEW_MANAGEMENT_STATUS,
} from "./review-management";

export type { CollabReviewManagementStatus } from "./review-management";

export {
  COLLAB_SUPPORTING_PHASE,
  COLLAB_SUPPORTING_STATUS,
} from "./supporting";

export type { CollabSupportingStatus } from "./supporting";

export {
  COLLAB_GOVERNANCE_AUDIT_PHASE,
  COLLAB_GOVERNANCE_AUDIT_STATUS,
} from "./governance-audit";

export type { CollabGovernanceAuditStatus } from "./governance-audit";

export {
  COLLAB_CROSS_DOMAIN_PHASE,
  COLLAB_CROSS_DOMAIN_STATUS,
} from "./cross-domain";

export type { CollabCrossDomainStatus } from "./cross-domain";

export {
  COLLAB_HARDENING_PHASE,
  COLLAB_HARDENING_STATUS,
} from "./hardening-controls";

export type { CollabHardeningStatus } from "./hardening-controls";

export {
  COLLAB_CERTIFICATION_PHASE,
  COLLAB_CERTIFICATION_STATUS,
  COLLAB_DOMAIN_STATUS,
  COLLAB_IMPLEMENTATION_SERIES_CLOSED,
} from "./certification";

export type {
  CollabCertificationStatus,
  CollabDomainStatus,
} from "./certification";
