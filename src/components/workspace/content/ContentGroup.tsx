import type { ReactNode } from "react";

import { CONTENT_TOKENS } from "./CONTENT_TOKENS";

/**
 * UX-2.22 — Visual content grouping (spacing + layout only).
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
    <div
      className={`${CONTENT_TOKENS.groupRoot} ${CONTENT_TOKENS.groupGap[spacing]}`}
    >
      {children}
    </div>
  );
}
