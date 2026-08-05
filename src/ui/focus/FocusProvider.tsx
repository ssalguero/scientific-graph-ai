/**
 * UX-8.1 — FocusProvider (sole owner of FocusRegistry for React tree).
 *
 * Owns FocusRegistryApi via useRef.
 * Does not product-wire · no App mount · no WindowRegistry.
 *
 * No production mount in UX-8.1.
 */

"use client";

import { useRef, type ReactNode } from "react";
import { FocusContext } from "./FocusContext";
import { createFocusRegistry } from "./FocusRegistry";

export type FocusProviderProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Private owner of the Focus infrastructure collection.
 * No useState · no useReducer · no product wiring.
 */
export function FocusProvider({ children }: FocusProviderProps) {
  const registryRef = useRef(createFocusRegistry());

  const value = Object.freeze({
    registry: registryRef.current,
  });

  return (
    <FocusContext.Provider value={value}>{children}</FocusContext.Provider>
  );
}
