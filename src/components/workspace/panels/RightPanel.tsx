import type { ReactNode } from "react";

import { Panel } from "./Panel";
import { PanelBody } from "./PanelBody";
import { PanelHeader } from "./PanelHeader";

/** UX-2.5 — Right IDE panel wrapper (Inspector chrome; empty body). */
export type RightPanelProps = {
  collapsed?: boolean;
  children?: ReactNode;
};

/**
 * UX-2.5 — Composes Panel shell + Header + Body.
 * Content slot ready for UX-2.6; Panel remains untouched.
 */
export function RightPanel({ collapsed, children }: RightPanelProps) {
  return (
    <Panel title="Inspector" position="right" collapsed={collapsed}>
      <PanelHeader title="Inspector" />
      <PanelBody>{children}</PanelBody>
    </Panel>
  );
}
