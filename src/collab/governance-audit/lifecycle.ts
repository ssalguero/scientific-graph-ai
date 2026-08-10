/**
 * COLLAB-I7 — Governance lifecycle (P5 Archive under collaboration governance).
 *
 * Peer integration (I8), hardening (I9), and domain certification (I10) remain deferred.
 */

export const COLLAB_I7_GOVERNANCE_STAGE = "Archive" as const;

export type CollabI7GovernanceStage = typeof COLLAB_I7_GOVERNANCE_STAGE;

export const COLLAB_I7_GOVERNANCE_MEANING =
  "Collaboration context closed for active participation; Activity Timeline remains auditable" as const;

export const COLLAB_I7_DEFERRED = [
  "PeerRuntimeIntegration",
  "Hardening",
  "DomainCertification",
  "RealtimeSync",
  "CollaborativeCursors",
] as const;
