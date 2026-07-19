"use client";

import { getIcon } from "@/lib/ui/icons";
import {
  sidebarNavItem,
  sidebarNavItemHover,
} from "@/lib/ui/theme";
import { mergeClassNames } from "../classNames";
import type { SidebarItemProps } from "./types";

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
  const caret =
    showCaret && expanded !== undefined
      ? getIcon(expanded ? "collapse" : "expand")
      : null;

  const classNames = mergeClassNames(
    sidebarNavItem,
    !disabled && sidebarNavItemHover,
    disabled && "opacity-60 cursor-not-allowed",
    active && "font-semibold",
    className
  );

  const content = (
    <>
      <span className="flex min-w-0 items-center gap-1.5">
        {icon ? (
          <span aria-hidden>{getIcon(icon)}</span>
        ) : null}
        <span className="truncate">{label}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1">
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
      <div className={classNames} aria-disabled title={title}>
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames}
      title={title}
      aria-expanded={showCaret ? expanded : undefined}
    >
      {content}
    </button>
  );
}
