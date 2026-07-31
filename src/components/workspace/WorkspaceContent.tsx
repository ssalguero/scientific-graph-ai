import { DensityProvider, WORKSPACE_DENSITY_TOKENS } from "./density";
import {
  PanelProvider,
  PanelResizeProvider,
  WorkspaceBodyLayout,
} from "./panels";
import { ActivePanelProvider } from "./focus";
import { PlanningMode, WorkspaceModeProvider } from "./modes";
import { SURFACE_TOKENS } from "./surfaces/SurfaceTokens";
import { WORKSPACE_TOKENS } from "./WorkspaceTokens";
import type { WorkspaceContentProps } from "./types";

/**
 * D47.2 — Main column + inner padding. Hosts toolbar and scientific workspace slots.
 * UX-2.3 — Presentational header (DOM-stable).
 * UX-2.4 — Body regions via WorkspaceBodyLayout (canvas + side/bottom panels).
 * UX-2.5 — Panels use shared Panel shell (BodyLayout owns wrappers).
 * UX-2.7 — PanelProvider wraps BodyLayout only (no hooks in this file).
 * UX-2.9 — PanelResizeProvider nested inside PanelProvider.
 * UX-2.10 — WorkspaceModeProvider wraps PanelProvider; Planning supplies initialState.
 * UX-2.13 — ActivePanelProvider nested inside PanelResizeProvider (UI focus only).
 * UX-2.21 — Micro-label recipe via SURFACE_TOKENS.metadata.
 * UX-2.25 — Density tokens for header spacing (hardcoded padding/stack gaps removed).
 * Move-only infrastructure: no state, hooks, or domain logic.
 */
export function WorkspaceContent({
  toolbar,
  workspace,
}: WorkspaceContentProps) {
  return (
    <div className={WORKSPACE_TOKENS.mainColumn}>
      <div className={WORKSPACE_TOKENS.inner}>
        {toolbar}
        <DensityProvider>
        <header
          data-workspace-header
          className={`flex flex-wrap items-start justify-between border-b border-[var(--app-border)] ${WORKSPACE_DENSITY_TOKENS.sectionGap} ${WORKSPACE_DENSITY_TOKENS.headerGap}`}
        >
          <div
            className={`min-w-0 flex flex-col ${WORKSPACE_DENSITY_TOKENS.iconGap}`}
          >
            <p className={SURFACE_TOKENS.metadata.root}>Project</p>
            <h1 className="truncate text-sm font-semibold tracking-tight text-[var(--app-heading)] sm:text-base">
              Scientific Graph AI
            </h1>
            <p className={`truncate text-xs sm:text-sm ${SURFACE_TOKENS.tone.default}`}>
              Current Project
            </p>
          </div>
          <p
            className={`shrink-0 text-xs font-medium sm:text-sm ${SURFACE_TOKENS.tone.default}`}
            aria-label="Workspace status"
          >
            Ready
          </p>
        </header>
        </DensityProvider>
        <WorkspaceModeProvider>
          <PanelProvider initialState={PlanningMode.apply()}>
            <PanelResizeProvider>
              <ActivePanelProvider>
                <WorkspaceBodyLayout>{workspace}</WorkspaceBodyLayout>
              </ActivePanelProvider>
            </PanelResizeProvider>
          </PanelProvider>
        </WorkspaceModeProvider>
      </div>
    </div>
  );
}
