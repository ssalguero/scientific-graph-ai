/**
 * UX-5.6 — Private FeatureContext (runtime state ownership surface).
 *
 * Declares FeatureContextValue and FeatureContext only.
 * Does not own maps, create snapshots, or expose hooks.
 */

"use client";

import { createContext } from "react";
import type { FeatureId } from "./FeatureTypes";
import type { FeatureState } from "./FeatureState";

/**
 * Private context value: ReadonlyMap view of FeatureState snapshots.
 * No Registry · no setters · no mutators.
 */
export type FeatureContextValue = Readonly<{
  states: ReadonlyMap<FeatureId, FeatureState>;
}>;

export const FeatureContext =
  createContext<FeatureContextValue | null>(null);
