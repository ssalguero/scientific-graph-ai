import { TOOLBAR_TOKENS } from "./ToolbarTokens";
import type { ToolbarGroupProps } from "./types";

/**
 * D49.2 — Presentational group infrastructure (not used in D49.3 wiring).
 * Move-only infrastructure: no state, hooks, or domain logic.
 */
export function ToolbarGroup({ children, compact }: ToolbarGroupProps) {
  return (
    <div
      className={
        compact ? TOOLBAR_TOKENS.groupCompact : TOOLBAR_TOKENS.group
      }
    >
      {children}
    </div>
  );
}
