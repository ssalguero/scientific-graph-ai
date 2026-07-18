import type { HTMLAttributes, ReactNode } from "react";

import { panelHeading, panelHeadingSubtext } from "@/lib/ui/theme";
import { mergeClassNames } from "../classNames";

export type SectionTitleProps = {
  children?: ReactNode;
  subtitle?: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export function SectionTitle({
  children,
  subtitle,
  className,
  ...rest
}: SectionTitleProps) {
  return (
    <div className={mergeClassNames(className)} {...rest}>
      <h3 className={panelHeading}>{children}</h3>
      {subtitle != null && subtitle !== false ? (
        <p className={panelHeadingSubtext}>{subtitle}</p>
      ) : null}
    </div>
  );
}
