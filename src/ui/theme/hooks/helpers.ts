/**
 * UX-3.5 — Private consumption helpers.
 * Not re-exported from hooks/index.ts.
 * memoSelector is reserved infrastructure only (unused by selectors this phase).
 */

import { isThemeId, type ThemeId } from "../ids";
import type { ResolvedDesignTokens } from "../tokens/contracts/ResolvedDesignTokens";

export function assertTheme(value: unknown): asserts value is ThemeId {
  if (!isThemeId(value)) {
    throw new Error(`Invalid ThemeId: ${String(value)}`);
  }
}

export function assertTokens(
  value: unknown,
): asserts value is ResolvedDesignTokens {
  if (value === null || typeof value !== "object") {
    throw new Error("Invalid ResolvedDesignTokens: expected object");
  }
  const t = value as Record<string, unknown>;
  for (const key of [
    "colors",
    "typography",
    "spacing",
    "radius",
    "motion",
    "shadows",
    "elevation",
    "layout",
  ] as const) {
    if (!(key in t) || t[key] === null || typeof t[key] !== "object") {
      throw new Error(`Invalid ResolvedDesignTokens: missing ${key}`);
    }
  }
}

export function freezeDev<T extends object>(value: T): T {
  if (process.env.NODE_ENV !== "production") {
    return Object.freeze(value);
  }
  return value;
}

/**
 * Reserved for future phases. UX-3.5 selectors MUST NOT call this.
 * Returns previousResult when tokens === previousTokens (identity).
 */
export function memoSelector<TTokens, TResult>(
  tokens: TTokens,
  previousTokens: TTokens | undefined,
  previousResult: TResult | undefined,
  select: (tokens: TTokens) => TResult,
): TResult {
  if (
    previousTokens !== undefined &&
    previousResult !== undefined &&
    Object.is(tokens, previousTokens)
  ) {
    return previousResult;
  }
  return select(tokens);
}
