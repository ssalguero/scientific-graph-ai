"use client";

import { getButtonVariant } from "@/lib/ui/theme";
import {
  getButtonSizeClassName,
  mergeClassNames,
  type UiButtonProps,
} from "./types";

export type DangerButtonProps = UiButtonProps;

export function DangerButton({
  children,
  className,
  size = "md",
  type = "button",
  ...rest
}: DangerButtonProps) {
  return (
    <button
      type={type}
      className={mergeClassNames(
        getButtonVariant("danger"),
        getButtonSizeClassName(size),
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
