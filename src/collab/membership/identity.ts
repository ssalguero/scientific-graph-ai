/**
 * COLLAB-I2 — Membership Management identity (P3 C2).
 *
 * Realizes Sharing · Membership Management (P2). Never owns peer science/workflow.
 */

export const COLLAB_MEMBERSHIP_COMPONENT_ID = "C2" as const;

export const COLLAB_MEMBERSHIP_COMPONENT_NAME =
  "Membership Management" as const;

export const COLLAB_MEMBERSHIP_PURPOSE =
  "Coordinate Shared Project / Workspace membership and conceptual Role association as collaboration metadata" as const;

export const COLLAB_MEMBERSHIP_IDENTITY = {
  id: COLLAB_MEMBERSHIP_COMPONENT_ID,
  name: COLLAB_MEMBERSHIP_COMPONENT_NAME,
  purpose: COLLAB_MEMBERSHIP_PURPOSE,
  phase: "COLLAB-I2" as const,
  ownsScientificTruth: false as const,
  ownsWorkflowOrchestration: false as const,
  ownsPresentation: false as const,
  evaluatesPermissions: false as const,
  mutatesPeerEntities: false as const,
  metadataOnly: true as const,
} as const;

export type CollabMembershipIdentity = typeof COLLAB_MEMBERSHIP_IDENTITY;
