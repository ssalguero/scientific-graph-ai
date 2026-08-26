import { keywordMatches, normalizeIntentText } from "./normalize-intent-text";
import type { MethodInterest } from "./types";

/** Single unaccented token — NFD matching covers "regresión". Do not also list "regresión". */
const REGRESSION_TOKEN = "regresion";
const REGRESSION_TOKEN_EN = "regression";

/**
 * Deterministic method-interest mapper. Returns location semantics only.
 * Never a Card ID, handler, or method recommendation.
 */
export function extractMethodInterest(input: string): MethodInterest | null {
  const text = normalizeIntentText(input);
  if (
    keywordMatches(text, REGRESSION_TOKEN) ||
    keywordMatches(text, REGRESSION_TOKEN_EN)
  ) {
    return {
      userTerm: "regresión",
      productLocation: "analysis/mathematics",
    };
  }
  return null;
}
