/**
 * UX-2.18b — Semantic identity SSOT (compose-only).
 * Aliases existing Tailwind / --app-* utilities already used by surfaces/layout.
 * MUST NOT redefine spacing or typography scales.
 * MUST NOT duplicate SURFACE_TOKENS or LAYOUT_TOKENS as a second design system.
 */
export const SEMANTIC_TOKENS = {
  /** Alias of layout headerGap / surface gap.md. */
  HEADER_GAP: "gap-2",
  /** Alias of layout contentGap / surface gap.md. */
  SECTION_GAP: "gap-2",
  /** Alias of surface iconSlot size sm height. */
  STATUS_HEIGHT: "min-h-4",
  /** Alias of layout regionPadding.sm / surface padding.sm. */
  INFO_PADDING: "p-1.5",
  /** Alias of layout emptyMinHeight — no visual footprint when empty. */
  FOOTER_HEIGHT: "min-h-0",
  /** Alias of surface mutedOpacity. */
  LABEL_OPACITY: "opacity-70",
  /** Alias of surface metadata muted text color. */
  MUTED_TEXT: "text-[var(--app-text-muted)]",
  /** Alias of surface iconSlot size sm. */
  ICON_SIZE: "h-4 w-4 text-[10px]",
  /** Header row layout — composes HEADER_GAP + existing flex utilities. */
  headerRow: "flex items-center gap-2",
  /** Header title column — composes HEADER_GAP. */
  headerTitleCol: "flex flex-col gap-2",
  /** Header trailing slot alignment. */
  headerTrailing: "ml-auto text-[var(--app-text-muted)]",
  /** Status row layout — composes STATUS_HEIGHT + muted text. */
  statusRow:
    "flex min-h-4 items-center text-[10px] font-medium text-[var(--app-text-muted)]",
  /** Section micro-label — aliases surface metadata typography + LABEL_OPACITY. */
  label:
    "text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--app-text-muted)] opacity-70",
  /** Neutral info container — aliases border + INFO_PADDING. */
  infoRoot:
    "border border-[var(--app-border)] p-1.5 text-[10px] text-[var(--app-text-muted)]",
  /** Footer shell — aliases FOOTER_HEIGHT + muted text. */
  footerRoot:
    "flex min-h-0 items-center gap-2 text-[10px] text-[var(--app-text-muted)]",
} as const;
