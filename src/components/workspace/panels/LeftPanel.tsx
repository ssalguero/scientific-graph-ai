import type { ReactNode } from "react";

import { Panel } from "./Panel";
import { PanelBody } from "./PanelBody";
import { PanelHeader } from "./PanelHeader";

/** UX-2.5 / UX-2.7 — Left IDE panel wrapper (Explorer chrome). */
export type LeftPanelProps = {
  collapsed?: boolean;
  size?: number;
  children?: ReactNode;
};

/**
 * UX-2.5 — Composes Panel shell + Header + Body.
 * UX-2.7 — Forwards collapsed + size; sizeKey selects CSS var.
 */
export function LeftPanel({ collapsed, size, children }: LeftPanelProps) {
  return (
    <Panel
      title="Explorer"
      position="left"
      sizeKey="left"
      collapsed={collapsed}
      size={size}
    >
      <PanelHeader title="Explorer" />
      <PanelBody>{children}</PanelBody>
    </Panel>
  );
}
