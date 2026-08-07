/**
 * UX-I5 — Shared Design System focus + motion polish (app-owned consumers).
 * Visual authority remains src/ui Theme Runtime CSS variables.
 * No new tokens · no Design System redesign.
 */

/** Certified focus-visible ring. */
export const DS_FOCUS_RING = [
  "focus-visible:outline-none",
  "focus-visible:ring-[length:var(--focus-ring-width)]",
  "focus-visible:ring-[var(--focus-ring-color)]",
  "focus-visible:ring-offset-[length:var(--focus-ring-offset)]",
  "focus-visible:ring-offset-[var(--color-surface-default)]",
].join(" ");

/** Micro-interaction motion (colors / opacity / shadow). */
export const DS_MOTION_FEEDBACK =
  "transition-[color,background-color,border-color,box-shadow,opacity] duration-[var(--motion-feedback-duration)] ease-[var(--motion-feedback-easing)] motion-reduce:transition-none";

/** Enter / surface motion. */
export const DS_MOTION_ENTER =
  "transition-colors duration-[var(--motion-enter-duration)] ease-[var(--motion-enter-easing)] motion-reduce:transition-none";
