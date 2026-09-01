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

/** UX-2.5 / UX-2.7 / UX-2.11 / UX-2.13 — Panel shell API. Shell only — no Header/Body creation. */
export type PanelProps = {
  title: string;
  position: PanelPosition;
  collapsed?: boolean;
  size?: number;
  sizeKey?: PanelId;
  /** UX-2.11 — Apply width/height transition class when true (caller: !resize.session). */
  animated?: boolean;
  /** UX-2.13 — Visual active chrome only (optional; no layout change). */
  isActive?: boolean;
  children: ReactNode;
};

/**
 * UX-2.5 — Geometric chrome shell only.
 * UX-2.7 — Expanded size via CSS variables only (no hardcoded Tailwind widths).
 * UX-2.11 — Optional animated class (no inline transition; disabled during resize).
 * UX-2.13 — Optional isActive chrome + data-panel-id / data-panel-active.
 * Layout freeze: flex flex-col min-h-0 overflow-hidden.
 * Collapsed freeze: left/right width 0; bottom height 0; overflow-hidden.
 * Children always remain mounted (collapse = geometry only).
 * R13 — collapsed panels stay mounted for IDE recovery but are inert /
 * aria-hidden so they do not compete with Product Face navigation.
 */
export function Panel({
  title,
  position,
  collapsed = false,
  size,
  sizeKey,
  animated = false,
  isActive = false,
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
    ? "transition-[width,height] duration-[var(--motion-enter-duration)] ease-[var(--motion-enter-easing)]"
    : "";

  const activeClass = isActive
    ? "border-[var(--color-brand-primary)]/40 shadow-[var(--elevation-card)]"
    : "border-[var(--color-border-default)] shadow-none";

  return (
    <section
      data-workspace-panel={position}
      data-panel-position={position}
      data-panel-id={position}
      data-panel-active={isActive ? "true" : "false"}
      data-panel-collapsed={collapsed ? "true" : "false"}
      aria-label={title}
      aria-hidden={collapsed || undefined}
      inert={collapsed || undefined}
      style={style}
      className={`flex shrink-0 flex-col min-h-0 overflow-hidden border bg-[var(--color-surface-default)] transition-[colors,box-shadow] duration-[var(--motion-enter-duration)] ease-[var(--motion-enter-easing)] ${activeClass} ${responsiveHide} ${animatedClass}`}
    >
      {children}
    </section>
  );
}
