import type { ReactNode } from "react";

import { NAVIGATION_TOKENS } from "./navigationTokens";

/**
 * UX-2.24 — Vertical navigation stack (Breadcrumbs above PageTitle).
 * Layout only. API frozen after UX-2.24.
 */
export type NavigationProps = {
  children?: ReactNode;
};

export function Navigation({ children }: NavigationProps) {
  const className = [
    NAVIGATION_TOKENS.flexDirection,
    NAVIGATION_TOKENS.titleGap,
    NAVIGATION_TOKENS.height,
  ].join(" ");

  return <div className={className}>{children}</div>;
}
