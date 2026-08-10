/**
 * COLLAB-I6 — Supporting accompaniment semantics (P5).
 *
 * Presence / session / activity / notifications accompany lifecycle stages
 * without owning science. Archive and I7+ audit governance remain deferred.
 */

export const COLLAB_I6_ACCOMPANIMENT =
  "Presence, Collaborative Session, Activity Timeline, and Notifications accompany collaboration stages as async metadata" as const;

export const COLLAB_I6_DEFERRED = [
  "Archive",
  "GovernanceAudit",
  "RealtimeSync",
  "ConflictFreeReplicatedData",
  "CollaborativeCursors",
  "PeerRuntimeIntegration",
] as const;

export const COLLAB_I6_ASYNC_ONLY = true as const;
