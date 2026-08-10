/**
 * COLLAB-I3 — Permission Service identity (P3 C3).
 *
 * Realizes Permission Management (P2) under Contract Freeze (P4).
 * Evaluation surface only — does not own peer science/workflow/presentation.
 */

export const COLLAB_PERMISSION_COMPONENT_ID = "C3" as const;

export const COLLAB_PERMISSION_COMPONENT_NAME = "Permission Service" as const;

export const COLLAB_PERMISSION_PURPOSE =
  "Evaluate collaborative access for membership roles against collaboration metadata actions" as const;

export const COLLAB_PERMISSION_IDENTITY = {
  id: COLLAB_PERMISSION_COMPONENT_ID,
  name: COLLAB_PERMISSION_COMPONENT_NAME,
  purpose: COLLAB_PERMISSION_PURPOSE,
  phase: "COLLAB-I3" as const,
  ownsScientificTruth: false as const,
  ownsWorkflowOrchestration: false as const,
  ownsPresentation: false as const,
  evaluatesPermissions: true as const,
  mutatesPeerEntities: false as const,
  metadataOnly: true as const,
  enforcesViaUi: false as const,
  remoteAccessControl: false as const,
} as const;

export type CollabPermissionIdentity = typeof COLLAB_PERMISSION_IDENTITY;
