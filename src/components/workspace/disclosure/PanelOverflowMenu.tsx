/**
 * UX-2.15 — Frozen overflow item shape (ContextActionItem-lite).
 * Non-interactive labels only this phase.
 */
export type PanelOverflowItem = {
  label: string;
  ariaLabel?: string;
  disabled?: boolean;
};

/**
 * UX-2.15 — Visual ⋯ affordance only. THIS IS NOT A MENU.
 * Never owns open/close state. No overlays, popups, dropdowns,
 * portals, focus management, click-outside, or keyboard menu logic.
 */
export type PanelOverflowMenuProps = {
  items: PanelOverflowItem[];
  disabled?: boolean;
  busy?: boolean;
};

/**
 * UX-2.15 — Renders muted ⋯ + optional static muted item labels.
 * Button does nothing.
 */
export function PanelOverflowMenu({
  items,
  disabled = false,
  busy = false,
}: PanelOverflowMenuProps) {
  const isDisabled = disabled || busy;

  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        className="inline-flex size-6 cursor-default items-center justify-center rounded text-[12px] leading-none text-[var(--app-text-muted)] opacity-80 transition-[opacity,background-color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]/30 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="More actions"
        disabled={isDisabled}
        aria-busy={busy || undefined}
      >
        ⋯
      </button>
      {items.length > 0 ? (
        <span className="flex max-w-[7rem] flex-wrap items-center gap-0.5">
          {items.map((item) => (
            <span
              key={item.label}
              className={`truncate text-[9px] text-[var(--app-text-muted)] opacity-70 ${
                item.disabled ? "line-through opacity-40" : ""
              }`}
              aria-label={item.ariaLabel ?? item.label}
            >
              {item.label}
            </span>
          ))}
        </span>
      ) : null}
    </div>
  );
}
