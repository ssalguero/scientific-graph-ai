/**
 * UX-8.5 — KeyboardNavigationProvider (sole owner of registry for React tree).
 *
 * Owns KeyboardNavigationRegistryApi via useRef.
 * Does not product-wire · no App mount · no DOM listeners · no WindowRegistry.
 *
 * No production mount in UX-8.5.
 */

"use client";

import { useRef, type ReactNode } from "react";
import { KeyboardNavigationContext } from "./KeyboardNavigationContext";
import { createKeyboardNavigationRegistry } from "./KeyboardNavigationRegistry";

export type KeyboardNavigationProviderProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Private owner of the Keyboard Navigation infrastructure collection.
 * No useState · no useReducer · no product wiring.
 */
export function KeyboardNavigationProvider({
  children,
}: KeyboardNavigationProviderProps) {
  const registryRef = useRef(createKeyboardNavigationRegistry());

  const value = Object.freeze({
    registry: registryRef.current,
  });

  return (
    <KeyboardNavigationContext.Provider value={value}>
      {children}
    </KeyboardNavigationContext.Provider>
  );
}
