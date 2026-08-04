/**
 * UX-6.4 — Shortcut Integration Bridge (pass-through).
 *
 * useShortcuts() = Availability assertion only (Provider presence).
 * Does not own state, mutate, resolve keys, execute commands, or wire chrome.
 * No production mount in UX-6.4.
 */

"use client";

import type { ReactNode } from "react";
import { useShortcuts } from "./useShortcuts";

export type ShortcutBridgeProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Decoupled integration point between Shortcuts and future chrome.
 * Availability assertion only — no Map consumption, no conditional render.
 */
export function ShortcutBridge({ children }: ShortcutBridgeProps) {
  useShortcuts();
  return <>{children}</>;
}
