import type { ReactNode } from "react";

/** UX-2.5 — Panel body: children slot only (empty in this phase). */
export type PanelBodyProps = {
  children?: ReactNode;
};

/**
 * UX-2.5 — Layout freeze: flex-1 min-h-0 overflow-auto.
 */
export function PanelBody({ children }: PanelBodyProps) {
  return (
    <div className="min-h-0 flex-1 overflow-auto px-3 py-2">{children}</div>
  );
}
