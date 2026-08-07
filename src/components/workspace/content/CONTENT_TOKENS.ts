/**
 * UX-2.22 — Content grammar SSOT (compose-only).
 * Reuses existing Tailwind / Design System --color-* utilities already owned by
 * SURFACE / LAYOUT / SEMANTIC / ACTION / ICON tokens.
 * MUST NOT invent colors, spacing, or radii.
 * MUST NOT duplicate SURFACE_TOKENS / LAYOUT_TOKENS / SEMANTIC_TOKENS /
 * ACTION_TOKENS / ICON_TOKENS as a parallel design system.
 */
export const CONTENT_TOKENS = {
  /** Alias of SURFACE_TOKENS.groupGap / LAYOUT contentGap. */
  groupGap: {
    sm: "gap-1.5",
    md: "gap-[var(--spacing-tight)]",
  },
  /** ContentGroup root — flex column (composition groupGap supplies spacing). */
  groupRoot: "flex flex-col",
  /** ContentRow — horizontal alignment + distribution. */
  rowRoot: "flex flex-row items-center",
  rowGap: {
    sm: "gap-1.5",
    md: "gap-[var(--spacing-tight)]",
  },
  rowDistribute: "justify-between",
  /** KeyValue — label/value pair (SEMANTIC muted + type scale). Layout via Inline. */
  keyValueRoot: "",
  keyValueLabel:
    "text-[length:var(--typography-caption-xs-font-size)] font-medium text-[var(--color-text-muted)] opacity-70",
  keyValueValue:
    "text-[length:var(--typography-caption-xs-font-size)] text-[var(--color-text-primary)]",
  /**
   * Description — EmptyDescription vocabulary (max-w + text-xs + muted).
   * Alias of SEMANTIC_TOKENS.MUTED_TEXT + existing empty description scale.
   */
  description:
    "max-w-[16rem] text-[length:var(--typography-body-sm-font-size)] leading-[var(--typography-body-sm-line-height)] text-[var(--color-text-muted)]",
  /**
   * Notice variants — compose SEMANTIC infoRoot + StatusBadge Design System tones.
   * info mirrors SEMANTIC_TOKENS.infoRoot exactly (pixel parity).
   */
  notice: {
    info: "rounded-[var(--radius-container)] border border-[var(--color-border-default)] p-1.5 text-[length:var(--typography-caption-xs-font-size)] text-[var(--color-text-muted)]",
    warning:
      "rounded-[var(--radius-container)] border border-[color-mix(in srgb, var(--color-feedback-warning) 35%, var(--color-border-default))] bg-[color-mix(in srgb, var(--color-feedback-warning) 16%, var(--color-surface-default))] p-1.5 text-[length:var(--typography-caption-xs-font-size)] text-[var(--color-feedback-warning)]",
    success:
      "rounded-[var(--radius-container)] border border-[var(--color-feedback-success)]/35 bg-[color-mix(in srgb, var(--color-feedback-success) 16%, var(--color-surface-default))] p-1.5 text-[length:var(--typography-caption-xs-font-size)] text-[var(--color-feedback-success)]",
    danger:
      "rounded-[var(--radius-container)] border border-[var(--color-border-danger)] bg-[color-mix(in srgb, var(--color-feedback-danger) 14%, var(--color-surface-default))] p-1.5 text-[length:var(--typography-caption-xs-font-size)] text-[var(--color-feedback-danger)]",
  },
  /**
   * Content EmptyState — title + description only (no icon / action).
   * Layout via Stack; emptyTitle aliases EmptyTitle vocabulary.
   */
  emptyRoot: "",
  emptyGap: "gap-1.5",
  emptyTitle:
    "text-[length:var(--typography-body-sm-font-size)] font-medium text-[var(--color-text-primary)]",
  /**
   * DividerContent — SURFACE_TOKENS.divider vocabulary (not Toolbar divider).
   */
  divider: {
    base: "border-0 border-t border-[var(--color-border-default)]",
    spacing: "my-[var(--spacing-compact)]",
    muted: "opacity-60",
  },
} as const;
