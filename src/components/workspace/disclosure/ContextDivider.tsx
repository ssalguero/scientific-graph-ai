/** UX-2.15 — Hairline separator between primary and contextual content. */
export type ContextDividerProps = {
  className?: string;
};

/**
 * UX-2.15 — Presentational divider only.
 */
export function ContextDivider({ className }: ContextDividerProps) {
  return (
    <hr
      aria-hidden
      className={
        className ??
        "my-2 border-0 border-t border-[var(--app-border)] opacity-80"
      }
    />
  );
}
