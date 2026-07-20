"use client";

import { getButtonVariant } from "@/lib/ui/theme";
import { UI_TOKENS } from "@/lib/ui/tokens";
import { mergeClassNames, type UiButtonProps } from "./types";

export type IconButtonProps = UiButtonProps;

function getIconButtonSquareClassName(size: "sm" | "md" = "md"): string {
  return size === "sm"
    ? mergeClassNames("h-7 w-7", UI_TOKENS.spacing.px1, "justify-center")
    : mergeClassNames("h-9 w-9", UI_TOKENS.spacing.px2, "justify-center");
}

export function IconButton({
  children,
  className,
  size = "md",
  type = "button",
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={mergeClassNames(
        getButtonVariant("ghost"),
        getIconButtonSquareClassName(size),
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
