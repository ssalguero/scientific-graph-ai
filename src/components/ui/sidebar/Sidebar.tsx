"use client";

import { useState, type ReactNode } from "react";

import { HistoryPanel } from "@/components/project-activity";
import { RecentProjectsPanel } from "@/components/history";
import { SettingsPanel } from "@/components/settings";
import { LocalProjectsPanel } from "@/app/LocalProjectsPanel";
import { ProjectScientificFilePanel } from "@/app/ProjectScientificFilePanel";
import { getIcon, type UiIconName } from "@/lib/ui/icons";
import {
  contentPanel,
  panelHeading,
  sidebarBtnPrimary,
  sidebarBtnSecondary,
  sidebarCollapseToggle,
  sidebarDivider,
  sidebarGraphItemActive,
  sidebarGraphItemIdle,
  sidebarHeader,
  sidebarRailHide,
  sidebarRailSectionWrap,
  sidebarSectionGap,
  sidebarSectionGapCollapsed,
  sidebarShellCollapsed,
  sidebarShellExpanded,
  sidebarSoonBadge,
} from "@/lib/ui/theme";
import { mergeClassNames } from "../classNames";
import { SidebarFooter } from "./SidebarFooter";
import {
  SidebarGroup,
  SidebarGroupHint,
  SidebarGroupLabel,
} from "./SidebarGroup";
import {
  SidebarItem,
  SidebarRailCollapsedContext,
  useSidebarRailCollapsed,
} from "./SidebarItem";
import { SidebarSection } from "./SidebarSection";
import type { SidebarModuleEntry, SidebarProps } from "./types";

/** Additive chrome props (D46.3) — optional; do not break SidebarProps callers. */
type SidebarChromeProps = {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
};

const MODULE_ICON_BY_ID: Record<string, UiIconName> = {
  basic: "visualization",
  mathematics: "mathematics",
  statistics: "statistics",
  inference: "inference",
  assistant: "advisor",
  reports: "reports",
};

function SidebarModuleCard({ module }: { module: SidebarModuleEntry }) {
  const railCollapsed = useSidebarRailCollapsed();
  const iconName = MODULE_ICON_BY_ID[module.id] ?? "modules";

  return (
    <button
      type="button"
      onClick={module.onToggle}
      aria-pressed={module.enabled}
      title={module.description || module.name}
      aria-label={module.name}
      className={`${contentPanel} flex w-full items-center justify-between gap-2 py-1 px-2 text-left border ${
        module.enabled
          ? "border-[var(--app-accent)]/30 bg-[var(--app-accent)]/5"
          : "border-[var(--app-border)] opacity-85 hover:opacity-100"
      } ${railCollapsed ? "justify-center px-1" : ""}`}
    >
      <span
        className={`flex items-center gap-1.5 min-w-0 ${
          railCollapsed ? "justify-center" : ""
        }`}
      >
        <span className="text-sm leading-none shrink-0" aria-hidden>
          {getIcon(iconName)}
        </span>
        <span
          className={`text-xs font-semibold text-[var(--app-heading)] truncate ${
            railCollapsed ? "sr-only" : ""
          }`}
        >
          {module.name}
        </span>
        {module.badgeLabel && !railCollapsed ? (
          <span className={sidebarSoonBadge}>{module.badgeLabel}</span>
        ) : null}
      </span>
      {!railCollapsed ? (
        <span
          className={`shrink-0 inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${
            module.enabled
              ? "border border-[var(--app-accent)]/40 text-[var(--app-accent)] bg-[var(--app-accent)]/10"
              : "border border-[var(--app-border)] text-[var(--app-text-muted)]"
          }`}
        >
          {module.enabled ? "Activo" : "Inactivo"}
        </span>
      ) : null}
    </button>
  );
}

function RailLabel({ children }: { children: ReactNode }) {
  const railCollapsed = useSidebarRailCollapsed();
  return (
    <span className={railCollapsed ? sidebarRailHide : undefined}>
      {children}
    </span>
  );
}

export function Sidebar({
  className,
  onNewCurve,
  onClearCurves,
  graphLibraryOpen,
  onToggleGraphLibrary,
  graphs,
  graphLabels,
  selectedGraphId,
  onLoadGraph,
  projectPanelRef,
  highlightProjectPanel,
  projectFilePanelProps,
  projectActivityOpen,
  onToggleProjectActivity,
  projectHistoryEntries,
  localProjectsPanelProps,
  onResetProject,
  modules,
  activeModuleCount,
  modulesTotal,
  isAssistantEnabled,
  isReportsEnabled,
  onOpenAssistant,
  onOpenReports,
  onOpenFunctionLibrary,
  recentProjectsOpen,
  onToggleRecentProjects,
  recentProjectsPanelProps,
  settingsOpen,
  onToggleSettings,
  settingsPanelProps,
  collapsed: collapsedProp,
  onCollapsedChange,
}: SidebarProps & SidebarChromeProps) {
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(false);
  const railCollapsed = collapsedProp ?? uncontrolledCollapsed;

  const setRailCollapsed = (next: boolean) => {
    onCollapsedChange?.(next);
    if (collapsedProp === undefined) {
      setUncontrolledCollapsed(next);
    }
  };

  const shell = railCollapsed ? sidebarShellCollapsed : sidebarShellExpanded;
  const bodyGap = railCollapsed
    ? sidebarSectionGapCollapsed
    : sidebarSectionGap;

  return (
    <SidebarRailCollapsedContext.Provider value={railCollapsed}>
      <aside
        className={mergeClassNames(shell, className)}
        data-rail={railCollapsed ? "collapsed" : "expanded"}
      >
        <div
          className={mergeClassNames(
            sidebarHeader,
            railCollapsed && "flex-col px-1.5 justify-center"
          )}
        >
          {railCollapsed ? (
            <span
              className="text-sm leading-none"
              aria-hidden
              title="Dashboard Científico"
            >
              {getIcon("dashboard")}
            </span>
          ) : (
            <h2 className={`${panelHeading} text-sm min-w-0 flex-1 truncate`}>
              {getIcon("dashboard")} Dashboard Científico
            </h2>
          )}
          <button
            type="button"
            className={sidebarCollapseToggle}
            aria-label={
              railCollapsed
                ? "Expandir barra lateral"
                : "Colapsar barra lateral"
            }
            aria-pressed={railCollapsed}
            onClick={() => setRailCollapsed(!railCollapsed)}
          >
            <span aria-hidden>
              {railCollapsed ? getIcon("expand") : getIcon("collapse")}
            </span>
          </button>
        </div>

        <div className={bodyGap}>
          <SidebarGroup
            label={
              <RailLabel>
                <SidebarGroupLabel badge="NUBE" badgeTitle="Biblioteca en nube">
                  Visualización
                </SidebarGroupLabel>
              </RailLabel>
            }
            hint={
              <RailLabel>
                <SidebarGroupHint>
                  Gráfico y=f(x) en biblioteca en nube. No incluye dataset ni
                  proyecto .sgproj.
                </SidebarGroupHint>
              </RailLabel>
            }
          >
            <button
              type="button"
              onClick={onNewCurve}
              className={sidebarBtnPrimary}
              title="Vacía el constructor de curvas. No borra datos experimentales ni proyecto."
              aria-label="Nueva curva"
            >
              {railCollapsed ? getIcon("add") : "+ Nueva curva"}
            </button>
            <button
              type="button"
              onClick={onClearCurves}
              className={sidebarBtnSecondary}
              title="Vacía las expresiones del constructor. No borra datos experimentales ni proyecto."
              aria-label="Vaciar curvas"
            >
              {railCollapsed ? getIcon("remove") : "Vaciar curvas"}
            </button>
            <SidebarItem
              icon="library"
              label={`Biblioteca (${graphs.length})`}
              onClick={onToggleGraphLibrary}
              showCaret
              expanded={graphLibraryOpen}
              active={graphLibraryOpen}
            />
            {graphLibraryOpen && !railCollapsed ? (
              <div className="space-y-1 max-h-36 overflow-y-auto pr-0.5">
                {graphs.length === 0 ? (
                  <p className="text-[11px] text-[var(--app-text-muted)] px-1">
                    Sin gráficos guardados en nube.
                  </p>
                ) : (
                  graphs.map((graph, index) => (
                    <button
                      key={graph.id}
                      type="button"
                      onClick={() => onLoadGraph(graph)}
                      className={`w-full text-left border rounded-md px-2 py-1.5 text-xs sm:text-sm transition-all duration-200 ${
                        selectedGraphId === graph.id
                          ? sidebarGraphItemActive
                          : sidebarGraphItemIdle
                      }`}
                    >
                      <span className="line-clamp-2">{graphLabels[index]}</span>
                    </button>
                  ))
                )}
              </div>
            ) : null}
          </SidebarGroup>

          <div className={sidebarDivider} />

          <SidebarGroup
            label={
              <RailLabel>
                <SidebarGroupLabel
                  badge=".SGPROJ"
                  badgeTitle="Archivo de proyecto"
                >
                  Proyecto
                </SidebarGroupLabel>
              </RailLabel>
            }
            hint={
              <RailLabel>
                <SidebarGroupHint>
                  Archivo .sgproj con dataset, análisis y curvas. Distinto de la
                  biblioteca de gráficos en nube.
                </SidebarGroupHint>
              </RailLabel>
            }
          >
            <div
              ref={projectPanelRef}
              className={
                highlightProjectPanel && !railCollapsed
                  ? "rounded-lg ring-2 ring-[var(--app-accent)]/50 bg-[var(--app-accent)]/5 p-2 -mx-0.5 transition-all duration-300"
                  : undefined
              }
            >
              {!railCollapsed ? (
                <ProjectScientificFilePanel {...projectFilePanelProps} />
              ) : null}
              <SidebarItem
                icon="activity"
                label="Actividad del proyecto"
                onClick={onToggleProjectActivity}
                showCaret
                expanded={projectActivityOpen}
                active={projectActivityOpen}
                className={railCollapsed ? undefined : "mt-1.5"}
              />
              {projectActivityOpen && !railCollapsed ? (
                <HistoryPanel
                  entries={projectHistoryEntries}
                  className="mt-1"
                />
              ) : null}
              {!railCollapsed ? (
                <LocalProjectsPanel {...localProjectsPanelProps} />
              ) : null}
            </div>
            <button
              type="button"
              onClick={onResetProject}
              className={sidebarBtnSecondary}
              title="Reinicia la sesión completa (igual que Nuevo proyecto): datos, análisis y curvas."
              aria-label="Restablecer proyecto"
            >
              {railCollapsed ? getIcon("remove") : "Restablecer proyecto"}
            </button>
          </SidebarGroup>

          <div className={sidebarDivider} />

          <div className={railCollapsed ? sidebarRailSectionWrap : undefined}>
            <SidebarSection title="Científico" icon="modules" defaultOpen={false}>
              {!railCollapsed ? (
                <p className="text-[11px] text-[var(--app-text-muted)] mb-1">
                  Módulos activos: {activeModuleCount} de {modulesTotal}
                </p>
              ) : null}
              <div className="space-y-1">
                {modules.map((module) => (
                  <SidebarModuleCard key={module.id} module={module} />
                ))}
              </div>
            </SidebarSection>
          </div>

          <div className={railCollapsed ? sidebarRailSectionWrap : undefined}>
            <SidebarSection title="Análisis" icon="advisor" defaultOpen={false}>
              {isAssistantEnabled ? (
                <SidebarItem
                  icon="advisor"
                  label="Asistente científico"
                  onClick={onOpenAssistant}
                  badge={
                    railCollapsed ? undefined : (
                      <span className={sidebarSoonBadge}>Beta</span>
                    )
                  }
                />
              ) : (
                <SidebarItem
                  icon="advisor"
                  label="Asistente científico"
                  disabled
                />
              )}
              {isReportsEnabled ? (
                <SidebarItem
                  icon="reports"
                  label="Reportes"
                  onClick={onOpenReports}
                />
              ) : (
                <SidebarItem icon="reports" label="Reportes" disabled />
              )}
            </SidebarSection>
          </div>

          <div className={railCollapsed ? sidebarRailSectionWrap : undefined}>
            <SidebarSection title="Recursos" icon="library" defaultOpen={false}>
              <SidebarItem
                icon="library"
                label="Biblioteca de funciones"
                onClick={onOpenFunctionLibrary}
              />
              <SidebarItem
                icon="history"
                label="Historial"
                onClick={onToggleRecentProjects}
                showCaret
                expanded={recentProjectsOpen}
                active={recentProjectsOpen}
              />
              {recentProjectsOpen && !railCollapsed ? (
                <RecentProjectsPanel
                  {...recentProjectsPanelProps}
                  className="mt-1"
                />
              ) : null}
            </SidebarSection>
          </div>

          <SidebarFooter>
            <div className={railCollapsed ? sidebarRailSectionWrap : undefined}>
              <SidebarSection title="Ajustes" icon="settings" defaultOpen>
                <SidebarItem
                  icon="settings"
                  label="Configuración"
                  onClick={onToggleSettings}
                  showCaret
                  expanded={settingsOpen}
                  active={settingsOpen}
                />
                {settingsOpen && !railCollapsed ? (
                  <SettingsPanel {...settingsPanelProps} className="mt-1" />
                ) : null}
              </SidebarSection>
            </div>
          </SidebarFooter>
        </div>
      </aside>
    </SidebarRailCollapsedContext.Provider>
  );
}
