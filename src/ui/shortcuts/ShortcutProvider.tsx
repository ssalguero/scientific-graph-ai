/**
 * UX-6.4 — ShortcutProvider (sole owner of registry view + private resolver).
 *
 * Owns a ShortcutRegistryApi view and a ShortcutResolver via useRef.
 * Does not mutate, sync, expose resolver on Context, or product-wire.
 *
 * ShortcutContextValue API Freeze: Context exposes `{ registry }` only.
 * No production mount in UX-6.4.
 */

"use client";

import { useRef, type ReactNode } from "react";
import { ShortcutContext } from "./ShortcutContext";
import { shortcutRegistry } from "./ShortcutRegistryBuilder";
import { createShortcutResolver } from "./ShortcutResolver";

export type ShortcutProviderProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Private owner of the Shortcut infrastructure collection.
 * No useState · no useReducer · no setters · no product wiring · no browser.
 */
export function ShortcutProvider({ children }: ShortcutProviderProps) {
  const registryRef = useRef(shortcutRegistry);
  const resolverRef = useRef(createShortcutResolver(shortcutRegistry));

  // Retain ownership; resolver is intentionally not exposed on Context.
  void resolverRef.current;

  const value = Object.freeze({
    registry: registryRef.current,
  });

  return (
    <ShortcutContext.Provider value={value}>
      {children}
    </ShortcutContext.Provider>
  );
}
