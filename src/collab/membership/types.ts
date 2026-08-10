/**
 * COLLAB-I2 — Sharing & Membership metadata types (P2 vocabulary).
 *
 * Collaboration metadata only. Peer scientific/workflow identities are opaque
 * references — COLLAB never owns or mutates them (Identity Principle).
 */

import type { CollabConceptualRole } from "./roles";
import type { CollabI2LifecycleStage } from "./lifecycle";

export type CollabActorId = string & { readonly __collabBrand: "CollabActorId" };
export type CollabSharedProjectId = string & {
  readonly __collabBrand: "CollabSharedProjectId";
};
export type CollabWorkspaceId = string & {
  readonly __collabBrand: "CollabWorkspaceId";
};
export type CollabMembershipId = string & {
  readonly __collabBrand: "CollabMembershipId";
};

/** Opaque reference to a peer-owned project / scientific identity. */
export type CollabPeerIdentityRef = string & {
  readonly __collabBrand: "CollabPeerIdentityRef";
};

export type CollabSharedProjectMetadata = {
  readonly id: CollabSharedProjectId;
  /** Peer-owned identity; COLLAB does not own the project entity. */
  readonly peerProjectRef: CollabPeerIdentityRef;
  readonly openedByActorId: CollabActorId;
  readonly lifecycleStage: "Share" | "Join";
  readonly createdAt: string;
};

export type CollabWorkspaceMetadata = {
  readonly id: CollabWorkspaceId;
  readonly sharedProjectId: CollabSharedProjectId;
  readonly label: string;
  readonly createdAt: string;
};

export type CollabMembershipTarget =
  | { readonly kind: "shared-project"; readonly sharedProjectId: CollabSharedProjectId }
  | { readonly kind: "workspace"; readonly workspaceId: CollabWorkspaceId };

export type CollabMembershipMetadata = {
  readonly id: CollabMembershipId;
  readonly target: CollabMembershipTarget;
  readonly actorId: CollabActorId;
  readonly role: CollabConceptualRole;
  readonly lifecycleStage: Extract<CollabI2LifecycleStage, "Join">;
  readonly joinedAt: string;
};

export function asCollabActorId(value: string): CollabActorId {
  return value as CollabActorId;
}

export function asCollabPeerIdentityRef(value: string): CollabPeerIdentityRef {
  return value as CollabPeerIdentityRef;
}
