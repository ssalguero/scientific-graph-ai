import type { ReactNode } from "react";

import {
  EmptyState as ContentEmptyState,
} from "../../content";
import { SURFACE_TOKENS } from "../../surfaces/SurfaceTokens";
import { EmptyAction } from "./EmptyAction";
import { EmptyIcon } from "./EmptyIcon";

/**
 * UX-2.12 — Generic empty-state composer (API frozen).
 * No domain knowledge: Series / Inspector / Layout / state.
 * UX-2.21 — Layout gap/padding via SURFACE_TOKENS (nearest existing keys).
 * UX-2.22 — Composes workspace/content EmptyState for title/description.
 * Public props unchanged (icon / title / description / action).
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
      <ContentEmptyState title={title} description={description} />
      {action != null ? <EmptyAction>{action}</EmptyAction> : null}
    </div>
  );
}
