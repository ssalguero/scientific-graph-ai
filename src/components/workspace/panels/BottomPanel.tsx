import type { ReactNode } from "react";

import { Panel } from "./Panel";
import { PanelBody } from "./PanelBody";
import { PanelHeader } from "./PanelHeader";

/** UX-2.5 / UX-2.7 — Bottom IDE panel wrapper (Console chrome). */
export type BottomPanelProps = {
  collapsed?: boolean;
  size?: number;
  children?: ReactNode;
};

/**
 * UX-2.5 — Composes Panel shell + Header + Body.
 * UX-2.7 — Forwards collapsed + size; sizeKey selects CSS var.
 */
export function BottomPanel({ collapsed, size, children }: BottomPanelProps) {
  return (
    <Panel
      title="Console"
      position="bottom"
      sizeKey="bottom"
      collapsed={collapsed}
      size={size}
    >
      <PanelHeader title="Console" />
      <PanelBody>{children}</PanelBody>
    </Panel>
  );
}
