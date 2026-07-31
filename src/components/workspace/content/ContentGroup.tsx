import type { ReactNode } from "react";

import { DensityProvider } from "../density";
import { CONTENT_TOKENS } from "./CONTENT_TOKENS";

/**
 * UX-2.22 — Visual content grouping (spacing + layout only).
 * UX-2.25 — DensityProvider semantic boundary (Fragment; no runtime work).
 * No logic. API frozen after UX-2.22.
 */
export type ContentGroupProps = {
  spacing?: "sm" | "md";
  children?: ReactNode;
};

export function ContentGroup({
  spacing = "md",
  children,
}: ContentGroupProps) {
  return (
    <DensityProvider>
      <div
        className={`${CONTENT_TOKENS.groupRoot} ${CONTENT_TOKENS.groupGap[spacing]}`}
      >
        {children}
      </div>
    </DensityProvider>
  );
}
