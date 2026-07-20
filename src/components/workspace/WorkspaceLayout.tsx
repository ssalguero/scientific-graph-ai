import { getAppShell } from "@/lib/ui/theme";

import { WORKSPACE_TOKENS } from "./WorkspaceTokens";
import type { WorkspaceLayoutProps } from "./types";

/**
 * D47.2 — App shell owner. Sole `<main>` for the Workspace layout.
 * Move-only infrastructure: no state, hooks, or domain logic.
 */
export function WorkspaceLayout({
  themeMode = "light",
  sidebar,
  workspace,
  panels,
  className,
}: WorkspaceLayoutProps) {
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
