import type { ReactNode, RefObject } from "react";

import type { ProjectHistoryEntry } from "@/lib/project-history";
import type { UiIconName } from "@/lib/ui/icons";
import type { RecentProjectsPanelProps } from "@/components/history";
import type { SettingsPanelProps } from "@/components/settings";
import type { LocalProjectsPanelProps } from "@/app/LocalProjectsPanel";
import type { ProjectScientificFilePanelProps } from "@/app/ProjectScientificFilePanel";

export type SidebarGraphEntry = {
  id: string;
};

export type SidebarModuleEntry = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  badgeLabel?: string;
  onToggle: () => void;
};

export type SidebarProps = {
  className?: string;

  onNewCurve: () => void;
  onClearCurves: () => void;
  graphLibraryOpen: boolean;
  onToggleGraphLibrary: () => void;
  graphs: readonly SidebarGraphEntry[];
  graphLabels: readonly string[];
  selectedGraphId: string | null;
  onLoadGraph: (graph: SidebarGraphEntry) => void;

  projectPanelRef: RefObject<HTMLDivElement | null>;
  highlightProjectPanel: boolean;
  projectFilePanelProps: ProjectScientificFilePanelProps;
  projectActivityOpen: boolean;
  onToggleProjectActivity: () => void;
  projectHistoryEntries: readonly ProjectHistoryEntry[];
  localProjectsPanelProps: LocalProjectsPanelProps;
  onResetProject: () => void;

  modules: readonly SidebarModuleEntry[];
  activeModuleCount: number;
  modulesTotal: number;

  isAssistantEnabled: boolean;
  isReportsEnabled: boolean;
  onOpenAssistant: () => void;
  onOpenReports: () => void;

  onOpenFunctionLibrary: () => void;
  recentProjectsOpen: boolean;
  onToggleRecentProjects: () => void;
  recentProjectsPanelProps: RecentProjectsPanelProps;

  settingsOpen: boolean;
  onToggleSettings: () => void;
  settingsPanelProps: SettingsPanelProps;
};

export type SidebarSectionProps = {
  title: string;
  icon: UiIconName;
  children: ReactNode;
  defaultOpen?: boolean;
  collapsed?: boolean;
  className?: string;
};

export type SidebarGroupProps = {
  children: ReactNode;
  className?: string;
  label?: ReactNode;
  hint?: ReactNode;
};

export type SidebarItemProps = {
  icon?: UiIconName;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  badge?: ReactNode;
  expanded?: boolean;
  showCaret?: boolean;
  title?: string;
};

export type SidebarFooterProps = {
  children: ReactNode;
  className?: string;
};
