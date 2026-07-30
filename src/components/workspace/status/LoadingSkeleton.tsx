/** UX-2.14 — CSS-only loading skeleton variants. */
export type LoadingSkeletonVariant = "text" | "list" | "table" | "properties";

export type LoadingSkeletonProps = {
  variant?: LoadingSkeletonVariant;
};

const bar =
  "rounded bg-[var(--app-surface-muted)] transition-[opacity,background-color] duration-150";

/**
 * UX-2.14 — Presentational skeleton placeholders.
 * aria-hidden; no libraries.
 */
export function LoadingSkeleton({
  variant = "text",
}: LoadingSkeletonProps) {
  return (
    <div
      aria-hidden
      className="flex w-full flex-col gap-1.5 opacity-80"
      data-skeleton-variant={variant}
    >
      {variant === "text" ? (
        <>
          <div className={`${bar} h-2.5 w-3/4`} />
          <div className={`${bar} h-2.5 w-full`} />
          <div className={`${bar} h-2.5 w-5/6`} />
        </>
      ) : null}
      {variant === "list" ? (
        <>
          <div className={`${bar} h-3 w-full`} />
          <div className={`${bar} h-3 w-full`} />
          <div className={`${bar} h-3 w-4/5`} />
          <div className={`${bar} h-3 w-full`} />
        </>
      ) : null}
      {variant === "table" ? (
        <>
          <div className="flex gap-1.5">
            <div className={`${bar} h-3 flex-1`} />
            <div className={`${bar} h-3 flex-1`} />
            <div className={`${bar} h-3 flex-1`} />
          </div>
          <div className="flex gap-1.5">
            <div className={`${bar} h-3 flex-1`} />
            <div className={`${bar} h-3 flex-1`} />
            <div className={`${bar} h-3 flex-1`} />
          </div>
          <div className="flex gap-1.5">
            <div className={`${bar} h-3 flex-1`} />
            <div className={`${bar} h-3 flex-1`} />
            <div className={`${bar} h-3 flex-1`} />
          </div>
        </>
      ) : null}
      {variant === "properties" ? (
        <>
          <div className="flex items-center gap-2">
            <div className={`${bar} h-2.5 w-16 shrink-0`} />
            <div className={`${bar} h-5 flex-1`} />
          </div>
          <div className="flex items-center gap-2">
            <div className={`${bar} h-2.5 w-16 shrink-0`} />
            <div className={`${bar} h-5 flex-1`} />
          </div>
          <div className="flex items-center gap-2">
            <div className={`${bar} h-2.5 w-16 shrink-0`} />
            <div className={`${bar} h-5 flex-1`} />
          </div>
        </>
      ) : null}
    </div>
  );
}
