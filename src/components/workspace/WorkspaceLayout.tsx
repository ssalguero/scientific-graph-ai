import { AppShell } from "@/components/app-shell";
import { LayoutEngine } from "@/components/layout-engine";
import { getAppShell } from "@/lib/ui/theme";

import type { WorkspaceLayoutProps } from "./types";

/**
 * UX-4.2 / UX-4.3 — Transitional bridge to AppShell.
 * WorkspaceLayout acts as a transitional bridge (NOT a composition root).
 * AppShell is the only composition root for application chrome.
 *
 * UX-4.3 — Single Sidebar instance passes through as the sidebar slot;
 * width and scroll ownership remain inside Sidebar; AppShell owns position.
 *
 * D47.2 — Existing props contract preserved (themeMode, sidebar, workspace, panels).
 * D54.3 — Sole consumer of LayoutEngine (wiring mínimo / decisión 1C).
 * Resolves the canonical LayoutTree here; does not propagate it to slots (D55).
 * Move-only chrome: no React layout state/hooks/context.
 */
export function WorkspaceLayout({
  themeMode = "light",
  sidebar,
  workspace,
  panels,
  className,
}: WorkspaceLayoutProps) {
  const layoutTree = LayoutEngine.resolveFromProps();
  const root = LayoutEngine.getNode(layoutTree, layoutTree.rootId);
  if (!root) {
    throw new Error(
      "WorkspaceLayout: LayoutEngine resolved tree is missing root"
    );
  }

  const shellClass = [getAppShell(themeMode), className].filter(Boolean).join(" ");

  return (
    <AppShell
      className={shellClass}
      sidebar={sidebar}
      workspace={
        <>
          {workspace}
          {panels}
        </>
      }
    />
  );
}
