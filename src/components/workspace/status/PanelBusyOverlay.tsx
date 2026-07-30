/**
 * UX-2.14 — Subtle busy overlay for long-running processes.
 * Presentational only; pointer-events-none.
 * Exported but not mounted in this phase.
 */
export function PanelBusyOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[var(--app-surface)]/40 transition-opacity duration-150"
      data-panel-busy-overlay
    >
      <span
        className="size-4 animate-spin rounded-full border-2 border-[var(--app-border)] border-t-[var(--app-accent)] opacity-80"
        data-panel-busy-spinner
      />
    </div>
  );
}
