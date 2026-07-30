/**
 * UX-2.16 — Surface visual SSOT.
 * All radius / padding / gap / border / variant / tone / accent maps live here.
 * Primitives must look up keys — never hardcode local Tailwind maps.
 */
export const SURFACE_TOKENS = {
  radius: {
    default: "rounded-md",
    canvas: "rounded-lg",
  },
  padding: {
    none: "",
    sm: "p-1.5",
    md: "p-2.5",
  },
  gap: {
    sm: "gap-1.5",
    md: "gap-2",
  },
  border: {
    default: "border border-[var(--app-border)]",
    none: "border-0",
  },
  mutedOpacity: "opacity-70",
  elevated: "shadow-sm",
  variant: {
    default:
      "relative bg-[var(--app-surface)] text-[var(--app-text)]",
    explorer:
      "relative bg-[var(--app-surface)] text-[var(--app-text)]",
    inspector:
      "relative bg-[var(--app-surface)] text-[var(--app-text)]",
    console:
      "relative bg-[var(--app-surface)] text-[var(--app-text)]",
    canvas:
      "relative bg-transparent text-[var(--app-text)]",
  },
  tone: {
    default: "text-[var(--app-text-muted)]",
    explorer: "text-sky-600 dark:text-sky-400",
    inspector: "text-violet-600 dark:text-violet-400",
    console: "text-emerald-600 dark:text-emerald-400",
  },
  accent: {
    base: "pointer-events-none absolute bg-current",
    position: {
      none: "hidden",
      left: "inset-y-1 left-0 w-0.5 rounded-full",
      top: "inset-x-1 top-0 h-0.5 rounded-full",
    },
    tone: {
      default: "text-[var(--app-accent)]",
      explorer: "text-sky-500/80",
      inspector: "text-violet-500/80",
      console: "text-emerald-500/80",
    },
  },
  divider: {
    base: "border-0 border-t border-[var(--app-border)]",
    spacing: {
      sm: "my-1.5",
      md: "my-2.5",
    },
    muted: "opacity-60",
  },
  metadata: {
    root: "text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--app-text-muted)]",
  },
  iconSlot: {
    base: "inline-flex shrink-0 items-center justify-center",
    size: {
      sm: "h-4 w-4 text-[10px]",
      md: "h-5 w-5 text-xs",
    },
  },
  identityRow: "mb-2 flex items-center gap-1.5 pl-2.5",
  contentInset: "pl-2.5",
} as const;
