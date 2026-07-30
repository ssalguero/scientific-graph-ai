/**
 * UX-2.19 — Toolbar / action visual SSOT (compose-only).
 * Aliases existing Tailwind / --app-* utilities already used by
 * surface, layout, and semantic token packages.
 * MUST NOT redefine spacing or typography scales.
 * MUST NOT pull in surface/layout/semantic token objects.
 * MUST NOT duplicate those objects as a second design system.
 */
export const ACTION_TOKENS = {
  /** Alias of surface iconSlot size sm height / semantic STATUS_HEIGHT. */
  height: "min-h-4",
  /** Alias of layout toolbarGap / surface gap.md / semantic HEADER_GAP. */
  gap: "gap-2",
  /** Alias of surface iconSlot size sm / semantic ICON_SIZE. */
  iconSize: "h-4 w-4 text-[10px]",
  /** Alias of layout regionPadding.sm / surface padding.sm. */
  padding: "p-1.5",
  /** Alias of surface radius.default. */
  radius: "rounded-md",
  /** Static CSS hover affordance — no JS hover logic. */
  hoverOpacity: "hover:opacity-80",
  /** Alias of surface mutedOpacity / semantic LABEL_OPACITY. */
  disabledOpacity: "opacity-70",

  /** ActionButton root — composes height, padding, radius, gap, typography. */
  button:
    "inline-flex min-h-4 items-center gap-2 rounded-md p-1.5 text-[10px] font-medium text-[var(--app-text-muted)]",
  /** ActionGroup root — composes gap. */
  group: "inline-flex flex-row flex-wrap items-center gap-2",
  /** PanelToolbar root — composes height + gap. */
  toolbar: "flex min-h-4 w-full flex-row flex-wrap items-center gap-2",
  /** ToolbarSpacer — flexible separator. */
  spacer: "min-w-0 flex-1",
  /** IconSlot root — aliases surface iconSlot base + size sm. */
  iconSlot:
    "inline-flex h-4 w-4 shrink-0 items-center justify-center text-[10px]",

  /** Visual appearance classes (CSS only; no state machine). */
  appearances: {
    default: "",
    muted: "opacity-70 text-[var(--app-text-muted)]",
    active: "text-[var(--app-heading)]",
    disabled: "opacity-70",
  },
} as const;
