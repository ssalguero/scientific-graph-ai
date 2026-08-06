/**
 * AI-I7 — Coordination pathway (structural).
 * Materializes AI-P3 Coordination Boundary under ENGINE ownership.
 * No runtime coordination. No workflow execution.
 */

import { AI_COORDINATION_BOUNDARY_ID } from "../../infrastructure/coordination-boundary";

export const AI_COORDINATION_PATHWAY_ID = "integration-coordination-pathway" as const;

export const AI_COORDINATION_PATHWAY = {
  id: AI_COORDINATION_PATHWAY_ID,
  boundaryId: AI_COORDINATION_BOUNDARY_ID,
  contractClass: "CrossDomain" as const,
  coordinationOwner: "ENGINE" as const,
  runtimeCoordination: false as const,
  executesWorkflows: false as const,
} as const;

export type AiCoordinationPathwayId = typeof AI_COORDINATION_PATHWAY_ID;
