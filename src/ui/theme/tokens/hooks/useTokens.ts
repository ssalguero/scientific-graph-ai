"use client";

/**
 * UX-3.2.5 — Public hook: ThemeContext → resolve → validated frozen tokens.
 */

import { useMemo } from "react";
import { useTheme } from "../../../providers/theme-context";
import type { ResolvedDesignTokens } from "../contracts/ResolvedDesignTokens";
import { resolve } from "../runtime/ThemeTokenResolver";

/** Resolved design tokens for the active theme. Stable while ThemeId is unchanged. */
export function useTokens(): ResolvedDesignTokens {
  const { theme } = useTheme();

  return useMemo(() => resolve(theme), [theme]);
}
