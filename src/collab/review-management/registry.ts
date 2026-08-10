/**
 * COLLAB-I5 — In-memory Review Coordination metadata registry.
 *
 * Not Platform persistence. Not a remote collaboration backend.
 */

import type { CollabPeerIdentityRef, CollabReviewId, CollabReviewMetadata } from "./types";

export type CollabReviewRegistrySnapshot = {
  readonly reviews: readonly CollabReviewMetadata[];
};

export type CollabReviewRegistry = {
  upsertReview(review: CollabReviewMetadata): void;
  getReview(id: CollabReviewId): CollabReviewMetadata | undefined;
  listReviews(): readonly CollabReviewMetadata[];
  listReviewsForPeer(
    peerIdentityRef: CollabPeerIdentityRef,
  ): readonly CollabReviewMetadata[];
  snapshot(): CollabReviewRegistrySnapshot;
};

export function createReviewRegistry(): CollabReviewRegistry {
  const reviews = new Map<string, CollabReviewMetadata>();

  return {
    upsertReview(review) {
      reviews.set(review.id, review);
    },
    getReview(id) {
      return reviews.get(id);
    },
    listReviews() {
      return [...reviews.values()];
    },
    listReviewsForPeer(peerIdentityRef) {
      return [...reviews.values()].filter(
        (r) => r.peerIdentityRef === peerIdentityRef,
      );
    },
    snapshot() {
      return { reviews: [...reviews.values()] };
    },
  };
}
