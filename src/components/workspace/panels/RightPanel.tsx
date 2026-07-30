"use client";

import type { ReactNode } from "react";

import { useActivePanel } from "../focus";
import { ContextActions } from "../actions";
import { PanelStatus, StatusBadge, StatusChip } from "../status";
import { Panel } from "./Panel";
import { focusRailAfterCollapse } from "./PanelExpandRail";
import { PanelBody } from "./PanelBody";
import { PanelHeader } from "./PanelHeader";
import { usePanelState } from "./state";

/** UX-2.5 / UX-2.7 / UX-2.11 / UX-2.12 / UX-2.13 / UX-2.14 — Right IDE panel wrapper (Inspector chrome). */
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
 * UX-2.12 — Static disabled ContextActions placeholders (no selection logic).
 * UX-2.13 — pointerdown sets active panel to right (UI focus only).
 * UX-2.14 — Static PanelStatus + StatusBadge + StatusChip (presentational).
 */
export function RightPanel({
  collapsed = false,
  size,
  animated,
  children,
}: RightPanelProps) {
  const { toggleRight } = usePanelState();
  const { activePanelId, setActivePanel } = useActivePanel();
  const isActive = activePanelId === "right";

  const handleToggle = () => {
    const collapsing = !collapsed;
    toggleRight();
    if (collapsing) focusRailAfterCollapse("right");
  };

  return (
    <div className="contents" onPointerDown={() => setActivePanel("right")}>
      <Panel
        title="Inspector"
        position="right"
        sizeKey="right"
        collapsed={collapsed}
        size={size}
        animated={animated}
        isActive={isActive}
      >
        <PanelHeader
          title="Inspector"
          collapsed={collapsed}
          onToggle={handleToggle}
          isActive={isActive}
          status={<PanelStatus state="empty" />}
          badge={
            <StatusBadge aria-label="No selection">No selection</StatusBadge>
          }
          chips={<StatusChip>Selection</StatusChip>}
          actions={
            <ContextActions
              actions={[
                {
                  label: "Rename",
                  ariaLabel: "Rename selection",
                  disabled: true,
                },
                {
                  label: "Color",
                  ariaLabel: "Edit color",
                  disabled: true,
                },
              ]}
            />
          }
        />
        <PanelBody>{children}</PanelBody>
      </Panel>
    </div>
  );
}
