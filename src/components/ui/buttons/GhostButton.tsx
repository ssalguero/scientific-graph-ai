"use client";

import { getButtonVariant } from "@/lib/ui/theme";
import {
  getButtonSizeClassName,
  mergeClassNames,
  type UiButtonProps,
} from "./types";

export type GhostButtonProps = UiButtonProps;

export function GhostButton({
  children,
  className,
  size = "md",
  type = "button",
  ...rest
}: GhostButtonProps) {
  return (
    <button
      type={type}
      className={mergeClassNames(
        getButtonVariant("ghost"),
        getButtonSizeClassName(size),
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
