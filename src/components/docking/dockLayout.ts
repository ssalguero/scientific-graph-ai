/**
 * D52.2 — Default dock layout definition (model only).
 * Immutable reference for Context — Provider must not clone or own a mutable copy.
 */
import { DEFAULT_DOCK_SLOTS } from "./dockSlots";
import type { DockLayoutDefinition } from "./types";

export const DEFAULT_DOCK_LAYOUT: DockLayoutDefinition = Object.freeze({
  slots: DEFAULT_DOCK_SLOTS,
});
