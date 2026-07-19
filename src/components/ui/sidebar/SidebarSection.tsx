"use client";

import { useState } from "react";

import { getIcon } from "@/lib/ui/icons";
import {
  sidebarDivider,
  sidebarSectionBody,
  sidebarSectionHeader,
} from "@/lib/ui/theme";
import { mergeClassNames } from "../classNames";
import type { SidebarSectionProps } from "./types";

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
        className={`grid transition-all duration-200 ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className={sidebarSectionBody}>{children}</div>
        </div>
      </div>
    </div>
  );
}
