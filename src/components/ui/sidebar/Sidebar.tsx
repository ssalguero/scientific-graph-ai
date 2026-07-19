"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

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
  sidebarMobileTrigger,
  sidebarOverlayBackdrop,
  sidebarOverlayClosed,
  sidebarOverlayOpen,
  sidebarRailHide,
  sidebarRailSectionWrap,
  sidebarSectionGap,
  sidebarSectionGapCollapsed,
  sidebarShellCollapsed,
  sidebarShellExpanded,
  sidebarSoonBadge,
  sidebarWidthDesktop,
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

/** Below `lg` — mobile drawer viewport (matches theme shells). */
const SIDEBAR_MOBILE_MQ = "(max-width: 1023px)";

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
  const [isMobile, setIsMobile] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const overlayWasOpenRef = useRef(false);

  const railCollapsed = collapsedProp ?? uncontrolledCollapsed;

  const setRailCollapsed = (next: boolean) => {
    onCollapsedChange?.(next);
    if (collapsedProp === undefined) {
      setUncontrolledCollapsed(next);
    }
  };

  const closeOverlay = () => setOverlayOpen(false);
  const openOverlay = () => setOverlayOpen(true);

  useEffect(() => {
    const media = window.matchMedia(SIDEBAR_MOBILE_MQ);
    const sync = () => {
      const mobile = media.matches;
      setIsMobile(mobile);
      if (!mobile) {
        setOverlayOpen(false);
      }
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!isMobile || !overlayOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeOverlay();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobile, overlayOpen]);

  useEffect(() => {
    if (!isMobile) return;
    if (overlayOpen) {
      overlayWasOpenRef.current = true;
      const focusTarget =
        asideRef.current?.querySelector<HTMLElement>(
          "[data-sidebar-focus-target]"
        ) ?? asideRef.current?.querySelector<HTMLElement>("button");
      focusTarget?.focus();
      return;
    }
    if (overlayWasOpenRef.current) {
      overlayWasOpenRef.current = false;
      triggerRef.current?.focus();
    }
  }, [overlayOpen, isMobile]);

  /** Mobile drawer always expanded; rail only on lg+. */
  const effectiveRailCollapsed = isMobile ? false : railCollapsed;

  const shell = isMobile
    ? overlayOpen
      ? mergeClassNames(sidebarOverlayOpen, sidebarWidthDesktop)
      : sidebarOverlayClosed
    : effectiveRailCollapsed
      ? sidebarShellCollapsed
      : sidebarShellExpanded;

  const bodyGap = effectiveRailCollapsed
    ? sidebarSectionGapCollapsed
    : sidebarSectionGap;

  return (
    <SidebarRailCollapsedContext.Provider value={effectiveRailCollapsed}>
      {isMobile && !overlayOpen ? (
        <button
          ref={triggerRef}
          type="button"
          className={sidebarMobileTrigger}
          aria-label="Abrir barra lateral"
          aria-expanded={false}
          aria-controls="app-sidebar"
          onClick={openOverlay}
        >
          <span aria-hidden>{getIcon("dashboard")}</span>
        </button>
      ) : null}

      {isMobile && overlayOpen ? (
        <div
          className={sidebarOverlayBackdrop}
          aria-hidden
          onClick={closeOverlay}
        />
      ) : null}

      <aside
        ref={asideRef}
        id="app-sidebar"
        className={mergeClassNames(shell, className)}
        data-rail={effectiveRailCollapsed ? "collapsed" : "expanded"}
        data-mobile-overlay={isMobile && overlayOpen ? "open" : undefined}
        aria-hidden={isMobile && !overlayOpen ? true : undefined}
      >
        <div
          className={mergeClassNames(
            sidebarHeader,
            effectiveRailCollapsed && "flex-col px-1.5 justify-center"
          )}
        >
          {effectiveRailCollapsed ? (
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
          {isMobile ? (
            <button
              type="button"
              data-sidebar-focus-target
              className={sidebarCollapseToggle}
              aria-label="Cerrar barra lateral"
              onClick={closeOverlay}
            >
              <span aria-hidden>{getIcon("collapse")}</span>
            </button>
          ) : (
            <button
              type="button"
              className={sidebarCollapseToggle}
              aria-label={
                effectiveRailCollapsed
                  ? "Expandir barra lateral"
                  : "Colapsar barra lateral"
              }
              aria-pressed={effectiveRailCollapsed}
              onClick={() => setRailCollapsed(!effectiveRailCollapsed)}
            >
              <span aria-hidden>
                {effectiveRailCollapsed
                  ? getIcon("expand")
                  : getIcon("collapse")}
              </span>
            </button>
          )}
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
              {effectiveRailCollapsed ? getIcon("add") : "+ Nueva curva"}
            </button>
            <button
              type="button"
              onClick={onClearCurves}
              className={sidebarBtnSecondary}
              title="Vacía las expresiones del constructor. No borra datos experimentales ni proyecto."
              aria-label="Vaciar curvas"
            >
              {effectiveRailCollapsed ? getIcon("remove") : "Vaciar curvas"}
            </button>
            <SidebarItem
              icon="library"
              label={`Biblioteca (${graphs.length})`}
              onClick={onToggleGraphLibrary}
              showCaret
              expanded={graphLibraryOpen}
              active={graphLibraryOpen}
            />
            {graphLibraryOpen && !effectiveRailCollapsed ? (
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
                highlightProjectPanel && !effectiveRailCollapsed
                  ? "rounded-lg ring-2 ring-[var(--app-accent)]/50 bg-[var(--app-accent)]/5 p-2 -mx-0.5 transition-all duration-300"
                  : undefined
              }
            >
              {!effectiveRailCollapsed ? (
                <ProjectScientificFilePanel {...projectFilePanelProps} />
              ) : null}
              <SidebarItem
                icon="activity"
                label="Actividad del proyecto"
                onClick={onToggleProjectActivity}
                showCaret
                expanded={projectActivityOpen}
                active={projectActivityOpen}
                className={effectiveRailCollapsed ? undefined : "mt-1.5"}
              />
              {projectActivityOpen && !effectiveRailCollapsed ? (
                <HistoryPanel
                  entries={projectHistoryEntries}
                  className="mt-1"
                />
              ) : null}
              {!effectiveRailCollapsed ? (
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
              {effectiveRailCollapsed
                ? getIcon("remove")
                : "Restablecer proyecto"}
            </button>
          </SidebarGroup>

          <div className={sidebarDivider} />

          <div
            className={
              effectiveRailCollapsed ? sidebarRailSectionWrap : undefined
            }
          >
            <SidebarSection title="Científico" icon="modules" defaultOpen={false}>
              {!effectiveRailCollapsed ? (
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

          <div
            className={
              effectiveRailCollapsed ? sidebarRailSectionWrap : undefined
            }
          >
            <SidebarSection title="Análisis" icon="advisor" defaultOpen={false}>
              {isAssistantEnabled ? (
                <SidebarItem
                  icon="advisor"
                  label="Asistente científico"
                  onClick={onOpenAssistant}
                  badge={
                    effectiveRailCollapsed ? undefined : (
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

          <div
            className={
              effectiveRailCollapsed ? sidebarRailSectionWrap : undefined
            }
          >
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
              {recentProjectsOpen && !effectiveRailCollapsed ? (
                <RecentProjectsPanel
                  {...recentProjectsPanelProps}
                  className="mt-1"
                />
              ) : null}
            </SidebarSection>
          </div>

          <SidebarFooter>
            <div
              className={
                effectiveRailCollapsed ? sidebarRailSectionWrap : undefined
              }
            >
              <SidebarSection title="Ajustes" icon="settings" defaultOpen>
                <SidebarItem
                  icon="settings"
                  label="Configuración"
                  onClick={onToggleSettings}
                  showCaret
                  expanded={settingsOpen}
                  active={settingsOpen}
                />
                {settingsOpen && !effectiveRailCollapsed ? (
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
