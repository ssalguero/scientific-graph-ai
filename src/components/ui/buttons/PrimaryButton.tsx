"use client";

import { getButtonVariant } from "@/lib/ui/theme";
import {
  getButtonSizeClassName,
  mergeClassNames,
  type UiButtonProps,
} from "./types";

export type PrimaryButtonProps = UiButtonProps;

export function PrimaryButton({
  children,
  className,
  size = "md",
  type = "button",
  ...rest
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      className={mergeClassNames(
        getButtonVariant("primary"),
        getButtonSizeClassName(size),
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
