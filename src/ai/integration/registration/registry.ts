/**
 * AI-I7 — Integration pathway registration.
 * Registers certified cross-domain pathways only. No new contracts. No runtime.
 */

import { AI_COORDINATION_PATHWAY_ID } from "../coordination";
import { AI_DATA_INTEGRATION_ID } from "../data-integration";
import { AI_ENGINE_INTEGRATION_ID } from "../engine-integration";
import { AI_EXPOSURE_PATHWAY_ID } from "../exposure";
import { AI_UX_INTEGRATION_ID } from "../ux-integration";

export type AiIntegrationPathwayId =
  | typeof AI_DATA_INTEGRATION_ID
  | typeof AI_ENGINE_INTEGRATION_ID
  | typeof AI_UX_INTEGRATION_ID
  | typeof AI_COORDINATION_PATHWAY_ID
  | typeof AI_EXPOSURE_PATHWAY_ID;

export type AiIntegrationRegistration = {
  readonly id: AiIntegrationPathwayId;
  readonly class: "integration";
  readonly phase: "AI-I7";
  readonly peer: "DATA" | "ENGINE" | "UX" | "boundary";
  readonly active: false;
  readonly runtimeCommunication: false;
  readonly introducesNewContract: false;
};

export const AI_INTEGRATION_REGISTRY: readonly AiIntegrationRegistration[] = [
  {
    id: AI_DATA_INTEGRATION_ID,
    class: "integration",
    phase: "AI-I7",
    peer: "DATA",
    active: false,
    runtimeCommunication: false,
    introducesNewContract: false,
  },
  {
    id: AI_ENGINE_INTEGRATION_ID,
    class: "integration",
    phase: "AI-I7",
    peer: "ENGINE",
    active: false,
    runtimeCommunication: false,
    introducesNewContract: false,
  },
  {
    id: AI_UX_INTEGRATION_ID,
    class: "integration",
    phase: "AI-I7",
    peer: "UX",
    active: false,
    runtimeCommunication: false,
    introducesNewContract: false,
  },
  {
    id: AI_COORDINATION_PATHWAY_ID,
    class: "integration",
    phase: "AI-I7",
    peer: "boundary",
    active: false,
    runtimeCommunication: false,
    introducesNewContract: false,
  },
  {
    id: AI_EXPOSURE_PATHWAY_ID,
    class: "integration",
    phase: "AI-I7",
    peer: "boundary",
    active: false,
    runtimeCommunication: false,
    introducesNewContract: false,
  },
] as const;

export const AI_INTEGRATION_PATHWAY_COUNT = 5 as const;

export function listIntegrationPathwayIds(): readonly AiIntegrationPathwayId[] {
  return AI_INTEGRATION_REGISTRY.map((r) => r.id);
}
