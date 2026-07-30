import { ContextAction } from "./ContextAction";
import type { ContextActionItem } from "./ContextAction";

export type { ContextActionItem };

/** UX-2.12 — Contextual action group (API frozen). */
export type ContextActionsProps = {
  actions: ContextActionItem[];
  orientation?: "horizontal" | "vertical";
};

export function ContextActions({
  actions,
  orientation = "horizontal",
}: ContextActionsProps) {
  const layout =
    orientation === "vertical"
      ? "flex flex-col items-stretch gap-1"
      : "flex flex-row flex-wrap items-center gap-1";

  return (
    <div className={layout} role="group">
      {actions.map((action) => (
        <ContextAction key={action.label} {...action} />
      ))}
    </div>
  );
}
