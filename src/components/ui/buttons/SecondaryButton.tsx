"use client";

import { getButtonVariant } from "@/lib/ui/theme";
import {
  getButtonSizeClassName,
  mergeClassNames,
  type UiButtonProps,
} from "./types";

export type SecondaryButtonProps = UiButtonProps;

export function SecondaryButton({
  children,
  className,
  size = "md",
  type = "button",
  ...rest
}: SecondaryButtonProps) {
  return (
    <button
      type={type}
      className={mergeClassNames(
        getButtonVariant(size === "sm" ? "outlineSm" : "secondary"),
        size === "sm" ? undefined : getButtonSizeClassName(size),
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
