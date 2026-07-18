import type { HTMLAttributes, ReactNode } from "react";

import { actionBarGroup } from "@/lib/ui/theme";
import { spacing } from "@/lib/ui/tokens";
import { mergeClassNames } from "../classNames";

export type PanelFooterProps = {
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export function PanelFooter({
  children,
  className,
  ...rest
}: PanelFooterProps) {
  return (
    <div
      className={mergeClassNames(spacing.mt1, actionBarGroup, className)}
      {...rest}
    >
      {children}
    </div>
  );
}
