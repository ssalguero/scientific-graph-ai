/**
 * UX-3.6 — Prepared selector factory (passthrough; no memoization).
 */

import type { ThemeSelector } from "./ThemeSelector";

export function createSelector<T>(
  selector: ThemeSelector<T>,
): ThemeSelector<T> {
  return selector;
}
