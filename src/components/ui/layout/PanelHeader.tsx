import type { HTMLAttributes, ReactNode } from "react";

import { spacing } from "@/lib/ui/tokens";
import { mergeClassNames } from "../classNames";

export type PanelHeaderProps = {
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export function PanelHeader({
  children,
  className,
  ...rest
}: PanelHeaderProps) {
  return (
    <div
      className={mergeClassNames(spacing.spaceY05, spacing.mb15, className)}
      {...rest}
    >
      {children}
    </div>
  );
}
