/**
 * COLLAB-I3 — Collaborative actions subject to permission evaluation.
 *
 * Actions are collaboration-metadata concerns only (P2 Permission vocabulary).
 * I6+ feature runtimes remain DEFERRED — FUTURE COLLAB IMPLEMENTATION STAGE;
 * contribute-metadata realized by COLLAB-I4; participate-review by COLLAB-I5.
 */

export const COLLAB_COLLABORATIVE_ACTIONS = [
  "view-collaboration",
  "share-project",
  "open-workspace",
  "manage-membership",
  "assign-role",
  "admit-member",
  "contribute-metadata",
  "participate-review",
] as const;

export type CollabCollaborativeAction =
  (typeof COLLAB_COLLABORATIVE_ACTIONS)[number];

export const COLLAB_COLLABORATIVE_ACTION_MEANING = {
  "view-collaboration": "Observe shared collaboration metadata",
  "share-project": "Open a Shared Project for collaborative participation (Share)",
  "open-workspace": "Create Workspace metadata under a Shared Project",
  "manage-membership": "Manage membership associations on a shared target",
  "assign-role": "Assign or change a conceptual Role on a Membership",
  "admit-member": "Authorize another actor to Join a shared target",
  "contribute-metadata":
    "Produce collaboration metadata contributions (annotation/discussion realized in COLLAB-I4)",
  "participate-review":
    "Participate in Review Coordination (review lifecycle realized in COLLAB-I5)",
} as const satisfies Record<CollabCollaborativeAction, string>;

export function isCollabCollaborativeAction(
  value: string,
): value is CollabCollaborativeAction {
  return (COLLAB_COLLABORATIVE_ACTIONS as readonly string[]).includes(value);
}
