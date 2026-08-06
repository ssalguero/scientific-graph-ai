/**
 * AI-I7 — Exposure pathway (structural).
 * Materializes AI-P3 Intelligence Exposure Boundary.
 * No runtime exposure APIs.
 */

import { AI_EXPOSURE_BOUNDARY_ID } from "../../infrastructure/exposure-boundary";

export const AI_EXPOSURE_PATHWAY_ID = "integration-exposure-pathway" as const;

export const AI_EXPOSURE_PATHWAY = {
  id: AI_EXPOSURE_PATHWAY_ID,
  boundaryId: AI_EXPOSURE_BOUNDARY_ID,
  contractClass: "External" as const,
  runtimeExposure: false as const,
  apiImplemented: false as const,
} as const;

export type AiExposurePathwayId = typeof AI_EXPOSURE_PATHWAY_ID;
