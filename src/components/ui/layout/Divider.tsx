import type { HTMLAttributes } from "react";

import { UI_TOKENS } from "@/lib/ui/tokens";
import { mergeClassNames } from "../classNames";

export type DividerProps = HTMLAttributes<HTMLDivElement>;

export function Divider({ className, ...rest }: DividerProps) {
  return (
    <div
      role="separator"
      className={mergeClassNames(UI_TOKENS.sidebar.divider, className)}
      {...rest}
    />
  );
}
