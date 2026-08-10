/**
 * COLLAB-I3 — Role × action permission matrix (P2 roles · P4 evaluation rules).
 *
 * Concrete matrix realization deferred from P2/P4 Planning into COLLAB-I3.
 */

import type { CollabConceptualRole } from "../membership/roles";
import type { CollabCollaborativeAction } from "./actions";

/** Allowed actions per conceptual role (P2 §8 intents). */
export const COLLAB_PERMISSION_MATRIX = {
  Owner: [
    "view-collaboration",
    "share-project",
    "open-workspace",
    "manage-membership",
    "assign-role",
    "admit-member",
    "contribute-metadata",
    "participate-review",
  ],
  Administrator: [
    "view-collaboration",
    "open-workspace",
    "manage-membership",
    "assign-role",
    "admit-member",
    "contribute-metadata",
    "participate-review",
  ],
  Editor: [
    "view-collaboration",
    "contribute-metadata",
  ],
  Reviewer: [
    "view-collaboration",
    "participate-review",
  ],
  Viewer: [
    "view-collaboration",
  ],
} as const satisfies Record<
  CollabConceptualRole,
  readonly CollabCollaborativeAction[]
>;

export function listAllowedActionsForRole(
  role: CollabConceptualRole,
): readonly CollabCollaborativeAction[] {
  return COLLAB_PERMISSION_MATRIX[role];
}

export function roleAllowsAction(
  role: CollabConceptualRole,
  action: CollabCollaborativeAction,
): boolean {
  return (COLLAB_PERMISSION_MATRIX[role] as readonly string[]).includes(action);
}
