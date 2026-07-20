import type { HTMLAttributes, ReactNode } from "react";

import { UI_TOKENS } from "@/lib/ui/tokens";
import { mergeClassNames } from "../classNames";

export type PanelBodyProps = {
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export function PanelBody({ children, className, ...rest }: PanelBodyProps) {
  return (
    <div
      className={mergeClassNames(UI_TOKENS.spacing.spaceY15, className)}
      {...rest}
    >
      {children}
    </div>
  );
}
