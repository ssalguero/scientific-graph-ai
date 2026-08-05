/**
 * UX-8.6 — ClipboardProvider (sole owner of registry for React tree).
 *
 * Owns ClipboardRegistryApi via useRef.
 * Does not product-wire · no App mount · no browser clipboard · no WindowRegistry.
 *
 * No production mount in UX-8.6.
 */

"use client";

import { useRef, type ReactNode } from "react";
import { ClipboardContext } from "./ClipboardContext";
import { createClipboardRegistry } from "./ClipboardRegistry";

export type ClipboardProviderProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Private owner of the Clipboard infrastructure collection.
 * No useState · no useReducer · no product wiring.
 */
export function ClipboardProvider({ children }: ClipboardProviderProps) {
  const registryRef = useRef(createClipboardRegistry());

  const value = Object.freeze({
    registry: registryRef.current,
  });

  return (
    <ClipboardContext.Provider value={value}>
      {children}
    </ClipboardContext.Provider>
  );
}
