import type { HTMLAttributes, ReactNode } from "react";

import { UI_TOKENS } from "@/lib/ui/tokens";
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
      className={mergeClassNames(
        UI_TOKENS.spacing.spaceY05,
        UI_TOKENS.spacing.mb15,
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
