import type { ReactNode } from "react";

/**
 * UX-4.2 / UX-4.3 / UX-4.8 — Five-region layout grid (LAYOUT.md + RESPONSIVE.md).
 * Layout-only: no hooks, providers, stores, effects, or business logic.
 *
 * UX-4.3 width ownership (FROZEN):
 * The AppShell Sidebar Region must never impose a minimum width
 * larger than the Sidebar component itself.
 * Sidebar owns width → AppShell owns position (grid track only).
 *
 * UX-4.8 responsive ownership (FROZEN):
 * Normalize, don't invent — Tailwind responsive variants only.
 * Inspector Region owns only the grid track. Inspector owns width and visibility.
 * Below lg: inspector track collapses (workspace priority). At lg+: content-driven auto.
 * No minmax(280px,…) floor on the inspector track.
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
    // Sidebar track: auto (follows Sidebar width). Never minmax(240px, …).
    // Workspace track: minmax(0,1fr) — workspace priority.
    // Inspector track: content-driven auto at lg+; collapsed below lg (RESPONSIVE.md).
    // Never minmax(280px,…) on the inspector track.
    "grid-cols-[auto_minmax(0,1fr)_0fr] lg:grid-cols-[auto_minmax(0,1fr)_auto]",
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
