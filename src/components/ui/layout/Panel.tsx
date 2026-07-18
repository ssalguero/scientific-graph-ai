import type { HTMLAttributes, ReactNode } from "react";

import {
  getPanelStyle,
  type PanelStyleVariant,
} from "@/lib/ui/theme";
import { mergeClassNames } from "../classNames";

export type PanelProps = {
  children?: ReactNode;
  variant?: PanelStyleVariant;
} & HTMLAttributes<HTMLElement>;

export function Panel({
  children,
  className,
  variant = "card",
  ...rest
}: PanelProps) {
  return (
    <section
      className={mergeClassNames(getPanelStyle(variant), className)}
      {...rest}
    >
      {children}
    </section>
  );
}
