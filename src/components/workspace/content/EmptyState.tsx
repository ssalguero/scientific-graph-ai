import { CONTENT_TOKENS } from "./CONTENT_TOKENS";
import { Description } from "./Description";

/**
 * UX-2.22 — Content Grammar empty primitive.
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
    <div
      className={`${CONTENT_TOKENS.emptyRoot} ${CONTENT_TOKENS.emptyGap}`}
    >
      <p className={CONTENT_TOKENS.emptyTitle}>{title}</p>
      {description != null && description !== "" ? (
        <Description>{description}</Description>
      ) : null}
    </div>
  );
}
