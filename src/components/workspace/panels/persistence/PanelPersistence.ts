/** UX-2.8 — Thin facade: PanelState ↔ localStorage via toJSON / fromJSON. */

import type { PanelState } from "../state/PanelState";

import { fromJSON } from "./PanelDeserializer";
import { toJSON } from "./PanelSerializer";
import * as PanelStorage from "./PanelStorage";

/** Restore panel layout state from storage (defaults on miss / invalid). */
export function load(): PanelState {
  return fromJSON(PanelStorage.load());
}

/** Persist panel layout state immediately (no debounce). */
export function save(state: PanelState): void {
  PanelStorage.save(toJSON(state));
}

/** Clear persisted panel layout. */
export function clear(): void {
  PanelStorage.clear();
}
