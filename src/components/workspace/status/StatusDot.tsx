import type { PanelVisualState } from "./PanelVisualState";

/** UX-2.14 — Presentational status indicator. */
export type StatusDotProps = {
  state: PanelVisualState;
};

function toneClass(state: PanelVisualState): string {
  switch (state) {
    case "success":
      return "bg-[var(--app-success)]";
    case "warning":
      return "bg-[var(--app-warning)]";
    case "error":
      return "bg-[var(--app-danger)]";
    case "active":
    case "loading":
    case "busy":
      return "bg-[var(--app-accent)]";
    case "idle":
    case "empty":
    default:
      return "bg-[var(--app-text-muted)]";
  }
}

function statusLabel(state: PanelVisualState): string {
  return `Panel status: ${state}`;
}

/**
 * UX-2.14 — Small circle status indicator.
 * Tokens only; role=status for accessibility.
 */
export function StatusDot({ state }: StatusDotProps) {
  return (
    <span
      role="status"
      aria-label={statusLabel(state)}
      className={`inline-block size-1.5 shrink-0 rounded-full transition-[opacity,transform,background-color] duration-150 ${toneClass(state)}`}
    />
  );
}
