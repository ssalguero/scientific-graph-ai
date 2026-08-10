/**
 * COLLAB-I5 — Review Management barrel (package-internal).
 *
 * Consumers outside COLLAB must not import this module — use `@/collab` status markers.
 * Archive / presence / session / activity / notifications remain deferred.
 */

export {
  COLLAB_REVIEW_MANAGEMENT_PHASE,
  COLLAB_REVIEW_MANAGEMENT_STATUS,
} from "./status";
export type { CollabReviewManagementStatus } from "./status";

export {
  COLLAB_REVIEW_COMPONENT_ID,
  COLLAB_REVIEW_COMPONENT_NAME,
  COLLAB_REVIEW_PURPOSE,
  COLLAB_REVIEW_IDENTITY,
} from "./identity";
export type { CollabReviewIdentity } from "./identity";

export {
  COLLAB_I5_LIFECYCLE_STAGES,
  COLLAB_I5_LIFECYCLE_MEANINGS,
  COLLAB_I5_LEGAL_TRANSITIONS,
  COLLAB_I5_DEFERRED_LIFECYCLE_STAGES,
  COLLAB_I5_INITIAL_STAGE,
  isCollabI5LifecycleStage,
  isLegalCollabI5Transition,
} from "./lifecycle";
export type { CollabI5LifecycleStage } from "./lifecycle";

export type {
  CollabReviewId,
  CollabReviewMetadata,
  CollabActorId,
  CollabPeerIdentityRef,
} from "./types";

export { createReviewRegistry } from "./registry";
export type {
  CollabReviewRegistry,
  CollabReviewRegistrySnapshot,
} from "./registry";

export {
  startReview,
  requestRevision,
  resumeReview,
  approveReview,
} from "./operations";
export type {
  StartReviewInput,
  ReviewTransitionInput,
  CollabReviewOperationResult,
} from "./operations";
