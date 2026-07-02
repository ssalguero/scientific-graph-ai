"use client";

const calloutClassName =
  "rounded-md border border-[var(--app-accent)]/20 bg-[var(--app-surface-muted)] px-2 py-1.5 text-[10px] leading-snug text-[var(--app-text-muted)] transition-colors duration-200";

export type MethodologyVisibilityCalloutProps = {
  message: string;
  hidden?: boolean;
  className?: string;
};

export function MethodologyVisibilityCallout({
  message,
  hidden = false,
  className,
}: MethodologyVisibilityCalloutProps) {
  if (hidden || message.trim().length === 0) {
    return null;
  }

  const panelClassName = className
    ? `${calloutClassName} ${className}`
    : calloutClassName;

  return (
    <aside
      className={panelClassName}
      role="note"
      aria-label="Información sobre cálculo, visualización y exportación"
    >
      <p>{message}</p>
    </aside>
  );
}
