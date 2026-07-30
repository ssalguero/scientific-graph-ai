import type { ReactNode } from "react";

/** UX-2.12 — Presentational empty-state action slot. */
export type EmptyActionProps = {
  children: ReactNode;
};

/**
 * UX-2.21 — Slot only; vertical rhythm owned by EmptyState gap token.
 */
export function EmptyAction({ children }: EmptyActionProps) {
  return <div>{children}</div>;
}
