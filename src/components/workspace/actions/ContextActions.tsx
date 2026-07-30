import { SURFACE_TOKENS } from "../surfaces/SurfaceTokens";
import { ContextAction } from "./ContextAction";
import type { ContextActionItem } from "./ContextAction";

export type { ContextActionItem };

/** UX-2.12 — Contextual action group (API frozen). */
export type ContextActionsProps = {
  actions: ContextActionItem[];
  orientation?: "horizontal" | "vertical";
};

/**
 * UX-2.21 — Gap via SURFACE_TOKENS (nearest existing: gap.sm replaces gap-1).
 */
export function ContextActions({
  actions,
  orientation = "horizontal",
}: ContextActionsProps) {
  const layout =
    orientation === "vertical"
      ? `flex flex-col items-stretch ${SURFACE_TOKENS.gap.sm}`
      : `flex flex-row flex-wrap items-center ${SURFACE_TOKENS.gap.sm}`;

  return (
    <div className={layout} role="group">
      {actions.map((action) => (
        <ContextAction key={action.label} {...action} />
      ))}
    </div>
  );
}
