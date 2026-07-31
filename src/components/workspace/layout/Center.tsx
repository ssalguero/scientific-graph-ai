import type { ReactNode } from "react";

import { LAYOUT_TOKENS } from "./LayoutTokens";

/**
 * UX-2.26 — Center compose primitive (EmptyState / Loading / Placeholder).
 * Compose-only. Tokens only. No hooks / Context / app imports.
 */
export type CenterProps = {
  children?: ReactNode;
  className?: string;
};

export function Center({ children, className }: CenterProps) {
  const classNameJoined = [LAYOUT_TOKENS.center, className]
    .filter(Boolean)
    .join(" ");

  return <div className={classNameJoined}>{children}</div>;
}
