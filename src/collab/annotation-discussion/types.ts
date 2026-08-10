/**
 * COLLAB-I4 — Annotation / Scientific Comment / Discussion metadata types (P2).
 *
 * Peer scientific identities are opaque references — COLLAB never owns them.
 */

import type { CollabActorId, CollabPeerIdentityRef } from "../membership/types";
import type { CollabI4LifecycleStage } from "./lifecycle";

export type CollabAnnotationId = string & {
  readonly __collabBrand: "CollabAnnotationId";
};
export type CollabDiscussionId = string & {
  readonly __collabBrand: "CollabDiscussionId";
};
export type CollabDiscussionMessageId = string & {
  readonly __collabBrand: "CollabDiscussionMessageId";
};

export type CollabAnnotationKind = "annotation" | "scientific-comment";

export type CollabAnnotationMetadata = {
  readonly id: CollabAnnotationId;
  readonly kind: CollabAnnotationKind;
  readonly peerIdentityRef: CollabPeerIdentityRef;
  readonly authorActorId: CollabActorId;
  readonly body: string;
  readonly lifecycleStage: CollabI4LifecycleStage;
  readonly createdAt: string;
};

export type CollabDiscussionMetadata = {
  readonly id: CollabDiscussionId;
  readonly peerIdentityRef: CollabPeerIdentityRef;
  readonly title: string;
  readonly createdByActorId: CollabActorId;
  readonly lifecycleStage: CollabI4LifecycleStage;
  readonly createdAt: string;
};

export type CollabDiscussionMessageMetadata = {
  readonly id: CollabDiscussionMessageId;
  readonly discussionId: CollabDiscussionId;
  readonly authorActorId: CollabActorId;
  readonly body: string;
  readonly lifecycleStage: CollabI4LifecycleStage;
  readonly createdAt: string;
};

export type {
  CollabActorId,
  CollabPeerIdentityRef,
};
