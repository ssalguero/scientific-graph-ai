import { ACTION_TOKENS } from "../toolbar/ACTION_TOKENS";
import { SURFACE_TOKENS } from "../surfaces/SurfaceTokens";

/** UX-2.15 — Controlled expand/collapse trigger (presentational). */
export type RevealButtonProps = {
  expanded: boolean;
  onToggle: () => void;
  label: string;
  /** Optional id of the controlled region (aria-controls). */
  controlsId?: string;
};

/**
 * UX-2.15 — Controlled button only. No internal state.
 * UX-2.21 — Gap / padding / type via ACTION + SURFACE tokens.
 */
export function RevealButton({
  expanded,
  onToggle,
  label,
  controlsId,
}: RevealButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex cursor-pointer items-center transition-colors duration-150 hover:bg-[var(--color-surface-canvas)] hover:text-[var(--color-text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]/30 ${ACTION_TOKENS.gap} ${ACTION_TOKENS.padding} ${ACTION_TOKENS.radius} text-[10px] font-medium ${SURFACE_TOKENS.tone.default}`}
      aria-expanded={expanded}
      aria-controls={controlsId}
      aria-label={label}
      onClick={onToggle}
    >
      <span aria-hidden className="text-[10px]">
        {expanded ? "▾" : "▸"}
      </span>
      <span>{label}</span>
    </button>
  );
}
