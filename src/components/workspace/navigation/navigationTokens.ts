/**
 * UX-2.24 — Navigation grammar SSOT (compose-only).
 * Independent local map of Tailwind / --app-* literals aligned to existing
 * workspace density (surfaces / layout / semantic vocabulary).
 * MUST NOT import or re-export UI_TOKENS, SURFACE_TOKENS, CONTENT_TOKENS,
 * LAYOUT_TOKENS, SEMANTIC_TOKENS, or any other *_TOKENS object.
 */
export const NAVIGATION_TOKENS = {
  /**
   * Navigation root — vertical stack (Breadcrumbs above PageTitle).
   * Includes display:flex so components never hardcode flex-col.
   */
  flexDirection: "flex flex-col",
  /** Compact header footprint — no forced chrome height. */
  height: "min-h-0",
  /**
   * Breadcrumbs root — horizontal trail.
   * Includes display:flex + row so components never hardcode flex-row.
   */
  alignItems: "flex flex-row items-center",
  /** Generic navigation gap (alias of compact surface gap). */
  gap: "gap-1",
  /** Gap between breadcrumb items / separators. */
  breadcrumbGap: "gap-1",
  /** Inline spacing around separator glyph. */
  separatorGap: "px-0.5",
  /** Gap between Breadcrumbs and PageTitle in the vertical stack. */
  titleGap: "gap-0.5",
  /** Shared type scale for crumbs / title (dense panel header). */
  fontSize: "text-xs",
  fontWeight: "font-medium",
  /** PageTitle color — heading token. */
  color: "text-[var(--app-heading)]",
  /** BreadcrumbItem muted color. */
  mutedColor: "text-[var(--app-text-muted)]",
  /** Separator glyph color. */
  separatorColor: "text-[var(--app-text-muted)]",
  separator: {
    glyph: "›",
  },
} as const;
