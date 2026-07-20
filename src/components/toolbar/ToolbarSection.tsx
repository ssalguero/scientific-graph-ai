import { TOOLBAR_TOKENS } from "./ToolbarTokens";
import type { ToolbarSectionProps } from "./types";

const SECTION_TOKENS = {
  left: TOOLBAR_TOKENS.sectionLeft,
  center: TOOLBAR_TOKENS.sectionCenter,
  right: TOOLBAR_TOKENS.sectionRight,
} as const;

/**
 * D49.2 — Presentational zone wrapper (left | center | right).
 * Move-only infrastructure: no state, hooks, or domain logic.
 */
export function ToolbarSection({ children, align }: ToolbarSectionProps) {
  return <div className={SECTION_TOKENS[align]}>{children}</div>;
}
