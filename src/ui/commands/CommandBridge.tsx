/**
 * UX-6.1 — Command Integration Bridge (pass-through).
 *
 * useCommands() = Availability assertion only (Provider presence).
 * Does not own state, mutate, consume maps, execute commands, or wire chrome.
 * No production mount in UX-6.1.
 */

"use client";

import type { ReactNode } from "react";
import { useCommands } from "./useCommands";

export type CommandBridgeProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Decoupled integration point between Commands and future chrome.
 * Availability assertion only — no Map consumption, no conditional render.
 */
export function CommandBridge({ children }: CommandBridgeProps) {
  useCommands();
  return <>{children}</>;
}
