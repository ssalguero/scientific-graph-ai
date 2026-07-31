import type { ReactNode } from "react";

import { LAYOUT_TOKENS } from "./LayoutTokens";

/**
 * UX-2.26 — Horizontal compose primitive.
 * Compose-only. Tokens only. No hooks / Context / app imports.
 */
export type InlineProps = {
  gap?: keyof typeof LAYOUT_TOKENS.STACK_GAPS;
  align?: keyof typeof LAYOUT_TOKENS.align;
  justify?: keyof typeof LAYOUT_TOKENS.justify;
  wrap?: keyof typeof LAYOUT_TOKENS.wrap;
  children?: ReactNode;
  className?: string;
};

export function Inline({
  gap = "md",
  align = "none",
  justify = "none",
  wrap = "nowrap",
  children,
  className,
}: InlineProps) {
  const classNameJoined = [
    LAYOUT_TOKENS.direction.row,
    LAYOUT_TOKENS.STACK_GAPS[gap],
    LAYOUT_TOKENS.align[align],
    LAYOUT_TOKENS.justify[justify],
    LAYOUT_TOKENS.wrap[wrap],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classNameJoined}>{children}</div>;
}
