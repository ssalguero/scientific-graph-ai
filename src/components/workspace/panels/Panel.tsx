import type { CSSProperties, ReactNode } from "react";

import type { PanelId } from "./state";

/** UX-2.5 — Panel position (frozen). */
export type PanelPosition = "left" | "right" | "bottom";

/** UX-2.7 — CSS size variables (reusable by UX-2.8 ResizeHandle). */
export const PANEL_CSS_VARS = {
  left: "--workspace-left-width",
  right: "--workspace-right-width",
  bottom: "--workspace-bottom-height",
} as const;

/** UX-2.5 / UX-2.7 / UX-2.11 — Panel shell API. Shell only — no Header/Body creation. */
export type PanelProps = {
  title: string;
  position: PanelPosition;
  collapsed?: boolean;
  size?: number;
  sizeKey?: PanelId;
  /** UX-2.11 — Apply width/height transition class when true (caller: !resize.session). */
  animated?: boolean;
  children: ReactNode;
};

/**
 * UX-2.5 — Geometric chrome shell only.
 * UX-2.7 — Expanded size via CSS variables only (no hardcoded Tailwind widths).
 * UX-2.11 — Optional animated class (no inline transition; disabled during resize).
 * Layout freeze: flex flex-col min-h-0 overflow-hidden.
 * Collapsed freeze: left/right width 0; bottom height 0; overflow-hidden.
 * Children always remain mounted (collapse = geometry only).
 */
export function Panel({
  title,
  position,
  collapsed = false,
  size,
  sizeKey,
  animated = false,
  children,
}: PanelProps) {
  const cssVar = sizeKey ? PANEL_CSS_VARS[sizeKey] : undefined;

  const style: CSSProperties = {
    ...(cssVar != null && size != null
      ? ({ [cssVar]: `${size}px` } as CSSProperties)
      : {}),
    ...(collapsed
      ? position === "bottom"
        ? { height: 0 }
        : { width: 0 }
      : cssVar != null
        ? position === "bottom"
          ? { height: `var(${cssVar})` }
          : { width: `var(${cssVar})` }
        : {}),
  };

  const responsiveHide =
    position === "bottom"
      ? ""
      : position === "right"
        ? "max-md:hidden"
        : "max-sm:hidden";

  const animatedClass = animated
    ? "transition-[width,height] duration-200 ease-out"
    : "";

  return (
    <section
      data-workspace-panel={position}
      data-panel-position={position}
      data-panel-collapsed={collapsed ? "true" : "false"}
      aria-label={title}
      style={style}
      className={`flex shrink-0 flex-col min-h-0 overflow-hidden border border-[var(--app-border)] bg-[var(--app-surface)] ${responsiveHide} ${animatedClass}`}
    >
      {children}
    </section>
  );
}
