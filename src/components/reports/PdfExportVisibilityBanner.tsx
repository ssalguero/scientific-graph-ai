"use client";

const bannerClassName =
  "rounded-md border border-[var(--color-brand-primary)]/20 bg-[var(--color-surface-canvas)] px-2 py-1.5 text-[10px] leading-snug text-[var(--color-text-muted)] transition-colors duration-200";

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
      <p className="font-medium text-[var(--color-text-primary)]">{shortMessage}</p>
      <p className="mt-1">{longMessage}</p>
    </aside>
  );
}
