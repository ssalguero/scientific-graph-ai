/**
 * UX-I4 / UX-I5 — Interaction & Window Experience · presentation SSOT.
 *
 * Consumes certified Design System CSS variables only.
 * Never invents tokens, never changes interaction behavior / registries / bridges.
 */
import { UI_TOKENS } from "@/lib/ui/tokens";
import {
  DS_FOCUS_RING,
  DS_MOTION_ENTER,
  DS_MOTION_FEEDBACK,
} from "@/lib/ui/focus-ring";

/** Certified focus-visible ring — Design System focus tokens. */
export const INTERACTION_FOCUS_RING = DS_FOCUS_RING;

/** Motion — colors / opacity / shadow only (Animation Freeze) + reduced-motion. */
export const INTERACTION_MOTION = {
  enter: DS_MOTION_ENTER,
  feedback: DS_MOTION_FEEDBACK,
} as const;

/** Elevation roles for window hierarchy. */
export const INTERACTION_ELEVATION = {
  inactive: "shadow-[var(--elevation-card)]",
  hover: "shadow-[var(--elevation-popover)]",
  selected: "shadow-[var(--elevation-popover)]",
  focused: "shadow-[var(--elevation-popover)]",
  active: "shadow-[var(--elevation-floating)]",
  dialog: "shadow-[var(--elevation-dialog)]",
} as const;

/** Shared selection / hover / active surface recipes. */
export const INTERACTION_STATE = {
  selectedSurface:
    "bg-[var(--color-brand-primary)]/10 text-[var(--color-text-primary)]",
  selectedRing: "ring-1 ring-inset ring-[var(--color-brand-primary)]/25",
  hoverSurface:
    "hover:bg-[var(--color-surface-canvas)] hover:text-[var(--color-text-primary)]",
  activeAccent: "bg-[var(--color-brand-primary)]/10",
  focusedAccent: "bg-[var(--color-brand-primary)]/5",
  inactiveSurface: "bg-[var(--color-surface-canvas)]",
  defaultSurface: "bg-[var(--color-surface-default)]",
} as const;

/** Indicator / badge shell — unified rhythm across window domains. */
export const INTERACTION_INDICATOR_SHELL = [
  "inline-flex shrink-0 items-center h-4",
  UI_TOKENS.spacing.px1,
  "text-[length:var(--typography-caption-xs-font-size)] font-semibold uppercase tracking-wide leading-none",
  "rounded-[var(--radius-container)]",
  INTERACTION_ELEVATION.inactive,
  INTERACTION_MOTION.enter,
].join(" ");

export const INTERACTION_INDICATOR_STATUS_SHELL = [
  "inline-flex shrink-0 items-center h-4",
  UI_TOKENS.spacing.px1,
  "text-[length:var(--typography-caption-xs-font-size)] font-medium tracking-wide leading-none",
  "rounded-[var(--radius-container)]",
  INTERACTION_ELEVATION.inactive,
  INTERACTION_MOTION.enter,
].join(" ");
