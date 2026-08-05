/**
 * UX-8.5 — Private KeyboardNavigationContext (registry ownership surface).
 *
 * Declares KeyboardNavigationContextValue and KeyboardNavigationContext only.
 * Does not own state or expose hooks.
 */

"use client";

import { createContext } from "react";
import type { KeyboardNavigationRegistryApi } from "./KeyboardNavigationRegistry";

/**
 * Private context value: KeyboardNavigationRegistryApi SSOT view.
 * Mutations go only through KeyboardNavigationRegistry (sole authority).
 */
export type KeyboardNavigationContextValue = Readonly<{
  registry: KeyboardNavigationRegistryApi;
}>;

export const KeyboardNavigationContext =
  createContext<KeyboardNavigationContextValue | null>(null);
