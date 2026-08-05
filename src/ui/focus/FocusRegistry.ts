/**
 * UX-8.1 — Mutable Focus Registry (SSOT · sole focus authority).
 *
 * Contract: FocusRegistryApi (Registry Freeze)
 * Singleton: focusRegistry (empty by design — no production focus)
 *
 * Official methods only: focus / blur / getState / isFocused / clear.
 * factory → private state → API Freeze → clone-on-read.
 * No React · no WindowRegistry · no cross-registry mutation.
 */

import { createFocusState, type FocusState } from "./FocusState";
import type { FocusTargetId } from "./FocusTypes";

/**
 * Mutable registry contract — Registry Freeze UX-8.1.
 * Named FocusRegistryApi to avoid type/value name collision with the singleton.
 */
export interface FocusRegistryApi {
  focus(id: FocusTargetId): void;
  blur(): void;
  getState(): FocusState;
  isFocused(id: FocusTargetId): boolean;
  clear(): void;
}

/**
 * Creates an isolated in-memory focus registry.
 * - Private FocusState (not a multi-entry Map)
 * - getState returns a defensive frozen clone
 * - isFocused is derived from focusedId
 */
export function createFocusRegistry(): FocusRegistryApi {
  let focusedId: FocusTargetId | null = null;
  let lastFocusedId: FocusTargetId | null = null;

  return Object.freeze({
    focus(id: FocusTargetId): void {
      if (focusedId === id) {
        return;
      }
      if (focusedId !== null) {
        lastFocusedId = focusedId;
      }
      focusedId = id;
    },

    blur(): void {
      if (focusedId === null) {
        return;
      }
      lastFocusedId = focusedId;
      focusedId = null;
    },

    getState(): FocusState {
      return createFocusState({ focusedId, lastFocusedId });
    },

    isFocused(id: FocusTargetId): boolean {
      return focusedId === id;
    },

    clear(): void {
      focusedId = null;
      lastFocusedId = null;
    },
  });
}

/** Empty singleton SSOT for UX-8.1 bootstrap (empty by design). */
export const focusRegistry: FocusRegistryApi = createFocusRegistry();
