import type { ToolbarOverflowProps } from "./types";

/**
 * D49.2 — Overflow scaffold (passthrough only).
 * No responsive behavior, media queries, observers, or logic.
 */
export function ToolbarOverflow({ children }: ToolbarOverflowProps) {
  return children;
}
