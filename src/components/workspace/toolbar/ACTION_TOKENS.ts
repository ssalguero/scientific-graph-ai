/**
 * UX-2.19 — Toolbar / action visual SSOT (compose-only).
 * UX-2.20 — Value-only microinteraction enrichment; may compose ICON_TOKENS.
 * Aliases existing Tailwind / --app-* utilities already used by
 * surface, layout, and semantic token packages.
 * MUST NOT redefine spacing or typography scales.
 * MUST NOT pull in surface/layout/semantic token objects.
 * MUST NOT duplicate those objects as a second design system.
 * Owns hover / pressed / disabled / transition (not ICON_TOKENS).
 */
import { ICON_TOKENS } from "../iconography/ICON_TOKENS";

export const ACTION_TOKENS = {
  /** Alias of surface iconSlot size sm height / semantic STATUS_HEIGHT. */
  height: "min-h-4",
  /** Alias of layout toolbarGap / surface gap.md / semantic HEADER_GAP. */
  gap: "gap-2",
  /** Composes ICON_TOKENS sizeLg (16 px) — UX-2.20 bridge. */
  iconSize: `${ICON_TOKENS.sizeLg} ${ICON_TOKENS.color}`,
  /** Alias of layout regionPadding.sm / surface padding.sm. */
  padding: "p-1.5",
  /** Alias of surface radius.default. */
  radius: "rounded-md",
  /** Static CSS hover affordance — no JS hover logic. */
  hoverOpacity: "hover:opacity-80",
  /** Alias of surface mutedOpacity / semantic LABEL_OPACITY. */
  disabledOpacity: "opacity-70",

  /**
   * ActionButton root — composes height, padding, radius, gap, typography.
   * UX-2.20 — tokenized transition + active/pressed + focus-visible readiness
   * + reduced-motion (CSS only; span remains non-focusable).
   */
  button:
    "inline-flex min-h-4 items-center gap-2 rounded-md p-1.5 text-[10px] font-medium text-[var(--app-text-muted)] transition-[color,background-color,border-color,opacity] duration-100 motion-reduce:transition-none active:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]/30",
  /** ActionGroup root — composes gap. */
  group: "inline-flex flex-row flex-wrap items-center gap-2",
  /** PanelToolbar root — composes height + gap. */
  toolbar: "flex min-h-4 w-full flex-row flex-wrap items-center gap-2",
  /** ToolbarSpacer — flexible separator. */
  spacer: "min-w-0 flex-1",
  /** IconSlot root — composes ICON_TOKENS size (UX-2.20 bridge). */
  iconSlot: `inline-flex ${ICON_TOKENS.sizeLg} shrink-0 items-center justify-center ${ICON_TOKENS.color}`,

  /** Visual appearance classes (CSS only; no state machine). */
  appearances: {
    default: "",
    muted: "opacity-70 text-[var(--app-text-muted)]",
    active: "text-[var(--app-heading)]",
    disabled: "opacity-70 pointer-events-none",
  },
} as const;
