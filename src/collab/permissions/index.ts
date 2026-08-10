/**
 * COLLAB-I3 — Permissions barrel (package-internal).
 *
 * Consumers outside COLLAB must not import this module — use `@/collab` status markers.
 * Annotation / discussion / review / presence runtimes remain deferred.
 */

export {
  COLLAB_PERMISSIONS_PHASE,
  COLLAB_PERMISSIONS_STATUS,
} from "./status";
export type { CollabPermissionsStatus } from "./status";

export {
  COLLAB_PERMISSION_COMPONENT_ID,
  COLLAB_PERMISSION_COMPONENT_NAME,
  COLLAB_PERMISSION_PURPOSE,
  COLLAB_PERMISSION_IDENTITY,
} from "./identity";
export type { CollabPermissionIdentity } from "./identity";

export {
  COLLAB_COLLABORATIVE_ACTIONS,
  COLLAB_COLLABORATIVE_ACTION_MEANING,
  isCollabCollaborativeAction,
} from "./actions";
export type { CollabCollaborativeAction } from "./actions";

export {
  COLLAB_PERMISSION_MATRIX,
  listAllowedActionsForRole,
  roleAllowsAction,
} from "./matrix";

export {
  evaluatePermission,
  evaluateRolePermission,
} from "./evaluate";
export type {
  CollabPermissionDecision,
  EvaluatePermissionInput,
  EvaluatePermissionResult,
} from "./evaluate";
