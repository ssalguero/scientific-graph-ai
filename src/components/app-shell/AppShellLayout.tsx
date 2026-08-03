import type { ReactNode } from "react";

/**
 * UX-4.2 / UX-4.3 — Five-region layout grid (LAYOUT.md).
 * Layout-only: no hooks, providers, stores, effects, or business logic.
 *
 * UX-4.3 width ownership (FROZEN):
 * The AppShell Sidebar Region must never impose a minimum width
 * larger than the Sidebar component itself.
 * Sidebar owns width → AppShell owns position.
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
    // Sidebar column: auto (follows Sidebar width). Never minmax(240px, …).
    "grid-cols-[auto_minmax(0,1fr)_minmax(280px,auto)]",
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
