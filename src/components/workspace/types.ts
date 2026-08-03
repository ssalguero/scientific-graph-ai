import type { ReactNode } from "react";

import type { ThemeMode } from "@/lib/app-preferences";

/** Frozen public API — D47.1 Workspace API Freeze. No breaking changes during D47. */
export type WorkspaceLayoutProps = {
  themeMode?: ThemeMode;
  toolbar?: ReactNode;
  sidebar: ReactNode;
  workspace: ReactNode;
  panels?: ReactNode;
  /** UX-4.6 — transparent Inspector Region slot (move-only forward). */
  inspector?: ReactNode;
  className?: string;
};

/** Frozen public API — D47.1 Workspace API Freeze. No breaking changes during D47. */
export type WorkspaceContentProps = {
  workspace: ReactNode;
};

/** Frozen public API — D47.1 Workspace API Freeze. No breaking changes during D47. */
export type WorkspacePanelsProps = {
  children?: ReactNode;
};
