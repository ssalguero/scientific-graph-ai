/**
 * UX-6.5 — Command Palette Integration Bridge (pass-through).
 *
 * useCommandPalette() = Availability assertion only (Provider presence).
 * Does not own state, mutate, search, execute commands, or wire chrome.
 * No production mount in UX-6.5.
 */

"use client";

import type { ReactNode } from "react";
import { useCommandPalette } from "./useCommandPalette";

export type CommandPaletteBridgeProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Decoupled integration point between Palette and future chrome.
 * Availability assertion only — no search, no conditional render.
 */
export function CommandPaletteBridge({
  children,
}: CommandPaletteBridgeProps) {
  useCommandPalette();
  return <>{children}</>;
}
