import type { HTMLAttributes } from "react";

import { sidebarDivider } from "@/lib/ui/theme";
import { mergeClassNames } from "../classNames";

export type DividerProps = HTMLAttributes<HTMLDivElement>;

export function Divider({ className, ...rest }: DividerProps) {
  return (
    <div
      role="separator"
      className={mergeClassNames(sidebarDivider, className)}
      {...rest}
    />
  );
}
