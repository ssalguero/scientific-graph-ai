import { LayoutEngine } from "@/components/layout-engine";
import { getAppShell } from "@/lib/ui/theme";

import { WORKSPACE_TOKENS } from "./WorkspaceTokens";
import type { WorkspaceLayoutProps } from "./types";

/**
 * D47.2 — App shell owner. Sole `<main>` for the Workspace layout.
 * D54.3 — Sole consumer of LayoutEngine (wiring mínimo / decisión 1C).
 * Resolves the canonical LayoutTree here; does not propagate it to slots (D55).
 * Move-only chrome: existing props contract preserved; no React layout state/hooks/context.
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

  const shellClass = [WORKSPACE_TOKENS.shell, getAppShell(themeMode), className]
    .filter(Boolean)
    .join(" ");

  return (
    <main className={shellClass}>
      {sidebar}
      {workspace}
      {panels}
    </main>
  );
}
