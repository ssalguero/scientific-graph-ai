"use client";

import { createContext, useContext } from "react";

import { getIcon } from "@/lib/ui/icons";
import {
  sidebarNavItem,
  sidebarNavItemActive,
  sidebarNavItemDisabled,
  sidebarNavItemHover,
  sidebarNavItemPressed,
} from "@/lib/ui/theme";
import { mergeClassNames } from "../classNames";
import type { SidebarItemProps } from "./types";

/** D46.3 — rail collapse signal for SidebarItem tooltips / label visibility. */
export const SidebarRailCollapsedContext = createContext(false);

export function useSidebarRailCollapsed(): boolean {
  return useContext(SidebarRailCollapsedContext);
}

export function SidebarItem({
  icon,
  label,
  active = false,
  disabled = false,
  onClick,
  className,
  badge,
  expanded,
  showCaret = false,
  title,
}: SidebarItemProps) {
  const railCollapsed = useSidebarRailCollapsed();
  const tooltip = title ?? label;

  const caret =
    showCaret && expanded !== undefined && !railCollapsed
      ? getIcon(expanded ? "collapse" : "expand")
      : null;

  const classNames = mergeClassNames(
    sidebarNavItem,
    !disabled && sidebarNavItemHover,
    !disabled && sidebarNavItemPressed,
    disabled && sidebarNavItemDisabled,
    active && sidebarNavItemActive,
    railCollapsed && "justify-center px-1.5",
    className
  );

  const content = (
    <>
      <span
        className={mergeClassNames(
          "flex min-w-0 items-center gap-1.5",
          railCollapsed && "min-w-0 justify-center"
        )}
      >
        {icon ? (
          <span aria-hidden>{getIcon(icon)}</span>
        ) : railCollapsed ? (
          <span aria-hidden>{getIcon("library")}</span>
        ) : null}
        <span
          className={mergeClassNames(
            "truncate",
            railCollapsed && "sr-only"
          )}
        >
          {label}
        </span>
      </span>
      <span
        className={mergeClassNames(
          "flex shrink-0 items-center gap-1",
          railCollapsed && "hidden"
        )}
      >
        {badge}
        {caret != null ? (
          <span
            className="text-[10px] text-[var(--app-text-muted)]"
            aria-hidden
          >
            {caret}
          </span>
        ) : null}
        {disabled && !badge ? (
          <span className="text-xs text-[var(--app-text-muted)]">Inactivo</span>
        ) : null}
      </span>
    </>
  );

  if (disabled) {
    return (
      <div
        className={classNames}
        aria-disabled={true}
        title={tooltip}
      >
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames}
      title={tooltip}
      aria-label={railCollapsed ? label : undefined}
      aria-expanded={showCaret ? expanded : undefined}
      aria-current={active ? "true" : undefined}
    >
      {content}
    </button>
  );
}
