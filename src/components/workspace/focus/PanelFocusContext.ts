"use client";

import { createContext } from "react";

/** UX-2.13 — Frozen active surface ids (UI focus only). */
export type ActivePanelId = "canvas" | "left" | "right" | "bottom";

/** UX-2.13 — Default active surface (Primary Surface). */
export const DEFAULT_ACTIVE_PANEL: ActivePanelId = "canvas";

/** UX-2.13 — Orthogonal UI focus context (no PanelState coupling). */
export type PanelFocusContextValue = {
  activePanelId: ActivePanelId;
  setActivePanel(id: ActivePanelId): void;
};

export const PanelFocusContext =
  createContext<PanelFocusContextValue | null>(null);
