"use client";

import type { ReactNode } from "react";

import { Panel } from "./Panel";
import { focusRailAfterCollapse } from "./PanelExpandRail";
import { PanelBody } from "./PanelBody";
import { PanelHeader } from "./PanelHeader";
import { usePanelState } from "./state";

/** UX-2.5 / UX-2.7 / UX-2.11 — Right IDE panel wrapper (Inspector chrome). */
export type RightPanelProps = {
  collapsed?: boolean;
  size?: number;
  animated?: boolean;
  children?: ReactNode;
};

/**
 * UX-2.5 — Composes Panel shell + Header + Body.
 * UX-2.7 — Forwards collapsed + size; sizeKey selects CSS var.
 * UX-2.11 — Wires toggleRight; focus moves to expand rail on collapse.
 */
export function RightPanel({
  collapsed = false,
  size,
  animated,
  children,
}: RightPanelProps) {
  const { toggleRight } = usePanelState();

  const handleToggle = () => {
    const collapsing = !collapsed;
    toggleRight();
    if (collapsing) focusRailAfterCollapse("right");
  };

  return (
    <Panel
      title="Inspector"
      position="right"
      sizeKey="right"
      collapsed={collapsed}
      size={size}
      animated={animated}
    >
      <PanelHeader
        title="Inspector"
        collapsed={collapsed}
        onToggle={handleToggle}
      />
      <PanelBody>{children}</PanelBody>
    </Panel>
  );
}
