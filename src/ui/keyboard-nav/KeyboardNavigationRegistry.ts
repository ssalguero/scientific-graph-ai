/**
 * UX-8.5 — Mutable Keyboard Navigation Registry (SSOT · sole authority).
 *
 * Contract: KeyboardNavigationRegistryApi (API Freeze)
 * Singleton: keyboardNavigationRegistry (empty by design — no production wiring)
 *
 * Official methods only: next / previous / move / escape / clear / get / getState.
 * factory → private state → API Freeze → clone-on-read.
 * No React · no DOM · no KeyboardEvent · no Focus · no Selection · no Hover ·
 * no cross-registry mutation.
 *
 * Direction Normalization Freeze: move() is the ONLY canonical operation.
 * next() ≡ move(NEXT) · previous() ≡ move(PREVIOUS) · escape() ≡ move(ESCAPE).
 * Shortcuts delegate; they MUST NOT duplicate logic.
 *
 * Stateless Navigation Freeze: private state is ONLY lastDirection.
 * No currentIndex / currentTarget / currentFocus / currentSelection /
 * navigationStack / history.
 *
 * Navigation Semantics Freeze: intent only — not physical keys.
 *
 * API Stability Freeze: get() and getState() are intentionally equivalent.
 * Both remain frozen for API stability; consumers must not assume differences.
 *
 * Singleton Freeze: keyboardNavigationRegistry exists ONLY for infrastructure
 * and testing. React consumers MUST use KeyboardNavigationProvider +
 * useKeyboardNavigation().
 */

import {
  createKeyboardNavigationState,
  type KeyboardNavigationState,
} from "./KeyboardNavigationState";
import { KeyboardNavigationDirection } from "./KeyboardNavigationTypes";

/**
 * Mutable registry contract — API Freeze UX-8.5.
 * Named KeyboardNavigationRegistryApi to avoid type/value name collision
 * with the singleton.
 */
export interface KeyboardNavigationRegistryApi {
  next(): void;
  previous(): void;
  move(direction: KeyboardNavigationDirection): void;
  escape(): void;
  clear(): void;
  get(): KeyboardNavigationState;
  getState(): KeyboardNavigationState;
}

/**
 * Creates an isolated in-memory keyboard navigation registry.
 * - Private state: lastDirection only (Stateless Navigation Freeze)
 * - Direction Normalization: next / previous / escape delegate to move()
 * - get / getState return a defensive frozen clone (equivalent)
 */
export function createKeyboardNavigationRegistry(): KeyboardNavigationRegistryApi {
  let lastDirection: KeyboardNavigationDirection | null = null;

  function snapshot(): KeyboardNavigationState {
    return createKeyboardNavigationState({
      lastDirection,
    });
  }

  const api: KeyboardNavigationRegistryApi = {
    next(): void {
      api.move(KeyboardNavigationDirection.NEXT);
    },

    previous(): void {
      api.move(KeyboardNavigationDirection.PREVIOUS);
    },

    move(direction: KeyboardNavigationDirection): void {
      lastDirection = direction;
    },

    escape(): void {
      api.move(KeyboardNavigationDirection.ESCAPE);
    },

    clear(): void {
      lastDirection = null;
    },

    get(): KeyboardNavigationState {
      return snapshot();
    },

    getState(): KeyboardNavigationState {
      return snapshot();
    },
  };

  return Object.freeze(api);
}

/**
 * Empty singleton SSOT for UX-8.5 bootstrap (empty by design).
 * Singleton Freeze: infrastructure / testing only.
 * React consumers MUST use KeyboardNavigationProvider + useKeyboardNavigation().
 */
export const keyboardNavigationRegistry: KeyboardNavigationRegistryApi =
  createKeyboardNavigationRegistry();
