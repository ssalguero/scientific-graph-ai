import type { ReactNode } from "react";

import { StatusBar } from "@/components/status-bar";

import { AppShellLayout } from "./AppShellLayout";
import {
  APP_SHELL_REGION_ATTR,
  APP_SHELL_REGIONS,
} from "./AppShellRegions";

/**
 * UX-4.2 / UX-4.3 / UX-4.4 / UX-4.5 / UX-4.6 / UX-4.7 / UX-4.8 / UX-4.9 — Sole
 * composition root for application chrome.
 *
 * Architectural principles (FROZEN):
 * - AppShell is the only composition root for application chrome.
 * - AppShell is layout-only. It owns no application state.
 * - Sidebar owns width; AppShell owns position (grid track only).
 * - Scrolling ownership remains inside Sidebar; AppShell only bounds the region.
 * - Toolbar owns functionality; AppShell owns Toolbar Region position.
 * - AppShell renders the received toolbar slot — it does not create AdaptiveToolbar.
 * - UX-4.5 — Workspace owns functionality + scroll; AppShell owns Workspace Region
 *   position, bounds (overflow-hidden), and overlay containing block (relative).
 * - AppShell renders the received workspace slot — it does not create Workspace.
 * - UX-4.6 — Inspector owns width and visibility; AppShell owns Inspector Region
 *   bounds and position (grid track only). AppShell renders the received
 *   inspector slot — it does not create Inspector.
 * - UX-4.7 — StatusBar is the permanent default chrome of the AppShell.
 *   Placeholder mode ends in UX-4.7. AppShell owns Status Region position;
 *   StatusBar owns visual structure and layout.
 * - UX-4.8 — Normalize, don't invent. Tailwind responsive variants only.
 *   No second responsive system. Docking reused unchanged (not owned here).
 * - UX-4.9 / UX-I0 — Chrome consumes Theme Runtime CSS vars (--color-*).
 *   Legacy `--app-*` product surfaces resolve via ThemeRuntimeHost bridge.
 *
 * Layout-only: no hooks, providers, stores, effects, or business logic.
 */

export type AppShellProps = {
  toolbar?: ReactNode;
  sidebar: ReactNode;
  workspace: ReactNode;
  inspector?: ReactNode;
  statusBar?: ReactNode;
  className?: string;
};

const REGION_AREA: Record<string, string> = {
  [APP_SHELL_REGIONS.toolbar]: "[grid-area:toolbar]",
  [APP_SHELL_REGIONS.sidebar]: "[grid-area:sidebar]",
  [APP_SHELL_REGIONS.workspace]: "[grid-area:workspace]",
  [APP_SHELL_REGIONS.inspector]: "[grid-area:inspector]",
  [APP_SHELL_REGIONS.statusBar]: "[grid-area:statusBar]",
};

function AppShellRegionPlaceholder({
  region,
  label,
}: {
  region: string;
  label: string;
}) {
  return (
    <div
      {...{ [APP_SHELL_REGION_ATTR]: region }}
      className={[
        REGION_AREA[region],
        "flex items-center justify-center border border-dashed border-[var(--color-border-default)] bg-[var(--color-surface-canvas)] px-3 py-2 text-xs text-[var(--color-text-muted)]",
      ].join(" ")}
      aria-hidden="true"
    >
      {label}
    </div>
  );
}

function AppShellRegion({
  region,
  className,
  children,
}: {
  region: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      {...{ [APP_SHELL_REGION_ATTR]: region }}
      className={[REGION_AREA[region], className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}

export function AppShell({
  toolbar,
  sidebar,
  workspace,
  inspector,
  statusBar,
  className,
}: AppShellProps) {
  return (
    <main className={["min-h-screen bg-[var(--color-surface-canvas)] text-[var(--color-text-primary)]", className].filter(Boolean).join(" ")}>
      <AppShellLayout
        toolbar={
          toolbar != null ? (
            <AppShellRegion
              region={APP_SHELL_REGIONS.toolbar}
              className="min-w-0"
            >
              {toolbar}
            </AppShellRegion>
          ) : (
            <AppShellRegionPlaceholder
              region={APP_SHELL_REGIONS.toolbar}
              label="Toolbar"
            />
          )
        }
        sidebar={
          <AppShellRegion
            region={APP_SHELL_REGIONS.sidebar}
            className="flex h-full min-h-0 flex-col overflow-hidden"
          >
            {sidebar}
          </AppShellRegion>
        }
        workspace={
          <AppShellRegion
            region={APP_SHELL_REGIONS.workspace}
            className="relative h-full min-h-0 min-w-0 overflow-hidden"
          >
            {workspace}
          </AppShellRegion>
        }
        inspector={
          inspector != null ? (
            <AppShellRegion
              region={APP_SHELL_REGIONS.inspector}
              className="h-full min-h-0 overflow-hidden"
            >
              {inspector}
            </AppShellRegion>
          ) : (
            <AppShellRegionPlaceholder
              region={APP_SHELL_REGIONS.inspector}
              label="Inspector"
            />
          )
        }
        statusBar={
          <AppShellRegion
            region={APP_SHELL_REGIONS.statusBar}
            className="min-w-0"
          >
            {statusBar ?? <StatusBar />}
          </AppShellRegion>
        }
      />
    </main>
  );
}
