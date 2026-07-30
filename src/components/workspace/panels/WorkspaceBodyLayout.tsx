import type { ReactNode } from "react";

import { BottomPanel } from "./BottomPanel";
import { ConsoleContent } from "./content/ConsoleContent";
import { ExplorerContent } from "./content/ExplorerContent";
import { InspectorContent } from "./content/InspectorContent";
import { LeftPanel } from "./LeftPanel";
import { RightPanel } from "./RightPanel";
import { usePanelState } from "./state";

/** UX-2.4 — Body grid API (agnostic center slot). */
export type WorkspaceBodyLayoutProps = {
  children: ReactNode;
};

/**
 * UX-2.4 — IDE body layout: Left | Canvas | Right + Bottom.
 * UX-2.5 — Panels use shared Panel shell (wrappers).
 * UX-2.6 — Mounts Explorer / Inspector / Console content into Body slots.
 * UX-2.7 — Reads panel visual state from PanelProvider; passes collapsed + size.
 * Owns exactly one canvas surface marker; children are its direct child.
 */
export function WorkspaceBodyLayout({ children }: WorkspaceBodyLayoutProps) {
  const { state } = usePanelState();

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
        <LeftPanel collapsed={state.leftCollapsed} size={state.leftWidth}>
          <ExplorerContent />
        </LeftPanel>
        <div
          data-workspace-canvas
          className="min-w-0 flex-1 overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm sm:p-6 [background-image:linear-gradient(to_right,color-mix(in_srgb,var(--app-border)_35%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_srgb,var(--app-border)_35%,transparent)_1px,transparent_1px)] [background-size:24px_24px]"
        >
          {children}
        </div>
        <RightPanel collapsed={state.rightCollapsed} size={state.rightWidth}>
          <InspectorContent />
        </RightPanel>
      </div>
      <BottomPanel
        collapsed={state.bottomCollapsed}
        size={state.bottomHeight}
      >
        <ConsoleContent />
      </BottomPanel>
    </div>
  );
}
