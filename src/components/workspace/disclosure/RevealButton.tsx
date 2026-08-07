import { DS_FOCUS_RING, DS_MOTION_ENTER } from "@/lib/ui/focus-ring";
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
 * UX-I5 — Certified focus ring + motion + typography.
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
      className={`inline-flex cursor-pointer items-center ${DS_MOTION_ENTER} hover:bg-[var(--color-surface-canvas)] hover:text-[var(--color-text-primary)] ${DS_FOCUS_RING} ${ACTION_TOKENS.gap} ${ACTION_TOKENS.padding} ${ACTION_TOKENS.radius} text-[length:var(--typography-caption-xs-font-size)] font-medium ${SURFACE_TOKENS.tone.default}`}
      aria-expanded={expanded}
      aria-controls={controlsId}
      aria-label={label}
      onClick={onToggle}
    >
      <span
        aria-hidden
        className="text-[length:var(--typography-caption-xs-font-size)]"
      >
        {expanded ? "▾" : "▸"}
      </span>
      <span>{label}</span>
    </button>
  );
}
