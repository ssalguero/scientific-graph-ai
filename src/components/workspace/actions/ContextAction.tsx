import { UI_TOKENS } from "@/lib/ui/tokens";

/**
 * UX-2.12 — Frozen item shape.
 * Do not add icon / variant / tooltip / color / size / danger / shortcut.
 */
export type ContextActionItem = {
  label: string;
  ariaLabel?: string;
  disabled?: boolean;
  onClick?: () => void;
};

/**
 * UX-2.12 — Single contextual action control (API via ContextActionItem).
 * Presentational only — no domain handlers required.
 */
export type ContextActionProps = ContextActionItem;

export function ContextAction({
  label,
  ariaLabel,
  disabled = false,
  onClick,
}: ContextActionProps) {
  return (
    <button
      type="button"
      className={`${UI_TOKENS.button.outlineSm} focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]/30 disabled:cursor-not-allowed disabled:opacity-50`}
      aria-label={ariaLabel ?? label}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
