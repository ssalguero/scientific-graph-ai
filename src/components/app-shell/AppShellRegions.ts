/**
 * UX-4.2 — Canonical App Shell region IDs (LAYOUT.md five-region structure).
 * Layout-only constants — no runtime behavior.
 */

export const APP_SHELL_REGION_ATTR = "data-app-shell-region" as const;

export const APP_SHELL_REGIONS = {
  toolbar: "toolbar",
  sidebar: "sidebar",
  workspace: "workspace",
  inspector: "inspector",
  statusBar: "statusBar",
} as const;

export type AppShellRegionId =
  (typeof APP_SHELL_REGIONS)[keyof typeof APP_SHELL_REGIONS];

export const APP_SHELL_REGION_IDS: readonly AppShellRegionId[] = [
  APP_SHELL_REGIONS.toolbar,
  APP_SHELL_REGIONS.sidebar,
  APP_SHELL_REGIONS.workspace,
  APP_SHELL_REGIONS.inspector,
  APP_SHELL_REGIONS.statusBar,
] as const;
