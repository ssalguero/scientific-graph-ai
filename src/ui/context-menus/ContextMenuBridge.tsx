/**
 * UX-6.8 — Context Menu Integration Bridge (pass-through).
 *
 * useContextMenus() = Availability assertion only (Provider presence).
 * Does not own state, mutate, execute commands, or wire chrome.
 * No production mount in UX-6.8.
 */

"use client";

import type { ReactNode } from "react";
import { useContextMenus } from "./useContextMenus";

export type ContextMenuBridgeProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Decoupled integration point between Context Menus and future chrome.
 * Availability assertion only — no render chrome, no conditional render.
 */
export function ContextMenuBridge({ children }: ContextMenuBridgeProps) {
  useContextMenus();
  return <>{children}</>;
}
