import type { ReactNode } from "react";

import { LAYOUT_TOKENS } from "./LayoutTokens";

/**
 * UX-2.26 — Vertical compose primitive.
 * Compose-only. Tokens only. No hooks / Context / app imports.
 */
export type StackProps = {
  gap?: keyof typeof LAYOUT_TOKENS.STACK_GAPS;
  align?: keyof typeof LAYOUT_TOKENS.align;
  justify?: keyof typeof LAYOUT_TOKENS.justify;
  children?: ReactNode;
  className?: string;
};

export function Stack({
  gap = "md",
  align = "none",
  justify = "none",
  children,
  className,
}: StackProps) {
  const classNameJoined = [
    LAYOUT_TOKENS.direction.column,
    LAYOUT_TOKENS.STACK_GAPS[gap],
    LAYOUT_TOKENS.align[align],
    LAYOUT_TOKENS.justify[justify],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classNameJoined}>{children}</div>;
}
