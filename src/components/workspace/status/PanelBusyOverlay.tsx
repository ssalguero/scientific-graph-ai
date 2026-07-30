import { ICON_TOKENS } from "../iconography/ICON_TOKENS";
import { SURFACE_TOKENS } from "../surfaces/SurfaceTokens";

/**
 * UX-2.14 — Subtle busy overlay for long-running processes.
 * Presentational only; pointer-events-none.
 * Exported but not mounted in this phase.
 * UX-2.21 — Spinner size via ICON_TOKENS.
 */
export function PanelBusyOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[var(--app-surface)]/40 transition-opacity duration-150"
      data-panel-busy-overlay
    >
      <span
        className={`animate-spin rounded-full border-2 border-[var(--app-border)] border-t-[var(--app-accent)] ${ICON_TOKENS.sizeLg} ${SURFACE_TOKENS.mutedOpacity}`}
        data-panel-busy-spinner
      />
    </div>
  );
}
