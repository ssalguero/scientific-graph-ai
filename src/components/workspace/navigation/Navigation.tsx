import type { ReactNode } from "react";

import { DensityProvider } from "../density";
import { NAVIGATION_TOKENS } from "./navigationTokens";

/**
 * UX-2.24 — Vertical navigation stack (Breadcrumbs above PageTitle).
 * UX-2.25 — DensityProvider semantic boundary (Fragment; no runtime work).
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

  return (
    <DensityProvider>
      <div className={className}>{children}</div>
    </DensityProvider>
  );
}
