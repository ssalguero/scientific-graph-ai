/**
 * D54.2 — Layout visibility (API Freeze D54 → D56).
 * Value + type surface for LayoutVisibility.
 */

export const LayoutVisibility = {
  VISIBLE: "VISIBLE",
  HIDDEN: "HIDDEN",
  COLLAPSED: "COLLAPSED",
} as const;

export type LayoutVisibility =
  (typeof LayoutVisibility)[keyof typeof LayoutVisibility];

export const LAYOUT_VISIBILITY_VALUES: readonly LayoutVisibility[] = [
  LayoutVisibility.VISIBLE,
  LayoutVisibility.HIDDEN,
  LayoutVisibility.COLLAPSED,
];

export function isLayoutVisibility(value: unknown): value is LayoutVisibility {
  return (
    typeof value === "string" &&
    (LAYOUT_VISIBILITY_VALUES as readonly string[]).includes(value)
  );
}
