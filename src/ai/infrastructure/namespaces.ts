/**
 * AI-I1 — Implementation namespace constants (layer slots).
 * Aligns physical folders with AI-P3 Component Classification Model.
 * AI-I7 adds `integration` for cross-domain pathway ownership.
 */

export const AI_IMPLEMENTATION_NAMESPACES = [
  "foundation",
  "identity",
  "core",
  "supporting",
  "governance",
  "extension",
  "infrastructure",
  "integration",
  "public",
  "internal",
] as const;

export type AiImplementationNamespace = (typeof AI_IMPLEMENTATION_NAMESPACES)[number];
