"use client";

/**
 * UX-3.5 — Consumption-layer helper. Delegates to Runtime useTokens().
 */

import { useTokens } from "../tokens/hooks/useTokens";

export function useMotion() {
  return useTokens().motion;
}
