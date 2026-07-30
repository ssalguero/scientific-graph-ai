import type { ReactNode } from "react";

import { EmptyAction } from "./EmptyAction";
import { EmptyDescription } from "./EmptyDescription";
import { EmptyIcon } from "./EmptyIcon";
import { EmptyTitle } from "./EmptyTitle";

/**
 * UX-2.12 — Generic empty-state composer (API frozen).
 * No domain knowledge: Series / Inspector / Layout / state.
 */
export type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-1.5 px-3 py-6 text-center"
    >
      {icon != null ? <EmptyIcon>{icon}</EmptyIcon> : null}
      <EmptyTitle>{title}</EmptyTitle>
      {description != null && description !== "" ? (
        <EmptyDescription>{description}</EmptyDescription>
      ) : null}
      {action != null ? <EmptyAction>{action}</EmptyAction> : null}
    </div>
  );
}
