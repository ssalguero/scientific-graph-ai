/**
 * UX-8.4 — HoverProvider (sole owner of HoverRegistry for React tree).
 *
 * Owns HoverRegistryApi via useRef.
 * Does not product-wire · no App mount · no WindowRegistry.
 *
 * No production mount in UX-8.4.
 */

"use client";

import { useRef, type ReactNode } from "react";
import { HoverContext } from "./HoverContext";
import { createHoverRegistry } from "./HoverRegistry";

export type HoverProviderProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Private owner of the Hover infrastructure collection.
 * No useState · no useReducer · no product wiring.
 */
export function HoverProvider({ children }: HoverProviderProps) {
  const registryRef = useRef(createHoverRegistry());

  const value = Object.freeze({
    registry: registryRef.current,
  });

  return (
    <HoverContext.Provider value={value}>{children}</HoverContext.Provider>
  );
}
