import { SURFACE_TOKENS } from "../surfaces/SurfaceTokens";

/** UX-2.17 — Frozen spacer scale: none | sm | md only. */
export type WorkspaceSpacerProps = {
  size?: "none" | "sm" | "md";
  className?: string;
};

/**
 * UX-2.17 — Semantic spacing primitive.
 * Uses SURFACE_TOKENS.spacer only.
 */
export function WorkspaceSpacer({
  size = "md",
  className,
}: WorkspaceSpacerProps) {
  const classNameJoined = [SURFACE_TOKENS.spacer[size], className]
    .filter(Boolean)
    .join(" ");

  return <div aria-hidden className={classNameJoined || undefined} />;
}
