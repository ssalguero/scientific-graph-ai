/**
 * UX-6.7 — Toolbar Integration Bridge (pass-through).
 *
 * useToolbar() = Availability assertion only (Provider presence).
 * Does not own state, mutate, execute commands, or wire chrome.
 * No production mount in UX-6.7.
 */

"use client";

import type { ReactNode } from "react";
import { useToolbar } from "./useToolbar";

export type ToolbarBridgeProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Decoupled integration point between Toolbar and future chrome.
 * Availability assertion only — no render chrome, no conditional render.
 */
export function ToolbarBridge({ children }: ToolbarBridgeProps) {
  useToolbar();
  return <>{children}</>;
}
