/**
 * D47.2 — Frozen layout class strings (move-only copy from page.tsx shell).
 * D48.2 — Values sourced from UI_TOKENS.workspace (API shape unchanged).
 */
import { UI_TOKENS } from "@/lib/ui/tokens";

export const WORKSPACE_TOKENS = {
  shell: UI_TOKENS.workspace.shell,
  mainColumn: UI_TOKENS.workspace.mainColumn,
  inner: UI_TOKENS.workspace.inner,
} as const;
