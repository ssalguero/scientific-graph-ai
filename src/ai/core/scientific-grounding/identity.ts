/**
 * AI-I2 — Scientific Grounding capability identity.
 *
 * Authority: AI-P3 §6.5 · AD-006 · AI-P0 Golden Rule
 * Derives from DATA. Never owns DATA. Never mutates DATA.
 * No scientific reasoning implemented.
 */

export const AI_SCIENTIFIC_GROUNDING_ID = "scientific-grounding" as const;

export const AI_SCIENTIFIC_GROUNDING_PURPOSE =
  "Derive intelligence from DATA truth (never own it)" as const;

export const AI_SCIENTIFIC_GROUNDING_RESPONSIBILITY =
  "Ground intelligence in DATA-owned scientific truth under AD-006" as const;

export const AI_SCIENTIFIC_GROUNDING_NEVER_OWNS = [
  "persistent-scientific-knowledge",
  "scientific-meaning",
  "scientific-model",
  "scientific-correctness-certification",
  "scientific-truth",
] as const;

export type AiScientificGroundingId = typeof AI_SCIENTIFIC_GROUNDING_ID;
