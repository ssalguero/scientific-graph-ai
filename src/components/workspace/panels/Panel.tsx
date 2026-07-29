import type { ReactNode } from "react";

/** UX-2.5 — Panel position (frozen). */
export type PanelPosition = "left" | "right" | "bottom";

/** UX-2.5 — Panel shell API (frozen). Shell only — no Header/Body creation. */
export type PanelProps = {
  title: string;
  position: PanelPosition;
  collapsed?: boolean;
  children: ReactNode;
};

const EXPANDED_SIZE: Record<PanelPosition, string> = {
  left: "w-[320px]",
  right: "w-[340px]",
  bottom: "h-[220px]",
};

/**
 * UX-2.5 — Geometric chrome shell only.
 * Wrappers compose PanelHeader + PanelBody as children.
 * Layout freeze: flex flex-col min-h-0 overflow-hidden.
 * Collapsed freeze: left/right width 0; bottom height 0; overflow-hidden (not hide Body).
 */
export function Panel({
  title,
  position,
  collapsed = false,
  children,
}: PanelProps) {
  const sizeClass = collapsed
    ? position === "bottom"
      ? "h-0"
      : "w-0"
    : EXPANDED_SIZE[position];

  const responsiveHide =
    position === "bottom"
      ? ""
      : position === "right"
        ? "max-md:hidden"
        : "max-sm:hidden";

  return (
    <section
      data-workspace-panel={position}
      data-panel-position={position}
      data-panel-collapsed={collapsed ? "true" : "false"}
      aria-label={title}
      className={`flex shrink-0 flex-col min-h-0 overflow-hidden border border-[var(--app-border)] bg-[var(--app-surface)] ${responsiveHide} ${sizeClass}`}
    >
      {children}
    </section>
  );
}
