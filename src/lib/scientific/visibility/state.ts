import { isVisibilityToggleKey } from "./registry";
import type { VisibilityState, VisibilityToggleKey } from "./types";

export const cloneVisibilityState = (
  state: VisibilityState
): VisibilityState => ({ ...state });

export const mergeVisibilityState = (
  base: VisibilityState,
  patch: VisibilityState
): VisibilityState => {
  const merged = cloneVisibilityState(base);

  for (const [rawKey, value] of Object.entries(patch)) {
    if (typeof value !== "boolean" || !isVisibilityToggleKey(rawKey)) {
      continue;
    }
    merged[rawKey] = value;
  }

  return merged;
};

export const applyVisibilityKeys = (
  state: VisibilityState,
  keys: readonly VisibilityToggleKey[],
  value: boolean
): VisibilityState => {
  const patch: VisibilityState = {};

  for (const key of keys) {
    patch[key] = value;
  }

  return mergeVisibilityState(state, patch);
};
