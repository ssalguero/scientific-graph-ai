/**
 * AI-I6 — Optionality Preservation (AI-P3 §9.3 · AI Optional).
 * Prevents mandatory runtime dependency. Preserves peer-domain independence.
 */

export const AI_OPTIONALITY_PRESERVATION_ID = "optionality-preservation" as const;

export const AI_OPTIONALITY_PRESERVATION_PURPOSE =
  "AI Optional — never become runtime dependency for scientific correctness" as const;

export const AI_OPTIONALITY_PRESERVATION_RESPONSIBILITY =
  "Preserve AI Optional so the product remains scientifically functional without AI" as const;

export const AI_OPTIONALITY_PRESERVATION_NEVER_OWNS = [
  "runtime-correctness-of-data",
  "runtime-correctness-of-engine",
] as const;

/** Constitutional AI Optional flag — binding metadata. */
export const AI_OPTIONAL_PRESERVED = true as const;

/** AI must never be a mandatory dependency for scientific correctness. */
export const AI_MANDATORY_FOR_SCIENTIFIC_CORRECTNESS = false as const;

export type AiOptionalityPreservationId = typeof AI_OPTIONALITY_PRESERVATION_ID;

export const AI_OPTIONALITY_PRESERVATION_LIFECYCLE = {
  capabilityId: AI_OPTIONALITY_PRESERVATION_ID,
  state: "inactive" as const,
  runtimeEnforcement: false as const,
  mandatoryDependency: false as const,
};
