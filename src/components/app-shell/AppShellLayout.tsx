import type { ReactNode } from "react";

/**
 * UX-4.2 — Five-region layout grid (LAYOUT.md).
 * Layout-only: no hooks, providers, stores, effects, or business logic.
 */
export type AppShellLayoutProps = {
  toolbar: ReactNode;
  sidebar: ReactNode;
  workspace: ReactNode;
  inspector: ReactNode;
  statusBar: ReactNode;
  className?: string;
};

export function AppShellLayout({
  toolbar,
  sidebar,
  workspace,
  inspector,
  statusBar,
  className,
}: AppShellLayoutProps) {
  const rootClass = [
    "grid min-h-screen w-full",
    "grid-cols-[minmax(240px,auto)_minmax(0,1fr)_minmax(280px,auto)]",
    "grid-rows-[auto_minmax(0,1fr)_auto]",
    "[grid-template-areas:'toolbar_toolbar_toolbar'_'sidebar_workspace_inspector'_'statusBar_statusBar_statusBar']",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass}>
      {toolbar}
      {sidebar}
      {workspace}
      {inspector}
      {statusBar}
    </div>
  );
}
