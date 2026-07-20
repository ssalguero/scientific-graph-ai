/**
 * D51.2 — Immutable dock registry.
 * Seed: inspector only. Mutations / additional panels deferred to D52+.
 */
import { DOCK_TOKENS } from "./DockTokens";
import { DOCK_PANEL_IDS } from "./types";

export const DOCK_REGISTRY = Object.freeze({
  inspector: {
    id: DOCK_PANEL_IDS.inspector,
    location: "right" as const,
    defaultSize: {
      width: DOCK_TOKENS.rightWidth,
    },
  },
});
