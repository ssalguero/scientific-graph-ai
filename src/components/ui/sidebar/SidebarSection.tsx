"use client";

import { useState } from "react";

import { getIcon } from "@/lib/ui/icons";
import { UI_TOKENS } from "@/lib/ui/tokens";
import { mergeClassNames } from "../classNames";
import type { SidebarSectionProps } from "./types";

/** D48.3 — wired from UI_TOKENS.sidebar / transition / animation. */
const {
  divider: sidebarDivider,
  sectionBody: sidebarSectionBody,
  sectionHeader: sidebarSectionHeader,
} = UI_TOKENS.sidebar;

/**
 * Collapsible sidebar section — visual/behavior parity with former DashboardSection.
 * SectionTitle (D45.3) is not used here: it would change heading level/look.
 * D46.1: title chrome via theme helpers (spacing / uppercase / tracking).
 */
export function SidebarSection({
  title,
  icon,
  children,
  defaultOpen = false,
  collapsed,
  className,
}: SidebarSectionProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open =
    collapsed !== undefined ? !collapsed : uncontrolledOpen;

  return (
    <div className={mergeClassNames(sidebarDivider, className)}>
      <button
        type="button"
        onClick={() => {
          if (collapsed === undefined) {
            setUncontrolledOpen((current) => !current);
          }
        }}
        className={sidebarSectionHeader}
        aria-expanded={open}
      >
        <span
          className="w-3 text-xs text-[var(--app-text-muted)]"
          aria-hidden
        >
          {getIcon(open ? "collapse" : "expand")}
        </span>
        <span aria-hidden>{getIcon(icon)}</span>
        <span>{title}</span>
      </button>
      <div
        className={`grid ${UI_TOKENS.transition.all200} ${
          open
            ? UI_TOKENS.animation.gridCollapseOpen
            : UI_TOKENS.animation.gridCollapseClosed
        }`}
      >
        <div className="overflow-hidden">
          <div className={sidebarSectionBody}>{children}</div>
        </div>
      </div>
    </div>
  );
}
