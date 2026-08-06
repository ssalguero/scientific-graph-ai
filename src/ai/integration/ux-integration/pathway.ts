/**
 * AI-I7 — AI ↔ UX integration pathway (structural).
 *
 * Authority: AI-P4 · AI-P0 Ownership quartet (UX owns presentation)
 * Exposes presentation feedstock. Never owns presentation. No UI behavior.
 */

export const AI_UX_INTEGRATION_ID = "ai-ux-integration" as const;

export const AI_UX_INTEGRATION_PEER = "UX" as const;

export const AI_UX_INTEGRATION_CONTRACT_CLASS = "CrossDomain" as const;

export const AI_UX_INTEGRATION_PURPOSE =
  "Structural pathway for UX presentation feedstock from non-authoritative intelligence" as const;

export const AI_UX_INTEGRATION_NEVER_OWNS = [
  "presentation",
  "ui-behavior",
  "ux-composition",
] as const;

/** UX remains sole presentation owner. */
export const AI_PRESENTATION_OWNER = "UX" as const;

export const AI_UX_INTEGRATION_PATHWAY = {
  id: AI_UX_INTEGRATION_ID,
  peer: AI_UX_INTEGRATION_PEER,
  contractClass: AI_UX_INTEGRATION_CONTRACT_CLASS,
  ownsPeer: false as const,
  ownsPresentation: false as const,
  runtimeCommunication: false as const,
  apiImplemented: false as const,
  uiBehavior: false as const,
  presentationOwner: AI_PRESENTATION_OWNER,
} as const;

export type AiUxIntegrationId = typeof AI_UX_INTEGRATION_ID;
