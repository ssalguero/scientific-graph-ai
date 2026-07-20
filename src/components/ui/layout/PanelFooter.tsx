import type { HTMLAttributes, ReactNode } from "react";

import { UI_TOKENS } from "@/lib/ui/tokens";
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
      className={mergeClassNames(
        UI_TOKENS.spacing.mt1,
        UI_TOKENS.button.actionBarGroup,
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
