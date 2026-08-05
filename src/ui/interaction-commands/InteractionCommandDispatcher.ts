/**
 * UX-8.7 — Mutable Interaction Command Dispatcher (SSOT · sole authority).
 *
 * Contract: InteractionCommandDispatcherApi (API Freeze)
 * Singleton: interactionCommandDispatcher (empty by design — no production wiring)
 *
 * Official methods only: dispatch / clear / get / getState.
 * factory → private state → API Freeze → clone-on-read.
 * No React · no UX-6 · no CommandExecutionDispatcher · no WindowRegistry ·
 * no Focus · no Selection · no Hover · no Keyboard · no Clipboard ·
 * no Runtime · no scientific · no cross-registry mutation.
 *
 * Dispatcher Freeze: no queue · async · scheduler · retry · middleware ·
 * handlers · plugins.
 *
 * Shape Validation Freeze: dispatch validates structural shape only.
 *
 * Dispatch Semantics Freeze: validate → create result → replace lastResult →
 * return. Never execute application logic / handlers / UX-6 / Runtime /
 * other registries.
 *
 * Dispatch Determinism Freeze: same input → same InteractionCommandResult.
 * Independent of React · Runtime · environment · time · global state.
 * Sole allowed side effect: replace lastResult.
 *
 * Stateless Dispatch Freeze: private state is ONLY lastResult.
 * No history / queue / pending / retries / execution stack.
 *
 * Command Opaqueness Freeze: never interpret payload or type beyond shape.
 *
 * Command Identity Freeze: id is opaque — never generate / modify /
 * uniqueness-validate / interpret.
 *
 * Result Immutability Freeze: never mutate an existing InteractionCommandResult.
 * Each dispatch: new result → replace lastResult.
 *
 * Result Snapshot Freeze: get / getState clone-on-read via snapshot();
 * never expose the internal lastResult reference.
 *
 * API Stability Freeze: get() and getState() are intentionally equivalent.
 *
 * Singleton Freeze: interactionCommandDispatcher exists ONLY for infrastructure
 * and testing. React consumers MUST use InteractionCommandProvider +
 * useInteractionCommands().
 */

import type { InteractionCommand } from "./InteractionCommand";
import type { InteractionCommandResult } from "./InteractionCommandResult";

/**
 * Dispatcher state snapshot — Stateless Dispatch Freeze: lastResult ONLY.
 * Lives in this file (no separate State module — UX-8.7 fence).
 */
export type InteractionCommandDispatcherState = Readonly<{
  lastResult: InteractionCommandResult | null;
}>;

/**
 * Mutable dispatcher contract — API Freeze UX-8.7.
 * Named InteractionCommandDispatcherApi to avoid type/value name collision
 * with the singleton.
 */
export interface InteractionCommandDispatcherApi {
  dispatch(command: InteractionCommand): InteractionCommandResult;
  clear(): void;
  get(): InteractionCommandDispatcherState;
  getState(): InteractionCommandDispatcherState;
}

function isValidCommandShape(command: unknown): command is InteractionCommand {
  if (command === null || typeof command !== "object") {
    return false;
  }
  const c = command as Record<string, unknown>;
  if (typeof c.id !== "string") return false;
  if (typeof c.type !== "string") return false;
  if (!Object.prototype.hasOwnProperty.call(c, "payload")) return false;
  return true;
}

function freezeResult(
  accepted: boolean,
  reason: string | null,
): InteractionCommandResult {
  return Object.freeze({
    accepted,
    reason,
  });
}

/**
 * Creates an isolated in-memory interaction command dispatcher.
 * - Private state: lastResult only (Stateless Dispatch Freeze)
 * - dispatch() shape-validate only → new frozen result → replace
 * - get / getState return a defensive frozen clone (equivalent)
 */
export function createInteractionCommandDispatcher(): InteractionCommandDispatcherApi {
  let lastResult: InteractionCommandResult | null = null;

  function snapshot(): InteractionCommandDispatcherState {
    const cloned: InteractionCommandResult | null =
      lastResult === null
        ? null
        : Object.freeze({
            accepted: lastResult.accepted,
            reason: lastResult.reason,
          });
    return Object.freeze({
      lastResult: cloned,
    });
  }

  const api: InteractionCommandDispatcherApi = {
    dispatch(command: InteractionCommand): InteractionCommandResult {
      // Shape Validation Freeze: structural checks only.
      // Command Opaqueness / Identity: never interpret type / payload / id.
      // Dispatch Determinism: same shape outcome → same result fields.
      // Result Immutability: always a NEW frozen result; full replace.
      const result: InteractionCommandResult = !isValidCommandShape(command)
        ? freezeResult(false, "invalid InteractionCommand shape")
        : freezeResult(true, null);
      lastResult = result;
      return result;
    },

    clear(): void {
      lastResult = null;
    },

    get(): InteractionCommandDispatcherState {
      return snapshot();
    },

    getState(): InteractionCommandDispatcherState {
      return snapshot();
    },
  };

  return Object.freeze(api);
}

/**
 * Empty singleton SSOT for UX-8.7 bootstrap (empty by design).
 * Singleton Freeze: infrastructure / testing only.
 * React consumers MUST use InteractionCommandProvider + useInteractionCommands().
 */
export const interactionCommandDispatcher: InteractionCommandDispatcherApi =
  createInteractionCommandDispatcher();
