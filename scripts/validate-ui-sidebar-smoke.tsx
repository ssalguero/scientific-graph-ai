/**
 * D45.4 / D46.1 smoke — S1 Sidebar renders with stub props (SSR markup).
 * D46.1: expects rename 1:1 section labels (Visualización, Proyecto, …).
 */
import { createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { Sidebar } from "../src/components/ui/sidebar";
import { createInitialProjectMetadata } from "../src/app/projectPersistence";

const noop = () => {};
const asyncNoop = async () => {};

const markup = renderToStaticMarkup(
  <Sidebar
    onNewCurve={noop}
    onClearCurves={noop}
    graphLibraryOpen={false}
    onToggleGraphLibrary={noop}
    graphs={[]}
    graphLabels={[]}
    selectedGraphId={null}
    onLoadGraph={noop}
    projectPanelRef={createRef<HTMLDivElement>()}
    highlightProjectPanel={false}
    projectFilePanelProps={{
      projectMetadata: createInitialProjectMetadata(),
      feedback: null,
      onDismissFeedback: noop,
      onNewProject: noop,
      onSaveProject: noop,
      onOpenProjectFile: asyncNoop,
      autosaveIndicator: {
        state: "idle",
        label: "",
        className: "",
      },
      sessionConflict: {
        uiState: "none",
        conflict: null,
        shouldBlock: false,
        prompt: null,
      },
    }}
    projectActivityOpen={false}
    onToggleProjectActivity={noop}
    projectHistoryEntries={[]}
    localProjectsPanelProps={{
      isOpen: false,
      projects: [],
      isLoading: false,
      loadError: null,
      activeProjectId: null,
      onClose: noop,
      onRefresh: noop,
      onOpen: noop,
      onDelete: asyncNoop,
      onDuplicate: asyncNoop,
      onRename: asyncNoop,
      onExport: noop,
    }}
    onResetProject={noop}
    modules={[
      {
        id: "basic",
        name: "Análisis básico",
        description: "test",
        enabled: true,
        onToggle: noop,
      },
    ]}
    activeModuleCount={1}
    modulesTotal={1}
    isAssistantEnabled
    isReportsEnabled
    onOpenAssistant={noop}
    onOpenReports={noop}
    onOpenFunctionLibrary={noop}
    recentProjectsOpen={false}
    onToggleRecentProjects={noop}
    recentProjectsPanelProps={{
      projects: [],
      isLoading: false,
      loadError: null,
      activeProjectId: null,
      onOpen: noop,
    }}
    settingsOpen={false}
    onToggleSettings={noop}
    settingsPanelProps={{
      theme: "light",
      showContextualHints: true,
      appVersion: "test",
      onThemeChange: noop,
      onShowContextualHintsChange: noop,
    }}
  />
);

const checks = {
  rendersAside: markup.includes("<aside"),
  dashboardTitle: markup.includes("Dashboard Científico"),
  newCurve: markup.includes("Nueva curva"),
  labelVisualization: markup.includes("Visualización"),
  labelProject: markup.includes("Proyecto"),
  labelScientific: markup.includes("Científico"),
  labelAnalysis: markup.includes("Análisis"),
  labelResources: markup.includes("Recursos"),
  labelSettings: markup.includes("Ajustes"),
  noLegacyCurvas: !markup.includes("Curvas matemáticas"),
  noLegacyProyectoCientifico: !markup.includes("Proyecto científico"),
  // Section title "Módulos" removed; copy "Módulos activos:" may remain.
  noLegacyModulosTitle:
    !markup.includes(">Módulos</") && !markup.includes(">Módulos<"),
  noLegacyHerramientas: !markup.includes("Herramientas"),
  noLegacySistema: !markup.includes("Sistema"),
  noIconLib: !markup.includes("lucide"),
};

const pass = Object.values(checks).every(Boolean);

const summary = {
  phase: "ui-sidebar-smoke",
  pass,
  S1: { pass, checks },
  note: "S2–S5 are structural/behavior parity by extraction (handlers via props); S6 = tsc",
};

console.log(JSON.stringify(summary, null, 2));
process.exit(pass ? 0 : 1);
