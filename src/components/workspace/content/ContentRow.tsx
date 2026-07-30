import type { ReactNode } from "react";

import { CONTENT_TOKENS } from "./CONTENT_TOKENS";

/**
 * UX-2.22 — Standard content row (alignment + spacing + distribution).
 * No behavior. May remain unused initially. API frozen after UX-2.22.
 */
export type ContentRowProps = {
  spacing?: "sm" | "md";
  distribute?: boolean;
  children?: ReactNode;
};

export function ContentRow({
  spacing = "md",
  distribute = false,
  children,
}: ContentRowProps) {
  const className = [
    CONTENT_TOKENS.rowRoot,
    CONTENT_TOKENS.rowGap[spacing],
    distribute ? CONTENT_TOKENS.rowDistribute : "",
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={className}>{children}</div>;
}
