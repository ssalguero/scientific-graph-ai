/** UX-2.6 — Presentational empty state (muted text only). */
export type PanelEmptyStateProps = {
  message: string;
};

/**
 * UX-2.6 — Legal section child this phase.
 * Future phases may replace with widgets under PanelContentSection.
 */
export function PanelEmptyState({ message }: PanelEmptyStateProps) {
  return (
    <p className="text-xs text-[var(--app-text-muted)]">{message}</p>
  );
}
