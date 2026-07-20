import type { ReactNode } from "react";

/** Frozen public API — D49.1 Toolbar API Freeze. No breaking changes during D49. */
export type AdaptiveToolbarProps = {
  left: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  className?: string;
};

/** Frozen public API — D49.1 Toolbar API Freeze. No breaking changes during D49. */
export type ToolbarSectionProps = {
  children: ReactNode;
  align: "left" | "center" | "right";
};

/** Frozen public API — D49.1 Toolbar API Freeze. No breaking changes during D49. */
export type ToolbarGroupProps = {
  children: ReactNode;
  compact?: boolean;
};

/** Frozen public API — D49.1 Toolbar API Freeze. No breaking changes during D49. */
export type ToolbarActionProps = {
  children: ReactNode;
  disabled?: boolean;
  active?: boolean;
};

/** Frozen public API — D49.1 Toolbar API Freeze. No breaking changes during D49. */
export type ToolbarOverflowProps = {
  children: ReactNode;
};
