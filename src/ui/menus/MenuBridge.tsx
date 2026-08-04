/**
 * UX-6.6 — Menu Integration Bridge (pass-through).
 *
 * useMenus() = Availability assertion only (Provider presence).
 * Does not own state, mutate, execute commands, or wire chrome.
 * No production mount in UX-6.6.
 */

"use client";

import type { ReactNode } from "react";
import { useMenus } from "./useMenus";

export type MenuBridgeProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Decoupled integration point between Menus and future chrome.
 * Availability assertion only — no render chrome, no conditional render.
 */
export function MenuBridge({ children }: MenuBridgeProps) {
  useMenus();
  return <>{children}</>;
}
