/**
 * UX-5.7 — Feature Hooks (read-only Context access layer).
 *
 * Consumes FeatureContext only. Does not own, create, or mutate state.
 * useFeature is an alias of useFeatureState (Registry bridge → UX-5.8).
 */

"use client";

import { useContext } from "react";
import type { FeatureId } from "./FeatureTypes";
import type { FeatureState } from "./FeatureState";
import { FeatureContext } from "./FeatureContext";

/**
 * Returns the exact Provider-owned ReadonlyMap reference (context.states).
 * Reference identity is part of the UX-5.7 API Freeze.
 */
export function useFeatures(): ReadonlyMap<FeatureId, FeatureState> {
  const context = useContext(FeatureContext);
  if (context === null) {
    throw new Error("Feature hooks must be used inside FeatureProvider.");
  }
  return context.states;
}

/**
 * Returns FeatureState | undefined for the given id via context.states.get(id).
 * Does not create or transform snapshots.
 */
export function useFeatureState(
  id: FeatureId,
): FeatureState | undefined {
  const context = useContext(FeatureContext);
  if (context === null) {
    throw new Error("Feature hooks must be used inside FeatureProvider.");
  }
  return context.states.get(id);
}

/**
 * Alias of useFeatureState. API surface frozen for UX-5.8 Registry bridge.
 */
export function useFeature(id: FeatureId): FeatureState | undefined {
  return useFeatureState(id);
}
