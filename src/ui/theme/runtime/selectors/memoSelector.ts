/**
 * UX-3.6 — Official memoSelector SSOT.
 * Preserves UX-3.5 signature; WeakMap only when tokens is a non-null object.
 */

import type { ThemeRuntime } from "./ThemeSelector";
import * as selectorCache from "./cache";

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

  if (typeof tokens === "object" && tokens !== null) {
    const runtime = tokens as unknown as ThemeRuntime;
    if (selectorCache.has(runtime, select)) {
      return selectorCache.get(runtime, select) as TResult;
    }
    const result = select(tokens);
    selectorCache.set(runtime, select, result);
    return result;
  }

  return select(tokens);
}
