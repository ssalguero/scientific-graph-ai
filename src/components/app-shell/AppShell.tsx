import type { ReactNode } from "react";

import { AppShellLayout } from "./AppShellLayout";
import {
  APP_SHELL_REGION_ATTR,
  APP_SHELL_REGIONS,
} from "./AppShellRegions";

/**
 * UX-4.2 / UX-4.3 — Sole composition root for application chrome.
 *
 * Architectural principles (FROZEN):
 * - AppShell is the only composition root for application chrome.
 * - AppShell is layout-only. It owns no application state.
 * - Sidebar owns width; AppShell owns position.
 * - Scrolling ownership remains inside Sidebar; AppShell only bounds the region.
 *
 * Layout-only: no hooks, providers, stores, effects, or business logic.
 * Toolbar / Inspector / Status Bar default to placeholders.
 * AdaptiveToolbar migration is deferred to UX-4.4.
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
        "flex items-center justify-center border border-dashed border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2 text-xs text-[var(--app-text-muted)]",
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
    <main className={className}>
      <AppShellLayout
        toolbar={
          toolbar ?? (
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
            className="relative min-h-0 min-w-0 overflow-auto"
          >
            {workspace}
          </AppShellRegion>
        }
        inspector={
          inspector ?? (
            <AppShellRegionPlaceholder
              region={APP_SHELL_REGIONS.inspector}
              label="Inspector"
            />
          )
        }
        statusBar={
          statusBar ?? (
            <AppShellRegionPlaceholder
              region={APP_SHELL_REGIONS.statusBar}
              label="Status Bar"
            />
          )
        }
      />
    </main>
  );
}
