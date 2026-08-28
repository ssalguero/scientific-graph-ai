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
import { PROJECT_FILE_EXTENSION } from "@/lib/project";
import { getIcon, type UiIconName } from "@/lib/ui/icons";
import { UI_TOKENS } from "@/lib/ui/tokens";
import { mergeClassNames } from "../classNames";
import { SidebarFooter } from "./SidebarFooter";
import {
  SidebarGroup,
  SidebarGroupLabel,
} from "./SidebarGroup";
import {
  SidebarItem,
  SidebarRailCollapsedContext,
  useSidebarRailCollapsed,
} from "./SidebarItem";
import { SidebarSection } from "./SidebarSection";
import type { SidebarModuleEntry, SidebarProps } from "./types";

/** D48.3 — wired from UI_TOKENS (aliases preserve local names; no visual change). */
const { content: contentPanel } = UI_TOKENS.panel;
const { panelHeading } = UI_TOKENS.typography;
const {
  btnPrimary: sidebarBtnPrimary,
  btnSecondary: sidebarBtnSecondary,
  collapseToggle: sidebarCollapseToggle,
  divider: sidebarDivider,
  graphItemActive: sidebarGraphItemActive,
  graphItemIdle: sidebarGraphItemIdle,
  header: sidebarHeader,
  mobileTrigger: sidebarMobileTrigger,
  overlayBackdrop: sidebarOverlayBackdrop,
  overlayClosed: sidebarOverlayClosed,
  overlayOpen: sidebarOverlayOpen,
  railHide: sidebarRailHide,
  railSectionWrap: sidebarRailSectionWrap,
  sectionGap: sidebarSectionGap,
  sectionGapCollapsed: sidebarSectionGapCollapsed,
  shellCollapsed: sidebarShellCollapsed,
  shellExpanded: sidebarShellExpanded,
  shellHidden: sidebarShellHidden,
  soonBadge: sidebarSoonBadge,
  widthDesktop: sidebarWidthDesktop,
} = UI_TOKENS.sidebar;
/** Additive chrome props (D46.3 / CRP-6.3) — optional; do not break SidebarProps callers. */
type SidebarChromeProps = {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** CRP-6.3 — zero-width presentation; region remains mounted. */
  chromeSuppressed?: boolean;
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
      className={`${contentPanel} flex w-full items-center justify-between gap-1.5 !rounded-md !py-1 !px-1.5 text-left border ${
        module.enabled
          ? "border-[var(--color-brand-primary)]/30 bg-[var(--color-brand-primary)]/5"
          : "border-[var(--color-border-default)] opacity-85 hover:opacity-100 hover:bg-[var(--color-surface-canvas)]"
      } ${railCollapsed ? "justify-center !px-1" : ""}`}
    >
      <span
        className={`flex items-center gap-1.5 min-w-0 ${
          railCollapsed ? "justify-center" : ""
        }`}
      >
        <span className="text-xs leading-none shrink-0" aria-hidden>
          {getIcon(iconName)}
        </span>
        <span
          className={`text-xs font-medium text-[var(--color-text-primary)] truncate ${
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
          className={`shrink-0 inline-flex rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${
            module.enabled
              ? "border border-[var(--color-brand-primary)]/40 text-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/10"
              : "border border-[var(--color-border-default)] text-[var(--color-text-muted)]"
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
  workspaceSection = "home",
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
  chromeSuppressed = false,
}: SidebarProps & SidebarChromeProps) {
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [projectMoreOpen, setProjectMoreOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const overlayWasOpenRef = useRef(false);

  const isHome = workspaceSection === "home";
  const showCientifico =
    workspaceSection === "analysis" || workspaceSection === "results";
  const showNuevoGrafico = workspaceSection === "analysis";
  const showAssistantItem =
    isAssistantEnabled &&
    (workspaceSection === "analysis" ||
      workspaceSection === "results" ||
      workspaceSection === "reports");
  const showAnalisisTools = showNuevoGrafico || showAssistantItem;
  const showRecursos = workspaceSection === "data";
  const showAjustes = !isHome;

  const hasRecoveryOrConflict = Boolean(
    projectFilePanelProps.recoveryPrompt ||
      projectFilePanelProps.pendingFileOpenConflict
  );

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

  useEffect(() => {
    if (projectActivityOpen) {
      setProjectMoreOpen(true);
    }
  }, [projectActivityOpen]);

  /** Mobile drawer always expanded; rail only on lg+. */
  const effectiveRailCollapsed = isMobile ? false : railCollapsed;

  const shell = isMobile
    ? overlayOpen
      ? mergeClassNames(sidebarOverlayOpen, sidebarWidthDesktop)
      : sidebarOverlayClosed
    : chromeSuppressed
      ? sidebarShellHidden
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
        className={mergeClassNames(
          shell,
          // UX-4.3 — fill AppShell Sidebar Region (not viewport). Width + scroll stay owned here.
          "!h-full !min-h-0",
          className
        )}
        data-rail={effectiveRailCollapsed ? "collapsed" : "expanded"}
        data-chrome-suppressed={chromeSuppressed ? "true" : undefined}
        data-mobile-overlay={isMobile && overlayOpen ? "open" : undefined}
        aria-hidden={
          (chromeSuppressed && !isMobile) || (isMobile && !overlayOpen)
            ? true
            : undefined
        }
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
              title="Proyecto"
            >
              {getIcon("dashboard")}
            </span>
          ) : (
            <h2
              className={`${panelHeading} !text-xs !font-semibold min-w-0 flex-1 truncate tracking-tight`}
            >
              {getIcon("dashboard")} Proyecto
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
                <SidebarGroupLabel
                  badge="Archivo"
                  badgeTitle={`Formato de archivo ${PROJECT_FILE_EXTENSION}`}
                >
                  Proyecto
                </SidebarGroupLabel>
              </RailLabel>
            }
          >
            <div
              ref={projectPanelRef}
              className={
                highlightProjectPanel && !effectiveRailCollapsed
                  ? "rounded-lg ring-2 ring-[var(--color-brand-primary)]/50 bg-[var(--color-brand-primary)]/5 p-2 -mx-0.5 transition-all duration-300"
                  : undefined
              }
            >
              {!effectiveRailCollapsed ? (
                <ProjectScientificFilePanel {...projectFilePanelProps} />
              ) : (
                <>
                  <SidebarItem
                    icon="open"
                    label="Abrir proyecto"
                    title="Abrir proyecto"
                    onClick={() =>
                      projectFilePanelProps.openProjectButtonRef?.current?.click()
                    }
                  />
                  {projectFilePanelProps.onOpenLocalLibrary ? (
                    <SidebarItem
                      icon="library"
                      label="Proyectos locales"
                      title="Recuperar proyectos guardados en este navegador (biblioteca local)"
                      onClick={() =>
                        void projectFilePanelProps.onOpenLocalLibrary?.()
                      }
                      active={localProjectsPanelProps.isOpen}
                    />
                  ) : null}
                  {hasRecoveryOrConflict ? (
                    <SidebarItem
                      icon="activity"
                      label="Recuperación"
                      title="Hay recuperación o conflicto de proyecto — expandir barra"
                      onClick={() => setRailCollapsed(false)}
                    />
                  ) : null}
                </>
              )}
              {!effectiveRailCollapsed ? (
                <button
                  type="button"
                  onClick={() => setProjectMoreOpen((open) => !open)}
                  className={`${sidebarBtnSecondary} mt-1.5`}
                  aria-expanded={projectMoreOpen}
                >
                  {projectMoreOpen
                    ? "Ocultar actividad y restablecer"
                    : "Actividad y restablecer"}
                </button>
              ) : null}
              {(projectMoreOpen ||
                (effectiveRailCollapsed && !isHome)) && (
                <>
                  <SidebarItem
                    icon="activity"
                    label="Actividad del proyecto"
                    onClick={onToggleProjectActivity}
                    showCaret
                    expanded={projectActivityOpen}
                    active={projectActivityOpen}
                    className={effectiveRailCollapsed ? undefined : "mt-1"}
                  />
                  {projectActivityOpen && !effectiveRailCollapsed ? (
                    <HistoryPanel
                      entries={projectHistoryEntries}
                      className="mt-1"
                    />
                  ) : null}
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
                </>
              )}
              <LocalProjectsPanel {...localProjectsPanelProps} />
            </div>
          </SidebarGroup>

          {showCientifico || showAnalisisTools || showRecursos || showAjustes ? (
            <div className={sidebarDivider} />
          ) : null}

          {showCientifico ? (
          <div
            className={
              effectiveRailCollapsed ? sidebarRailSectionWrap : undefined
            }
          >
            <SidebarSection
              title="Científico"
              icon="modules"
              defaultOpen={workspaceSection === "analysis"}
            >
              {!effectiveRailCollapsed ? (
                <p className="text-[11px] text-[var(--color-text-muted)] mb-1">
                  Módulos opcionales · {activeModuleCount}/{modulesTotal} activos
                </p>
              ) : null}
              <div className="space-y-1">
                {modules.map((module) => (
                  <SidebarModuleCard key={module.id} module={module} />
                ))}
              </div>
            </SidebarSection>
          </div>
          ) : null}

          {showAnalisisTools ? (
          <div
            className={
              effectiveRailCollapsed ? sidebarRailSectionWrap : undefined
            }
          >
            <SidebarSection
              title="Herramientas"
              icon="advisor"
              defaultOpen={
                workspaceSection === "analysis" ||
                workspaceSection === "reports"
              }
            >
              {showNuevoGrafico ? (
                <button
                  type="button"
                  onClick={onNewCurve}
                  className={sidebarBtnPrimary}
                  title="Reinicia el constructor: gráfico y=f(x) vacío. No agrega una expresión al gráfico actual. No borra datos experimentales ni proyecto."
                  aria-label="Nuevo gráfico — reinicia el constructor"
                >
                  {effectiveRailCollapsed ? getIcon("add") : "+ Nuevo gráfico"}
                </button>
              ) : null}
              {showAssistantItem ? (
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
              ) : null}
            </SidebarSection>
          </div>
          ) : null}

          {showRecursos ? (
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
                icon="library"
                label={`Biblioteca de gráficos (${graphs.length})`}
                onClick={onToggleGraphLibrary}
                showCaret
                expanded={graphLibraryOpen}
                active={graphLibraryOpen}
              />
              {graphLibraryOpen && !effectiveRailCollapsed ? (
                <div className="space-y-1 max-h-36 overflow-y-auto pr-0.5">
                  {graphs.length === 0 ? (
                    <p className="text-[11px] text-[var(--color-text-muted)] px-1">
                      Sin gráficos guardados en nube.
                    </p>
                  ) : (
                    graphs.map((graph, index) => (
                      <button
                        key={graph.id}
                        type="button"
                        onClick={() => onLoadGraph(graph)}
                        className={`w-full text-left border rounded-md px-2 py-1 text-xs ${UI_TOKENS.transition.colors200} ${
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
          ) : null}

          {showAjustes ? (
          <SidebarFooter>
            <div
              className={
                effectiveRailCollapsed ? sidebarRailSectionWrap : undefined
              }
            >
              <SidebarSection title="Ajustes" icon="settings" defaultOpen={false}>
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
          ) : null}
        </div>
      </aside>
    </SidebarRailCollapsedContext.Provider>
  );
}
