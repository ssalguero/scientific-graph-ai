import type { ReactNode } from "react";

import { SURFACE_TOKENS } from "../../surfaces/SurfaceTokens";
import { EmptyAction } from "./EmptyAction";
import { EmptyDescription } from "./EmptyDescription";
import { EmptyIcon } from "./EmptyIcon";
import { EmptyTitle } from "./EmptyTitle";

/**
 * UX-2.12 — Generic empty-state composer (API frozen).
 * No domain knowledge: Series / Inspector / Layout / state.
 * UX-2.21 — Layout gap/padding via SURFACE_TOKENS (nearest existing keys).
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
      className={`flex flex-col items-center justify-center text-center ${SURFACE_TOKENS.gap.sm} ${SURFACE_TOKENS.padding.md}`}
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
