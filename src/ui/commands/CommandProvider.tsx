/**
 * UX-6.1 — CommandProvider (sole owner of registry + runtime CommandState map).
 *
 * Owns a CommandRegistryApi view and a ReadonlyMap of CommandState snapshots
 * via useRef. Does not mutate, create snapshots, sync, or expose hooks.
 *
 * ReadonlyMap Contract:
 * Public contract exposes only ReadonlyMap<CommandId, CommandState>.
 * Internal Map is a private detail; Map mutability is not part of the
 * public contract (JS has no native FrozenMap).
 *
 * Empty by design — registration → UX-6.2. No production mount in UX-6.1.
 */

"use client";

import { useRef, type ReactNode } from "react";
import type { CommandId } from "./CommandTypes";
import type { CommandState } from "./CommandState";
import { commandRegistry } from "./CommandRegistry";
import { CommandContext } from "./CommandContext";

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
