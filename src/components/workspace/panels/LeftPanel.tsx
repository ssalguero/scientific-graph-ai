"use client";

import type { ReactNode } from "react";

import { ContextActions } from "../actions";
import { Panel } from "./Panel";
import { focusRailAfterCollapse } from "./PanelExpandRail";
import { PanelBody } from "./PanelBody";
import { PanelHeader } from "./PanelHeader";
import { usePanelState } from "./state";

/** UX-2.5 / UX-2.7 / UX-2.11 / UX-2.12 — Left IDE panel wrapper (Explorer chrome). */
export type LeftPanelProps = {
  collapsed?: boolean;
  size?: number;
  animated?: boolean;
  children?: ReactNode;
};

/**
 * UX-2.5 — Composes Panel shell + Header + Body.
 * UX-2.7 — Forwards collapsed + size; sizeKey selects CSS var.
 * UX-2.11 — Wires toggleLeft; focus moves to expand rail on collapse.
 * UX-2.12 — Static ContextActions (presentational; no domain handlers).
 */
export function LeftPanel({
  collapsed = false,
  size,
  animated,
  children,
}: LeftPanelProps) {
  const { toggleLeft } = usePanelState();

  const handleToggle = () => {
    const collapsing = !collapsed;
    toggleLeft();
    if (collapsing) focusRailAfterCollapse("left");
  };

  return (
    <Panel
      title="Explorer"
      position="left"
      sizeKey="left"
      collapsed={collapsed}
      size={size}
      animated={animated}
    >
      <PanelHeader
        title="Explorer"
        collapsed={collapsed}
        onToggle={handleToggle}
        actions={
          <ContextActions
            actions={[
              { label: "New", ariaLabel: "New series" },
              { label: "Import", ariaLabel: "Import series" },
            ]}
          />
        }
      />
      <PanelBody>{children}</PanelBody>
    </Panel>
  );
}
