/**
 * UX-5.6 — FeatureProvider (sole owner of runtime FeatureState map).
 *
 * Owns a ReadonlyMap view of FeatureState snapshots via useRef.
 * Does not mutate snapshots, create snapshots, sync, or expose hooks.
 *
 * ReadonlyMap Contract:
 * Public contract exposes only ReadonlyMap<FeatureId, FeatureState>.
 * Internal Map is a private detail; Map mutability is not part of the
 * public contract (JS has no native FrozenMap).
 */

"use client";

import { useRef, type ReactNode } from "react";
import type { FeatureId } from "./FeatureTypes";
import type { FeatureState } from "./FeatureState";
import { FeatureContext } from "./FeatureContext";

export type FeatureProviderProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Private owner of the runtime FeatureState collection.
 * No useState · no useReducer · no setters · no product wiring.
 */
export function FeatureProvider({ children }: FeatureProviderProps) {
  const emptyStates = new Map<FeatureId, FeatureState>();
  const statesRef =
    useRef<ReadonlyMap<FeatureId, FeatureState>>(emptyStates);

  const value = Object.freeze({
    states: statesRef.current,
  });

  return (
    <FeatureContext.Provider value={value}>
      {children}
    </FeatureContext.Provider>
  );
}
