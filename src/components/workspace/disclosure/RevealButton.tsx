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
      className="inline-flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-[var(--app-text-muted)] transition-colors duration-150 hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-heading)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]/30"
      aria-expanded={expanded}
      aria-controls={controlsId}
      aria-label={label}
      onClick={onToggle}
    >
      <span aria-hidden className="text-[9px]">
        {expanded ? "▾" : "▸"}
      </span>
      <span>{label}</span>
    </button>
  );
}
