/**
 * UX-2.16 — Surface visual SSOT.
 * All radius / padding / gap / border / variant / tone / accent maps live here.
 * Primitives must look up keys — never hardcode local Tailwind maps.
 */
export const SURFACE_TOKENS = {
  radius: {
    default: "rounded-[var(--radius-container)]",
    canvas: "rounded-[var(--radius-control)]",
  },
  padding: {
    none: "",
    sm: "p-1.5",
    md: "p-[var(--spacing-tight)]",
  },
  gap: {
    sm: "gap-1.5",
    md: "gap-[var(--spacing-tight)]",
  },
  border: {
    default: "border border-[var(--color-border-default)]",
    none: "border-0",
  },
  mutedOpacity: "opacity-70",
  elevated: "shadow-[var(--elevation-card)]",
  variant: {
    default:
      "relative bg-[var(--color-surface-default)] text-[var(--color-text-primary)]",
    explorer:
      "relative bg-[var(--color-surface-default)] text-[var(--color-text-primary)]",
    inspector:
      "relative bg-[var(--color-surface-default)] text-[var(--color-text-primary)]",
    console:
      "relative bg-[var(--color-surface-default)] text-[var(--color-text-primary)]",
    canvas:
      "relative bg-transparent text-[var(--color-text-primary)]",
  },
  tone: {
    default: "text-[var(--color-text-muted)]",
    explorer: "text-[var(--color-feedback-info)]",
    inspector: "text-[var(--color-brand-primary)]",
    console: "text-[var(--color-feedback-success)]",
  },
  accent: {
    base: "pointer-events-none absolute bg-current",
    position: {
      none: "hidden",
      left: "inset-y-1 left-0 w-0.5 rounded-[var(--radius-pill)]",
      top: "inset-x-1 top-0 h-0.5 rounded-[var(--radius-pill)]",
    },
    tone: {
      default: "text-[var(--color-brand-primary)]",
      explorer: "text-[var(--color-feedback-info)]/80",
      inspector: "text-[var(--color-brand-primary)]/80",
      console: "text-[var(--color-feedback-success)]/80",
    },
  },
  divider: {
    base: "border-0 border-t border-[var(--color-border-default)]",
    spacing: {
      sm: "my-1.5",
      md: "my-2.5",
    },
    muted: "opacity-60",
  },
  metadata: {
    root: "text-[length:var(--typography-caption-xs-font-size)] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]",
  },
  iconSlot: {
    base: "inline-flex shrink-0 items-center justify-center",
    size: {
      sm: "h-4 w-4 text-[length:var(--typography-caption-xs-font-size)]",
      md: "h-5 w-5 text-[length:var(--typography-label-sm-font-size)]",
    },
  },
  contentInset: "pl-2.5",
  /**
   * UX-2.17 — Composition density keys.
   * Visually equivalent to existing gap/padding/divider density.
   * Any meaningful visual change is a bug — do not redesign density here.
   * UX-2.21 — sectionGap consumed by PanelContentSection (reachability).
   */
  workspaceGap: {
    sm: "gap-1.5",
    md: "gap-[var(--spacing-tight)]",
  },
  sectionGap: {
    sm: "gap-1.5",
    md: "gap-[var(--spacing-tight)]",
  },
  groupGap: {
    sm: "gap-1.5",
    md: "gap-[var(--spacing-tight)]",
  },
  dividerColor: "border-0 border-t border-[var(--color-border-default)]",
  dividerMuted: "opacity-60",
  dividerInset: {
    none: "",
    sm: "mx-1.5",
    md: "mx-[var(--spacing-compact)]",
  },
  sectionPadding: {
    none: "",
    sm: "p-1.5",
    md: "p-[var(--spacing-compact)]",
  },
  spacer: {
    none: "",
    sm: "h-1.5",
    md: "h-2.5",
  },
} as const;
