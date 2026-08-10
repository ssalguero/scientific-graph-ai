/**
 * COLLAB-I2 — Sharing & Membership barrel (package-internal).
 *
 * Consumers outside COLLAB must not import this module — use `@/collab` status markers.
 * Permission evaluation, annotations, presence, and peer integration remain deferred.
 */

export {
  COLLAB_SHARING_MEMBERSHIP_PHASE,
  COLLAB_SHARING_MEMBERSHIP_STATUS,
} from "./status";
export type { CollabSharingMembershipStatus } from "./status";

export {
  COLLAB_MEMBERSHIP_COMPONENT_ID,
  COLLAB_MEMBERSHIP_COMPONENT_NAME,
  COLLAB_MEMBERSHIP_PURPOSE,
  COLLAB_MEMBERSHIP_IDENTITY,
} from "./identity";
export type { CollabMembershipIdentity } from "./identity";

export {
  COLLAB_CONCEPTUAL_ROLES,
  COLLAB_CONCEPTUAL_ROLE_INTENT,
  isCollabConceptualRole,
} from "./roles";
export type { CollabConceptualRole } from "./roles";

export {
  COLLAB_I2_LIFECYCLE_STAGES,
  COLLAB_LIFECYCLE_CHAIN_CITED,
  COLLAB_I2_LIFECYCLE_MEANING,
  COLLAB_I2_DEFERRED_LIFECYCLE_STAGES,
} from "./lifecycle";
export type { CollabI2LifecycleStage } from "./lifecycle";

export type {
  CollabActorId,
  CollabSharedProjectId,
  CollabWorkspaceId,
  CollabMembershipId,
  CollabPeerIdentityRef,
  CollabSharedProjectMetadata,
  CollabWorkspaceMetadata,
  CollabMembershipTarget,
  CollabMembershipMetadata,
} from "./types";

export {
  asCollabActorId,
  asCollabPeerIdentityRef,
} from "./types";

export {
  createMembershipRegistry,
} from "./registry";
export type {
  CollabMembershipRegistry,
  CollabMembershipRegistrySnapshot,
} from "./registry";

export {
  shareProject,
  openWorkspace,
  joinMembership,
  assignConceptualRole,
} from "./operations";
export type {
  ShareProjectInput,
  OpenWorkspaceInput,
  JoinMembershipInput,
  CollabMembershipOperationResult,
} from "./operations";
