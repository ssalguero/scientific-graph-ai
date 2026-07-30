import { ACTION_TOKENS } from "../toolbar/ACTION_TOKENS";
import { SURFACE_TOKENS } from "../surfaces/SurfaceTokens";

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
 * UX-2.21 — Icon size / gap / type via ACTION + SURFACE tokens.
 */
export function PanelOverflowMenu({
  items,
  disabled = false,
  busy = false,
}: PanelOverflowMenuProps) {
  const isDisabled = disabled || busy;

  return (
    <div
      className={`flex shrink-0 items-center ${SURFACE_TOKENS.gap.sm}`}
    >
      <button
        type="button"
        className={`inline-flex cursor-default items-center justify-center leading-none transition-[opacity,background-color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]/30 disabled:cursor-not-allowed disabled:opacity-40 ${ACTION_TOKENS.iconSlot} ${ACTION_TOKENS.radius} ${SURFACE_TOKENS.mutedOpacity}`}
        aria-label="More actions"
        disabled={isDisabled}
        aria-busy={busy || undefined}
      >
        ⋯
      </button>
      {items.length > 0 ? (
        <span
          className={`flex max-w-[7rem] flex-wrap items-center ${SURFACE_TOKENS.gap.sm}`}
        >
          {items.map((item) => (
            <span
              key={item.label}
              className={`truncate ${SURFACE_TOKENS.metadata.root} ${SURFACE_TOKENS.mutedOpacity} ${
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
