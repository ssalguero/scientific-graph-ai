/**
 * D54.2 — Layout regions (API Freeze D54 → D56).
 * Value + type surface for LayoutRegion.
 */

export const LayoutRegion = {
  LEFT: "LEFT",
  RIGHT: "RIGHT",
  TOP: "TOP",
  BOTTOM: "BOTTOM",
  CENTER: "CENTER",
  FLOATING: "FLOATING",
} as const;

export type LayoutRegion = (typeof LayoutRegion)[keyof typeof LayoutRegion];

export const LAYOUT_REGION_VALUES: readonly LayoutRegion[] = [
  LayoutRegion.LEFT,
  LayoutRegion.RIGHT,
  LayoutRegion.TOP,
  LayoutRegion.BOTTOM,
  LayoutRegion.CENTER,
  LayoutRegion.FLOATING,
];

export function isLayoutRegion(value: unknown): value is LayoutRegion {
  return (
    typeof value === "string" &&
    (LAYOUT_REGION_VALUES as readonly string[]).includes(value)
  );
}
