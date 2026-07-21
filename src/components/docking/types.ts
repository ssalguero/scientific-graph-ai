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

/**
 * DockState v1 Freeze — D52.1.
 * Shape frozen; future extensions must be additive only.
 * `activePanelIds` is a logical set (unique ids; no duplicates).
 */
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

/** Frozen public API — D52.1 Dock Features API Freeze. Query surface only. */
export type DockRegistryQuery = {
  get(id: string): DockRegistryEntry | undefined;
  list(): readonly DockRegistryEntry[];
  has(id: string): boolean;
};

/** Frozen public API — D52.1 Dock Features API Freeze. Mutations only. */
export type DockRegistrationApi = {
  register(entry: DockRegistryEntry): void;
  unregister(id: string): void;
};

/** Frozen public API — D52.1 Dock Features API Freeze. Operates only on activePanelIds. */
export type DockVisibilityApi = {
  show(panelId: string): void;
  hide(panelId: string): void;
  isVisible(panelId: string): boolean;
};

/** Frozen public API — D52.1 Dock Features API Freeze. */
export type DockSlotDefinition = {
  side: DockSide;
  panelIds: readonly string[];
};

/** Frozen public API — D52.1 Dock Features API Freeze. */
export type DockLayoutDefinition = {
  slots: readonly DockSlotDefinition[];
};

/**
 * Dock context — D51 fields preserved; D52 additive extensions.
 * `layout` must reference DEFAULT_DOCK_LAYOUT (not a Provider-owned clone).
 */
export type DockContextValue = {
  state: DockState;
  registry: DockRegistryQuery;
  registration: DockRegistrationApi;
  visibility: DockVisibilityApi;
  layout: DockLayoutDefinition;
  features: typeof import("./dockFeatures").DOCK_FEATURES;
};
