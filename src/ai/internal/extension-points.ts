/**
 * AI-I1 — Internal extension points (structural slots only).
 *
 * Authority: AI-P3 Extension · AI-P6 AI-I1
 * Named hooks for future AI-I* growth. Empty of behavior.
 * Capability Governance (AI-I6) will constrain activation later.
 */

export const AI_EXTENSION_POINT_IDS = [
  "capability-growth",
  "peer-integration",
  "governance-policy",
  "hardening-evidence",
] as const;

export type AiExtensionPointId = (typeof AI_EXTENSION_POINT_IDS)[number];

export type AiExtensionPoint = {
  readonly id: AiExtensionPointId;
  readonly active: false;
  readonly intelligence: false;
};

/** All extension points exist as inactive structural markers. */
export const AI_EXTENSION_POINTS: readonly AiExtensionPoint[] =
  AI_EXTENSION_POINT_IDS.map((id) => ({
    id,
    active: false as const,
    intelligence: false as const,
  }));
