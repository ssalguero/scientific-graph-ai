import type { ReactNode } from "react";

/** UX-2.12 — Presentational empty-state action slot. */
export type EmptyActionProps = {
  children: ReactNode;
};

export function EmptyAction({ children }: EmptyActionProps) {
  return <div className="pt-1">{children}</div>;
}
