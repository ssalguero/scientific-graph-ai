"use client";

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
  sidebarDivider,
  sidebarGraphItemActive,
  sidebarGraphItemIdle,
  sidebarHeader,
  sidebarSectionGap,
  sidebarShell,
  sidebarSoonBadge,
} from "@/lib/ui/theme";
import { mergeClassNames } from "../classNames";
import { SidebarFooter } from "./SidebarFooter";
import {
  SidebarGroup,
  SidebarGroupHint,
  SidebarGroupLabel,
} from "./SidebarGroup";
import { SidebarItem } from "./SidebarItem";
import { SidebarSection } from "./SidebarSection";
import type { SidebarModuleEntry, SidebarProps } from "./types";

const MODULE_ICON_BY_ID: Record<string, UiIconName> = {
  basic: "visualization",
  mathematics: "mathematics",
  statistics: "statistics",
  inference: "inference",
  assistant: "advisor",
  reports: "reports",
};

function SidebarModuleCard({ module }: { module: SidebarModuleEntry }) {
  const iconName = MODULE_ICON_BY_ID[module.id] ?? "modules";

  return (
    <button
      type="button"
      onClick={module.onToggle}
      aria-pressed={module.enabled}
      title={module.description}
      className={`${contentPanel} flex w-full items-center justify-between gap-2 py-1 px-2 text-left border ${
        module.enabled
          ? "border-[var(--app-accent)]/30 bg-[var(--app-accent)]/5"
          : "border-[var(--app-border)] opacity-85 hover:opacity-100"
      }`}
    >
      <span className="flex items-center gap-1.5 min-w-0">
        <span className="text-sm leading-none shrink-0" aria-hidden>
          {getIcon(iconName)}
        </span>
        <span className="text-xs font-semibold text-[var(--app-heading)] truncate">
          {module.name}
        </span>
        {module.badgeLabel ? (
          <span className={sidebarSoonBadge}>{module.badgeLabel}</span>
        ) : null}
      </span>
      <span
        className={`shrink-0 inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${
          module.enabled
            ? "border border-[var(--app-accent)]/40 text-[var(--app-accent)] bg-[var(--app-accent)]/10"
            : "border border-[var(--app-border)] text-[var(--app-text-muted)]"
        }`}
      >
        {module.enabled ? "Activo" : "Inactivo"}
      </span>
    </button>
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
}: SidebarProps) {
  return (
    <aside className={mergeClassNames(sidebarShell, className)}>
      <div className={sidebarHeader}>
        <h2 className={`${panelHeading} text-sm`}>
          {getIcon("dashboard")} Dashboard Científico
        </h2>
      </div>

      <div className={sidebarSectionGap}>
        <SidebarGroup
          label={
            <SidebarGroupLabel badge="NUBE" badgeTitle="Biblioteca en nube">
              Visualización
            </SidebarGroupLabel>
          }
          hint={
            <SidebarGroupHint>
              Gráfico y=f(x) en biblioteca en nube. No incluye dataset ni
              proyecto .sgproj.
            </SidebarGroupHint>
          }
        >
          <button
            type="button"
            onClick={onNewCurve}
            className={sidebarBtnPrimary}
            title="Vacía el constructor de curvas. No borra datos experimentales ni proyecto."
          >
            + Nueva curva
          </button>
          <button
            type="button"
            onClick={onClearCurves}
            className={sidebarBtnSecondary}
            title="Vacía las expresiones del constructor. No borra datos experimentales ni proyecto."
          >
            Vaciar curvas
          </button>
          <SidebarItem
            label={`Biblioteca (${graphs.length})`}
            onClick={onToggleGraphLibrary}
            showCaret
            expanded={graphLibraryOpen}
            className="font-semibold"
          />
          {graphLibraryOpen ? (
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
            <SidebarGroupLabel badge=".SGPROJ" badgeTitle="Archivo de proyecto">
              Proyecto
            </SidebarGroupLabel>
          }
          hint={
            <SidebarGroupHint>
              Archivo .sgproj con dataset, análisis y curvas. Distinto de la
              biblioteca de gráficos en nube.
            </SidebarGroupHint>
          }
        >
          <div
            ref={projectPanelRef}
            className={
              highlightProjectPanel
                ? "rounded-lg ring-2 ring-[var(--app-accent)]/50 bg-[var(--app-accent)]/5 p-2 -mx-0.5 transition-all duration-300"
                : undefined
            }
          >
            <ProjectScientificFilePanel {...projectFilePanelProps} />
            <SidebarItem
              icon="activity"
              label="Actividad del proyecto"
              onClick={onToggleProjectActivity}
              showCaret
              expanded={projectActivityOpen}
              className="mt-1.5"
            />
            {projectActivityOpen ? (
              <HistoryPanel
                entries={projectHistoryEntries}
                className="mt-1"
              />
            ) : null}
            <LocalProjectsPanel {...localProjectsPanelProps} />
          </div>
          <button
            type="button"
            onClick={onResetProject}
            className={sidebarBtnSecondary}
            title="Reinicia la sesión completa (igual que Nuevo proyecto): datos, análisis y curvas."
          >
            Restablecer proyecto
          </button>
        </SidebarGroup>

        <div className={sidebarDivider} />

        <SidebarSection title="Científico" icon="modules" defaultOpen={false}>
          <p className="text-[11px] text-[var(--app-text-muted)] mb-1">
            Módulos activos: {activeModuleCount} de {modulesTotal}
          </p>
          <div className="space-y-1">
            {modules.map((module) => (
              <SidebarModuleCard key={module.id} module={module} />
            ))}
          </div>
        </SidebarSection>

        <SidebarSection title="Análisis" icon="advisor" defaultOpen={false}>
          {isAssistantEnabled ? (
            <SidebarItem
              icon="advisor"
              label="Asistente científico"
              onClick={onOpenAssistant}
              badge={<span className={sidebarSoonBadge}>Beta</span>}
            />
          ) : (
            <SidebarItem icon="advisor" label="Asistente científico" disabled />
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

        <SidebarSection title="Recursos" icon="library" defaultOpen={false}>
          <SidebarItem
            label="Biblioteca de funciones"
            onClick={onOpenFunctionLibrary}
          />
          <SidebarItem
            icon="history"
            label="Historial"
            onClick={onToggleRecentProjects}
            showCaret
            expanded={recentProjectsOpen}
          />
          {recentProjectsOpen ? (
            <RecentProjectsPanel {...recentProjectsPanelProps} className="mt-1" />
          ) : null}
        </SidebarSection>

        <SidebarFooter>
          <SidebarSection title="Ajustes" icon="settings" defaultOpen>
            <SidebarItem
              label="Configuración"
              onClick={onToggleSettings}
              showCaret
              expanded={settingsOpen}
            />
            {settingsOpen ? (
              <SettingsPanel {...settingsPanelProps} className="mt-1" />
            ) : null}
          </SidebarSection>
        </SidebarFooter>
      </div>
    </aside>
  );
}
