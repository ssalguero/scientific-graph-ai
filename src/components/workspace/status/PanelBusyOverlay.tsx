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
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[var(--color-surface-default)]/40 transition-opacity duration-[var(--motion-feedback-duration)] ease-[var(--motion-feedback-easing)] motion-reduce:transition-none"
      data-panel-busy-overlay
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <span
        className={`animate-spin rounded-full border-2 border-[var(--color-border-default)] border-t-[var(--color-brand-primary)] motion-reduce:animate-none ${ICON_TOKENS.sizeLg} ${SURFACE_TOKENS.mutedOpacity}`}
        data-panel-busy-spinner
        aria-hidden
      />
    </div>
  );
}
