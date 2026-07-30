/**
 * UX-2.22 — Content grammar SSOT (compose-only).
 * Reuses existing Tailwind / --app-* utilities already owned by
 * SURFACE / LAYOUT / SEMANTIC / ACTION / ICON tokens.
 * MUST NOT invent colors, spacing, or radii.
 * MUST NOT duplicate SURFACE_TOKENS / LAYOUT_TOKENS / SEMANTIC_TOKENS /
 * ACTION_TOKENS / ICON_TOKENS as a parallel design system.
 */
export const CONTENT_TOKENS = {
  /** Alias of SURFACE_TOKENS.groupGap / LAYOUT contentGap. */
  groupGap: {
    sm: "gap-1.5",
    md: "gap-2",
  },
  /** ContentGroup root — flex column (composition groupGap supplies spacing). */
  groupRoot: "flex flex-col",
  /** ContentRow — horizontal alignment + distribution. */
  rowRoot: "flex flex-row items-center",
  rowGap: {
    sm: "gap-1.5",
    md: "gap-2",
  },
  rowDistribute: "justify-between",
  /** KeyValue — label/value pair (SEMANTIC muted + type scale). */
  keyValueRoot: "flex items-baseline justify-between gap-2",
  keyValueLabel:
    "text-[10px] font-medium text-[var(--app-text-muted)] opacity-70",
  keyValueValue: "text-[10px] text-[var(--app-text)]",
  /**
   * Description — EmptyDescription vocabulary (max-w + text-xs + muted).
   * Alias of SEMANTIC_TOKENS.MUTED_TEXT + existing empty description scale.
   */
  description:
    "max-w-[16rem] text-xs leading-relaxed text-[var(--app-text-muted)]",
  /**
   * Notice variants — compose SEMANTIC infoRoot + StatusBadge --app-* tones.
   * info mirrors SEMANTIC_TOKENS.infoRoot exactly (pixel parity).
   */
  notice: {
    info: "border border-[var(--app-border)] p-1.5 text-[10px] text-[var(--app-text-muted)]",
    warning:
      "border border-[var(--app-warning-border)] bg-[var(--app-warning-bg)] p-1.5 text-[10px] text-[var(--app-warning-text)]",
    success:
      "border border-[var(--app-success)]/35 bg-[var(--app-success-bg)] p-1.5 text-[10px] text-[var(--app-success-text)]",
    danger:
      "border border-[var(--app-danger-border)] bg-[var(--app-danger-bg)] p-1.5 text-[10px] text-[var(--app-danger-text)]",
  },
  /**
   * Content EmptyState — title + description only (no icon / action).
   * emptyTitle aliases EmptyTitle vocabulary.
   */
  emptyRoot: "flex flex-col items-center",
  emptyGap: "gap-1.5",
  emptyTitle: "text-sm font-medium text-[var(--app-heading)]",
  /**
   * DividerContent — SURFACE_TOKENS.divider vocabulary (not Toolbar divider).
   */
  divider: {
    base: "border-0 border-t border-[var(--app-border)]",
    spacing: "my-2.5",
    muted: "opacity-60",
  },
} as const;
