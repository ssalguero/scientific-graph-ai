/**
 * UX-2.18b — Semantic identity SSOT (compose-only).
 * Aliases existing Tailwind / Design System --color-* utilities already used by surfaces/layout.
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
  MUTED_TEXT: "text-[var(--color-text-muted)]",
  /** Alias of surface iconSlot size sm. */
  ICON_SIZE: "h-4 w-4 text-[10px]",
  /** Header row layout — UX-2.26 flex owned by Inline; retained for docs/parity. */
  headerRow: "",
  /** Header title column — UX-2.26 flex owned by Stack; retained for docs/parity. */
  headerTitleCol: "",
  /** Header trailing slot alignment. */
  headerTrailing: "ml-auto text-[var(--color-text-muted)]",
  /** Status row chrome — height + type (flex via Inline in SemanticStatus). */
  statusRow:
    "min-h-4 text-[10px] font-medium text-[var(--color-text-muted)]",
  /** Section micro-label — aliases surface metadata typography + LABEL_OPACITY. */
  label:
    "text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)] opacity-70",
  /** Neutral info container — aliases border + INFO_PADDING. */
  infoRoot:
    "border border-[var(--color-border-default)] p-1.5 text-[10px] text-[var(--color-text-muted)]",
  /** Footer shell chrome — height + type (flex via Inline in SemanticFooter). */
  footerRoot: "min-h-0 text-[10px] text-[var(--color-text-muted)]",
} as const;
