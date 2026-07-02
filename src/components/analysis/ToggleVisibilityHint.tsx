"use client";

import { useId } from "react";

import type { VisibilityToggleKey } from "@/lib/scientific/visibility/types";

import { resolveToggleVisibilityHint } from "./resolve-toggle-visibility-hint";

const hintBadgeClassName =
  "inline-flex max-w-full items-center rounded border border-[var(--app-warning-border)] bg-[var(--app-warning-bg)] px-1.5 py-0.5 text-[10px] leading-tight text-[var(--app-warning-text)] transition-colors duration-200";

const visuallyHiddenClassName = "sr-only";

export type ToggleVisibilityHintProps = {
  toggleKey: VisibilityToggleKey;
  visible: boolean;
  disabled?: boolean;
  hidden?: boolean;
  className?: string;
};

export function ToggleVisibilityHint({
  toggleKey,
  visible,
  disabled = false,
  hidden = false,
  className,
}: ToggleVisibilityHintProps) {
  const descriptionId = useId();
  const hint = resolveToggleVisibilityHint({
    toggleKey,
    state: { [toggleKey]: visible },
    disabled,
  });

  if (hidden || !hint.shouldShowHint) {
    return null;
  }

  const badgeClassName = className
    ? `${hintBadgeClassName} ${className}`
    : hintBadgeClassName;

  return (
    <span className="inline-flex min-w-0 max-w-full">
      <span
        className={badgeClassName}
        role="note"
        title={hint.longMessage}
        aria-describedby={descriptionId}
        aria-label={hint.shortMessage}
      >
        {hint.shortMessage}
      </span>
      <span id={descriptionId} className={visuallyHiddenClassName}>
        {hint.longMessage}
      </span>
    </span>
  );
}
