import type { ReactNode } from "react";

import { SURFACE_TOKENS } from "../surfaces/SurfaceTokens";

/**
 * UX-2.17 — Semantic affinity cluster (not hierarchy).
 * Valid: Properties + Appearance + Variables together.
 * Invalid: modeling Header / Body / Footer as Group (use WorkspaceStack).
 */
export type WorkspaceGroupProps = {
  spacing?: "sm" | "md";
  children: ReactNode;
  className?: string;
};

/**
 * UX-2.17 — Groups related content by affinity.
 * Uses SURFACE_TOKENS.groupGap only.
 */
export function WorkspaceGroup({
  spacing = "md",
  children,
  className,
}: WorkspaceGroupProps) {
  const classNameJoined = [
    "flex flex-col",
    SURFACE_TOKENS.groupGap[spacing],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classNameJoined}>{children}</div>;
}
