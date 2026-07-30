"use client";

import type { ReactNode } from "react";

import { useActivePanel } from "../focus";
import { Panel } from "./Panel";
import { focusRailAfterCollapse } from "./PanelExpandRail";
import { PanelBody } from "./PanelBody";
import { PanelHeader } from "./PanelHeader";
import { usePanelState } from "./state";

/** UX-2.5 / UX-2.7 / UX-2.11 / UX-2.13 — Bottom IDE panel wrapper (Console chrome). */
export type BottomPanelProps = {
  collapsed?: boolean;
  size?: number;
  animated?: boolean;
  children?: ReactNode;
};

/**
 * UX-2.5 — Composes Panel shell + Header + Body.
 * UX-2.7 — Forwards collapsed + size; sizeKey selects CSS var.
 * UX-2.11 — Wires toggleBottom; focus moves to expand rail on collapse.
 * UX-2.13 — pointerdown sets active panel to bottom (UI focus only).
 */
export function BottomPanel({
  collapsed = false,
  size,
  animated,
  children,
}: BottomPanelProps) {
  const { toggleBottom } = usePanelState();
  const { activePanelId, setActivePanel } = useActivePanel();
  const isActive = activePanelId === "bottom";

  const handleToggle = () => {
    const collapsing = !collapsed;
    toggleBottom();
    if (collapsing) focusRailAfterCollapse("bottom");
  };

  return (
    <div className="contents" onPointerDown={() => setActivePanel("bottom")}>
      <Panel
        title="Console"
        position="bottom"
        sizeKey="bottom"
        collapsed={collapsed}
        size={size}
        animated={animated}
        isActive={isActive}
      >
        <PanelHeader
          title="Console"
          collapsed={collapsed}
          onToggle={handleToggle}
          isActive={isActive}
        />
        <PanelBody>{children}</PanelBody>
      </Panel>
    </div>
  );
}
