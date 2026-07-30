import type { ReactNode } from "react";

import { SURFACE_TOKENS } from "../surfaces/SurfaceTokens";

/** UX-2.17 — Sole flex layout owner. Defaults frozen: md / vertical. */
export type WorkspaceStackProps = {
  spacing?: "sm" | "md";
  direction?: "vertical" | "horizontal";
  children: ReactNode;
  className?: string;
};

/**
 * UX-2.17 — Consistent vertical/horizontal stack SSOT.
 * Uses SURFACE_TOKENS.workspaceGap only — no local spacing maps.
 */
export function WorkspaceStack({
  spacing = "md",
  direction = "vertical",
  children,
  className,
}: WorkspaceStackProps) {
  const classNameJoined = [
    "flex",
    direction === "vertical" ? "flex-col" : "flex-row",
    SURFACE_TOKENS.workspaceGap[spacing],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classNameJoined}>{children}</div>;
}
