import type { ButtonHTMLAttributes, ReactNode } from "react";

import { mergeClassNames } from "../classNames";

export type ButtonSize = "sm" | "md";

export type UiButtonProps = {
  children?: ReactNode;
  size?: ButtonSize;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export { mergeClassNames };

/** Size composition only — variants come from getButtonVariant. */
export function getButtonSizeClassName(size: ButtonSize = "md"): string {
  if (size === "sm") {
    return "h-7 px-2 text-xs";
  }
  return "";
}
