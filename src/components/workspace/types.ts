import type { ReactNode } from "react";

import type { ThemeMode } from "@/lib/app-preferences";

/** Frozen public API — D47.1 Workspace API Freeze. No breaking changes during D47. */
export type WorkspaceLayoutProps = {
  themeMode?: ThemeMode;
  sidebar: ReactNode;
  workspace: ReactNode;
  panels?: ReactNode;
  className?: string;
};

/** Frozen public API — D47.1 Workspace API Freeze. No breaking changes during D47. */
export type WorkspaceContentProps = {
  toolbar?: ReactNode;
  workspace: ReactNode;
};

/** Frozen public API — D47.1 Workspace API Freeze. No breaking changes during D47. */
export type WorkspacePanelsProps = {
  children?: ReactNode;
};
