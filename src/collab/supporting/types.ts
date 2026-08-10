/**
 * COLLAB-I6 — Supporting metadata types (P2 · P3 C7–C10).
 *
 * Async awareness / participation / audit / notices only.
 * Not ENGINE Session. Not Scientific History. Not realtime cursors.
 */

import type { CollabActorId, CollabPeerIdentityRef } from "../membership/types";

export type CollabPresenceId = string & {
  readonly __collabBrand: "CollabPresenceId";
};
export type CollabCollaborativeSessionId = string & {
  readonly __collabBrand: "CollabCollaborativeSessionId";
};
export type CollabActivityEventId = string & {
  readonly __collabBrand: "CollabActivityEventId";
};
export type CollabNotificationId = string & {
  readonly __collabBrand: "CollabNotificationId";
};

export type CollabPresenceMetadata = {
  readonly id: CollabPresenceId;
  readonly actorId: CollabActorId;
  /** Opaque shared target / peer context for awareness (who / where). */
  readonly peerIdentityRef: CollabPeerIdentityRef;
  readonly sessionId?: CollabCollaborativeSessionId;
  readonly status: "active" | "idle" | "away";
  readonly updatedAt: string;
};

export type CollabCollaborativeSessionMetadata = {
  readonly id: CollabCollaborativeSessionId;
  readonly peerIdentityRef: CollabPeerIdentityRef;
  readonly openedByActorId: CollabActorId;
  readonly label: string;
  readonly status: "open" | "closed";
  readonly createdAt: string;
  readonly closedAt?: string;
};

export type CollabActivityEventMetadata = {
  readonly id: CollabActivityEventId;
  readonly actorId: CollabActorId;
  readonly peerIdentityRef: CollabPeerIdentityRef;
  readonly operation: string;
  readonly sessionId?: CollabCollaborativeSessionId;
  readonly createdAt: string;
};

export type CollabNotificationMetadata = {
  readonly id: CollabNotificationId;
  readonly recipientActorId: CollabActorId;
  readonly peerIdentityRef: CollabPeerIdentityRef;
  readonly eventKind: string;
  readonly body: string;
  readonly createdAt: string;
};

export type {
  CollabActorId,
  CollabPeerIdentityRef,
};
