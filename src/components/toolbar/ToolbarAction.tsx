import { TOOLBAR_TOKENS } from "./ToolbarTokens";
import type { ToolbarActionProps } from "./types";

/**
 * D49.2 — Presentational action infrastructure (not used in D49.3 wiring).
 * Move-only infrastructure: no state, hooks, or owned handlers.
 */
export function ToolbarAction({
  children,
  disabled,
  active,
}: ToolbarActionProps) {
  const className = [
    TOOLBAR_TOKENS.action,
    active ? TOOLBAR_TOKENS.actionActive : null,
    disabled ? TOOLBAR_TOKENS.actionDisabled : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={className}
      aria-disabled={disabled || undefined}
      data-active={active ? "true" : undefined}
    >
      {children}
    </div>
  );
}
