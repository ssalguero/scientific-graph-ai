/**
 * COLLAB-I1 — Ownership / responsibility markers (P4 §5–§6 · Charter Ownership Matrix).
 *
 * Cite-only constants. Permission matrices realized in COLLAB-I3 (C3).
 */

export const COLLAB_CAPABILITY_OWNERS = {
  Workflow: "ENGINE",
  ScientificObjects: "DATA",
  AiDecisions: "AI",
  Presentation: "UX",
  CollaborationMetadata: "COLLAB",
} as const;

export type CollabCapabilityOwnerKey = keyof typeof COLLAB_CAPABILITY_OWNERS;

export const COLLAB_CONTRACT_OWNERSHIP = {
  owns: "collaboration-metadata-contracts",
  neverOwns: [
    "workflow-orchestration",
    "scientific-truth",
    "ai-reasoning",
    "presentation",
    "platform-persistence-infrastructure",
  ],
  permissionEvaluationOwner: "COLLAB",
  permissionMatricesImplementedIn: "COLLAB-I3",
  concreteSchemasDeferred: true,
} as const;
