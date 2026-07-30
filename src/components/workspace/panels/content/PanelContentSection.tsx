import type { ReactNode } from "react";

/** UX-2.6 Freeze A — sole reusable content block for any panel. */
export type PanelContentSectionProps = {
  id: string;
  title: string;
  children?: ReactNode;
};

/**
 * UX-2.6 — Always renders <section data-panel-content-section={id}>.
 * id is stable (machine-facing); title is visible label only.
 */
export function PanelContentSection({
  id,
  title,
  children,
}: PanelContentSectionProps) {
  return (
    <section data-panel-content-section={id} className="space-y-1.5 py-2">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.09em] text-[var(--app-text-muted)]">
        {title}
      </h3>
      <div>{children}</div>
    </section>
  );
}
