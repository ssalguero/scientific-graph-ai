/**
 * COLLAB-I3 — Permission evaluation (P3 C3 · P4).
 *
 * Returns allow/deny for a conceptual Role and collaborative action.
 * Does not mutate membership, peers, or scientific data.
 * Does not implement UI enforcement or remote access-control services.
 */

import {
  isCollabConceptualRole,
  type CollabConceptualRole,
} from "../membership/roles";
import {
  isCollabCollaborativeAction,
  type CollabCollaborativeAction,
} from "./actions";
import { roleAllowsAction } from "./matrix";

export type CollabPermissionDecision = {
  readonly allowed: boolean;
  readonly role: CollabConceptualRole;
  readonly action: CollabCollaborativeAction;
  readonly reason: string;
};

export type EvaluatePermissionInput = {
  readonly role: string;
  readonly action: string;
};

export type EvaluatePermissionResult =
  | { readonly ok: true; readonly decision: CollabPermissionDecision }
  | { readonly ok: false; readonly error: string };

/**
 * Evaluate whether a conceptual collaboration Role may perform an action.
 */
export function evaluatePermission(
  input: EvaluatePermissionInput,
): EvaluatePermissionResult {
  if (!isCollabConceptualRole(input.role)) {
    return { ok: false, error: "role is not a conceptual COLLAB role" };
  }
  if (!isCollabCollaborativeAction(input.action)) {
    return { ok: false, error: "action is not a collaborative COLLAB action" };
  }

  const role = input.role;
  const action = input.action;
  const allowed = roleAllowsAction(role, action);

  return {
    ok: true,
    decision: {
      allowed,
      role,
      action,
      reason: allowed
        ? `Role ${role} is allowed to ${action}`
        : `Role ${role} is denied ${action}`,
    },
  };
}

/** Convenience: evaluate from an already-validated role. */
export function evaluateRolePermission(
  role: CollabConceptualRole,
  action: CollabCollaborativeAction,
): CollabPermissionDecision {
  const allowed = roleAllowsAction(role, action);
  return {
    allowed,
    role,
    action,
    reason: allowed
      ? `Role ${role} is allowed to ${action}`
      : `Role ${role} is denied ${action}`,
  };
}
