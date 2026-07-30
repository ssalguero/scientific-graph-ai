import type { ReactNode } from "react";

import { SURFACE_TOKENS } from "../surfaces/SurfaceTokens";

/** UX-2.17 — Zone wrapper only (no flex / no layout ownership). */
export type WorkspaceSectionProps = {
  padding?: "none" | "sm" | "md";
  children: ReactNode;
  className?: string;
};

/**
 * UX-2.17 — Presentational zone structure.
 * Wrapper only — if flex is needed, use WorkspaceStack.
 */
export function WorkspaceSection({
  padding = "none",
  children,
  className,
}: WorkspaceSectionProps) {
  const classes = [SURFACE_TOKENS.sectionPadding[padding], className]
    .filter(Boolean)
    .join(" ");

  return <div className={classes || undefined}>{children}</div>;
}
