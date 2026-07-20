import type { HTMLAttributes, ReactNode } from "react";

import { UI_TOKENS } from "@/lib/ui/tokens";
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
      <h3 className={UI_TOKENS.typography.panelHeading}>{children}</h3>
      {subtitle != null && subtitle !== false ? (
        <p className={UI_TOKENS.typography.panelHeadingSubtext}>{subtitle}</p>
      ) : null}
    </div>
  );
}
