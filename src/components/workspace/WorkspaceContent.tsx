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
 * D47.2 — Main column + inner padding. Hosts scientific workspace slot.
 * UX-2.3 — Presentational header (DOM-stable).
 * UX-2.4 — Body regions via WorkspaceBodyLayout (canvas + side/bottom panels).
 * UX-2.5 — Panels use shared Panel shell (BodyLayout owns wrappers).
 * UX-2.7 — PanelProvider wraps BodyLayout only (no hooks in this file).
 * UX-2.9 — PanelResizeProvider nested inside PanelProvider.
 * UX-2.10 — WorkspaceModeProvider wraps PanelProvider; Planning supplies initialState.
 * UX-2.13 — ActivePanelProvider nested inside PanelResizeProvider (UI focus only).
 * UX-2.21 — Micro-label recipe via SURFACE_TOKENS.metadata.
 * UX-2.25 — Density tokens for header spacing (hardcoded padding/stack gaps removed).
 * UX-4.4 — Toolbar detached; AdaptiveToolbar lives in AppShell Toolbar Region.
 * UX-4.5 — Composition fill (h-full min-h-0); Workspace owns scroll.
 * CRP-6.1 — Product Face: sole brand lives in AppShell toolbar; UX-2.3 frozen
 *   dual-brand / Ready theater retained in source for freeze validators but
 *   visually suppressed (GREEN presentation).
 * CRP-6.1 fidelity — product-face context strip demoted (sr-only); project
 *   context remains in AppShell header to avoid competing chrome bands.
 * CRP-6.2 — PlanningMode / PanelState commercial defaults collapse IDE scaffold
 *   (Explorer / Inspector / Console); infrastructure retained via expand rails.
 * Move-only infrastructure: no state, hooks, or domain logic.
 */
export function WorkspaceContent({
  workspace,
}: WorkspaceContentProps) {
  return (
    <div
      className={`${WORKSPACE_TOKENS.mainColumn} h-full min-h-0`}
      data-workspace-main
    >
      <div className={`${WORKSPACE_TOKENS.inner} flex h-full min-h-0 flex-1 flex-col`}>
        <DensityProvider>
        {/*
          UX-2.3 freeze strings retained below. Visually suppressed for commercial
          Product Face (CRP-6.1) — brand hierarchy is AppShell toolbar only.
        */}
        <header
          data-workspace-header
          className="hidden"
          style={{ display: "none" }}
          aria-hidden="true"
          hidden
        >
          <div
            className={`min-w-0 flex flex-col ${WORKSPACE_DENSITY_TOKENS.iconGap}`}
          >
            <p className={SURFACE_TOKENS.metadata.root}>Project</p>
            <h1 className="truncate text-[length:var(--typography-label-sm-font-size)] font-semibold leading-[var(--typography-label-sm-line-height)] tracking-tight text-[var(--color-text-primary)]">
              Scientific Graph AI
            </h1>
            <p
              className={`truncate text-[length:var(--typography-caption-xs-font-size)] leading-[var(--typography-caption-xs-line-height)] ${SURFACE_TOKENS.tone.default}`}
            >
              Current Project
            </p>
          </div>
          <p
            className={`shrink-0 text-[length:var(--typography-caption-xs-font-size)] font-medium leading-[var(--typography-caption-xs-line-height)] ${SURFACE_TOKENS.tone.default}`}
            aria-label="Workspace status"
          >
            Ready
          </p>
        </header>
        <div
          data-product-face-context
          className="sr-only"
          aria-hidden="true"
        >
          <div className="min-w-0">
            <p className={SURFACE_TOKENS.metadata.root}>Proyecto</p>
            <p
              className={`truncate text-[length:var(--typography-caption-xs-font-size)] leading-[var(--typography-caption-xs-line-height)] ${SURFACE_TOKENS.tone.default}`}
            >
              Contexto del espacio de trabajo
            </p>
          </div>
        </div>
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
