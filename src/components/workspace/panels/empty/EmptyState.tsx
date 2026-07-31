import type { ReactNode } from "react";

import {
  EmptyState as ContentEmptyState,
} from "../../content";
import { Center, Stack } from "../../layout";
import { SURFACE_TOKENS } from "../../surfaces/SurfaceTokens";
import { EmptyAction } from "./EmptyAction";
import { EmptyIcon } from "./EmptyIcon";

/**
 * UX-2.12 — Generic empty-state composer (API frozen).
 * No domain knowledge: Series / Inspector / Layout / state.
 * UX-2.21 — Layout gap/padding via SURFACE_TOKENS (nearest existing keys).
 * UX-2.22 — Composes workspace/content EmptyState for title/description.
 * UX-2.26 — Composes Center + Stack (no raw flex).
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
    <div role="status">
      <Center className={`text-center ${SURFACE_TOKENS.padding.md}`}>
        <Stack gap="sm" align="center">
          {icon != null ? <EmptyIcon>{icon}</EmptyIcon> : null}
          <ContentEmptyState title={title} description={description} />
          {action != null ? <EmptyAction>{action}</EmptyAction> : null}
        </Stack>
      </Center>
    </div>
  );
}
