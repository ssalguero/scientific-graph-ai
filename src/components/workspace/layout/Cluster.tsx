import type { ReactNode } from "react";

import { Inline } from "./Inline";
import type { InlineProps } from "./Inline";

/**
 * UX-2.26 — Cluster compose primitive (badges / chips / actions).
 * Frozen public API independent of Inline (may compose Inline internally).
 * Official defaults: gap=sm · align=center · justify=start · wrap=wrap.
 * Compose-only. No hooks / Context / app imports.
 */
export type ClusterProps = {
  gap?: InlineProps["gap"];
  align?: InlineProps["align"];
  justify?: InlineProps["justify"];
  wrap?: InlineProps["wrap"];
  children?: ReactNode;
  className?: string;
};

export function Cluster({
  gap = "sm",
  align = "center",
  justify = "start",
  wrap = "wrap",
  children,
  className,
}: ClusterProps) {
  return (
    <Inline
      gap={gap}
      align={align}
      justify={justify}
      wrap={wrap}
      className={className}
    >
      {children}
    </Inline>
  );
}
