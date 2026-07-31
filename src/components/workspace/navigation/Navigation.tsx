import type { ReactNode } from "react";

import { DensityProvider } from "../density";
import { Stack } from "../layout";
import { NAVIGATION_TOKENS } from "./navigationTokens";

/**
 * UX-2.24 — Vertical navigation stack (Breadcrumbs above PageTitle).
 * UX-2.25 — DensityProvider semantic boundary (Fragment; no runtime work).
 * UX-2.26 — Composes Stack (no raw flexDirection token on root).
 * Layout only. API frozen after UX-2.24.
 */
export type NavigationProps = {
  children?: ReactNode;
};

export function Navigation({ children }: NavigationProps) {
  const className = [NAVIGATION_TOKENS.titleGap, NAVIGATION_TOKENS.height].join(
    " "
  );

  return (
    <DensityProvider>
      <Stack gap="none" className={className}>
        {children}
      </Stack>
    </DensityProvider>
  );
}
