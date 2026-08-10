/**
 * COLLAB-I2 — In-memory membership metadata registry.
 *
 * Not Platform persistence. Not a remote collaboration backend.
 * Fixture/store for Share / Join metadata only.
 */

import type {
  CollabMembershipMetadata,
  CollabSharedProjectId,
  CollabSharedProjectMetadata,
  CollabWorkspaceId,
  CollabWorkspaceMetadata,
} from "./types";

export type CollabMembershipRegistrySnapshot = {
  readonly sharedProjects: readonly CollabSharedProjectMetadata[];
  readonly workspaces: readonly CollabWorkspaceMetadata[];
  readonly memberships: readonly CollabMembershipMetadata[];
};

export type CollabMembershipRegistry = {
  upsertSharedProject(project: CollabSharedProjectMetadata): void;
  getSharedProject(id: CollabSharedProjectId): CollabSharedProjectMetadata | undefined;
  listSharedProjects(): readonly CollabSharedProjectMetadata[];
  upsertWorkspace(workspace: CollabWorkspaceMetadata): void;
  getWorkspace(id: CollabWorkspaceId): CollabWorkspaceMetadata | undefined;
  listWorkspaces(): readonly CollabWorkspaceMetadata[];
  upsertMembership(membership: CollabMembershipMetadata): void;
  listMemberships(): readonly CollabMembershipMetadata[];
  snapshot(): CollabMembershipRegistrySnapshot;
};

export function createMembershipRegistry(): CollabMembershipRegistry {
  const sharedProjects = new Map<string, CollabSharedProjectMetadata>();
  const workspaces = new Map<string, CollabWorkspaceMetadata>();
  const memberships = new Map<string, CollabMembershipMetadata>();

  return {
    upsertSharedProject(project) {
      sharedProjects.set(project.id, project);
    },
    getSharedProject(id) {
      return sharedProjects.get(id);
    },
    listSharedProjects() {
      return [...sharedProjects.values()];
    },
    upsertWorkspace(workspace) {
      workspaces.set(workspace.id, workspace);
    },
    getWorkspace(id) {
      return workspaces.get(id);
    },
    listWorkspaces() {
      return [...workspaces.values()];
    },
    upsertMembership(membership) {
      memberships.set(membership.id, membership);
    },
    listMemberships() {
      return [...memberships.values()];
    },
    snapshot() {
      return {
        sharedProjects: [...sharedProjects.values()],
        workspaces: [...workspaces.values()],
        memberships: [...memberships.values()],
      };
    },
  };
}
