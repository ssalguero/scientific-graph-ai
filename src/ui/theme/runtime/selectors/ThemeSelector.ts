/**
 * UX-3.6 — Theme Runtime selector type foundation (private).
 */

import type { ResolvedDesignTokens } from "../../tokens/contracts/ResolvedDesignTokens";

export type ThemeRuntime = ResolvedDesignTokens;

export type ThemeSelector<T> = (runtime: ThemeRuntime) => T;
