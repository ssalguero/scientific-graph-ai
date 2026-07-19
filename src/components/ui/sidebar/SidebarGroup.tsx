import {
  dataSemanticHint,
  persistenceBadge,
  sidebarSectionLabel,
  sidebarSectionSpacing,
} from "@/lib/ui/theme";
import { mergeClassNames } from "../classNames";
import type { SidebarGroupProps } from "./types";

export type SidebarGroupLabelProps = {
  children: React.ReactNode;
  badge?: string;
  badgeTitle?: string;
};

export function SidebarGroupLabel({
  children,
  badge,
  badgeTitle,
}: SidebarGroupLabelProps) {
  return (
    <p className={sidebarSectionLabel}>
      {children}
      {badge ? (
        <>
          {" "}
          <span className={persistenceBadge} title={badgeTitle}>
            {badge}
          </span>
        </>
      ) : null}
    </p>
  );
}

export function SidebarGroupHint({
  children,
}: {
  children: React.ReactNode;
}) {
  return <p className={dataSemanticHint}>{children}</p>;
}

export function SidebarGroup({
  children,
  className,
  label,
  hint,
}: SidebarGroupProps) {
  return (
    <div className={mergeClassNames(sidebarSectionSpacing, className)}>
      {label}
      {hint}
      {children}
    </div>
  );
}
