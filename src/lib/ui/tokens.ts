/**
 * D45 UI design tokens — Tailwind class fragments already used in the app.
 * No new visual values; extraction baseline for D45.3+.
 */

export const spacing = {
  px1: "px-1",
  px15: "px-1.5",
  px2: "px-2",
  px25: "px-2.5",
  px3: "px-3",
  px4: "px-4",
  py05: "py-0.5",
  py1: "py-1",
  py15: "py-1.5",
  py2: "py-2",
  py25: "py-2.5",
  p2: "p-2",
  p3: "p-3",
  gap2: "gap-2",
  spaceY05: "space-y-0.5",
  spaceY15: "space-y-1.5",
  spaceY2: "space-y-2",
  my15: "my-1.5",
  mb1: "mb-1",
  mb15: "mb-1.5",
  mt05: "mt-0.5",
  mt1: "mt-1",
} as const;

export const radius = {
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
} as const;

export const shadows = {
  sm: "shadow-sm",
  md: "shadow-md",
  hoverMd: "hover:shadow-md",
  hoverSm: "hover:shadow-sm",
  hover: "hover:shadow",
} as const;

export const transitions = {
  colors200: "transition-colors duration-200",
  colors300: "transition-colors duration-300",
  all200: "transition-all duration-200",
  transform200: "transition-transform duration-200",
  colors: "transition-colors",
} as const;

export const animation = {
  activeScale: "active:scale-[0.98]",
  duration200: "duration-200",
  duration300: "duration-300",
  gridCollapseOpen: "grid-rows-[1fr] opacity-100",
  gridCollapseClosed: "grid-rows-[0fr] opacity-0",
} as const;

export const zIndex = {
  base: "z-0",
  raised: "z-10",
  dropdown: "z-20",
  sticky: "z-30",
  modal: "z-40",
  toast: "z-50",
} as const;

export const elevation = {
  flat: "shadow-none",
  low: "shadow-sm",
  medium: "shadow-md",
  interactive: "shadow-sm hover:shadow-md",
} as const;

export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radius;
export type ShadowToken = keyof typeof shadows;
export type TransitionToken = keyof typeof transitions;
export type AnimationToken = keyof typeof animation;
export type ZIndexToken = keyof typeof zIndex;
export type ElevationToken = keyof typeof elevation;
