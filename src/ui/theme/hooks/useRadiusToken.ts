"use client";

/**
 * UX-3.3.1 — Consumption-layer helper. Delegates to Runtime useTokens().
 */

import { useTokens } from "../tokens/hooks/useTokens";

export function useRadiusToken() {
  return useTokens().radius;
}
