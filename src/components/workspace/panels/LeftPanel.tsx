"use client";

import type { ReactNode } from "react";

import { useActivePanel } from "../focus";
import { ContextActions } from "../actions";
import { PanelOverflowMenu } from "../disclosure";
import { PanelStatus, StatusBadge } from "../status";
import { Panel } from "./Panel";
import { focusRailAfterCollapse } from "./PanelExpandRail";
import { PanelBody } from "./PanelBody";
import { PanelHeader } from "./PanelHeader";
import { usePanelState } from "./state";

/** UX-2.5 / UX-2.7 / UX-2.11 / UX-2.12 / UX-2.13 / UX-2.14 / UX-2.15 — Left IDE panel wrapper (Explorer chrome). */
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
 * UX-2.13 — pointerdown sets active panel to left (UI focus only).
 * UX-2.14 — Static PanelStatus + StatusBadge (presentational; no domain).
 * UX-2.15 — Primary New; Import demoted to PanelOverflowMenu.
 */
export function LeftPanel({
  collapsed = false,
  size,
  animated,
  children,
}: LeftPanelProps) {
  const { toggleLeft } = usePanelState();
  const { activePanelId, setActivePanel } = useActivePanel();
  const isActive = activePanelId === "left";

  const handleToggle = () => {
    const collapsing = !collapsed;
    toggleLeft();
    if (collapsing) focusRailAfterCollapse("left");
  };

  return (
    <div className="contents" onPointerDown={() => setActivePanel("left")}>
      <Panel
        title="Explorer"
        position="left"
        sizeKey="left"
        collapsed={collapsed}
        size={size}
        animated={animated}
        isActive={isActive}
      >
        <PanelHeader
          title="Explorer"
          collapsed={collapsed}
          onToggle={handleToggle}
          isActive={isActive}
          status={<PanelStatus state="empty" />}
          badge={
            <StatusBadge aria-label="Explorer is empty">Empty</StatusBadge>
          }
          actions={
            <ContextActions
              actions={[{ label: "New", ariaLabel: "New series" }]}
            />
          }
          overflow={
            <PanelOverflowMenu
              items={[{ label: "Import", ariaLabel: "Import series" }]}
            />
          }
        />
        <PanelBody>{children}</PanelBody>
      </Panel>
    </div>
  );
}
