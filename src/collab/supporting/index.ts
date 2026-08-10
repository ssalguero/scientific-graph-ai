/**
 * COLLAB-I6 — Supporting barrel (package-internal).
 *
 * Consumers outside COLLAB must not import this module — use `@/collab` status markers.
 * Archive / governance audit / realtime / peer integration remain deferred.
 */

export {
  COLLAB_SUPPORTING_PHASE,
  COLLAB_SUPPORTING_STATUS,
} from "./status";
export type { CollabSupportingStatus } from "./status";

export {
  COLLAB_PRESENCE_COMPONENT_ID,
  COLLAB_PRESENCE_COMPONENT_NAME,
  COLLAB_PRESENCE_PURPOSE,
  COLLAB_PRESENCE_IDENTITY,
} from "./presence-identity";
export type { CollabPresenceIdentity } from "./presence-identity";

export {
  COLLAB_ACTIVITY_COMPONENT_ID,
  COLLAB_ACTIVITY_COMPONENT_NAME,
  COLLAB_ACTIVITY_PURPOSE,
  COLLAB_ACTIVITY_IDENTITY,
} from "./activity-identity";
export type { CollabActivityIdentity } from "./activity-identity";

export {
  COLLAB_NOTIFICATION_COMPONENT_ID,
  COLLAB_NOTIFICATION_COMPONENT_NAME,
  COLLAB_NOTIFICATION_PURPOSE,
  COLLAB_NOTIFICATION_IDENTITY,
} from "./notification-identity";
export type { CollabNotificationIdentity } from "./notification-identity";

export {
  COLLAB_SESSION_COMPONENT_ID,
  COLLAB_SESSION_COMPONENT_NAME,
  COLLAB_SESSION_PURPOSE,
  COLLAB_SESSION_IDENTITY,
} from "./session-identity";
export type { CollabSessionIdentity } from "./session-identity";

export {
  COLLAB_I6_ACCOMPANIMENT,
  COLLAB_I6_DEFERRED,
  COLLAB_I6_ASYNC_ONLY,
} from "./accompaniment";

export type {
  CollabPresenceId,
  CollabCollaborativeSessionId,
  CollabActivityEventId,
  CollabNotificationId,
  CollabPresenceMetadata,
  CollabCollaborativeSessionMetadata,
  CollabActivityEventMetadata,
  CollabNotificationMetadata,
  CollabActorId,
  CollabPeerIdentityRef,
} from "./types";

export { createSupportingRegistry } from "./registry";
export type {
  CollabSupportingRegistry,
  CollabSupportingRegistrySnapshot,
} from "./registry";

export {
  setPresence,
  openCollaborativeSession,
  closeCollaborativeSession,
  recordActivity,
  emitNotification,
} from "./operations";
export type {
  SetPresenceInput,
  OpenCollaborativeSessionInput,
  CloseCollaborativeSessionInput,
  RecordActivityInput,
  EmitNotificationInput,
  CollabSupportingOperationResult,
} from "./operations";
