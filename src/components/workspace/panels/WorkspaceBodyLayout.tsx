"use client";

import type { ReactNode } from "react";

import { useActivePanel } from "../focus";
import { Hint, HintGroup } from "../hints";
import { BottomPanel } from "./BottomPanel";
import { ConsoleContent } from "./content/ConsoleContent";
import { ExplorerContent } from "./content/ExplorerContent";
import { InspectorContent } from "./content/InspectorContent";
import {
  BottomExpandRail,
  LeftExpandRail,
  RightExpandRail,
  focusToggleAfterExpand,
} from "./PanelExpandRail";
import { LeftPanel } from "./LeftPanel";
import { RightPanel } from "./RightPanel";
import { PanelResizeHandle, usePanelResize } from "./resize";
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
 * UX-2.9 — Inserts PanelResizeHandle splitters between regions.
 * UX-2.11 — Expand rails (layout siblings) + animated class when !resize.session.
 * UX-2.12 — Static HintGroup on canvas (presentational; no preference wiring).
 * UX-2.13 — Canvas pointerdown sets active panel; rails receive isActive.
 * Owns exactly one canvas surface marker; children are its direct child.
 */
export function WorkspaceBodyLayout({ children }: WorkspaceBodyLayoutProps) {
  const { state, expandLeft, expandRight, expandBottom } = usePanelState();
  const { session } = usePanelResize();
  const { activePanelId, setActivePanel } = useActivePanel();
  const animated = session == null;

  /** UX-2.13 — Single setActivePanel locus for canvas + expand rails. */
  const activate = (id: typeof activePanelId) => {
    setActivePanel(id);
  };

  const showLeftHandle = !state.leftCollapsed;
  const showRightHandle = !state.rightCollapsed;
  const showBottomHandle = !state.bottomCollapsed;

  const canvasActive = activePanelId === "canvas";
  const canvasActiveClass = canvasActive
    ? "border-[var(--app-accent)]/40 shadow-sm"
    : "border-[var(--app-border)] shadow-sm";

  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex min-w-0 flex-col sm:flex-row">
        {state.leftCollapsed ? (
          <div className="contents" onPointerDown={() => activate("left")}>
            <LeftExpandRail
              isActive={activePanelId === "left"}
              onExpand={() => focusToggleAfterExpand("left", expandLeft)}
            />
          </div>
        ) : null}
        <LeftPanel
          collapsed={state.leftCollapsed}
          size={state.leftWidth}
          animated={animated}
        >
          <ExplorerContent />
        </LeftPanel>
        {showLeftHandle ? (
          <div className="max-sm:hidden">
            <PanelResizeHandle axis="left" />
          </div>
        ) : null}
        <div
          data-workspace-canvas
          data-panel-id="canvas"
          data-panel-active={canvasActive ? "true" : "false"}
          onPointerDown={() => activate("canvas")}
          className={`relative min-w-0 flex-1 overflow-hidden rounded-xl border bg-[var(--app-surface)] p-4 transition-colors transition-shadow duration-200 sm:p-6 [background-image:linear-gradient(to_right,color-mix(in_srgb,var(--app-border)_35%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_srgb,var(--app-border)_35%,transparent)_1px,transparent_1px)] [background-size:24px_24px] ${canvasActiveClass}`}
        >
          {canvasActive ? (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-0.5 rounded-t-xl bg-[var(--app-accent)]"
            />
          ) : null}
          <div className="mb-3">
            <HintGroup>
              <Hint variant="tip">Drag files here.</Hint>
              <Hint variant="tip">Double-click a series to edit.</Hint>
            </HintGroup>
          </div>
          {children}
        </div>
        {showRightHandle ? (
          <div className="max-md:hidden">
            <PanelResizeHandle axis="right" />
          </div>
        ) : null}
        <RightPanel
          collapsed={state.rightCollapsed}
          size={state.rightWidth}
          animated={animated}
        >
          <InspectorContent />
        </RightPanel>
        {state.rightCollapsed ? (
          <div className="contents" onPointerDown={() => activate("right")}>
            <RightExpandRail
              isActive={activePanelId === "right"}
              onExpand={() => focusToggleAfterExpand("right", expandRight)}
            />
          </div>
        ) : null}
      </div>
      {showBottomHandle ? <PanelResizeHandle axis="bottom" /> : null}
      <BottomPanel
        collapsed={state.bottomCollapsed}
        size={state.bottomHeight}
        animated={animated}
      >
        <ConsoleContent />
      </BottomPanel>
      {state.bottomCollapsed ? (
        <div className="contents" onPointerDown={() => activate("bottom")}>
          <BottomExpandRail
            isActive={activePanelId === "bottom"}
            onExpand={() => focusToggleAfterExpand("bottom", expandBottom)}
          />
        </div>
      ) : null}
    </div>
  );
}
