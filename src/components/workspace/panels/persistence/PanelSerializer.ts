/** UX-2.8 — PanelState (flat) → PersistedPanelState / JSON. Never touches storage. */

import {
  PANEL_MIN_SIZE,
  type PanelId,
  type PanelState,
} from "../state/PanelState";

export interface PersistedPanelEntry {
  id: "left" | "right" | "bottom";
  collapsed: boolean;
  size: number;
  visible: boolean;
}

export interface PersistedPanelState {
  version: 1;
  left: PersistedPanelEntry;
  right: PersistedPanelEntry;
  bottom: PersistedPanelEntry;
  activePanel: "left" | "right" | "bottom" | null;
}

function clampSize(size: number): number {
  return Math.max(PANEL_MIN_SIZE, size);
}

function entry(
  id: PanelId,
  collapsed: boolean,
  size: number
): PersistedPanelEntry {
  return {
    id,
    collapsed,
    size: clampSize(size),
    visible: true,
  };
}

/**
 * Map flat live state → nested persisted schema.
 * Clamps sizes; always writes visible: true.
 * activePanel is optional and is not read from PanelState.
 */
export function serialize(
  state: PanelState,
  activePanel: PersistedPanelState["activePanel"] = null
): PersistedPanelState {
  return {
    version: 1,
    left: entry("left", state.leftCollapsed, state.leftWidth),
    right: entry("right", state.rightCollapsed, state.rightWidth),
    bottom: entry("bottom", state.bottomCollapsed, state.bottomHeight),
    activePanel,
  };
}

/** serialize → JSON.stringify. */
export function toJSON(
  state: PanelState,
  activePanel: PersistedPanelState["activePanel"] = null
): string {
  return JSON.stringify(serialize(state, activePanel));
}
