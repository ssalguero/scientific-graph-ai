import type { ReactNode } from "react";

import { Panel } from "./Panel";
import { PanelBody } from "./PanelBody";
import { PanelHeader } from "./PanelHeader";

/** UX-2.5 — Left IDE panel wrapper (Explorer chrome; empty body). */
export type LeftPanelProps = {
  collapsed?: boolean;
  children?: ReactNode;
};

/**
 * UX-2.5 — Composes Panel shell + Header + Body.
 * Content slot ready for UX-2.6; Panel remains untouched.
 */
export function LeftPanel({ collapsed, children }: LeftPanelProps) {
  return (
    <Panel title="Explorer" position="left" collapsed={collapsed}>
      <PanelHeader title="Explorer" />
      <PanelBody>{children}</PanelBody>
    </Panel>
  );
}
