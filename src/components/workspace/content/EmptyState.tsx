import { Stack } from "../layout";
import { CONTENT_TOKENS } from "./CONTENT_TOKENS";
import { Description } from "./Description";

/**
 * UX-2.22 — Content Grammar empty primitive.
 * UX-2.26 — Composes Stack (no raw flex in emptyRoot).
 * Title + description only — no icons, buttons, or actions.
 * Does NOT replace panels/empty/EmptyState (frozen public API).
 * API frozen after UX-2.22.
 */
export type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Stack gap="sm" align="center">
      <p className={CONTENT_TOKENS.emptyTitle}>{title}</p>
      {description != null && description !== "" ? (
        <Description>{description}</Description>
      ) : null}
    </Stack>
  );
}
