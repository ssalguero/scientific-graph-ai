/**
 * UX-6.1 — Command Hooks (read-only Context access layer).
 *
 * Consumes CommandContext only. Does not own, create, or mutate state.
 * No execution · no registration · no shortcuts.
 */

"use client";

import { useContext } from "react";
import { CommandContext, type CommandContextValue } from "./CommandContext";

/**
 * Returns the exact Provider-owned CommandContextValue reference.
 * Reference identity of registry/states is part of the UX-6.1 API Freeze.
 */
export function useCommands(): CommandContextValue {
  const context = useContext(CommandContext);
  if (context === null) {
    throw new Error("Command hooks must be used inside CommandProvider.");
  }
  return context;
}
