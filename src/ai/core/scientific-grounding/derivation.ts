/**
 * AI-I2 — Scientific Grounding derivation rules (architectural).
 *
 * Allowed conceptual chain: AI Core → Infrastructure → DATA (public).
 * Forbidden: mutate DATA · own scientific truth · runtime reasoning.
 * This module declares rules only — no DATA imports, no I/O.
 */

/** Sole scientific-truth owner (AD-006). */
export const AI_SCIENTIFIC_TRUTH_OWNER = "DATA" as const;

/** Conceptual derivation source — never an import or runtime client. */
export const AI_SCIENTIFIC_GROUNDING_SOURCE = "DATA" as const;

export const AI_SCIENTIFIC_GROUNDING_DERIVATION = {
  source: AI_SCIENTIFIC_GROUNDING_SOURCE,
  truthOwner: AI_SCIENTIFIC_TRUTH_OWNER,
  ownsData: false as const,
  mutatesData: false as const,
  importsDataInternals: false as const,
  scientificReasoningImplemented: false as const,
  runtimeDerivation: false as const,
} as const;

export type AiScientificGroundingDerivation = typeof AI_SCIENTIFIC_GROUNDING_DERIVATION;
