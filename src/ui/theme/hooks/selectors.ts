/**
 * UX-3.5 — Private identity selectors over ResolvedDesignTokens.
 * Pure property access only. Not re-exported from hooks/index.ts.
 */

import type { ResolvedDesignTokens } from "../tokens/contracts/ResolvedDesignTokens";

export function selectColors(tokens: ResolvedDesignTokens) {
  return tokens.colors;
}

export function selectSpacing(tokens: ResolvedDesignTokens) {
  return tokens.spacing;
}

export function selectTypography(tokens: ResolvedDesignTokens) {
  return tokens.typography;
}

export function selectRadius(tokens: ResolvedDesignTokens) {
  return tokens.radius;
}

export function selectShadows(tokens: ResolvedDesignTokens) {
  return tokens.shadows;
}

export function selectElevation(tokens: ResolvedDesignTokens) {
  return tokens.elevation;
}

export function selectMotion(tokens: ResolvedDesignTokens) {
  return tokens.motion;
}
