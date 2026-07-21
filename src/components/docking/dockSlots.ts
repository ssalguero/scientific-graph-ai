/**
 * D52.2 — Default dock slot definitions (model only).
 */
import { DOCK_PANEL_IDS } from "./types";
import type { DockSlotDefinition } from "./types";

export const DEFAULT_DOCK_SLOTS: readonly DockSlotDefinition[] = Object.freeze([
  Object.freeze({
    side: "left" as const,
    panelIds: Object.freeze([] as string[]),
  }),
  Object.freeze({
    side: "right" as const,
    panelIds: Object.freeze([DOCK_PANEL_IDS.inspector] as string[]),
  }),
  Object.freeze({
    side: "bottom" as const,
    panelIds: Object.freeze([] as string[]),
  }),
  Object.freeze({
    side: "floating" as const,
    panelIds: Object.freeze([] as string[]),
  }),
]);
