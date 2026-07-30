/**
 * UX-2.20 — Iconography SSOT (compose-only).
 * Owns icon sizes, class composition, color inheritance, decorative defaults.
 * Interaction affordances stay in ACTION_TOKENS (not this object).
 * MUST NOT redefine spacing or typography scales.
 */
export const ICON_TOKENS = {
  /** 12 px — micro / status (DESIGN_SYSTEM). */
  sizeSm: "size-3",
  /** 14 px — dense bars (DESIGN_SYSTEM). */
  sizeMd: "size-3.5",
  /** 16 px — primary actions (DESIGN_SYSTEM). */
  sizeLg: "size-4",

  /** Color inheritance — states via parent text-* utilities. */
  color: "text-current",

  /** Decorative root — shrink-safe flex box; no spacing scale. */
  root: "inline-flex shrink-0 items-center justify-center",

  /** Lucide SVG defaults — stroke inherits; no fill. */
  svg: "block shrink-0",
} as const;
