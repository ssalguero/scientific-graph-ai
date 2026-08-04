/**
 * UX-6.1 / UX-6.3 — CommandProvider (sole owner of registry + runtime state + pipeline).
 *
 * Owns a CommandRegistryApi view, a ReadonlyMap of CommandState snapshots,
 * and a structural CommandExecutionPipeline via useRef.
 * Does not mutate, sync, expose pipeline on Context, or product-wire.
 *
 * ReadonlyMap Contract:
 * Public contract exposes only ReadonlyMap<CommandId, CommandState>.
 * Internal Map is a private detail; Map mutability is not part of the
 * public contract (JS has no native FrozenMap).
 *
 * CommandContextValue API Freeze (UX-6.1) remains intact — pipeline is
 * owned privately and is not part of the public Context contract.
 * No production mount in UX-6.3.
 */

"use client";

import { useRef, type ReactNode } from "react";
import type { CommandId } from "./CommandTypes";
import type { CommandState } from "./CommandState";
import { commandRegistry } from "./CommandRegistry";
import { CommandContext } from "./CommandContext";
import { createCommandExecutionContext } from "./CommandExecutionContext";
import { createCommandExecutionPipeline } from "./CommandExecutionPipeline";

export type CommandProviderProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Private owner of the Command infrastructure collection.
 * No useState · no useReducer · no setters · no product wiring.
 */
export function CommandProvider({ children }: CommandProviderProps) {
  const emptyStates = new Map<CommandId, CommandState>();
  const statesRef =
    useRef<ReadonlyMap<CommandId, CommandState>>(emptyStates);
  const registryRef = useRef(commandRegistry);
  const pipelineRef = useRef(
    createCommandExecutionPipeline(
      createCommandExecutionContext(commandRegistry, emptyStates),
    ),
  );

  // Retain ownership; pipeline is intentionally not exposed on Context.
  void pipelineRef.current;

  const value = Object.freeze({
    registry: registryRef.current,
    states: statesRef.current,
  });

  return (
    <CommandContext.Provider value={value}>
      {children}
    </CommandContext.Provider>
  );
}
