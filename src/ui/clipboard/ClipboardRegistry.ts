/**
 * UX-8.6 — Mutable Clipboard Registry (SSOT · sole authority).
 *
 * Contract: ClipboardRegistryApi (API Freeze)
 * Singleton: clipboardRegistry (empty by design — no production wiring)
 *
 * Official methods only: set / clear / get / getState.
 * factory → private state → API Freeze → clone-on-read.
 * No React · no navigator.clipboard · no ClipboardEvent · no window ·
 * no document · no execCommand · no Focus · no Selection · no Hover ·
 * no Keyboard · no cross-registry mutation.
 *
 * Clipboard Contract Freeze: ClipboardEntry is a logical payload only.
 *
 * Clipboard Semantics Freeze: set(entry) replaces completely — no accumulate ·
 * no history · no stack.
 *
 * Entry Replacement Freeze: set() always replace — never merge / patch /
 * partial update / incremental mutation.
 *
 * Payload Opaqueness Freeze: payload is opaque — never inspect / validate /
 * serialize / deserialize / transform / interpret.
 *
 * Clipboard Identity Freeze: id is opaque — never generate / modify /
 * uniqueness-validate / interpret. Stored exactly as received.
 *
 * Entry Immutability Freeze: never mutate an existing ClipboardEntry.
 * Changes: new ClipboardEntry → replace → snapshot.
 *
 * Stateless Clipboard Freeze: private state is ONLY entry.
 * No history / stack / queue / undo / redo / previousEntry / timestamps.
 *
 * Browser Clipboard Freeze: no navigator.clipboard · ClipboardEvent · window ·
 * document · execCommand · Clipboard API.
 *
 * API Stability Freeze: get() and getState() are intentionally equivalent.
 * Both remain frozen for API stability; consumers must not assume differences.
 *
 * Singleton Freeze: clipboardRegistry exists ONLY for infrastructure and
 * testing. React consumers MUST use ClipboardProvider + useClipboard().
 */

import {
  createClipboardState,
  type ClipboardState,
} from "./ClipboardState";
import type { ClipboardEntry } from "./ClipboardTypes";

/**
 * Mutable registry contract — API Freeze UX-8.6.
 * Named ClipboardRegistryApi to avoid type/value name collision with the
 * singleton.
 */
export interface ClipboardRegistryApi {
  set(entry: ClipboardEntry): void;
  clear(): void;
  get(): ClipboardState;
  getState(): ClipboardState;
}

/**
 * Creates an isolated in-memory clipboard registry.
 * - Private state: entry only (Stateless Clipboard Freeze)
 * - set() full replace (Entry Replacement Freeze · Entry Immutability Freeze)
 * - get / getState return a defensive frozen clone (equivalent)
 */
export function createClipboardRegistry(): ClipboardRegistryApi {
  let entry: ClipboardEntry | null = null;

  function snapshot(): ClipboardState {
    return createClipboardState({
      entry,
    });
  }

  const api: ClipboardRegistryApi = {
    set(next: ClipboardEntry): void {
      // Entry Replacement + Immutability: new frozen entry; never mutate prior.
      // Identity + Payload Opaqueness: store id / kind / payload as received.
      entry = Object.freeze({
        id: next.id,
        kind: next.kind,
        payload: next.payload,
      });
    },

    clear(): void {
      entry = null;
    },

    get(): ClipboardState {
      return snapshot();
    },

    getState(): ClipboardState {
      return snapshot();
    },
  };

  return Object.freeze(api);
}

/**
 * Empty singleton SSOT for UX-8.6 bootstrap (empty by design).
 * Singleton Freeze: infrastructure / testing only.
 * React consumers MUST use ClipboardProvider + useClipboard().
 */
export const clipboardRegistry: ClipboardRegistryApi =
  createClipboardRegistry();
