/**
 * UX-2.23 — Surface polish SSOT (compose-only).
 * Independent local map of Tailwind / --app-* literals aligned to
 * WORKSPACE_DENSITY_TOKENS (UX-2.25 spacing authority).
 * MUST NOT import or re-export UI_TOKENS, surfaces SURFACE_TOKENS,
 * CONTENT_TOKENS, LAYOUT_TOKENS, WORKSPACE_DENSITY_TOKENS, or any other *_TOKENS object.
 * Unidirectional parity: Density is authority; this file must match Density.
 */
export const SURFACE_TOKENS = {
  /** Alias of surfaces radius.default / UI radius.md. */
  panelRadius: "rounded-md",
  /** Alias of surfaces padding.md / layout regionPadding.md. */
  panelPadding: "p-2.5",
  /** Header chrome min-height — align with compact control row. */
  headerHeight: "min-h-8",
  /** Alias of surfaces gap.md / layout panelGap. */
  bodyGap: "gap-2",
  /** Alias of semantic FOOTER_HEIGHT — no footprint when empty. */
  footerHeight: "min-h-0",
  /**
   * Nested inside PanelSurface (owns panel fill) — transparent avoids
   * double-fill; Surface still owns the background slot.
   */
  surfaceBackground: "bg-transparent",
  /** Outer Panel / canvas chrome already borders — no inner box border. */
  surfaceBorder: "border-0",
  /** Outer Panel / canvas chrome already elevates — no nested shadow. */
  surfaceShadow: "shadow-none",
  /** Alias of surfaces divider.muted. */
  dividerOpacity: "opacity-60",
  /** Alias of surfaces padding.sm. */
  compactSpacing: "p-1.5",
  /**
   * Body inset — p-0 so PanelBody / contentInset keep density parity.
   * Rhythm comes from bodyGap + header/footer chrome.
   */
  normalSpacing: "p-0",
  /** Alias of surfaces padding.md. */
  comfortableSpacing: "p-2.5",
} as const;
