/**
 * COLLAB-I8 — UX public-seam adapter (P4 §4.3 · P9 adapters).
 *
 * Observes `@/ui` public theme/token surface availability and exposes
 * presentation-ready COLLAB state sources. UX owns presentation.
 */

import { THEME_CONTRACT_VERSION, TOKEN_CONTRACT_VERSION } from "@/ui";
import { COLLAB_FOUNDATION_STATUS } from "../foundation";
import { COLLAB_SHARING_MEMBERSHIP_STATUS } from "../membership";
import { COLLAB_PERMISSIONS_STATUS } from "../permissions";
import { COLLAB_ANNOTATION_DISCUSSION_STATUS } from "../annotation-discussion";
import { COLLAB_REVIEW_MANAGEMENT_STATUS } from "../review-management";
import { COLLAB_SUPPORTING_STATUS } from "../supporting";
import { COLLAB_GOVERNANCE_AUDIT_STATUS } from "../governance-audit";

export const COLLAB_UX_SEAM_ID = "collab-ux" as const;

export type CollabUxStateExposure = {
  readonly seamId: typeof COLLAB_UX_SEAM_ID;
  readonly foundation: typeof COLLAB_FOUNDATION_STATUS;
  readonly sharingMembership: typeof COLLAB_SHARING_MEMBERSHIP_STATUS;
  readonly permissions: typeof COLLAB_PERMISSIONS_STATUS;
  readonly annotationDiscussion: typeof COLLAB_ANNOTATION_DISCUSSION_STATUS;
  readonly reviewLifecycle: typeof COLLAB_REVIEW_MANAGEMENT_STATUS;
  readonly supporting: typeof COLLAB_SUPPORTING_STATUS;
  readonly governanceAudit: typeof COLLAB_GOVERNANCE_AUDIT_STATUS;
  readonly ownsPresentation: false;
};

export type CollabUxSeamObservation = {
  readonly seamId: typeof COLLAB_UX_SEAM_ID;
  readonly tokenContractVersion: string;
  readonly themeContractVersion: string;
  readonly presentationOwnedByUx: true;
};

/**
 * Read-only: confirm UX public contract versions are present.
 * Does not render UI or own Design System.
 */
export function observeUxPublicSeam(): CollabUxSeamObservation {
  return {
    seamId: COLLAB_UX_SEAM_ID,
    tokenContractVersion: TOKEN_CONTRACT_VERSION,
    themeContractVersion: THEME_CONTRACT_VERSION,
    presentationOwnedByUx: true,
  };
}

/**
 * Expose collaboration state sources for UX presentation (P4 §4.3).
 * Presentation remains owned by UX; ENGINE coordinates access path.
 */
export function exposeCollaborationStateForUx(): CollabUxStateExposure {
  return {
    seamId: COLLAB_UX_SEAM_ID,
    foundation: COLLAB_FOUNDATION_STATUS,
    sharingMembership: COLLAB_SHARING_MEMBERSHIP_STATUS,
    permissions: COLLAB_PERMISSIONS_STATUS,
    annotationDiscussion: COLLAB_ANNOTATION_DISCUSSION_STATUS,
    reviewLifecycle: COLLAB_REVIEW_MANAGEMENT_STATUS,
    supporting: COLLAB_SUPPORTING_STATUS,
    governanceAudit: COLLAB_GOVERNANCE_AUDIT_STATUS,
    ownsPresentation: false,
  };
}
