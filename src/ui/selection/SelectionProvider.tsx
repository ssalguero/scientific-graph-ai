/**
 * UX-8.2 — SelectionProvider (sole owner of SelectionRegistry for React tree).
 *
 * Owns SelectionRegistryApi via useRef.
 * Does not product-wire · no App mount · no WindowRegistry.
 *
 * No production mount in UX-8.2.
 */

"use client";

import { useRef, type ReactNode } from "react";
import { SelectionContext } from "./SelectionContext";
import { createSelectionRegistry } from "./SelectionRegistry";

export type SelectionProviderProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Private owner of the Selection infrastructure collection.
 * No useState · no useReducer · no product wiring.
 */
export function SelectionProvider({ children }: SelectionProviderProps) {
  const registryRef = useRef(createSelectionRegistry());

  const value = Object.freeze({
    registry: registryRef.current,
  });

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}
