import type { ReactNode } from "react";

/** Frozen public API — D51.1 Docking API Freeze. No breaking changes during D51. */
export type DockSide = "left" | "center" | "right" | "bottom" | "floating";

/** Frozen public API — D51.1 Docking API Freeze. No breaking changes during D51. */
export type DockLocation = DockSide;

/** Frozen public API — D51.1 Docking API Freeze. No breaking changes during D51. */
export type DockSize = {
  width?: number;
  height?: number;
};

/** Frozen public API — D51.1 Docking API Freeze. No breaking changes during D51. */
export type DockState = {
  activePanelIds: string[];
  sizes: Partial<Record<DockSide, DockSize>>;
};

/** Frozen public API — D51.1 Docking API Freeze. No breaking changes during D51. */
export type DockRootProps = {
  children?: ReactNode;
};

/** Frozen public API — D51.1 Docking API Freeze. No breaking changes during D51. */
export type DockZoneProps = {
  side: DockSide;
  children?: ReactNode;
};

/** Frozen public API — D51.1 Docking API Freeze. No breaking changes during D51. */
export type DockPanelProps = {
  id: string;
  children?: ReactNode;
};

/** Frozen public API — D51.1 Docking API Freeze. No breaking changes during D51. */
export type DockRegistryEntry = {
  id: string;
  location: DockLocation;
  defaultSize?: DockSize;
};

/**
 * Frozen panel id constants — D51.1.
 * No magic strings when wiring panels.
 */
export const DOCK_PANEL_IDS = {
  inspector: "inspector",
} as const;

/**
 * Read-only context value — D51.1.
 * No dispatch / reducer / register / unregister.
 */
export type DockContextValue = {
  state: DockState;
  registry: typeof import("./DockRegistry").DOCK_REGISTRY;
};
