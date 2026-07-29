import type { ReactNode } from "react";

import { Panel } from "./Panel";
import { PanelBody } from "./PanelBody";
import { PanelHeader } from "./PanelHeader";

/** UX-2.5 — Bottom IDE panel wrapper (Console chrome; empty body). */
export type BottomPanelProps = {
  collapsed?: boolean;
  children?: ReactNode;
};

/**
 * UX-2.5 — Composes Panel shell + Header + Body.
 * Content slot ready for UX-2.6; Panel remains untouched.
 */
export function BottomPanel({ collapsed, children }: BottomPanelProps) {
  return (
    <Panel title="Console" position="bottom" collapsed={collapsed}>
      <PanelHeader title="Console" />
      <PanelBody>{children}</PanelBody>
    </Panel>
  );
}
