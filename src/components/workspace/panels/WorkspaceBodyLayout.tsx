import type { ReactNode } from "react";

import { BottomPanel } from "./BottomPanel";
import { LeftPanel } from "./LeftPanel";
import { RightPanel } from "./RightPanel";

/** UX-2.4 — Presentational body grid API (agnostic center slot). */
export type WorkspaceBodyLayoutProps = {
  children: ReactNode;
};

/**
 * UX-2.4 — IDE body layout: Left | Canvas | Right + Bottom.
 * UX-2.5 — Panels use shared Panel shell (wrappers).
 * Presentation-only: no hooks, state, effects, context, or providers.
 * Owns exactly one canvas surface marker; children are its direct child.
 */
export function WorkspaceBodyLayout({ children }: WorkspaceBodyLayoutProps) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
        <LeftPanel />
        <div
          data-workspace-canvas
          className="min-w-0 flex-1 overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm sm:p-6 [background-image:linear-gradient(to_right,color-mix(in_srgb,var(--app-border)_35%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_srgb,var(--app-border)_35%,transparent)_1px,transparent_1px)] [background-size:24px_24px]"
        >
          {children}
        </div>
        <RightPanel />
      </div>
      <BottomPanel />
    </div>
  );
}
