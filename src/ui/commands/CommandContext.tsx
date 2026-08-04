/**
 * UX-6.1 — Private CommandContext (registry + runtime state ownership surface).
 *
 * Declares CommandContextValue and CommandContext only.
 * Does not own maps, create snapshots, or expose hooks.
 */

"use client";

import { createContext } from "react";
import type { CommandRegistryApi } from "./CommandRegistry";
import type { CommandId } from "./CommandTypes";
import type { CommandState } from "./CommandState";

/**
 * Private context value: registry SSOT view + ReadonlyMap of CommandState.
 * No setters · no mutators · no execution.
 */
export type CommandContextValue = Readonly<{
  registry: CommandRegistryApi;
  states: ReadonlyMap<CommandId, CommandState>;
}>;

export const CommandContext =
  createContext<CommandContextValue | null>(null);
