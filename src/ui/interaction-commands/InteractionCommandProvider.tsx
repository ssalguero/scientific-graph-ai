/**
 * UX-8.7 — InteractionCommandProvider (sole owner of dispatcher for React tree).
 *
 * Owns InteractionCommandDispatcherApi via useRef.
 * Does not product-wire · no App mount · no UX-6 · no WindowRegistry.
 *
 * No production mount in UX-8.7.
 */

"use client";

import { useRef, type ReactNode } from "react";
import { InteractionCommandContext } from "./InteractionCommandContext";
import { createInteractionCommandDispatcher } from "./InteractionCommandDispatcher";

export type InteractionCommandProviderProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Private owner of the Interaction Commands infrastructure collection.
 * No useState · no useReducer · no product wiring.
 */
export function InteractionCommandProvider({
  children,
}: InteractionCommandProviderProps) {
  const dispatcherRef = useRef(createInteractionCommandDispatcher());

  const value = Object.freeze({
    dispatcher: dispatcherRef.current,
  });

  return (
    <InteractionCommandContext.Provider value={value}>
      {children}
    </InteractionCommandContext.Provider>
  );
}
