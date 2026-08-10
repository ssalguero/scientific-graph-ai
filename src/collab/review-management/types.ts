/**
 * COLLAB-I5 — Review Coordination metadata types (P2 · P5).
 *
 * Peer scientific identities are opaque references — COLLAB never owns them.
 * Review metadata ≠ ENGINE Product Flow / workflow execution.
 */

import type { CollabActorId, CollabPeerIdentityRef } from "../membership/types";
import type { CollabI5LifecycleStage } from "./lifecycle";

export type CollabReviewId = string & {
  readonly __collabBrand: "CollabReviewId";
};

export type CollabReviewMetadata = {
  readonly id: CollabReviewId;
  readonly peerIdentityRef: CollabPeerIdentityRef;
  readonly openedByActorId: CollabActorId;
  readonly lifecycleStage: CollabI5LifecycleStage;
  readonly title: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  /** Set when Approve is recorded — collaboration metadata only. */
  readonly approvedByActorId?: CollabActorId;
  readonly revisionNote?: string;
};

export type {
  CollabActorId,
  CollabPeerIdentityRef,
};
