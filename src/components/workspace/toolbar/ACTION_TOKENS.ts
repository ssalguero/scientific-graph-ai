/**
 * UX-2.19 — Toolbar / action visual SSOT (compose-only).
 * UX-2.20 — Value-only microinteraction enrichment; may compose ICON_TOKENS.
 * Aliases existing Tailwind / Design System --color-* utilities already used by
 * surface, layout, and semantic token packages.
 * MUST NOT redefine spacing or typography scales.
 * MUST NOT pull in surface/layout/semantic token objects.
 * MUST NOT duplicate those objects as a second design system.
 * Owns hover / pressed / disabled / transition (not ICON_TOKENS).
 */
import { DS_FOCUS_RING, DS_MOTION_FEEDBACK } from "@/lib/ui/focus-ring";

import { ICON_TOKENS } from "../iconography/ICON_TOKENS";

export const ACTION_TOKENS = {
  /** Alias of surface iconSlot size sm height / semantic STATUS_HEIGHT. */
  height: "min-h-4",
  /** Alias of layout toolbarGap / surface gap.md / semantic HEADER_GAP. */
  gap: "gap-[var(--spacing-tight)]",
  /** Composes ICON_TOKENS sizeLg (16 px) — UX-2.20 bridge. */
  iconSize: `${ICON_TOKENS.sizeLg} ${ICON_TOKENS.color}`,
  /** Alias of layout regionPadding.sm / surface padding.sm. */
  padding: "p-1.5",
  /** Alias of surface radius.default — Design System container radius. */
  radius: "rounded-[var(--radius-container)]",
  /** Static CSS hover affordance — no JS hover logic. */
  hoverOpacity: "hover:opacity-80",
  /** Alias of surface mutedOpacity / semantic LABEL_OPACITY. */
  disabledOpacity: "opacity-70",

  /**
   * ActionButton root — composes height, padding, radius, gap, typography.
   * UX-2.20 — tokenized transition + active/pressed + focus-visible readiness
   * + reduced-motion (CSS only; span remains non-focusable).
   * UX-I2 — Design System radius / type / motion / color.
   */
  button: `inline-flex min-h-4 items-center gap-[var(--spacing-tight)] rounded-[var(--radius-container)] p-1.5 text-[length:var(--typography-caption-xs-font-size)] font-medium text-[var(--color-text-muted)] ${DS_MOTION_FEEDBACK} active:opacity-70 ${DS_FOCUS_RING}`,
  /** ActionGroup root — composes gap. */
  group: "inline-flex flex-row flex-wrap items-center gap-[var(--spacing-tight)]",
  /** PanelToolbar root — composes height + gap. */
  toolbar: "flex min-h-4 w-full flex-row flex-wrap items-center gap-[var(--spacing-tight)]",
  /** ToolbarSpacer — flexible separator. */
  spacer: "min-w-0 flex-1",
  /** IconSlot root — composes ICON_TOKENS size (UX-2.20 bridge). */
  iconSlot: `inline-flex ${ICON_TOKENS.sizeLg} shrink-0 items-center justify-center ${ICON_TOKENS.color}`,

  /** Visual appearance classes (CSS only; no state machine). */
  appearances: {
    default: "",
    muted: "opacity-70 text-[var(--color-text-muted)]",
    active: "text-[var(--color-text-primary)]",
    disabled: "opacity-70 pointer-events-none",
  },
} as const;
