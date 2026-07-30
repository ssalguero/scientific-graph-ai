import { SURFACE_TOKENS } from "../../surfaces/SurfaceTokens";

/** UX-2.6 — Presentational empty state (muted text only). */
export type PanelEmptyStateProps = {
  message: string;
};

/**
 * UX-2.6 — Legal section child this phase.
 * Future phases may replace with widgets under PanelContentSection.
 * UX-2.21 — Muted text via SURFACE_TOKENS.tone.
 */
export function PanelEmptyState({ message }: PanelEmptyStateProps) {
  return <p className={`text-xs ${SURFACE_TOKENS.tone.default}`}>{message}</p>;
}
