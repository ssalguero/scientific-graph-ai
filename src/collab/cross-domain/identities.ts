/**
 * COLLAB-I8 — Cross-cutting identities realized at integration (P3 C1 · C11 · P6).
 */

export const COLLAB_COORDINATOR_COMPONENT_ID = "C1" as const;

export const COLLAB_COORDINATOR_COMPONENT_NAME =
  "Collaboration Coordinator" as const;

export const COLLAB_COORDINATOR_IDENTITY = {
  id: COLLAB_COORDINATOR_COMPONENT_ID,
  name: COLLAB_COORDINATOR_COMPONENT_NAME,
  phase: "COLLAB-I8" as const,
  purpose:
    "Orchestrates collaboration participation under ENGINE coordination; never owns Product Flows" as const,
  ownsWorkflowOrchestration: false as const,
  replacesEngine: false as const,
} as const;

export const COLLAB_METADATA_COORDINATION_COMPONENT_ID = "C11" as const;

export const COLLAB_METADATA_COORDINATION_COMPONENT_NAME =
  "Metadata Coordination" as const;

export const COLLAB_METADATA_COORDINATION_IDENTITY = {
  id: COLLAB_METADATA_COORDINATION_COMPONENT_ID,
  name: COLLAB_METADATA_COORDINATION_COMPONENT_NAME,
  phase: "COLLAB-I8" as const,
  purpose:
    "Ensures collaboration outputs remain metadata referencing peer identities" as const,
  ownsScientificTruth: false as const,
  mutatesPeerEntities: false as const,
} as const;

export type CollabCoordinatorIdentity = typeof COLLAB_COORDINATOR_IDENTITY;
export type CollabMetadataCoordinationIdentity =
  typeof COLLAB_METADATA_COORDINATION_IDENTITY;
