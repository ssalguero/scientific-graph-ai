import { VISIBILITY_TOGGLE_KEYS, VISIBILITY_TOGGLE_REGISTRY } from "./registry";
import type { VisibilityState } from "./types";

export const createDefaultVisibilityState = (): VisibilityState => {
  const state: VisibilityState = {};

  for (const key of VISIBILITY_TOGGLE_KEYS) {
    state[key] = VISIBILITY_TOGGLE_REGISTRY[key].defaultVisible;
  }

  return state;
};
