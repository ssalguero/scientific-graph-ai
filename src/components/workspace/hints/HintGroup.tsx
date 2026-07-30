import type { ReactNode } from "react";

/**
 * UX-2.12 — Hint collection (API frozen).
 * children only — no spacing / orientation / title props.
 */
export type HintGroupProps = {
  children: ReactNode;
};

export function HintGroup({ children }: HintGroupProps) {
  return (
    <div className="flex flex-col gap-1.5" data-workspace-hints>
      {children}
    </div>
  );
}
