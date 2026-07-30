import type { ReactNode } from "react";

import { SURFACE_TOKENS } from "../../surfaces/SurfaceTokens";

/** UX-2.6 Freeze A — sole reusable content block for any panel. */
export type PanelContentSectionProps = {
  id: string;
  title: string;
  children?: ReactNode;
};

/**
 * UX-2.6 — Always renders <section data-panel-content-section={id}>.
 * id is stable (machine-facing); title is visible label only.
 * UX-2.21 — Micro-label + section gap via SURFACE_TOKENS (uses sectionGap).
 */
export function PanelContentSection({
  id,
  title,
  children,
}: PanelContentSectionProps) {
  return (
    <section
      data-panel-content-section={id}
      className={`flex flex-col ${SURFACE_TOKENS.sectionGap.sm} ${SURFACE_TOKENS.sectionPadding.sm}`}
    >
      <h3 className={SURFACE_TOKENS.metadata.root}>{title}</h3>
      <div>{children}</div>
    </section>
  );
}
