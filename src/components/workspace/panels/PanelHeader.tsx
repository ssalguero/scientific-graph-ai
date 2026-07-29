/** UX-2.5 — Panel header: visible title only (no buttons / menus / icons). */
export type PanelHeaderProps = {
  title: string;
};

/**
 * UX-2.5 — Layout freeze: flex-none.
 */
export function PanelHeader({ title }: PanelHeaderProps) {
  return (
    <div className="flex-none border-b border-[var(--app-border)] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-[var(--app-text-muted)]">
        {title}
      </p>
    </div>
  );
}
