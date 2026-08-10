/**
 * COLLAB-I4 — Annotation & Discussion barrel (package-internal).
 *
 * Consumers outside COLLAB must not import this module — use `@/collab` status markers.
 * Review / presence / activity runtimes remain deferred.
 */

export {
  COLLAB_ANNOTATION_DISCUSSION_PHASE,
  COLLAB_ANNOTATION_DISCUSSION_STATUS,
} from "./status";
export type { CollabAnnotationDiscussionStatus } from "./status";

export {
  COLLAB_ANNOTATION_COMPONENT_ID,
  COLLAB_ANNOTATION_COMPONENT_NAME,
  COLLAB_ANNOTATION_PURPOSE,
  COLLAB_ANNOTATION_IDENTITY,
} from "./annotation-identity";
export type { CollabAnnotationIdentity } from "./annotation-identity";

export {
  COLLAB_DISCUSSION_COMPONENT_ID,
  COLLAB_DISCUSSION_COMPONENT_NAME,
  COLLAB_DISCUSSION_PURPOSE,
  COLLAB_DISCUSSION_IDENTITY,
} from "./discussion-identity";
export type { CollabDiscussionIdentity } from "./discussion-identity";

export {
  COLLAB_I4_LIFECYCLE_STAGE,
  COLLAB_I4_LIFECYCLE_MEANING,
  COLLAB_I4_DEFERRED_LIFECYCLE_STAGES,
} from "./lifecycle";
export type { CollabI4LifecycleStage } from "./lifecycle";

export type {
  CollabAnnotationId,
  CollabDiscussionId,
  CollabDiscussionMessageId,
  CollabAnnotationKind,
  CollabAnnotationMetadata,
  CollabDiscussionMetadata,
  CollabDiscussionMessageMetadata,
  CollabActorId,
  CollabPeerIdentityRef,
} from "./types";

export {
  createAnnotationDiscussionRegistry,
} from "./registry";
export type {
  CollabAnnotationDiscussionRegistry,
  CollabAnnotationDiscussionRegistrySnapshot,
} from "./registry";

export {
  createAnnotation,
  createScientificComment,
  createDiscussion,
  postDiscussionMessage,
} from "./operations";
export type {
  CreateAnnotationInput,
  CreateDiscussionInput,
  PostDiscussionMessageInput,
  CollabAnnotationDiscussionOperationResult,
} from "./operations";
