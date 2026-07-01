import {
  GUIDED_WORKFLOW_TOGGLE_KEYS_V1,
} from "@/lib/project/keys";

import {
  getToggleRegistryEntry,
  isVisibilityToggleKey,
  VISIBILITY_TOGGLE_KEYS,
  VISIBILITY_TOGGLE_REGISTRY,
} from "./registry";
import type { ToggleCategory, VisibilityState, VisibilityToggleKey } from "./types";

export const isVisible = (
  state: VisibilityState,
  key: VisibilityToggleKey
): boolean => {
  const explicit = state[key];
  if (typeof explicit === "boolean") {
    return explicit;
  }

  return getToggleRegistryEntry(key).defaultVisible;
};

export const listKeysByCategory = (
  category: ToggleCategory
): VisibilityToggleKey[] =>
  VISIBILITY_TOGGLE_KEYS.filter(
    (key) => VISIBILITY_TOGGLE_REGISTRY[key].category === category
  );

export const listMethodologyToggles = (): VisibilityToggleKey[] =>
  listKeysByCategory("methodology");

export const listWorkflowToggleKeys = (): VisibilityToggleKey[] =>
  GUIDED_WORKFLOW_TOGGLE_KEYS_V1.filter(isVisibilityToggleKey);

export const listVisibleKeys = (state: VisibilityState): VisibilityToggleKey[] =>
  VISIBILITY_TOGGLE_KEYS.filter((key) => isVisible(state, key));

export const listVisibleKeysByCategory = (
  state: VisibilityState,
  category: ToggleCategory
): VisibilityToggleKey[] =>
  listKeysByCategory(category).filter((key) => isVisible(state, key));
