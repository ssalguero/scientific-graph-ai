"use client";

const bannerClassName =
  "rounded-md border border-[var(--app-accent)]/20 bg-[var(--app-surface-muted)] px-2 py-1.5 text-[10px] leading-snug text-[var(--app-text-muted)] transition-colors duration-200";

export type PdfExportVisibilityBannerProps = {
  shortMessage: string;
  longMessage: string;
  hidden?: boolean;
  className?: string;
};

export function PdfExportVisibilityBanner({
  shortMessage,
  longMessage,
  hidden = false,
  className,
}: PdfExportVisibilityBannerProps) {
  if (hidden) {
    return null;
  }

  const panelClassName = className
    ? `${bannerClassName} ${className}`
    : bannerClassName;

  return (
    <aside
      className={panelClassName}
      role="note"
      aria-label="Información sobre exportación PDF y visibilidad de paneles"
    >
      <p className="font-medium text-[var(--app-text)]">{shortMessage}</p>
      <p className="mt-1">{longMessage}</p>
    </aside>
  );
}
