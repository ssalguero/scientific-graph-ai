import { TOOLBAR_TOKENS } from "./ToolbarTokens";
import { ToolbarSection } from "./ToolbarSection";
import type { AdaptiveToolbarProps } from "./types";

/**
 * D49.2 — Adaptive Toolbar shell. Presentational slots only.
 * Move-only infrastructure: no state, hooks, handlers, or domain logic.
 */
export function AdaptiveToolbar({
  left,
  center,
  right,
  className,
}: AdaptiveToolbarProps) {
  const rootClass = [TOOLBAR_TOKENS.root, className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      <ToolbarSection align="left">{left}</ToolbarSection>
      {center != null ? (
        <ToolbarSection align="center">{center}</ToolbarSection>
      ) : null}
      {right != null ? (
        <ToolbarSection align="right">{right}</ToolbarSection>
      ) : null}
    </div>
  );
}
