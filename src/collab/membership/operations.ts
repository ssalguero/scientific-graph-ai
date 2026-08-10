/**
 * COLLAB-I2 — Sharing & Membership metadata operations (P2 · P5 Share/Join).
 *
 * Opens Share / Join collaboration metadata. Does not evaluate permissions (I3).
 * Does not import peers. Does not persist remotely.
 */

import { isCollabConceptualRole, type CollabConceptualRole } from "./roles";
import type { CollabMembershipRegistry } from "./registry";
import {
  asCollabActorId,
  asCollabPeerIdentityRef,
  type CollabActorId,
  type CollabMembershipMetadata,
  type CollabMembershipTarget,
  type CollabPeerIdentityRef,
  type CollabSharedProjectId,
  type CollabSharedProjectMetadata,
  type CollabWorkspaceId,
  type CollabWorkspaceMetadata,
} from "./types";

export type ShareProjectInput = {
  readonly peerProjectRef: string;
  readonly ownerActorId: string;
  readonly now?: string;
};

export type OpenWorkspaceInput = {
  readonly sharedProjectId: CollabSharedProjectId;
  readonly label?: string;
  readonly now?: string;
};

export type JoinMembershipInput = {
  readonly target: CollabMembershipTarget;
  readonly actorId: string;
  readonly role: CollabConceptualRole;
  readonly now?: string;
};

export type CollabMembershipOperationResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: string };

let seq = 0;
const nextId = (prefix: string): string => {
  seq += 1;
  return `${prefix}-${seq}`;
};

const stamp = (now?: string): string => now ?? new Date(0).toISOString();

/**
 * Share stage: make a Shared Project available for collaborative participation.
 * Peer project identity remains owned by the peer domain.
 */
export function shareProject(
  registry: CollabMembershipRegistry,
  input: ShareProjectInput,
): CollabMembershipOperationResult<CollabSharedProjectMetadata> {
  const peerProjectRef = input.peerProjectRef.trim();
  const ownerActorId = input.ownerActorId.trim();
  if (!peerProjectRef) {
    return { ok: false, error: "peerProjectRef is required" };
  }
  if (!ownerActorId) {
    return { ok: false, error: "ownerActorId is required" };
  }

  const project: CollabSharedProjectMetadata = {
    id: nextId("csp") as CollabSharedProjectId,
    peerProjectRef: asCollabPeerIdentityRef(peerProjectRef),
    openedByActorId: asCollabActorId(ownerActorId),
    lifecycleStage: "Share",
    createdAt: stamp(input.now),
  };
  registry.upsertSharedProject(project);

  const ownerMembership: CollabMembershipMetadata = {
    id: nextId("cm") as CollabMembershipMetadata["id"],
    target: { kind: "shared-project", sharedProjectId: project.id },
    actorId: project.openedByActorId,
    role: "Owner",
    lifecycleStage: "Join",
    joinedAt: project.createdAt,
  };
  registry.upsertMembership(ownerMembership);

  return { ok: true, value: project };
}

/** Attach a Workspace metadata record under an existing Shared Project. */
export function openWorkspace(
  registry: CollabMembershipRegistry,
  input: OpenWorkspaceInput,
): CollabMembershipOperationResult<CollabWorkspaceMetadata> {
  const project = registry.getSharedProject(input.sharedProjectId);
  if (!project) {
    return { ok: false, error: "shared project not found" };
  }

  const workspace: CollabWorkspaceMetadata = {
    id: nextId("cws") as CollabWorkspaceId,
    sharedProjectId: project.id,
    label: (input.label ?? "Workspace").trim() || "Workspace",
    createdAt: stamp(input.now),
  };
  registry.upsertWorkspace(workspace);
  return { ok: true, value: workspace };
}

/**
 * Join stage: associate an actor with a Shared Project or Workspace under a Role.
 * Does not evaluate permissions — role is conceptual association only (I3 deferred).
 */
export function joinMembership(
  registry: CollabMembershipRegistry,
  input: JoinMembershipInput,
): CollabMembershipOperationResult<CollabMembershipMetadata> {
  const actorId = input.actorId.trim();
  if (!actorId) {
    return { ok: false, error: "actorId is required" };
  }
  if (!isCollabConceptualRole(input.role)) {
    return { ok: false, error: "role is not a conceptual COLLAB role" };
  }

  if (input.target.kind === "shared-project") {
    if (!registry.getSharedProject(input.target.sharedProjectId)) {
      return { ok: false, error: "shared project not found" };
    }
  } else if (!registry.getWorkspace(input.target.workspaceId)) {
    return { ok: false, error: "workspace not found" };
  }

  const existing = registry.listMemberships().find((m) => {
    if (m.actorId !== (actorId as CollabActorId)) return false;
    if (m.target.kind !== input.target.kind) return false;
    if (m.target.kind === "shared-project" && input.target.kind === "shared-project") {
      return m.target.sharedProjectId === input.target.sharedProjectId;
    }
    if (m.target.kind === "workspace" && input.target.kind === "workspace") {
      return m.target.workspaceId === input.target.workspaceId;
    }
    return false;
  });
  if (existing) {
    return { ok: false, error: "actor already has membership on target" };
  }

  const membership: CollabMembershipMetadata = {
    id: nextId("cm") as CollabMembershipMetadata["id"],
    target: input.target,
    actorId: asCollabActorId(actorId),
    role: input.role,
    lifecycleStage: "Join",
    joinedAt: stamp(input.now),
  };
  registry.upsertMembership(membership);
  return { ok: true, value: membership };
}

/** Reassign conceptual role on an existing membership (no permission evaluation). */
export function assignConceptualRole(
  registry: CollabMembershipRegistry,
  membershipId: CollabMembershipMetadata["id"],
  role: CollabConceptualRole,
): CollabMembershipOperationResult<CollabMembershipMetadata> {
  if (!isCollabConceptualRole(role)) {
    return { ok: false, error: "role is not a conceptual COLLAB role" };
  }
  const current = registry.listMemberships().find((m) => m.id === membershipId);
  if (!current) {
    return { ok: false, error: "membership not found" };
  }
  const updated: CollabMembershipMetadata = { ...current, role };
  registry.upsertMembership(updated);
  return { ok: true, value: updated };
}

export type { CollabPeerIdentityRef, CollabActorId };
