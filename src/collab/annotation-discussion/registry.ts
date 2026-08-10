/**
 * COLLAB-I4 — In-memory annotation / discussion metadata registry.
 *
 * Not Platform persistence. Not a remote collaboration backend.
 */

import type {
  CollabAnnotationId,
  CollabAnnotationMetadata,
  CollabDiscussionId,
  CollabDiscussionMessageMetadata,
  CollabDiscussionMetadata,
  CollabPeerIdentityRef,
} from "./types";

export type CollabAnnotationDiscussionRegistrySnapshot = {
  readonly annotations: readonly CollabAnnotationMetadata[];
  readonly discussions: readonly CollabDiscussionMetadata[];
  readonly messages: readonly CollabDiscussionMessageMetadata[];
};

export type CollabAnnotationDiscussionRegistry = {
  upsertAnnotation(annotation: CollabAnnotationMetadata): void;
  getAnnotation(id: CollabAnnotationId): CollabAnnotationMetadata | undefined;
  listAnnotations(): readonly CollabAnnotationMetadata[];
  listAnnotationsForPeer(
    peerIdentityRef: CollabPeerIdentityRef,
  ): readonly CollabAnnotationMetadata[];
  upsertDiscussion(discussion: CollabDiscussionMetadata): void;
  getDiscussion(id: CollabDiscussionId): CollabDiscussionMetadata | undefined;
  listDiscussions(): readonly CollabDiscussionMetadata[];
  listDiscussionsForPeer(
    peerIdentityRef: CollabPeerIdentityRef,
  ): readonly CollabDiscussionMetadata[];
  upsertMessage(message: CollabDiscussionMessageMetadata): void;
  listMessages(discussionId: CollabDiscussionId): readonly CollabDiscussionMessageMetadata[];
  snapshot(): CollabAnnotationDiscussionRegistrySnapshot;
};

export function createAnnotationDiscussionRegistry(): CollabAnnotationDiscussionRegistry {
  const annotations = new Map<string, CollabAnnotationMetadata>();
  const discussions = new Map<string, CollabDiscussionMetadata>();
  const messages = new Map<string, CollabDiscussionMessageMetadata>();

  return {
    upsertAnnotation(annotation) {
      annotations.set(annotation.id, annotation);
    },
    getAnnotation(id) {
      return annotations.get(id);
    },
    listAnnotations() {
      return [...annotations.values()];
    },
    listAnnotationsForPeer(peerIdentityRef) {
      return [...annotations.values()].filter(
        (a) => a.peerIdentityRef === peerIdentityRef,
      );
    },
    upsertDiscussion(discussion) {
      discussions.set(discussion.id, discussion);
    },
    getDiscussion(id) {
      return discussions.get(id);
    },
    listDiscussions() {
      return [...discussions.values()];
    },
    listDiscussionsForPeer(peerIdentityRef) {
      return [...discussions.values()].filter(
        (d) => d.peerIdentityRef === peerIdentityRef,
      );
    },
    upsertMessage(message) {
      messages.set(message.id, message);
    },
    listMessages(discussionId) {
      return [...messages.values()].filter((m) => m.discussionId === discussionId);
    },
    snapshot() {
      return {
        annotations: [...annotations.values()],
        discussions: [...discussions.values()],
        messages: [...messages.values()],
      };
    },
  };
}
