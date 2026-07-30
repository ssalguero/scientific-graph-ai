import type { ReactNode } from "react";

import { Panel } from "./Panel";
import { PanelBody } from "./PanelBody";
import { PanelHeader } from "./PanelHeader";

/** UX-2.5 / UX-2.7 — Right IDE panel wrapper (Inspector chrome). */
export type RightPanelProps = {
  collapsed?: boolean;
  size?: number;
  children?: ReactNode;
};

/**
 * UX-2.5 — Composes Panel shell + Header + Body.
 * UX-2.7 — Forwards collapsed + size; sizeKey selects CSS var.
 */
export function RightPanel({ collapsed, size, children }: RightPanelProps) {
  return (
    <Panel
      title="Inspector"
      position="right"
      sizeKey="right"
      collapsed={collapsed}
      size={size}
    >
      <PanelHeader title="Inspector" />
      <PanelBody>{children}</PanelBody>
    </Panel>
  );
}
