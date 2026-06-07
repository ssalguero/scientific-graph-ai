"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  Fragment,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { toPng, toSvg } from "html-to-image";
import { supabase } from "../lib/supabase";
import {
  DEFAULT_EXPERIMENTAL_DATA_SOURCE_ID,
  EXPERIMENTAL_DATA_SOURCES,
  getExperimentalDataSource,
  importExperimentalDataFile,
  type ExperimentalDataSourceId,
  type ExperimentalSeries,
} from "../lib/experimentalData";
import {
  derivative,
  evaluate,
  parse,
  simplify,
  type ConstantNode,
  type FunctionNode,
  type MathNode,
  type OperatorNode,
  type ParenthesisNode,
  type SymbolNode,
} from "mathjs";

import {
  Bar,
  BarChart,
  ComposedChart,
  Line,
  LineChart,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

const THEME_STORAGE_KEY = "scientific-graph-theme";
type ThemeMode = "light" | "dark";

const appShellLight =
  "bg-slate-50 text-[var(--app-text)] transition-colors duration-200 [--app-surface:#ffffff] [--app-surface-muted:#f8fafc] [--app-border:#e2e8f0] [--app-text:#334155] [--app-text-muted:#64748b] [--app-heading:#0f172a] [--app-accent:#2563eb] [--app-success:#16a34a] [--app-warning:#d97706] [--app-danger:#dc2626] [--app-success-bg:#dcfce7] [--app-success-text:#166534] [--app-info-bg:#fef3c7] [--app-info-text:#92400e] [--app-danger-bg:#fef2f2] [--app-danger-border:#fecaca] [--app-danger-text:#b91c1c] [--app-warning-bg:#fffbeb] [--app-warning-border:#fde68a] [--app-warning-text:#92400e] [--app-toggle-track:#e2e8f0] [--app-toggle-thumb:#ffffff]";
const appShellDark =
  "bg-[#0f172a] text-[var(--app-text)] transition-colors duration-200 [--app-surface:#111827] [--app-surface-muted:#1f2937] [--app-border:#334155] [--app-text:#e5e7eb] [--app-text-muted:#94a3b8] [--app-heading:#e5e7eb] [--app-accent:#3b82f6] [--app-success:#22c55e] [--app-warning:#f59e0b] [--app-danger:#ef4444] [--app-success-bg:#052e16] [--app-success-text:#86efac] [--app-info-bg:#451a03] [--app-info-text:#fcd34d] [--app-danger-bg:#450a0a] [--app-danger-border:#7f1d1d] [--app-danger-text:#fca5a5] [--app-warning-bg:#422006] [--app-warning-border:#78350f] [--app-warning-text:#fcd34d] [--app-toggle-track:#334155] [--app-toggle-thumb:#e5e7eb]";

const getAppShell = (mode: ThemeMode) =>
  mode === "dark" ? appShellDark : appShellLight;

const getChartTheme = (mode: ThemeMode) =>
  mode === "dark"
    ? {
        grid: "#334155",
        axis: "#94a3b8",
        tooltipBg: "#111827",
        tooltipBorder: "#334155",
        tooltipColor: "#e5e7eb",
      }
    : {
        grid: "#e2e8f0",
        axis: "#64748b",
        tooltipBg: "#ffffff",
        tooltipBorder: "#e2e8f0",
        tooltipColor: "#334155",
      };

const card =
  "rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm p-4 sm:p-5 transition-colors duration-200";
const panelHeading =
  "text-base sm:text-lg font-semibold text-[var(--app-heading)] tracking-tight";
const panelHeadingSubtext = "text-sm text-[var(--app-text-muted)] mt-1";
const sectionLabel =
  "text-xs sm:text-sm font-semibold uppercase tracking-wider text-[var(--app-text-muted)] mb-3";
const subsectionCard =
  "rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-3 space-y-3 transition-colors duration-200";
const subsectionHeading =
  "text-sm font-semibold text-[var(--app-heading)]";
const contentPanel =
  "rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2.5 text-sm text-[var(--app-text)] transition-colors duration-200";
const emptyState =
  "rounded-lg border border-dashed border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-4 text-sm text-[var(--app-text-muted)] text-center transition-colors duration-200";
const fieldLabel =
  "block text-sm font-medium text-[var(--app-heading)] mb-1.5";
const inputField =
  "w-full h-10 border border-[var(--app-border)] rounded-lg px-3 text-sm sm:text-base text-[var(--app-heading)] bg-[var(--app-surface)] placeholder:text-[var(--app-text-muted)] shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]/20 focus:border-[var(--app-accent)]";
const btnPrimary =
  "inline-flex h-10 items-center justify-center font-semibold text-white text-sm sm:text-base px-5 rounded-lg shadow-sm transition-colors duration-200 hover:shadow-md active:scale-[0.98]";
const btnOutline =
  "inline-flex h-10 items-center justify-center border border-[var(--app-border)] bg-[var(--app-surface)] px-4 rounded-lg text-sm sm:text-base text-[var(--app-text)] shadow-sm transition-colors duration-200 hover:bg-[var(--app-surface-muted)] hover:border-[var(--app-text-muted)] hover:shadow disabled:opacity-50 disabled:cursor-not-allowed";
const btnOutlineSm =
  "inline-flex h-8 items-center justify-center border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 rounded-lg text-xs text-[var(--app-text)] shadow-sm transition-colors duration-200 hover:bg-[var(--app-surface-muted)] hover:border-[var(--app-text-muted)]";
const alertBase =
  "rounded-lg border px-4 py-3 text-sm font-medium transition-colors duration-200";
const alertError = `${alertBase} border-[var(--app-danger-border)] bg-[var(--app-danger-bg)] text-[var(--app-danger-text)]`;
const alertWarning = `${alertBase} border-[var(--app-warning-border)] bg-[var(--app-warning-bg)] text-[var(--app-warning-text)]`;
const toggleInput = "peer sr-only";
const toggleShell =
  "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full";
const toggleTrackBg =
  "pointer-events-none absolute inset-0 rounded-full border border-[var(--app-border)] bg-[var(--app-toggle-track)] transition-colors duration-200 peer-checked:border-[var(--app-accent)] peer-checked:bg-[var(--app-accent)] peer-disabled:opacity-50";
const toggleThumb =
  "pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-[var(--app-toggle-thumb)] shadow-sm transition-transform duration-200 peer-checked:translate-x-5 peer-disabled:opacity-50";
const toggleLabel =
  "flex items-start justify-between gap-3 cursor-pointer text-sm text-[var(--app-text)] leading-snug";
const actionBarBtn =
  "inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold shadow-sm transition-colors duration-200 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm";
const actionBarBtnPrimary =
  `${actionBarBtn} bg-emerald-600 text-white hover:bg-emerald-700 min-w-[7.5rem]`;
const actionBarBtnSave =
  `${actionBarBtn} border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 min-w-[7.5rem]`;
const actionBarBtnNeutral = `${actionBarBtn} ${btnOutline} hover:shadow-sm`;
const actionBarBtnExport =
  `${actionBarBtn} ${btnOutline} min-w-[3.25rem] px-3 font-medium hover:shadow-sm`;
const actionBarGroup =
  "flex flex-wrap items-center gap-2";
const actionBarDivider =
  "hidden sm:block h-8 w-px shrink-0 bg-[var(--app-border)]";
const sidebarDivider = "border-t border-[var(--app-border)] my-2";
const sidebarNavItem =
  "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm text-[var(--app-text)] transition-all duration-200";
const sidebarSoonBadge =
  "inline-flex shrink-0 items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--app-text-muted)]";

type DashboardSectionProps = {
  title: string;
  icon: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

function DashboardSection({
  title,
  icon,
  defaultOpen = false,
  children,
}: DashboardSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={sidebarDivider}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center gap-2 py-1.5 text-left text-sm font-semibold text-[var(--app-heading)] transition-all duration-200"
        aria-expanded={open}
      >
        <span
          className="w-3 text-xs text-[var(--app-text-muted)]"
          aria-hidden
        >
          {open ? "▼" : "▶"}
        </span>
        <span aria-hidden>{icon}</span>
        <span>{title}</span>
      </button>
      <div
        className={`grid transition-all duration-200 ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-1 pb-1 pt-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

type ScientificReportSectionCollapsibleProps = {
  title: string;
  content: string[];
  defaultOpen?: boolean;
};

function ScientificReportSectionCollapsible({
  title,
  content,
  defaultOpen = false,
}: ScientificReportSectionCollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`${contentPanel} mb-2`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center gap-2 text-left text-sm font-semibold text-[var(--app-heading)]"
        aria-expanded={open}
      >
        <span
          className="w-3 text-xs text-[var(--app-text-muted)]"
          aria-hidden
        >
          {open ? "▼" : "▶"}
        </span>
        <span>{title}</span>
      </button>
      {open && (
        <div className="mt-2 space-y-1 text-sm text-[var(--app-text)]">
          {content.map((line, index) => (
            <p key={`${title}-${index}`}>{line}</p>
          ))}
        </div>
      )}
    </div>
  );
}

type WorkspaceSection = "data" | "analysis" | "results" | "reports";

const WORKSPACE_TABS: { id: WorkspaceSection; label: string }[] = [
  { id: "data", label: "Datos" },
  { id: "analysis", label: "Análisis" },
  { id: "results", label: "Resultados" },
  { id: "reports", label: "Reportes" },
];

type WorkspaceTabProps = {
  section: WorkspaceSection;
  label: string;
  isActive: boolean;
  onSelect: (section: WorkspaceSection) => void;
};

function WorkspaceTab({
  section,
  label,
  isActive,
  onSelect,
}: WorkspaceTabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => onSelect(section)}
      className={
        isActive
          ? "rounded-lg border border-[var(--app-accent)] bg-[var(--app-accent)] px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors"
          : `${btnOutline} px-3 py-2 text-sm font-medium`
      }
    >
      {label}
    </button>
  );
}

type NotebookSectionProps = {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  icon?: string;
  badge?: string;
  children: ReactNode;
};

function NotebookSection({
  title,
  subtitle,
  defaultOpen = true,
  icon,
  badge,
  children,
}: NotebookSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`${subsectionCard} w-full`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-start gap-2 text-left"
        aria-expanded={open}
      >
        <span
          className="mt-0.5 w-3 shrink-0 text-xs text-[var(--app-text-muted)]"
          aria-hidden
        >
          {open ? "▼" : "▶"}
        </span>
        {icon ? (
          <span className="shrink-0 text-base leading-none" aria-hidden>
            {icon}
          </span>
        ) : null}
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-semibold text-[var(--app-heading)] sm:text-base">
            {title}
          </span>
          {subtitle ? (
            <span className="block text-xs text-[var(--app-text-muted)] mt-0.5">
              {subtitle}
            </span>
          ) : null}
        </span>
        {badge ? (
          <span className="shrink-0 inline-flex rounded-full border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">
            {badge}
          </span>
        ) : null}
      </button>
      <div
        className={`grid transition-all duration-200 ${
          open
            ? "grid-rows-[1fr] opacity-100 mt-3"
            : "grid-rows-[0fr] opacity-0 mt-0"
        }`}
      >
        <div className="overflow-hidden min-h-0">
          <div className="space-y-3 pb-0.5">{children}</div>
        </div>
      </div>
    </div>
  );
}

type ScientificModuleBadge = "soon" | "experimental" | "beta" | "pro";

type ScientificModule = {
  id: string;
  name: string;
  icon: string;
  description: string;
  enabled: boolean;
  badge?: ScientificModuleBadge;
};

const SCIENTIFIC_MODULES: Omit<ScientificModule, "enabled">[] = [
  {
    id: "basic",
    name: "Análisis básico",
    icon: "📊",
    description: "Visualización, rango, ejes y escalas",
  },
  {
    id: "mathematics",
    name: "Análisis matemático",
    icon: "🧮",
    description: "Funciones, derivadas e integrales",
  },
  {
    id: "statistics",
    name: "Análisis estadístico",
    icon: "📉",
    description: "Distribuciones y estadística descriptiva",
  },
  {
    id: "inference",
    name: "Inferencia",
    icon: "🧪",
    description: "t-Test, ANOVA, Tukey y no paramétricas",
  },
  {
    id: "assistant",
    name: "Asistente científico",
    icon: "🧠",
    description: "Interpretación y recomendaciones",
  },
  {
    id: "reports",
    name: "Reportes",
    icon: "📄",
    description: "Exportación y reporte científico",
  },
];

const createDefaultEnabledModules = (): Record<string, boolean> =>
  Object.fromEntries(
    SCIENTIFIC_MODULES.map((module) => [module.id, true])
  ) as Record<string, boolean>;

const isScientificModuleEnabled = (
  enabledModules: Record<string, boolean>,
  moduleId: string
) => enabledModules[moduleId] !== false;

const getScientificModuleBadgeLabel = (badge: ScientificModuleBadge) => {
  const labels: Record<ScientificModuleBadge, string> = {
    soon: "Soon",
    experimental: "Experimental",
    beta: "Beta",
    pro: "Pro",
  };
  return labels[badge];
};

type AnalysisInspectorSection =
  | "visualization"
  | "mathematics"
  | "statistics"
  | "inference"
  | "advisor";

const INSPECTOR_SECTION_MODULE_ID: Record<AnalysisInspectorSection, string> = {
  visualization: "basic",
  mathematics: "mathematics",
  statistics: "statistics",
  inference: "inference",
  advisor: "assistant",
};

const ANALYSIS_INSPECTOR_CATEGORIES: {
  id: AnalysisInspectorSection;
  label: string;
  icon: string;
  description: string;
  moduleId: string;
}[] = [
  {
    id: "visualization",
    label: "Visualización",
    icon: "📊",
    description: "Rango, ejes y escalas del gráfico.",
    moduleId: "basic",
  },
  {
    id: "mathematics",
    label: "Matemática",
    icon: "📈",
    description: "Regresiones, derivadas e integrales.",
    moduleId: "mathematics",
  },
  {
    id: "statistics",
    label: "Estadística",
    icon: "📉",
    description: "Descriptiva, correlación, outliers y distribución.",
    moduleId: "statistics",
  },
  {
    id: "inference",
    label: "Inferencia",
    icon: "🧪",
    description: "t-Test, ANOVA, Tukey y pruebas no paramétricas.",
    moduleId: "inference",
  },
  {
    id: "advisor",
    label: "Advisor",
    icon: "🧠",
    description: "Advisor, interpretación y asistente.",
    moduleId: "assistant",
  },
];

const WORKSPACE_SECTION_MODULE_GATE: Partial<
  Record<WorkspaceSection, string>
> = {
  reports: "reports",
};

type ScientificModuleCardProps = {
  module: Omit<ScientificModule, "enabled">;
  enabled: boolean;
  onToggle: () => void;
};

function ScientificModuleCard({
  module,
  enabled,
  onToggle,
}: ScientificModuleCardProps) {
  return (
    <div
      className={`${contentPanel} flex flex-col gap-2 border ${
        enabled
          ? "border-[var(--app-accent)]/30 bg-[var(--app-accent)]/5"
          : "border-[var(--app-border)] opacity-80"
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="text-base leading-none shrink-0" aria-hidden>
          {module.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--app-heading)]">
            {module.name}
          </p>
          <p className="text-xs text-[var(--app-text-muted)] mt-0.5">
            {module.description}
          </p>
        </div>
        {module.badge ? (
          <span className={sidebarSoonBadge}>
            {getScientificModuleBadgeLabel(module.badge)}
          </span>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`${btnOutlineSm} self-start ${
          enabled
            ? "border-[var(--app-accent)]/40 text-[var(--app-accent)]"
            : ""
        }`}
        aria-pressed={enabled}
      >
        {enabled ? "Activo" : "Inactivo"}
      </button>
    </div>
  );
}

const getAnalysisInspectorCategory = (section: AnalysisInspectorSection) =>
  ANALYSIS_INSPECTOR_CATEGORIES.find((category) => category.id === section) ??
  ANALYSIS_INSPECTOR_CATEGORIES[0];

type InspectorCategoryButtonProps = {
  icon: string;
  label: string;
  isActive: boolean;
  onSelect: () => void;
};

function InspectorCategoryButton({
  icon,
  label,
  isActive,
  onSelect,
}: InspectorCategoryButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onSelect}
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
        isActive
          ? "bg-[var(--app-accent)]/10 text-[var(--app-heading)] ring-1 ring-[var(--app-accent)]/30 border border-[var(--app-accent)]/40"
          : "border border-transparent text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]"
      }`}
    >
      <span className="text-base leading-none shrink-0" aria-hidden>
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}

const getAnalysisInspectorPanelClass = (
  panel: AnalysisInspectorSection,
  active: AnalysisInspectorSection
) => (panel === active ? "space-y-3" : "hidden");

const getChartExportFileName = (
  title: string,
  extension: "png" | "svg" | "json"
) => {
  const trimmed = title.trim();
  if (!trimmed) return `grafico.${extension}`;

  const safe = trimmed
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);

  return safe ? `grafico-${safe}.${extension}` : `grafico.${extension}`;
};

const CHART_CAPTURE_PNG_OPTIONS = {
  cacheBust: true,
  pixelRatio: 2,
  backgroundColor: "#ffffff",
} as const;

const waitForChartPaint = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });

type ChartCaptureVisibilityRestore = {
  section: HTMLElement;
  hadHiddenClass: boolean;
  ariaHidden: string | null;
  notebookPanel: HTMLElement | null;
  notebookHadCollapsedGrid: boolean;
};

const prepareChartExportVisibility = (
  chartNode: HTMLElement
): ChartCaptureVisibilityRestore | null => {
  const section = chartNode.closest<HTMLElement>("section");
  if (!section) return null;

  const restore: ChartCaptureVisibilityRestore = {
    section,
    hadHiddenClass: section.classList.contains("hidden"),
    ariaHidden: section.getAttribute("aria-hidden"),
    notebookPanel: null,
    notebookHadCollapsedGrid: false,
  };

  if (restore.hadHiddenClass) {
    section.classList.remove("hidden");
    section.setAttribute("aria-hidden", "false");
  }

  const notebookGrid = chartNode.closest<HTMLElement>(".grid.transition-all");
  if (notebookGrid?.classList.contains("grid-rows-[0fr]")) {
    restore.notebookPanel = notebookGrid;
    restore.notebookHadCollapsedGrid = true;
    notebookGrid.classList.remove("grid-rows-[0fr]", "opacity-0", "mt-0");
    notebookGrid.classList.add("grid-rows-[1fr]", "opacity-100", "mt-3");
  }

  return restore;
};

const restoreChartExportVisibility = (
  restore: ChartCaptureVisibilityRestore | null
) => {
  if (!restore) return;

  if (restore.notebookHadCollapsedGrid && restore.notebookPanel) {
    restore.notebookPanel.classList.remove(
      "grid-rows-[1fr]",
      "opacity-100",
      "mt-3"
    );
    restore.notebookPanel.classList.add("grid-rows-[0fr]", "opacity-0", "mt-0");
  }

  if (restore.hadHiddenClass) {
    restore.section.classList.add("hidden");
    if (restore.ariaHidden !== null) {
      restore.section.setAttribute("aria-hidden", restore.ariaHidden);
    } else {
      restore.section.removeAttribute("aria-hidden");
    }
  }
};

const captureChartAsPngDataUrl = async (
  chartNode: HTMLElement,
  logContext: "png-export" | "pdf-export"
): Promise<string | null> => {
  const visibilityRestore = prepareChartExportVisibility(chartNode);

  console.log(`[chart-capture:${logContext}] chartExportRef exists: true`);
  console.log(
    `[chart-capture:${logContext}] DOM node:`,
    chartNode.tagName,
    chartNode.className
  );
  console.log(
    `[chart-capture:${logContext}] size before paint:`,
    chartNode.offsetWidth,
    chartNode.offsetHeight
  );

  try {
    await waitForChartPaint();

    const width = chartNode.offsetWidth;
    const height = chartNode.offsetHeight;
    console.log(`[chart-capture:${logContext}] size after paint:`, width, height);

    if (width <= 0 || height <= 0) {
      console.warn(
        `[chart-capture:${logContext}] toPng skipped: zero-size container`
      );
      return null;
    }

    const dataUrl = await toPng(chartNode, CHART_CAPTURE_PNG_OPTIONS);
    const captureOk =
      dataUrl.startsWith("data:image/png") && dataUrl.length > 100;
    console.log(
      `[chart-capture:${logContext}] toPng success:`,
      captureOk,
      "length:",
      dataUrl.length
    );
    return captureOk ? dataUrl : null;
  } catch (error) {
    console.error(`[chart-capture:${logContext}] toPng failed:`, error);
    return null;
  } finally {
    restoreChartExportVisibility(visibilityRestore);
  }
};

const DUPLICATE_TITLE_SUFFIX = " (copia)";

const getDuplicateTitle = (currentTitle: string) => {
  const trimmed = currentTitle.trim();
  if (!trimmed) return "(copia)";
  if (trimmed.endsWith(DUPLICATE_TITLE_SUFFIX)) return trimmed;
  return `${trimmed}${DUPLICATE_TITLE_SUFFIX}`;
};

const clampVisibleXRange = (
  vMin: number,
  vMax: number,
  dataMin: number,
  dataMax: number
): [number, number] => {
  const dataSpan = dataMax - dataMin;
  if (dataSpan <= 0) return [dataMin, dataMax];

  const span = Math.max(0.5, Math.min(dataSpan, vMax - vMin));
  if (span >= dataSpan) return [dataMin, dataMax];

  let min = vMin;
  let max = vMin + span;

  if (min < dataMin) {
    min = dataMin;
    max = dataMin + span;
  }
  if (max > dataMax) {
    max = dataMax;
    min = dataMax - span;
  }

  return [min, max];
};

type Curve = { id: number; expression: string; color: string };

type DerivativeCurve = {
  id: number;
  sourceExpression: string;
  expression: string;
  color: string;
  points: { x: number; y: number }[];
};

type IntegralCurve = {
  id: string;
  sourceExpression: string;
  expression: string;
  color: string;
  points: { x: number; y: number }[];
};

const DEFAULT_CURVE_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#16a34a",
  "#a855f7",
  "#f59e0b",
  "#0891b2",
  "#334155",
];

const getDefaultColorForIndex = (index: number) =>
  DEFAULT_CURVE_COLORS[index % DEFAULT_CURVE_COLORS.length];

type FunctionLibraryEntry = {
  label: string;
  expression: string;
};

type FunctionLibraryCategory = {
  category: string;
  functions: FunctionLibraryEntry[];
};

const FUNCTION_LIBRARY: FunctionLibraryCategory[] = [
  {
    category: "Básicas",
    functions: [
      { label: "x", expression: "x" },
      { label: "x^2", expression: "x^2" },
      { label: "abs(x)", expression: "abs(x)" },
    ],
  },
  {
    category: "Trigonométricas",
    functions: [
      { label: "sin(x)", expression: "sin(x)" },
      { label: "cos(x)", expression: "cos(x)" },
      { label: "tan(x)", expression: "tan(x)" },
    ],
  },
  {
    category: "Trigonométricas inversas",
    functions: [
      { label: "asin(x)", expression: "asin(x)" },
      { label: "acos(x)", expression: "acos(x)" },
      { label: "atan(x)", expression: "atan(x)" },
    ],
  },
  {
    category: "Exponenciales y logarítmicas",
    functions: [
      { label: "exp(x)", expression: "exp(x)" },
      { label: "log(x)", expression: "log(x)" },
      { label: "ln(x)", expression: "ln(x)" },
      { label: "log10(x)", expression: "log10(x)" },
      { label: "sqrt(x)", expression: "sqrt(x)" },
    ],
  },
  {
    category: "Hiperbólicas",
    functions: [
      { label: "sinh(x)", expression: "sinh(x)" },
      { label: "cosh(x)", expression: "cosh(x)" },
      { label: "tanh(x)", expression: "tanh(x)" },
    ],
  },
  {
    category: "Redondeo",
    functions: [
      { label: "floor(x)", expression: "floor(x)" },
      { label: "ceil(x)", expression: "ceil(x)" },
      { label: "round(x)", expression: "round(x)" },
    ],
  },
  {
    category: "Constantes",
    functions: [
      { label: "pi", expression: "pi" },
      { label: "e", expression: "e" },
    ],
  },
];

const filterFunctionLibrary = (
  search: string
): FunctionLibraryCategory[] => {
  const query = search.trim().toLowerCase();
  if (!query) return FUNCTION_LIBRARY;

  return FUNCTION_LIBRARY.map((category) => ({
    ...category,
    functions: category.functions.filter(
      (fn) =>
        fn.label.toLowerCase().includes(query) ||
        fn.expression.toLowerCase().includes(query)
    ),
  })).filter((category) => category.functions.length > 0);
};

const HEX_TO_LEGACY_COLOR: Record<string, string> = {
  "#3b82f6": "blue",
  "#ef4444": "red",
  "#16a34a": "green",
  "#a855f7": "purple",
};

type GraphJsonExport = {
  title: string;
  expression: string;
  curves: { expression: string; color: string }[];
  min_x: number;
  max_x: number;
  auto_scale_y: boolean;
  color: string;
};

const normalizeImportedGraph = (parsed: unknown): GraphJsonExport | null => {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }

  const raw = parsed as Record<string, unknown>;
  const title = typeof raw.title === "string" ? raw.title : "";
  const expression =
    typeof raw.expression === "string" ? raw.expression.trim() : "";

  let curves: { expression: string; color: string }[] | null = null;

  if (Array.isArray(raw.curves) && raw.curves.length > 0) {
    curves = [];
    for (const item of raw.curves) {
      if (typeof item === "string") {
        curves.push({ expression: item.trim(), color: "" });
        continue;
      }
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }
      const curve = item as Record<string, unknown>;
      const curveExpression =
        typeof curve.expression === "string" ? curve.expression.trim() : "";
      const curveColor =
        typeof curve.color === "string" ? curve.color.trim() : "";
      curves.push({ expression: curveExpression, color: curveColor });
    }
    if (!curves.some((c) => c.expression.length > 0)) {
      return null;
    }
  }

  if (!curves && !expression) {
    return null;
  }

  const min_x =
    typeof raw.min_x === "number" && Number.isFinite(raw.min_x) ? raw.min_x : -10;
  const max_x =
    typeof raw.max_x === "number" && Number.isFinite(raw.max_x) ? raw.max_x : 10;

  if (min_x >= max_x) {
    return null;
  }

  const auto_scale_y = raw.auto_scale_y === true;
  const legacyColor =
    typeof raw.color === "string" && raw.color.trim()
      ? raw.color.trim()
      : "blue";

  const resolvedCurves =
    curves ??
    ([{ expression, color: "" }] as { expression: string; color: string }[]);

  const primaryExpression =
    expression || resolvedCurves.find((c) => c.expression)?.expression || "";

  if (!primaryExpression.trim()) {
    return null;
  }

  return {
    title,
    expression: primaryExpression,
    curves: resolvedCurves,
    min_x,
    max_x,
    auto_scale_y,
    color: legacyColor,
  };
};

const toPlottableY = (value: unknown): number | undefined => {
  let n: number;

  if (typeof value === "number") {
    n = value;
  } else if (
    value != null &&
    typeof (value as { toNumber?: () => number }).toNumber === "function"
  ) {
    n = (value as { toNumber: () => number }).toNumber();
  } else {
    return undefined;
  }

  return Number.isFinite(n) ? n : undefined;
};

const normalizeExpressionForMath = (expression: string) =>
  expression.trim().replace(/\bln\s*\(/gi, "log(");

const normalizeNaturalLanguage = (input: string): string =>
  input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

const FUNCTION_OPERAND = "[a-z0-9^+\\-*/.]+";

export const translateNaturalLanguageToMath = (input: string): string => {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;

  let text = normalizeNaturalLanguage(trimmed);

  text = text.replace(/e elevado a x al cuadrado/g, "exp(x^2)");
  text = text.replace(/e elevado a menos x/g, "exp(-x)");
  text = text.replace(
    new RegExp(`e elevado a (${FUNCTION_OPERAND})`, "g"),
    "exp($1)"
  );

  text = text.replace(/\b([a-z0-9]+)\s+al cuadrado\b/g, "$1^2");
  text = text.replace(/\b([a-z0-9]+)\s+al cubo\b/g, "$1^3");
  text = text.replace(/\b([a-z0-9]+)\s+a la cuarta\b/g, "$1^4");
  text = text.replace(/\b([a-z0-9]+)\s+a la quinta\b/g, "$1^5");

  const functionPhrases: [RegExp, string][] = [
    [new RegExp(`logaritmo natural de (${FUNCTION_OPERAND})`, "g"), "log($1)"],
    [new RegExp(`logaritmo base 10 de (${FUNCTION_OPERAND})`, "g"), "log10($1)"],
    [new RegExp(`ln de (${FUNCTION_OPERAND})`, "g"), "log($1)"],
    [new RegExp(`raiz cuadrada de (${FUNCTION_OPERAND})`, "g"), "sqrt($1)"],
    [new RegExp(`raiz de (${FUNCTION_OPERAND})`, "g"), "sqrt($1)"],
    [new RegExp(`arcotangente de (${FUNCTION_OPERAND})`, "g"), "atan($1)"],
    [new RegExp(`arcoseno de (${FUNCTION_OPERAND})`, "g"), "asin($1)"],
    [new RegExp(`arcocoseno de (${FUNCTION_OPERAND})`, "g"), "acos($1)"],
    [new RegExp(`tangente de (${FUNCTION_OPERAND})`, "g"), "tan($1)"],
    [new RegExp(`coseno de (${FUNCTION_OPERAND})`, "g"), "cos($1)"],
    [new RegExp(`seno de (${FUNCTION_OPERAND})`, "g"), "sin($1)"],
  ];

  for (const [pattern, replacement] of functionPhrases) {
    text = text.replace(pattern, replacement);
  }

  text = text.replace(/\bnumero pi\b/g, "pi");
  text = text.replace(/\bnumero e\b/g, "e");

  text = text.replace(/\s+multiplicado por\s+/g, "*");
  text = text.replace(/\s+dividido por\s+/g, "/");
  text = text.replace(/\s+por\s+/g, "*");
  text = text.replace(/\s+mas\s+/g, "+");
  text = text.replace(/\s+menos\s+/g, "-");

  text = text.replace(/\s+/g, "");

  return text;
};

const isValidMathExpression = (expression: string): boolean => {
  const normalized = normalizeExpressionForMath(expression);
  if (!normalized) return false;

  try {
    parse(normalized);
    return true;
  } catch {
    return false;
  }
};

const resolveNaturalLanguageExpression = (
  expression: string,
  enabled: boolean
): string => {
  const trimmed = expression.trim();
  if (!trimmed || !enabled) return trimmed;

  const translated = translateNaturalLanguageToMath(trimmed);
  return isValidMathExpression(translated) ? translated : trimmed;
};

const expressionsAreEquivalent = (left: string, right: string): boolean =>
  left.trim().replace(/\s+/g, "").toLowerCase() ===
  right.trim().replace(/\s+/g, "").toLowerCase();

type CurveIntersection = {
  id: string;
  curveA: string;
  curveB: string;
  x: number;
  y: number;
};

type CurveIntersectionInput = {
  idx: number;
  expression: string;
};

const INTERSECTION_DEDUP_X = 0.001;

const getChartYValue = (
  point: Record<string, number>,
  curveIdx: number
): number | undefined => {
  const y = point[`y${curveIdx + 1}`];
  return typeof y === "number" && Number.isFinite(y) ? y : undefined;
};

const interpolateIntersectionX = (
  x0: number,
  d0: number,
  x1: number,
  d1: number
): number | null => {
  if (d0 === 0 && d1 === 0) return null;
  if (d0 === 0) return x0;
  if (d1 === 0) return x1;
  if (d0 * d1 > 0) return null;
  const denominator = d0 - d1;
  if (denominator === 0) return null;
  const t = d0 / denominator;
  return x0 + t * (x1 - x0);
};

const dedupeIntersections = (items: CurveIntersection[]): CurveIntersection[] => {
  const deduped: CurveIntersection[] = [];

  for (const item of items) {
    const isDuplicate = deduped.some(
      (existing) => Math.abs(existing.x - item.x) < INTERSECTION_DEDUP_X
    );
    if (!isDuplicate) {
      deduped.push(item);
    }
  }

  return deduped.sort((a, b) => a.x - b.x);
};

const calculateCurveIntersections = (
  chartData: Record<string, number>[],
  curves: CurveIntersectionInput[],
  visibleMinX: number,
  visibleMaxX: number
): { intersections: CurveIntersection[]; identicalPairMessage: string | null } => {
  const visiblePoints = chartData.filter(
    (point) => point.x >= visibleMinX && point.x <= visibleMaxX
  );

  if (curves.length < 2 || visiblePoints.length < 2) {
    return { intersections: [], identicalPairMessage: null };
  }

  const intersections: CurveIntersection[] = [];
  let identicalPairMessage: string | null = null;

  for (let ai = 0; ai < curves.length; ai++) {
    for (let bi = ai + 1; bi < curves.length; bi++) {
      const curveA = curves[ai];
      const curveB = curves[bi];

      if (expressionsAreEquivalent(curveA.expression, curveB.expression)) {
        identicalPairMessage =
          "No se detectan intersecciones discretas entre curvas idénticas.";
        continue;
      }

      for (let i = 0; i < visiblePoints.length - 1; i++) {
        const p0 = visiblePoints[i];
        const p1 = visiblePoints[i + 1];
        const yA0 = getChartYValue(p0, curveA.idx);
        const yA1 = getChartYValue(p1, curveA.idx);
        const yB0 = getChartYValue(p0, curveB.idx);
        const yB1 = getChartYValue(p1, curveB.idx);

        if (
          yA0 === undefined ||
          yA1 === undefined ||
          yB0 === undefined ||
          yB1 === undefined
        ) {
          continue;
        }

        const d0 = yA0 - yB0;
        const d1 = yA1 - yB1;

        if (d0 === 0 && d1 === 0) {
          continue;
        }

        if (d0 * d1 <= 0) {
          const xIntersection = interpolateIntersectionX(p0.x, d0, p1.x, d1);
          if (xIntersection === null) continue;
          if (
            xIntersection < visibleMinX - 1e-9 ||
            xIntersection > visibleMaxX + 1e-9
          ) {
            continue;
          }

          const span = p1.x - p0.x;
          const t = span === 0 ? 0 : (xIntersection - p0.x) / span;
          const yIntersection = yA0 + t * (yA1 - yA0);

          intersections.push({
            id: `${curveA.idx}-${curveB.idx}-${xIntersection.toFixed(6)}`,
            curveA: curveA.expression,
            curveB: curveB.expression,
            x: xIntersection,
            y: yIntersection,
          });
        }
      }
    }
  }

  return {
    intersections: dedupeIntersections(intersections),
    identicalPairMessage,
  };
};

type CriticalPoint = {
  id: string;
  curve: string;
  type: "maximum" | "minimum";
  x: number;
  y: number;
};

const CRITICAL_POINT_DEDUP_X = 0.001;

const dedupeCriticalPoints = (items: CriticalPoint[]): CriticalPoint[] => {
  const deduped: CriticalPoint[] = [];

  for (const item of items) {
    const isDuplicate = deduped.some(
      (existing) =>
        existing.curve === item.curve &&
        existing.type === item.type &&
        Math.abs(existing.x - item.x) < CRITICAL_POINT_DEDUP_X
    );
    if (!isDuplicate) {
      deduped.push(item);
    }
  }

  return deduped.sort((a, b) => a.x - b.x);
};

const calculateCriticalPoints = (
  chartData: Record<string, number>[],
  curves: CurveIntersectionInput[],
  visibleMinX: number,
  visibleMaxX: number
): CriticalPoint[] => {
  const visiblePoints = chartData.filter(
    (point) => point.x >= visibleMinX && point.x <= visibleMaxX
  );

  if (curves.length === 0 || visiblePoints.length < 3) {
    return [];
  }

  const criticalPoints: CriticalPoint[] = [];

  for (const curve of curves) {
    for (let i = 1; i < visiblePoints.length - 1; i++) {
      const pPrev = visiblePoints[i - 1];
      const pCenter = visiblePoints[i];
      const pNext = visiblePoints[i + 1];

      const yPrev = getChartYValue(pPrev, curve.idx);
      const yCenter = getChartYValue(pCenter, curve.idx);
      const yNext = getChartYValue(pNext, curve.idx);

      if (yPrev === undefined || yCenter === undefined || yNext === undefined) {
        continue;
      }

      const slopeBefore = yCenter - yPrev;
      const slopeAfter = yNext - yCenter;

      if (slopeBefore === 0 && slopeAfter === 0) {
        continue;
      }

      let type: CriticalPoint["type"] | null = null;
      if (slopeBefore > 0 && slopeAfter < 0) {
        type = "maximum";
      } else if (slopeBefore < 0 && slopeAfter > 0) {
        type = "minimum";
      }

      if (!type) continue;

      criticalPoints.push({
        id: `${curve.idx}-${type}-${pCenter.x.toFixed(6)}`,
        curve: curve.expression,
        type,
        x: pCenter.x,
        y: yCenter,
      });
    }
  }

  return dedupeCriticalPoints(criticalPoints);
};

type CurveRoot = {
  id: string;
  curve: string;
  x: number;
  y: number;
};

const ROOT_DEDUP_X = 0.001;

const interpolateRootX = (
  x0: number,
  y0: number,
  x1: number,
  y1: number
): number | null => {
  if (y0 === 0 && y1 === 0) return null;
  if (y0 === 0) return x0;
  if (y1 === 0) return x1;
  if (y0 * y1 > 0) return null;
  const denominator = y1 - y0;
  if (denominator === 0) return null;
  return x0 - (y0 * (x1 - x0)) / denominator;
};

const dedupeRoots = (items: CurveRoot[]): CurveRoot[] => {
  const deduped: CurveRoot[] = [];

  for (const item of items) {
    const isDuplicate = deduped.some(
      (existing) =>
        existing.curve === item.curve &&
        Math.abs(existing.x - item.x) < ROOT_DEDUP_X
    );
    if (!isDuplicate) {
      deduped.push(item);
    }
  }

  return deduped.sort((a, b) => a.x - b.x);
};

const calculateCurveRoots = (
  chartData: Record<string, number>[],
  curves: CurveIntersectionInput[],
  visibleMinX: number,
  visibleMaxX: number
): CurveRoot[] => {
  const visiblePoints = chartData.filter(
    (point) => point.x >= visibleMinX && point.x <= visibleMaxX
  );

  if (curves.length === 0 || visiblePoints.length < 2) {
    return [];
  }

  const roots: CurveRoot[] = [];

  for (const curve of curves) {
    for (let i = 0; i < visiblePoints.length - 1; i++) {
      const p0 = visiblePoints[i];
      const p1 = visiblePoints[i + 1];
      const y0 = getChartYValue(p0, curve.idx);
      const y1 = getChartYValue(p1, curve.idx);

      if (y0 === undefined || y1 === undefined) {
        continue;
      }

      if (y0 * y1 <= 0) {
        const xRoot = interpolateRootX(p0.x, y0, p1.x, y1);
        if (xRoot === null) continue;
        if (xRoot < visibleMinX - 1e-9 || xRoot > visibleMaxX + 1e-9) {
          continue;
        }

        roots.push({
          id: `${curve.idx}-root-${xRoot.toFixed(6)}`,
          curve: curve.expression,
          x: xRoot,
          y: 0,
        });
      }
    }
  }

  return dedupeRoots(roots);
};

type ExperimentalStatistics = {
  seriesId: string;
  seriesName: string;
  count: number;
  meanX: number;
  meanY: number;
  medianY: number;
  minY: number;
  maxY: number;
  rangeY: number;
  varianceY: number;
  stdDevY: number;
  coefficientOfVariation: number | null;
};

type ErrorBarMode = "sd" | "sem" | "ci95";

type ErrorBarSeries = {
  seriesId: string;
  seriesName: string;
  meanX: number;
  meanY: number;
  lower: number;
  upper: number;
  mode: ErrorBarMode;
  stdDevY: number;
  semY: number;
  ci95Y: number;
  color: string;
};

const getStandardError = (stats: ExperimentalStatistics): number =>
  stats.count > 0 ? stats.stdDevY / Math.sqrt(stats.count) : 0;

const getCi95Margin = (stats: ExperimentalStatistics): number =>
  1.96 * getStandardError(stats);

const buildErrorBarSeries = (
  stats: ExperimentalStatistics[],
  series: ExperimentalSeries[],
  mode: ErrorBarMode
): ErrorBarSeries[] => {
  const colorById = new Map(series.map((item) => [item.id, item.color]));

  return stats.map((stat) => {
    const semY = getStandardError(stat);
    const ci95Y = getCi95Margin(stat);
    const margin =
      mode === "sd" ? stat.stdDevY : mode === "sem" ? semY : ci95Y;

    return {
      seriesId: stat.seriesId,
      seriesName: stat.seriesName,
      meanX: stat.meanX,
      meanY: stat.meanY,
      lower: stat.meanY - margin,
      upper: stat.meanY + margin,
      mode,
      stdDevY: stat.stdDevY,
      semY,
      ci95Y,
      color: colorById.get(stat.seriesId) ?? "#64748b",
    };
  });
};

const getErrorBarModeLabel = (mode: ErrorBarMode) =>
  mode === "sd" ? "SD" : mode === "sem" ? "SEM" : "IC95%";

const calculateExperimentalStatistics = (
  series: ExperimentalSeries[]
): ExperimentalStatistics[] =>
  series.map((item) => {
    const values = item.points
      .map((point) => point.y)
      .filter((y) => Number.isFinite(y));
    const xValues = item.points
      .map((point) => point.x)
      .filter((x) => Number.isFinite(x));
    const count = values.length;

    if (count === 0) {
      return {
        seriesId: item.id,
        seriesName: item.name,
        count: 0,
        meanX: 0,
        meanY: 0,
        medianY: 0,
        minY: 0,
        maxY: 0,
        rangeY: 0,
        varianceY: 0,
        stdDevY: 0,
        coefficientOfVariation: null,
      };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const meanY = values.reduce((sum, value) => sum + value, 0) / count;
    const meanX =
      xValues.length > 0
        ? xValues.reduce((sum, value) => sum + value, 0) / xValues.length
        : 0;
    const medianY =
      count % 2 === 0
        ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
        : sorted[Math.floor(count / 2)];
    const minY = sorted[0];
    const maxY = sorted[count - 1];
    const rangeY = maxY - minY;
    const varianceY =
      count > 1
        ? values.reduce((sum, value) => sum + (value - meanY) ** 2, 0) /
          (count - 1)
        : 0;
    const stdDevY = Math.sqrt(varianceY);
    const coefficientOfVariation =
      meanY === 0 ? null : (stdDevY / meanY) * 100;

    return {
      seriesId: item.id,
      seriesName: item.name,
      count,
      meanX,
      meanY,
      medianY,
      minY,
      maxY,
      rangeY,
      varianceY,
      stdDevY,
      coefficientOfVariation,
    };
  });

const formatExperimentalStat = (value: number) => value.toFixed(4);

type CorrelationMethod = "pearson" | "spearman";

type CorrelationStrength =
  | "very-weak"
  | "weak"
  | "moderate"
  | "strong"
  | "very-strong";

type CorrelationDirection = "positive" | "negative";

type CorrelationResult = {
  seriesA: string;
  seriesB: string;
  method: CorrelationMethod;
  coefficient: number;
  strength: CorrelationStrength;
  direction: CorrelationDirection;
};

type CorrelationMatrixRow = {
  seriesName: string;
  correlations: number[];
};

type CorrelationUnavailablePair = {
  seriesA: string;
  seriesB: string;
  method: CorrelationMethod;
};

const getPairedSeriesYValues = (
  seriesA: ExperimentalSeries,
  seriesB: ExperimentalSeries
): { valuesA: number[]; valuesB: number[] } | null => {
  const pairCount = Math.min(seriesA.points.length, seriesB.points.length);
  const valuesA: number[] = [];
  const valuesB: number[] = [];

  for (let index = 0; index < pairCount; index += 1) {
    const valueA = seriesA.points[index]?.y;
    const valueB = seriesB.points[index]?.y;
    if (!Number.isFinite(valueA) || !Number.isFinite(valueB)) continue;
    valuesA.push(valueA);
    valuesB.push(valueB);
  }

  return valuesA.length >= 2 ? { valuesA, valuesB } : null;
};

const calculatePearsonCorrelation = (
  xValues: number[],
  yValues: number[]
): number | null => {
  const count = xValues.length;
  if (count < 2 || count !== yValues.length) return null;

  const meanX = xValues.reduce((sum, value) => sum + value, 0) / count;
  const meanY = yValues.reduce((sum, value) => sum + value, 0) / count;

  let covariance = 0;
  let varianceX = 0;
  let varianceY = 0;

  for (let index = 0; index < count; index += 1) {
    const deltaX = xValues[index] - meanX;
    const deltaY = yValues[index] - meanY;
    covariance += deltaX * deltaY;
    varianceX += deltaX * deltaX;
    varianceY += deltaY * deltaY;
  }

  if (varianceX === 0 || varianceY === 0) return null;

  return covariance / Math.sqrt(varianceX * varianceY);
};

const rankValues = (values: number[]): number[] => {
  const indexed = values.map((value, index) => ({ value, index }));
  indexed.sort((left, right) => left.value - right.value);

  const ranks = new Array<number>(values.length);
  let start = 0;

  while (start < indexed.length) {
    let end = start;
    while (
      end + 1 < indexed.length &&
      indexed[end + 1].value === indexed[start].value
    ) {
      end += 1;
    }

    const averageRank = (start + end + 2) / 2;
    for (let index = start; index <= end; index += 1) {
      ranks[indexed[index].index] = averageRank;
    }
    start = end + 1;
  }

  return ranks;
};

const calculateSpearmanCorrelation = (
  xValues: number[],
  yValues: number[]
): number | null =>
  calculatePearsonCorrelation(rankValues(xValues), rankValues(yValues));

const classifyCorrelationStrength = (
  coefficient: number
): CorrelationStrength => {
  const absolute = Math.abs(coefficient);
  if (absolute < 0.2) return "very-weak";
  if (absolute < 0.4) return "weak";
  if (absolute < 0.6) return "moderate";
  if (absolute < 0.8) return "strong";
  return "very-strong";
};

const getCorrelationDirection = (
  coefficient: number
): CorrelationDirection => (coefficient >= 0 ? "positive" : "negative");

const getCorrelationMethodLabel = (method: CorrelationMethod) =>
  method === "pearson" ? "Pearson" : "Spearman";

const getCorrelationStrengthLabel = (
  strength: CorrelationStrength,
  direction: CorrelationDirection
) => {
  const strengthLabels: Record<CorrelationStrength, string> = {
    "very-weak": "Muy débil",
    weak: "Débil",
    moderate: "Moderada",
    strong: "Fuerte",
    "very-strong": "Muy fuerte",
  };
  const directionLabel = direction === "positive" ? "positiva" : "negativa";
  return `${strengthLabels[strength]} ${directionLabel}`;
};

const formatCorrelationCoefficient = (value: number) => value.toFixed(4);

const formatCorrelationMatrixValue = (value: number) =>
  Number.isFinite(value) ? value.toFixed(2) : "N/A";

const computeSeriesPairCorrelation = (
  seriesA: ExperimentalSeries,
  seriesB: ExperimentalSeries,
  method: CorrelationMethod
): number | null => {
  const paired = getPairedSeriesYValues(seriesA, seriesB);
  if (!paired) return null;

  return method === "pearson"
    ? calculatePearsonCorrelation(paired.valuesA, paired.valuesB)
    : calculateSpearmanCorrelation(paired.valuesA, paired.valuesB);
};

const buildCorrelationAnalysis = (
  series: ExperimentalSeries[],
  method: CorrelationMethod
): {
  results: CorrelationResult[];
  unavailablePairs: CorrelationUnavailablePair[];
  matrix: CorrelationMatrixRow[];
} => {
  const results: CorrelationResult[] = [];
  const unavailablePairs: CorrelationUnavailablePair[] = [];

  for (let indexA = 0; indexA < series.length; indexA += 1) {
    for (let indexB = indexA + 1; indexB < series.length; indexB += 1) {
      const coefficient = computeSeriesPairCorrelation(
        series[indexA],
        series[indexB],
        method
      );

      if (coefficient == null) {
        unavailablePairs.push({
          seriesA: series[indexA].name,
          seriesB: series[indexB].name,
          method,
        });
        continue;
      }

      results.push({
        seriesA: series[indexA].name,
        seriesB: series[indexB].name,
        method,
        coefficient,
        strength: classifyCorrelationStrength(coefficient),
        direction: getCorrelationDirection(coefficient),
      });
    }
  }

  const matrix: CorrelationMatrixRow[] =
    series.length >= 3
      ? series.map((rowSeries, rowIndex) => ({
          seriesName: rowSeries.name,
          correlations: series.map((columnSeries, columnIndex) => {
            if (rowIndex === columnIndex) return 1;
            const coefficient = computeSeriesPairCorrelation(
              rowSeries,
              columnSeries,
              method
            );
            return coefficient ?? Number.NaN;
          }),
        }))
      : [];

  return { results, unavailablePairs, matrix };
};

type HeatmapMode = "correlation" | "values";

type HeatmapCell = {
  row: string;
  column: string;
  value: number;
};

type HeatmapAnalysis = {
  mode: HeatmapMode;
  rows: string[];
  columns: string[];
  cells: HeatmapCell[];
};

const getHeatmapCellValue = (
  analysis: HeatmapAnalysis,
  row: string,
  column: string
) =>
  analysis.cells.find(
    (cell) => cell.row === row && cell.column === column
  )?.value ?? Number.NaN;

const buildCorrelationHeatmap = (
  series: ExperimentalSeries[]
): HeatmapAnalysis | null => {
  if (series.length === 0) return null;

  const rows = series.map((item) => item.name);
  const columns = rows;
  const cells: HeatmapCell[] = [];

  for (let rowIndex = 0; rowIndex < series.length; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < series.length; columnIndex += 1) {
      const value =
        rowIndex === columnIndex
          ? 1
          : (computeSeriesPairCorrelation(
              series[rowIndex],
              series[columnIndex],
              "pearson"
            ) ?? Number.NaN);

      cells.push({
        row: rows[rowIndex],
        column: columns[columnIndex],
        value,
      });
    }
  }

  return { mode: "correlation", rows, columns, cells };
};

const buildValuesHeatmap = (
  series: ExperimentalSeries[]
): HeatmapAnalysis | null => {
  if (series.length === 0) return null;

  const observationCount = Math.max(
    ...series.map((item) =>
      item.points.filter((point) => Number.isFinite(point.y)).length
    ),
    0
  );

  if (observationCount === 0) return null;

  const rows = series.map((item) => item.name);
  const columns = Array.from(
    { length: observationCount },
    (_, index) => `Obs ${index + 1}`
  );
  const cells: HeatmapCell[] = [];

  series.forEach((item) => {
    const yValues = item.points
      .map((point) => point.y)
      .filter((value) => Number.isFinite(value));

    columns.forEach((column, columnIndex) => {
      cells.push({
        row: item.name,
        column,
        value: yValues[columnIndex] ?? Number.NaN,
      });
    });
  });

  return { mode: "values", rows, columns, cells };
};

const getHeatmapValuesBounds = (analysis: HeatmapAnalysis) => {
  const finiteValues = analysis.cells
    .map((cell) => cell.value)
    .filter((value) => Number.isFinite(value));

  if (finiteValues.length === 0) {
    return { min: 0, max: 1 };
  }

  return {
    min: Math.min(...finiteValues),
    max: Math.max(...finiteValues),
  };
};

const interpolateRgb = (
  start: [number, number, number],
  end: [number, number, number],
  factor: number
): string => {
  const clamped = Math.max(0, Math.min(1, factor));
  const red = Math.round(start[0] + (end[0] - start[0]) * clamped);
  const green = Math.round(start[1] + (end[1] - start[1]) * clamped);
  const blue = Math.round(start[2] + (end[2] - start[2]) * clamped);
  return `rgb(${red}, ${green}, ${blue})`;
};

const getCorrelationHeatmapCellColors = (value: number) => {
  const neutral: [number, number, number] = [148, 163, 184];
  const positive: [number, number, number] = [37, 99, 235];
  const negative: [number, number, number] = [220, 38, 38];

  if (!Number.isFinite(value)) {
    return {
      backgroundColor: "rgb(148, 163, 184)",
      color: "#ffffff",
    };
  }

  const clamped = Math.max(-1, Math.min(1, value));

  if (clamped === 0) {
    return {
      backgroundColor: "rgb(148, 163, 184)",
      color: "#ffffff",
    };
  }

  if (clamped > 0) {
    return {
      backgroundColor: interpolateRgb(neutral, positive, clamped),
      color: "#ffffff",
    };
  }

  return {
    backgroundColor: interpolateRgb(negative, neutral, Math.abs(clamped)),
    color: "#ffffff",
  };
};

const getValuesHeatmapCellColors = (
  value: number,
  min: number,
  max: number
) => {
  const light: [number, number, number] = [241, 245, 249];
  const intense: [number, number, number] = [37, 99, 235];

  if (!Number.isFinite(value)) {
    return {
      backgroundColor: "rgb(241, 245, 249)",
      color: "#64748b",
    };
  }

  const normalized = max === min ? 0.5 : (value - min) / (max - min);

  return {
    backgroundColor: interpolateRgb(light, intense, normalized),
    color: normalized > 0.55 ? "#ffffff" : "#334155",
  };
};

const getHeatmapModeLabel = (mode: HeatmapMode) =>
  mode === "correlation" ? "Correlaciones" : "Valores";

const formatHeatmapCellDisplayValue = (
  analysis: HeatmapAnalysis,
  value: number
) => {
  if (!Number.isFinite(value)) return "N/A";
  if (analysis.mode === "correlation") return value.toFixed(2);
  return formatExperimentalStat(value);
};

const getHeatmapInterpretationLines = (
  analysis: HeatmapAnalysis | null
): string[] => {
  if (!analysis || analysis.rows.length === 0) {
    return ["No hay datos suficientes para generar un Heatmap."];
  }

  const lines: string[] = [
    `Modo: ${getHeatmapModeLabel(analysis.mode)}.`,
    `Series: ${analysis.rows.length}.`,
    `Dimensión: ${analysis.rows.length}×${analysis.columns.length}.`,
  ];

  if (analysis.mode === "correlation") {
    const seenPairs = new Set<string>();
    let strongPositiveCount = 0;
    let strongNegativeCount = 0;

    analysis.cells.forEach((cell) => {
      if (cell.row === cell.column || !Number.isFinite(cell.value)) return;

      const pairKey = [cell.row, cell.column].sort().join("|");
      if (seenPairs.has(pairKey)) return;
      seenPairs.add(pairKey);

      if (cell.value > 0.8) {
        strongPositiveCount += 1;
        lines.push(
          `Las series ${cell.row} y ${cell.column} mostraron alta asociación positiva (r = ${cell.value.toFixed(2)}).`
        );
      } else if (cell.value < -0.8) {
        strongNegativeCount += 1;
        lines.push(
          `Las series ${cell.row} y ${cell.column} mostraron asociación negativa muy fuerte (r = ${cell.value.toFixed(2)}).`
        );
      }
    });

    if (
      strongPositiveCount === 0 &&
      strongNegativeCount === 0 &&
      analysis.rows.length > 1
    ) {
      lines.push(
        "La matriz de correlación se mantiene cercana a valores moderados o neutros."
      );
    }
  } else {
    const { min, max } = getHeatmapValuesBounds(analysis);
    const highCells = analysis.cells.filter((cell) => {
      if (!Number.isFinite(cell.value)) return false;
      const normalized = max === min ? 0.5 : (cell.value - min) / (max - min);
      return normalized >= 0.85;
    });

    if (highCells.length > 0) {
      const sample = highCells.slice(0, 3);
      sample.forEach((cell) => {
        lines.push(
          `Se observó un bloque de observaciones con valores elevados en ${cell.row} (${cell.column}).`
        );
      });
    } else {
      lines.push(
        "No se detectaron bloques dominantes de valores extremadamente altos."
      );
    }
  }

  return lines;
};

type ScientificHeatmapGridProps = {
  analysis: HeatmapAnalysis;
};

function ScientificHeatmapGrid({ analysis }: ScientificHeatmapGridProps) {
  const valueBounds = useMemo(
    () =>
      analysis.mode === "values" ? getHeatmapValuesBounds(analysis) : null,
    [analysis]
  );
  const showCellValues =
    analysis.columns.length <= 14 && analysis.rows.length <= 10;

  return (
    <div className="overflow-x-auto mt-2">
      <div
        className="gap-0.5 min-w-max"
        style={{
          display: "grid",
          gridTemplateColumns: `minmax(6.5rem, auto) repeat(${analysis.columns.length}, minmax(3rem, 1fr))`,
        }}
      >
        <div className="px-2 py-1" />
        {analysis.columns.map((column) => (
          <div
            key={`heatmap-col-${column}`}
            className="px-1 py-1 text-center text-xs font-semibold text-[var(--app-heading)] truncate"
            title={column}
          >
            {column}
          </div>
        ))}

        {analysis.rows.map((row) => (
          <div key={`heatmap-row-${row}`} className="contents">
            <div
              className="px-2 py-1 text-xs font-semibold text-[var(--app-heading)] truncate"
              title={row}
            >
              {row}
            </div>
            {analysis.columns.map((column) => {
              const value = getHeatmapCellValue(analysis, row, column);
              const colors =
                analysis.mode === "correlation"
                  ? getCorrelationHeatmapCellColors(value)
                  : getValuesHeatmapCellColors(
                      value,
                      valueBounds?.min ?? 0,
                      valueBounds?.max ?? 1
                    );

              return (
                <div
                  key={`heatmap-cell-${row}-${column}`}
                  className="min-h-[2.25rem] flex items-center justify-center rounded-sm px-1 py-1 text-xs tabular-nums"
                  style={{
                    backgroundColor: colors.backgroundColor,
                    color: colors.color,
                  }}
                  title={`${row} × ${column}: ${formatHeatmapCellDisplayValue(analysis, value)}`}
                >
                  {showCellValues
                    ? formatHeatmapCellDisplayValue(analysis, value)
                    : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

type BubblePoint = {
  x: number;
  y: number;
  size: number;
  seriesName: string;
};

type BubblePlotAnalysis = {
  points: BubblePoint[];
  minSize: number;
  maxSize: number;
  totalPoints: number;
};

const BUBBLE_RADIUS_MIN = 6;
const BUBBLE_RADIUS_MAX = 24;
const BUBBLE_RADIUS_FIXED = 15;

const normalizeBubbleRadius = (
  value: number,
  minValue: number,
  maxValue: number
): number => {
  if (maxValue === minValue) return BUBBLE_RADIUS_FIXED;
  const factor = (value - minValue) / (maxValue - minValue);
  return BUBBLE_RADIUS_MIN + factor * (BUBBLE_RADIUS_MAX - BUBBLE_RADIUS_MIN);
};

const isExperimentalOutlierPoint = (
  outliers: ExperimentalOutlier[],
  seriesName: string,
  x: number,
  y: number
) =>
  outliers.some(
    (outlier) =>
      outlier.seriesName === seriesName && outlier.x === x && outlier.y === y
  );

const buildBubblePlotAnalysis = (
  series: ExperimentalSeries[]
): BubblePlotAnalysis | null => {
  const finiteYValues = series.flatMap((item) =>
    item.points
      .map((point) => point.y)
      .filter((value) => Number.isFinite(value))
  );

  if (finiteYValues.length === 0) return null;

  const minValue = Math.min(...finiteYValues);
  const maxValue = Math.max(...finiteYValues);
  const points: BubblePoint[] = [];

  series.forEach((item) => {
    item.points.forEach((point) => {
      if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return;

      points.push({
        x: point.x,
        y: point.y,
        size: normalizeBubbleRadius(point.y, minValue, maxValue),
        seriesName: item.name,
      });
    });
  });

  if (points.length === 0) return null;

  const sizes = points.map((point) => point.size);

  return {
    points,
    minSize: Math.min(...sizes),
    maxSize: Math.max(...sizes),
    totalPoints: points.length,
  };
};

const getBubblePlotInterpretationLines = (
  analysis: BubblePlotAnalysis | null,
  outlierCount: number
): string[] => {
  if (!analysis || analysis.totalPoints === 0) {
    return ["No hay datos suficientes para generar un Bubble Plot."];
  }

  const lines: string[] = [
    `Puntos representados: ${analysis.totalPoints}.`,
    `Rango de radios: ${analysis.minSize.toFixed(1)}–${analysis.maxSize.toFixed(1)} px.`,
  ];

  const xValues = analysis.points.map((point) => point.x);
  const yValues = analysis.points.map((point) => point.y);
  const xSpan = Math.max(...xValues) - Math.min(...xValues);
  const ySpan = Math.max(...yValues) - Math.min(...yValues);
  const relativeSpread = Math.max(xSpan, ySpan);
  const relativeScale =
    Math.max(Math.abs(Math.max(...yValues)), Math.abs(Math.min(...yValues)), 1) ||
    1;

  if (relativeSpread / relativeScale < 0.08 && analysis.totalPoints >= 3) {
    lines.push(
      "Las burbujas muestran una concentración compacta en el plano experimental."
    );
  } else if (relativeSpread / relativeScale > 0.45) {
    lines.push(
      "Las burbujas están ampliamente dispersas en el dominio observado."
    );
  }

  const sortedByY = [...analysis.points].sort((left, right) => left.y - right.y);
  const lowerThreshold = sortedByY[Math.floor((sortedByY.length - 1) * 0.33)]?.y;
  const upperThreshold = sortedByY[Math.floor((sortedByY.length - 1) * 0.66)]?.y;

  if (lowerThreshold != null && upperThreshold != null) {
    const largeBubbleCount = analysis.points.filter(
      (point) => point.y >= upperThreshold
    ).length;
    const smallBubbleCount = analysis.points.filter(
      (point) => point.y <= lowerThreshold
    ).length;

    if (largeBubbleCount / analysis.totalPoints >= 0.5) {
      lines.push(
        "Predominan burbujas de mayor tamaño, asociadas a valores Y elevados."
      );
    } else if (smallBubbleCount / analysis.totalPoints >= 0.5) {
      lines.push(
        "Predominan burbujas de menor tamaño, asociadas a valores Y bajos."
      );
    }
  }

  if (outlierCount > 0) {
    lines.push(
      `${outlierCount} burbuja(s) coinciden con outliers detectados (SCI-8).`
    );
  }

  return lines;
};

type BubbleScatterPoint = {
  x: number;
  y: number;
  size: number;
  isOutlier: boolean;
};

type BubbleScatterShapeProps = ScatterMarkerProps & {
  payload?: BubbleScatterPoint;
  fill?: string;
};

const renderBubbleScatterShape = (props: BubbleScatterShapeProps) => {
  const { cx, cy, payload, fill } = props;
  if (cx == null || cy == null) return null;

  const radius = payload?.size ?? BUBBLE_RADIUS_FIXED;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={radius}
      fill={fill ?? "var(--app-accent)"}
      fillOpacity={0.7}
      stroke={payload?.isOutlier ? "#dc2626" : fill ?? "var(--app-accent)"}
      strokeWidth={payload?.isOutlier ? 2.5 : 1}
    />
  );
};

type ScientificBubblePlotChartProps = {
  analysis: BubblePlotAnalysis;
  series: ExperimentalSeries[];
  outliers: ExperimentalOutlier[];
  chartTheme: ReturnType<typeof getChartTheme>;
};

function ScientificBubblePlotChart({
  analysis,
  series,
  outliers,
  chartTheme,
}: ScientificBubblePlotChartProps) {
  const seriesColorByName = useMemo(
    () => new Map(series.map((item) => [item.name, item.color])),
    [series]
  );

  const pointsBySeries = useMemo(() => {
    const grouped = new Map<string, BubbleScatterPoint[]>();

    analysis.points.forEach((point) => {
      const current = grouped.get(point.seriesName) ?? [];
      current.push({
        x: point.x,
        y: point.y,
        size: point.size,
        isOutlier: isExperimentalOutlierPoint(
          outliers,
          point.seriesName,
          point.x,
          point.y
        ),
      });
      grouped.set(point.seriesName, current);
    });

    return grouped;
  }, [analysis.points, outliers]);

  return (
    <div className="h-[240px] mt-3">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
          <XAxis
            type="number"
            dataKey="x"
            name="X"
            tick={{ fill: chartTheme.axis, fontSize: 11 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Y"
            tick={{ fill: chartTheme.axis, fontSize: 11 }}
          />
          <Tooltip
            content={({ active, payload: tooltipPayload }) => {
              if (!active || !tooltipPayload?.length) return null;

              const point = tooltipPayload[0]?.payload as
                | BubbleScatterPoint
                | undefined;
              const seriesName = tooltipPayload[0]?.name ?? "Serie";

              if (!point) return null;

              return (
                <div
                  className="rounded-lg border px-3 py-2 text-sm shadow-sm"
                  style={{
                    borderColor: chartTheme.tooltipBorder,
                    backgroundColor: chartTheme.tooltipBg,
                    color: chartTheme.tooltipColor,
                  }}
                >
                  <p className="font-semibold">{seriesName}</p>
                  <p>x = {point.x.toFixed(4)}</p>
                  <p>y = {point.y.toFixed(4)}</p>
                  <p>Radio = {point.size.toFixed(1)} px</p>
                  {point.isOutlier ? <p>Outlier (SCI-8)</p> : null}
                </div>
              );
            }}
          />
          {Array.from(pointsBySeries.entries()).map(([seriesName, data]) => (
            <Scatter
              key={`bubble-series-${seriesName}`}
              name={seriesName}
              data={data}
              fill={seriesColorByName.get(seriesName) ?? "var(--app-accent)"}
              shape={renderBubbleScatterShape}
              line={false}
              isAnimationActive={false}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

type RadarMetric = {
  label: string;
  value: number;
};

type RadarSeriesProfile = {
  seriesName: string;
  metrics: RadarMetric[];
};

type RadarPlotAnalysis = {
  profiles: RadarSeriesProfile[];
  metricLabels: string[];
};

const RADAR_METRIC_LABELS = [
  "Media",
  "Mediana",
  "SD",
  "Mínimo",
  "Máximo",
  "Rango",
] as const;

const extractRadarRawMetrics = (stats: ExperimentalStatistics) => [
  { label: "Media" as const, raw: stats.meanY },
  { label: "Mediana" as const, raw: stats.medianY },
  { label: "SD" as const, raw: stats.stdDevY },
  { label: "Mínimo" as const, raw: stats.minY },
  { label: "Máximo" as const, raw: stats.maxY },
  { label: "Rango" as const, raw: stats.rangeY },
];

const buildRadarPlotAnalysis = (
  statistics: ExperimentalStatistics[]
): RadarPlotAnalysis | null => {
  const validStatistics = statistics.filter((stats) => stats.count > 0);
  if (validStatistics.length === 0) return null;

  const rawProfiles = validStatistics.map((stats) => ({
    seriesName: stats.seriesName,
    raws: extractRadarRawMetrics(stats),
  }));

  const minByLabel = new Map<string, number>();
  const maxByLabel = new Map<string, number>();

  rawProfiles.forEach((profile) => {
    profile.raws.forEach(({ label, raw }) => {
      if (!Number.isFinite(raw)) return;
      minByLabel.set(label, Math.min(minByLabel.get(label) ?? raw, raw));
      maxByLabel.set(label, Math.max(maxByLabel.get(label) ?? raw, raw));
    });
  });

  const profiles: RadarSeriesProfile[] = rawProfiles.map((profile) => ({
    seriesName: profile.seriesName,
    metrics: RADAR_METRIC_LABELS.map((label) => {
      const raw =
        profile.raws.find((metric) => metric.label === label)?.raw ?? 0;
      const min = minByLabel.get(label) ?? raw;
      const max = maxByLabel.get(label) ?? raw;
      const value =
        max === min ? 0.5 : (raw - min) / (max - min);

      return { label, value: Math.max(0, Math.min(1, value)) };
    }),
  }));

  return {
    profiles,
    metricLabels: [...RADAR_METRIC_LABELS],
  };
};

const getRadarProfileDistance = (
  left: RadarSeriesProfile,
  right: RadarSeriesProfile
) => {
  let sumSquares = 0;

  left.metrics.forEach((metric, index) => {
    const otherValue = right.metrics[index]?.value ?? 0;
    const delta = metric.value - otherValue;
    sumSquares += delta * delta;
  });

  return Math.sqrt(sumSquares / left.metrics.length);
};

const getRadarPlotInterpretationLines = (
  analysis: RadarPlotAnalysis | null
): string[] => {
  if (!analysis || analysis.profiles.length === 0) {
    return ["No hay datos suficientes para generar un Radar Plot."];
  }

  const lines: string[] = [
    `Series comparadas: ${analysis.profiles.length}.`,
    `Métricas usadas: ${analysis.metricLabels.join(", ")}.`,
  ];

  if (analysis.profiles.length >= 2) {
    const similarPairs: string[] = [];

    for (let indexA = 0; indexA < analysis.profiles.length; indexA += 1) {
      for (
        let indexB = indexA + 1;
        indexB < analysis.profiles.length;
        indexB += 1
      ) {
        const profileA = analysis.profiles[indexA];
        const profileB = analysis.profiles[indexB];
        const distance = getRadarProfileDistance(profileA, profileB);

        if (distance < 0.18) {
          similarPairs.push(
            `Las series ${profileA.seriesName} y ${profileB.seriesName} presentan perfiles estadísticos similares.`
          );
        } else if (distance > 0.45) {
          lines.push(
            `Las series ${profileA.seriesName} y ${profileB.seriesName} muestran perfiles muy distintos.`
          );
        }
      }
    }

    lines.push(...similarPairs);
  }

  const standardDeviationMetricIndex = analysis.metricLabels.indexOf("SD");
  if (standardDeviationMetricIndex >= 0) {
    const sdValues = analysis.profiles.map(
      (profile) => profile.metrics[standardDeviationMetricIndex]?.value ?? 0
    );
    const maxSd = Math.max(...sdValues);
    const dominantSdIndex = sdValues.indexOf(maxSd);
    const averageSd =
      sdValues.reduce((sum, value) => sum + value, 0) / sdValues.length;

    if (maxSd - averageSd >= 0.25) {
      lines.push(
        `La serie ${analysis.profiles[dominantSdIndex].seriesName} muestra una dispersión significativamente mayor.`
      );
    }
  }

  const averageScores = analysis.profiles.map((profile) => ({
    seriesName: profile.seriesName,
    score:
      profile.metrics.reduce((sum, metric) => sum + metric.value, 0) /
      profile.metrics.length,
  }));
  const dominantSeries = averageScores.reduce((best, current) =>
    current.score > best.score ? current : best
  );
  const runnerUp = averageScores
    .filter((item) => item.seriesName !== dominantSeries.seriesName)
    .reduce(
      (best, current) => (current.score > best.score ? current : best),
      { seriesName: "", score: -1 }
    );

  if (
    analysis.profiles.length >= 2 &&
    dominantSeries.score - runnerUp.score >= 0.2
  ) {
    lines.push(
      `La serie ${dominantSeries.seriesName} presenta un perfil estadístico dominante en el radar.`
    );
  }

  return lines;
};

type ScientificRadarPlotProps = {
  analysis: RadarPlotAnalysis;
  seriesColors: Map<string, string>;
};

function ScientificRadarPlot({
  analysis,
  seriesColors,
}: ScientificRadarPlotProps) {
  const width = 320;
  const height = 280;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 96;
  const metricCount = analysis.metricLabels.length;

  const getPoint = (metricIndex: number, normalizedValue: number) => {
    const angle = -Math.PI / 2 + (metricIndex * 2 * Math.PI) / metricCount;
    const distance = normalizedValue * radius;
    return {
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
    };
  };

  const axisPoints = analysis.metricLabels.map((label, index) => {
    const outer = getPoint(index, 1);
    return { label, outer, index };
  });

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full max-h-[260px]"
      role="img"
      aria-label="Radar plot de perfiles estadísticos"
    >
      {gridLevels.map((level) => {
        const polygonPoints = axisPoints
          .map(({ index }) => {
            const point = getPoint(index, level);
            return `${point.x},${point.y}`;
          })
          .join(" ");

        return (
          <polygon
            key={`radar-grid-${level}`}
            points={polygonPoints}
            fill="none"
            stroke="var(--app-border)"
            strokeWidth={1}
          />
        );
      })}

      {axisPoints.map(({ label, outer, index }) => (
        <g key={`radar-axis-${label}`}>
          <line
            x1={centerX}
            y1={centerY}
            x2={outer.x}
            y2={outer.y}
            stroke="var(--app-border)"
            strokeWidth={1}
          />
          <text
            x={getPoint(index, 1.14).x}
            y={getPoint(index, 1.14).y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--app-text-muted)"
            fontSize={10}
          >
            {label}
          </text>
        </g>
      ))}

      {analysis.profiles.map((profile) => {
        const color =
          seriesColors.get(profile.seriesName) ?? "var(--app-accent)";
        const polygonPoints = profile.metrics
          .map((metric, index) => {
            const point = getPoint(index, metric.value);
            return `${point.x},${point.y}`;
          })
          .join(" ");

        return (
          <g key={`radar-profile-${profile.seriesName}`}>
            <polygon
              points={polygonPoints}
              fill={color}
              fillOpacity={0.22}
              stroke={color}
              strokeWidth={2}
            />
          </g>
        );
      })}
    </svg>
  );
}

type OutlierMethod = "iqr" | "zscore";

type ExperimentalOutlier = {
  id: string;
  seriesId: string;
  seriesName: string;
  x: number;
  y: number;
  method: OutlierMethod;
  score: number;
};

const getQuantile = (sortedValues: number[], quantile: number): number => {
  if (sortedValues.length === 0) return 0;

  const position = (sortedValues.length - 1) * quantile;
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);

  if (lowerIndex === upperIndex) return sortedValues[lowerIndex];

  const weight = position - lowerIndex;
  return (
    sortedValues[lowerIndex] * (1 - weight) +
    sortedValues[upperIndex] * weight
  );
};

const calculateIQROutliers = (
  series: ExperimentalSeries
): ExperimentalOutlier[] => {
  const finitePoints = series.points.filter(
    (point) => Number.isFinite(point.x) && Number.isFinite(point.y)
  );

  if (finitePoints.length === 0) return [];

  const sortedY = [...finitePoints.map((point) => point.y)].sort(
    (left, right) => left - right
  );
  const q1 = getQuantile(sortedY, 0.25);
  const q3 = getQuantile(sortedY, 0.75);
  const iqr = q3 - q1;

  if (iqr === 0) return [];

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  return finitePoints.reduce<ExperimentalOutlier[]>((outliers, point, index) => {
    if (point.y >= lowerBound && point.y <= upperBound) return outliers;

    const score =
      point.y > upperBound
        ? (point.y - upperBound) / iqr
        : (lowerBound - point.y) / iqr;

    outliers.push({
      id: `${series.id}-iqr-${index}-${point.x}-${point.y}`,
      seriesId: series.id,
      seriesName: series.name,
      x: point.x,
      y: point.y,
      method: "iqr",
      score,
    });

    return outliers;
  }, []);
};

const calculateZScoreOutliers = (
  series: ExperimentalSeries
): ExperimentalOutlier[] => {
  const finitePoints = series.points.filter(
    (point) => Number.isFinite(point.x) && Number.isFinite(point.y)
  );
  const values = finitePoints.map((point) => point.y);
  const count = values.length;

  if (count < 2) return [];

  const mean = values.reduce((sum, value) => sum + value, 0) / count;
  const variance =
    count > 1
      ? values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (count - 1)
      : 0;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return [];

  return finitePoints.reduce<ExperimentalOutlier[]>((outliers, point, index) => {
    const zScore = (point.y - mean) / stdDev;
    if (Math.abs(zScore) <= 3) return outliers;

    outliers.push({
      id: `${series.id}-zscore-${index}-${point.x}-${point.y}`,
      seriesId: series.id,
      seriesName: series.name,
      x: point.x,
      y: point.y,
      method: "zscore",
      score: zScore,
    });

    return outliers;
  }, []);
};

const detectExperimentalOutliers = (
  series: ExperimentalSeries[],
  method: OutlierMethod
): ExperimentalOutlier[] =>
  series.flatMap((item) =>
    method === "iqr"
      ? calculateIQROutliers(item)
      : calculateZScoreOutliers(item)
  );

const summarizeOutliersBySeries = (
  series: ExperimentalSeries[],
  outliers: ExperimentalOutlier[]
) =>
  series.map((item) => ({
    seriesId: item.id,
    seriesName: item.name,
    count: outliers.filter((outlier) => outlier.seriesId === item.id).length,
  }));

const getOutlierMethodLabel = (method: OutlierMethod) =>
  method === "iqr" ? "IQR" : "Z-Score";

const formatOutlierScore = (score: number) => score.toFixed(4);

const HISTOGRAM_BINS_MIN = 5;
const HISTOGRAM_BINS_MAX = 30;
const HISTOGRAM_BINS_DEFAULT = 10;

type HistogramBin = {
  min: number;
  max: number;
  count: number;
};

type SeriesHistogram = {
  seriesId: string;
  seriesName: string;
  bins: HistogramBin[];
  sampleSize: number;
};

const clampHistogramBins = (bins: number) =>
  Math.min(
    HISTOGRAM_BINS_MAX,
    Math.max(HISTOGRAM_BINS_MIN, Math.round(bins))
  );

const generateHistogram = (
  series: ExperimentalSeries,
  binCount: number
): SeriesHistogram => {
  const values = series.points
    .map((point) => point.y)
    .filter((value) => Number.isFinite(value));
  const sampleSize = values.length;
  const sanitizedBinCount = clampHistogramBins(binCount);

  if (sampleSize === 0) {
    return {
      seriesId: series.id,
      seriesName: series.name,
      bins: [],
      sampleSize: 0,
    };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return {
      seriesId: series.id,
      seriesName: series.name,
      bins: [{ min, max, count: sampleSize }],
      sampleSize,
    };
  }

  const binWidth = (max - min) / sanitizedBinCount;
  const counts = new Array<number>(sanitizedBinCount).fill(0);

  values.forEach((value) => {
    let index = Math.floor((value - min) / binWidth);
    if (index >= sanitizedBinCount) index = sanitizedBinCount - 1;
    if (index < 0) index = 0;
    counts[index] += 1;
  });

  const bins: HistogramBin[] = counts.map((count, index) => ({
    min: min + index * binWidth,
    max: index === sanitizedBinCount - 1 ? max : min + (index + 1) * binWidth,
    count,
  }));

  return {
    seriesId: series.id,
    seriesName: series.name,
    bins,
    sampleSize,
  };
};

const generateSeriesHistograms = (
  series: ExperimentalSeries[],
  binCount: number
): SeriesHistogram[] =>
  series.map((item) => generateHistogram(item, binCount));

const formatHistogramBinRange = (bin: HistogramBin) =>
  `${formatExperimentalStat(bin.min)}–${formatExperimentalStat(bin.max)}`;

const toHistogramChartData = (histogram: SeriesHistogram) =>
  histogram.bins.map((bin, index) => ({
    label: formatHistogramBinRange(bin),
    count: bin.count,
    index,
  }));

type BoxPlotStatistics = {
  seriesId: string;
  seriesName: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  iqr: number;
  lowerWhisker: number;
  upperWhisker: number;
  outlierCount: number;
};

type BoxPlotAnalysis = BoxPlotStatistics & {
  sampleSize: number;
  outliers: number[];
};

const calculateBoxPlotStatistics = (
  series: ExperimentalSeries
): BoxPlotAnalysis => {
  const values = series.points
    .map((point) => point.y)
    .filter((value) => Number.isFinite(value));
  const sampleSize = values.length;

  if (sampleSize === 0) {
    return {
      seriesId: series.id,
      seriesName: series.name,
      min: 0,
      q1: 0,
      median: 0,
      q3: 0,
      max: 0,
      iqr: 0,
      lowerWhisker: 0,
      upperWhisker: 0,
      outlierCount: 0,
      sampleSize: 0,
      outliers: [],
    };
  }

  const sorted = [...values].sort((left, right) => left - right);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const q1 = getQuantile(sorted, 0.25);
  const median = getQuantile(sorted, 0.5);
  const q3 = getQuantile(sorted, 0.75);
  const iqr = q3 - q1;

  if (iqr === 0) {
    return {
      seriesId: series.id,
      seriesName: series.name,
      min,
      q1,
      median,
      q3,
      max,
      iqr: 0,
      lowerWhisker: min,
      upperWhisker: max,
      outlierCount: 0,
      sampleSize,
      outliers: [],
    };
  }

  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;
  const inlierValues = sorted.filter(
    (value) => value >= lowerFence && value <= upperFence
  );
  const outliers = sorted.filter(
    (value) => value < lowerFence || value > upperFence
  );
  const lowerWhisker =
    inlierValues.length > 0 ? Math.min(...inlierValues) : min;
  const upperWhisker =
    inlierValues.length > 0 ? Math.max(...inlierValues) : max;

  return {
    seriesId: series.id,
    seriesName: series.name,
    min,
    q1,
    median,
    q3,
    max,
    iqr,
    lowerWhisker,
    upperWhisker,
    outlierCount: outliers.length,
    sampleSize,
    outliers,
  };
};

const calculateBoxPlotStatisticsForSeries = (
  series: ExperimentalSeries[]
): BoxPlotAnalysis[] => series.map((item) => calculateBoxPlotStatistics(item));

const MiniBoxPlot = ({ analysis }: { analysis: BoxPlotAnalysis }) => {
  const width = 280;
  const height = 140;
  const padding = 20;
  const centerX = width / 2;
  const boxWidth = 52;
  const capWidth = boxWidth * 0.65;

  if (analysis.sampleSize === 0) {
    return (
      <p className={emptyState}>Sin datos válidos para el box plot.</p>
    );
  }

  const scaleValues = [
    analysis.min,
    analysis.max,
    analysis.lowerWhisker,
    analysis.upperWhisker,
    analysis.q1,
    analysis.q3,
    analysis.median,
    ...analysis.outliers,
  ];
  const plotMin = Math.min(...scaleValues);
  const plotMax = Math.max(...scaleValues);
  const range = plotMax - plotMin || 1;

  const scaleY = (value: number) =>
    padding + ((plotMax - value) / range) * (height - padding * 2);

  const yQ1 = scaleY(analysis.q1);
  const yQ3 = scaleY(analysis.q3);
  const yMedian = scaleY(analysis.median);
  const yLowerWhisker = scaleY(analysis.lowerWhisker);
  const yUpperWhisker = scaleY(analysis.upperWhisker);
  const boxTop = Math.min(yQ1, yQ3);
  const boxHeight = Math.max(Math.abs(yQ1 - yQ3), 1);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full"
      role="img"
      aria-label={`Box plot de ${analysis.seriesName}`}
    >
      <line
        x1={centerX}
        y1={yUpperWhisker}
        x2={centerX}
        y2={yLowerWhisker}
        stroke="var(--app-text-muted)"
        strokeWidth={2}
      />
      <line
        x1={centerX - capWidth / 2}
        y1={yUpperWhisker}
        x2={centerX + capWidth / 2}
        y2={yUpperWhisker}
        stroke="var(--app-text-muted)"
        strokeWidth={2}
      />
      <line
        x1={centerX - capWidth / 2}
        y1={yLowerWhisker}
        x2={centerX + capWidth / 2}
        y2={yLowerWhisker}
        stroke="var(--app-text-muted)"
        strokeWidth={2}
      />
      <rect
        x={centerX - boxWidth / 2}
        y={boxTop}
        width={boxWidth}
        height={boxHeight}
        fill="var(--app-accent)"
        fillOpacity={0.22}
        stroke="var(--app-accent)"
        strokeWidth={2}
      />
      <line
        x1={centerX - boxWidth / 2}
        y1={yMedian}
        x2={centerX + boxWidth / 2}
        y2={yMedian}
        stroke="var(--app-heading)"
        strokeWidth={2}
      />
      {analysis.outliers.map((value, index) => (
        <circle
          key={`${analysis.seriesId}-outlier-${index}-${value}`}
          cx={centerX}
          cy={scaleY(value)}
          r={4}
          fill="#dc2626"
          stroke="#ffffff"
          strokeWidth={1.5}
        />
      ))}
    </svg>
  );
};

type ViolinDensityPoint = {
  value: number;
  density: number;
};

type ViolinShapeInterpretation = "symmetric" | "right-skewed" | "left-skewed";

type ViolinPlotAnalysis = {
  seriesName: string;
  sampleSize: number;
  min: number;
  max: number;
  q1: number;
  median: number;
  q3: number;
  densityPoints: ViolinDensityPoint[];
  shapeInterpretation: ViolinShapeInterpretation;
};

const VIOLIN_DENSITY_POINT_COUNT = 50;

const gaussianKernel = (u: number) => Math.exp(-0.5 * u * u);

const calculateSilvermanBandwidth = (values: number[]): number => {
  const sampleSize = values.length;
  if (sampleSize < 2) return 1;

  const stats = getSampleMeanAndStdDev(values);
  const standardDeviation = stats?.stdDev ?? 0;
  if (standardDeviation === 0) {
    const sorted = [...values].sort((left, right) => left - right);
    const range = sorted[sorted.length - 1] - sorted[0];
    return range > 0 ? range / 4 : 1;
  }

  return 1.06 * standardDeviation * sampleSize ** -0.2;
};

const calculateKernelDensity = (
  values: number[],
  min: number,
  max: number,
  pointCount: number = VIOLIN_DENSITY_POINT_COUNT,
  normalizeToPeak = true
): ViolinDensityPoint[] => {
  const sampleSize = values.length;
  if (sampleSize === 0) return [];

  if (min === max) {
    return [{ value: min, density: 1 }];
  }

  const bandwidth = Math.max(calculateSilvermanBandwidth(values), 1e-9);
  const sanitizedPointCount = Math.min(80, Math.max(40, Math.round(pointCount)));
  const densityPoints: ViolinDensityPoint[] = [];

  for (let index = 0; index < sanitizedPointCount; index += 1) {
    const value =
      min + (index / (sanitizedPointCount - 1)) * (max - min);
    let density = 0;

    values.forEach((sample) => {
      const scaledDistance = (value - sample) / bandwidth;
      density += gaussianKernel(scaledDistance);
    });

    density /= sampleSize * bandwidth;
    densityPoints.push({ value, density });
  }

  const maxDensity = Math.max(...densityPoints.map((point) => point.density), 0);
  if (maxDensity <= 0) {
    return densityPoints.map((point) => ({ ...point, density: 0 }));
  }

  if (!normalizeToPeak) {
    return densityPoints;
  }

  return densityPoints.map((point) => ({
    value: point.value,
    density: point.density / maxDensity,
  }));
};

type KernelDensityPoint = {
  x: number;
  density: number;
};

type KernelDistributionShape =
  | "symmetric"
  | "right-skewed"
  | "left-skewed"
  | "multimodal";

type KernelDensityAnalysis = {
  seriesName: string;
  sampleSize: number;
  bandwidth: number;
  peakDensity: number;
  densityPoints: KernelDensityPoint[];
  distributionShape: KernelDistributionShape;
};

const KERNEL_DENSITY_PLOT_POINT_COUNT = 80;

const getKernelDistributionShapeLabel = (shape: KernelDistributionShape) => {
  if (shape === "symmetric") return "Simétrica";
  if (shape === "right-skewed") return "Sesgo positivo";
  if (shape === "left-skewed") return "Sesgo negativo";
  return "Multimodal";
};

const getKernelDistributionShapeMessage = (shape: KernelDistributionShape) => {
  if (shape === "symmetric") {
    return "Distribución aproximadamente simétrica.";
  }
  if (shape === "right-skewed") {
    return "Distribución sesgada hacia valores altos.";
  }
  if (shape === "left-skewed") {
    return "Distribución sesgada hacia valores bajos.";
  }
  return "Se detectan múltiples agrupaciones de datos.";
};

const detectKernelDistributionShape = (
  points: KernelDensityPoint[]
): KernelDistributionShape => {
  if (points.length < 3) return "symmetric";

  const peakDensity = Math.max(...points.map((point) => point.density), 0);
  if (peakDensity <= 0) return "symmetric";

  const peakThreshold = peakDensity * 0.2;
  const localPeakIndices: number[] = [];

  for (let index = 1; index < points.length - 1; index += 1) {
    const current = points[index].density;
    const previous = points[index - 1].density;
    const next = points[index + 1].density;

    if (
      current >= peakThreshold &&
      current >= previous &&
      current > next
    ) {
      localPeakIndices.push(index);
    }
  }

  if (points[0].density >= peakThreshold && points[0].density >= points[1].density) {
    localPeakIndices.unshift(0);
  }

  const lastIndex = points.length - 1;
  if (
    points[lastIndex].density >= peakThreshold &&
    points[lastIndex].density >= points[lastIndex - 1].density
  ) {
    localPeakIndices.push(lastIndex);
  }

  const uniquePeakIndices = [...new Set(localPeakIndices)];
  if (uniquePeakIndices.length >= 2) return "multimodal";

  const peakIndex =
    uniquePeakIndices[0] ??
    points.findIndex((point) => point.density === peakDensity);
  if (peakIndex < 0) return "symmetric";

  let leftMass = 0;
  let rightMass = 0;

  points.forEach((point, index) => {
    if (index <= peakIndex) leftMass += point.density;
    if (index >= peakIndex) rightMass += point.density;
  });

  if (rightMass > leftMass * 1.25) return "right-skewed";
  if (leftMass > rightMass * 1.25) return "left-skewed";
  return "symmetric";
};

const calculateKernelDensityAnalysis = (
  series: ExperimentalSeries
): KernelDensityAnalysis | null => {
  const values = getSeriesYValues(series).sort((left, right) => left - right);
  const sampleSize = values.length;

  if (sampleSize === 0) return null;

  const min = values[0];
  const max = values[sampleSize - 1];
  const bandwidth = Math.max(calculateSilvermanBandwidth(values), 1e-9);

  if (sampleSize === 1 || min === max) {
    return {
      seriesName: series.name,
      sampleSize,
      bandwidth,
      peakDensity: sampleSize === 1 ? 1 / bandwidth : 1,
      densityPoints: [{ x: min, density: sampleSize === 1 ? 1 / bandwidth : 1 }],
      distributionShape: "symmetric",
    };
  }

  const rawDensity = calculateKernelDensity(
    values,
    min,
    max,
    KERNEL_DENSITY_PLOT_POINT_COUNT,
    false
  );
  const densityPoints: KernelDensityPoint[] = rawDensity.map((point) => ({
    x: point.value,
    density: point.density,
  }));
  const peakDensity = Math.max(
    ...densityPoints.map((point) => point.density),
    0
  );

  return {
    seriesName: series.name,
    sampleSize,
    bandwidth,
    peakDensity,
    densityPoints,
    distributionShape: detectKernelDistributionShape(densityPoints),
  };
};

const calculateKernelDensityAnalysesForSeries = (
  series: ExperimentalSeries[]
): KernelDensityAnalysis[] =>
  series
    .map((item) => calculateKernelDensityAnalysis(item))
    .filter((analysis): analysis is KernelDensityAnalysis => analysis !== null);

const getKernelDensityInterpretationLines = (
  analyses: KernelDensityAnalysis[]
): string[] => {
  if (analyses.length === 0) {
    return ["No hay datos suficientes para generar un Kernel Density Plot."];
  }

  const lines: string[] = [];

  analyses.forEach((analysis) => {
    lines.push(
      `"${analysis.seriesName}" (N=${analysis.sampleSize}): h=${analysis.bandwidth.toFixed(4)}, pico=${analysis.peakDensity.toFixed(4)}, forma ${getKernelDistributionShapeLabel(analysis.distributionShape)}.`
    );
    lines.push(getKernelDistributionShapeMessage(analysis.distributionShape));
  });

  const multimodalCount = analyses.filter(
    (analysis) => analysis.distributionShape === "multimodal"
  ).length;
  if (multimodalCount > 0) {
    lines.push(
      `Se detectó multimodalidad en ${multimodalCount} serie(s), lo que sugiere subpoblaciones en los datos.`
    );
  }

  const skewedCount = analyses.filter(
    (analysis) =>
      analysis.distributionShape === "right-skewed" ||
      analysis.distributionShape === "left-skewed"
  ).length;
  if (skewedCount > 0) {
    lines.push(
      "Al menos una serie presenta asimetría visible en la densidad estimada."
    );
  }

  const peakValues = analyses.map((analysis) => analysis.peakDensity);
  const maxPeak = Math.max(...peakValues);
  const minPeak = Math.min(...peakValues);
  if (maxPeak > minPeak * 2 && analyses.length >= 2) {
    lines.push(
      "La concentración de densidad varía notablemente entre series comparadas."
    );
  }

  return lines;
};

type ScientificKernelDensityPlotChartProps = {
  analyses: KernelDensityAnalysis[];
  seriesColors: Map<string, string>;
  chartTheme: ReturnType<typeof getChartTheme>;
};

function ScientificKernelDensityPlotChart({
  analyses,
  seriesColors,
  chartTheme,
}: ScientificKernelDensityPlotChartProps) {
  return (
    <div className="h-[240px] mt-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
          <XAxis
            type="number"
            dataKey="x"
            name="Y"
            tick={{ fill: chartTheme.axis, fontSize: 11 }}
          />
          <YAxis
            type="number"
            dataKey="density"
            name="Densidad"
            tick={{ fill: chartTheme.axis, fontSize: 11 }}
          />
          <Tooltip
            content={({ active, payload: tooltipPayload }) => {
              if (!active || !tooltipPayload?.length) return null;

              const point = tooltipPayload[0]?.payload as
                | KernelDensityPoint
                | undefined;
              const seriesName = tooltipPayload[0]?.name ?? "Serie";

              if (!point) return null;

              return (
                <div
                  className="rounded-lg border px-3 py-2 text-sm shadow-sm"
                  style={{
                    borderColor: chartTheme.tooltipBorder,
                    backgroundColor: chartTheme.tooltipBg,
                    color: chartTheme.tooltipColor,
                  }}
                >
                  <p className="font-semibold">{seriesName}</p>
                  <p>Y = {point.x.toFixed(4)}</p>
                  <p>Densidad = {point.density.toFixed(4)}</p>
                </div>
              );
            }}
          />
          {analyses.map((analysis) => (
            <Line
              key={`kde-line-${analysis.seriesName}`}
              name={analysis.seriesName}
              data={analysis.densityPoints}
              type="monotone"
              dataKey="density"
              stroke={
                seriesColors.get(analysis.seriesName) ?? "var(--app-accent)"
              }
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

type ForestPlotEntry = {
  seriesName: string;
  sampleSize: number;
  mean: number;
  standardDeviation: number;
  standardError: number;
  confidence95Lower: number;
  confidence95Upper: number;
};

type ForestPlotAnalysis = {
  entries: ForestPlotEntry[];
};

const buildForestPlotEntry = (
  stats: ExperimentalStatistics
): ForestPlotEntry | null => {
  if (stats.count === 0) return null;

  const mean = stats.meanY;
  const standardDeviation = stats.stdDevY;
  const standardError = getStandardError(stats);
  const margin = getCi95Margin(stats);

  return {
    seriesName: stats.seriesName,
    sampleSize: stats.count,
    mean,
    standardDeviation,
    standardError,
    confidence95Lower: mean - margin,
    confidence95Upper: mean + margin,
  };
};

const buildForestPlotAnalysis = (
  experimentalStatistics: ExperimentalStatistics[]
): ForestPlotAnalysis | null => {
  const entries = experimentalStatistics
    .map((stats) => buildForestPlotEntry(stats))
    .filter((entry): entry is ForestPlotEntry => entry !== null);

  if (entries.length === 0) return null;
  return { entries };
};

const forestPlotIntervalsOverlap = (
  left: ForestPlotEntry,
  right: ForestPlotEntry
) =>
  !(
    left.confidence95Upper < right.confidence95Lower ||
    right.confidence95Upper < left.confidence95Lower
  );

const getForestPlotGlobalMean = (entries: ForestPlotEntry[]) => {
  if (entries.length === 0) return 0;
  return (
    entries.reduce((sum, entry) => sum + entry.mean, 0) / entries.length
  );
};

const getForestPlotInterpretationLines = (
  analysis: ForestPlotAnalysis | null
): string[] => {
  if (!analysis || analysis.entries.length === 0) {
    return ["No hay datos suficientes para generar un Forest Plot."];
  }

  const { entries } = analysis;
  const lines: string[] = [];

  entries.forEach((entry) => {
    lines.push(
      `"${entry.seriesName}" (N=${entry.sampleSize}): media=${formatExperimentalStat(entry.mean)}, SD=${formatExperimentalStat(entry.standardDeviation)}, SE=${formatExperimentalStat(entry.standardError)}, IC95% [${formatExperimentalStat(entry.confidence95Lower)}, ${formatExperimentalStat(entry.confidence95Upper)}].`
    );
  });

  const ciWidths = entries.map(
    (entry) => entry.confidence95Upper - entry.confidence95Lower
  );
  const averageCiWidth =
    ciWidths.reduce((sum, width) => sum + width, 0) / ciWidths.length;
  const means = entries.map((entry) => entry.mean);
  const meanSpread = Math.max(...means) - Math.min(...means);
  const relativeCiWidth =
    meanSpread > 0 ? averageCiWidth / meanSpread : averageCiWidth;

  if (relativeCiWidth > 0.85 || averageCiWidth > meanSpread * 0.85) {
    lines.push(
      "Los intervalos de confianza son amplios, lo que indica elevada incertidumbre en las medias."
    );
  } else if (relativeCiWidth < 0.25) {
    lines.push(
      "Los intervalos de confianza son estrechos, lo que sugiere alta precisión en las estimaciones."
    );
  }

  const smallSampleCount = entries.filter((entry) => entry.sampleSize <= 3)
    .length;
  if (smallSampleCount > 0) {
    lines.push(
      `${smallSampleCount} serie(s) tienen tamaño muestral pequeño (N≤3), lo que amplía los IC95%.`
    );
  }

  if (entries.length >= 2) {
    let overlappingPairs = 0;
    let totalPairs = 0;

    for (let indexA = 0; indexA < entries.length; indexA += 1) {
      for (let indexB = indexA + 1; indexB < entries.length; indexB += 1) {
        totalPairs += 1;
        if (
          forestPlotIntervalsOverlap(entries[indexA], entries[indexB])
        ) {
          overlappingPairs += 1;
        }
      }
    }

    if (overlappingPairs === totalPairs) {
      lines.push("Las series presentan amplia superposición.");
    } else if (overlappingPairs === 0 && meanSpread > averageCiWidth) {
      lines.push("Las medias muestran separación consistente.");
    } else if (overlappingPairs > 0 && overlappingPairs < totalPairs) {
      lines.push(
        "Se observa solapamiento parcial entre intervalos de confianza."
      );
    }
  }

  return lines;
};

type ScientificForestPlotProps = {
  analysis: ForestPlotAnalysis;
  seriesColors: Map<string, string>;
};

function ScientificForestPlot({
  analysis,
  seriesColors,
}: ScientificForestPlotProps) {
  const width = 520;
  const rowHeight = 44;
  const labelWidth = 128;
  const paddingX = 16;
  const paddingY = 20;
  const plotLeft = labelWidth + paddingX;
  const plotRight = width - paddingX;
  const plotWidth = plotRight - plotLeft;
  const height = paddingY * 2 + analysis.entries.length * rowHeight;
  const globalMean = getForestPlotGlobalMean(analysis.entries);

  const domainMin = Math.min(
    ...analysis.entries.map((entry) => entry.confidence95Lower),
    globalMean
  );
  const domainMax = Math.max(
    ...analysis.entries.map((entry) => entry.confidence95Upper),
    globalMean
  );
  const domainRange = domainMax - domainMin || 1;

  const scaleX = (value: number) =>
    plotLeft + ((value - domainMin) / domainRange) * plotWidth;

  const globalMeanX = scaleX(globalMean);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full max-w-xl"
      role="img"
      aria-label="Forest plot de medias e intervalos de confianza"
    >
      <line
        x1={globalMeanX}
        y1={paddingY - 4}
        x2={globalMeanX}
        y2={height - paddingY + 4}
        stroke="var(--app-text-muted)"
        strokeWidth={1.5}
        strokeDasharray="4 4"
      />
      <text
        x={globalMeanX}
        y={12}
        textAnchor="middle"
        fill="var(--app-text-muted)"
        fontSize={10}
      >
        Media global
      </text>

      {analysis.entries.map((entry, index) => {
        const rowCenterY = paddingY + index * rowHeight + rowHeight / 2;
        const lowerX = scaleX(entry.confidence95Lower);
        const upperX = scaleX(entry.confidence95Upper);
        const meanX = scaleX(entry.mean);
        const color =
          seriesColors.get(entry.seriesName) ?? "var(--app-accent)";

        return (
          <g key={`forest-row-${entry.seriesName}`}>
            <text
              x={paddingX}
              y={rowCenterY + 4}
              fill="var(--app-text)"
              fontSize={11}
            >
              {entry.seriesName.length > 14
                ? `${entry.seriesName.slice(0, 13)}…`
                : entry.seriesName}
            </text>
            <line
              x1={lowerX}
              y1={rowCenterY}
              x2={upperX}
              y2={rowCenterY}
              stroke={color}
              strokeWidth={3}
              strokeLinecap="round"
            />
            <line
              x1={lowerX}
              y1={rowCenterY - 6}
              x2={lowerX}
              y2={rowCenterY + 6}
              stroke={color}
              strokeWidth={2}
            />
            <line
              x1={upperX}
              y1={rowCenterY - 6}
              x2={upperX}
              y2={rowCenterY + 6}
              stroke={color}
              strokeWidth={2}
            />
            <rect
              x={meanX - 5}
              y={rowCenterY - 5}
              width={10}
              height={10}
              fill={color}
              stroke="var(--app-heading)"
              strokeWidth={1}
            />
          </g>
        );
      })}
    </svg>
  );
}

type PCAObservation = {
  label: string;
  values: number[];
};

type PCAResultPoint = {
  label: string;
  pc1: number;
  pc2: number;
};

type PCALoading = {
  variable: string;
  pc1: number;
  pc2: number;
  contributionPc1: number;
  contributionPc2: number;
};

type PCAAnalysis = {
  component1Variance: number;
  component2Variance: number;
  cumulativeVariance: number;
  points: PCAResultPoint[];
  interpretation: string;
  loadings: PCALoading[];
  loadingsInterpretation: string[];
};

const PCA_DOMINANT_CONTRIBUTION_THRESHOLD = 40;
const PCA_BALANCED_CONTRIBUTION_SPREAD = 20;
const PCA_EIGENVALUE_EPSILON = 1e-9;

const formatPCAVariancePercent = (value: number) => `${value.toFixed(1)}%`;

const getPCAVariableStandardDeviations = (matrix: number[][]) => {
  const observationCount = matrix.length;
  const variableCount = matrix[0]?.length ?? 0;
  const standardDeviations = Array.from({ length: variableCount }, () => 0);

  for (let columnIndex = 0; columnIndex < variableCount; columnIndex += 1) {
    const mean =
      matrix.reduce((sum, row) => sum + row[columnIndex], 0) / observationCount;

    if (observationCount <= 1) {
      standardDeviations[columnIndex] = 0;
      continue;
    }

    const variance =
      matrix.reduce(
        (sum, row) => sum + (row[columnIndex] - mean) ** 2,
        0
      ) / (observationCount - 1);
    standardDeviations[columnIndex] = Math.sqrt(variance);
  }

  return standardDeviations;
};

const filterPCADataMatrixByActiveColumns = (
  matrix: number[][],
  activeColumnIndices: number[]
) =>
  matrix.map((row) => activeColumnIndices.map((columnIndex) => row[columnIndex]));

const expandPCAEigenvectorToSeries = (
  activeEigenvector: number[],
  activeColumnIndices: number[],
  totalVariableCount: number
) => {
  const expanded = Array.from({ length: totalVariableCount }, () => 0);
  activeColumnIndices.forEach((columnIndex, activeIndex) => {
    expanded[columnIndex] = activeEigenvector[activeIndex] ?? 0;
  });
  return expanded;
};

const buildPCALoadings = (
  series: ExperimentalSeries[],
  eigenvectorPc1: number[],
  eigenvectorPc2: number[]
): PCALoading[] => {
  const loadings = series.map((item, index) => ({
    variable: item.name,
    pc1: eigenvectorPc1[index] ?? 0,
    pc2: eigenvectorPc2[index] ?? 0,
    contributionPc1: 0,
    contributionPc2: 0,
  }));

  const sumSquaredPc1 = loadings.reduce((sum, loading) => sum + loading.pc1 ** 2, 0);
  const sumSquaredPc2 = loadings.reduce((sum, loading) => sum + loading.pc2 ** 2, 0);

  return loadings.map((loading) => ({
    ...loading,
    contributionPc1:
      sumSquaredPc1 > 0 ? (loading.pc1 ** 2 / sumSquaredPc1) * 100 : 0,
    contributionPc2:
      sumSquaredPc2 > 0 ? (loading.pc2 ** 2 / sumSquaredPc2) * 100 : 0,
  }));
};

const hasSimilarPCAContributions = (contributions: number[]) => {
  if (contributions.length < 2) return false;

  const maxContribution = Math.max(...contributions);
  const minContribution = Math.min(...contributions);

  return (
    maxContribution < PCA_DOMINANT_CONTRIBUTION_THRESHOLD &&
    maxContribution - minContribution <= PCA_BALANCED_CONTRIBUTION_SPREAD
  );
};

const getPCALoadingsInterpretation = (loadings: PCALoading[]): string[] => {
  const lines: string[] = [];

  loadings
    .filter(
      (loading) => loading.contributionPc1 > PCA_DOMINANT_CONTRIBUTION_THRESHOLD
    )
    .forEach((loading) => {
      lines.push(`Variable dominante en PC1: "${loading.variable}".`);
    });

  loadings
    .filter(
      (loading) => loading.contributionPc2 > PCA_DOMINANT_CONTRIBUTION_THRESHOLD
    )
    .forEach((loading) => {
      lines.push(`Variable dominante en PC2: "${loading.variable}".`);
    });

  const pc1Contributions = loadings.map((loading) => loading.contributionPc1);
  const pc2Contributions = loadings.map((loading) => loading.contributionPc2);

  if (hasSimilarPCAContributions(pc1Contributions)) {
    lines.push(
      "El componente PC1 representa una combinación equilibrada de variables."
    );
  }

  if (hasSimilarPCAContributions(pc2Contributions)) {
    lines.push(
      "El componente PC2 representa una combinación equilibrada de variables."
    );
  }

  return lines;
};

const deduplicateTextLines = (lines: string[]): string[] => {
  const uniqueLines: string[] = [];
  lines.forEach((line) => {
    if (!uniqueLines.includes(line)) uniqueLines.push(line);
  });
  return uniqueLines;
};

const hasPCADominantVariable = (analysis: PCAAnalysis | null) =>
  analysis?.loadings.some(
    (loading) =>
      loading.contributionPc1 > PCA_DOMINANT_CONTRIBUTION_THRESHOLD ||
      loading.contributionPc2 > PCA_DOMINANT_CONTRIBUTION_THRESHOLD
  ) ?? false;

const hasPCAClearStructure = (analysis: PCAAnalysis | null) =>
  analysis !== null &&
  (analysis.cumulativeVariance >= 80 || hasPCADominantVariable(analysis));

const getPCAInterpretationMessage = (cumulativeVariance: number) => {
  if (cumulativeVariance >= 80) {
    return "Los dos primeros componentes explican adecuadamente la variabilidad de los datos.";
  }
  if (cumulativeVariance >= 60) {
    return "La representación bidimensional conserva una cantidad moderada de información.";
  }
  return "La estructura multivariante requiere más componentes para ser explicada.";
};

const dotProduct = (left: number[], right: number[]) =>
  left.reduce((sum, value, index) => sum + value * right[index], 0);

const vectorNorm = (values: number[]) => Math.sqrt(dotProduct(values, values));

const normalizeVector = (values: number[]) => {
  const norm = vectorNorm(values);
  if (norm === 0) return values.map(() => 0);
  return values.map((value) => value / norm);
};

const isDegeneratePCAComponent = (
  eigenvalue: number,
  eigenvector: number[]
) =>
  eigenvalue <= PCA_EIGENVALUE_EPSILON ||
  vectorNorm(eigenvector) <= PCA_EIGENVALUE_EPSILON;

const normalizePCAExplainedVariance = (
  eigenvalue1: number,
  eigenvalue2: number,
  totalVariance: number
) => {
  if (totalVariance <= PCA_EIGENVALUE_EPSILON) {
    return {
      component1Variance: 0,
      component2Variance: 0,
      cumulativeVariance: 0,
    };
  }

  const cappedEigenvalue1 = Math.min(Math.max(0, eigenvalue1), totalVariance);
  const remainingVariance = Math.max(0, totalVariance - cappedEigenvalue1);
  const cappedEigenvalue2 = Math.min(Math.max(0, eigenvalue2), remainingVariance);

  const component1Variance = Math.min(
    100,
    (cappedEigenvalue1 / totalVariance) * 100
  );
  const component2Variance = Math.min(
    Math.max(0, 100 - component1Variance),
    (cappedEigenvalue2 / totalVariance) * 100
  );
  const cumulativeVariance = component1Variance + component2Variance;

  return {
    component1Variance,
    component2Variance,
    cumulativeVariance,
  };
};

const multiplySymmetricMatrixVector = (matrix: number[][], vector: number[]) => {
  const size = vector.length;
  const result = Array.from({ length: size }, () => 0);

  for (let rowIndex = 0; rowIndex < size; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < size; columnIndex += 1) {
      result[rowIndex] += matrix[rowIndex][columnIndex] * vector[columnIndex];
    }
  }

  return result;
};

const powerIterationEigen = (
  matrix: number[][],
  orthogonalTo: number[] | null = null,
  iterations = 200
) => {
  const size = matrix.length;
  let vector = normalizeVector(
    Array.from({ length: size }, (_, index) => (index === 0 ? 1 : 0.1))
  );

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    let nextVector = multiplySymmetricMatrixVector(matrix, vector);

    if (orthogonalTo) {
      const projection = dotProduct(nextVector, orthogonalTo);
      nextVector = nextVector.map(
        (value, index) => value - projection * orthogonalTo[index]
      );
    }

    const normalized = normalizeVector(nextVector);
    if (normalized.every((value) => value === 0)) break;
    vector = normalized;
  }

  const transformed = multiplySymmetricMatrixVector(matrix, vector);
  const eigenvalue = Math.max(0, dotProduct(vector, transformed));

  if (isDegeneratePCAComponent(eigenvalue, vector)) {
    return {
      eigenvalue: 0,
      eigenvector: Array.from({ length: size }, () => 0),
    };
  }

  return { eigenvalue, eigenvector: vector };
};

const buildPCADataMatrix = (
  series: ExperimentalSeries[]
): number[][] | null => {
  if (series.length < 2) return null;

  const observationCount = series[0].points.length;
  if (observationCount < 3) return null;

  if (!series.every((item) => item.points.length === observationCount)) {
    return null;
  }

  const matrix: number[][] = [];

  for (let observationIndex = 0; observationIndex < observationCount; observationIndex += 1) {
    const row: number[] = [];

    for (const item of series) {
      const value = item.points[observationIndex]?.y;
      if (!Number.isFinite(value)) return null;
      row.push(value);
    }

    matrix.push(row);
  }

  return matrix;
};

const standardizePCADataMatrix = (matrix: number[][]) => {
  const observationCount = matrix.length;
  const variableCount = matrix[0]?.length ?? 0;

  if (observationCount === 0 || variableCount === 0) return matrix;

  const means = Array.from({ length: variableCount }, () => 0);
  const standardDeviations = Array.from({ length: variableCount }, () => 0);

  for (let columnIndex = 0; columnIndex < variableCount; columnIndex += 1) {
    means[columnIndex] =
      matrix.reduce((sum, row) => sum + row[columnIndex], 0) / observationCount;

    if (observationCount <= 1) {
      standardDeviations[columnIndex] = 0;
      continue;
    }

    const variance =
      matrix.reduce(
        (sum, row) => sum + (row[columnIndex] - means[columnIndex]) ** 2,
        0
      ) / (observationCount - 1);
    standardDeviations[columnIndex] = Math.sqrt(variance);
  }

  return matrix.map((row) =>
    row.map((value, columnIndex) => {
      const standardDeviation = standardDeviations[columnIndex];
      if (standardDeviation === 0) return 0;
      return (value - means[columnIndex]) / standardDeviation;
    })
  );
};

const computePCACovarianceMatrix = (matrix: number[][]) => {
  const observationCount = matrix.length;
  const variableCount = matrix[0]?.length ?? 0;
  const covariance = Array.from({ length: variableCount }, () =>
    Array.from({ length: variableCount }, () => 0)
  );

  if (observationCount <= 1) return covariance;

  for (let rowIndex = 0; rowIndex < variableCount; rowIndex += 1) {
    for (let columnIndex = rowIndex; columnIndex < variableCount; columnIndex += 1) {
      let sum = 0;

      for (let observationIndex = 0; observationIndex < observationCount; observationIndex += 1) {
        sum += matrix[observationIndex][rowIndex] * matrix[observationIndex][columnIndex];
      }

      const value = sum / (observationCount - 1);
      covariance[rowIndex][columnIndex] = value;
      covariance[columnIndex][rowIndex] = value;
    }
  }

  return covariance;
};

const projectOntoPrincipalComponent = (
  matrix: number[][],
  eigenvector: number[]
) => matrix.map((row) => dotProduct(row, eigenvector));

const buildPCAAnalysis = (
  series: ExperimentalSeries[]
): PCAAnalysis | null => {
  const rawMatrix = buildPCADataMatrix(series);
  if (!rawMatrix) return null;

  const variableCount = rawMatrix[0]?.length ?? 0;
  const standardDeviations = getPCAVariableStandardDeviations(rawMatrix);
  const activeColumnIndices = standardDeviations
    .map((standardDeviation, index) =>
      standardDeviation > PCA_EIGENVALUE_EPSILON ? index : -1
    )
    .filter((index) => index >= 0);

  if (activeColumnIndices.length < 2) return null;

  const activeMatrix = filterPCADataMatrixByActiveColumns(
    rawMatrix,
    activeColumnIndices
  );
  const standardizedMatrix = standardizePCADataMatrix(activeMatrix);
  const covarianceMatrix = computePCACovarianceMatrix(standardizedMatrix);
  const totalVariance = covarianceMatrix.reduce(
    (sum, row, index) => sum + row[index],
    0
  );

  if (totalVariance <= PCA_EIGENVALUE_EPSILON) return null;

  const firstComponent = powerIterationEigen(covarianceMatrix);
  let secondComponent = powerIterationEigen(
    covarianceMatrix,
    firstComponent.eigenvector
  );

  const remainingVariance = Math.max(
    0,
    totalVariance - firstComponent.eigenvalue
  );

  if (
    isDegeneratePCAComponent(
      secondComponent.eigenvalue,
      secondComponent.eigenvector
    ) ||
    Math.abs(dotProduct(firstComponent.eigenvector, secondComponent.eigenvector)) >
      0.99 ||
    secondComponent.eigenvalue > remainingVariance + PCA_EIGENVALUE_EPSILON
  ) {
    secondComponent = {
      eigenvalue: 0,
      eigenvector: Array.from({ length: activeColumnIndices.length }, () => 0),
    };
  } else {
    secondComponent = {
      eigenvalue: Math.min(secondComponent.eigenvalue, remainingVariance),
      eigenvector: secondComponent.eigenvector,
    };
  }

  const expandedEigenvectorPc1 = expandPCAEigenvectorToSeries(
    firstComponent.eigenvector,
    activeColumnIndices,
    variableCount
  );
  const expandedEigenvectorPc2 = expandPCAEigenvectorToSeries(
    secondComponent.eigenvector,
    activeColumnIndices,
    variableCount
  );

  const pc1Scores = projectOntoPrincipalComponent(
    standardizedMatrix,
    firstComponent.eigenvector
  );
  const pc2Scores = isDegeneratePCAComponent(
    secondComponent.eigenvalue,
    secondComponent.eigenvector
  )
    ? standardizedMatrix.map(() => 0)
    : projectOntoPrincipalComponent(
        standardizedMatrix,
        secondComponent.eigenvector
      );

  const {
    component1Variance,
    component2Variance,
    cumulativeVariance,
  } = normalizePCAExplainedVariance(
    firstComponent.eigenvalue,
    secondComponent.eigenvalue,
    totalVariance
  );

  const points: PCAResultPoint[] = pc1Scores.map((pc1, index) => ({
    label: `Obs ${index + 1}`,
    pc1,
    pc2: pc2Scores[index] ?? 0,
  }));

  const loadings = buildPCALoadings(
    series,
    expandedEigenvectorPc1,
    expandedEigenvectorPc2
  );
  const loadingsInterpretation = getPCALoadingsInterpretation(loadings);

  const constantVariableNames = series
    .filter(
      (_, index) => standardDeviations[index] <= PCA_EIGENVALUE_EPSILON
    )
    .map((item) => item.name);
  if (constantVariableNames.length > 0) {
    loadingsInterpretation.unshift(
      `Variables constantes excluidas del cálculo PCA (carga 0): ${constantVariableNames.join(", ")}.`
    );
  }

  if (secondComponent.eigenvalue <= PCA_EIGENVALUE_EPSILON) {
    loadingsInterpretation.push(
      "PC2 no aporta varianza adicional; los datos pueden estar concentrados en una dimensión principal."
    );
  }

  return {
    component1Variance,
    component2Variance,
    cumulativeVariance,
    points,
    interpretation: getPCAInterpretationMessage(cumulativeVariance),
    loadings,
    loadingsInterpretation,
  };
};

const getPCAInterpretationLines = (
  analysis: PCAAnalysis | null,
  observationCount: number,
  seriesCount: number
): string[] => {
  if (!analysis) {
    return ["No hay datos suficientes para realizar PCA."];
  }

  return [
    `Observaciones analizadas: ${observationCount}.`,
    `Series (variables): ${seriesCount}.`,
    "Componentes analizados: PC1, PC2.",
    `Varianza explicada PC1: ${formatPCAVariancePercent(analysis.component1Variance)}.`,
    `Varianza explicada PC2: ${formatPCAVariancePercent(analysis.component2Variance)}.`,
    `Varianza acumulada: ${formatPCAVariancePercent(analysis.cumulativeVariance)}.`,
    analysis.interpretation,
  ];
};

const getPCALoadingsInterpretationLines = (
  analysis: PCAAnalysis | null
): string[] => {
  if (!analysis || analysis.loadings.length === 0) {
    return ["No hay loadings disponibles para PCA."];
  }

  return deduplicateTextLines([
    ...analysis.loadingsInterpretation,
    ...analysis.loadings.map(
      (loading) =>
        `${loading.variable}: loading PC1=${formatExperimentalStat(loading.pc1)}, PC2=${formatExperimentalStat(loading.pc2)}, contribución PC1=${loading.contributionPc1.toFixed(1)}%, PC2=${loading.contributionPc2.toFixed(1)}%.`
    ),
  ]);
};

type ScientificPCAPlotChartProps = {
  analysis: PCAAnalysis;
  chartTheme: ReturnType<typeof getChartTheme>;
};

function ScientificPCAPlotChart({
  analysis,
  chartTheme,
}: ScientificPCAPlotChartProps) {
  return (
    <div className="h-[240px] mt-3">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
          <XAxis
            type="number"
            dataKey="pc1"
            name="PC1"
            tick={{ fill: chartTheme.axis, fontSize: 11 }}
          />
          <YAxis
            type="number"
            dataKey="pc2"
            name="PC2"
            tick={{ fill: chartTheme.axis, fontSize: 11 }}
          />
          <Tooltip
            content={({ active, payload: tooltipPayload }) => {
              if (!active || !tooltipPayload?.length) return null;

              const point = tooltipPayload[0]?.payload as
                | PCAResultPoint
                | undefined;
              if (!point) return null;

              return (
                <div
                  className="rounded-lg border px-3 py-2 text-sm shadow-sm"
                  style={{
                    borderColor: chartTheme.tooltipBorder,
                    backgroundColor: chartTheme.tooltipBg,
                    color: chartTheme.tooltipColor,
                  }}
                >
                  <p className="font-semibold">Observación</p>
                  <p>{point.label}</p>
                  <p>PC1 = {point.pc1.toFixed(4)}</p>
                  <p>PC2 = {point.pc2.toFixed(4)}</p>
                </div>
              );
            }}
          />
          <Scatter
            name="Observaciones"
            data={analysis.points}
            fill="var(--app-accent)"
            line={false}
            isAnimationActive={false}
            r={6}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

type ScientificPCALoadingsSectionProps = {
  analysis: PCAAnalysis;
};

function ScientificPCALoadingsSection({
  analysis,
}: ScientificPCALoadingsSectionProps) {
  return (
    <>
      {analysis.loadingsInterpretation.length > 0 && (
        <div className="mt-3 space-y-1">
          {analysis.loadingsInterpretation.map((line, index) => (
            <p
              key={`pca-loading-interpretation-${index}`}
              className="text-sm text-[var(--app-text-muted)]"
            >
              {line}
            </p>
          ))}
        </div>
      )}

      <p className={`${subsectionHeading} mt-4`}>📋 Loadings</p>
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[var(--app-border)]">
              <th className="text-left py-2 pr-3 font-semibold">Variable</th>
              <th className="text-left py-2 pr-3 font-semibold">Loading PC1</th>
              <th className="text-left py-2 pr-3 font-semibold">Loading PC2</th>
              <th className="text-left py-2 pr-3 font-semibold">
                Contribución PC1 %
              </th>
              <th className="text-left py-2 font-semibold">
                Contribución PC2 %
              </th>
            </tr>
          </thead>
          <tbody>
            {analysis.loadings.map((loading, index) => (
              <tr
                key={`pca-loading-${loading.variable}-${index}`}
                className="border-b border-[var(--app-border)]"
              >
                <td className="py-2 pr-3">{loading.variable}</td>
                <td className="py-2 pr-3 font-mono">
                  {formatExperimentalStat(loading.pc1)}
                </td>
                <td className="py-2 pr-3 font-mono">
                  {formatExperimentalStat(loading.pc2)}
                </td>
                <td className="py-2 pr-3 font-mono">
                  {loading.contributionPc1.toFixed(1)}%
                </td>
                <td className="py-2 font-mono">
                  {loading.contributionPc2.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className={`${subsectionHeading} mt-4`}>🧭 Biplot simplificado</p>
      <ScientificPCABiplot analysis={analysis} />
    </>
  );
}

type ScientificPCABiplotProps = {
  analysis: PCAAnalysis;
};

function ScientificPCABiplot({ analysis }: ScientificPCABiplotProps) {
  const width = 520;
  const height = 240;
  const padding = 28;
  const centerX = width / 2;
  const centerY = height / 2;
  const plotRadius = Math.min(width, height) / 2 - padding;

  const maxMagnitude = Math.max(
    ...analysis.loadings.map((loading) =>
      Math.max(Math.abs(loading.pc1), Math.abs(loading.pc2))
    ),
    1e-9
  );
  const scale = plotRadius / maxMagnitude;

  const renderArrowHead = (
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    key: string
  ) => {
    const angle = Math.atan2(endY - startY, endX - startX);
    const headLength = 8;
    const headAngle = Math.PI / 7;

    const pointAX = endX - headLength * Math.cos(angle - headAngle);
    const pointAY = endY - headLength * Math.sin(angle - headAngle);
    const pointBX = endX - headLength * Math.cos(angle + headAngle);
    const pointBY = endY - headLength * Math.sin(angle + headAngle);

    return (
      <polygon
        key={key}
        points={`${endX},${endY} ${pointAX},${pointAY} ${pointBX},${pointBY}`}
        fill="var(--app-accent)"
      />
    );
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full max-w-xl mt-2"
      style={{ height: 240 }}
      role="img"
      aria-label="Biplot simplificado de loadings PCA"
    >
      <line
        x1={centerX - plotRadius}
        y1={centerY}
        x2={centerX + plotRadius}
        y2={centerY}
        stroke="var(--app-border)"
        strokeWidth={1.5}
      />
      <line
        x1={centerX}
        y1={centerY - plotRadius}
        x2={centerX}
        y2={centerY + plotRadius}
        stroke="var(--app-border)"
        strokeWidth={1.5}
      />
      <circle cx={centerX} cy={centerY} r={3} fill="var(--app-text-muted)" />

      {analysis.loadings.map((loading, index) => {
        const endX = centerX + loading.pc1 * scale;
        const endY = centerY - loading.pc2 * scale;
        const label =
          loading.variable.length > 14
            ? `${loading.variable.slice(0, 13)}…`
            : loading.variable;

        return (
          <g key={`pca-biplot-${loading.variable}-${index}`}>
            <line
              x1={centerX}
              y1={centerY}
              x2={endX}
              y2={endY}
              stroke="var(--app-accent)"
              strokeWidth={2}
            />
            {renderArrowHead(
              centerX,
              centerY,
              endX,
              endY,
              `pca-biplot-head-${loading.variable}-${index}`
            )}
            <text
              x={endX + (endX >= centerX ? 6 : -6)}
              y={endY + (endY <= centerY ? -6 : 12)}
              textAnchor={endX >= centerX ? "start" : "end"}
              fill="var(--app-text)"
              fontSize={10}
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

type ScatterMatrixCell = {
  xVariable: string;
  yVariable: string;
  points: {
    x: number;
    y: number;
  }[];
  correlation: number | null;
};

type ScatterMatrixAnalysis = {
  variables: string[];
  cells: ScatterMatrixCell[];
  interpretation: string[];
};

const SCATTER_MATRIX_MIN_OBSERVATIONS = 3;

const isScatterMatrixInputValid = (series: ExperimentalSeries[]) =>
  series.length >= 2 &&
  series.every(
    (item) => getSeriesYValues(item).length >= SCATTER_MATRIX_MIN_OBSERVATIONS
  );

const buildScatterMatrixPairPoints = (
  seriesA: ExperimentalSeries,
  seriesB: ExperimentalSeries
) => {
  const pairCount = Math.min(seriesA.points.length, seriesB.points.length);
  const points: { x: number; y: number }[] = [];

  for (let index = 0; index < pairCount; index += 1) {
    const x = seriesA.points[index]?.y;
    const y = seriesB.points[index]?.y;
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    points.push({ x, y });
  }

  return points;
};

const buildScatterMatrixInterpretation = (
  cells: ScatterMatrixCell[]
): string[] => {
  const interpretation: string[] = [];
  const uniqueOffDiagonalPairs = new Map<string, ScatterMatrixCell>();

  cells
    .filter((cell) => cell.xVariable !== cell.yVariable)
    .forEach((cell) => {
      const pairKey = [cell.xVariable, cell.yVariable].sort().join("|");
      if (!uniqueOffDiagonalPairs.has(pairKey)) {
        uniqueOffDiagonalPairs.set(pairKey, cell);
      }
    });

  uniqueOffDiagonalPairs.forEach((cell) => {
    const correlation = cell.correlation;
    if (correlation === null || !Number.isFinite(correlation)) return;

    if (correlation >= 0.8) {
      interpretation.push(
        `Existe una asociación positiva muy fuerte entre ${cell.xVariable} y ${cell.yVariable}.`
      );
    } else if (correlation <= -0.8) {
      interpretation.push(
        `Existe una asociación negativa muy fuerte entre ${cell.xVariable} y ${cell.yVariable}.`
      );
    } else if (Math.abs(correlation) < 0.3) {
      interpretation.push(
        `La relación entre ${cell.xVariable} y ${cell.yVariable} es débil o inexistente.`
      );
    }
  });

  const pairCells = Array.from(uniqueOffDiagonalPairs.values()).filter(
    (cell) => cell.correlation !== null && Number.isFinite(cell.correlation)
  );

  if (pairCells.length > 0) {
    const strongCount = pairCells.filter(
      (cell) => Math.abs(cell.correlation ?? 0) > 0.7
    ).length;
    if (strongCount / pairCells.length > 0.6) {
      interpretation.push(
        "Las variables muestran una estructura altamente correlacionada."
      );
    }
  }

  return deduplicateTextLines(interpretation);
};

const buildScatterMatrixAnalysis = (
  series: ExperimentalSeries[]
): ScatterMatrixAnalysis | null => {
  if (!isScatterMatrixInputValid(series)) return null;

  const variables = series.map((item) => item.name);
  const cells: ScatterMatrixCell[] = [];

  for (let rowIndex = 0; rowIndex < series.length; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < series.length; columnIndex += 1) {
      const seriesA = series[rowIndex];
      const seriesB = series[columnIndex];
      const xVariable = seriesA.name;
      const yVariable = seriesB.name;

      if (xVariable === yVariable) {
        cells.push({
          xVariable,
          yVariable,
          points: [],
          correlation: null,
        });
        continue;
      }

      cells.push({
        xVariable,
        yVariable,
        points: buildScatterMatrixPairPoints(seriesA, seriesB),
        correlation: computeSeriesPairCorrelation(seriesA, seriesB, "pearson"),
      });
    }
  }

  return {
    variables,
    cells,
    interpretation: buildScatterMatrixInterpretation(cells),
  };
};

const getScatterMatrixReportLines = (
  analysis: ScatterMatrixAnalysis | null
): string[] => {
  if (!analysis) {
    return ["No hay datos suficientes para generar Scatter Matrix."];
  }

  const pairCount =
    (analysis.variables.length * (analysis.variables.length - 1)) / 2;
  const lines = [
    `Variables analizadas: ${analysis.variables.join(", ")}.`,
    `Número de pares: ${pairCount}.`,
  ];

  const seenPairs = new Set<string>();
  analysis.cells
    .filter((cell) => cell.xVariable !== cell.yVariable)
    .forEach((cell) => {
      if (cell.correlation === null || !Number.isFinite(cell.correlation)) {
        return;
      }

      const pairKey = [cell.xVariable, cell.yVariable].sort().join("|");
      if (seenPairs.has(pairKey)) return;
      seenPairs.add(pairKey);

      if (Math.abs(cell.correlation) >= 0.8 || Math.abs(cell.correlation) < 0.3) {
        lines.push(
          `${cell.xVariable} vs ${cell.yVariable}: r = ${cell.correlation.toFixed(2)}.`
        );
      }
    });

  analysis.interpretation.forEach((line) => lines.push(line));
  return deduplicateTextLines(lines);
};

const hasScatterMatrixStrongCorrelations = (
  analysis: ScatterMatrixAnalysis | null
) => {
  if (!analysis) return false;

  const pairCells = analysis.cells.filter(
    (cell) =>
      cell.xVariable !== cell.yVariable &&
      cell.correlation !== null &&
      Number.isFinite(cell.correlation)
  );

  if (pairCells.length === 0) return false;

  const strongCount = pairCells.filter(
    (cell) => Math.abs(cell.correlation ?? 0) > 0.7
  ).length;

  return strongCount / pairCells.length > 0.6;
};

const hasScatterMatrixMostlyWeakCorrelations = (
  analysis: ScatterMatrixAnalysis | null
) => {
  if (!analysis) return false;

  const uniquePairs = new Map<string, number | null>();
  analysis.cells
    .filter((cell) => cell.xVariable !== cell.yVariable)
    .forEach((cell) => {
      const pairKey = [cell.xVariable, cell.yVariable].sort().join("|");
      if (!uniquePairs.has(pairKey)) {
        uniquePairs.set(pairKey, cell.correlation);
      }
    });

  const correlations = Array.from(uniquePairs.values()).filter(
    (value): value is number => value !== null && Number.isFinite(value)
  );

  if (correlations.length === 0) return false;

  return correlations.every((correlation) => Math.abs(correlation) < 0.3);
};

type ScientificScatterMatrixProps = {
  analysis: ScatterMatrixAnalysis;
  seriesColors: Map<string, string>;
  experimentalStatistics: ExperimentalStatistics[];
};

function ScientificScatterMatrix({
  analysis,
  seriesColors,
  experimentalStatistics,
}: ScientificScatterMatrixProps) {
  const variableCount = analysis.variables.length;
  const statsByName = new Map(
    experimentalStatistics.map((stats) => [stats.seriesName, stats])
  );

  const getCell = (xVariable: string, yVariable: string) =>
    analysis.cells.find(
      (cell) => cell.xVariable === xVariable && cell.yVariable === yVariable
    );

  return (
    <div className="overflow-x-auto mt-3">
      <div
        className="inline-grid gap-1.5"
        style={{
          gridTemplateColumns: `72px repeat(${variableCount}, 120px)`,
        }}
      >
        <div />
        {analysis.variables.map((variable) => (
          <div
            key={`scatter-matrix-col-${variable}`}
            className="text-xs font-semibold text-center truncate px-1"
            title={variable}
          >
            {variable}
          </div>
        ))}

        {analysis.variables.map((rowVariable) => (
          <Fragment key={`scatter-matrix-row-${rowVariable}`}>
            <div
              className="text-xs font-semibold flex items-center truncate pr-1"
              title={rowVariable}
            >
              {rowVariable}
            </div>
            {analysis.variables.map((columnVariable) => {
              const cell = getCell(rowVariable, columnVariable);
              const isDiagonal = rowVariable === columnVariable;
              const stats = statsByName.get(rowVariable);
              const pointColor =
                seriesColors.get(columnVariable) ??
                seriesColors.get(rowVariable) ??
                "var(--app-accent)";

              return (
                <div
                  key={`scatter-matrix-cell-${rowVariable}-${columnVariable}`}
                  className="rounded border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-1 flex flex-col items-center justify-center"
                  style={{ width: 120, minHeight: 120 }}
                >
                  {isDiagonal ? (
                    <>
                      <p
                        className="text-[10px] font-semibold truncate w-full text-center"
                        title={rowVariable}
                      >
                        {rowVariable}
                      </p>
                      <p className="text-[10px]">N: {stats?.count ?? "—"}</p>
                      <p className="text-[10px]">
                        Media:{" "}
                        {stats ? formatExperimentalStat(stats.meanY) : "—"}
                      </p>
                      <p className="text-[10px]">
                        SD: {stats ? formatExperimentalStat(stats.stdDevY) : "—"}
                      </p>
                    </>
                  ) : (
                    <>
                      <div style={{ width: 120, height: 88 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart
                            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                          >
                            <XAxis type="number" dataKey="x" hide />
                            <YAxis type="number" dataKey="y" hide />
                            <Scatter
                              data={cell?.points ?? []}
                              fill={pointColor}
                              line={false}
                              isAnimationActive={false}
                              r={3}
                            />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-[10px] text-[var(--app-text-muted)] mt-0.5">
                        {cell?.correlation != null &&
                        Number.isFinite(cell.correlation)
                          ? `r = ${cell.correlation.toFixed(2)}`
                          : "r = N/A"}
                      </p>
                    </>
                  )}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

type ParallelCoordinateAxis = {
  variable: string;
  min: number;
  max: number;
};

type ParallelCoordinateObservation = {
  observationIndex: number;
  values: number[];
};

type ParallelCoordinatesAnalysis = {
  axes: ParallelCoordinateAxis[];
  observations: ParallelCoordinateObservation[];
  interpretation: string[];
};

const PARALLEL_COORDINATES_MIN_SERIES = 3;
const PARALLEL_COORDINATES_MIN_OBSERVATIONS = 3;

const isParallelCoordinatesInputValid = (series: ExperimentalSeries[]) =>
  series.length >= PARALLEL_COORDINATES_MIN_SERIES &&
  series.every(
    (item) =>
      getSeriesYValues(item).length >= PARALLEL_COORDINATES_MIN_OBSERVATIONS
  );

const normalizeParallelCoordinateValue = (
  value: number,
  axis: ParallelCoordinateAxis
) => {
  if (axis.max === axis.min) return 0.5;
  return (value - axis.min) / (axis.max - axis.min);
};

const computeParallelCoordinateEuclideanDistance = (
  profileA: number[],
  profileB: number[]
) => {
  let sumSquares = 0;
  for (let index = 0; index < profileA.length; index += 1) {
    const delta = (profileA[index] ?? 0) - (profileB[index] ?? 0);
    sumSquares += delta * delta;
  }
  return Math.sqrt(sumSquares);
};

const buildParallelCoordinatesNormalizedProfiles = (
  analysis: ParallelCoordinatesAnalysis
) =>
  analysis.observations.map((observation) =>
    observation.values.map((value, index) =>
      normalizeParallelCoordinateValue(value, analysis.axes[index]!)
    )
  );

const hasParallelCoordinatesSimilarTrajectories = (
  analysis: ParallelCoordinatesAnalysis | null
) => {
  if (!analysis || analysis.observations.length < 2) return false;

  const profiles = buildParallelCoordinatesNormalizedProfiles(analysis);
  const variableCount = analysis.axes.length;
  const distanceThreshold = 0.3 * Math.sqrt(Math.max(variableCount, 1));
  const similarCount = profiles.filter((profile, index) => {
    let minDistance = Number.POSITIVE_INFINITY;
    for (let otherIndex = 0; otherIndex < profiles.length; otherIndex += 1) {
      if (otherIndex === index) continue;
      minDistance = Math.min(
        minDistance,
        computeParallelCoordinateEuclideanDistance(
          profile,
          profiles[otherIndex] ?? []
        )
      );
    }
    return minDistance < distanceThreshold;
  }).length;

  return similarCount / profiles.length > 0.6;
};

const hasParallelCoordinatesHeterogeneousTrajectories = (
  analysis: ParallelCoordinatesAnalysis | null
) => {
  if (!analysis || analysis.observations.length === 0) return false;
  return !hasParallelCoordinatesSimilarTrajectories(analysis);
};

const getParallelCoordinatesDominantVariables = (
  analysis: ParallelCoordinatesAnalysis
) => {
  const ranges = analysis.axes.map((axis) => axis.max - axis.min);
  const averageRange =
    ranges.reduce((sum, range) => sum + range, 0) / Math.max(ranges.length, 1);

  return analysis.axes
    .filter((_axis, index) => ranges[index]! > 2 * averageRange)
    .map((axis) => axis.variable);
};

const buildParallelCoordinatesInterpretation = (
  axes: ParallelCoordinateAxis[],
  observations: ParallelCoordinateObservation[]
): string[] => {
  const interpretation: string[] = [];

  axes.forEach((axis, axisIndex) => {
    const values = observations
      .map((observation) => observation.values[axisIndex])
      .filter((value): value is number => Number.isFinite(value));
    if (values.length === 0) return;

    const mean =
      values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance =
      values.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
      values.length;
    const stdDev = Math.sqrt(variance);
    const range = axis.max - axis.min;
    const relativeStdDev =
      range > 0 ? stdDev / range : Math.abs(mean) > 0 ? stdDev / Math.abs(mean) : 0;

    if (relativeStdDev < 0.1) {
      interpretation.push(
        `La variable ${axis.variable} presenta baja variabilidad entre observaciones.`
      );
    }
  });

  getParallelCoordinatesDominantVariables({ axes, observations, interpretation: [] })
    .forEach((variable) => {
      interpretation.push(
        `La variable ${variable} domina la variabilidad del conjunto.`
      );
    });

  const previewAnalysis: ParallelCoordinatesAnalysis = {
    axes,
    observations,
    interpretation: [],
  };

  if (hasParallelCoordinatesSimilarTrajectories(previewAnalysis)) {
    interpretation.push(
      "Las observaciones muestran patrones multivariantes similares."
    );
  } else if (observations.length > 0) {
    interpretation.push(
      "Las observaciones presentan perfiles multivariantes heterogéneos."
    );
  }

  return deduplicateTextLines(interpretation);
};

const buildParallelCoordinatesAnalysis = (
  series: ExperimentalSeries[]
): ParallelCoordinatesAnalysis | null => {
  if (!isParallelCoordinatesInputValid(series)) return null;

  const observationCount = Math.min(...series.map((item) => item.points.length));
  if (observationCount < PARALLEL_COORDINATES_MIN_OBSERVATIONS) return null;

  const axes: ParallelCoordinateAxis[] = series.map((item) => ({
    variable: item.name,
    min: Number.POSITIVE_INFINITY,
    max: Number.NEGATIVE_INFINITY,
  }));
  const observations: ParallelCoordinateObservation[] = [];

  for (let observationIndex = 0; observationIndex < observationCount; observationIndex += 1) {
    const values: number[] = [];
    let isValidObservation = true;

    for (let seriesIndex = 0; seriesIndex < series.length; seriesIndex += 1) {
      const value = series[seriesIndex]?.points[observationIndex]?.y;
      if (!Number.isFinite(value)) {
        isValidObservation = false;
        break;
      }
      values.push(value);
    }

    if (!isValidObservation) continue;

    values.forEach((value, seriesIndex) => {
      const axis = axes[seriesIndex];
      if (!axis) return;
      axis.min = Math.min(axis.min, value);
      axis.max = Math.max(axis.max, value);
    });

    observations.push({ observationIndex, values });
  }

  if (observations.length < PARALLEL_COORDINATES_MIN_OBSERVATIONS) return null;

  return {
    axes,
    observations,
    interpretation: buildParallelCoordinatesInterpretation(axes, observations),
  };
};

const getParallelCoordinatesReportLines = (
  analysis: ParallelCoordinatesAnalysis | null
): string[] => {
  if (!analysis) {
    return [
      "No hay datos suficientes para generar Parallel Coordinates Plot.",
    ];
  }

  const dominantVariables = getParallelCoordinatesDominantVariables(analysis);
  const lines = [
    `Variables analizadas: ${analysis.axes.map((axis) => axis.variable).join(", ")}.`,
    `Observaciones: ${analysis.observations.length}.`,
  ];

  if (dominantVariables.length > 0) {
    lines.push(
      `Variables dominantes: ${dominantVariables.join(", ")}.`
    );
  } else {
    lines.push("Variables dominantes: ninguna detectada.");
  }

  if (hasParallelCoordinatesSimilarTrajectories(analysis)) {
    lines.push("Patrones detectados: trayectorias multivariantes similares.");
  } else {
    lines.push("Patrones detectados: perfiles multivariantes heterogéneos.");
  }

  analysis.interpretation.forEach((line) => lines.push(line));
  return deduplicateTextLines(lines);
};

type ScientificParallelCoordinatesPlotProps = {
  analysis: ParallelCoordinatesAnalysis;
};

function ScientificParallelCoordinatesPlot({
  analysis,
}: ScientificParallelCoordinatesPlotProps) {
  const height = 260;
  const paddingTop = 24;
  const paddingBottom = 8;
  const paddingX = 48;
  const plotHeight = height - paddingTop - paddingBottom;
  const axisCount = analysis.axes.length;
  const width = Math.max(320, paddingX * 2 + Math.max(axisCount - 1, 1) * 72);

  const getAxisX = (index: number) =>
    axisCount <= 1
      ? width / 2
      : paddingX +
        (index / (axisCount - 1)) * (width - paddingX * 2);

  const getAxisY = (value: number, axis: ParallelCoordinateAxis) => {
    const normalized = normalizeParallelCoordinateValue(value, axis);
    return paddingTop + (1 - normalized) * plotHeight;
  };

  const getObservationColor = (index: number, total: number) => {
    const ratio = total <= 1 ? 0 : index / (total - 1);
    const hue = 205 + ratio * 95;
    const lightness = 42 + ratio * 12;
    return `hsl(${hue}, 68%, ${lightness}%)`;
  };

  return (
    <div className="w-full mt-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height: 260 }}
        role="img"
        aria-label="Parallel coordinates plot de variables experimentales"
      >
        {analysis.axes.map((axis, index) => {
          const axisX = getAxisX(index);
          return (
            <g key={`parallel-axis-${axis.variable}`}>
              <line
                x1={axisX}
                y1={paddingTop}
                x2={axisX}
                y2={paddingTop + plotHeight}
                stroke="var(--app-border)"
                strokeWidth={1.5}
              />
              <text
                x={axisX}
                y={14}
                textAnchor="middle"
                fill="var(--app-text)"
                fontSize={10}
                fontWeight={600}
              >
                {axis.variable.length > 10
                  ? `${axis.variable.slice(0, 9)}…`
                  : axis.variable}
              </text>
              <title>{axis.variable}</title>
            </g>
          );
        })}

        {analysis.observations.map((observation) => {
          const points = observation.values
            .map((value, index) => {
              const axis = analysis.axes[index];
              if (!axis) return null;
              return `${getAxisX(index)},${getAxisY(value, axis)}`;
            })
            .filter((point): point is string => point !== null)
            .join(" ");

          return (
            <polyline
              key={`parallel-observation-${observation.observationIndex}`}
              points={points}
              fill="none"
              stroke={getObservationColor(
                observation.observationIndex,
                analysis.observations.length
              )}
              strokeWidth={1.5}
              opacity={0.78}
            />
          );
        })}
      </svg>
    </div>
  );
}

type CorrelationNetworkNode = {
  id: string;
  label: string;
};

type CorrelationNetworkEdge = {
  source: string;
  target: string;
  correlation: number;
};

type CorrelationNetworkAnalysis = {
  nodes: CorrelationNetworkNode[];
  edges: CorrelationNetworkEdge[];
  interpretation: string[];
};

const CORRELATION_NETWORK_MIN_SERIES = 2;
const CORRELATION_NETWORK_MIN_OBSERVATIONS = 3;
const CORRELATION_NETWORK_EDGE_THRESHOLD = 0.5;

const isCorrelationNetworkInputValid = (series: ExperimentalSeries[]) =>
  series.length >= CORRELATION_NETWORK_MIN_SERIES &&
  series.every(
    (item) =>
      getSeriesYValues(item).length >= CORRELATION_NETWORK_MIN_OBSERVATIONS
  );

const getCorrelationNetworkDensity = (analysis: CorrelationNetworkAnalysis) => {
  const nodeCount = analysis.nodes.length;
  if (nodeCount < 2) return 0;
  const maxEdges = (nodeCount * (nodeCount - 1)) / 2;
  return analysis.edges.length / maxEdges;
};

const getCorrelationNetworkCentralNode = (
  analysis: CorrelationNetworkAnalysis
): string | null => {
  if (analysis.edges.length === 0) return null;

  const connectionCounts = new Map<string, number>();
  analysis.nodes.forEach((node) => connectionCounts.set(node.id, 0));
  analysis.edges.forEach((edge) => {
    connectionCounts.set(
      edge.source,
      (connectionCounts.get(edge.source) ?? 0) + 1
    );
    connectionCounts.set(
      edge.target,
      (connectionCounts.get(edge.target) ?? 0) + 1
    );
  });

  let centralNode: string | null = null;
  let maxConnections = -1;
  connectionCounts.forEach((count, nodeId) => {
    if (count > maxConnections) {
      maxConnections = count;
      centralNode = nodeId;
    }
  });

  return centralNode;
};

const hasCorrelationNetworkHighDensity = (
  analysis: CorrelationNetworkAnalysis | null
) => {
  if (!analysis) return false;
  return getCorrelationNetworkDensity(analysis) > 0.6;
};

const hasCorrelationNetworkSparseStructure = (
  analysis: CorrelationNetworkAnalysis | null
) => {
  if (!analysis) return false;
  return getCorrelationNetworkDensity(analysis) < 0.25;
};

const hasCorrelationHeatmapStrongCorrelations = (
  heatmap: HeatmapAnalysis | null
) => {
  if (!heatmap) return false;

  const seenPairs = new Set<string>();
  return heatmap.cells.some((cell) => {
    if (cell.row === cell.column || !Number.isFinite(cell.value)) return false;
    const pairKey = [cell.row, cell.column].sort().join("|");
    if (seenPairs.has(pairKey)) return false;
    seenPairs.add(pairKey);
    return Math.abs(cell.value) >= 0.5;
  });
};

const buildCorrelationNetworkInterpretation = (
  nodes: CorrelationNetworkNode[],
  edges: CorrelationNetworkEdge[]
): string[] => {
  const interpretation: string[] = [];
  const previewAnalysis: CorrelationNetworkAnalysis = {
    nodes,
    edges,
    interpretation: [],
  };
  const density = getCorrelationNetworkDensity(previewAnalysis);

  if (density > 0.6) {
    interpretation.push("Las variables forman una red altamente conectada.");
  }

  const centralNode = getCorrelationNetworkCentralNode(previewAnalysis);
  if (centralNode) {
    interpretation.push(
      `La variable ${centralNode} actúa como nodo central de la red.`
    );
  }

  edges.forEach((edge) => {
    if (edge.correlation >= 0.8) {
      interpretation.push(
        `Existe una relación positiva muy fuerte entre ${edge.source} y ${edge.target}.`
      );
    } else if (edge.correlation <= -0.8) {
      interpretation.push(
        `Existe una relación negativa muy fuerte entre ${edge.source} y ${edge.target}.`
      );
    }
  });

  if (density < 0.25) {
    interpretation.push("La estructura de correlaciones es limitada.");
  }

  return deduplicateTextLines(interpretation);
};

const buildCorrelationNetworkAnalysis = (
  series: ExperimentalSeries[]
): CorrelationNetworkAnalysis | null => {
  if (!isCorrelationNetworkInputValid(series)) return null;

  const nodes: CorrelationNetworkNode[] = series.map((item) => ({
    id: item.name,
    label: item.name,
  }));
  const edges: CorrelationNetworkEdge[] = [];

  for (let indexA = 0; indexA < series.length; indexA += 1) {
    for (let indexB = indexA + 1; indexB < series.length; indexB += 1) {
      const seriesA = series[indexA];
      const seriesB = series[indexB];
      if (!seriesA || !seriesB) continue;

      const correlation = computeSeriesPairCorrelation(
        seriesA,
        seriesB,
        "pearson"
      );
      if (
        correlation === null ||
        !Number.isFinite(correlation) ||
        Math.abs(correlation) < CORRELATION_NETWORK_EDGE_THRESHOLD
      ) {
        continue;
      }

      edges.push({
        source: seriesA.name,
        target: seriesB.name,
        correlation,
      });
    }
  }

  return {
    nodes,
    edges,
    interpretation: buildCorrelationNetworkInterpretation(nodes, edges),
  };
};

const getCorrelationNetworkReportLines = (
  analysis: CorrelationNetworkAnalysis | null
): string[] => {
  if (!analysis) {
    return ["No hay datos suficientes para generar Correlation Network."];
  }

  const density = getCorrelationNetworkDensity(analysis);
  const centralNode = getCorrelationNetworkCentralNode(analysis);
  const lines = [
    `Variables: ${analysis.nodes.map((node) => node.label).join(", ")}.`,
    `Conexiones: ${analysis.edges.length}.`,
    `Nodo central: ${centralNode ?? "Ninguno"}.`,
    `Densidad: ${(density * 100).toFixed(0)}%.`,
  ];

  analysis.interpretation.forEach((line) => lines.push(line));
  return deduplicateTextLines(lines);
};

type ScientificCorrelationNetworkProps = {
  analysis: CorrelationNetworkAnalysis;
};

function ScientificCorrelationNetwork({
  analysis,
}: ScientificCorrelationNetworkProps) {
  const size = 300;
  const center = size / 2;
  const radius = 102;
  const nodeRadius = 6;
  const nodeCount = analysis.nodes.length;

  const nodePositions = new Map<string, { x: number; y: number }>();
  analysis.nodes.forEach((node, index) => {
    const angle = (2 * Math.PI * index) / Math.max(nodeCount, 1) - Math.PI / 2;
    nodePositions.set(node.id, {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    });
  });

  const getEdgeStrokeWidth = (correlation: number) =>
    1.2 + Math.abs(correlation) * 3.2;

  const getEdgeColor = (correlation: number) =>
    correlation >= 0 ? "#2563eb" : "#dc2626";

  return (
    <div className="w-full mt-3 flex justify-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[300px]"
        style={{ height: 300 }}
        role="img"
        aria-label="Red de correlaciones entre variables experimentales"
      >
        {analysis.edges.map((edge) => {
          const source = nodePositions.get(edge.source);
          const target = nodePositions.get(edge.target);
          if (!source || !target) return null;

          const midX = (source.x + target.x) / 2;
          const midY = (source.y + target.y) / 2;

          return (
            <g key={`correlation-edge-${edge.source}-${edge.target}`}>
              <line
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={getEdgeColor(edge.correlation)}
                strokeWidth={getEdgeStrokeWidth(edge.correlation)}
                opacity={0.82}
              />
              <text
                x={midX}
                y={midY - 4}
                textAnchor="middle"
                fill="var(--app-text-muted)"
                fontSize={9}
                fontWeight={600}
              >
                {edge.correlation.toFixed(2)}
              </text>
            </g>
          );
        })}

        {analysis.nodes.map((node) => {
          const position = nodePositions.get(node.id);
          if (!position) return null;

          return (
            <g key={`correlation-node-${node.id}`}>
              <circle
                cx={position.x}
                cy={position.y}
                r={nodeRadius}
                fill="var(--app-accent)"
                stroke="var(--app-surface)"
                strokeWidth={2}
              />
              <text
                x={position.x}
                y={position.y + nodeRadius + 12}
                textAnchor="middle"
                fill="var(--app-text)"
                fontSize={10}
                fontWeight={600}
              >
                {node.label.length > 12
                  ? `${node.label.slice(0, 11)}…`
                  : node.label}
              </text>
              <title>{node.label}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

type SimilarityNetworkNode = {
  id: string;
};

type SimilarityNetworkEdge = {
  source: string;
  target: string;
  distance: number;
  similarity: number;
};

type SimilarityNetworkAnalysis = {
  nodes: SimilarityNetworkNode[];
  edges: SimilarityNetworkEdge[];
  averageSimilarity: number;
  strongestConnection?: SimilarityNetworkEdge;
  weakestConnection?: SimilarityNetworkEdge;
  interpretation: string[];
};

const SIMILARITY_NETWORK_EDGE_THRESHOLD = 0.5;

const hasSimilarityNetworkHighAverage = (
  analysis: SimilarityNetworkAnalysis | null
) => analysis !== null && analysis.averageSimilarity >= 0.75;

const buildSimilarityNetworkInterpretation = (
  analysis: SimilarityNetworkAnalysis
): string[] => {
  const interpretation: string[] = [];

  if (analysis.averageSimilarity >= 0.75) {
    interpretation.push("Las variables presentan una alta similitud global.");
  } else if (analysis.averageSimilarity >= 0.5) {
    interpretation.push("Las variables presentan similitudes moderadas.");
  } else {
    interpretation.push("La estructura presenta grupos diferenciados.");
  }

  if (analysis.strongestConnection) {
    interpretation.push(
      `La mayor similitud se observa entre ${analysis.strongestConnection.source} y ${analysis.strongestConnection.target}.`
    );
  }

  if (analysis.weakestConnection) {
    interpretation.push(
      `La menor similitud se observa entre ${analysis.weakestConnection.source} y ${analysis.weakestConnection.target}.`
    );
  }

  return deduplicateTextLines(interpretation);
};

const buildSimilarityNetworkAnalysis = (
  distanceMatrixAnalysis: DistanceMatrixAnalysis | null
): SimilarityNetworkAnalysis | null => {
  if (!distanceMatrixAnalysis) return null;

  const { variables, matrix, maxDistance } = distanceMatrixAnalysis;
  const nodes: SimilarityNetworkNode[] = variables.map((variable) => ({
    id: variable,
  }));
  const edges: SimilarityNetworkEdge[] = [];

  for (let rowIndex = 0; rowIndex < variables.length; rowIndex += 1) {
    for (
      let columnIndex = rowIndex + 1;
      columnIndex < variables.length;
      columnIndex += 1
    ) {
      const distance = matrix[rowIndex]?.[columnIndex] ?? 0;
      const similarity =
        maxDistance === 0 ? 1 : 1 - distance / maxDistance;

      if (similarity < SIMILARITY_NETWORK_EDGE_THRESHOLD) continue;

      edges.push({
        source: variables[rowIndex]!,
        target: variables[columnIndex]!,
        distance,
        similarity,
      });
    }
  }

  let strongestConnection: SimilarityNetworkEdge | undefined;
  let weakestConnection: SimilarityNetworkEdge | undefined;
  edges.forEach((edge) => {
    if (
      !strongestConnection ||
      edge.similarity > strongestConnection.similarity
    ) {
      strongestConnection = edge;
    }
    if (
      !weakestConnection ||
      edge.similarity < weakestConnection.similarity
    ) {
      weakestConnection = edge;
    }
  });

  const averageSimilarity =
    edges.length > 0
      ? edges.reduce((sum, edge) => sum + edge.similarity, 0) / edges.length
      : 0;

  const analysis: SimilarityNetworkAnalysis = {
    nodes,
    edges,
    averageSimilarity,
    strongestConnection,
    weakestConnection,
    interpretation: [],
  };

  analysis.interpretation = buildSimilarityNetworkInterpretation(analysis);
  return analysis;
};

const getSimilarityNetworkReportLines = (
  analysis: SimilarityNetworkAnalysis | null
): string[] => {
  if (!analysis) {
    return ["No hay datos suficientes para generar Similarity Network."];
  }

  const lines = [
    `Variables: ${analysis.nodes.map((node) => node.id).join(", ")}.`,
    `Conexiones: ${analysis.edges.length}.`,
    `Similitud promedio: ${analysis.averageSimilarity.toFixed(2)}.`,
    `Conexión más fuerte: ${
      analysis.strongestConnection
        ? `${analysis.strongestConnection.source} ↔ ${analysis.strongestConnection.target} (${analysis.strongestConnection.similarity.toFixed(2)}).`
        : "Ninguna."
    }`,
    `Conexión más débil: ${
      analysis.weakestConnection
        ? `${analysis.weakestConnection.source} ↔ ${analysis.weakestConnection.target} (${analysis.weakestConnection.similarity.toFixed(2)}).`
        : "Ninguna."
    }`,
  ];

  analysis.interpretation.forEach((line) => lines.push(line));
  return deduplicateTextLines(lines);
};

type ScientificSimilarityNetworkProps = {
  analysis: SimilarityNetworkAnalysis;
  seriesColors: Map<string, string>;
};

function ScientificSimilarityNetwork({
  analysis,
  seriesColors,
}: ScientificSimilarityNetworkProps) {
  const size = 300;
  const center = size / 2;
  const radius = 102;
  const nodeRadius = 6;
  const nodeCount = analysis.nodes.length;

  const nodePositions = new Map<string, { x: number; y: number }>();
  analysis.nodes.forEach((node, index) => {
    const angle = (2 * Math.PI * index) / Math.max(nodeCount, 1) - Math.PI / 2;
    nodePositions.set(node.id, {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    });
  });

  const getEdgeStrokeWidth = (similarity: number) => 1.2 + similarity * 3.2;

  return (
    <div className="w-full mt-3 flex justify-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[300px]"
        style={{ height: 300 }}
        role="img"
        aria-label="Red de similitud entre variables experimentales"
      >
        {analysis.edges.map((edge) => {
          const source = nodePositions.get(edge.source);
          const target = nodePositions.get(edge.target);
          if (!source || !target) return null;

          const midX = (source.x + target.x) / 2;
          const midY = (source.y + target.y) / 2;

          return (
            <g key={`similarity-edge-${edge.source}-${edge.target}`}>
              <line
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="#2563eb"
                strokeWidth={getEdgeStrokeWidth(edge.similarity)}
                opacity={0.82}
              />
              <text
                x={midX}
                y={midY - 4}
                textAnchor="middle"
                fill="var(--app-text-muted)"
                fontSize={9}
                fontWeight={600}
              >
                {edge.similarity.toFixed(2)}
              </text>
            </g>
          );
        })}

        {analysis.nodes.map((node) => {
          const position = nodePositions.get(node.id);
          if (!position) return null;
          const nodeColor =
            seriesColors.get(node.id) ?? "var(--app-accent)";

          return (
            <g key={`similarity-node-${node.id}`}>
              <circle
                cx={position.x}
                cy={position.y}
                r={nodeRadius}
                fill={nodeColor}
                stroke="var(--app-surface)"
                strokeWidth={2}
              />
              <text
                x={position.x}
                y={position.y + nodeRadius + 12}
                textAnchor="middle"
                fill="var(--app-text)"
                fontSize={10}
                fontWeight={600}
              >
                {node.id.length > 12 ? `${node.id.slice(0, 11)}…` : node.id}
              </text>
              <title>{node.id}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

type VariableImportanceEntry = {
  variable: string;
  score: number;
  normalizedScore: number;
  rank: number;
  factors: string[];
};

type VariableImportanceAnalysis = {
  entries: VariableImportanceEntry[];
  interpretation: string[];
};

const VARIABLE_IMPORTANCE_MIN_SERIES = 2;

const isVariableImportanceInputValid = (series: ExperimentalSeries[]) =>
  series.length >= VARIABLE_IMPORTANCE_MIN_SERIES;

const getVariableNetworkDegree = (
  analysis: { edges: { source: string; target: string }[] } | null,
  variable: string
) => {
  if (!analysis) return 0;
  return analysis.edges.filter(
    (edge) => edge.source === variable || edge.target === variable
  ).length;
};

const getSimilarityNetworkCentralNode = (
  analysis: SimilarityNetworkAnalysis | null
): string | null => {
  if (!analysis || analysis.edges.length === 0) return null;

  const connectionCounts = new Map<string, number>();
  analysis.nodes.forEach((node) => connectionCounts.set(node.id, 0));
  analysis.edges.forEach((edge) => {
    connectionCounts.set(
      edge.source,
      (connectionCounts.get(edge.source) ?? 0) + 1
    );
    connectionCounts.set(
      edge.target,
      (connectionCounts.get(edge.target) ?? 0) + 1
    );
  });

  let centralNode: string | null = null;
  let maxConnections = -1;
  connectionCounts.forEach((count, nodeId) => {
    if (count > maxConnections) {
      maxConnections = count;
      centralNode = nodeId;
    }
  });

  return centralNode;
};

const getTopVariableImportanceEntry = (
  analysis: VariableImportanceAnalysis | null
) => {
  if (!analysis || analysis.entries.length === 0) return null;
  return (
    analysis.entries.find((entry) => entry.rank === 1) ?? analysis.entries[0]
  );
};

const hasVariableImportanceDominantTop = (
  analysis: VariableImportanceAnalysis | null
) => {
  const topEntry = getTopVariableImportanceEntry(analysis);
  return topEntry !== null && topEntry.normalizedScore >= 80;
};

const hasVariableImportanceDominanceGap = (
  analysis: VariableImportanceAnalysis | null
) => {
  if (!analysis || analysis.entries.length < 2) return false;
  const sortedEntries = [...analysis.entries].sort(
    (left, right) => left.rank - right.rank
  );
  const topEntry = sortedEntries[0];
  const secondEntry = sortedEntries[1];
  if (!topEntry || !secondEntry) return false;
  return topEntry.normalizedScore - secondEntry.normalizedScore > 50;
};

const getPcaPc1LeaderVariable = (pcaAnalysis: PCAAnalysis | null) => {
  if (!pcaAnalysis || pcaAnalysis.loadings.length === 0) return null;
  return pcaAnalysis.loadings.reduce((leader, loading) =>
    loading.contributionPc1 > leader.contributionPc1 ? loading : leader
  ).variable;
};

const buildVariableImportanceInterpretation = (
  entries: VariableImportanceEntry[]
): string[] => {
  const interpretation: string[] = [];

  entries.forEach((entry) => {
    if (entry.factors.includes("Variable constante")) {
      interpretation.push(
        `La variable ${entry.variable} presenta variabilidad insuficiente para contribuir significativamente.`
      );
      return;
    }

    if (entry.normalizedScore >= 80) {
      interpretation.push(
        `La variable ${entry.variable} presenta una importancia dominante en el conjunto de datos.`
      );
    } else if (entry.normalizedScore >= 50) {
      interpretation.push(
        `La variable ${entry.variable} aporta información relevante al análisis.`
      );
    } else if (entry.normalizedScore < 30) {
      interpretation.push(
        `La variable ${entry.variable} tiene una contribución limitada.`
      );
    }
  });

  return deduplicateTextLines(interpretation);
};

const buildVariableImportanceAnalysis = (input: {
  series: ExperimentalSeries[];
  pcaAnalysis: PCAAnalysis | null;
  correlationNetworkAnalysis: CorrelationNetworkAnalysis | null;
  similarityNetworkAnalysis: SimilarityNetworkAnalysis | null;
  distanceMatrixAnalysis: DistanceMatrixAnalysis | null;
  experimentalStatistics: ExperimentalStatistics[];
}): VariableImportanceAnalysis | null => {
  if (!isVariableImportanceInputValid(input.series)) return null;

  const statsByName = new Map(
    input.experimentalStatistics.map((stats) => [stats.seriesName, stats])
  );
  const pcaLoadingsByVariable = new Map(
    (input.pcaAnalysis?.loadings ?? []).map((loading) => [
      loading.variable,
      loading,
    ])
  );

  const rawEntries = input.series.map((item) => {
    const variable = item.name;
    const factors: string[] = [];
    let score = 0;

    const loading = pcaLoadingsByVariable.get(variable);
    if (loading) {
      score += loading.contributionPc1;
      if (loading.contributionPc1 > 0) {
        factors.push("PCA PC1");
      }
    }

    const correlationDegree = getVariableNetworkDegree(
      input.correlationNetworkAnalysis,
      variable
    );
    if (correlationDegree > 0) {
      score += correlationDegree * 10;
      factors.push("Correlation Network");
    }

    const similarityDegree = getVariableNetworkDegree(
      input.similarityNetworkAnalysis,
      variable
    );
    if (similarityDegree > 0) {
      score += similarityDegree * 5;
      factors.push("Similarity Network");
    }

    if (input.distanceMatrixAnalysis) {
      const variableIndex =
        input.distanceMatrixAnalysis.variables.indexOf(variable);
      if (variableIndex >= 0) {
        const distances =
          input.distanceMatrixAnalysis.matrix[variableIndex]?.filter(
            (distance, index) =>
              index !== variableIndex && Number.isFinite(distance)
          ) ?? [];
        if (distances.length > 0) {
          const averageDistance =
            distances.reduce((sum, distance) => sum + distance, 0) /
            distances.length;
          const normalizedAverageDistance =
            input.distanceMatrixAnalysis.maxDistance > 0
              ? averageDistance / input.distanceMatrixAnalysis.maxDistance
              : 0;
          score += normalizedAverageDistance * 15;
          factors.push("Distance Matrix");
        }
      }
    }

    const stats = statsByName.get(variable);
    if (stats && stats.stdDevY === 0) {
      score *= 0.25;
      factors.push("Variable constante");
    }

    return {
      variable,
      score,
      factors: deduplicateTextLines(factors),
    };
  });

  const maxScore = Math.max(...rawEntries.map((entry) => entry.score), 0);
  const entries = rawEntries
    .map((entry) => ({
      variable: entry.variable,
      score: entry.score,
      normalizedScore: maxScore > 0 ? (entry.score / maxScore) * 100 : 0,
      rank: 0,
      factors: entry.factors,
    }))
    .sort((left, right) => right.normalizedScore - left.normalizedScore)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  return {
    entries,
    interpretation: buildVariableImportanceInterpretation(entries),
  };
};

const getVariableImportanceReportLines = (
  analysis: VariableImportanceAnalysis | null
): string[] => {
  if (!analysis) {
    return ["No hay datos suficientes para generar Variable Importance."];
  }

  const lines = ["Ranking:"];
  [...analysis.entries]
    .sort((left, right) => left.rank - right.rank)
    .forEach((entry) => {
      lines.push(
        `${entry.rank}. ${entry.variable} — ${entry.normalizedScore.toFixed(0)}%.`
      );
      lines.push(
        `Puntaje: ${entry.score.toFixed(2)}. Factores: ${entry.factors.join(", ") || "Ninguno"}.`
      );
    });

  analysis.interpretation.forEach((line) => lines.push(line));
  return deduplicateTextLines(lines);
};

type ScientificVariableImportanceChartProps = {
  analysis: VariableImportanceAnalysis;
  chartTheme: ReturnType<typeof getChartTheme>;
};

function ScientificVariableImportanceChart({
  analysis,
  chartTheme,
}: ScientificVariableImportanceChartProps) {
  const chartData = [...analysis.entries]
    .sort((left, right) => right.normalizedScore - left.normalizedScore)
    .map((entry) => ({
      variable: entry.variable,
      importance: entry.normalizedScore,
    }));

  return (
    <div className="h-[280px] mt-3">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 8, right: 32, left: 8, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: chartTheme.axis, fontSize: 11 }}
          />
          <YAxis
            type="category"
            dataKey="variable"
            width={108}
            tick={{ fill: chartTheme.axis, fontSize: 10 }}
          />
          <Tooltip
            content={({ active, payload: tooltipPayload }) => {
              if (!active || !tooltipPayload?.length) return null;

              const item = tooltipPayload[0]?.payload as
                | { variable?: string; importance?: number }
                | undefined;
              if (!item) return null;

              return (
                <div
                  className="rounded-lg border px-3 py-2 text-sm shadow-sm"
                  style={{
                    borderColor: chartTheme.tooltipBorder,
                    backgroundColor: chartTheme.tooltipBg,
                    color: chartTheme.tooltipColor,
                  }}
                >
                  <p className="font-semibold">{item.variable}</p>
                  <p>Importancia: {item.importance?.toFixed(1) ?? "0.0"}%</p>
                </div>
              );
            }}
          />
          <Bar
            dataKey="importance"
            fill="var(--app-accent)"
            radius={[0, 4, 4, 0]}
            isAnimationActive={false}
            label={{
              position: "right",
              formatter: (value) =>
                typeof value === "number" ? value.toFixed(1) : `${value}`,
              fill: "var(--app-text-muted)",
              fontSize: 10,
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

type MDSPoint = {
  seriesName: string;
  x: number;
  y: number;
};

type MDSAnalysis = {
  points: MDSPoint[];
  stress: number;
  interpretation: string[];
};

type DistanceMatrixCell = {
  row: string;
  column: string;
  distance: number;
};

type DistanceMatrixAnalysis = {
  variables: string[];
  matrix: number[][];
  minDistance: number;
  maxDistance: number;
  averageDistance: number;
  interpretation: string[];
};

type ClusterHeatmapCell = {
  row: string;
  column: string;
  value: number;
};

type ClusterHeatmapAnalysis = {
  variables: string[];
  orderedVariables: string[];
  matrix: number[][];
  interpretation: string[];
};

type ClusteredDistanceHeatmapAnalysis = {
  orderedVariables: string[];
  matrix: number[][];
  averageDistance: number;
  maxDistance: number;
  interpretation: string[];
};

type MultivariateDashboardAnalysis = {
  summaryCards: {
    pcaVariance?: number;
    clusterCount?: number;
    mdsStress?: number;
    topVariable?: string;
    topVariableScore?: number;
    averageSimilarity?: number;
  };
  diagnosis: string[];
};

type ManovaExplorerAnalysis = {
  groupCount: number;
  variableCount: number;
  observationCount: number;
  separationScore: number;
  classification: "strong" | "moderate" | "weak";
  interpretation: string[];
};

type LdaExplorerAnalysis = {
  discriminantScore: number;
  classification: "excellent" | "good" | "moderate" | "poor";
  dominantVariables: string[];
  interpretation: string[];
};

type CanonicalCorrelationExplorerAnalysis = {
  canonicalScore: number;
  classification: "very-strong" | "strong" | "moderate" | "weak";
  leadingVariables: string[];
  interpretation: string[];
};

type PcrExplorerAnalysis = {
  predictiveScore: number;
  classification: "excellent" | "good" | "moderate" | "poor";
  predictiveVariables: string[];
  interpretation: string[];
};

type ClusterNode = {
  name: string;
  distance: number;
  children?: ClusterNode[];
};

type HierarchicalClusteringAnalysis = {
  root: ClusterNode | null;
  seriesCount: number;
  interpretation: string;
};

type HierarchicalClusterState = {
  indices: number[];
  node: ClusterNode;
};

const getClusteringSeriesYValues = (
  series: ExperimentalSeries,
  length: number
): number[] => {
  const values: number[] = [];
  for (let index = 0; index < length; index += 1) {
    const value = series.points[index]?.y;
    if (!Number.isFinite(value)) return [];
    values.push(value);
  }
  return values;
};

const getClusteringPairwiseLength = (series: ExperimentalSeries[]) => {
  if (series.length === 0) return 0;
  return Math.min(...series.map((item) => item.points.length));
};

const canBuildHierarchicalClustering = (series: ExperimentalSeries[]) => {
  if (series.length < 2) return false;
  return series.every((item) => item.points.length >= 3);
};

const euclideanSeriesDistance = (
  leftValues: number[],
  rightValues: number[]
) => {
  const length = Math.min(leftValues.length, rightValues.length);
  if (length === 0) return Infinity;

  let sumSquares = 0;
  for (let index = 0; index < length; index += 1) {
    const delta = leftValues[index] - rightValues[index];
    sumSquares += delta * delta;
  }

  return Math.sqrt(sumSquares);
};

const buildClusteringDistanceMatrix = (series: ExperimentalSeries[]) => {
  const pairwiseLength = getClusteringPairwiseLength(series);
  const valuesBySeries = series.map((item) =>
    getClusteringSeriesYValues(item, pairwiseLength)
  );
  const size = series.length;
  const matrix = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => 0)
  );

  for (let rowIndex = 0; rowIndex < size; rowIndex += 1) {
    for (let columnIndex = rowIndex + 1; columnIndex < size; columnIndex += 1) {
      const distance = euclideanSeriesDistance(
        valuesBySeries[rowIndex],
        valuesBySeries[columnIndex]
      );
      matrix[rowIndex][columnIndex] = distance;
      matrix[columnIndex][rowIndex] = distance;
    }
  }

  return matrix;
};

const MDS_MIN_SERIES = 2;
const MDS_MIN_OBSERVATIONS = 3;

const isMDSInputValid = (series: ExperimentalSeries[]) =>
  series.length >= MDS_MIN_SERIES &&
  series.every(
    (item) => getSeriesYValues(item).length >= MDS_MIN_OBSERVATIONS
  );

const powerIterationEigenpair = (matrix: number[][], iterations = 200) => {
  const size = matrix.length;
  let vector = normalizeVector(
    Array.from({ length: size }, (_, index) => (index + 1) / size)
  );
  let eigenvalue = 0;

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const nextVector = multiplySymmetricMatrixVector(matrix, vector);
    eigenvalue = dotProduct(vector, nextVector);
    vector = normalizeVector(nextVector);
  }

  return { eigenvalue, eigenvector: vector };
};

const deflateSymmetricMatrix = (
  matrix: number[][],
  eigenvalue: number,
  eigenvector: number[]
) =>
  matrix.map((row, rowIndex) =>
    row.map(
      (value, columnIndex) =>
        value -
        eigenvalue * (eigenvector[rowIndex] ?? 0) * (eigenvector[columnIndex] ?? 0)
    )
  );

const buildDoubleCenteredMatrix = (distanceMatrix: number[][]) => {
  const size = distanceMatrix.length;
  const squaredDistances = distanceMatrix.map((row) =>
    row.map((distance) => distance * distance)
  );
  const rowMeans = squaredDistances.map(
    (row) => row.reduce((sum, value) => sum + value, 0) / size
  );
  const columnMeans = Array.from({ length: size }, (_, columnIndex) =>
    squaredDistances.reduce((sum, row) => sum + row[columnIndex]!, 0) / size
  );
  const grandMean =
    rowMeans.reduce((sum, value) => sum + value, 0) / Math.max(size, 1);

  return squaredDistances.map((row, rowIndex) =>
    row.map(
      (value, columnIndex) =>
        -0.5 *
        (value - rowMeans[rowIndex]! - columnMeans[columnIndex]! + grandMean)
    )
  );
};

const computeMDSStress = (
  originalDistances: number[][],
  points: MDSPoint[]
) => {
  const size = points.length;
  let sumSquaredDiff = 0;
  let sumSquaredOriginal = 0;

  for (let rowIndex = 0; rowIndex < size; rowIndex += 1) {
    for (let columnIndex = rowIndex + 1; columnIndex < size; columnIndex += 1) {
      const originalDistance = originalDistances[rowIndex]?.[columnIndex] ?? 0;
      const pointA = points[rowIndex];
      const pointB = points[columnIndex];
      if (!pointA || !pointB) continue;

      const deltaX = pointA.x - pointB.x;
      const deltaY = pointA.y - pointB.y;
      const mappedDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const diff = originalDistance - mappedDistance;
      sumSquaredDiff += diff * diff;
      sumSquaredOriginal += originalDistance * originalDistance;
    }
  }

  if (sumSquaredOriginal <= 0) return 0;
  return Math.sqrt(sumSquaredDiff / sumSquaredOriginal);
};

const getMDSStressClassification = (stress: number) => {
  if (stress < 0.05) return "Excelente";
  if (stress < 0.1) return "Muy bueno";
  if (stress < 0.2) return "Aceptable";
  return "Deficiente";
};

const hasMDSAcceptableStress = (analysis: MDSAnalysis | null) =>
  analysis !== null && analysis.stress < 0.1;

const hasMDSPoorStress = (analysis: MDSAnalysis | null) =>
  analysis !== null && analysis.stress >= 0.2;

const getMDSPairwiseDistances = (points: MDSPoint[]) => {
  const distances: number[] = [];
  for (let rowIndex = 0; rowIndex < points.length; rowIndex += 1) {
    for (let columnIndex = rowIndex + 1; columnIndex < points.length; columnIndex += 1) {
      const pointA = points[rowIndex];
      const pointB = points[columnIndex];
      if (!pointA || !pointB) continue;
      const deltaX = pointA.x - pointB.x;
      const deltaY = pointA.y - pointB.y;
      distances.push(Math.sqrt(deltaX * deltaX + deltaY * deltaY));
    }
  }
  return distances;
};

const buildMDSInterpretation = (
  points: MDSPoint[],
  stress: number
): string[] => {
  const interpretation: string[] = [];

  if (stress < 0.1) {
    interpretation.push(
      "El mapa MDS preserva adecuadamente las distancias originales."
    );
  }

  const pairwiseDistances = getMDSPairwiseDistances(points);
  if (pairwiseDistances.length > 0) {
    const maxDistance = Math.max(...pairwiseDistances);
    if (pairwiseDistances.some((distance) => distance < 0.25 * maxDistance)) {
      interpretation.push("Se observan grupos de variables similares.");
    }
    if (pairwiseDistances.some((distance) => distance > 0.75 * maxDistance)) {
      interpretation.push("Se observan variables claramente diferenciadas.");
    }
  }

  return deduplicateTextLines(interpretation);
};

const buildMDSAnalysis = (series: ExperimentalSeries[]): MDSAnalysis | null => {
  if (!isMDSInputValid(series) || !canBuildHierarchicalClustering(series)) {
    return null;
  }

  const distanceMatrix = buildClusteringDistanceMatrix(series);
  const centeredMatrix = buildDoubleCenteredMatrix(distanceMatrix);
  const firstEigenpair = powerIterationEigenpair(centeredMatrix);
  const deflatedMatrix = deflateSymmetricMatrix(
    centeredMatrix,
    firstEigenpair.eigenvalue,
    firstEigenpair.eigenvector
  );
  const secondEigenpair = powerIterationEigenpair(deflatedMatrix);

  const firstScale =
    firstEigenpair.eigenvalue > 0 ? Math.sqrt(firstEigenpair.eigenvalue) : 0;
  const secondScale =
    secondEigenpair.eigenvalue > 0 ? Math.sqrt(secondEigenpair.eigenvalue) : 0;

  const points: MDSPoint[] = series.map((item, index) => ({
    seriesName: item.name,
    x: (firstEigenpair.eigenvector[index] ?? 0) * firstScale,
    y: (secondEigenpair.eigenvector[index] ?? 0) * secondScale,
  }));

  const stress = computeMDSStress(distanceMatrix, points);

  return {
    points,
    stress,
    interpretation: buildMDSInterpretation(points, stress),
  };
};

const getMDSReportLines = (analysis: MDSAnalysis | null): string[] => {
  if (!analysis) {
    return ["No hay datos suficientes para generar MDS."];
  }

  const lines = [
    `Variables: ${analysis.points.map((point) => point.seriesName).join(", ")}.`,
    `Stress: ${analysis.stress.toFixed(3)}.`,
    `Clasificación: ${getMDSStressClassification(analysis.stress)}.`,
  ];

  analysis.interpretation.forEach((line) => lines.push(line));
  return deduplicateTextLines(lines);
};

type ScientificMDSPlotProps = {
  analysis: MDSAnalysis;
  seriesColors: Map<string, string>;
  chartTheme: ReturnType<typeof getChartTheme>;
};

function ScientificMDSPlot({
  analysis,
  seriesColors,
  chartTheme,
}: ScientificMDSPlotProps) {
  const chartData = analysis.points.map((point) => ({
    ...point,
    mds1: point.x,
    mds2: point.y,
    fill: seriesColors.get(point.seriesName) ?? "var(--app-accent)",
  }));

  return (
    <div className="h-[260px] mt-3">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 12, right: 24, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
          <XAxis
            type="number"
            dataKey="mds1"
            name="MDS1"
            tick={{ fill: chartTheme.axis, fontSize: 11 }}
          />
          <YAxis
            type="number"
            dataKey="mds2"
            name="MDS2"
            tick={{ fill: chartTheme.axis, fontSize: 11 }}
          />
          <Tooltip
            content={({ active, payload: tooltipPayload }) => {
              if (!active || !tooltipPayload?.length) return null;

              const point = tooltipPayload[0]?.payload as
                | (MDSPoint & { mds1: number; mds2: number })
                | undefined;
              if (!point) return null;

              return (
                <div
                  className="rounded-lg border px-3 py-2 text-sm shadow-sm"
                  style={{
                    borderColor: chartTheme.tooltipBorder,
                    backgroundColor: chartTheme.tooltipBg,
                    color: chartTheme.tooltipColor,
                  }}
                >
                  <p className="font-semibold">{point.seriesName}</p>
                  <p>MDS1 = {point.mds1.toFixed(4)}</p>
                  <p>MDS2 = {point.mds2.toFixed(4)}</p>
                </div>
              );
            }}
          />
          <Scatter
            name="Series"
            data={chartData}
            line={false}
            isAnimationActive={false}
            shape={(props) => {
              const { cx, cy, payload } = props as {
                cx?: number;
                cy?: number;
                payload?: MDSPoint & { fill?: string };
              };
              if (cx == null || cy == null || !payload) return null;

              return (
                <g>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={6}
                    fill={payload.fill ?? "var(--app-accent)"}
                  />
                  <text
                    x={cx + 8}
                    y={cy + 4}
                    fill="var(--app-text)"
                    fontSize={10}
                    fontWeight={600}
                  >
                    {payload.seriesName.length > 14
                      ? `${payload.seriesName.slice(0, 13)}…`
                      : payload.seriesName}
                  </text>
                </g>
              );
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

const DISTANCE_MATRIX_MIN_SERIES = 2;
const DISTANCE_MATRIX_MIN_OBSERVATIONS = 3;

const isDistanceMatrixInputValid = (series: ExperimentalSeries[]) =>
  series.length >= DISTANCE_MATRIX_MIN_SERIES &&
  series.every(
    (item) =>
      getSeriesYValues(item).length >= DISTANCE_MATRIX_MIN_OBSERVATIONS
  );

const getDistanceMatrixUniquePairs = (analysis: DistanceMatrixAnalysis) => {
  const pairs: DistanceMatrixCell[] = [];

  for (let rowIndex = 0; rowIndex < analysis.variables.length; rowIndex += 1) {
    for (
      let columnIndex = rowIndex + 1;
      columnIndex < analysis.variables.length;
      columnIndex += 1
    ) {
      pairs.push({
        row: analysis.variables[rowIndex]!,
        column: analysis.variables[columnIndex]!,
        distance: analysis.matrix[rowIndex]?.[columnIndex] ?? 0,
      });
    }
  }

  return pairs;
};

const hasDistanceMatrixHighHeterogeneity = (
  analysis: DistanceMatrixAnalysis | null
) =>
  analysis !== null &&
  analysis.maxDistance > analysis.averageDistance * 2;

const hasDistanceMatrixLimitedDiscrimination = (
  analysis: DistanceMatrixAnalysis | null
) => {
  if (!analysis || analysis.maxDistance <= 0) return false;
  return (
    (analysis.maxDistance - analysis.minDistance) / analysis.maxDistance < 0.1
  );
};

const interpolateDistanceMatrixColorChannel = (
  start: number,
  end: number,
  factor: number
) => Math.round(start + (end - start) * factor);

const getDistanceMatrixCellColors = (
  distance: number,
  minDistance: number,
  maxDistance: number,
  isDiagonal: boolean
) => {
  if (isDiagonal) {
    return {
      backgroundColor: "var(--app-surface-muted)",
      color: "var(--app-text)",
    };
  }

  if (maxDistance === minDistance) {
    return {
      backgroundColor: "#94a3b8",
      color: "#ffffff",
    };
  }

  const normalized =
    (distance - minDistance) / (maxDistance - minDistance);
  let red = 29;
  let green = 78;
  let blue = 216;

  if (normalized <= 0.5) {
    const factor = normalized * 2;
    red = interpolateDistanceMatrixColorChannel(29, 148, factor);
    green = interpolateDistanceMatrixColorChannel(78, 163, factor);
    blue = interpolateDistanceMatrixColorChannel(216, 184, factor);
  } else {
    const factor = (normalized - 0.5) * 2;
    red = interpolateDistanceMatrixColorChannel(148, 220, factor);
    green = interpolateDistanceMatrixColorChannel(163, 38, factor);
    blue = interpolateDistanceMatrixColorChannel(184, 38, factor);
  }

  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return {
    backgroundColor: `rgb(${red}, ${green}, ${blue})`,
    color: luminance > 0.55 ? "#0f172a" : "#ffffff",
  };
};

const buildDistanceMatrixInterpretation = (
  analysis: DistanceMatrixAnalysis
): string[] => {
  const interpretation: string[] = [];
  const pairs = getDistanceMatrixUniquePairs(analysis);
  const seenSimilarPairs = new Set<string>();
  const seenDifferentPairs = new Set<string>();

  pairs.forEach((pair) => {
    const pairKey = [pair.row, pair.column].sort().join("|");

    if (
      pair.distance <= analysis.minDistance * 1.25 &&
      !seenSimilarPairs.has(pairKey)
    ) {
      seenSimilarPairs.add(pairKey);
      interpretation.push(
        `Las variables ${pair.row} y ${pair.column} presentan el comportamiento más similar.`
      );
    }

    if (
      pair.distance >= analysis.maxDistance * 0.9 &&
      !seenDifferentPairs.has(pairKey)
    ) {
      seenDifferentPairs.add(pairKey);
      interpretation.push(
        `Las variables ${pair.row} y ${pair.column} presentan el comportamiento más diferente.`
      );
    }
  });

  if (analysis.maxDistance < analysis.averageDistance * 1.5) {
    interpretation.push("La estructura global es relativamente homogénea.");
  }

  if (analysis.maxDistance > analysis.averageDistance * 2) {
    interpretation.push("La estructura global muestra alta heterogeneidad.");
  }

  return deduplicateTextLines(interpretation);
};

const buildDistanceMatrixAnalysis = (
  series: ExperimentalSeries[]
): DistanceMatrixAnalysis | null => {
  if (!isDistanceMatrixInputValid(series) || !canBuildHierarchicalClustering(series)) {
    return null;
  }

  const matrix = buildClusteringDistanceMatrix(series);
  const variables = series.map((item) => item.name);
  const uniqueDistances = getDistanceMatrixUniquePairs({
    variables,
    matrix,
    minDistance: 0,
    maxDistance: 0,
    averageDistance: 0,
    interpretation: [],
  }).map((pair) => pair.distance);

  if (uniqueDistances.length === 0) return null;

  const minDistance = Math.min(...uniqueDistances);
  const maxDistance = Math.max(...uniqueDistances);
  const averageDistance =
    uniqueDistances.reduce((sum, distance) => sum + distance, 0) /
    uniqueDistances.length;

  const analysis: DistanceMatrixAnalysis = {
    variables,
    matrix,
    minDistance,
    maxDistance,
    averageDistance,
    interpretation: [],
  };

  analysis.interpretation = buildDistanceMatrixInterpretation(analysis);
  return analysis;
};

const getDistanceMatrixReportLines = (
  analysis: DistanceMatrixAnalysis | null
): string[] => {
  if (!analysis) {
    return ["No hay datos suficientes para generar Distance Matrix."];
  }

  const lines = [
    `Variables: ${analysis.variables.join(", ")}.`,
    `Mínima distancia: ${analysis.minDistance.toFixed(2)}.`,
    `Máxima distancia: ${analysis.maxDistance.toFixed(2)}.`,
    `Promedio: ${analysis.averageDistance.toFixed(2)}.`,
  ];

  analysis.interpretation.forEach((line) => lines.push(line));
  return deduplicateTextLines(lines);
};

type ScientificDistanceMatrixProps = {
  analysis: DistanceMatrixAnalysis;
};

function ScientificDistanceMatrix({ analysis }: ScientificDistanceMatrixProps) {
  return (
    <div className="w-full mt-3" style={{ maxHeight: 260 }}>
      <div className="overflow-auto max-h-[260px]">
        <div
          className="gap-0.5 min-w-max"
          style={{
            display: "grid",
            gridTemplateColumns: `minmax(6.5rem, auto) repeat(${analysis.variables.length}, minmax(3rem, 1fr))`,
          }}
        >
          <div className="px-2 py-1" />
          {analysis.variables.map((variable) => (
            <div
              key={`distance-matrix-col-${variable}`}
              className="px-1 py-1 text-center text-xs font-semibold text-[var(--app-heading)] truncate"
              title={variable}
            >
              {variable}
            </div>
          ))}

          {analysis.variables.map((rowVariable, rowIndex) => (
            <div key={`distance-matrix-row-${rowVariable}`} className="contents">
              <div
                className="px-2 py-1 text-xs font-semibold text-[var(--app-heading)] truncate"
                title={rowVariable}
              >
                {rowVariable}
              </div>
              {analysis.variables.map((columnVariable, columnIndex) => {
                const distance = analysis.matrix[rowIndex]?.[columnIndex] ?? 0;
                const isDiagonal = rowIndex === columnIndex;
                const colors = getDistanceMatrixCellColors(
                  distance,
                  analysis.minDistance,
                  analysis.maxDistance,
                  isDiagonal
                );

                return (
                  <div
                    key={`distance-matrix-cell-${rowVariable}-${columnVariable}`}
                    className="min-h-[2.25rem] flex items-center justify-center rounded-sm px-1 py-1 text-xs tabular-nums"
                    style={{
                      backgroundColor: colors.backgroundColor,
                      color: colors.color,
                    }}
                    title={`${rowVariable} × ${columnVariable}: ${distance.toFixed(2)}`}
                  >
                    {distance.toFixed(2)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const averageLinkageDistance = (
  leftIndices: number[],
  rightIndices: number[],
  distanceMatrix: number[][]
) => {
  let sum = 0;
  let count = 0;

  leftIndices.forEach((leftIndex) => {
    rightIndices.forEach((rightIndex) => {
      sum += distanceMatrix[leftIndex][rightIndex];
      count += 1;
    });
  });

  return count > 0 ? sum / count : Infinity;
};

const buildHierarchicalClusteringTree = (
  series: ExperimentalSeries[],
  distanceMatrix: number[][]
) => {
  const mergeDistances: number[] = [];
  let clusters: HierarchicalClusterState[] = series.map((item, index) => ({
    indices: [index],
    node: { name: item.name, distance: 0 },
  }));

  while (clusters.length > 1) {
    let bestLeft = 0;
    let bestRight = 1;
    let bestDistance = averageLinkageDistance(
      clusters[0].indices,
      clusters[1].indices,
      distanceMatrix
    );

    for (let leftIndex = 0; leftIndex < clusters.length; leftIndex += 1) {
      for (
        let rightIndex = leftIndex + 1;
        rightIndex < clusters.length;
        rightIndex += 1
      ) {
        const distance = averageLinkageDistance(
          clusters[leftIndex].indices,
          clusters[rightIndex].indices,
          distanceMatrix
        );

        if (distance < bestDistance) {
          bestDistance = distance;
          bestLeft = leftIndex;
          bestRight = rightIndex;
        }
      }
    }

    mergeDistances.push(bestDistance);

    const mergedCluster: HierarchicalClusterState = {
      indices: [
        ...clusters[bestLeft].indices,
        ...clusters[bestRight].indices,
      ],
      node: {
        name: "Cluster",
        distance: bestDistance,
        children: [clusters[bestLeft].node, clusters[bestRight].node],
      },
    };

    const remainingClusters = clusters.filter(
      (_, index) => index !== bestLeft && index !== bestRight
    );
    remainingClusters.push(mergedCluster);
    clusters = remainingClusters;
  }

  return {
    root: clusters[0]?.node ?? null,
    mergeDistances,
    finalDistance: mergeDistances[mergeDistances.length - 1] ?? 0,
  };
};

const getHierarchicalClusteringInterpretation = (
  seriesCount: number,
  mergeDistances: number[],
  finalDistance: number
) => {
  const messages: string[] = [];

  if (seriesCount === 2) {
    messages.push("Se compararon dos perfiles experimentales.");
  } else {
    messages.push(
      "Se identificaron grupos de series con comportamiento similar."
    );
  }

  const meanDistance =
    mergeDistances.length > 0
      ? mergeDistances.reduce((sum, distance) => sum + distance, 0) /
        mergeDistances.length
      : 0;

  if (
    mergeDistances.length > 0 &&
    meanDistance > 0 &&
    finalDistance > 2 * meanDistance
  ) {
    messages.push("Se observaron grupos claramente diferenciados.");
  }

  return messages.join(" ");
};

const getHierarchicalClusteringStructureDescription = (
  root: ClusterNode | null
): string => {
  if (!root) {
    return "No se pudo reconstruir la estructura del dendrograma.";
  }

  if (!root.children || root.children.length < 2) {
    return `Perfil analizado: "${root.name}".`;
  }

  const leafNames = getClusterLeavesInOrder(root).map((leaf) => leaf.name);
  return `Estructura observada: ${leafNames.join(" → ")} (fusión final a distancia ${formatExperimentalStat(root.distance)}).`;
};

const getClusterLeavesInOrder = (node: ClusterNode): ClusterNode[] => {
  if (!node.children || node.children.length === 0) return [node];
  return [
    ...getClusterLeavesInOrder(node.children[0]),
    ...getClusterLeavesInOrder(node.children[1]),
  ];
};

const reorderDistanceMatrixByVariables = (
  matrix: number[][],
  variables: string[],
  orderedVariables: string[]
): number[][] => {
  const indexByVariable = new Map(
    variables.map((variable, index) => [variable, index])
  );
  const orderedIndices = orderedVariables.map(
    (variable) => indexByVariable.get(variable) ?? -1
  );
  if (orderedIndices.some((index) => index < 0)) return [];

  return orderedIndices.map((rowIndex) =>
    orderedIndices.map((columnIndex) => matrix[rowIndex]?.[columnIndex] ?? 0)
  );
};

const getClusterHeatmapAdjacentDistances = (
  analysis: ClusterHeatmapAnalysis
): number[] => {
  const distances: number[] = [];
  for (
    let index = 0;
    index < analysis.orderedVariables.length - 1;
    index += 1
  ) {
    distances.push(analysis.matrix[index]?.[index + 1] ?? 0);
  }
  return distances;
};

const buildClusterHeatmapInterpretation = (
  analysis: ClusterHeatmapAnalysis,
  averageDistance: number,
  maxDistance: number
): string[] => {
  const interpretation: string[] = [];
  const adjacentDistances = getClusterHeatmapAdjacentDistances(analysis);
  const hasHomogeneousBlocks = adjacentDistances.some(
    (distance) => distance < averageDistance
  );

  if (hasHomogeneousBlocks) {
    interpretation.push(
      "Se observan bloques de variables altamente similares."
    );
  }

  if (maxDistance > averageDistance * 2) {
    interpretation.push("Se identifican grupos claramente diferenciados.");
  } else if (!hasHomogeneousBlocks) {
    interpretation.push("La transición entre variables es gradual.");
  }

  interpretation.push(
    "El patrón observado es coherente con la agrupación jerárquica."
  );

  return deduplicateTextLines(interpretation);
};

const hasClusterHeatmapHomogeneousBlocks = (
  analysis: ClusterHeatmapAnalysis | null,
  averageDistance: number
) => {
  if (!analysis) return false;
  return getClusterHeatmapAdjacentDistances(analysis).some(
    (distance) => distance < averageDistance
  );
};

const hasClusterHeatmapClearSeparation = (
  distanceMatrixAnalysis: DistanceMatrixAnalysis | null
) =>
  distanceMatrixAnalysis !== null &&
  distanceMatrixAnalysis.maxDistance >
    distanceMatrixAnalysis.averageDistance * 2;

const hasClusterHeatmapLimitedSeparation = (
  distanceMatrixAnalysis: DistanceMatrixAnalysis | null
) =>
  distanceMatrixAnalysis !== null &&
  distanceMatrixAnalysis.maxDistance <
    distanceMatrixAnalysis.averageDistance * 1.2;

const buildClusterHeatmapAnalysis = (
  distanceMatrixAnalysis: DistanceMatrixAnalysis | null,
  hierarchicalClusteringAnalysis: HierarchicalClusteringAnalysis | null
): ClusterHeatmapAnalysis | null => {
  if (!distanceMatrixAnalysis || !hierarchicalClusteringAnalysis?.root) {
    return null;
  }

  const orderedVariables = getClusterLeavesInOrder(
    hierarchicalClusteringAnalysis.root
  ).map((leaf) => leaf.name);

  if (orderedVariables.length < 2) return null;

  const matrix = reorderDistanceMatrixByVariables(
    distanceMatrixAnalysis.matrix,
    distanceMatrixAnalysis.variables,
    orderedVariables
  );
  if (matrix.length === 0) return null;

  const analysis: ClusterHeatmapAnalysis = {
    variables: distanceMatrixAnalysis.variables,
    orderedVariables,
    matrix,
    interpretation: [],
  };

  analysis.interpretation = buildClusterHeatmapInterpretation(
    analysis,
    distanceMatrixAnalysis.averageDistance,
    distanceMatrixAnalysis.maxDistance
  );

  return analysis;
};

const getClusterHeatmapReportLines = (
  analysis: ClusterHeatmapAnalysis | null
): string[] => {
  if (!analysis) {
    return ["No hay datos suficientes para generar Cluster Heatmap."];
  }

  const lines = [
    `Variables: ${analysis.variables.join(", ")}.`,
    `Orden: ${analysis.orderedVariables.join(" → ")}.`,
  ];

  analysis.interpretation.forEach((line) => lines.push(line));
  return deduplicateTextLines(lines);
};

const getReorderedMatrixDistanceStats = (matrix: number[][]) => {
  const distances: number[] = [];
  for (let rowIndex = 0; rowIndex < matrix.length; rowIndex += 1) {
    for (
      let columnIndex = rowIndex + 1;
      columnIndex < matrix.length;
      columnIndex += 1
    ) {
      distances.push(matrix[rowIndex]?.[columnIndex] ?? 0);
    }
  }

  if (distances.length === 0) {
    return { minDistance: 0, maxDistance: 0, averageDistance: 0 };
  }

  const sum = distances.reduce((total, distance) => total + distance, 0);
  return {
    minDistance: Math.min(...distances),
    maxDistance: Math.max(...distances),
    averageDistance: sum / distances.length,
  };
};

const getClusteredDistanceHeatmapAdjacentDistances = (
  analysis: ClusteredDistanceHeatmapAnalysis
): number[] => {
  const distances: number[] = [];
  for (
    let index = 0;
    index < analysis.orderedVariables.length - 1;
    index += 1
  ) {
    distances.push(analysis.matrix[index]?.[index + 1] ?? 0);
  }
  return distances;
};

const buildClusteredDistanceHeatmapInterpretation = (
  analysis: ClusteredDistanceHeatmapAnalysis
): string[] => {
  const interpretation: string[] = [];
  const adjacentDistances = getClusteredDistanceHeatmapAdjacentDistances(analysis);
  const hasCompactBlocks = adjacentDistances.some(
    (distance) => distance < analysis.averageDistance
  );

  if (hasCompactBlocks) {
    interpretation.push(
      "Se observan bloques compactos de variables similares."
    );
  }

  if (analysis.maxDistance > analysis.averageDistance * 2) {
    interpretation.push("Los grupos presentan una separación marcada.");
  } else if (analysis.maxDistance > analysis.averageDistance * 1.5) {
    interpretation.push("Los grupos presentan una diferenciación moderada.");
  }

  interpretation.push(
    "La estructura observada es coherente con el clustering jerárquico."
  );

  return deduplicateTextLines(interpretation);
};

const hasClusteredDistanceHeatmapCompactBlocks = (
  analysis: ClusteredDistanceHeatmapAnalysis | null
) => {
  if (!analysis) return false;
  return getClusteredDistanceHeatmapAdjacentDistances(analysis).some(
    (distance) => distance < analysis.averageDistance
  );
};

const hasClusteredDistanceHeatmapStrongSeparation = (
  analysis: ClusteredDistanceHeatmapAnalysis | null
) =>
  analysis !== null &&
  analysis.maxDistance > analysis.averageDistance * 2;

const hasClusteredDistanceHeatmapLimitedSeparation = (
  analysis: ClusteredDistanceHeatmapAnalysis | null
) =>
  analysis !== null &&
  analysis.maxDistance < analysis.averageDistance * 1.2;

const buildClusteredDistanceHeatmapAnalysis = (
  clusterHeatmapAnalysis: ClusterHeatmapAnalysis | null,
  hierarchicalClusteringAnalysis: HierarchicalClusteringAnalysis | null,
  distanceMatrixAnalysis: DistanceMatrixAnalysis | null
): ClusteredDistanceHeatmapAnalysis | null => {
  if (
    !clusterHeatmapAnalysis ||
    !hierarchicalClusteringAnalysis ||
    !distanceMatrixAnalysis
  ) {
    return null;
  }

  const { averageDistance, maxDistance } = getReorderedMatrixDistanceStats(
    clusterHeatmapAnalysis.matrix
  );

  const analysis: ClusteredDistanceHeatmapAnalysis = {
    orderedVariables: clusterHeatmapAnalysis.orderedVariables,
    matrix: clusterHeatmapAnalysis.matrix,
    averageDistance,
    maxDistance,
    interpretation: [],
  };

  analysis.interpretation = buildClusteredDistanceHeatmapInterpretation(analysis);
  return analysis;
};

const getClusteredDistanceHeatmapReportLines = (
  analysis: ClusteredDistanceHeatmapAnalysis | null
): string[] => {
  if (!analysis) {
    return [
      "No hay datos suficientes para generar Clustered Distance Heatmap.",
    ];
  }

  const lines = [
    `Variables: ${analysis.orderedVariables.join(", ")}.`,
    `Orden: ${analysis.orderedVariables.join(" → ")}.`,
    `Distancia media: ${analysis.averageDistance.toFixed(2)}.`,
    `Distancia máxima: ${analysis.maxDistance.toFixed(2)}.`,
  ];

  analysis.interpretation.forEach((line) => lines.push(line));
  return deduplicateTextLines(lines);
};

const canBuildMultivariateDashboard = (
  pcaAnalysis: PCAAnalysis | null,
  hierarchicalClusteringAnalysis: HierarchicalClusteringAnalysis | null,
  mdsAnalysis: MDSAnalysis | null,
  variableImportanceAnalysis: VariableImportanceAnalysis | null,
  similarityNetworkAnalysis: SimilarityNetworkAnalysis | null
) =>
  pcaAnalysis !== null ||
  hierarchicalClusteringAnalysis !== null ||
  mdsAnalysis !== null ||
  variableImportanceAnalysis !== null ||
  similarityNetworkAnalysis !== null;

const getHierarchicalClusterLeafCount = (
  analysis: HierarchicalClusteringAnalysis | null
) => {
  if (!analysis?.root) return undefined;
  return getClusterLeavesInOrder(analysis.root).length;
};

const buildMultivariateDashboardDiagnosis = (input: {
  pcaAnalysis: PCAAnalysis | null;
  distanceMatrixAnalysis: DistanceMatrixAnalysis | null;
  mdsAnalysis: MDSAnalysis | null;
  averageSimilarity?: number;
  topVariable?: string;
  topVariableScore?: number;
}): string[] => {
  const diagnosis: string[] = [];

  if (input.pcaAnalysis && input.pcaAnalysis.cumulativeVariance >= 80) {
    diagnosis.push(
      "La estructura multivariante se encuentra bien explicada por los primeros componentes principales."
    );
  }

  if (input.pcaAnalysis && input.pcaAnalysis.cumulativeVariance < 60) {
    diagnosis.push(
      "La estructura multivariante requiere múltiples dimensiones para su explicación."
    );
  }

  if (
    input.distanceMatrixAnalysis &&
    input.distanceMatrixAnalysis.maxDistance >
      input.distanceMatrixAnalysis.averageDistance * 2
  ) {
    diagnosis.push("Se observan grupos claramente diferenciados.");
  }

  if (
    input.averageSimilarity !== undefined &&
    input.averageSimilarity >= 0.75
  ) {
    diagnosis.push("Las variables presentan una elevada coherencia interna.");
  }

  if (input.mdsAnalysis && input.mdsAnalysis.stress < 0.1) {
    diagnosis.push(
      "La representación MDS preserva adecuadamente las relaciones observadas."
    );
  }

  if (
    input.topVariable &&
    input.topVariableScore !== undefined &&
    input.topVariableScore >= 80
  ) {
    diagnosis.push(
      `La variable ${input.topVariable} domina la estructura informativa del conjunto.`
    );
  }

  return deduplicateTextLines(diagnosis);
};

const hasMultivariateDashboardStrongPca = (analysis: PCAAnalysis | null) =>
  analysis !== null && analysis.cumulativeVariance >= 80;

const hasMultivariateDashboardWeakPca = (analysis: PCAAnalysis | null) =>
  analysis !== null && analysis.cumulativeVariance < 60;

const hasMultivariateDashboardHighComplexity = (
  pcaAnalysis: PCAAnalysis | null,
  mdsAnalysis: MDSAnalysis | null
) =>
  hasMultivariateDashboardWeakPca(pcaAnalysis) &&
  mdsAnalysis !== null &&
  mdsAnalysis.stress > 0.2;

const buildMultivariateDashboardAnalysis = (input: {
  pcaAnalysis: PCAAnalysis | null;
  hierarchicalClusteringAnalysis: HierarchicalClusteringAnalysis | null;
  mdsAnalysis: MDSAnalysis | null;
  variableImportanceAnalysis: VariableImportanceAnalysis | null;
  similarityNetworkAnalysis: SimilarityNetworkAnalysis | null;
  distanceMatrixAnalysis: DistanceMatrixAnalysis | null;
}): MultivariateDashboardAnalysis | null => {
  if (
    !canBuildMultivariateDashboard(
      input.pcaAnalysis,
      input.hierarchicalClusteringAnalysis,
      input.mdsAnalysis,
      input.variableImportanceAnalysis,
      input.similarityNetworkAnalysis
    )
  ) {
    return null;
  }

  const topEntry = input.variableImportanceAnalysis?.entries[0];
  const summaryCards: MultivariateDashboardAnalysis["summaryCards"] = {};

  if (input.pcaAnalysis) {
    summaryCards.pcaVariance = input.pcaAnalysis.cumulativeVariance;
  }

  const clusterCount = getHierarchicalClusterLeafCount(
    input.hierarchicalClusteringAnalysis
  );
  if (clusterCount !== undefined) {
    summaryCards.clusterCount = clusterCount;
  }

  if (input.mdsAnalysis) {
    summaryCards.mdsStress = input.mdsAnalysis.stress;
  }

  if (topEntry) {
    summaryCards.topVariable = topEntry.variable;
    summaryCards.topVariableScore = topEntry.normalizedScore;
  }

  if (input.similarityNetworkAnalysis) {
    summaryCards.averageSimilarity =
      input.similarityNetworkAnalysis.averageSimilarity;
  }

  const diagnosis = buildMultivariateDashboardDiagnosis({
    pcaAnalysis: input.pcaAnalysis,
    distanceMatrixAnalysis: input.distanceMatrixAnalysis,
    mdsAnalysis: input.mdsAnalysis,
    averageSimilarity: summaryCards.averageSimilarity,
    topVariable: summaryCards.topVariable,
    topVariableScore: summaryCards.topVariableScore,
  });

  return { summaryCards, diagnosis };
};

const getMultivariateDashboardReportLines = (
  analysis: MultivariateDashboardAnalysis | null
): string[] => {
  if (!analysis) {
    return [
      "No hay datos suficientes para generar Multivariate Dashboard.",
    ];
  }

  const lines: string[] = [];
  const { summaryCards } = analysis;

  if (summaryCards.pcaVariance !== undefined) {
    lines.push(
      `PCA: ${formatPCAVariancePercent(summaryCards.pcaVariance)} varianza acumulada.`
    );
  }

  if (summaryCards.clusterCount !== undefined) {
    lines.push(`Clustering: ${summaryCards.clusterCount} grupos.`);
  }

  if (summaryCards.mdsStress !== undefined) {
    lines.push(`MDS: stress ${summaryCards.mdsStress.toFixed(2)}.`);
  }

  if (summaryCards.topVariable !== undefined) {
    lines.push(
      `Variable líder: ${summaryCards.topVariable}${
        summaryCards.topVariableScore !== undefined
          ? ` — ${summaryCards.topVariableScore.toFixed(0)}%`
          : ""
      }.`
    );
  }

  if (summaryCards.averageSimilarity !== undefined) {
    lines.push(
      `Similaridad: ${summaryCards.averageSimilarity.toFixed(2)}.`
    );
  }

  if (analysis.diagnosis.length > 0) {
    lines.push("Diagnóstico global:");
    analysis.diagnosis.forEach((line) => lines.push(line));
  }

  return deduplicateTextLines(lines);
};

type ScientificMultivariateDashboardProps = {
  analysis: MultivariateDashboardAnalysis;
};

function ScientificMultivariateDashboard({
  analysis,
}: ScientificMultivariateDashboardProps) {
  const { summaryCards, diagnosis } = analysis;
  const cards: {
    key: string;
    icon: string;
    title: string;
    value: string;
    subtitle: string;
  }[] = [];

  if (summaryCards.pcaVariance !== undefined) {
    cards.push({
      key: "pca",
      icon: "🧭",
      title: "PCA",
      value: `${summaryCards.pcaVariance.toFixed(0)}%`,
      subtitle: "Varianza acumulada",
    });
  }

  if (summaryCards.clusterCount !== undefined) {
    cards.push({
      key: "clustering",
      icon: "🌳",
      title: "Clustering",
      value: `${summaryCards.clusterCount} grupos`,
      subtitle: "Estructura jerárquica",
    });
  }

  if (summaryCards.mdsStress !== undefined) {
    cards.push({
      key: "mds",
      icon: "📍",
      title: "MDS",
      value: summaryCards.mdsStress.toFixed(2),
      subtitle: "Stress",
    });
  }

  if (
    summaryCards.topVariable !== undefined &&
    summaryCards.topVariableScore !== undefined
  ) {
    cards.push({
      key: "top-variable",
      icon: "🏆",
      title: "Variable líder",
      value: summaryCards.topVariable,
      subtitle: `${summaryCards.topVariableScore.toFixed(0)}%`,
    });
  }

  if (summaryCards.averageSimilarity !== undefined) {
    cards.push({
      key: "similarity",
      icon: "🔗",
      title: "Similaridad",
      value: summaryCards.averageSimilarity.toFixed(2),
      subtitle: "Promedio de red",
    });
  }

  return (
    <div className="w-full mt-3">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map((card) => (
          <div
            key={card.key}
            className={`${contentPanel} flex flex-col gap-1 min-h-[5.5rem]`}
          >
            <p className="text-xs font-semibold text-[var(--app-text-muted)]">
              {card.icon} {card.title}
            </p>
            <p className="text-lg font-semibold text-[var(--app-heading)] tabular-nums">
              {card.value}
            </p>
            {card.subtitle ? (
              <p className="text-xs text-[var(--app-text-muted)]">
                {card.subtitle}
              </p>
            ) : null}
          </div>
        ))}
      </div>
      {diagnosis.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-[var(--app-heading)]">
            Diagnóstico
          </p>
          <ul className="mt-2 space-y-1">
            {diagnosis.map((line, index) => (
              <li
                key={`multivariate-dashboard-diagnosis-${index}`}
                className={`text-sm ${emptyState}`}
              >
                • {line}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const getManovaExplorerClassificationLabel = (
  classification: ManovaExplorerAnalysis["classification"]
) => {
  if (classification === "strong") return "Fuerte";
  if (classification === "moderate") return "Moderada";
  return "Débil";
};

const classifyManovaExplorerSeparation = (
  separationScore: number
): ManovaExplorerAnalysis["classification"] => {
  if (separationScore >= 0.75) return "strong";
  if (separationScore >= 0.5) return "moderate";
  return "weak";
};

const getManovaExplorerClassificationText = (
  classification: ManovaExplorerAnalysis["classification"]
) => {
  if (classification === "strong") {
    return "Los grupos presentan una separación multivariante fuerte.";
  }
  if (classification === "moderate") {
    return "Se observa una diferenciación multivariante moderada.";
  }
  return "La separación multivariante observada es limitada.";
};

const hasManovaExplorerStrongSeparation = (
  analysis: ManovaExplorerAnalysis | null
) => analysis !== null && analysis.separationScore >= 0.75;

const hasManovaExplorerLimitedSeparation = (
  analysis: ManovaExplorerAnalysis | null
) => analysis !== null && analysis.separationScore < 0.5;

const buildManovaExplorerInterpretation = (input: {
  classification: ManovaExplorerAnalysis["classification"];
  pcaAnalysis: PCAAnalysis;
  hierarchicalClusteringAnalysis: HierarchicalClusteringAnalysis | null;
  similarityNetworkAnalysis: SimilarityNetworkAnalysis | null;
}): string[] => {
  const interpretation: string[] = [
    getManovaExplorerClassificationText(input.classification),
  ];

  if (input.pcaAnalysis.cumulativeVariance >= 80) {
    interpretation.push(
      "La separación observada se encuentra bien representada por PCA."
    );
  }

  if (input.hierarchicalClusteringAnalysis) {
    interpretation.push(
      "La estructura detectada es consistente con el clustering jerárquico."
    );
  }

  if (
    input.similarityNetworkAnalysis &&
    input.similarityNetworkAnalysis.averageSimilarity >= 0.75
  ) {
    interpretation.push("Las variables presentan alta coherencia interna.");
  }

  return deduplicateTextLines(interpretation);
};

const buildManovaExplorerAnalysis = (input: {
  series: ExperimentalSeries[];
  pcaAnalysis: PCAAnalysis | null;
  distanceMatrixAnalysis: DistanceMatrixAnalysis | null;
  hierarchicalClusteringAnalysis: HierarchicalClusteringAnalysis | null;
  similarityNetworkAnalysis: SimilarityNetworkAnalysis | null;
  observationCount: number;
}): ManovaExplorerAnalysis | null => {
  if (input.series.length < 2 || !input.pcaAnalysis) {
    return null;
  }

  const normalizedPCA = input.pcaAnalysis.cumulativeVariance / 100;
  let normalizedDistanceRatio = 0;

  if (
    input.distanceMatrixAnalysis &&
    input.distanceMatrixAnalysis.averageDistance > 0
  ) {
    const distanceRatio =
      input.distanceMatrixAnalysis.maxDistance /
      input.distanceMatrixAnalysis.averageDistance;
    normalizedDistanceRatio = Math.min(distanceRatio / 3, 1);
  }

  const separationScore = (normalizedPCA + normalizedDistanceRatio) / 2;
  const classification = classifyManovaExplorerSeparation(separationScore);
  const groupCount =
    input.hierarchicalClusteringAnalysis?.seriesCount ?? input.series.length;
  const variableCount = input.series.length;
  const observationCount =
    input.observationCount > 0
      ? input.observationCount
      : input.series.reduce(
          (sum, item) => sum + getSeriesYValues(item).length,
          0
        );

  return {
    groupCount,
    variableCount,
    observationCount,
    separationScore,
    classification,
    interpretation: buildManovaExplorerInterpretation({
      classification,
      pcaAnalysis: input.pcaAnalysis,
      hierarchicalClusteringAnalysis: input.hierarchicalClusteringAnalysis,
      similarityNetworkAnalysis: input.similarityNetworkAnalysis,
    }),
  };
};

const getManovaExplorerReportLines = (
  analysis: ManovaExplorerAnalysis | null
): string[] => {
  if (!analysis) {
    return ["No hay datos suficientes para generar MANOVA Explorer."];
  }

  const lines = [
    `Variables: ${analysis.variableCount}.`,
    `Observaciones: ${analysis.observationCount}.`,
    `Grupos: ${analysis.groupCount}.`,
    `Separation Score: ${analysis.separationScore.toFixed(2)}.`,
    `Clasificación: ${getManovaExplorerClassificationLabel(analysis.classification)}.`,
  ];

  analysis.interpretation.forEach((line) => lines.push(line));
  return deduplicateTextLines(lines);
};

type ScientificManovaExplorerProps = {
  analysis: ManovaExplorerAnalysis;
};

function ScientificManovaExplorer({ analysis }: ScientificManovaExplorerProps) {
  const cards = [
    {
      key: "separation",
      icon: "🎯",
      title: "Separation Score",
      value: analysis.separationScore.toFixed(2),
      subtitle: "Separación multivariante",
    },
    {
      key: "classification",
      icon: "📊",
      title: "Clasificación",
      value: getManovaExplorerClassificationLabel(analysis.classification),
      subtitle: "Nivel de diferenciación",
    },
    {
      key: "variables",
      icon: "📈",
      title: "Variables",
      value: `${analysis.variableCount}`,
      subtitle: "Dimensiones analizadas",
    },
    {
      key: "observations",
      icon: "🔬",
      title: "Observaciones",
      value: `${analysis.observationCount}`,
      subtitle: "Datos considerados",
    },
  ];

  return (
    <div className="w-full mt-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => (
          <div
            key={card.key}
            className={`${contentPanel} flex flex-col gap-1 min-h-[5.5rem]`}
          >
            <p className="text-xs font-semibold text-[var(--app-text-muted)]">
              {card.icon} {card.title}
            </p>
            <p className="text-lg font-semibold text-[var(--app-heading)] tabular-nums">
              {card.value}
            </p>
            {card.subtitle ? (
              <p className="text-xs text-[var(--app-text-muted)]">
                {card.subtitle}
              </p>
            ) : null}
          </div>
        ))}
      </div>
      {analysis.interpretation.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-[var(--app-heading)]">
            Interpretación
          </p>
          <ul className="mt-2 space-y-1">
            {analysis.interpretation.map((line, index) => (
              <li
                key={`manova-explorer-interpretation-${index}`}
                className={`text-sm ${emptyState}`}
              >
                • {line}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const formatLdaDominantVariablesList = (variables: string[]) => {
  if (variables.length === 0) return "";
  if (variables.length === 1) return variables[0]!;
  if (variables.length === 2) {
    return `${variables[0]} y ${variables[1]}`;
  }
  return `${variables.slice(0, -1).join(", ")} y ${variables[variables.length - 1]}`;
};

const getLdaExplorerClassificationLabel = (
  classification: LdaExplorerAnalysis["classification"]
) => {
  if (classification === "excellent") return "Excellent";
  if (classification === "good") return "Good";
  if (classification === "moderate") return "Moderate";
  return "Poor";
};

const classifyLdaExplorerDiscrimination = (
  discriminantScore: number
): LdaExplorerAnalysis["classification"] => {
  if (discriminantScore >= 85) return "excellent";
  if (discriminantScore >= 70) return "good";
  if (discriminantScore >= 50) return "moderate";
  return "poor";
};

const getLdaExplorerClassificationText = (
  classification: LdaExplorerAnalysis["classification"]
) => {
  if (classification === "excellent") {
    return "Separación multivariante excelente.";
  }
  if (classification === "good") {
    return "Separación multivariante buena.";
  }
  if (classification === "moderate") {
    return "Separación multivariante moderada.";
  }
  return "Separación multivariante limitada.";
};

const hasLdaExplorerExcellentDiscrimination = (
  analysis: LdaExplorerAnalysis | null
) => analysis !== null && analysis.discriminantScore >= 85;

const hasLdaExplorerPoorDiscrimination = (
  analysis: LdaExplorerAnalysis | null
) => analysis !== null && analysis.classification === "poor";

const getLdaExplorerDominantVariables = (
  variableImportanceAnalysis: VariableImportanceAnalysis
) =>
  variableImportanceAnalysis.entries
    .filter((entry) => entry.normalizedScore >= 75)
    .map((entry) => entry.variable);

const buildLdaExplorerInterpretation = (input: {
  classification: LdaExplorerAnalysis["classification"];
  dominantVariables: string[];
  pcaAnalysis: PCAAnalysis;
  manovaExplorerAnalysis: ManovaExplorerAnalysis | null;
  hierarchicalClusteringAnalysis: HierarchicalClusteringAnalysis | null;
}): string[] => {
  const interpretation: string[] = [
    getLdaExplorerClassificationText(input.classification),
  ];

  if (input.pcaAnalysis.cumulativeVariance >= 80) {
    interpretation.push(
      "Los componentes principales explican adecuadamente la separación observada."
    );
  }

  if (
    input.manovaExplorerAnalysis &&
    input.manovaExplorerAnalysis.separationScore >= 0.75
  ) {
    interpretation.push(
      "La separación observada coincide con el análisis MANOVA Explorer."
    );
  }

  if (input.dominantVariables.length > 0) {
    interpretation.push(
      `Las variables ${formatLdaDominantVariablesList(input.dominantVariables)} contribuyen principalmente a la discriminación entre grupos.`
    );
  }

  if (input.hierarchicalClusteringAnalysis) {
    interpretation.push(
      "La estructura discriminante es consistente con el clustering jerárquico."
    );
  }

  return deduplicateTextLines(interpretation);
};

const buildLdaExplorerAnalysis = (input: {
  pcaAnalysis: PCAAnalysis | null;
  manovaExplorerAnalysis: ManovaExplorerAnalysis | null;
  variableImportanceAnalysis: VariableImportanceAnalysis | null;
  hierarchicalClusteringAnalysis: HierarchicalClusteringAnalysis | null;
}): LdaExplorerAnalysis | null => {
  if (!input.pcaAnalysis || !input.variableImportanceAnalysis) {
    return null;
  }

  const manovaScore = input.manovaExplorerAnalysis?.separationScore ?? 0.5;
  const discriminantScore =
    (input.pcaAnalysis.cumulativeVariance + manovaScore * 100) / 2;
  const classification = classifyLdaExplorerDiscrimination(discriminantScore);
  const dominantVariables = getLdaExplorerDominantVariables(
    input.variableImportanceAnalysis
  );

  return {
    discriminantScore,
    classification,
    dominantVariables,
    interpretation: buildLdaExplorerInterpretation({
      classification,
      dominantVariables,
      pcaAnalysis: input.pcaAnalysis,
      manovaExplorerAnalysis: input.manovaExplorerAnalysis,
      hierarchicalClusteringAnalysis: input.hierarchicalClusteringAnalysis,
    }),
  };
};

const getLdaExplorerReportLines = (
  analysis: LdaExplorerAnalysis | null
): string[] => {
  if (!analysis) {
    return ["No hay datos suficientes para generar LDA Explorer."];
  }

  const lines = [
    `Discriminant Score: ${analysis.discriminantScore.toFixed(1)}.`,
    `Clasificación: ${getLdaExplorerClassificationLabel(analysis.classification)}.`,
    `Variables dominantes: ${
      analysis.dominantVariables.length > 0
        ? analysis.dominantVariables.join(", ")
        : "Ninguna."
    }.`,
  ];

  analysis.interpretation.forEach((line) => lines.push(line));
  return deduplicateTextLines(lines);
};

type ScientificLdaExplorerProps = {
  analysis: LdaExplorerAnalysis;
  pcaVariance: number;
};

function ScientificLdaExplorer({
  analysis,
  pcaVariance,
}: ScientificLdaExplorerProps) {
  const cards = [
    {
      key: "score",
      icon: "🎯",
      title: "Discriminant Score",
      value: analysis.discriminantScore.toFixed(1),
      subtitle: "Índice de discriminación",
    },
    {
      key: "classification",
      icon: "📊",
      title: "Calidad",
      value: getLdaExplorerClassificationLabel(analysis.classification),
      subtitle: "Separación multivariante",
    },
    {
      key: "dominant-variables",
      icon: "🏆",
      title: "Variables clave",
      value:
        analysis.dominantVariables.length > 0
          ? analysis.dominantVariables.join(", ")
          : "—",
      subtitle: "Contribución discriminante",
    },
    {
      key: "pca",
      icon: "🧭",
      title: "PCA",
      value: `${pcaVariance.toFixed(0)}%`,
      subtitle: "Varianza acumulada",
    },
  ];

  return (
    <div className="w-full mt-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => (
          <div
            key={card.key}
            className={`${contentPanel} flex flex-col gap-1 min-h-[5.5rem]`}
          >
            <p className="text-xs font-semibold text-[var(--app-text-muted)]">
              {card.icon} {card.title}
            </p>
            <p className="text-lg font-semibold text-[var(--app-heading)] tabular-nums break-words">
              {card.value}
            </p>
            {card.subtitle ? (
              <p className="text-xs text-[var(--app-text-muted)]">
                {card.subtitle}
              </p>
            ) : null}
          </div>
        ))}
      </div>
      {analysis.interpretation.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-[var(--app-heading)]">
            Interpretación
          </p>
          <ul className="mt-2 space-y-1">
            {analysis.interpretation.map((line, index) => (
              <li
                key={`lda-explorer-interpretation-${index}`}
                className={`text-sm ${emptyState}`}
              >
                • {line}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const getCanonicalCorrelationLeadingVariables = (
  variableImportanceAnalysis: VariableImportanceAnalysis
) =>
  variableImportanceAnalysis.entries
    .filter((entry) => entry.normalizedScore >= 70)
    .map((entry) => entry.variable);

const getCanonicalCorrelationExplorerClassificationLabel = (
  classification: CanonicalCorrelationExplorerAnalysis["classification"]
) => {
  if (classification === "very-strong") return "Very Strong";
  if (classification === "strong") return "Strong";
  if (classification === "moderate") return "Moderate";
  return "Weak";
};

const classifyCanonicalCorrelationExplorer = (
  canonicalScore: number
): CanonicalCorrelationExplorerAnalysis["classification"] => {
  if (canonicalScore >= 85) return "very-strong";
  if (canonicalScore >= 70) return "strong";
  if (canonicalScore >= 50) return "moderate";
  return "weak";
};

const getCanonicalCorrelationExplorerClassificationText = (
  classification: CanonicalCorrelationExplorerAnalysis["classification"]
) => {
  if (classification === "very-strong") {
    return "Las relaciones multivariantes son muy fuertes.";
  }
  if (classification === "strong") {
    return "Las relaciones multivariantes son fuertes.";
  }
  if (classification === "moderate") {
    return "Las relaciones multivariantes son moderadas.";
  }
  return "Las relaciones multivariantes son limitadas.";
};

const hasCanonicalCorrelationExplorerVeryStrong = (
  analysis: CanonicalCorrelationExplorerAnalysis | null
) => analysis !== null && analysis.canonicalScore >= 85;

const hasCanonicalCorrelationExplorerWeak = (
  analysis: CanonicalCorrelationExplorerAnalysis | null
) => analysis !== null && analysis.classification === "weak";

const buildCanonicalCorrelationExplorerInterpretation = (input: {
  classification: CanonicalCorrelationExplorerAnalysis["classification"];
  leadingVariables: string[];
  correlationDensity: number;
  averageSimilarity: number;
  manovaExplorerAnalysis: ManovaExplorerAnalysis | null;
  ldaExplorerAnalysis: LdaExplorerAnalysis | null;
}): string[] => {
  const interpretation: string[] = [
    getCanonicalCorrelationExplorerClassificationText(input.classification),
  ];

  if (input.correlationDensity >= 0.6) {
    interpretation.push(
      "La red de correlaciones presenta una conectividad elevada."
    );
  }

  if (input.averageSimilarity >= 0.75) {
    interpretation.push(
      "Las variables muestran una estructura de similitud consistente."
    );
  }

  if (input.leadingVariables.length > 0) {
    interpretation.push(
      `Las variables ${formatLdaDominantVariablesList(input.leadingVariables)} lideran las relaciones multivariantes observadas.`
    );
  }

  if (
    input.manovaExplorerAnalysis &&
    input.manovaExplorerAnalysis.separationScore >= 0.75
  ) {
    interpretation.push(
      "La estructura relacional coincide con la separación observada en MANOVA Explorer."
    );
  }

  if (
    input.ldaExplorerAnalysis &&
    input.ldaExplorerAnalysis.discriminantScore >= 85
  ) {
    interpretation.push(
      "Las relaciones observadas son consistentes con la capacidad discriminante detectada por LDA Explorer."
    );
  }

  return deduplicateTextLines(interpretation);
};

const buildCanonicalCorrelationExplorerAnalysis = (input: {
  correlationNetworkAnalysis: CorrelationNetworkAnalysis | null;
  similarityNetworkAnalysis: SimilarityNetworkAnalysis | null;
  variableImportanceAnalysis: VariableImportanceAnalysis | null;
  manovaExplorerAnalysis: ManovaExplorerAnalysis | null;
  ldaExplorerAnalysis: LdaExplorerAnalysis | null;
}): CanonicalCorrelationExplorerAnalysis | null => {
  if (
    !input.correlationNetworkAnalysis ||
    !input.variableImportanceAnalysis
  ) {
    return null;
  }

  const correlationDensity = getCorrelationNetworkDensity(
    input.correlationNetworkAnalysis
  );
  const averageSimilarity =
    input.similarityNetworkAnalysis?.averageSimilarity ?? 0.5;
  const canonicalScore =
    (correlationDensity * 100 + averageSimilarity * 100) / 2;
  const classification = classifyCanonicalCorrelationExplorer(canonicalScore);
  const leadingVariables = getCanonicalCorrelationLeadingVariables(
    input.variableImportanceAnalysis
  );

  return {
    canonicalScore,
    classification,
    leadingVariables,
    interpretation: buildCanonicalCorrelationExplorerInterpretation({
      classification,
      leadingVariables,
      correlationDensity,
      averageSimilarity,
      manovaExplorerAnalysis: input.manovaExplorerAnalysis,
      ldaExplorerAnalysis: input.ldaExplorerAnalysis,
    }),
  };
};

const getCanonicalCorrelationExplorerReportLines = (
  analysis: CanonicalCorrelationExplorerAnalysis | null,
  correlationDensity: number | null
): string[] => {
  if (!analysis) {
    return [
      "No hay datos suficientes para generar Canonical Correlation Explorer.",
    ];
  }

  const lines = [
    `Canonical Score: ${analysis.canonicalScore.toFixed(1)}.`,
    `Clasificación: ${getCanonicalCorrelationExplorerClassificationLabel(analysis.classification)}.`,
    `Variables líderes: ${
      analysis.leadingVariables.length > 0
        ? analysis.leadingVariables.join(", ")
        : "Ninguna."
    }.`,
  ];

  if (correlationDensity !== null) {
    lines.push(`Correlation Density: ${correlationDensity.toFixed(2)}.`);
  }

  analysis.interpretation.forEach((line) => lines.push(line));
  return deduplicateTextLines(lines);
};

type ScientificCanonicalCorrelationExplorerProps = {
  analysis: CanonicalCorrelationExplorerAnalysis;
  correlationDensity: number;
};

function ScientificCanonicalCorrelationExplorer({
  analysis,
  correlationDensity,
}: ScientificCanonicalCorrelationExplorerProps) {
  const cards = [
    {
      key: "score",
      icon: "🔗",
      title: "Canonical Score",
      value: analysis.canonicalScore.toFixed(1),
      subtitle: "Índice relacional",
    },
    {
      key: "classification",
      icon: "📊",
      title: "Calidad",
      value: getCanonicalCorrelationExplorerClassificationLabel(
        analysis.classification
      ),
      subtitle: "Relaciones multivariantes",
    },
    {
      key: "leading-variables",
      icon: "🏆",
      title: "Variables líderes",
      value:
        analysis.leadingVariables.length > 0
          ? analysis.leadingVariables.join(", ")
          : "—",
      subtitle: "Estructura relacional",
    },
    {
      key: "density",
      icon: "🕸",
      title: "Correlation Density",
      value: correlationDensity.toFixed(2),
      subtitle: "Conectividad de red",
    },
  ];

  return (
    <div className="w-full mt-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => (
          <div
            key={card.key}
            className={`${contentPanel} flex flex-col gap-1 min-h-[5.5rem]`}
          >
            <p className="text-xs font-semibold text-[var(--app-text-muted)]">
              {card.icon} {card.title}
            </p>
            <p className="text-lg font-semibold text-[var(--app-heading)] tabular-nums break-words">
              {card.value}
            </p>
            {card.subtitle ? (
              <p className="text-xs text-[var(--app-text-muted)]">
                {card.subtitle}
              </p>
            ) : null}
          </div>
        ))}
      </div>
      {analysis.interpretation.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-[var(--app-heading)]">
            Interpretación
          </p>
          <ul className="mt-2 space-y-1">
            {analysis.interpretation.map((line, index) => (
              <li
                key={`canonical-correlation-explorer-interpretation-${index}`}
                className={`text-sm ${emptyState}`}
              >
                • {line}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const getPcrPredictiveVariables = (
  variableImportanceAnalysis: VariableImportanceAnalysis
) =>
  variableImportanceAnalysis.entries
    .filter((entry) => entry.normalizedScore >= 75)
    .map((entry) => entry.variable);

const getPcrTop3AverageImportance = (
  variableImportanceAnalysis: VariableImportanceAnalysis
) => {
  const topEntries = [...variableImportanceAnalysis.entries]
    .sort((left, right) => left.rank - right.rank)
    .slice(0, 3);
  if (topEntries.length === 0) return 0;
  return (
    topEntries.reduce((sum, entry) => sum + entry.normalizedScore, 0) /
    topEntries.length
  );
};

const getPcrExplorerClassificationLabel = (
  classification: PcrExplorerAnalysis["classification"]
) => {
  if (classification === "excellent") return "Excellent";
  if (classification === "good") return "Good";
  if (classification === "moderate") return "Moderate";
  return "Poor";
};

const classifyPcrExplorerPredictive = (
  predictiveScore: number
): PcrExplorerAnalysis["classification"] => {
  if (predictiveScore >= 85) return "excellent";
  if (predictiveScore >= 70) return "good";
  if (predictiveScore >= 50) return "moderate";
  return "poor";
};

const getPcrExplorerClassificationText = (
  classification: PcrExplorerAnalysis["classification"]
) => {
  if (classification === "excellent") {
    return "Los componentes principales presentan una capacidad predictiva excelente.";
  }
  if (classification === "good") {
    return "Los componentes principales presentan una capacidad predictiva buena.";
  }
  if (classification === "moderate") {
    return "Los componentes principales presentan una capacidad predictiva moderada.";
  }
  return "La capacidad predictiva observada es limitada.";
};

const hasPcrExplorerExcellentPredictive = (
  analysis: PcrExplorerAnalysis | null
) => analysis !== null && analysis.predictiveScore >= 85;

const hasPcrExplorerPoorPredictive = (analysis: PcrExplorerAnalysis | null) =>
  analysis !== null && analysis.classification === "poor";

const buildPcrExplorerInterpretation = (input: {
  classification: PcrExplorerAnalysis["classification"];
  predictiveVariables: string[];
  pcaAnalysis: PCAAnalysis;
  ldaExplorerAnalysis: LdaExplorerAnalysis | null;
  canonicalCorrelationExplorerAnalysis: CanonicalCorrelationExplorerAnalysis | null;
}): string[] => {
  const interpretation: string[] = [
    getPcrExplorerClassificationText(input.classification),
  ];

  if (input.pcaAnalysis.cumulativeVariance >= 80) {
    interpretation.push(
      "La mayor parte de la variabilidad se encuentra capturada por los componentes principales."
    );
  }

  if (input.predictiveVariables.length > 0) {
    interpretation.push(
      `Las variables ${formatLdaDominantVariablesList(input.predictiveVariables)} contribuyen principalmente al potencial predictivo observado.`
    );
  }

  if (
    input.ldaExplorerAnalysis &&
    input.ldaExplorerAnalysis.discriminantScore >= 85
  ) {
    interpretation.push(
      "La capacidad predictiva es consistente con la separación observada en LDA Explorer."
    );
  }

  if (
    input.canonicalCorrelationExplorerAnalysis &&
    input.canonicalCorrelationExplorerAnalysis.canonicalScore >= 85
  ) {
    interpretation.push(
      "Las relaciones multivariantes observadas respaldan la capacidad predictiva estimada."
    );
  }

  return deduplicateTextLines(interpretation);
};

const buildPcrExplorerAnalysis = (input: {
  pcaAnalysis: PCAAnalysis | null;
  variableImportanceAnalysis: VariableImportanceAnalysis | null;
  ldaExplorerAnalysis: LdaExplorerAnalysis | null;
  canonicalCorrelationExplorerAnalysis: CanonicalCorrelationExplorerAnalysis | null;
}): PcrExplorerAnalysis | null => {
  if (!input.pcaAnalysis || !input.variableImportanceAnalysis) {
    return null;
  }

  const top3AverageImportance = getPcrTop3AverageImportance(
    input.variableImportanceAnalysis
  );
  const predictiveScore =
    (input.pcaAnalysis.cumulativeVariance + top3AverageImportance) / 2;
  const classification = classifyPcrExplorerPredictive(predictiveScore);
  const predictiveVariables = getPcrPredictiveVariables(
    input.variableImportanceAnalysis
  );

  return {
    predictiveScore,
    classification,
    predictiveVariables,
    interpretation: buildPcrExplorerInterpretation({
      classification,
      predictiveVariables,
      pcaAnalysis: input.pcaAnalysis,
      ldaExplorerAnalysis: input.ldaExplorerAnalysis,
      canonicalCorrelationExplorerAnalysis:
        input.canonicalCorrelationExplorerAnalysis,
    }),
  };
};

const getPcrExplorerReportLines = (
  analysis: PcrExplorerAnalysis | null
): string[] => {
  if (!analysis) {
    return ["No hay datos suficientes para generar PCR Explorer."];
  }

  const lines = [
    `Predictive Score: ${analysis.predictiveScore.toFixed(1)}.`,
    `Clasificación: ${getPcrExplorerClassificationLabel(analysis.classification)}.`,
    `Variables predictivas: ${
      analysis.predictiveVariables.length > 0
        ? analysis.predictiveVariables.join(", ")
        : "Ninguna."
    }.`,
  ];

  analysis.interpretation.forEach((line) => lines.push(line));
  return deduplicateTextLines(lines);
};

type ScientificPcrExplorerProps = {
  analysis: PcrExplorerAnalysis;
  pcaVariance: number;
};

function ScientificPcrExplorer({
  analysis,
  pcaVariance,
}: ScientificPcrExplorerProps) {
  const cards = [
    {
      key: "score",
      icon: "📈",
      title: "Predictive Score",
      value: analysis.predictiveScore.toFixed(1),
      subtitle: "Capacidad predictiva",
    },
    {
      key: "classification",
      icon: "📊",
      title: "Calidad",
      value: getPcrExplorerClassificationLabel(analysis.classification),
      subtitle: "Potencial predictivo",
    },
    {
      key: "predictive-variables",
      icon: "🏆",
      title: "Variables predictivas",
      value:
        analysis.predictiveVariables.length > 0
          ? analysis.predictiveVariables.join(", ")
          : "—",
      subtitle: "Contribución principal",
    },
    {
      key: "pca",
      icon: "🧭",
      title: "PCA",
      value: `${pcaVariance.toFixed(0)}%`,
      subtitle: "Varianza acumulada",
    },
  ];

  return (
    <div className="w-full mt-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => (
          <div
            key={card.key}
            className={`${contentPanel} flex flex-col gap-1 min-h-[5.5rem]`}
          >
            <p className="text-xs font-semibold text-[var(--app-text-muted)]">
              {card.icon} {card.title}
            </p>
            <p className="text-lg font-semibold text-[var(--app-heading)] tabular-nums break-words">
              {card.value}
            </p>
            {card.subtitle ? (
              <p className="text-xs text-[var(--app-text-muted)]">
                {card.subtitle}
              </p>
            ) : null}
          </div>
        ))}
      </div>
      {analysis.interpretation.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-[var(--app-heading)]">
            Interpretación
          </p>
          <ul className="mt-2 space-y-1">
            {analysis.interpretation.map((line, index) => (
              <li
                key={`pcr-explorer-interpretation-${index}`}
                className={`text-sm ${emptyState}`}
              >
                • {line}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

type ScientificClusteredDistanceHeatmapProps = {
  clusteringAnalysis: HierarchicalClusteringAnalysis;
  clusterHeatmapAnalysis: ClusterHeatmapAnalysis;
  analysis: ClusteredDistanceHeatmapAnalysis;
};

function ScientificClusteredDistanceHeatmap({
  clusteringAnalysis,
  clusterHeatmapAnalysis,
  analysis,
}: ScientificClusteredDistanceHeatmapProps) {
  const { minDistance } = getReorderedMatrixDistanceStats(analysis.matrix);

  return (
    <div className="w-full mt-3" style={{ maxHeight: 320 }}>
      <div className="overflow-auto max-h-[320px] space-y-2">
        <ScientificHierarchicalClusteringDendrogram analysis={clusteringAnalysis} />
        <ScientificClusterHeatmap
          analysis={clusterHeatmapAnalysis}
          minDistance={minDistance}
          maxDistance={analysis.maxDistance}
        />
      </div>
    </div>
  );
}

type ScientificClusterHeatmapProps = {
  analysis: ClusterHeatmapAnalysis;
  minDistance: number;
  maxDistance: number;
};

function ScientificClusterHeatmap({
  analysis,
  minDistance,
  maxDistance,
}: ScientificClusterHeatmapProps) {
  return (
    <div className="w-full mt-3" style={{ maxHeight: 280 }}>
      <div className="overflow-auto max-h-[280px]">
        <div
          className="gap-0.5 min-w-max"
          style={{
            display: "grid",
            gridTemplateColumns: `minmax(6.5rem, auto) repeat(${analysis.orderedVariables.length}, minmax(3rem, 1fr))`,
          }}
        >
          <div className="px-2 py-1" />
          {analysis.orderedVariables.map((variable) => (
            <div
              key={`cluster-heatmap-col-${variable}`}
              className="px-1 py-1 text-center text-xs font-semibold text-[var(--app-heading)] truncate"
              title={variable}
            >
              {variable}
            </div>
          ))}

          {analysis.orderedVariables.map((rowVariable, rowIndex) => (
            <div key={`cluster-heatmap-row-${rowVariable}`} className="contents">
              <div
                className="px-2 py-1 text-xs font-semibold text-[var(--app-heading)] truncate"
                title={rowVariable}
              >
                {rowVariable}
              </div>
              {analysis.orderedVariables.map((columnVariable, columnIndex) => {
                const value = analysis.matrix[rowIndex]?.[columnIndex] ?? 0;
                const isDiagonal = rowIndex === columnIndex;
                const colors = getDistanceMatrixCellColors(
                  value,
                  minDistance,
                  maxDistance,
                  isDiagonal
                );

                return (
                  <div
                    key={`cluster-heatmap-cell-${rowVariable}-${columnVariable}`}
                    className="min-h-[2.25rem] flex items-center justify-center rounded-sm px-1 py-1 text-xs tabular-nums"
                    style={{
                      backgroundColor: colors.backgroundColor,
                      color: colors.color,
                    }}
                    title={`${rowVariable} × ${columnVariable}: ${value.toFixed(2)}`}
                  >
                    {value.toFixed(2)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const getMaxClusterDistance = (node: ClusterNode): number => {
  if (!node.children || node.children.length === 0) return node.distance;
  return Math.max(
    node.distance,
    ...node.children.map((child) => getMaxClusterDistance(child))
  );
};

const buildHierarchicalClusteringAnalysis = (
  series: ExperimentalSeries[]
): HierarchicalClusteringAnalysis | null => {
  if (!canBuildHierarchicalClustering(series)) return null;

  const distanceMatrix = buildClusteringDistanceMatrix(series);
  const { root, mergeDistances, finalDistance } = buildHierarchicalClusteringTree(
    series,
    distanceMatrix
  );

  if (!root) return null;

  return {
    root,
    seriesCount: series.length,
    interpretation: getHierarchicalClusteringInterpretation(
      series.length,
      mergeDistances,
      finalDistance
    ),
  };
};

const getHierarchicalClusteringInterpretationLines = (
  analysis: HierarchicalClusteringAnalysis | null
): string[] => {
  if (!analysis || !analysis.root) {
    return ["No hay datos suficientes para realizar clustering."];
  }

  return [
    `Número de series: ${analysis.seriesCount}.`,
    analysis.interpretation,
    getHierarchicalClusteringStructureDescription(analysis.root),
    "Método: clustering jerárquico aglomerativo con enlace promedio y distancia euclídea.",
  ];
};

type DendrogramLineSegment = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

const collectDendrogramSegments = (
  node: ClusterNode,
  leafPositions: Map<string, number>,
  scaleY: (distance: number) => number
): { centerX: number; segments: DendrogramLineSegment[] } => {
  if (!node.children || node.children.length < 2) {
    const centerX = leafPositions.get(node.name) ?? 0;
    const bottomY = scaleY(0);
    return {
      centerX,
      segments: [{ x1: centerX, y1: bottomY, x2: centerX, y2: bottomY }],
    };
  }

  const leftBranch = collectDendrogramSegments(
    node.children[0],
    leafPositions,
    scaleY
  );
  const rightBranch = collectDendrogramSegments(
    node.children[1],
    leafPositions,
    scaleY
  );
  const mergeY = scaleY(node.distance);
  const leftTopY =
    leftBranch.segments.length > 0
      ? Math.min(leftBranch.segments[0].y1, leftBranch.segments[0].y2)
      : mergeY;
  const rightTopY =
    rightBranch.segments.length > 0
      ? Math.min(rightBranch.segments[0].y1, rightBranch.segments[0].y2)
      : mergeY;

  const segments: DendrogramLineSegment[] = [
    ...leftBranch.segments,
    ...rightBranch.segments,
    { x1: leftBranch.centerX, y1: leftTopY, x2: leftBranch.centerX, y2: mergeY },
    { x1: rightBranch.centerX, y1: rightTopY, x2: rightBranch.centerX, y2: mergeY },
    {
      x1: leftBranch.centerX,
      y1: mergeY,
      x2: rightBranch.centerX,
      y2: mergeY,
    },
  ];

  return {
    centerX: (leftBranch.centerX + rightBranch.centerX) / 2,
    segments,
  };
};

type ScientificHierarchicalClusteringDendrogramProps = {
  analysis: HierarchicalClusteringAnalysis;
};

function ScientificHierarchicalClusteringDendrogram({
  analysis,
}: ScientificHierarchicalClusteringDendrogramProps) {
  if (!analysis.root) {
    return (
      <p className={emptyState}>
        No hay datos suficientes para realizar clustering.
      </p>
    );
  }

  const leaves = getClusterLeavesInOrder(analysis.root);
  const leafCount = leaves.length;
  const labelWidth = 132;
  const paddingX = 20;
  const paddingY = 24;
  const rowHeight = 36;
  const width = 520;
  const height = paddingY * 2 + Math.max(leafCount * rowHeight, 96);
  const plotLeft = labelWidth + paddingX;
  const plotRight = width - paddingX;
  const plotWidth = plotRight - plotLeft;
  const plotTop = paddingY;
  const plotBottom = height - paddingY;
  const plotHeight = plotBottom - plotTop;
  const maxDistance = getMaxClusterDistance(analysis.root) || 1;

  const leafPositions = new Map<string, number>();
  leaves.forEach((leaf, index) => {
    const x =
      leafCount === 1
        ? (plotLeft + plotRight) / 2
        : plotLeft + (index / (leafCount - 1)) * plotWidth;
    leafPositions.set(leaf.name, x);
  });

  const scaleY = (distance: number) =>
    plotBottom - (distance / maxDistance) * plotHeight;

  const { segments } = collectDendrogramSegments(
    analysis.root,
    leafPositions,
    scaleY
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full max-w-xl mt-3"
      role="img"
      aria-label="Dendrograma de clustering jerárquico"
    >
      {segments.map((segment, index) => (
        <line
          key={`dendrogram-segment-${index}`}
          x1={segment.x1}
          y1={segment.y1}
          x2={segment.x2}
          y2={segment.y2}
          stroke="var(--app-accent)"
          strokeWidth={2}
        />
      ))}

      {leaves.map((leaf) => {
        const x = leafPositions.get(leaf.name) ?? plotLeft;
        return (
          <text
            key={`dendrogram-leaf-${leaf.name}`}
            x={x}
            y={plotBottom + 16}
            textAnchor="middle"
            fill="var(--app-text)"
            fontSize={10}
          >
            {leaf.name.length > 12 ? `${leaf.name.slice(0, 11)}…` : leaf.name}
          </text>
        );
      })}
    </svg>
  );
}

const classifyViolinShape = (
  q1: number,
  median: number,
  q3: number
): ViolinShapeInterpretation => {
  const upperSpread = q3 - median;
  const lowerSpread = median - q1;
  const tolerance = Math.max(Math.abs(q3 - q1) * 0.1, 1e-9);

  if (Math.abs(upperSpread - lowerSpread) <= tolerance) return "symmetric";
  if (upperSpread > lowerSpread * 1.15) return "right-skewed";
  if (lowerSpread > upperSpread * 1.15) return "left-skewed";
  return "symmetric";
};

const getViolinShapeInterpretationMessage = (
  interpretation: ViolinShapeInterpretation
) => {
  if (interpretation === "symmetric") {
    return "Distribución aproximadamente simétrica.";
  }
  if (interpretation === "right-skewed") {
    return "Distribución sesgada hacia valores altos.";
  }
  return "Distribución sesgada hacia valores bajos.";
};

const calculateViolinPlot = (
  series: ExperimentalSeries
): ViolinPlotAnalysis | null => {
  const boxStatistics = calculateBoxPlotStatistics(series);
  if (boxStatistics.sampleSize === 0) return null;

  const values = getSeriesYValues(series).sort((left, right) => left - right);
  const densityPoints = calculateKernelDensity(
    values,
    boxStatistics.min,
    boxStatistics.max
  );

  return {
    seriesName: boxStatistics.seriesName,
    sampleSize: boxStatistics.sampleSize,
    min: boxStatistics.min,
    max: boxStatistics.max,
    q1: boxStatistics.q1,
    median: boxStatistics.median,
    q3: boxStatistics.q3,
    densityPoints,
    shapeInterpretation: classifyViolinShape(
      boxStatistics.q1,
      boxStatistics.median,
      boxStatistics.q3
    ),
  };
};

const calculateViolinPlotsForSeries = (
  series: ExperimentalSeries[]
): ViolinPlotAnalysis[] =>
  series
    .map((item) => calculateViolinPlot(item))
    .filter((analysis): analysis is ViolinPlotAnalysis => analysis !== null);

const MiniViolinPlot = ({ analysis }: { analysis: ViolinPlotAnalysis }) => {
  const width = 280;
  const height = 240;
  const padding = 20;
  const centerX = width / 2;
  const maxHalfWidth = 78;
  const innerBoxWidth = 18;

  if (analysis.sampleSize === 0 || analysis.densityPoints.length === 0) {
    return (
      <p className={emptyState}>Sin datos válidos para el violin plot.</p>
    );
  }

  const plotMin = analysis.min;
  const plotMax = analysis.max;
  const range = plotMax - plotMin || 1;

  const scaleY = (value: number) =>
    padding + ((plotMax - value) / range) * (height - padding * 2);

  const buildHalfPath = (side: "left" | "right") => {
    const points = analysis.densityPoints;
    const firstPoint = points[0];
    const startY = scaleY(firstPoint.value);
    let path = `M ${centerX} ${startY}`;

    points.forEach((point) => {
      const y = scaleY(point.value);
      const offset = (side === "right" ? 1 : -1) * point.density * maxHalfWidth;
      path += ` L ${centerX + offset} ${y}`;
    });

    const lastPoint = points[points.length - 1];
    path += ` L ${centerX} ${scaleY(lastPoint.value)} Z`;
    return path;
  };

  const yQ1 = scaleY(analysis.q1);
  const yQ3 = scaleY(analysis.q3);
  const yMedian = scaleY(analysis.median);
  const boxTop = Math.min(yQ1, yQ3);
  const boxHeight = Math.max(Math.abs(yQ1 - yQ3), 1);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full"
      role="img"
      aria-label={`Violin plot de ${analysis.seriesName}`}
    >
      <path
        d={buildHalfPath("left")}
        fill="var(--app-accent)"
        fillOpacity={0.2}
        stroke="var(--app-accent)"
        strokeWidth={1.5}
      />
      <path
        d={buildHalfPath("right")}
        fill="var(--app-accent)"
        fillOpacity={0.2}
        stroke="var(--app-accent)"
        strokeWidth={1.5}
      />
      <rect
        x={centerX - innerBoxWidth / 2}
        y={boxTop}
        width={innerBoxWidth}
        height={boxHeight}
        fill="var(--app-surface)"
        fillOpacity={0.85}
        stroke="var(--app-heading)"
        strokeWidth={1.5}
      />
      <line
        x1={centerX - innerBoxWidth / 2}
        y1={yMedian}
        x2={centerX + innerBoxWidth / 2}
        y2={yMedian}
        stroke="var(--app-heading)"
        strokeWidth={2}
      />
    </svg>
  );
};

type NormalityClassification =
  | "normal"
  | "approximately-normal"
  | "non-normal";

type NormalityConfidence = "high" | "medium" | "low";

type NormalityAnalysis = {
  seriesId: string;
  seriesName: string;
  sampleSize: number;
  mean: number;
  standardDeviation: number;
  skewness: number;
  kurtosis: number;
  classification: NormalityClassification | null;
  confidence: NormalityConfidence;
};

const calculateCentralMoments = (values: number[]) => {
  const count = values.length;
  if (count === 0) return null;

  const mean = values.reduce((sum, value) => sum + value, 0) / count;
  const deviations = values.map((value) => value - mean);
  const m2 = deviations.reduce((sum, deviation) => sum + deviation ** 2, 0) / count;
  const m3 = deviations.reduce((sum, deviation) => sum + deviation ** 3, 0) / count;
  const m4 = deviations.reduce((sum, deviation) => sum + deviation ** 4, 0) / count;

  return { mean, m2, m3, m4, count };
};

const calculateSkewness = (values: number[]): number | null => {
  const moments = calculateCentralMoments(values);
  if (!moments || moments.m2 === 0) return null;

  return moments.m3 / moments.m2 ** 1.5;
};

const calculateKurtosis = (values: number[]): number | null => {
  const moments = calculateCentralMoments(values);
  if (!moments || moments.m2 === 0) return null;

  return moments.m4 / (moments.m2 * moments.m2) - 3;
};

const classifyNormality = (
  skewness: number,
  kurtosis: number
): NormalityClassification => {
  const absoluteSkewness = Math.abs(skewness);
  const absoluteKurtosis = Math.abs(kurtosis);

  if (absoluteSkewness < 0.5 && absoluteKurtosis < 1) return "normal";
  if (absoluteSkewness < 1 && absoluteKurtosis < 2) {
    return "approximately-normal";
  }

  return "non-normal";
};

const getNormalityConfidence = (
  sampleSize: number
): NormalityConfidence => {
  if (sampleSize >= 30) return "high";
  if (sampleSize >= 15) return "medium";
  return "low";
};

const getNormalityConfidenceLabel = (confidence: NormalityConfidence) =>
  confidence === "high" ? "Alta" : confidence === "medium" ? "Media" : "Baja";

const getNormalityClassificationLabel = (
  classification: NormalityClassification | null
) => {
  if (classification === null) return "No disponible";
  if (classification === "normal") return "Normal";
  if (classification === "approximately-normal") return "Aproximadamente normal";
  return "No normal";
};

const getNormalityClassificationBadge = (
  classification: NormalityClassification | null
) => {
  if (classification === null) return null;
  if (classification === "normal") return "🟢 Distribución normal";
  if (classification === "approximately-normal") {
    return "🟡 Aproximadamente normal";
  }
  return "🔴 Distribución no normal";
};

const getNormalityRecommendation = (
  classification: NormalityClassification | null
) => {
  if (classification === null) {
    return "No hay variabilidad suficiente para evaluar la normalidad.";
  }
  if (classification === "normal") {
    return "Los datos son compatibles con análisis paramétricos.";
  }
  if (classification === "approximately-normal") {
    return "Los datos podrían utilizar análisis paramétricos con precaución.";
  }
  return "Se recomiendan pruebas no paramétricas.";
};

const analyzeSeriesNormality = (
  series: ExperimentalSeries
): NormalityAnalysis => {
  const values = series.points
    .map((point) => point.y)
    .filter((value) => Number.isFinite(value));
  const sampleSize = values.length;
  const confidence = getNormalityConfidence(sampleSize);

  if (sampleSize === 0) {
    return {
      seriesId: series.id,
      seriesName: series.name,
      sampleSize: 0,
      mean: 0,
      standardDeviation: 0,
      skewness: 0,
      kurtosis: 0,
      classification: null,
      confidence,
    };
  }

  const mean = values.reduce((sum, value) => sum + value, 0) / sampleSize;
  const variance =
    sampleSize > 1
      ? values.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
        (sampleSize - 1)
      : 0;
  const standardDeviation = Math.sqrt(variance);
  const skewness = calculateSkewness(values);
  const kurtosis = calculateKurtosis(values);

  if (skewness == null || kurtosis == null) {
    return {
      seriesId: series.id,
      seriesName: series.name,
      sampleSize,
      mean,
      standardDeviation,
      skewness: 0,
      kurtosis: 0,
      classification: null,
      confidence,
    };
  }

  return {
    seriesId: series.id,
    seriesName: series.name,
    sampleSize,
    mean,
    standardDeviation,
    skewness,
    kurtosis,
    classification: classifyNormality(skewness, kurtosis),
    confidence,
  };
};

const analyzeNormalityForSeries = (
  series: ExperimentalSeries[]
): NormalityAnalysis[] => series.map((item) => analyzeSeriesNormality(item));

type QQPoint = {
  theoretical: number;
  sample: number;
};

type QQPlotInterpretation = "excellent" | "good" | "moderate" | "poor";

type QQPlotAnalysis = {
  seriesName: string;
  sampleSize: number;
  correlation: number;
  interpretation: QQPlotInterpretation;
  points: QQPoint[];
};

const inverseNormalCDF = (probability: number): number | null => {
  if (!Number.isFinite(probability) || probability <= 0 || probability >= 1) {
    return null;
  }

  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469138e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239e0,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368152409e2, -1.556989798850864e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580040421e-1, -2.400758277161838e0,
    -2.549507540030974e0, 4.374664141464968e0, 2.938163982698053e0,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996e0,
    3.754408661907416e0,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q: number;
  let r: number;

  if (probability < pLow) {
    q = Math.sqrt(-2 * Math.log(probability));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }

  if (probability <= pHigh) {
    q = probability - 0.5;
    r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) *
        q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  }

  q = Math.sqrt(-2 * Math.log(1 - probability));
  return (
    -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  );
};

const classifyQQPlotInterpretation = (
  correlation: number
): QQPlotInterpretation => {
  if (correlation >= 0.99) return "excellent";
  if (correlation >= 0.97) return "good";
  if (correlation >= 0.94) return "moderate";
  return "poor";
};

const getQQPlotInterpretationLabel = (interpretation: QQPlotInterpretation) => {
  if (interpretation === "excellent") return "Excelente ajuste normal";
  if (interpretation === "good") return "Buen ajuste normal";
  if (interpretation === "moderate") return "Ajuste moderado";
  return "Ajuste deficiente";
};

const getQQPlotInterpretationMessage = (interpretation: QQPlotInterpretation) => {
  if (interpretation === "excellent") {
    return "Los datos siguen muy de cerca una distribución normal.";
  }
  if (interpretation === "good") {
    return "Los datos son compatibles con una distribución normal.";
  }
  if (interpretation === "moderate") {
    return "Se observan desviaciones moderadas respecto a la normalidad.";
  }
  return "Los datos muestran desviaciones importantes respecto a una distribución normal.";
};

type NormalityConsensus = {
  seriesName: string;
  conclusion: "normal" | "probably-normal" | "questionable" | "non-normal";
  confidence: "high" | "medium" | "low";
  reasons: string[];
};

const getNormalityConsensusConclusionLabel = (
  conclusion: NormalityConsensus["conclusion"]
) => {
  if (conclusion === "normal") return "Normal";
  if (conclusion === "probably-normal") return "Probablemente normal";
  if (conclusion === "questionable") return "Normalidad cuestionable";
  return "No normal";
};

const getNormalityConsensusEmoji = (
  conclusion: NormalityConsensus["conclusion"]
) => {
  if (conclusion === "normal") return "🟢";
  if (conclusion === "probably-normal") return "🟡";
  if (conclusion === "questionable") return "🟠";
  return "🔴";
};

const isViolinShapeSkewed = (
  shape: ViolinShapeInterpretation | undefined
) => shape === "right-skewed" || shape === "left-skewed";

const isKernelShapeSkewed = (shape: KernelDistributionShape | undefined) =>
  shape === "right-skewed" || shape === "left-skewed";

const buildNormalityConsensusForSeries = (
  normality: NormalityAnalysis | undefined,
  qqPlot: QQPlotAnalysis | undefined,
  violinPlot: ViolinPlotAnalysis | undefined,
  kernelDensity: KernelDensityAnalysis | undefined
): NormalityConsensus => {
  const seriesName =
    normality?.seriesName ??
    qqPlot?.seriesName ??
    violinPlot?.seriesName ??
    kernelDensity?.seriesName ??
    "Serie";

  const sourceReasons: string[] = [];
  if (normality) {
    sourceReasons.push(
      `SCI-11: ${getNormalityClassificationLabel(normality.classification)}`
    );
  }
  if (qqPlot) {
    sourceReasons.push(
      `SCI-21: ${getQQPlotInterpretationLabel(qqPlot.interpretation)}`
    );
  }
  if (violinPlot) {
    sourceReasons.push(
      `SCI-22: ${getViolinShapeInterpretationMessage(violinPlot.shapeInterpretation)}`
    );
  }
  if (kernelDensity) {
    sourceReasons.push(
      `SCI-26: ${getKernelDistributionShapeMessage(kernelDensity.distributionShape)}`
    );
  }

  if (!normality || normality.classification === null) {
    return {
      seriesName,
      conclusion: "questionable",
      confidence: "low",
      reasons: [
        "Datos insuficientes para evaluar normalidad.",
        ...sourceReasons,
      ],
    };
  }

  if (normality.classification === "non-normal") {
    return {
      seriesName,
      conclusion: "non-normal",
      confidence: "high",
      reasons: [
        "SCI-11 clasifica la serie como no normal.",
        ...sourceReasons.filter((reason) => !reason.startsWith("SCI-11:")),
      ],
    };
  }

  const qqPoor = qqPlot?.interpretation === "poor";
  if (
    (normality.classification === "normal" && qqPoor) ||
    (normality.classification === "approximately-normal" && qqPoor)
  ) {
    return {
      seriesName,
      conclusion: "questionable",
      confidence: "medium",
      reasons: [
        "La evaluación de normalidad y el Q-Q Plot no son consistentes.",
        ...sourceReasons,
      ],
    };
  }

  const qqFavorable =
    qqPlot?.interpretation === "excellent" || qqPlot?.interpretation === "good";
  const violinSymmetric = violinPlot?.shapeInterpretation === "symmetric";
  const kdeSymmetric = kernelDensity?.distributionShape === "symmetric";

  if (
    normality.classification === "normal" &&
    qqFavorable &&
    violinSymmetric &&
    kdeSymmetric
  ) {
    return {
      seriesName,
      conclusion: "normal",
      confidence: "high",
      reasons: [
        "SCI-11, Q-Q Plot, Violin Plot y KDE son coherentes con normalidad.",
        ...sourceReasons,
      ],
    };
  }

  const qqModerate = qqPlot?.interpretation === "moderate";
  const violinSkewed = isViolinShapeSkewed(violinPlot?.shapeInterpretation);
  const kdeSkewed = isKernelShapeSkewed(kernelDensity?.distributionShape);

  if (
    normality.classification === "normal" &&
    (qqModerate || violinSkewed || kdeSkewed)
  ) {
    const reasons = [
      "SCI-11 indica normalidad, pero al menos un diagnóstico complementario muestra reservas.",
    ];
    if (qqModerate) reasons.push("Q-Q Plot con ajuste moderado.");
    if (violinSkewed) reasons.push("Violin Plot con asimetría.");
    if (kdeSkewed) reasons.push("KDE con asimetría.");
    reasons.push(...sourceReasons);
    return {
      seriesName,
      conclusion: "probably-normal",
      confidence: "medium",
      reasons,
    };
  }

  return {
    seriesName,
    conclusion: "questionable",
    confidence: sourceReasons.length >= 2 ? "medium" : "low",
    reasons: [
      "No se alcanzó un consenso claro de normalidad con los indicadores disponibles.",
      ...sourceReasons,
    ],
  };
};

const buildNormalityConsensus = (
  normalityAnalyses: NormalityAnalysis[],
  qqPlotAnalyses: QQPlotAnalysis[],
  violinPlotAnalyses: ViolinPlotAnalysis[],
  kernelDensityAnalyses: KernelDensityAnalysis[]
): NormalityConsensus[] => {
  const seriesNames = new Set<string>();
  normalityAnalyses.forEach((analysis) => seriesNames.add(analysis.seriesName));
  qqPlotAnalyses.forEach((analysis) => seriesNames.add(analysis.seriesName));
  violinPlotAnalyses.forEach((analysis) => seriesNames.add(analysis.seriesName));
  kernelDensityAnalyses.forEach((analysis) =>
    seriesNames.add(analysis.seriesName)
  );

  if (seriesNames.size === 0) return [];

  const normalityByName = new Map(
    normalityAnalyses.map((analysis) => [analysis.seriesName, analysis])
  );
  const qqByName = new Map(
    qqPlotAnalyses.map((analysis) => [analysis.seriesName, analysis])
  );
  const violinByName = new Map(
    violinPlotAnalyses.map((analysis) => [analysis.seriesName, analysis])
  );
  const kdeByName = new Map(
    kernelDensityAnalyses.map((analysis) => [analysis.seriesName, analysis])
  );

  return Array.from(seriesNames).map((seriesName) =>
    buildNormalityConsensusForSeries(
      normalityByName.get(seriesName),
      qqByName.get(seriesName),
      violinByName.get(seriesName),
      kdeByName.get(seriesName)
    )
  );
};

const getNormalityConsensusReportLines = (
  consensusList: NormalityConsensus[]
): string[] => {
  if (consensusList.length === 0) {
    return ["No hay series disponibles para consenso de normalidad."];
  }

  const lines: string[] = [];
  consensusList.forEach((consensus) => {
    lines.push(consensus.seriesName);
    lines.push(
      `Conclusión: ${getNormalityConsensusConclusionLabel(consensus.conclusion)}`
    );
    lines.push(
      `Confianza: ${getNormalityConfidenceLabel(consensus.confidence)}`
    );
    consensus.reasons.forEach((reason) => lines.push(`- ${reason}`));
  });
  return lines;
};

const getNormalityConsensusFindingLine = (consensus: NormalityConsensus) => {
  if (consensus.conclusion === "normal") {
    return `La serie ${consensus.seriesName} presenta evidencia consistente de normalidad.`;
  }
  if (consensus.conclusion === "probably-normal") {
    return `La serie ${consensus.seriesName} es probablemente normal según el consenso integrado.`;
  }
  if (consensus.conclusion === "questionable") {
    return `La serie ${consensus.seriesName} presenta resultados ambiguos respecto a normalidad.`;
  }
  return `La serie ${consensus.seriesName} no cumple supuestos de normalidad.`;
};

const appendNormalityConsensusFindings = (
  findings: string[],
  warnings: string[],
  consensusList: NormalityConsensus[]
) => {
  consensusList.forEach((consensus) => {
    const finding = getNormalityConsensusFindingLine(consensus);
    if (!findings.includes(finding)) findings.push(finding);
    if (consensus.conclusion === "non-normal") {
      const warning = `La serie ${consensus.seriesName} no cumple supuestos de normalidad; se recomienda priorizar pruebas no paramétricas.`;
      if (!warnings.includes(warning)) warnings.push(warning);
    }
    if (consensus.conclusion === "questionable") {
      const warning = `La serie ${consensus.seriesName} presenta resultados ambiguos respecto a normalidad.`;
      if (!warnings.includes(warning)) warnings.push(warning);
    }
  });
};

type IntegratedNormalityVerdict =
  | "compatible"
  | "approximately-compatible"
  | "inconclusive"
  | "non-compatible"
  | "contradictory";

type IntegratedNormalitySeriesAssessment = {
  seriesName: string;
  verdict: IntegratedNormalityVerdict;
  conclusion: string;
  sourceSummary: string[];
};

type IntegratedNormalityAssessment = {
  seriesAssessments: IntegratedNormalitySeriesAssessment[];
  globalConclusion: string[];
  coherenceWarnings: string[];
};

const isNormalityClassificationFavorable = (
  classification: NormalityClassification | null | undefined
) =>
  classification === "normal" || classification === "approximately-normal";

const isQQInterpretationFavorable = (
  interpretation: QQPlotInterpretation | undefined
) => interpretation === "excellent" || interpretation === "good";

const isQQInterpretationUnfavorable = (
  interpretation: QQPlotInterpretation | undefined
) => interpretation === "poor";

const isDistributionShapeFavorable = (
  shape: ViolinShapeInterpretation | KernelDistributionShape | undefined
) => shape === "symmetric";

const isDistributionShapeUnfavorable = (
  shape: ViolinShapeInterpretation | KernelDistributionShape | undefined
) =>
  shape === "right-skewed" ||
  shape === "left-skewed" ||
  shape === "multimodal";

const getIntegratedNormalityVerdictLabel = (
  verdict: IntegratedNormalityVerdict
) => {
  if (verdict === "compatible") return "Compatible con normalidad";
  if (verdict === "approximately-compatible") {
    return "Aproximadamente compatible";
  }
  if (verdict === "inconclusive") return "Inconcluso";
  if (verdict === "non-compatible") return "No compatible con normalidad";
  return "Señales contradictorias";
};

const getIntegratedNormalitySeriesFooterText = (
  assessment: IntegratedNormalitySeriesAssessment | undefined
) => {
  if (!assessment) return null;
  return `Coherencia integrada — ${getIntegratedNormalityVerdictLabel(assessment.verdict)}: ${assessment.conclusion}`;
};

const assessIntegratedNormalityForSeries = (
  normality: NormalityAnalysis | undefined,
  qqPlot: QQPlotAnalysis | undefined,
  violinPlot: ViolinPlotAnalysis | undefined,
  kernelDensity: KernelDensityAnalysis | undefined
): IntegratedNormalitySeriesAssessment => {
  const seriesName =
    normality?.seriesName ??
    qqPlot?.seriesName ??
    violinPlot?.seriesName ??
    kernelDensity?.seriesName ??
    "Serie";

  const sourceSummary: string[] = [];

  if (normality) {
    sourceSummary.push(
      `SCI-11: ${getNormalityClassificationLabel(normality.classification)}`
    );
  }
  if (qqPlot) {
    sourceSummary.push(
      `SCI-21: ${getQQPlotInterpretationLabel(qqPlot.interpretation)}`
    );
  }
  if (violinPlot) {
    sourceSummary.push(
      `SCI-22: ${getViolinShapeInterpretationMessage(violinPlot.shapeInterpretation)}`
    );
  }
  if (kernelDensity) {
    sourceSummary.push(
      `SCI-26: ${getKernelDistributionShapeMessage(kernelDensity.distributionShape)}`
    );
  }

  const normalityFavorable = isNormalityClassificationFavorable(
    normality?.classification
  );
  const normalityUnfavorable = normality?.classification === "non-normal";
  const qqUnfavorable = isQQInterpretationUnfavorable(qqPlot?.interpretation);
  const qqFavorable = isQQInterpretationFavorable(qqPlot?.interpretation);
  const violinUnfavorable = violinPlot
    ? !isDistributionShapeFavorable(violinPlot.shapeInterpretation)
    : false;
  const kernelUnfavorable = kernelDensity
    ? isDistributionShapeUnfavorable(kernelDensity.distributionShape)
    : false;
  const visualUnfavorable = violinUnfavorable || kernelUnfavorable;
  const visualFavorable =
    (!violinPlot || isDistributionShapeFavorable(violinPlot.shapeInterpretation)) &&
    (!kernelDensity ||
      isDistributionShapeFavorable(kernelDensity.distributionShape));

  if (normalityFavorable && (qqUnfavorable || visualUnfavorable)) {
    return {
      seriesName,
      verdict: "contradictory",
      conclusion:
        "Conclusión integrada: SCI-11 indica compatibilidad con normalidad, pero el Q-Q Plot, Violin Plot o KDE evidencian desviaciones. Interprete con cautela y considere métodos no paramétricos.",
      sourceSummary,
    };
  }

  if (normalityUnfavorable || qqUnfavorable || kernelUnfavorable) {
    return {
      seriesName,
      verdict: "non-compatible",
      conclusion:
        "Conclusión integrada: los indicadores disponibles no respaldan el supuesto de normalidad para esta serie.",
      sourceSummary,
    };
  }

  if (
    normalityFavorable &&
    qqFavorable &&
    visualFavorable &&
    sourceSummary.length >= 2
  ) {
    return {
      seriesName,
      verdict: "compatible",
      conclusion:
        "Conclusión integrada: SCI-11, Q-Q Plot, Violin Plot y KDE son coherentes con una distribución normal.",
      sourceSummary,
    };
  }

  if (normalityFavorable || qqFavorable || visualFavorable) {
    return {
      seriesName,
      verdict: "approximately-compatible",
      conclusion:
        "Conclusión integrada: la serie muestra compatibilidad parcial con normalidad; conviene validar con métodos complementarios.",
      sourceSummary,
    };
  }

  return {
    seriesName,
    verdict: "inconclusive",
    conclusion:
      "Conclusión integrada: no hay evidencia suficiente para emitir un veredicto definitivo de normalidad.",
    sourceSummary,
  };
};

const buildIntegratedNormalityAssessment = (
  normalityAnalyses: NormalityAnalysis[],
  qqPlotAnalyses: QQPlotAnalysis[],
  violinPlotAnalyses: ViolinPlotAnalysis[],
  kernelDensityAnalyses: KernelDensityAnalysis[]
): IntegratedNormalityAssessment => {
  const seriesNames = new Set<string>();
  normalityAnalyses.forEach((analysis) => seriesNames.add(analysis.seriesName));
  qqPlotAnalyses.forEach((analysis) => seriesNames.add(analysis.seriesName));
  violinPlotAnalyses.forEach((analysis) => seriesNames.add(analysis.seriesName));
  kernelDensityAnalyses.forEach((analysis) =>
    seriesNames.add(analysis.seriesName)
  );

  if (seriesNames.size === 0) {
    return {
      seriesAssessments: [],
      globalConclusion: [
        "No hay series disponibles para evaluar la coherencia de normalidad.",
      ],
      coherenceWarnings: [],
    };
  }

  const normalityByName = new Map(
    normalityAnalyses.map((analysis) => [analysis.seriesName, analysis])
  );
  const qqByName = new Map(
    qqPlotAnalyses.map((analysis) => [analysis.seriesName, analysis])
  );
  const violinByName = new Map(
    violinPlotAnalyses.map((analysis) => [analysis.seriesName, analysis])
  );
  const kdeByName = new Map(
    kernelDensityAnalyses.map((analysis) => [analysis.seriesName, analysis])
  );

  const seriesAssessments = Array.from(seriesNames).map((seriesName) =>
    assessIntegratedNormalityForSeries(
      normalityByName.get(seriesName),
      qqByName.get(seriesName),
      violinByName.get(seriesName),
      kdeByName.get(seriesName)
    )
  );

  const contradictoryCount = seriesAssessments.filter(
    (assessment) => assessment.verdict === "contradictory"
  ).length;
  const compatibleCount = seriesAssessments.filter(
    (assessment) => assessment.verdict === "compatible"
  ).length;
  const nonCompatibleCount = seriesAssessments.filter(
    (assessment) => assessment.verdict === "non-compatible"
  ).length;

  const globalConclusion: string[] = [];

  if (compatibleCount === seriesAssessments.length) {
    globalConclusion.push(
      "La evaluación integrada (SCI-11, SCI-21, SCI-22 y SCI-26) es coherente con normalidad en todas las series."
    );
  } else if (contradictoryCount > 0) {
    globalConclusion.push(
      `Se detectaron ${contradictoryCount} serie(s) con señales contradictorias entre normalidad estadística y diagnósticos visuales.`
    );
  } else if (nonCompatibleCount === seriesAssessments.length) {
    globalConclusion.push(
      "La evaluación integrada indica que ninguna serie cumple de forma consistente el supuesto de normalidad."
    );
  } else {
    globalConclusion.push(
      "La evaluación integrada muestra señales mixtas de normalidad entre series y métodos."
    );
  }

  const coherenceWarnings: string[] = [];
  seriesAssessments
    .filter((assessment) => assessment.verdict === "contradictory")
    .forEach((assessment) => {
      coherenceWarnings.push(
        `"${assessment.seriesName}": ${assessment.conclusion}`
      );
    });

  return {
    seriesAssessments,
    globalConclusion,
    coherenceWarnings,
  };
};

const getIntegratedNormalityInterpretationLines = (
  assessment: IntegratedNormalityAssessment
): string[] => {
  const lines = [...assessment.globalConclusion];

  assessment.coherenceWarnings.forEach((warning) => lines.push(warning));

  assessment.seriesAssessments.forEach((seriesAssessment) => {
    lines.push(
      `"${seriesAssessment.seriesName}": ${getIntegratedNormalityVerdictLabel(seriesAssessment.verdict)}.`
    );
    lines.push(seriesAssessment.conclusion);
    seriesAssessment.sourceSummary.forEach((sourceLine) => lines.push(sourceLine));
  });

  return lines;
};

const appendIntegratedNormalityFindings = (
  findings: string[],
  warnings: string[],
  assessment: IntegratedNormalityAssessment
) => {
  assessment.globalConclusion.forEach((line) => {
    if (!findings.includes(line)) findings.push(line);
  });

  assessment.coherenceWarnings.forEach((line) => {
    if (!warnings.includes(line)) warnings.push(line);
  });

  assessment.seriesAssessments.forEach((seriesAssessment) => {
    const finding = `"${seriesAssessment.seriesName}": ${seriesAssessment.conclusion}`;
    if (!findings.includes(finding)) findings.push(finding);

    if (seriesAssessment.verdict === "compatible") {
      const compatibleFinding =
        "Los indicadores integrados de normalidad son coherentes en esta serie.";
      if (!findings.includes(compatibleFinding)) findings.push(compatibleFinding);
    }

    if (seriesAssessment.verdict === "approximately-compatible") {
      const partialFinding =
        "La evaluación integrada sugiere compatibilidad parcial con normalidad.";
      if (!findings.includes(partialFinding)) findings.push(partialFinding);
    }
  });
};

const calculateQQPlot = (series: ExperimentalSeries): QQPlotAnalysis | null => {
  const sortedSample = getSeriesYValues(series).sort((left, right) => left - right);
  const sampleSize = sortedSample.length;

  if (sampleSize < 2) return null;

  const theoreticalValues: number[] = [];
  const points: QQPoint[] = [];

  for (let index = 0; index < sampleSize; index += 1) {
    const probability = (index + 0.5) / sampleSize;
    const theoretical = inverseNormalCDF(probability);
    if (theoretical == null || !Number.isFinite(theoretical)) return null;

    const sample = sortedSample[index];
    theoreticalValues.push(theoretical);
    points.push({ theoretical, sample });
  }

  const correlation = calculatePearsonCorrelation(
    theoreticalValues,
    sortedSample
  );
  if (correlation == null || !Number.isFinite(correlation)) return null;

  return {
    seriesName: series.name,
    sampleSize,
    correlation,
    interpretation: classifyQQPlotInterpretation(correlation),
    points,
  };
};

const calculateQQPlotsForSeries = (
  series: ExperimentalSeries[]
): QQPlotAnalysis[] =>
  series
    .map((item) => calculateQQPlot(item))
    .filter((analysis): analysis is QQPlotAnalysis => analysis !== null);

const getQQPlotAxisBounds = (points: QQPoint[]) => {
  if (points.length === 0) return null;

  const domainValues = points.flatMap((point) => [
    point.theoretical,
    point.sample,
  ]);
  const minValue = Math.min(...domainValues);
  const maxValue = Math.max(...domainValues);

  if (!Number.isFinite(minValue) || !Number.isFinite(maxValue)) return null;

  return { minValue, maxValue };
};

const formatNormalityMoment = (
  value: number,
  classification: NormalityClassification | null
) => (classification === null ? "N/A" : formatExperimentalStat(value));

const T_TEST_ALPHA = 0.05;

type TTestResult = {
  seriesA: string;
  seriesB: string;
  sampleSizeA: number;
  sampleSizeB: number;
  meanA: number;
  meanB: number;
  standardDeviationA: number;
  standardDeviationB: number;
  tStatistic: number;
  degreesOfFreedom: number;
  pValue: number;
  significant: boolean;
};

const getSeriesYValues = (series: ExperimentalSeries): number[] =>
  series.points
    .map((point) => point.y)
    .filter((value) => Number.isFinite(value));

const getSampleMeanAndStdDev = (values: number[]) => {
  const count = values.length;
  if (count === 0) return null;

  const mean = values.reduce((sum, value) => sum + value, 0) / count;
  if (count === 1) {
    return { mean, stdDev: 0, count };
  }

  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (count - 1);

  return { mean, stdDev: Math.sqrt(variance), count };
};

const logGamma = (value: number): number => {
  const coefficients = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.984369578019571e-6, 1.5056327351493116e-7,
  ];

  if (value < 0.5) {
    return (
      Math.log(Math.PI / Math.sin(Math.PI * value)) - logGamma(1 - value)
    );
  }

  let z = value - 1;
  let sum = coefficients[0];
  for (let index = 1; index < 9; index += 1) {
    sum += coefficients[index] / (z + index);
  }

  const t = z + 7.5;
  return (
    0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(sum)
  );
};

const betacf = (a: number, b: number, x: number): number => {
  const maxIterations = 200;
  const epsilon = 3e-7;
  let am = 1;
  let bm = 1;
  let az = 1;
  let bz = 1 - ((a + b) * x) / (a + 1);

  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    const em = iteration;
    const tem = em + em;
    let d =
      (em * (b - em) * x) / ((a + tem - 1) * (a + tem));
    let ap = az + d * am;
    let bp = bz + d * bm;
    d = (-(a + em) * (a + b + em) * x) / ((a + tem) * (a + tem + 1));
    az = ap + d * az;
    bz = bp + d * bz;
    am = ap;
    bm = bp;

    if (Math.abs(bz) > 1e-30) {
      am /= bz;
      az /= bz;
      bm = 1;
      bz = 1;
    }

    if (Math.abs(az) < epsilon * Math.abs(bz)) {
      return az / bz;
    }
  }

  return az / bz;
};

const regularizedIncompleteBeta = (
  a: number,
  b: number,
  x: number
): number => {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  const lnBeta = logGamma(a) + logGamma(b) - logGamma(a + b);
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lnBeta) / a;

  if (x < (a + 1) / (a + b + 2)) {
    return front * betacf(a, b, x);
  }

  return (
    1 -
    (Math.exp(Math.log(1 - x) * b + Math.log(x) * a - lnBeta) / b) *
      betacf(b, a, 1 - x)
  );
};

const approximateTwoTailedTPValue = (
  tStatistic: number,
  degreesOfFreedom: number
): number => {
  if (!Number.isFinite(tStatistic) || degreesOfFreedom <= 0) {
    return Number.NaN;
  }

  const absoluteT = Math.abs(tStatistic);
  if (absoluteT === 0) return 1;

  const x = degreesOfFreedom / (degreesOfFreedom + absoluteT * absoluteT);
  return regularizedIncompleteBeta(degreesOfFreedom / 2, 0.5, x);
};

const calculateIndependentTTest = (
  seriesA: ExperimentalSeries,
  seriesB: ExperimentalSeries
): TTestResult | null => {
  const statsA = getSampleMeanAndStdDev(getSeriesYValues(seriesA));
  const statsB = getSampleMeanAndStdDev(getSeriesYValues(seriesB));

  if (!statsA || !statsB || statsA.count < 2 || statsB.count < 2) {
    return null;
  }

  const sampleSizeA = statsA.count;
  const sampleSizeB = statsB.count;
  const degreesOfFreedom = sampleSizeA + sampleSizeB - 2;

  if (degreesOfFreedom <= 0) return null;

  const varianceA = statsA.stdDev ** 2;
  const varianceB = statsB.stdDev ** 2;
  const pooledVariance =
    ((sampleSizeA - 1) * varianceA + (sampleSizeB - 1) * varianceB) /
    degreesOfFreedom;

  if (pooledVariance === 0) return null;

  const tStatistic =
    (statsA.mean - statsB.mean) /
    Math.sqrt(pooledVariance * (1 / sampleSizeA + 1 / sampleSizeB));
  const pValue = approximateTwoTailedTPValue(tStatistic, degreesOfFreedom);

  if (!Number.isFinite(pValue)) return null;

  return {
    seriesA: seriesA.name,
    seriesB: seriesB.name,
    sampleSizeA,
    sampleSizeB,
    meanA: statsA.mean,
    meanB: statsB.mean,
    standardDeviationA: statsA.stdDev,
    standardDeviationB: statsB.stdDev,
    tStatistic,
    degreesOfFreedom,
    pValue,
    significant: pValue < T_TEST_ALPHA,
  };
};

const resolveTTestSeriesSelection = (
  series: ExperimentalSeries[],
  selectedId: string | null,
  fallbackIndex: number,
  excludedId?: string | null
): ExperimentalSeries | null => {
  if (series.length === 0) return null;

  if (selectedId) {
    const selected = series.find((item) => item.id === selectedId);
    if (selected && selected.id !== excludedId) return selected;
  }

  return (
    series.find((item, index) => index >= fallbackIndex && item.id !== excludedId) ??
    series.find((item) => item.id !== excludedId) ??
    null
  );
};

const formatPValue = (pValue: number) =>
  pValue < 0.0001 ? "< 0.0001" : pValue.toFixed(4);

const getTTestBadge = (result: TTestResult) =>
  result.significant
    ? "🟢 Diferencia significativa"
    : "⚪ Sin diferencia significativa";

const getTTestInterpretation = (result: TTestResult) =>
  result.significant
    ? "Diferencia estadísticamente significativa entre las medias."
    : "No se detectó diferencia significativa.";

const ANOVA_ALPHA = 0.05;

type AnovaResult = {
  groupCount: number;
  totalSampleSize: number;
  betweenGroupsSS: number;
  withinGroupsSS: number;
  totalSS: number;
  betweenGroupsDF: number;
  withinGroupsDF: number;
  totalDF: number;
  meanSquareBetween: number;
  meanSquareWithin: number;
  fStatistic: number;
  pValue: number;
  significant: boolean;
};

type AnovaGroupSummary = {
  seriesId: string;
  seriesName: string;
  sampleSize: number;
  mean: number;
  standardDeviation: number;
};

type AnovaAnalysis = {
  result: AnovaResult;
  groups: AnovaGroupSummary[];
};

const approximateUpperTailFPValue = (
  fStatistic: number,
  dfBetween: number,
  dfWithin: number
): number => {
  if (
    !Number.isFinite(fStatistic) ||
    fStatistic < 0 ||
    dfBetween <= 0 ||
    dfWithin <= 0
  ) {
    return Number.NaN;
  }

  if (fStatistic === 0) return 1;

  const x = (dfBetween * fStatistic) / (dfBetween * fStatistic + dfWithin);
  const cumulativeProbability = regularizedIncompleteBeta(
    dfBetween / 2,
    dfWithin / 2,
    x
  );

  return 1 - cumulativeProbability;
};

const calculateOneWayAnova = (
  series: ExperimentalSeries[]
): AnovaAnalysis | null => {
  const groups = series
    .map((item) => {
      const values = getSeriesYValues(item);
      const stats = getSampleMeanAndStdDev(values);
      if (!stats || stats.count === 0) return null;

      return {
        seriesId: item.id,
        seriesName: item.name,
        values,
        sampleSize: stats.count,
        mean: stats.mean,
        standardDeviation: stats.stdDev,
      };
    })
    .filter((group): group is NonNullable<typeof group> => group !== null);

  const groupCount = groups.length;
  if (groupCount < 3) return null;

  const totalSampleSize = groups.reduce(
    (sum, group) => sum + group.sampleSize,
    0
  );
  const betweenGroupsDF = groupCount - 1;
  const withinGroupsDF = totalSampleSize - groupCount;
  const totalDF = totalSampleSize - 1;

  if (withinGroupsDF <= 0) return null;

  const allValues = groups.flatMap((group) => group.values);
  const grandMean =
    allValues.reduce((sum, value) => sum + value, 0) / totalSampleSize;
  const betweenGroupsSS = groups.reduce(
    (sum, group) =>
      sum + group.sampleSize * (group.mean - grandMean) ** 2,
    0
  );
  const withinGroupsSS = groups.reduce(
    (sum, group) =>
      sum +
      group.values.reduce(
        (innerSum, value) => innerSum + (value - group.mean) ** 2,
        0
      ),
    0
  );
  const totalSS = allValues.reduce(
    (sum, value) => sum + (value - grandMean) ** 2,
    0
  );

  if (withinGroupsSS === 0) return null;

  const meanSquareBetween = betweenGroupsSS / betweenGroupsDF;
  const meanSquareWithin = withinGroupsSS / withinGroupsDF;
  const fStatistic = meanSquareBetween / meanSquareWithin;
  const pValue = approximateUpperTailFPValue(
    fStatistic,
    betweenGroupsDF,
    withinGroupsDF
  );

  if (!Number.isFinite(pValue)) return null;

  return {
    result: {
      groupCount,
      totalSampleSize,
      betweenGroupsSS,
      withinGroupsSS,
      totalSS,
      betweenGroupsDF,
      withinGroupsDF,
      totalDF,
      meanSquareBetween,
      meanSquareWithin,
      fStatistic,
      pValue,
      significant: pValue < ANOVA_ALPHA,
    },
    groups: groups.map(
      ({ seriesId, seriesName, sampleSize, mean, standardDeviation }) => ({
        seriesId,
        seriesName,
        sampleSize,
        mean,
        standardDeviation,
      })
    ),
  };
};

const getAnovaBadge = (result: AnovaResult) =>
  result.significant
    ? "🟢 Diferencias significativas detectadas"
    : "⚪ No se detectaron diferencias significativas";

const getAnovaInterpretation = (result: AnovaResult) =>
  result.significant
    ? "Al menos una media difiere significativamente del resto."
    : "No se detectan diferencias estadísticamente significativas entre las medias.";

const TUKEY_HSD_Q_CRITICAL = 3.314;

type PostHocComparison = {
  seriesA: string;
  seriesB: string;
  meanDifference: number;
  standardError: number;
  qStatistic: number;
  significant: boolean;
};

const calculateTukeyComparisons = (
  analysis: AnovaAnalysis
): PostHocComparison[] => {
  const meanSquareWithin = analysis.result.meanSquareWithin;
  if (meanSquareWithin <= 0) return [];

  const comparisons: PostHocComparison[] = [];

  for (let indexA = 0; indexA < analysis.groups.length; indexA += 1) {
    for (let indexB = indexA + 1; indexB < analysis.groups.length; indexB += 1) {
      const groupA = analysis.groups[indexA];
      const groupB = analysis.groups[indexB];
      const meanDifference = groupA.mean - groupB.mean;
      const standardError = Math.sqrt(
        (meanSquareWithin / 2) *
          (1 / groupA.sampleSize + 1 / groupB.sampleSize)
      );

      if (standardError === 0) continue;

      const qStatistic = Math.abs(meanDifference) / standardError;

      comparisons.push({
        seriesA: groupA.seriesName,
        seriesB: groupB.seriesName,
        meanDifference,
        standardError,
        qStatistic,
        significant: qStatistic > TUKEY_HSD_Q_CRITICAL,
      });
    }
  }

  return comparisons;
};

const getPostHocComparisonResultLabel = (significant: boolean) =>
  significant
    ? "🟢 Diferencia significativa"
    : "⚪ No significativa";

const buildPostHocSummary = (comparisons: PostHocComparison[]): string => {
  const significantPairs = comparisons.filter((comparison) => comparison.significant);

  if (significantPairs.length === 0) {
    return "No se detectaron diferencias significativas entre pares.";
  }

  const pairDescriptions = significantPairs.map(
    (comparison) => `${comparison.seriesA} y ${comparison.seriesB}`
  );

  if (pairDescriptions.length === 1) {
    return `Las diferencias significativas se detectaron entre ${pairDescriptions[0]}.`;
  }

  const lastPair = pairDescriptions.pop();
  return `Las diferencias significativas se detectaron entre ${pairDescriptions.join(", ")}, y entre ${lastPair}.`;
};

const NON_PARAMETRIC_ALPHA = 0.05;

type NonParametricMode = "mann-whitney" | "kruskal-wallis";

type MannWhitneyResult = {
  seriesA: string;
  seriesB: string;
  sampleSizeA: number;
  sampleSizeB: number;
  uStatistic: number;
  zScore: number;
  pValue: number;
  significant: boolean;
};

type KruskalWallisResult = {
  groupCount: number;
  totalSampleSize: number;
  hStatistic: number;
  degreesOfFreedom: number;
  pValue: number;
  significant: boolean;
};

type PooledRankEntry = {
  value: number;
  group: number;
  rank: number;
};

const assignPooledRanks = (
  entries: { value: number; group: number }[]
): PooledRankEntry[] => {
  const ranked = entries.map((entry) => ({ ...entry, rank: 0 }));
  ranked.sort((left, right) => left.value - right.value);

  let start = 0;
  while (start < ranked.length) {
    let end = start;
    while (
      end + 1 < ranked.length &&
      ranked[end + 1].value === ranked[start].value
    ) {
      end += 1;
    }

    const averageRank = (start + end + 2) / 2;
    for (let index = start; index <= end; index += 1) {
      ranked[index].rank = averageRank;
    }
    start = end + 1;
  }

  return ranked;
};

const approximateStandardNormalCdf = (z: number): number => {
  const absoluteZ = Math.abs(z);
  const t = 1 / (1 + 0.2316419 * absoluteZ);
  const density = 0.3989423 * Math.exp((-absoluteZ * absoluteZ) / 2);
  const probability =
    density *
    t *
    (0.3193815 +
      t *
        (-0.3565638 +
          t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z >= 0 ? 1 - probability : probability;
};

const approximateTwoTailedNormalPValue = (zScore: number): number => {
  if (!Number.isFinite(zScore)) return Number.NaN;
  const absoluteZ = Math.abs(zScore);
  return 2 * (1 - approximateStandardNormalCdf(absoluteZ));
};

const regularizedLowerIncompleteGamma = (shape: number, x: number): number => {
  if (x <= 0) return 0;

  let term = 1 / shape;
  let sum = term;

  for (let index = 1; index < 200; index += 1) {
    term *= x / (shape + index);
    sum += term;
    if (Math.abs(term) < 1e-12 * Math.abs(sum)) break;
  }

  return Math.exp(-x + shape * Math.log(x) - logGamma(shape)) * sum;
};

const approximateUpperTailChiSquarePValue = (
  chiSquare: number,
  degreesOfFreedom: number
): number => {
  if (!Number.isFinite(chiSquare) || chiSquare < 0 || degreesOfFreedom <= 0) {
    return Number.NaN;
  }

  const cumulativeProbability = regularizedLowerIncompleteGamma(
    degreesOfFreedom / 2,
    chiSquare / 2
  );

  return Math.max(0, Math.min(1, 1 - cumulativeProbability));
};

const calculateMannWhitney = (
  seriesA: ExperimentalSeries,
  seriesB: ExperimentalSeries
): MannWhitneyResult | null => {
  const valuesA = getSeriesYValues(seriesA);
  const valuesB = getSeriesYValues(seriesB);
  const sampleSizeA = valuesA.length;
  const sampleSizeB = valuesB.length;

  if (sampleSizeA === 0 || sampleSizeB === 0) return null;

  const ranked = assignPooledRanks([
    ...valuesA.map((value) => ({ value, group: 0 })),
    ...valuesB.map((value) => ({ value, group: 1 })),
  ]);

  const rankSumA = ranked
    .filter((entry) => entry.group === 0)
    .reduce((sum, entry) => sum + entry.rank, 0);
  const u1 =
    sampleSizeA * sampleSizeB +
    (sampleSizeA * (sampleSizeA + 1)) / 2 -
    rankSumA;
  const u2 = sampleSizeA * sampleSizeB - u1;
  const uStatistic = Math.min(u1, u2);

  const meanU = (sampleSizeA * sampleSizeB) / 2;
  const standardErrorU = Math.sqrt(
    (sampleSizeA * sampleSizeB * (sampleSizeA + sampleSizeB + 1)) / 12
  );

  if (standardErrorU === 0) return null;

  const zScore = (uStatistic - meanU) / standardErrorU;
  const pValue = approximateTwoTailedNormalPValue(zScore);

  if (!Number.isFinite(pValue)) return null;

  return {
    seriesA: seriesA.name,
    seriesB: seriesB.name,
    sampleSizeA,
    sampleSizeB,
    uStatistic,
    zScore,
    pValue,
    significant: pValue < NON_PARAMETRIC_ALPHA,
  };
};

const calculateKruskalWallis = (
  series: ExperimentalSeries[]
): KruskalWallisResult | null => {
  const groups = series
    .map((item, groupIndex) => ({
      values: getSeriesYValues(item),
      groupIndex,
    }))
    .filter((group) => group.values.length > 0);

  const groupCount = groups.length;
  if (groupCount < 3) return null;

  const ranked = assignPooledRanks(
    groups.flatMap((group) =>
      group.values.map((value) => ({ value, group: group.groupIndex }))
    )
  );
  const totalSampleSize = ranked.length;
  const rankSums = new Array<number>(groupCount).fill(0);
  const groupSizes = new Array<number>(groupCount).fill(0);

  ranked.forEach((entry) => {
    rankSums[entry.group] += entry.rank;
    groupSizes[entry.group] += 1;
  });

  let hStatistic = 0;
  for (let index = 0; index < groupCount; index += 1) {
    if (groupSizes[index] === 0) return null;
    hStatistic += (rankSums[index] ** 2) / groupSizes[index];
  }

  hStatistic =
    (12 / (totalSampleSize * (totalSampleSize + 1))) * hStatistic -
    3 * (totalSampleSize + 1);

  const degreesOfFreedom = groupCount - 1;
  const pValue = approximateUpperTailChiSquarePValue(
    hStatistic,
    degreesOfFreedom
  );

  if (!Number.isFinite(pValue)) return null;

  return {
    groupCount,
    totalSampleSize,
    hStatistic,
    degreesOfFreedom,
    pValue,
    significant: pValue < NON_PARAMETRIC_ALPHA,
  };
};

const getNonParametricBadge = (significant: boolean) =>
  significant
    ? "🟢 Diferencia significativa"
    : "⚪ Sin diferencia significativa";

const getNonParametricRecommendation = (
  analyses: NormalityAnalysis[],
  seriesNames: string[]
): string => {
  const relevant = analyses.filter((item) =>
    seriesNames.includes(item.seriesName)
  );
  const allClearlyNormal =
    relevant.length > 0 &&
    relevant.every((item) => item.classification === "normal");

  if (allClearlyNormal) {
    return "Considere también pruebas paramétricas para comparación.";
  }

  return "Esta prueba es apropiada para datos que no cumplen supuestos de normalidad.";
};

type StatisticalRecommendationConfidence = "high" | "medium" | "low";

type StatisticalRecommendation = {
  recommendedTest: string;
  confidence: StatisticalRecommendationConfidence;
  reasoning: string[];
  assumptionsPassed: string[];
  assumptionsFailed: string[];
  warnings: string[];
};

type ScientificReportSection = {
  title: string;
  content: string[];
};

type ScientificReport = {
  title: string;
  generatedAt: string;
  summary: string;
  sections: ScientificReportSection[];
};

const getStatisticalAdvisorConfidenceLabel = (
  confidence: StatisticalRecommendationConfidence
) =>
  confidence === "high" ? "Alta" : confidence === "medium" ? "Media" : "Baja";

const buildStatisticalRecommendation = (
  series: ExperimentalSeries[],
  normalityAnalyses: NormalityAnalysis[],
  correlationRequested: boolean
): StatisticalRecommendation | null => {
  const groupCount = series.length;
  const totalSampleSize = series.reduce(
    (sum, item) => sum + getSeriesYValues(item).length,
    0
  );

  if (groupCount === 0 || totalSampleSize === 0) return null;

  const seriesNames = series.map((item) => item.name);
  const relevantNormality = normalityAnalyses.filter((item) =>
    seriesNames.includes(item.seriesName)
  );

  const allNormal =
    relevantNormality.length === groupCount &&
    relevantNormality.every(
      (item) =>
        item.classification === "normal" ||
        item.classification === "approximately-normal"
    );
  const anyNonNormal = relevantNormality.some(
    (item) =>
      item.classification === "non-normal" || item.classification === null
  );

  const confidence: StatisticalRecommendationConfidence =
    totalSampleSize >= 30 ? "high" : totalSampleSize >= 15 ? "medium" : "low";

  const assumptionsPassed: string[] = [];
  const assumptionsFailed: string[] = [];
  const warnings: string[] = [];
  const reasoning: string[] = [];

  if (groupCount >= 2) {
    assumptionsPassed.push("Número suficiente de grupos");
  } else {
    assumptionsFailed.push("Número suficiente de grupos");
  }

  if (allNormal && !anyNonNormal) {
    assumptionsPassed.push("Normalidad");
  } else {
    assumptionsFailed.push("Normalidad no cumplida");
  }

  if (totalSampleSize >= 15) {
    assumptionsPassed.push("Tamaño muestral adecuado");
  } else {
    assumptionsFailed.push("Muestras pequeñas");
    warnings.push("Las muestras son pequeñas.");
  }

  if (anyNonNormal) {
    warnings.push("Una serie presenta distribución no normal.");
  }

  if (confidence === "low") {
    warnings.push("Los resultados deben interpretarse con cautela.");
  }

  let recommendedTest = "";

  if (correlationRequested && groupCount >= 2) {
    recommendedTest = allNormal && !anyNonNormal ? "Pearson" : "Spearman";
    reasoning.push(
      allNormal && !anyNonNormal
        ? "Se recomienda Pearson porque se solicitó correlación y las series visibles cumplen supuestos de normalidad."
        : "Se recomienda Spearman porque se solicitó correlación y una o más series no cumplen normalidad."
    );
  } else if (groupCount === 2) {
    if (allNormal && !anyNonNormal) {
      recommendedTest = "t-Test";
      reasoning.push(
        "Se recomienda t-Test porque existen dos grupos visibles y ambos presentan distribución compatible con la normalidad."
      );
    } else {
      recommendedTest = "Mann-Whitney U";
      reasoning.push(
        "Se recomienda Mann-Whitney debido a que una o más series no cumplen supuestos de normalidad."
      );
    }
  } else if (groupCount >= 3) {
    if (allNormal && !anyNonNormal) {
      recommendedTest = "ANOVA";
      reasoning.push(
        `Se recomienda utilizar ANOVA porque existen ${groupCount} grupos visibles y todos presentan una distribución aproximadamente normal.`
      );
    } else {
      recommendedTest = "Kruskal-Wallis";
      reasoning.push(
        `Se recomienda Kruskal-Wallis porque existen ${groupCount} grupos visibles y al menos una serie no cumple normalidad.`
      );
    }
  } else {
    return null;
  }

  return {
    recommendedTest,
    confidence,
    reasoning,
    assumptionsPassed,
    assumptionsFailed,
    warnings: [...new Set(warnings)],
  };
};

const formatScientificReportDate = (isoDate: string) => {
  try {
    return new Date(isoDate).toLocaleString();
  } catch {
    return isoDate;
  }
};

const formatScientificReportAsText = (report: ScientificReport): string => {
  const lines = [
    report.title,
    `Generado: ${formatScientificReportDate(report.generatedAt)}`,
    "",
    "=== Resumen ejecutivo ===",
    report.summary,
    "",
  ];

  report.sections.forEach((section) => {
    lines.push(`=== ${section.title} ===`);
    section.content.forEach((line) => lines.push(line));
    lines.push("");
  });

  return lines.join("\n");
};

const PDF_MARGIN_MM = 20;
const PDF_PAGE_WIDTH_MM = 210;
const PDF_PAGE_HEIGHT_MM = 297;
const PDF_CONTENT_WIDTH_MM = PDF_PAGE_WIDTH_MM - PDF_MARGIN_MM * 2;
const PDF_BODY_BOTTOM_MM = PDF_PAGE_HEIGHT_MM - PDF_MARGIN_MM - 15;

const getScientificReportPdfFileName = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `scientific-report-${year}-${month}-${day}.pdf`;
};

type ImportedDatasetInfo = {
  fileName: string;
  importedAt: string;
  seriesCount: number;
  observationCount: number;
};

type ScientificReportPdfInput = {
  report: ScientificReport;
  chartImageDataUrl: string | null;
  statisticalRecommendation: StatisticalRecommendation | null;
  datasetInfo?: ImportedDatasetInfo | null;
};

const buildAdvisorPdfSectionLines = (
  recommendation: StatisticalRecommendation | null
): string[] => {
  if (!recommendation) {
    return [
      "No hay información suficiente para generar una recomendación estadística.",
    ];
  }

  const lines = [
    `Prueba recomendada: ${recommendation.recommendedTest}`,
    `Nivel de confianza: ${getStatisticalAdvisorConfidenceLabel(recommendation.confidence)}`,
  ];

  if (recommendation.assumptionsPassed.length > 0) {
    lines.push("Supuestos cumplidos:");
    recommendation.assumptionsPassed.forEach((assumption) =>
      lines.push(`✓ ${assumption}`)
    );
  }

  if (recommendation.assumptionsFailed.length > 0) {
    lines.push("Supuestos incumplidos:");
    recommendation.assumptionsFailed.forEach((assumption) =>
      lines.push(`✗ ${assumption}`)
    );
  }

  if (recommendation.warnings.length > 0) {
    lines.push("Advertencias:");
    recommendation.warnings.forEach((warning) => lines.push(warning));
  }

  if (recommendation.reasoning.length > 0) {
    lines.push("Justificación automática:");
    recommendation.reasoning.forEach((reason) => lines.push(reason));
  }

  return lines;
};

const exportScientificReportPdf = async (
  input: ScientificReportPdfInput
): Promise<void> => {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const footerTimestamp = new Date().toLocaleString();
  let cursorY = PDF_MARGIN_MM;

  const addPageIfNeeded = (requiredHeightMm: number) => {
    if (cursorY + requiredHeightMm > PDF_BODY_BOTTOM_MM) {
      doc.addPage();
      cursorY = PDF_MARGIN_MM;
    }
  };

  const drawWrappedParagraph = (
    text: string,
    fontSizePt: number,
    fontStyle: "normal" | "bold" = "normal",
    lineSpacingMm = 1.5
  ) => {
    doc.setFont("helvetica", fontStyle);
    doc.setFontSize(fontSizePt);
    const lineHeightMm = fontSizePt * 0.3528 + lineSpacingMm;
    const wrappedLines = doc.splitTextToSize(
      text,
      PDF_CONTENT_WIDTH_MM
    ) as string[];
    const blockHeight = wrappedLines.length * lineHeightMm;
    addPageIfNeeded(blockHeight);
    doc.text(wrappedLines, PDF_MARGIN_MM, cursorY);
    cursorY += blockHeight;
  };

  const drawSectionHeading = (heading: string) => {
    addPageIfNeeded(10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(heading, PDF_MARGIN_MM, cursorY);
    cursorY += 7;
  };

  const drawReportSection = (section: ScientificReportSection) => {
    drawSectionHeading(section.title);
    section.content.forEach((line) => {
      drawWrappedParagraph(line, 11, "normal");
      cursorY += 1;
    });
    cursorY += 3;
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  addPageIfNeeded(12);
  const titleLines = doc.splitTextToSize(
    input.report.title,
    PDF_CONTENT_WIDTH_MM
  ) as string[];
  doc.text(titleLines, PDF_MARGIN_MM, cursorY);
  cursorY += titleLines.length * 8 + 2;

  drawWrappedParagraph(
    `Fecha: ${formatScientificReportDate(input.report.generatedAt)}`,
    11,
    "normal"
  );
  if (input.datasetInfo) {
    drawWrappedParagraph(`Dataset: ${input.datasetInfo.fileName}`, 11, "normal");
  }
  cursorY += 2;

  drawSectionHeading("Resumen ejecutivo");
  drawWrappedParagraph(input.report.summary, 11, "normal");
  cursorY += 4;

  if (input.chartImageDataUrl) {
    drawSectionHeading("Gráfico principal");
    try {
      const imageFormat = input.chartImageDataUrl.includes("image/jpeg")
        ? "JPEG"
        : "PNG";
      const imageProps = doc.getImageProperties(input.chartImageDataUrl);
      const maxChartHeightMm = 100;
      let displayWidthMm = PDF_CONTENT_WIDTH_MM;
      let displayHeightMm =
        (imageProps.height / imageProps.width) * displayWidthMm;

      if (displayHeightMm > maxChartHeightMm) {
        displayHeightMm = maxChartHeightMm;
        displayWidthMm =
          (imageProps.width / imageProps.height) * displayHeightMm;
      }

      addPageIfNeeded(displayHeightMm + 4);
      doc.addImage(
        input.chartImageDataUrl,
        imageFormat,
        PDF_MARGIN_MM,
        cursorY,
        displayWidthMm,
        displayHeightMm
      );
      cursorY += displayHeightMm + 6;
    } catch {
      // continuar sin gráfico si la imagen no es válida
    }
  }

  doc.addPage();
  cursorY = PDF_MARGIN_MM;

  input.report.sections.forEach((section) => {
    drawReportSection(section);
  });

  drawSectionHeading("Advisor Estadístico");
  buildAdvisorPdfSectionLines(input.statisticalRecommendation).forEach(
    (line) => {
      drawWrappedParagraph(line, 11, "normal");
      cursorY += 1;
    }
  );

  const pageCount = doc.getNumberOfPages();
  for (let pageIndex = 1; pageIndex <= pageCount; pageIndex += 1) {
    doc.setPage(pageIndex);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(90, 90, 90);
    doc.text(
      "Generado por: Scientific Graph Platform",
      PDF_MARGIN_MM,
      PDF_PAGE_HEIGHT_MM - 12
    );
    doc.text(footerTimestamp, PDF_MARGIN_MM, PDF_PAGE_HEIGHT_MM - 8);
    doc.setTextColor(0, 0, 0);
  }

  doc.save(getScientificReportPdfFileName());
};

const generateScientificReport = (input: {
  graphTitle: string;
  series: ExperimentalSeries[];
  experimentalStatistics: ExperimentalStatistics[];
  normalityAnalyses: NormalityAnalysis[];
  qqPlotAnalyses: QQPlotAnalysis[];
  violinPlotAnalyses: ViolinPlotAnalysis[];
  correlationHeatmap: HeatmapAnalysis | null;
  valuesHeatmap: HeatmapAnalysis | null;
  bubblePlotAnalysis: BubblePlotAnalysis | null;
  radarPlotAnalysis: RadarPlotAnalysis | null;
  kernelDensityAnalyses: KernelDensityAnalysis[];
  forestPlotAnalysis: ForestPlotAnalysis | null;
  pcaAnalysis: PCAAnalysis | null;
  pcaObservationCount: number;
  hierarchicalClusteringAnalysis: HierarchicalClusteringAnalysis | null;
  scatterMatrixAnalysis: ScatterMatrixAnalysis | null;
  parallelCoordinatesAnalysis: ParallelCoordinatesAnalysis | null;
  correlationNetworkAnalysis: CorrelationNetworkAnalysis | null;
  mdsAnalysis: MDSAnalysis | null;
  distanceMatrixAnalysis: DistanceMatrixAnalysis | null;
  similarityNetworkAnalysis: SimilarityNetworkAnalysis | null;
  variableImportanceAnalysis: VariableImportanceAnalysis | null;
  clusterHeatmapAnalysis: ClusterHeatmapAnalysis | null;
  clusteredDistanceHeatmapAnalysis: ClusteredDistanceHeatmapAnalysis | null;
  multivariateDashboardAnalysis: MultivariateDashboardAnalysis | null;
  manovaExplorerAnalysis: ManovaExplorerAnalysis | null;
  ldaExplorerAnalysis: LdaExplorerAnalysis | null;
  canonicalCorrelationExplorerAnalysis: CanonicalCorrelationExplorerAnalysis | null;
  pcrExplorerAnalysis: PcrExplorerAnalysis | null;
  correlationAnalysis: {
    results: CorrelationResult[];
    unavailablePairs: CorrelationUnavailablePair[];
    matrix: CorrelationMatrixRow[];
  };
  correlationMethod: CorrelationMethod;
  experimentalOutliers: ExperimentalOutlier[];
  outlierMethod: OutlierMethod;
  tTestResult: TTestResult | null;
  anovaAnalysis: AnovaAnalysis | null;
  postHocComparisons: PostHocComparison[];
  mannWhitneyResult: MannWhitneyResult | null;
  kruskalWallisResult: KruskalWallisResult | null;
  statisticalRecommendation: StatisticalRecommendation | null;
  datasetInfo?: ImportedDatasetInfo | null;
}): ScientificReport | null => {
  const seriesCount = input.series.length;
  const totalObservations = input.series.reduce(
    (sum, item) => sum + getSeriesYValues(item).length,
    0
  );

  if (seriesCount === 0 || totalObservations === 0) return null;

  const reportTitle = input.graphTitle.trim() || "Reporte científico";
  const generatedAt = new Date().toISOString();
  const sections: ScientificReportSection[] = [];
  const summaryLines: string[] = [];

  summaryLines.push(
    `Se analizaron ${seriesCount} series experimentales con un total de ${totalObservations} observaciones.`
  );

  const dataLines = [
    ...(input.datasetInfo
      ? [`Dataset analizado: ${input.datasetInfo.fileName}`]
      : []),
    `Número de series visibles: ${seriesCount}.`,
    `Número total de observaciones: ${totalObservations}.`,
    ...input.series.map((item) => {
      const count = getSeriesYValues(item).length;
      return `Serie "${item.name}": ${count} observaciones.`;
    }),
  ];

  if (input.experimentalStatistics.length > 0) {
    dataLines.push("Estadística descriptiva por serie:");
    input.experimentalStatistics.forEach((stats) => {
      dataLines.push(
        `"${stats.seriesName}": media Y = ${formatExperimentalStat(stats.meanY)}, SD = ${formatExperimentalStat(stats.stdDevY)}, N = ${stats.count}.`
      );
    });
  }

  sections.push({ title: "Descripción de datos", content: dataLines });

  const normalityLines: string[] = [];
  if (input.normalityAnalyses.length === 0) {
    normalityLines.push("No hay series disponibles para evaluar normalidad.");
  } else {
    const allNormal = input.normalityAnalyses.every(
      (analysis) =>
        analysis.classification === "normal" ||
        analysis.classification === "approximately-normal"
    );
    const anyNonNormal = input.normalityAnalyses.some(
      (analysis) =>
        analysis.classification === "non-normal" || analysis.classification === null
    );

    if (allNormal && !anyNonNormal) {
      normalityLines.push(
        "Las distribuciones fueron compatibles con normalidad."
      );
      summaryLines.push(
        "Las distribuciones fueron compatibles con normalidad."
      );
    } else {
      normalityLines.push(
        "Al menos una serie no cumple supuestos de normalidad."
      );
      summaryLines.push(
        "Se detectaron desviaciones respecto a la normalidad en una o más series."
      );
    }

    input.normalityAnalyses.forEach((analysis) => {
      normalityLines.push(
        `"${analysis.seriesName}" (N=${analysis.sampleSize}): ${getNormalityClassificationLabel(analysis.classification)} (confianza ${getNormalityConfidenceLabel(analysis.confidence)}).`
      );
    });
  }

  sections.push({ title: "Normalidad", content: normalityLines });

  sections.push({
    title: "Consenso de normalidad",
    content: getNormalityConsensusReportLines(
      buildNormalityConsensus(
        input.normalityAnalyses,
        input.qqPlotAnalyses,
        input.violinPlotAnalyses,
        input.kernelDensityAnalyses
      )
    ),
  });

  sections.push({
    title: "Coherencia de normalidad",
    content: getIntegratedNormalityInterpretationLines(
      buildIntegratedNormalityAssessment(
        input.normalityAnalyses,
        input.qqPlotAnalyses,
        input.violinPlotAnalyses,
        input.kernelDensityAnalyses
      )
    ),
  });

  const qqPlotLines: string[] = [];
  if (input.qqPlotAnalyses.length === 0) {
    qqPlotLines.push(
      "No hay datos suficientes para generar un Q-Q Plot por serie."
    );
  } else {
    input.qqPlotAnalyses.forEach((analysis) => {
      qqPlotLines.push(
        `"${analysis.seriesName}" (N=${analysis.sampleSize}): r = ${analysis.correlation.toFixed(4)}, ${getQQPlotInterpretationLabel(analysis.interpretation)}.`
      );
      qqPlotLines.push(getQQPlotInterpretationMessage(analysis.interpretation));
    });
  }
  sections.push({ title: "Q-Q Plot", content: qqPlotLines });

  const violinPlotLines: string[] = [];
  if (input.violinPlotAnalyses.length === 0) {
    violinPlotLines.push(
      "No hay datos suficientes para generar un Violin Plot por serie."
    );
  } else {
    input.violinPlotAnalyses.forEach((analysis) => {
      const spread = analysis.q3 - analysis.q1;
      violinPlotLines.push(
        `"${analysis.seriesName}" (N=${analysis.sampleSize}): ${getViolinShapeInterpretationMessage(analysis.shapeInterpretation)} Rango [${formatExperimentalStat(analysis.min)}, ${formatExperimentalStat(analysis.max)}], IQR = ${formatExperimentalStat(spread)}.`
      );
    });
  }
  sections.push({ title: "Violin Plot", content: violinPlotLines });

  const heatmapLines: string[] = [];
  if (!input.correlationHeatmap && !input.valuesHeatmap) {
    heatmapLines.push("No hay datos suficientes para generar un Heatmap.");
  } else {
    if (input.correlationHeatmap) {
      heatmapLines.push(
        ...getHeatmapInterpretationLines(input.correlationHeatmap)
      );
    }
    if (input.valuesHeatmap) {
      heatmapLines.push(
        ...getHeatmapInterpretationLines(input.valuesHeatmap)
      );
    }
  }
  sections.push({ title: "Heatmap", content: heatmapLines });

  const bubblePlotLines = getBubblePlotInterpretationLines(
    input.bubblePlotAnalysis,
    input.experimentalOutliers.length
  );
  sections.push({ title: "Bubble Plot", content: bubblePlotLines });

  const radarPlotLines = getRadarPlotInterpretationLines(input.radarPlotAnalysis);
  sections.push({ title: "Radar Plot", content: radarPlotLines });

  sections.push({
    title: "Kernel Density Plot",
    content: getKernelDensityInterpretationLines(input.kernelDensityAnalyses),
  });

  sections.push({
    title: "Forest Plot",
    content: getForestPlotInterpretationLines(input.forestPlotAnalysis),
  });

  sections.push({
    title: "PCA",
    content: getPCAInterpretationLines(
      input.pcaAnalysis,
      input.pcaObservationCount,
      seriesCount
    ),
  });

  sections.push({
    title: "PCA Loadings",
    content: getPCALoadingsInterpretationLines(input.pcaAnalysis),
  });

  sections.push({
    title: "Scatter Matrix",
    content: getScatterMatrixReportLines(input.scatterMatrixAnalysis),
  });

  sections.push({
    title: "Parallel Coordinates Plot",
    content: getParallelCoordinatesReportLines(input.parallelCoordinatesAnalysis),
  });

  sections.push({
    title: "Correlation Network",
    content: getCorrelationNetworkReportLines(input.correlationNetworkAnalysis),
  });

  sections.push({
    title: "MDS",
    content: getMDSReportLines(input.mdsAnalysis),
  });

  sections.push({
    title: "Distance Matrix",
    content: deduplicateTextLines([
      ...getDistanceMatrixReportLines(input.distanceMatrixAnalysis),
      ...(input.clusterHeatmapAnalysis
        ? [
            "La intensidad de color refleja las distancias observadas entre variables.",
          ]
        : []),
      ...(input.clusteredDistanceHeatmapAnalysis
        ? [
            "Las distancias mostradas corresponden a la matriz utilizada por el clustering.",
          ]
        : []),
    ]),
  });

  sections.push({
    title: "Similarity Network",
    content: deduplicateTextLines([
      ...getSimilarityNetworkReportLines(input.similarityNetworkAnalysis),
      ...(input.clusterHeatmapAnalysis &&
      input.similarityNetworkAnalysis &&
      input.similarityNetworkAnalysis.edges.length > 0
        ? [
            "Los bloques observados coinciden con las relaciones de similitud detectadas.",
          ]
        : []),
    ]),
  });

  sections.push({
    title: "Variable Importance",
    content: getVariableImportanceReportLines(input.variableImportanceAnalysis),
  });

  sections.push({
    title: "Cluster Heatmap",
    content: deduplicateTextLines([
      ...getClusterHeatmapReportLines(input.clusterHeatmapAnalysis),
      ...(input.clusteredDistanceHeatmapAnalysis
        ? [
            "El heatmap reordenado facilita la identificación visual de grupos.",
          ]
        : []),
    ]),
  });

  sections.push({
    title: "Clustered Distance Heatmap",
    content: getClusteredDistanceHeatmapReportLines(
      input.clusteredDistanceHeatmapAnalysis
    ),
  });

  sections.push({
    title: "Multivariate Dashboard",
    content: getMultivariateDashboardReportLines(
      input.multivariateDashboardAnalysis
    ),
  });

  sections.push({
    title: "MANOVA Explorer",
    content: getManovaExplorerReportLines(input.manovaExplorerAnalysis),
  });

  sections.push({
    title: "LDA Explorer",
    content: getLdaExplorerReportLines(input.ldaExplorerAnalysis),
  });

  sections.push({
    title: "Canonical Correlation Explorer",
    content: getCanonicalCorrelationExplorerReportLines(
      input.canonicalCorrelationExplorerAnalysis,
      input.correlationNetworkAnalysis
        ? getCorrelationNetworkDensity(input.correlationNetworkAnalysis)
        : null
    ),
  });

  sections.push({
    title: "PCR Explorer",
    content: getPcrExplorerReportLines(input.pcrExplorerAnalysis),
  });

  sections.push({
    title: "Clusterización jerárquica",
    content: deduplicateTextLines([
      ...getHierarchicalClusteringInterpretationLines(
        input.hierarchicalClusteringAnalysis
      ),
      ...(input.clusterHeatmapAnalysis
        ? [
            "El orden del heatmap proviene directamente del dendrograma jerárquico.",
          ]
        : []),
      ...(input.clusteredDistanceHeatmapAnalysis
        ? [
            "El dendrograma superior refleja la estructura jerárquica observada.",
          ]
        : []),
    ]),
  });

  const correlationLines: string[] = [];
  if (seriesCount < 2) {
    correlationLines.push(
      "Se requieren al menos dos series para analizar correlaciones."
    );
  } else {
    correlationLines.push(
      `Método de correlación evaluado: ${getCorrelationMethodLabel(input.correlationMethod)}.`
    );

    if (input.correlationAnalysis.results.length > 0) {
      input.correlationAnalysis.results.forEach((result) => {
        correlationLines.push(
          `${result.seriesA} ↔ ${result.seriesB}: r = ${formatCorrelationCoefficient(result.coefficient)} (${getCorrelationStrengthLabel(result.strength, result.direction)}).`
        );
      });
    }

    if (input.correlationAnalysis.unavailablePairs.length > 0) {
      input.correlationAnalysis.unavailablePairs.forEach((pair) => {
        correlationLines.push(
          `${pair.seriesA} ↔ ${pair.seriesB}: correlación no disponible.`
        );
      });
    }

    if (
      input.correlationAnalysis.results.length === 0 &&
      input.correlationAnalysis.unavailablePairs.length === 0
    ) {
      correlationLines.push(
        "No hay pares con datos suficientes para correlación."
      );
    }
  }

  sections.push({ title: "Correlaciones", content: correlationLines });

  const outlierLines = [
    `Método de detección: ${getOutlierMethodLabel(input.outlierMethod)}.`,
  ];

  if (input.experimentalOutliers.length === 0) {
    outlierLines.push(
      "No se detectaron valores atípicos con el método indicado."
    );
  } else {
    outlierLines.push(
      `Total de valores atípicos detectados: ${input.experimentalOutliers.length}.`
    );
    input.experimentalOutliers.forEach((outlier) => {
      outlierLines.push(
        `"${outlier.seriesName}" en (X=${formatExperimentalStat(outlier.x)}, Y=${formatExperimentalStat(outlier.y)}), score = ${formatOutlierScore(outlier.score)}.`
      );
    });
  }

  sections.push({ title: "Valores atípicos", content: outlierLines });

  const testLines: string[] = [];

  if (input.tTestResult) {
    testLines.push(
      `t-Test (${input.tTestResult.seriesA} vs ${input.tTestResult.seriesB}): t = ${formatExperimentalStat(input.tTestResult.tStatistic)}, p = ${formatPValue(input.tTestResult.pValue)} (${input.tTestResult.significant ? "significativo" : "no significativo"}).`
    );
    if (input.tTestResult.significant) {
      summaryLines.push(
        "El t-test detectó diferencia significativa entre dos grupos."
      );
    }
  } else if (seriesCount === 2) {
    testLines.push("t-Test: no disponible para las series actuales.");
  }

  if (input.anovaAnalysis) {
    const anovaResult = input.anovaAnalysis.result;
    testLines.push(
      `ANOVA de una vía (${anovaResult.groupCount} grupos): F = ${formatExperimentalStat(anovaResult.fStatistic)}, p = ${formatPValue(anovaResult.pValue)} (${anovaResult.significant ? "significativo" : "no significativo"}).`
    );
    if (anovaResult.significant) {
      summaryLines.push(
        "ANOVA detectó diferencias significativas entre grupos."
      );
    }
    input.anovaAnalysis.groups.forEach((group) => {
      testLines.push(
        `"${group.seriesName}": media = ${formatExperimentalStat(group.mean)}, SD = ${formatExperimentalStat(group.standardDeviation)}, N = ${group.sampleSize}.`
      );
    });
    if (input.postHocComparisons.length > 0) {
      testLines.push("Comparaciones múltiples (Tukey HSD simplificado):");
      input.postHocComparisons.forEach((comparison) => {
        testLines.push(
          `${comparison.seriesA} ↔ ${comparison.seriesB}: Δ = ${formatExperimentalStat(comparison.meanDifference)}, q = ${formatExperimentalStat(comparison.qStatistic)} (${comparison.significant ? "significativa" : "no significativa"}).`
        );
      });
    }
  } else if (seriesCount >= 3) {
    testLines.push("ANOVA: no disponible para las series actuales.");
  }

  if (input.mannWhitneyResult) {
    testLines.push(
      `Mann-Whitney U (${input.mannWhitneyResult.seriesA} vs ${input.mannWhitneyResult.seriesB}): U = ${formatExperimentalStat(input.mannWhitneyResult.uStatistic)}, p = ${formatPValue(input.mannWhitneyResult.pValue)} (${input.mannWhitneyResult.significant ? "significativo" : "no significativo"}).`
    );
  }

  if (input.kruskalWallisResult) {
    testLines.push(
      `Kruskal-Wallis (${input.kruskalWallisResult.groupCount} grupos): H = ${formatExperimentalStat(input.kruskalWallisResult.hStatistic)}, p = ${formatPValue(input.kruskalWallisResult.pValue)} (${input.kruskalWallisResult.significant ? "significativo" : "no significativo"}).`
    );
  }

  if (testLines.length === 0) {
    testLines.push(
      "No hay pruebas paramétricas o no paramétricas calculables con los datos actuales."
    );
  }

  sections.push({ title: "Pruebas estadísticas", content: testLines });

  const recommendationLines: string[] = [];
  if (input.statisticalRecommendation) {
    recommendationLines.push(
      `Prueba recomendada por el Advisor: ${input.statisticalRecommendation.recommendedTest} (confianza ${getStatisticalAdvisorConfidenceLabel(input.statisticalRecommendation.confidence)}).`
    );
    summaryLines.push(
      `El Advisor Estadístico recomienda utilizar ${input.statisticalRecommendation.recommendedTest} como análisis principal.`
    );
    input.statisticalRecommendation.reasoning.forEach((reason) =>
      recommendationLines.push(reason)
    );
    if (input.statisticalRecommendation.warnings.length > 0) {
      recommendationLines.push("Advertencias del Advisor:");
      input.statisticalRecommendation.warnings.forEach((warning) =>
        recommendationLines.push(warning)
      );
    }
  } else {
    recommendationLines.push(
      "El Advisor Estadístico no pudo generar una recomendación con los datos actuales."
    );
  }

  sections.push({ title: "Recomendación final", content: recommendationLines });

  return {
    title: reportTitle,
    generatedAt,
    summary: summaryLines.join(" "),
    sections,
  };
};

type ScientificInterpretation = {
  summary: string[];
  findings: string[];
  recommendations: string[];
  warnings: string[];
};

const SMALL_SAMPLE_WARNING_THRESHOLD = 30;

const interpretCorrelationMagnitude = (coefficient: number): string => {
  const absolute = Math.abs(coefficient);
  if (absolute < 0.2) return "No se observa una correlación relevante.";
  if (absolute < 0.4) return "Se observa una correlación débil.";
  if (absolute < 0.6) return "Se observa una correlación moderada.";
  if (absolute < 0.8) return "Se observa una correlación fuerte.";
  return "Se observa una correlación muy fuerte.";
};

const getCorrelationDirectionLabel = (coefficient: number) =>
  coefficient >= 0 ? "positiva" : "negativa";

const formatTukeySignificantPairsInterpretation = (
  comparisons: PostHocComparison[]
): string => {
  const significantPairs = comparisons.filter(
    (comparison) => comparison.significant
  );

  if (significantPairs.length === 0) {
    return "No se identificaron diferencias significativas entre pares.";
  }

  const pairLabels = significantPairs.map(
    (comparison) => `${comparison.seriesA} y ${comparison.seriesB}`
  );

  return `Las diferencias significativas se observaron entre ${pairLabels.join(", ")}.`;
};

const formatScientificInterpretationAsText = (
  interpretation: ScientificInterpretation
): string => {
  const blocks: string[] = [];

  if (interpretation.summary.length > 0) {
    blocks.push("=== Resumen general ===");
    interpretation.summary.forEach((line) => blocks.push(line));
    blocks.push("");
  }

  if (interpretation.findings.length > 0) {
    blocks.push("=== Hallazgos principales ===");
    interpretation.findings.forEach((line) => blocks.push(line));
    blocks.push("");
  }

  if (interpretation.recommendations.length > 0) {
    blocks.push("=== Recomendaciones ===");
    interpretation.recommendations.forEach((line) => blocks.push(line));
    blocks.push("");
  }

  if (interpretation.warnings.length > 0) {
    blocks.push("=== Advertencias ===");
    interpretation.warnings.forEach((line) => blocks.push(line));
  }

  return blocks.join("\n").trim();
};

const generateScientificInterpretation = (input: {
  series: ExperimentalSeries[];
  correlationAnalysis: {
    results: CorrelationResult[];
    unavailablePairs: CorrelationUnavailablePair[];
    matrix: CorrelationMatrixRow[];
  };
  normalityAnalyses: NormalityAnalysis[];
  qqPlotAnalyses: QQPlotAnalysis[];
  violinPlotAnalyses: ViolinPlotAnalysis[];
  correlationHeatmap: HeatmapAnalysis | null;
  valuesHeatmap: HeatmapAnalysis | null;
  bubblePlotAnalysis: BubblePlotAnalysis | null;
  radarPlotAnalysis: RadarPlotAnalysis | null;
  kernelDensityAnalyses: KernelDensityAnalysis[];
  forestPlotAnalysis: ForestPlotAnalysis | null;
  pcaAnalysis: PCAAnalysis | null;
  scatterMatrixAnalysis: ScatterMatrixAnalysis | null;
  parallelCoordinatesAnalysis: ParallelCoordinatesAnalysis | null;
  correlationNetworkAnalysis: CorrelationNetworkAnalysis | null;
  mdsAnalysis: MDSAnalysis | null;
  distanceMatrixAnalysis: DistanceMatrixAnalysis | null;
  similarityNetworkAnalysis: SimilarityNetworkAnalysis | null;
  variableImportanceAnalysis: VariableImportanceAnalysis | null;
  clusterHeatmapAnalysis: ClusterHeatmapAnalysis | null;
  clusteredDistanceHeatmapAnalysis: ClusteredDistanceHeatmapAnalysis | null;
  multivariateDashboardAnalysis: MultivariateDashboardAnalysis | null;
  manovaExplorerAnalysis: ManovaExplorerAnalysis | null;
  ldaExplorerAnalysis: LdaExplorerAnalysis | null;
  canonicalCorrelationExplorerAnalysis: CanonicalCorrelationExplorerAnalysis | null;
  pcrExplorerAnalysis: PcrExplorerAnalysis | null;
  hierarchicalClusteringAnalysis: HierarchicalClusteringAnalysis | null;
  experimentalOutliers: ExperimentalOutlier[];
  tTestResult: TTestResult | null;
  anovaAnalysis: AnovaAnalysis | null;
  postHocComparisons: PostHocComparison[];
  mannWhitneyResult: MannWhitneyResult | null;
  kruskalWallisResult: KruskalWallisResult | null;
  statisticalRecommendation: StatisticalRecommendation | null;
  scientificReport: ScientificReport | null;
}): ScientificInterpretation | null => {
  const seriesCount = input.series.length;
  const totalObservations = input.series.reduce(
    (sum, item) => sum + getSeriesYValues(item).length,
    0
  );

  if (seriesCount === 0 || totalObservations === 0) return null;

  const summary: string[] = [];
  const findings: string[] = [];
  const recommendations: string[] = [];
  const warnings: string[] = [];

  if (input.scientificReport?.summary) {
    summary.push(input.scientificReport.summary);
  } else {
    summary.push(
      `Se analizaron ${seriesCount} series experimentales con ${totalObservations} observaciones en total.`
    );
  }

  if (input.correlationAnalysis.results.length > 0) {
    input.correlationAnalysis.results.forEach((result) => {
      const magnitudeText = interpretCorrelationMagnitude(result.coefficient);
      const directionLabel = getCorrelationDirectionLabel(result.coefficient);
      findings.push(
        `${magnitudeText} La correlación es ${directionLabel} entre ${result.seriesA} y ${result.seriesB} (r = ${formatCorrelationCoefficient(result.coefficient)}).`
      );
    });
  } else if (seriesCount >= 2) {
    findings.push(
      "No hay pares con datos suficientes para interpretar correlaciones."
    );
  }

  if (
    input.normalityAnalyses.length > 0 ||
    input.qqPlotAnalyses.length > 0 ||
    input.violinPlotAnalyses.length > 0 ||
    input.kernelDensityAnalyses.length > 0
  ) {
    appendIntegratedNormalityFindings(
      findings,
      warnings,
      buildIntegratedNormalityAssessment(
        input.normalityAnalyses,
        input.qqPlotAnalyses,
        input.violinPlotAnalyses,
        input.kernelDensityAnalyses
      )
    );
    appendNormalityConsensusFindings(
      findings,
      warnings,
      buildNormalityConsensus(
        input.normalityAnalyses,
        input.qqPlotAnalyses,
        input.violinPlotAnalyses,
        input.kernelDensityAnalyses
      )
    );
  }

  if (input.correlationHeatmap) {
    getHeatmapInterpretationLines(input.correlationHeatmap)
      .filter(
        (line) =>
          line.includes("alta asociación positiva") ||
          line.includes("asociación negativa muy fuerte") ||
          line.includes("cercana a valores moderados")
      )
      .forEach((line) => findings.push(line));
  }

  if (input.valuesHeatmap) {
    getHeatmapInterpretationLines(input.valuesHeatmap)
      .filter((line) => line.includes("bloque de observaciones"))
      .forEach((line) => findings.push(line));
  }

  if (input.bubblePlotAnalysis) {
    getBubblePlotInterpretationLines(
      input.bubblePlotAnalysis,
      input.experimentalOutliers.length
    )
      .filter(
        (line) =>
          line.includes("concentración") ||
          line.includes("dispersas") ||
          line.includes("Predominan burbujas") ||
          line.includes("outliers detectados")
      )
      .forEach((line) => findings.push(line));
  }

  if (input.radarPlotAnalysis) {
    getRadarPlotInterpretationLines(input.radarPlotAnalysis)
      .filter(
        (line) =>
          line.includes("perfiles estadísticos similares") ||
          line.includes("perfiles muy distintos") ||
          line.includes("dispersión significativamente mayor") ||
          line.includes("perfil estadístico dominante")
      )
      .forEach((line) => findings.push(line));
  }

  if (input.forestPlotAnalysis) {
    getForestPlotInterpretationLines(input.forestPlotAnalysis)
      .filter(
        (line) =>
          line.includes("precisión") ||
          line.includes("incertidumbre") ||
          line.includes("superposición") ||
          line.includes("solapamiento") ||
          line.includes("separación consistente") ||
          line.includes("tamaño muestral pequeño")
      )
      .forEach((line) => findings.push(line));
  }

  if (input.pcaAnalysis) {
    if (input.pcaAnalysis.cumulativeVariance >= 80) {
      findings.push(
        "Los componentes principales resumen adecuadamente la estructura de los datos."
      );
    } else if (input.pcaAnalysis.cumulativeVariance < 60) {
      findings.push(
        "La estructura multivariante no queda completamente representada por dos componentes."
      );
    }

    deduplicateTextLines(input.pcaAnalysis.loadingsInterpretation).forEach(
      (line) => {
        if (!findings.includes(line)) findings.push(line);
      }
    );

    if (
      input.pcaAnalysis.cumulativeVariance >= 80 &&
      hasScatterMatrixStrongCorrelations(input.scatterMatrixAnalysis)
    ) {
      findings.push(
        "La estructura observada en la Scatter Matrix es consistente con PCA."
      );
    }

    if (
      input.pcaAnalysis.cumulativeVariance >= 80 &&
      hasParallelCoordinatesSimilarTrajectories(
        input.parallelCoordinatesAnalysis
      )
    ) {
      findings.push(
        "Los patrones observados son consistentes con la estructura identificada por PCA."
      );
    }

    if (
      input.pcaAnalysis.cumulativeVariance >= 80 &&
      hasMDSAcceptableStress(input.mdsAnalysis)
    ) {
      findings.push(
        "La estructura observada es consistente entre PCA y MDS."
      );
    }
  }

  if (input.scatterMatrixAnalysis) {
    deduplicateTextLines(input.scatterMatrixAnalysis.interpretation).forEach(
      (line) => {
        if (!findings.includes(line)) findings.push(line);
      }
    );

    if (
      hasScatterMatrixStrongCorrelations(input.scatterMatrixAnalysis) &&
      input.parallelCoordinatesAnalysis
    ) {
      findings.push(
        "Las asociaciones bivariadas observadas coinciden con los patrones multivariantes."
      );
    }
  }

  if (input.parallelCoordinatesAnalysis) {
    deduplicateTextLines(input.parallelCoordinatesAnalysis.interpretation).forEach(
      (line) => {
        if (!findings.includes(line)) findings.push(line);
      }
    );

    if (input.correlationNetworkAnalysis) {
      findings.push(
        "La estructura de la red coincide con los patrones multivariantes observados."
      );
    }
  }

  if (input.correlationNetworkAnalysis) {
    deduplicateTextLines(input.correlationNetworkAnalysis.interpretation).forEach(
      (line) => {
        if (!findings.includes(line)) findings.push(line);
      }
    );

    if (
      hasCorrelationHeatmapStrongCorrelations(input.correlationHeatmap) &&
      input.correlationNetworkAnalysis.edges.length > 0
    ) {
      findings.push(
        "La red es consistente con el Heatmap de correlaciones."
      );
    }

    if (
      hasScatterMatrixStrongCorrelations(input.scatterMatrixAnalysis) &&
      input.correlationNetworkAnalysis.edges.length > 0
    ) {
      findings.push(
        "Las conexiones observadas coinciden con las asociaciones bivariadas."
      );
    }
  }

  if (input.mdsAnalysis) {
    deduplicateTextLines(input.mdsAnalysis.interpretation).forEach((line) => {
      if (!findings.includes(line)) findings.push(line);
    });

    if (
      hasMDSAcceptableStress(input.mdsAnalysis) &&
      input.distanceMatrixAnalysis
    ) {
      findings.push(
        "La representación MDS preserva adecuadamente las distancias observadas."
      );
    }
  }

  if (input.distanceMatrixAnalysis) {
    deduplicateTextLines(input.distanceMatrixAnalysis.interpretation).forEach(
      (line) => {
        if (!findings.includes(line)) findings.push(line);
      }
    );

    if (input.similarityNetworkAnalysis) {
      findings.push(
        "La red se construye a partir de la matriz de distancias y preserva sus relaciones principales."
      );
    }
  }

  if (input.similarityNetworkAnalysis) {
    deduplicateTextLines(input.similarityNetworkAnalysis.interpretation).forEach(
      (line) => {
        if (!findings.includes(line)) findings.push(line);
      }
    );

    if (input.hierarchicalClusteringAnalysis) {
      findings.push(
        "La red de similitud es coherente con los agrupamientos jerárquicos observados."
      );
    }

    if (
      input.mdsAnalysis &&
      hasMDSAcceptableStress(input.mdsAnalysis)
    ) {
      findings.push(
        "La representación MDS respalda las relaciones de similitud observadas."
      );
    }
  }

  if (input.variableImportanceAnalysis) {
    deduplicateTextLines(
      input.variableImportanceAnalysis.interpretation
    ).forEach((line) => {
      if (!findings.includes(line)) findings.push(line);
    });

    const topEntry = getTopVariableImportanceEntry(
      input.variableImportanceAnalysis
    );
    if (topEntry && input.pcaAnalysis) {
      const pc1Leader = getPcaPc1LeaderVariable(input.pcaAnalysis);
      if (pc1Leader === topEntry.variable) {
        findings.push(
          "La importancia observada es consistente con PCA."
        );
      }
    }

    if (topEntry && input.correlationNetworkAnalysis) {
      const centralNode = getCorrelationNetworkCentralNode(
        input.correlationNetworkAnalysis
      );
      if (centralNode === topEntry.variable) {
        findings.push(
          "La variable actúa como eje principal de correlaciones."
        );
      }
    }

    if (topEntry && input.similarityNetworkAnalysis) {
      const centralNode = getSimilarityNetworkCentralNode(
        input.similarityNetworkAnalysis
      );
      if (centralNode === topEntry.variable) {
        findings.push(
          "La variable ocupa una posición central en la red de similitud."
        );
      }
    }
  }

  if (input.clusterHeatmapAnalysis) {
    deduplicateTextLines(input.clusterHeatmapAnalysis.interpretation).forEach(
      (line) => {
        if (!findings.includes(line)) findings.push(line);
      }
    );

    if (
      hasClusterHeatmapHomogeneousBlocks(
        input.clusterHeatmapAnalysis,
        input.distanceMatrixAnalysis?.averageDistance ?? Infinity
      )
    ) {
      findings.push(
        "Se observan bloques compactos de variables similares."
      );
    }

    if (input.hierarchicalClusteringAnalysis) {
      findings.push(
        "Los grupos identificados coinciden con la estructura del clustering."
      );
    }
  }

  if (input.clusteredDistanceHeatmapAnalysis) {
    deduplicateTextLines(
      input.clusteredDistanceHeatmapAnalysis.interpretation
    ).forEach((line) => {
      if (!findings.includes(line)) findings.push(line);
    });

    if (
      hasClusteredDistanceHeatmapCompactBlocks(
        input.clusteredDistanceHeatmapAnalysis
      )
    ) {
      findings.push(
        "Se observan bloques compactos de variables similares."
      );
    }

    if (
      hasClusteredDistanceHeatmapStrongSeparation(
        input.clusteredDistanceHeatmapAnalysis
      )
    ) {
      findings.push("Los grupos presentan una separación marcada.");
    }

    if (input.hierarchicalClusteringAnalysis) {
      findings.push(
        "La organización visual coincide con el clustering jerárquico."
      );
    }
  }

  if (input.multivariateDashboardAnalysis) {
    deduplicateTextLines(input.multivariateDashboardAnalysis.diagnosis).forEach(
      (line) => {
        if (!findings.includes(line)) findings.push(line);
      }
    );

    if (hasMultivariateDashboardStrongPca(input.pcaAnalysis)) {
      findings.push(
        "La estructura multivariante se encuentra bien explicada por PCA."
      );
    }

    if (hasDistanceMatrixHighHeterogeneity(input.distanceMatrixAnalysis)) {
      findings.push(
        "Los grupos identificados presentan una separación clara."
      );
    }

    const topVariable = input.multivariateDashboardAnalysis.summaryCards.topVariable;
    const topVariableScore =
      input.multivariateDashboardAnalysis.summaryCards.topVariableScore;
    if (topVariable && topVariableScore !== undefined && topVariableScore >= 80) {
      findings.push(
        `La variable ${topVariable} domina la estructura informativa.`
      );
    }
  }

  if (input.manovaExplorerAnalysis) {
    deduplicateTextLines(input.manovaExplorerAnalysis.interpretation).forEach(
      (line) => {
        if (!findings.includes(line)) findings.push(line);
      }
    );

    if (input.manovaExplorerAnalysis.classification === "strong") {
      findings.push(
        "Los grupos presentan una separación multivariante fuerte."
      );
    }

    if (hasMultivariateDashboardStrongPca(input.pcaAnalysis)) {
      findings.push("La estructura observada es consistente con PCA.");
    }

    if (input.hierarchicalClusteringAnalysis) {
      findings.push(
        "La estructura observada coincide con el clustering jerárquico."
      );
    }
  }

  if (input.ldaExplorerAnalysis) {
    deduplicateTextLines(input.ldaExplorerAnalysis.interpretation).forEach(
      (line) => {
        if (!findings.includes(line)) findings.push(line);
      }
    );

    if (input.ldaExplorerAnalysis.classification === "excellent") {
      findings.push("La separación multivariante observada es excelente.");
    }

    if (input.ldaExplorerAnalysis.dominantVariables.length > 0) {
      findings.push(
        `Las variables ${formatLdaDominantVariablesList(input.ldaExplorerAnalysis.dominantVariables)} son las principales responsables de la discriminación entre grupos.`
      );
    }
  }

  if (input.canonicalCorrelationExplorerAnalysis) {
    deduplicateTextLines(
      input.canonicalCorrelationExplorerAnalysis.interpretation
    ).forEach((line) => {
      if (!findings.includes(line)) findings.push(line);
    });

    if (
      input.canonicalCorrelationExplorerAnalysis.classification ===
      "very-strong"
    ) {
      findings.push("Las relaciones multivariantes son muy fuertes.");
    }

    if (input.canonicalCorrelationExplorerAnalysis.leadingVariables.length > 0) {
      findings.push(
        `Las variables ${formatLdaDominantVariablesList(input.canonicalCorrelationExplorerAnalysis.leadingVariables)} lideran la estructura relacional observada.`
      );
    }
  }

  if (input.pcrExplorerAnalysis) {
    deduplicateTextLines(input.pcrExplorerAnalysis.interpretation).forEach(
      (line) => {
        if (!findings.includes(line)) findings.push(line);
      }
    );

    if (input.pcrExplorerAnalysis.classification === "excellent") {
      findings.push(
        "Los componentes principales presentan una capacidad predictiva excelente."
      );
    }

    if (input.pcrExplorerAnalysis.predictiveVariables.length > 0) {
      findings.push(
        `Las variables ${formatLdaDominantVariablesList(input.pcrExplorerAnalysis.predictiveVariables)} contribuyen principalmente al potencial predictivo observado.`
      );
    }
  }

  if (input.hierarchicalClusteringAnalysis) {
    if (input.hierarchicalClusteringAnalysis.seriesCount === 2) {
      findings.push("Se compararon dos perfiles experimentales.");
    } else if (input.hierarchicalClusteringAnalysis.seriesCount >= 3) {
      findings.push(
        "Se identificaron grupos de series con comportamiento similar."
      );
    }
    if (
      input.hierarchicalClusteringAnalysis.interpretation.includes(
        "claramente diferenciados"
      )
    ) {
      findings.push("Se observaron grupos claramente diferenciados.");
      if (input.scatterMatrixAnalysis) {
        findings.push(
          "Los agrupamientos observados son coherentes con las relaciones bivariadas."
        );
      }
      if (input.parallelCoordinatesAnalysis) {
        findings.push(
          "Las trayectorias observadas son coherentes con la agrupación jerárquica."
        );
      }
      if (input.mdsAnalysis) {
        findings.push(
          "Los agrupamientos identificados son coherentes con la proximidad observada en MDS."
        );
      }
    }
  }

  if (input.hierarchicalClusteringAnalysis && input.distanceMatrixAnalysis) {
    const clusteringDistanceFinding =
      "Los agrupamientos observados son coherentes con la matriz de distancias.";
    if (!findings.includes(clusteringDistanceFinding)) {
      findings.push(clusteringDistanceFinding);
    }
  }

  if (input.experimentalOutliers.length === 0) {
    findings.push("No se detectaron valores atípicos relevantes.");
  } else {
    findings.push(
      `Se detectaron ${input.experimentalOutliers.length} valores atípicos que podrían influir en los resultados.`
    );
  }

  if (input.tTestResult) {
    findings.push(
      input.tTestResult.pValue < 0.05
        ? "Existe evidencia estadísticamente significativa de diferencias entre los grupos comparados."
        : "No se detectaron diferencias estadísticamente significativas."
    );
    findings.push(
      `Comparación t-Test (${input.tTestResult.seriesA} vs ${input.tTestResult.seriesB}): p = ${formatPValue(input.tTestResult.pValue)}.`
    );
  }

  if (input.anovaAnalysis) {
    findings.push(
      input.anovaAnalysis.result.pValue < 0.05
        ? "Existen diferencias significativas entre al menos dos grupos."
        : "No se detectan diferencias significativas entre los grupos analizados."
    );
    findings.push(
      `ANOVA de una vía: p = ${formatPValue(input.anovaAnalysis.result.pValue)}.`
    );
  }

  if (input.postHocComparisons.length > 0) {
    findings.push(
      formatTukeySignificantPairsInterpretation(input.postHocComparisons)
    );
  }

  if (input.mannWhitneyResult?.significant) {
    findings.push(
      "Diferencias significativas detectadas mediante Mann-Whitney."
    );
    findings.push(
      `Mann-Whitney (${input.mannWhitneyResult.seriesA} vs ${input.mannWhitneyResult.seriesB}): p = ${formatPValue(input.mannWhitneyResult.pValue)}.`
    );
  }

  if (input.kruskalWallisResult?.significant) {
    findings.push(
      "Diferencias significativas detectadas mediante Kruskal-Wallis."
    );
    findings.push(
      `Kruskal-Wallis (${input.kruskalWallisResult.groupCount} grupos): p = ${formatPValue(input.kruskalWallisResult.pValue)}.`
    );
  }

  if (input.statisticalRecommendation) {
    const { recommendedTest, confidence, reasoning, warnings: advisorWarnings } =
      input.statisticalRecommendation;

    if (recommendedTest === "ANOVA") {
      recommendations.push("Se recomienda ANOVA como análisis principal.");
    } else if (recommendedTest === "t-Test") {
      recommendations.push("Se recomienda t-Test como análisis principal.");
    } else if (recommendedTest === "Mann-Whitney U") {
      recommendations.push(
        "Se recomienda Mann-Whitney debido a la falta de normalidad."
      );
    } else if (recommendedTest === "Kruskal-Wallis") {
      recommendations.push(
        "Se recomienda Kruskal-Wallis debido a la falta de normalidad."
      );
    } else if (recommendedTest === "Pearson") {
      recommendations.push("Se recomienda correlación de Pearson.");
    } else if (recommendedTest === "Spearman") {
      recommendations.push("Se recomienda correlación de Spearman.");
    } else {
      recommendations.push(
        `Se recomienda ${recommendedTest} como análisis principal.`
      );
    }

    reasoning.forEach((reason) => {
      if (!recommendations.includes(reason)) {
        recommendations.push(reason);
      }
    });

    advisorWarnings.forEach((warning) => {
      if (!warnings.includes(warning)) {
        warnings.push(warning);
      }
    });

    if (confidence === "low") {
      warnings.push(
        "La confianza del Advisor Estadístico es baja; conviene validar los resultados con datos adicionales."
      );
    }
  }

  const smallSampleSeries = input.series.filter(
    (item) => getSeriesYValues(item).length < SMALL_SAMPLE_WARNING_THRESHOLD
  );
  if (smallSampleSeries.length > 0) {
    warnings.push(
      `Muestras pequeñas detectadas en: ${smallSampleSeries.map((item) => `"${item.name}"`).join(", ")}. Los resultados pueden ser inestables.`
    );
  }

  if (
    input.normalityAnalyses.some(
      (analysis) => analysis.classification === "non-normal"
    )
  ) {
    warnings.push(
      "Una o más series no cumplen el supuesto de normalidad; considere pruebas no paramétricas."
    );
  }

  if (input.experimentalOutliers.length > 0) {
    warnings.push(
      "La presencia de valores atípicos puede afectar pruebas paramétricas y medidas de tendencia central."
    );
  }

  if (summary.length === 0 && findings.length === 0) {
    return null;
  }

  return {
    summary,
    findings,
    recommendations,
    warnings,
  };
};

type ScientificAssistantConfidenceLevel = "high" | "medium" | "low";

type ScientificAssistantReport = {
  overallAssessment: string;
  keyFindings: string[];
  recommendedWorkflow: string[];
  confidenceLevel: ScientificAssistantConfidenceLevel;
  nextSteps: string[];
  cautions: string[];
};

const getScientificAssistantConfidenceLabel = (
  level: ScientificAssistantConfidenceLevel
) =>
  level === "high" ? "Alta" : level === "medium" ? "Media" : "Baja";

const buildCorrelationKeyFinding = (result: CorrelationResult): string | null => {
  const absolute = Math.abs(result.coefficient);
  if (absolute < 0.4) return null;

  const directionLabel = getCorrelationDirectionLabel(result.coefficient);
  const strengthLabel =
    absolute >= 0.8 ? "muy fuerte" : absolute >= 0.6 ? "fuerte" : "moderada";

  return `Se detectó una correlación ${directionLabel} ${strengthLabel} entre ${result.seriesA} y ${result.seriesB}.`;
};

const formatScientificAssistantReportAsText = (
  report: ScientificAssistantReport
): string => {
  const lines = [
    "=== Evaluación general ===",
    report.overallAssessment,
    "",
    `Nivel de confianza: ${getScientificAssistantConfidenceLabel(report.confidenceLevel)}`,
    "",
    "=== Hallazgos clave ===",
    ...report.keyFindings,
    "",
    "=== Flujo recomendado ===",
    ...report.recommendedWorkflow.map((step, index) => `${index + 1}. ${step}`),
    "",
    "=== Próximos pasos ===",
    ...report.nextSteps,
  ];

  if (report.cautions.length > 0) {
    lines.push("", "=== Advertencias ===", ...report.cautions);
  }

  return lines.join("\n").trim();
};

const generateScientificAssistantReport = (input: {
  series: ExperimentalSeries[];
  experimentalStatistics: ExperimentalStatistics[];
  correlationAnalysis: {
    results: CorrelationResult[];
    unavailablePairs: CorrelationUnavailablePair[];
    matrix: CorrelationMatrixRow[];
  };
  normalityAnalyses: NormalityAnalysis[];
  qqPlotAnalyses: QQPlotAnalysis[];
  violinPlotAnalyses: ViolinPlotAnalysis[];
  correlationHeatmap: HeatmapAnalysis | null;
  valuesHeatmap: HeatmapAnalysis | null;
  bubblePlotAnalysis: BubblePlotAnalysis | null;
  radarPlotAnalysis: RadarPlotAnalysis | null;
  kernelDensityAnalyses: KernelDensityAnalysis[];
  forestPlotAnalysis: ForestPlotAnalysis | null;
  pcaAnalysis: PCAAnalysis | null;
  scatterMatrixAnalysis: ScatterMatrixAnalysis | null;
  parallelCoordinatesAnalysis: ParallelCoordinatesAnalysis | null;
  correlationNetworkAnalysis: CorrelationNetworkAnalysis | null;
  mdsAnalysis: MDSAnalysis | null;
  distanceMatrixAnalysis: DistanceMatrixAnalysis | null;
  similarityNetworkAnalysis: SimilarityNetworkAnalysis | null;
  variableImportanceAnalysis: VariableImportanceAnalysis | null;
  clusterHeatmapAnalysis: ClusterHeatmapAnalysis | null;
  clusteredDistanceHeatmapAnalysis: ClusteredDistanceHeatmapAnalysis | null;
  multivariateDashboardAnalysis: MultivariateDashboardAnalysis | null;
  manovaExplorerAnalysis: ManovaExplorerAnalysis | null;
  ldaExplorerAnalysis: LdaExplorerAnalysis | null;
  canonicalCorrelationExplorerAnalysis: CanonicalCorrelationExplorerAnalysis | null;
  pcrExplorerAnalysis: PcrExplorerAnalysis | null;
  hierarchicalClusteringAnalysis: HierarchicalClusteringAnalysis | null;
  showHierarchicalClustering: boolean;
  showClusterHeatmap: boolean;
  showClusteredDistanceHeatmap: boolean;
  showPCA: boolean;
  experimentalOutliers: ExperimentalOutlier[];
  tTestResult: TTestResult | null;
  anovaAnalysis: AnovaAnalysis | null;
  postHocComparisons: PostHocComparison[];
  mannWhitneyResult: MannWhitneyResult | null;
  kruskalWallisResult: KruskalWallisResult | null;
  statisticalRecommendation: StatisticalRecommendation | null;
  scientificReport: ScientificReport | null;
  scientificInterpretation: ScientificInterpretation | null;
}): ScientificAssistantReport | null => {
  const seriesCount = input.series.length;
  const totalObservations = input.series.reduce(
    (sum, item) => sum + getSeriesYValues(item).length,
    0
  );

  if (seriesCount === 0 || totalObservations === 0) return null;

  const hasSmallSamples = input.series.some(
    (item) => getSeriesYValues(item).length < SMALL_SAMPLE_WARNING_THRESHOLD
  );
  const hasOutliers = input.experimentalOutliers.length > 0;
  const hasNonNormal = input.normalityAnalyses.some(
    (analysis) => analysis.classification === "non-normal"
  );
  const allNormal =
    input.normalityAnalyses.length > 0 &&
    input.normalityAnalyses.every(
      (analysis) =>
        analysis.classification === "normal" ||
        analysis.classification === "approximately-normal"
    ) &&
    !hasNonNormal;
  const hasStrongQQNormal =
    input.qqPlotAnalyses.length > 0 &&
    input.qqPlotAnalyses.every(
      (analysis) =>
        analysis.interpretation === "excellent" ||
        analysis.interpretation === "good"
    );
  const hasPoorQQNormal = input.qqPlotAnalyses.some(
    (analysis) => analysis.interpretation === "poor"
  );
  const hasSkewedViolin = input.violinPlotAnalyses.some(
    (analysis) => analysis.shapeInterpretation !== "symmetric"
  );
  const allViolinSymmetric =
    input.violinPlotAnalyses.length > 0 &&
    input.violinPlotAnalyses.every(
      (analysis) => analysis.shapeInterpretation === "symmetric"
    );
  const hasKernelMultimodal = input.kernelDensityAnalyses.some(
    (analysis) => analysis.distributionShape === "multimodal"
  );
  const hasKernelSkew = input.kernelDensityAnalyses.some(
    (analysis) =>
      analysis.distributionShape === "right-skewed" ||
      analysis.distributionShape === "left-skewed"
  );
  const allKernelSymmetric =
    input.kernelDensityAnalyses.length > 0 &&
    input.kernelDensityAnalyses.every(
      (analysis) => analysis.distributionShape === "symmetric"
    );
  const integratedNormalityAssessment = buildIntegratedNormalityAssessment(
    input.normalityAnalyses,
    input.qqPlotAnalyses,
    input.violinPlotAnalyses,
    input.kernelDensityAnalyses
  );
  const normalityConsensus = buildNormalityConsensus(
    input.normalityAnalyses,
    input.qqPlotAnalyses,
    input.violinPlotAnalyses,
    input.kernelDensityAnalyses
  );
  const allConsensusNormal =
    normalityConsensus.length > 0 &&
    normalityConsensus.every((consensus) => consensus.conclusion === "normal");
  const anyConsensusQuestionable = normalityConsensus.some(
    (consensus) => consensus.conclusion === "questionable"
  );
  const anyConsensusNonNormal = normalityConsensus.some(
    (consensus) => consensus.conclusion === "non-normal"
  );
  const hasNormalityContradictions = integratedNormalityAssessment.seriesAssessments.some(
    (assessment) => assessment.verdict === "contradictory"
  );
  const forestInterpretationLines = getForestPlotInterpretationLines(
    input.forestPlotAnalysis
  );
  const hasForestSmallSample =
    input.forestPlotAnalysis?.entries.some((entry) => entry.sampleSize <= 3) ??
    false;
  const hasForestWideUncertainty = forestInterpretationLines.some((line) =>
    line.includes("incertidumbre")
  );
  const hasForestOverlap = forestInterpretationLines.some((line) =>
    line.includes("amplia superposición")
  );
  const hasForestSeparation = forestInterpretationLines.some((line) =>
    line.includes("separación consistente")
  );
  const hasPCAHighVariance =
    input.pcaAnalysis !== null && input.pcaAnalysis.cumulativeVariance >= 80;
  const hasPCALowVariance =
    input.pcaAnalysis !== null && input.pcaAnalysis.cumulativeVariance < 60;
  const hasClusteringClearGroups =
    input.hierarchicalClusteringAnalysis?.interpretation.includes(
      "claramente diferenciados"
    ) ?? false;
  const hasPCAAdvancedClusteringConsistency =
    hasPCAClearStructure(input.pcaAnalysis) &&
    hasClusteringClearGroups &&
    input.hierarchicalClusteringAnalysis !== null &&
    input.pcaAnalysis !== null;
  const heatmapStrongPositivePairs = (() => {
    if (!input.correlationHeatmap) return 0;
    const seenPairs = new Set<string>();
    let count = 0;
    input.correlationHeatmap.cells.forEach((cell) => {
      if (cell.row === cell.column || !Number.isFinite(cell.value)) return;
      const pairKey = [cell.row, cell.column].sort().join("|");
      if (seenPairs.has(pairKey)) return;
      seenPairs.add(pairKey);
      if (cell.value > 0.8) count += 1;
    });
    return count;
  })();
  const heatmapStrongNegativePairs = (() => {
    if (!input.correlationHeatmap) return 0;
    const seenPairs = new Set<string>();
    let count = 0;
    input.correlationHeatmap.cells.forEach((cell) => {
      if (cell.row === cell.column || !Number.isFinite(cell.value)) return;
      const pairKey = [cell.row, cell.column].sort().join("|");
      if (seenPairs.has(pairKey)) return;
      seenPairs.add(pairKey);
      if (cell.value < -0.8) count += 1;
    });
    return count;
  })();
  const hasValuesHeatmapHotspots = (() => {
    if (!input.valuesHeatmap) return false;
    const { min, max } = getHeatmapValuesBounds(input.valuesHeatmap);
    return input.valuesHeatmap.cells.some((cell) => {
      if (!Number.isFinite(cell.value)) return false;
      const normalized = max === min ? 0.5 : (cell.value - min) / (max - min);
      return normalized >= 0.85;
    });
  })();

  let confidenceLevel: ScientificAssistantConfidenceLevel =
    input.statisticalRecommendation?.confidence ?? "medium";

  if (hasSmallSamples && confidenceLevel === "high") {
    confidenceLevel = "medium";
  }
  if (
    (hasSmallSamples && hasOutliers) ||
    (hasNonNormal && hasSmallSamples && confidenceLevel !== "low")
  ) {
    confidenceLevel = "low";
  }
  if (
    !input.statisticalRecommendation &&
    hasSmallSamples &&
    !hasOutliers &&
    !hasNonNormal
  ) {
    confidenceLevel = "medium";
  }
  if (
    !input.statisticalRecommendation &&
    allNormal &&
    !hasOutliers &&
    !hasSmallSamples
  ) {
    confidenceLevel = "high";
  }
  if (
    hasStrongQQNormal &&
    allNormal &&
    !hasOutliers &&
    confidenceLevel === "medium"
  ) {
    confidenceLevel = "high";
  }
  if (hasPoorQQNormal && confidenceLevel === "high") {
    confidenceLevel = "medium";
  }
  if (hasPoorQQNormal && hasSmallSamples && confidenceLevel !== "low") {
    confidenceLevel = "low";
  }
  if (
    hasStrongQQNormal &&
    allViolinSymmetric &&
    allNormal &&
    !hasOutliers &&
    confidenceLevel === "medium"
  ) {
    confidenceLevel = "high";
  }
  if (hasSkewedViolin && hasPoorQQNormal && confidenceLevel === "high") {
    confidenceLevel = "medium";
  }
  if (hasNormalityContradictions && confidenceLevel === "high") {
    confidenceLevel = "medium";
  }
  if (
    hasNormalityContradictions &&
    hasSmallSamples &&
    confidenceLevel !== "low"
  ) {
    confidenceLevel = "low";
  }
  if (
    allConsensusNormal &&
    !hasOutliers &&
    !hasSmallSamples &&
    confidenceLevel === "medium"
  ) {
    confidenceLevel = "high";
  }
  if (anyConsensusQuestionable && confidenceLevel === "high") {
    confidenceLevel = "medium";
  }
  if (
    anyConsensusQuestionable &&
    hasSmallSamples &&
    confidenceLevel !== "low"
  ) {
    confidenceLevel = "low";
  }
  if (
    heatmapStrongPositivePairs > 0 &&
    allNormal &&
    hasStrongQQNormal &&
    confidenceLevel === "medium"
  ) {
    confidenceLevel = "high";
  }
  if (
    (heatmapStrongNegativePairs > 0 || hasValuesHeatmapHotspots) &&
    confidenceLevel === "high"
  ) {
    confidenceLevel = "medium";
  }
  if (hasPCAHighVariance && confidenceLevel === "medium") {
    confidenceLevel = "high";
  }
  if (hasPCALowVariance && confidenceLevel === "high") {
    confidenceLevel = "medium";
  }
  if (hasPCAAdvancedClusteringConsistency && confidenceLevel === "medium") {
    confidenceLevel = "high";
  }
  if (
    hasPCAHighVariance &&
    hasScatterMatrixStrongCorrelations(input.scatterMatrixAnalysis) &&
    confidenceLevel === "medium"
  ) {
    confidenceLevel = "high";
  }
  if (
    hasPCAHighVariance &&
    hasParallelCoordinatesSimilarTrajectories(
      input.parallelCoordinatesAnalysis
    ) &&
    confidenceLevel === "medium"
  ) {
    confidenceLevel = "high";
  }
  if (
    hasPCAHighVariance &&
    hasCorrelationNetworkHighDensity(input.correlationNetworkAnalysis) &&
    confidenceLevel === "medium"
  ) {
    confidenceLevel = "high";
  }
  if (
    hasPCAHighVariance &&
    hasMDSAcceptableStress(input.mdsAnalysis) &&
    confidenceLevel === "medium"
  ) {
    confidenceLevel = "high";
  }
  if (
    hasDistanceMatrixHighHeterogeneity(input.distanceMatrixAnalysis) &&
    input.showHierarchicalClustering &&
    confidenceLevel === "medium"
  ) {
    confidenceLevel = "high";
  }
  if (
    hasSimilarityNetworkHighAverage(input.similarityNetworkAnalysis) &&
    input.showHierarchicalClustering &&
    confidenceLevel === "medium"
  ) {
    confidenceLevel = "high";
  }
  if (
    hasVariableImportanceDominantTop(input.variableImportanceAnalysis) &&
    input.showPCA &&
    confidenceLevel === "medium"
  ) {
    confidenceLevel = "high";
  }
  if (
    hasClusterHeatmapClearSeparation(input.distanceMatrixAnalysis) &&
    input.showHierarchicalClustering &&
    input.showClusterHeatmap &&
    confidenceLevel === "medium"
  ) {
    confidenceLevel = "high";
  }
  if (
    hasClusteredDistanceHeatmapStrongSeparation(
      input.clusteredDistanceHeatmapAnalysis
    ) &&
    input.showHierarchicalClustering &&
    confidenceLevel === "medium"
  ) {
    confidenceLevel = "high";
  }
  if (
    hasMultivariateDashboardStrongPca(input.pcaAnalysis) &&
    input.mdsAnalysis !== null &&
    input.mdsAnalysis.stress < 0.1 &&
    confidenceLevel === "medium"
  ) {
    confidenceLevel = "high";
  }
  if (
    hasManovaExplorerStrongSeparation(input.manovaExplorerAnalysis) &&
    confidenceLevel === "medium"
  ) {
    confidenceLevel = "high";
  }
  if (
    hasLdaExplorerExcellentDiscrimination(input.ldaExplorerAnalysis) &&
    confidenceLevel === "medium"
  ) {
    confidenceLevel = "high";
  }
  if (
    hasCanonicalCorrelationExplorerVeryStrong(
      input.canonicalCorrelationExplorerAnalysis
    ) &&
    confidenceLevel === "medium"
  ) {
    confidenceLevel = "high";
  }
  if (
    hasPcrExplorerExcellentPredictive(input.pcrExplorerAnalysis) &&
    confidenceLevel === "medium"
  ) {
    confidenceLevel = "high";
  }

  const cautiousReasons: string[] = [];
  if (hasOutliers) cautiousReasons.push("valores atípicos");
  if (hasSmallSamples) cautiousReasons.push("muestras pequeñas");
  if (hasNonNormal) cautiousReasons.push("desviaciones de normalidad");
  if (hasNormalityContradictions) {
    cautiousReasons.push("señales contradictorias de normalidad");
  }
  if (anyConsensusQuestionable) {
    cautiousReasons.push("consenso de normalidad cuestionable");
  }
  if (anyConsensusNonNormal) {
    cautiousReasons.push("series con consenso no normal");
  }
  if (confidenceLevel === "low") cautiousReasons.push("baja confianza estadística");

  const overallAssessment =
    cautiousReasons.length > 0
      ? `Los resultados deben interpretarse con cautela debido a la presencia de ${cautiousReasons.join(", ")}.`
      : "Los datos presentan calidad adecuada para análisis estadístico.";

  const keyFindings: string[] = [];
  const pushUniqueFinding = (finding: string) => {
    if (!keyFindings.includes(finding)) keyFindings.push(finding);
  };

  input.correlationAnalysis.results.forEach((result) => {
    const finding = buildCorrelationKeyFinding(result);
    if (finding) pushUniqueFinding(finding);
  });

  if (input.anovaAnalysis?.result.significant) {
    pushUniqueFinding("ANOVA mostró diferencias significativas.");
  }

  const significantPostHocCount = input.postHocComparisons.filter(
    (comparison) => comparison.significant
  ).length;
  if (significantPostHocCount === 1) {
    pushUniqueFinding("Una comparación post-hoc fue significativa.");
  } else if (significantPostHocCount > 1) {
    pushUniqueFinding(
      `${significantPostHocCount} comparaciones post-hoc fueron significativas.`
    );
  }

  if (hasOutliers) {
    pushUniqueFinding("Se identificaron valores atípicos.");
  }

  if (input.tTestResult?.significant) {
    pushUniqueFinding(
      `El t-Test entre ${input.tTestResult.seriesA} y ${input.tTestResult.seriesB} fue significativo.`
    );
  }

  if (input.mannWhitneyResult?.significant) {
    pushUniqueFinding("Mann-Whitney detectó diferencias significativas.");
  }

  if (input.kruskalWallisResult?.significant) {
    pushUniqueFinding("Kruskal-Wallis detectó diferencias significativas.");
  }

  if (heatmapStrongPositivePairs > 0 && input.correlationHeatmap) {
    const sampleCell = input.correlationHeatmap.cells.find(
      (cell) =>
        cell.row !== cell.column &&
        Number.isFinite(cell.value) &&
        cell.value > 0.8
    );
    if (sampleCell) {
      pushUniqueFinding(
        `El Heatmap confirma alta asociación positiva entre ${sampleCell.row} y ${sampleCell.column}.`
      );
    }
  }

  if (heatmapStrongNegativePairs > 0) {
    pushUniqueFinding(
      "El Heatmap evidencia pares de series con correlación negativa muy fuerte."
    );
  }

  if (hasValuesHeatmapHotspots) {
    pushUniqueFinding(
      "El Heatmap de valores muestra bloques de observaciones con magnitudes elevadas."
    );
  }

  input.scientificInterpretation?.findings
    .slice(0, 4)
    .forEach((finding) => pushUniqueFinding(finding));

  if (keyFindings.length === 0 && input.scientificReport?.summary) {
    pushUniqueFinding(input.scientificReport.summary);
  }

  if (keyFindings.length === 0) {
    pushUniqueFinding(
      `Se analizaron ${seriesCount} series con ${totalObservations} observaciones.`
    );
  }

  const recommendedWorkflow: string[] = [];
  const pushWorkflowStep = (step: string) => {
    if (!recommendedWorkflow.includes(step)) recommendedWorkflow.push(step);
  };

  if (hasOutliers) {
    pushWorkflowStep("Verificar outliers y decidir si excluirlos o corregirlos.");
  }

  const recommendedTest = input.statisticalRecommendation?.recommendedTest;

  if (recommendedTest === "ANOVA" || input.anovaAnalysis) {
    pushWorkflowStep("Utilizar ANOVA como análisis principal de comparación.");
  } else if (recommendedTest === "t-Test" || input.tTestResult) {
    pushWorkflowStep("Utilizar t-Test para comparar los dos grupos seleccionados.");
  } else if (recommendedTest === "Mann-Whitney U" || input.mannWhitneyResult) {
    pushWorkflowStep("Utilizar Mann-Whitney por falta de normalidad.");
  } else if (
    recommendedTest === "Kruskal-Wallis" ||
    input.kruskalWallisResult
  ) {
    pushWorkflowStep("Utilizar Kruskal-Wallis para comparar múltiples grupos.");
  } else if (recommendedTest === "Pearson" || recommendedTest === "Spearman") {
    pushWorkflowStep(`Aplicar correlación de ${recommendedTest}.`);
  } else if (allNormal && seriesCount >= 3) {
    pushWorkflowStep("Utilizar ANOVA para comparar tres o más grupos.");
  } else if (allNormal && seriesCount === 2) {
    pushWorkflowStep("Utilizar t-Test para comparar dos grupos.");
  } else if (hasNonNormal && seriesCount >= 3) {
    pushWorkflowStep("Utilizar Kruskal-Wallis como alternativa no paramétrica.");
  } else if (hasNonNormal && seriesCount === 2) {
    pushWorkflowStep("Utilizar Mann-Whitney como alternativa no paramétrica.");
  }

  if (input.anovaAnalysis?.result.significant) {
    pushWorkflowStep("Analizar comparaciones post-hoc con Tukey.");
  }

  if (input.experimentalStatistics.length > 0) {
    pushWorkflowStep("Revisar estadística descriptiva antes de inferencia.");
  }

  pushWorkflowStep("Incorporar resultados al reporte científico.");
  pushWorkflowStep("Revisar la interpretación científica automática.");

  const nextSteps: string[] = [];
  const pushNextStep = (step: string) => {
    if (!nextSteps.includes(step)) nextSteps.push(step);
  };

  if (hasSmallSamples) {
    pushNextStep("Incrementar tamaño muestral.");
  }
  if (hasOutliers) {
    pushNextStep("Repetir mediciones para validar valores atípicos.");
  }
  if (seriesCount >= 2 && input.correlationAnalysis.results.length === 0) {
    pushNextStep("Evaluar variables adicionales para ampliar el análisis.");
  } else if (seriesCount < 3) {
    pushNextStep("Evaluar variables adicionales o nuevas series experimentales.");
  }
  if (confidenceLevel === "low" || confidenceLevel === "medium") {
    pushNextStep("Confirmar resultados con nuevos experimentos.");
  }
  if (input.anovaAnalysis?.result.significant && significantPostHocCount === 0) {
    pushNextStep("Profundizar comparaciones entre pares con análisis post-hoc.");
  }

  if (nextSteps.length === 0) {
    pushNextStep("Documentar conclusiones y planificar la siguiente ronda experimental.");
  }

  const cautions: string[] = [];
  const pushCaution = (caution: string) => {
    if (!cautions.includes(caution)) cautions.push(caution);
  };

  input.statisticalRecommendation?.warnings.forEach((warning) =>
    pushCaution(warning)
  );
  input.scientificInterpretation?.warnings.forEach((warning) =>
    pushCaution(warning)
  );

  if (
    input.normalityAnalyses.length > 0 ||
    input.qqPlotAnalyses.length > 0 ||
    input.violinPlotAnalyses.length > 0 ||
    input.kernelDensityAnalyses.length > 0
  ) {
    appendIntegratedNormalityFindings(
      keyFindings,
      cautions,
      integratedNormalityAssessment
    );
    appendNormalityConsensusFindings(
      keyFindings,
      cautions,
      normalityConsensus
    );
  }
  if (anyConsensusNonNormal) {
    pushCaution("Se recomienda priorizar pruebas no paramétricas.");
  }
  if (heatmapStrongNegativePairs > 0) {
    pushCaution(
      "El Heatmap de correlaciones sugiere relaciones inversas fuertes que conviene validar."
    );
  }
  if (hasValuesHeatmapHotspots && hasOutliers) {
    pushCaution(
      "El Heatmap de valores y los outliers coinciden en zonas de alta magnitud."
    );
  }
  if (input.bubblePlotAnalysis && hasOutliers) {
    pushUniqueFinding(
      "El Bubble Plot resalta burbujas coincidentes con outliers experimentales."
    );
  }
  if (input.bubblePlotAnalysis) {
    const bubbleLines = getBubblePlotInterpretationLines(
      input.bubblePlotAnalysis,
      input.experimentalOutliers.length
    );
    bubbleLines
      .filter((line) => line.includes("Predominan burbujas"))
      .forEach((line) => pushUniqueFinding(line));
  }
  if (input.radarPlotAnalysis) {
    getRadarPlotInterpretationLines(input.radarPlotAnalysis)
      .filter(
        (line) =>
          line.includes("perfiles estadísticos similares") ||
          line.includes("dispersión significativamente mayor") ||
          line.includes("perfil estadístico dominante")
      )
      .forEach((line) => pushUniqueFinding(line));
  }

  if (input.forestPlotAnalysis) {
    forestInterpretationLines
      .filter(
        (line) =>
          line.includes("precisión") ||
          line.includes("superposición") ||
          line.includes("solapamiento") ||
          line.includes("separación consistente")
      )
      .forEach((line) => pushUniqueFinding(line));
  }
  if (input.pcaAnalysis) {
    if (input.pcaAnalysis.cumulativeVariance >= 80) {
      pushUniqueFinding(
        "Los componentes principales resumen adecuadamente la estructura de los datos."
      );
    } else if (input.pcaAnalysis.cumulativeVariance < 60) {
      pushUniqueFinding(
        "La estructura multivariante no queda completamente representada por dos componentes."
      );
    }

    deduplicateTextLines(input.pcaAnalysis.loadingsInterpretation).forEach(
      (line) => pushUniqueFinding(line)
    );

    if (
      input.pcaAnalysis.cumulativeVariance >= 80 &&
      hasScatterMatrixStrongCorrelations(input.scatterMatrixAnalysis)
    ) {
      pushUniqueFinding(
        "La estructura observada en la Scatter Matrix es consistente con PCA."
      );
    }

    if (
      input.pcaAnalysis.cumulativeVariance >= 80 &&
      hasParallelCoordinatesSimilarTrajectories(
        input.parallelCoordinatesAnalysis
      )
    ) {
      pushUniqueFinding(
        "Los patrones observados son consistentes con la estructura identificada por PCA."
      );
    }

    if (
      input.pcaAnalysis.cumulativeVariance >= 80 &&
      hasMDSAcceptableStress(input.mdsAnalysis)
    ) {
      pushUniqueFinding(
        "La estructura observada es consistente entre PCA y MDS."
      );
    }
  }
  if (input.scatterMatrixAnalysis) {
    deduplicateTextLines(input.scatterMatrixAnalysis.interpretation).forEach(
      (line) => pushUniqueFinding(line)
    );

    if (
      hasScatterMatrixStrongCorrelations(input.scatterMatrixAnalysis) &&
      input.parallelCoordinatesAnalysis
    ) {
      pushUniqueFinding(
        "Las asociaciones bivariadas observadas coinciden con los patrones multivariantes."
      );
    }
  }
  if (input.parallelCoordinatesAnalysis) {
    deduplicateTextLines(input.parallelCoordinatesAnalysis.interpretation).forEach(
      (line) => pushUniqueFinding(line)
    );

    if (input.correlationNetworkAnalysis) {
      pushUniqueFinding(
        "La estructura de la red coincide con los patrones multivariantes observados."
      );
    }
  }
  if (input.correlationNetworkAnalysis) {
    deduplicateTextLines(input.correlationNetworkAnalysis.interpretation).forEach(
      (line) => pushUniqueFinding(line)
    );

    if (
      hasCorrelationHeatmapStrongCorrelations(input.correlationHeatmap) &&
      input.correlationNetworkAnalysis.edges.length > 0
    ) {
      pushUniqueFinding(
        "La red es consistente con el Heatmap de correlaciones."
      );
    }

    if (
      hasScatterMatrixStrongCorrelations(input.scatterMatrixAnalysis) &&
      input.correlationNetworkAnalysis.edges.length > 0
    ) {
      pushUniqueFinding(
        "Las conexiones observadas coinciden con las asociaciones bivariadas."
      );
    }
  }
  if (input.mdsAnalysis) {
    deduplicateTextLines(input.mdsAnalysis.interpretation).forEach((line) =>
      pushUniqueFinding(line)
    );

    if (
      hasMDSAcceptableStress(input.mdsAnalysis) &&
      input.distanceMatrixAnalysis
    ) {
      pushUniqueFinding(
        "La representación MDS preserva adecuadamente las distancias observadas."
      );
    }
  }
  if (input.distanceMatrixAnalysis) {
    deduplicateTextLines(input.distanceMatrixAnalysis.interpretation).forEach(
      (line) => pushUniqueFinding(line)
    );

    if (input.similarityNetworkAnalysis) {
      pushUniqueFinding(
        "La red se construye a partir de la matriz de distancias y preserva sus relaciones principales."
      );
    }
  }
  if (input.similarityNetworkAnalysis) {
    deduplicateTextLines(input.similarityNetworkAnalysis.interpretation).forEach(
      (line) => pushUniqueFinding(line)
    );

    if (input.hierarchicalClusteringAnalysis) {
      pushUniqueFinding(
        "La red de similitud es coherente con los agrupamientos jerárquicos observados."
      );
    }

    if (
      input.mdsAnalysis &&
      hasMDSAcceptableStress(input.mdsAnalysis)
    ) {
      pushUniqueFinding(
        "La representación MDS respalda las relaciones de similitud observadas."
      );
    }
  }
  if (input.variableImportanceAnalysis) {
    deduplicateTextLines(
      input.variableImportanceAnalysis.interpretation
    ).forEach((line) => pushUniqueFinding(line));

    const topEntry = getTopVariableImportanceEntry(
      input.variableImportanceAnalysis
    );
    if (topEntry && input.pcaAnalysis) {
      const pc1Leader = getPcaPc1LeaderVariable(input.pcaAnalysis);
      if (pc1Leader === topEntry.variable) {
        pushUniqueFinding(
          "La importancia observada es consistente con PCA."
        );
      }
    }

    if (topEntry && input.correlationNetworkAnalysis) {
      const centralNode = getCorrelationNetworkCentralNode(
        input.correlationNetworkAnalysis
      );
      if (centralNode === topEntry.variable) {
        pushUniqueFinding(
          "La variable actúa como eje principal de correlaciones."
        );
      }
    }

    if (topEntry && input.similarityNetworkAnalysis) {
      const centralNode = getSimilarityNetworkCentralNode(
        input.similarityNetworkAnalysis
      );
      if (centralNode === topEntry.variable) {
        pushUniqueFinding(
          "La variable ocupa una posición central en la red de similitud."
        );
      }
    }
  }
  if (input.clusterHeatmapAnalysis) {
    deduplicateTextLines(input.clusterHeatmapAnalysis.interpretation).forEach(
      (line) => pushUniqueFinding(line)
    );

    if (
      hasClusterHeatmapHomogeneousBlocks(
        input.clusterHeatmapAnalysis,
        input.distanceMatrixAnalysis?.averageDistance ?? Infinity
      )
    ) {
      pushUniqueFinding(
        "Se observan bloques compactos de variables similares."
      );
    }

    if (input.hierarchicalClusteringAnalysis) {
      pushUniqueFinding(
        "Los grupos identificados coinciden con la estructura del clustering."
      );
    }
  }
  if (input.clusteredDistanceHeatmapAnalysis) {
    deduplicateTextLines(
      input.clusteredDistanceHeatmapAnalysis.interpretation
    ).forEach((line) => pushUniqueFinding(line));

    if (
      hasClusteredDistanceHeatmapCompactBlocks(
        input.clusteredDistanceHeatmapAnalysis
      )
    ) {
      pushUniqueFinding(
        "Se observan bloques compactos de variables similares."
      );
    }

    if (
      hasClusteredDistanceHeatmapStrongSeparation(
        input.clusteredDistanceHeatmapAnalysis
      )
    ) {
      pushUniqueFinding("Los grupos presentan una separación marcada.");
    }

    if (input.hierarchicalClusteringAnalysis) {
      pushUniqueFinding(
        "La organización visual coincide con el clustering jerárquico."
      );
    }
  }
  if (input.multivariateDashboardAnalysis) {
    deduplicateTextLines(input.multivariateDashboardAnalysis.diagnosis).forEach(
      (line) => pushUniqueFinding(line)
    );

    if (hasMultivariateDashboardStrongPca(input.pcaAnalysis)) {
      pushUniqueFinding(
        "La estructura multivariante se encuentra bien explicada por PCA."
      );
    }

    if (hasDistanceMatrixHighHeterogeneity(input.distanceMatrixAnalysis)) {
      pushUniqueFinding(
        "Los grupos identificados presentan una separación clara."
      );
    }

    const topVariable = input.multivariateDashboardAnalysis.summaryCards.topVariable;
    const topVariableScore =
      input.multivariateDashboardAnalysis.summaryCards.topVariableScore;
    if (topVariable && topVariableScore !== undefined && topVariableScore >= 80) {
      pushUniqueFinding(
        `La variable ${topVariable} domina la estructura informativa.`
      );
    }
  }
  if (input.manovaExplorerAnalysis) {
    deduplicateTextLines(input.manovaExplorerAnalysis.interpretation).forEach(
      (line) => pushUniqueFinding(line)
    );

    if (input.manovaExplorerAnalysis.classification === "strong") {
      pushUniqueFinding(
        "Los grupos presentan una separación multivariante fuerte."
      );
    }

    if (hasMultivariateDashboardStrongPca(input.pcaAnalysis)) {
      pushUniqueFinding("La estructura observada es consistente con PCA.");
    }

    if (input.hierarchicalClusteringAnalysis) {
      pushUniqueFinding(
        "La estructura observada coincide con el clustering jerárquico."
      );
    }
  }
  if (input.ldaExplorerAnalysis) {
    deduplicateTextLines(input.ldaExplorerAnalysis.interpretation).forEach(
      (line) => pushUniqueFinding(line)
    );

    if (input.ldaExplorerAnalysis.classification === "excellent") {
      pushUniqueFinding("La separación multivariante observada es excelente.");
    }

    if (input.ldaExplorerAnalysis.dominantVariables.length > 0) {
      pushUniqueFinding(
        `Las variables ${formatLdaDominantVariablesList(input.ldaExplorerAnalysis.dominantVariables)} son las principales responsables de la discriminación entre grupos.`
      );
    }
  }
  if (input.canonicalCorrelationExplorerAnalysis) {
    deduplicateTextLines(
      input.canonicalCorrelationExplorerAnalysis.interpretation
    ).forEach((line) => pushUniqueFinding(line));

    if (
      input.canonicalCorrelationExplorerAnalysis.classification === "very-strong"
    ) {
      pushUniqueFinding("Las relaciones multivariantes son muy fuertes.");
    }

    if (input.canonicalCorrelationExplorerAnalysis.leadingVariables.length > 0) {
      pushUniqueFinding(
        `Las variables ${formatLdaDominantVariablesList(input.canonicalCorrelationExplorerAnalysis.leadingVariables)} lideran la estructura relacional observada.`
      );
    }
  }
  if (input.pcrExplorerAnalysis) {
    deduplicateTextLines(input.pcrExplorerAnalysis.interpretation).forEach(
      (line) => pushUniqueFinding(line)
    );

    if (input.pcrExplorerAnalysis.classification === "excellent") {
      pushUniqueFinding(
        "Los componentes principales presentan una capacidad predictiva excelente."
      );
    }

    if (input.pcrExplorerAnalysis.predictiveVariables.length > 0) {
      pushUniqueFinding(
        `Las variables ${formatLdaDominantVariablesList(input.pcrExplorerAnalysis.predictiveVariables)} contribuyen principalmente al potencial predictivo observado.`
      );
    }
  }
  if (
    input.hierarchicalClusteringAnalysis &&
    input.distanceMatrixAnalysis
  ) {
    pushUniqueFinding(
      "Los agrupamientos observados son coherentes con la matriz de distancias."
    );
  }
  if (hasPCAAdvancedClusteringConsistency) {
    pushUniqueFinding(
      "Los loadings de PCA y el clustering jerárquico coinciden en una estructura multivariante clara."
    );
  }
  if (input.hierarchicalClusteringAnalysis) {
    if (input.hierarchicalClusteringAnalysis.seriesCount === 2) {
      pushUniqueFinding("Se compararon dos perfiles experimentales.");
    } else if (input.hierarchicalClusteringAnalysis.seriesCount >= 3) {
      pushUniqueFinding(
        "Se identificaron grupos de series con comportamiento similar."
      );
    }
    if (hasClusteringClearGroups) {
      pushUniqueFinding("Se observaron grupos claramente diferenciados.");
      if (input.scatterMatrixAnalysis) {
        pushUniqueFinding(
          "Los agrupamientos observados son coherentes con las relaciones bivariadas."
        );
      }
      if (input.parallelCoordinatesAnalysis) {
        pushUniqueFinding(
          "Las trayectorias observadas son coherentes con la agrupación jerárquica."
        );
      }
      if (input.mdsAnalysis) {
        pushUniqueFinding(
          "Los agrupamientos identificados son coherentes con la proximidad observada en MDS."
        );
      }
    }
  }
  if (
    hasPCALowVariance &&
    hasScatterMatrixMostlyWeakCorrelations(input.scatterMatrixAnalysis)
  ) {
    pushCaution(
      "No se observa una estructura multivariante claramente definida."
    );
  }
  if (
    hasParallelCoordinatesHeterogeneousTrajectories(
      input.parallelCoordinatesAnalysis
    ) &&
    input.hierarchicalClusteringAnalysis &&
    input.hierarchicalClusteringAnalysis.seriesCount >= 3 &&
    !hasClusteringClearGroups
  ) {
    pushCaution(
      "No se observa una estructura multivariante consistente."
    );
  }
  if (
    hasCorrelationNetworkSparseStructure(input.correlationNetworkAnalysis) &&
    hasScatterMatrixMostlyWeakCorrelations(input.scatterMatrixAnalysis)
  ) {
    pushCaution(
      "No se observa una estructura de correlación consistente."
    );
  }
  if (hasMDSPoorStress(input.mdsAnalysis)) {
    pushCaution(
      "La representación bidimensional puede no reflejar adecuadamente las distancias originales."
    );
  }
  if (hasDistanceMatrixLimitedDiscrimination(input.distanceMatrixAnalysis)) {
    pushCaution(
      "Las distancias entre variables son muy similares; la capacidad de discriminación es limitada."
    );
  }
  if (
    input.similarityNetworkAnalysis &&
    input.similarityNetworkAnalysis.edges.length === 0
  ) {
    pushCaution(
      "No se identificaron relaciones de similitud significativas."
    );
  }
  if (hasVariableImportanceDominanceGap(input.variableImportanceAnalysis)) {
    pushCaution(
      "El análisis está fuertemente influenciado por una única variable dominante."
    );
  }
  if (
    input.showClusterHeatmap &&
    hasClusterHeatmapLimitedSeparation(input.distanceMatrixAnalysis)
  ) {
    pushCaution("No se observan separaciones marcadas entre grupos.");
  }
  if (
    input.showClusteredDistanceHeatmap &&
    hasClusteredDistanceHeatmapLimitedSeparation(
      input.clusteredDistanceHeatmapAnalysis
    )
  ) {
    pushCaution("La separación entre grupos es limitada.");
  }
  if (
    hasMultivariateDashboardHighComplexity(
      input.pcaAnalysis,
      input.mdsAnalysis
    )
  ) {
    pushCaution(
      "La estructura multivariante presenta complejidad elevada y debe interpretarse con cautela."
    );
  }
  if (hasManovaExplorerLimitedSeparation(input.manovaExplorerAnalysis)) {
    pushCaution("La diferenciación multivariante observada es limitada.");
  }
  if (hasLdaExplorerPoorDiscrimination(input.ldaExplorerAnalysis)) {
    pushCaution("La diferenciación entre grupos es limitada.");
  }
  if (hasCanonicalCorrelationExplorerWeak(input.canonicalCorrelationExplorerAnalysis)) {
    pushCaution("Las relaciones multivariantes detectadas son limitadas.");
  }
  if (hasPcrExplorerPoorPredictive(input.pcrExplorerAnalysis)) {
    pushCaution("La capacidad predictiva observada es limitada.");
  }
  if (
    hasForestSeparation &&
    input.tTestResult &&
    input.tTestResult.pValue < 0.05
  ) {
    pushUniqueFinding(
      "Forest Plot y t-test coinciden en diferencias entre grupos comparados."
    );
  }
  if (
    hasForestOverlap &&
    input.tTestResult &&
    input.tTestResult.pValue >= 0.05
  ) {
    pushUniqueFinding(
      "Forest Plot muestra superposición de IC compatible con el t-test no significativo."
    );
  }
  if (
    hasForestSeparation &&
    input.anovaAnalysis &&
    input.anovaAnalysis.result.pValue < 0.05
  ) {
    pushUniqueFinding(
      "Forest Plot y ANOVA sugieren separación entre grupos experimentales."
    );
  }
  if (hasForestWideUncertainty) {
    pushCaution(
      "Los intervalos de confianza amplios en el Forest Plot indican incertidumbre elevada en las medias."
    );
  }
  if (hasForestSmallSample) {
    pushCaution(
      "Tamaños muestrales pequeños en el Forest Plot limitan la fiabilidad de los IC95%."
    );
  }
  if (hasPCALowVariance) {
    pushCaution(
      "La estructura multivariante no queda completamente representada por dos componentes."
    );
  }
  if (
    input.hierarchicalClusteringAnalysis &&
    input.hierarchicalClusteringAnalysis.seriesCount >= 3 &&
    !hasClusteringClearGroups
  ) {
    pushCaution(
      "El clustering jerárquico no muestra separación clara entre grupos de series."
    );
  }
  if (hasOutliers) {
    pushCaution(
      "Los valores atípicos pueden sesgar medias y pruebas paramétricas."
    );
  }
  if (hasSmallSamples) {
    pushCaution(
      "El tamaño muestral reducido limita la potencia estadística de las pruebas."
    );
  }
  if (confidenceLevel === "low") {
    pushCaution(
      "La confianza del análisis es baja; valide hallazgos antes de tomar decisiones."
    );
  }

  return {
    overallAssessment,
    keyFindings,
    recommendedWorkflow,
    confidenceLevel,
    nextSteps,
    cautions,
  };
};

const getNonParametricModeLabel = (mode: NonParametricMode) =>
  mode === "mann-whitney" ? "Mann-Whitney U" : "Kruskal-Wallis H";

type ScatterMarkerProps = {
  cx?: number;
  cy?: number;
};

const renderMaximumMarker = ({ cx, cy }: ScatterMarkerProps) => {
  if (cx == null || cy == null) return null;

  return (
    <polygon
      points={`${cx},${cy - 6} ${cx - 5},${cy + 4} ${cx + 5},${cy + 4}`}
      fill="var(--app-success)"
    />
  );
};

const renderMinimumMarker = ({ cx, cy }: ScatterMarkerProps) => {
  if (cx == null || cy == null) return null;

  return (
    <polygon
      points={`${cx},${cy + 6} ${cx - 5},${cy - 4} ${cx + 5},${cy - 4}`}
      fill="var(--app-danger)"
    />
  );
};

const evaluateExpression = (expression: string, scope: { x: number }) =>
  evaluate(normalizeExpressionForMath(expression), scope);

const computeSymbolicDerivative = (expression: string): string | null => {
  try {
    const normalized = normalizeExpressionForMath(expression);
    if (!normalized) return null;
    return derivative(normalized, "x").toString();
  } catch {
    return null;
  }
};

const generateMathExpressionPoints = (
  mathExpression: string,
  minX: number,
  maxX: number
): { x: number; y: number }[] => {
  const points: { x: number; y: number }[] = [];

  for (let x = minX; x <= maxX; x += 0.5) {
    const y = toPlottableY(
      evaluate(normalizeExpressionForMath(mathExpression), { x })
    );
    if (y !== undefined) {
      points.push({ x, y });
    }
  }

  return points;
};

const generateDerivativePoints = generateMathExpressionPoints;

const generateIntegralPoints = generateMathExpressionPoints;

const isSymbolVar = (node: MathNode, variable: string): boolean =>
  node.type === "SymbolNode" && (node as SymbolNode).name === variable;

const isConstantValue = (node: MathNode): number | null => {
  if (node.type !== "ConstantNode") return null;
  const value = (node as ConstantNode).value;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
};

const integrateMathNode = (node: MathNode, variable: string): string | null => {
  if (node.type === "ConstantNode") return "0";

  if (node.type === "SymbolNode") {
    return isSymbolVar(node, variable) ? `(${variable})^2 / 2` : "0";
  }

  if (node.type === "ParenthesisNode") {
    return integrateMathNode((node as ParenthesisNode).content, variable);
  }

  if (node.type === "OperatorNode") {
    const opNode = node as OperatorNode;
    const [left, right] = opNode.args;

    if (opNode.op === "+" && left && right) {
      const a = integrateMathNode(left, variable);
      const b = integrateMathNode(right, variable);
      if (!a || !b) return null;
      return `(${a}) + (${b})`;
    }

    if (opNode.op === "-" && left && right) {
      const a = integrateMathNode(left, variable);
      const b = integrateMathNode(right, variable);
      if (!a || !b) return null;
      return `(${a}) - (${b})`;
    }

    if (opNode.op === "-" && left && !right) {
      const a = integrateMathNode(left, variable);
      if (!a) return null;
      return `-(${a})`;
    }

    if (opNode.op === "*" && left && right) {
      const leftConst = isConstantValue(left);
      const rightConst = isConstantValue(right);

      if (leftConst !== null) {
        const inner = integrateMathNode(right, variable);
        if (!inner) return null;
        return `${leftConst} * (${inner})`;
      }

      if (rightConst !== null) {
        const inner = integrateMathNode(left, variable);
        if (!inner) return null;
        return `${rightConst} * (${inner})`;
      }
    }

    if (opNode.op === "/" && left && right) {
      const rightConst = isConstantValue(right);
      if (rightConst !== null && rightConst !== 0) {
        const inner = integrateMathNode(left, variable);
        if (!inner) return null;
        return `(${inner}) / ${rightConst}`;
      }
    }

    if (opNode.op === "^" && left && right) {
      if (isSymbolVar(left, variable)) {
        const exponent = isConstantValue(right);
        if (exponent === null) return null;
        if (exponent === -1) return `log(abs(${variable}))`;
        return `(${variable})^(${exponent + 1}) / (${exponent + 1})`;
      }
    }
  }

  if (node.type === "FunctionNode") {
    const fnNode = node as FunctionNode;
    const fnName = fnNode.fn.name;
    const arg = fnNode.args[0];
    if (!arg || !isSymbolVar(arg, variable)) return null;

    if (fnName === "sin") return `-cos(${variable})`;
    if (fnName === "cos") return `sin(${variable})`;
    if (fnName === "tan") return `-log(abs(cos(${variable})))`;
    if (fnName === "exp") return `exp(${variable})`;
    if (fnName === "log") return `${variable} * log(${variable}) - ${variable}`;
    if (fnName === "sqrt") return `(2/3) * (${variable})^(3/2)`;
    if (fnName === "abs") return `(${variable}) * abs(${variable}) / 2`;
  }

  return null;
};

const computeSymbolicIntegral = (expression: string): string | null => {
  try {
    const normalized = normalizeExpressionForMath(expression);
    if (!normalized) return null;

    const mathIntegral = (evaluate as unknown as {
      integral?: (expr: string, v: string) => { toString(): string };
    }).integral;
    if (typeof mathIntegral === "function") {
      return mathIntegral(normalized, "x").toString();
    }

    const integrated = integrateMathNode(parse(normalized), "x");
    if (!integrated) return null;

    return simplify(integrated).toString();
  } catch {
    return null;
  }
};

const calculateAreaUnderCurve = (
  points: { x: number; y: number }[],
  minX: number,
  maxX: number
): number | null => {
  const inRange = points
    .filter((point) => point.x >= minX && point.x <= maxX)
    .sort((a, b) => a.x - b.x);

  if (inRange.length < 2) return null;

  let area = 0;
  for (let i = 1; i < inRange.length; i++) {
    const dx = inRange[i].x - inRange[i - 1].x;
    area += (dx * (inRange[i].y + inRange[i - 1].y)) / 2;
  }

  return area;
};

const formatMathWarning = (discardedCount: number) =>
  discardedCount > 0
    ? `⚠ Se omitieron ${discardedCount} valores no válidos para algunas curvas.`
    : null;

const GENERIC_RANGE_WARNING =
  "⚠ El rango X actual deja sin graficar una parte importante de una o más curvas. Verifica que el intervalo sea válido para todas las expresiones.";

const normalizeExpressionForWarning = (expression: string) =>
  expression.trim().toLowerCase().replace(/\s+/g, "");

const KNOWN_FUNCTION_WARNINGS: Record<string, string> = {
  "log(x)":
    "⚠ log(x) solo está definida para x > 0. Parte del rango actual queda fuera de su dominio.",
  "ln(x)":
    "⚠ ln(x) solo está definida para x > 0. Parte del rango actual queda fuera de su dominio.",
  "sqrt(x)":
    "⚠ sqrt(x) solo está definida para x ≥ 0. Parte del rango actual queda fuera de su dominio.",
  "1/x":
    "⚠ 1/x presenta una discontinuidad en x = 0 dentro del rango actual.",
  "1/(1-x)":
    "⚠ 1/(1-x) presenta una discontinuidad en x = 1 dentro del rango actual.",
  "asin(x)":
    "⚠ asin(x) solo está definida para x ∈ [-1, 1]. Parte del rango actual queda fuera de su dominio.",
  "acos(x)":
    "⚠ acos(x) solo está definida para x ∈ [-1, 1]. Parte del rango actual queda fuera de su dominio.",
};

const KNOWN_FUNCTION_PATTERNS = [
  "1/(1-x)",
  "asin(x)",
  "acos(x)",
  "log(x)",
  "ln(x)",
  "sqrt(x)",
  "1/x",
] as const;

const getKnownFunctionWarnings = (expression: string): string[] => {
  const normalized = normalizeExpressionForWarning(expression);
  if (normalized in KNOWN_FUNCTION_WARNINGS) {
    return [KNOWN_FUNCTION_WARNINGS[normalized]];
  }

  return KNOWN_FUNCTION_PATTERNS.filter((pattern) =>
    normalized.includes(pattern)
  ).map((pattern) => KNOWN_FUNCTION_WARNINGS[pattern]);
};

const getKnownFunctionWarning = (expression: string): string | null =>
  getKnownFunctionWarnings(expression)[0] ?? null;

const formatRangeWarning = (
  maxPerCurveDiscardRate: number,
  activeExpressions: string[]
): string[] => {
  if (maxPerCurveDiscardRate < 0.35) return [];

  const seen = new Set<string>();
  const warnings: string[] = [];

  for (const expression of activeExpressions) {
    for (const message of getKnownFunctionWarnings(expression)) {
      if (!seen.has(message)) {
        seen.add(message);
        warnings.push(message);
      }
    }
  }

  return warnings.length > 0 ? warnings : [GENERIC_RANGE_WARNING];
};

type DiscardMetrics = {
  globalDiscardRate: number;
  maxPerCurveDiscardRate: number;
  discardedPerCurve: number[];
};

type CurveYMetrics = {
  minObservedY: number | null;
  maxObservedY: number | null;
};

type YMetrics = {
  minObservedY: number | null;
  maxObservedY: number | null;
  perCurve: CurveYMetrics[];
};

type LinearRegressionResult = {
  slope: number;
  intercept: number;
  r2: number;
};

type QuadraticRegressionResult = {
  a: number;
  b: number;
  c: number;
  r2: number;
};

type ExponentialRegressionResult = {
  a: number;
  b: number;
  r2: number;
};

type LogarithmicRegressionResult = {
  intercept: number;
  slope: number;
  r2: number;
};

type PowerRegressionResult = {
  a: number;
  b: number;
  r2: number;
};

type RegressionModel =
  | "none"
  | "linear"
  | "quadratic"
  | "exponential"
  | "logarithmic"
  | "power"
  | "compare";

type RegressionCurve = {
  id: string;
  name: string;
  color: string;
  model: "linear" | "quadratic" | "exponential" | "logarithmic" | "power";
  r2: number;
  points: { x: number; y: number }[];
  slope?: number;
  intercept?: number;
  a?: number;
  b?: number;
  c?: number;
};

type RegressionSeriesStatus = {
  id: string;
  name: string;
  model: "linear" | "quadratic" | "exponential" | "logarithmic" | "power";
  curve: RegressionCurve | null;
  unavailableReason: string | null;
};

type RegressionComparison = {
  id: string;
  name: string;
  color: string;
  linear: LinearRegressionResult | null;
  quadratic: QuadraticRegressionResult | null;
  exponential: ExponentialRegressionResult | null;
  logarithmic: LogarithmicRegressionResult | null;
  power: PowerRegressionResult | null;
  bestModel: "linear" | "quadratic" | "exponential" | "logarithmic" | "power" | null;
  bestR2: number | null;
};

type FitQuality = {
  label: string;
  badge: string;
};

const formatScaleFactor = (factor: number): string => {
  const rounded = Math.round(factor);
  return rounded < 1000
    ? String(rounded)
    : rounded.toLocaleString("es-ES");
};

const countXSteps = (min: number, max: number) => {
  let numX = 0;
  for (let x = min; x <= max; x += 0.5) numX++;
  return numX;
};

const computeDiscardMetrics = (
  discardedCount: number,
  discardedPerCurve: number[],
  numX: number
): DiscardMetrics => {
  const curveCount = discardedPerCurve.length;
  const totalAttempts = numX * curveCount;
  const globalDiscardRate =
    totalAttempts > 0 ? discardedCount / totalAttempts : 0;
  const maxPerCurveDiscardRate =
    numX > 0 && curveCount > 0
      ? Math.max(...discardedPerCurve.map((d) => d / numX))
      : 0;

  return {
    globalDiscardRate,
    maxPerCurveDiscardRate,
    discardedPerCurve,
  };
};

const emptyDiscardMetrics = (): DiscardMetrics => ({
  globalDiscardRate: 0,
  maxPerCurveDiscardRate: 0,
  discardedPerCurve: [],
});

const computeYMetrics = (
  values: number[],
  perCurveValues: number[][] = []
): YMetrics => ({
  minObservedY: values.length > 0 ? Math.min(...values) : null,
  maxObservedY: values.length > 0 ? Math.max(...values) : null,
  perCurve: perCurveValues.map((curveValues) => ({
    minObservedY: curveValues.length > 0 ? Math.min(...curveValues) : null,
    maxObservedY: curveValues.length > 0 ? Math.max(...curveValues) : null,
  })),
});

const calculateLinearRegression = (
  points: { x: number; y: number }[]
): LinearRegressionResult | null => {
  if (points.length < 2) return null;

  const n = points.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (const point of points) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumXX += point.x * point.x;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  const meanY = sumY / n;

  let ssRes = 0;
  let ssTot = 0;
  for (const point of points) {
    const predicted = slope * point.x + intercept;
    ssRes += (point.y - predicted) ** 2;
    ssTot += (point.y - meanY) ** 2;
  }

  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return { slope, intercept, r2 };
};

const solveLinearSystem3x3 = (
  matrix: number[][],
  vector: number[]
): [number, number, number] | null => {
  const augmented = matrix.map((row, i) => [...row, vector[i]]);
  const size = 3;

  for (let col = 0; col < size; col++) {
    let pivotRow = col;
    for (let row = col + 1; row < size; row++) {
      if (Math.abs(augmented[row][col]) > Math.abs(augmented[pivotRow][col])) {
        pivotRow = row;
      }
    }

    if (Math.abs(augmented[pivotRow][col]) < 1e-12) return null;

    if (pivotRow !== col) {
      [augmented[col], augmented[pivotRow]] = [augmented[pivotRow], augmented[col]];
    }

    const pivot = augmented[col][col];
    for (let j = col; j <= size; j++) {
      augmented[col][j] /= pivot;
    }

    for (let row = 0; row < size; row++) {
      if (row === col) continue;
      const factor = augmented[row][col];
      for (let j = col; j <= size; j++) {
        augmented[row][j] -= factor * augmented[col][j];
      }
    }
  }

  return [augmented[0][3], augmented[1][3], augmented[2][3]];
};

const calculateQuadraticRegression = (
  points: { x: number; y: number }[]
): QuadraticRegressionResult | null => {
  if (points.length < 3) return null;

  let sumX = 0;
  let sumX2 = 0;
  let sumX3 = 0;
  let sumX4 = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2Y = 0;

  for (const { x, y } of points) {
    const x2 = x * x;
    sumX += x;
    sumX2 += x2;
    sumX3 += x2 * x;
    sumX4 += x2 * x2;
    sumY += y;
    sumXY += x * y;
    sumX2Y += x2 * y;
  }

  const solution = solveLinearSystem3x3(
    [
      [sumX4, sumX3, sumX2],
      [sumX3, sumX2, sumX],
      [sumX2, sumX, points.length],
    ],
    [sumX2Y, sumXY, sumY]
  );

  if (!solution) return null;

  const [a, b, c] = solution;
  const meanY = sumY / points.length;
  let ssRes = 0;
  let ssTot = 0;

  for (const { x, y } of points) {
    const predicted = a * x * x + b * x + c;
    ssRes += (y - predicted) ** 2;
    ssTot += (y - meanY) ** 2;
  }

  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return { a, b, c, r2 };
};

const calculateExponentialRegression = (
  points: { x: number; y: number }[]
): ExponentialRegressionResult | null => {
  if (points.length < 2) return null;
  if (points.some((point) => point.y <= 0)) return null;

  const transformed = points.map((point) => ({
    x: point.x,
    y: Math.log(point.y),
  }));
  const linear = calculateLinearRegression(transformed);
  if (!linear) return null;

  const a = Math.exp(linear.intercept);
  const b = linear.slope;
  const meanY =
    points.reduce((acc, point) => acc + point.y, 0) / points.length;

  let ssRes = 0;
  let ssTot = 0;
  for (const point of points) {
    const predicted = a * Math.exp(b * point.x);
    ssRes += (point.y - predicted) ** 2;
    ssTot += (point.y - meanY) ** 2;
  }

  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  return { a, b, r2 };
};

const calculateLogarithmicRegression = (
  points: { x: number; y: number }[]
): LogarithmicRegressionResult | null => {
  if (points.length < 2) return null;
  if (points.some((point) => point.x <= 0)) return null;

  const transformed = points.map((point) => ({
    x: Math.log(point.x),
    y: point.y,
  }));
  const linear = calculateLinearRegression(transformed);
  if (!linear) return null;

  const intercept = linear.intercept;
  const slope = linear.slope;
  const meanY =
    points.reduce((acc, point) => acc + point.y, 0) / points.length;

  let ssRes = 0;
  let ssTot = 0;
  for (const point of points) {
    const predicted = intercept + slope * Math.log(point.x);
    ssRes += (point.y - predicted) ** 2;
    ssTot += (point.y - meanY) ** 2;
  }

  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  return { intercept, slope, r2 };
};

const calculatePowerRegression = (
  points: { x: number; y: number }[]
): PowerRegressionResult | null => {
  if (points.length < 2) return null;
  if (points.some((point) => point.x <= 0 || point.y <= 0)) return null;

  const transformed = points.map((point) => ({
    x: Math.log(point.x),
    y: Math.log(point.y),
  }));
  const linear = calculateLinearRegression(transformed);
  if (!linear) return null;

  const a = Math.exp(linear.intercept);
  const b = linear.slope;
  const meanY =
    points.reduce((acc, point) => acc + point.y, 0) / points.length;

  let ssRes = 0;
  let ssTot = 0;
  for (const point of points) {
    const predicted = a * Math.pow(point.x, b);
    ssRes += (point.y - predicted) ** 2;
    ssTot += (point.y - meanY) ** 2;
  }

  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  return { a, b, r2 };
};

const chooseBestRegressionModel = (
  linear: LinearRegressionResult | null,
  quadratic: QuadraticRegressionResult | null,
  exponential: ExponentialRegressionResult | null,
  logarithmic: LogarithmicRegressionResult | null,
  power: PowerRegressionResult | null
): "linear" | "quadratic" | "exponential" | "logarithmic" | "power" | null => {
  const candidates: Array<{
    model: "linear" | "quadratic" | "exponential" | "logarithmic" | "power";
    r2: number;
    complexity: number;
  }> = [];

  if (linear) candidates.push({ model: "linear", r2: linear.r2, complexity: 1 });
  if (logarithmic)
    candidates.push({ model: "logarithmic", r2: logarithmic.r2, complexity: 2 });
  if (exponential)
    candidates.push({ model: "exponential", r2: exponential.r2, complexity: 3 });
  if (power) candidates.push({ model: "power", r2: power.r2, complexity: 4 });
  if (quadratic)
    candidates.push({ model: "quadratic", r2: quadratic.r2, complexity: 5 });

  if (candidates.length === 0) return null;

  let best = candidates[0];
  for (const candidate of candidates.slice(1)) {
    if (candidate.r2 > best.r2 + 0.001) {
      best = candidate;
      continue;
    }

    if (Math.abs(candidate.r2 - best.r2) < 0.001) {
      if (candidate.complexity < best.complexity) {
        best = candidate;
      }
    }
  }

  return best.model;
};

const getFitQuality = (r2: number): FitQuality => {
  if (r2 >= 0.99) return { label: "Excelente ajuste", badge: "🏆 Excelente ajuste" };
  if (r2 >= 0.95) return { label: "Muy buen ajuste", badge: "✓ Muy buen ajuste" };
  if (r2 >= 0.85) return { label: "Buen ajuste", badge: "✓ Buen ajuste" };
  if (r2 >= 0.7) return { label: "Ajuste aceptable", badge: "⚠ Ajuste aceptable" };
  return { label: "Ajuste débil", badge: "⚠ Ajuste débil" };
};

const getRegressionModelLabel = (
  model: "linear" | "quadratic" | "exponential" | "logarithmic" | "power"
) => {
  if (model === "linear") return "Lineal";
  if (model === "logarithmic") return "Logarítmica";
  if (model === "power") return "Potencial";
  if (model === "quadratic") return "Polinómica grado 2";
  return "Exponencial";
};

const getRegressionUnavailableReason = (
  model: "linear" | "quadratic" | "exponential" | "logarithmic" | "power"
) => {
  if (model === "exponential") {
    return "La regresión exponencial requiere que todos los valores Y sean mayores que cero.";
  }
  if (model === "logarithmic") {
    return "La regresión logarítmica requiere que todos los valores X sean mayores que cero.";
  }
  if (model === "power") {
    return "La regresión potencial requiere que todos los valores X e Y sean mayores que cero.";
  }
  if (model === "quadratic") {
    return "La regresión polinómica grado 2 requiere al menos 3 puntos válidos.";
  }
  return "La regresión lineal requiere al menos 2 puntos válidos.";
};

const curveLegendKey = (idx: number) => `curve:${idx}`;
const derivativeLegendKey = (idx: number) => `derivative:${idx}`;
const integralLegendKey = (idx: number) => `integral:${idx}`;
const experimentalLegendKey = (id: string) => `exp:${id}`;
const regressionLegendKey = (id: string) => `regression:${id}`;

const getExperimentalPointReactKey = (
  seriesName: string,
  point: { x: number; y: number },
  index: number
) => `${seriesName}-${point.x}-${point.y}-${index}`;

const mapExperimentalScatterData = (
  seriesName: string,
  points: { x: number; y: number }[]
) =>
  points.map((point, index) => ({
    ...point,
    pointKey: getExperimentalPointReactKey(seriesName, point, index),
  }));

const DERIVATIVE_STROKE_OPACITY = 0.55;
const INTEGRAL_STROKE_OPACITY = 0.5;

const mergeYMetricsWithExperimental = (
  mathMetrics: YMetrics,
  series: ExperimentalSeries[]
): YMetrics => {
  const expYValues = series.flatMap((item) => item.points.map((p) => p.y));
  const expPerSeries = series.map((item) => item.points.map((p) => p.y));

  const combinedValues = [
    ...(mathMetrics.minObservedY != null ? [mathMetrics.minObservedY] : []),
    ...(mathMetrics.maxObservedY != null ? [mathMetrics.maxObservedY] : []),
    ...expYValues,
  ];

  if (combinedValues.length === 0) {
    return { minObservedY: null, maxObservedY: null, perCurve: [] };
  }

  return {
    minObservedY: Math.min(...combinedValues),
    maxObservedY: Math.max(...combinedValues),
    perCurve: [
      ...mathMetrics.perCurve,
      ...expPerSeries.map((values) => ({
        minObservedY: values.length > 0 ? Math.min(...values) : null,
        maxObservedY: values.length > 0 ? Math.max(...values) : null,
      })),
    ],
  };
};

const computeYAxisDomain = (
  yMetrics: YMetrics
): [number, number] | undefined => {
  const { minObservedY, maxObservedY } = yMetrics;

  if (minObservedY == null || maxObservedY == null) {
    return undefined;
  }

  if (minObservedY === maxObservedY) {
    const margin = Math.abs(minObservedY) * 0.1 || 1;
    return [minObservedY - margin, maxObservedY + margin];
  }

  return [
    minObservedY - Math.abs(minObservedY) * 0.1,
    maxObservedY + Math.abs(maxObservedY) * 0.1,
  ];
};

type AxisScaleMode = "linear" | "logX" | "logY" | "logLog";

type ChartScaleSample = { x: number; y: number };

const getAxisScaleModeLabel = (mode: AxisScaleMode): string => {
  if (mode === "logX") return "Semilog X";
  if (mode === "logY") return "Semilog Y";
  if (mode === "logLog") return "Log-Log";
  return "Lineal";
};

const usesLogXScale = (mode: AxisScaleMode) =>
  mode === "logX" || mode === "logLog";

const usesLogYScale = (mode: AxisScaleMode) =>
  mode === "logY" || mode === "logLog";

const getAxisScaleViolations = (
  samples: ChartScaleSample[],
  mode: AxisScaleMode
) => {
  const checkLogX = usesLogXScale(mode);
  const checkLogY = usesLogYScale(mode);

  return {
    hasNonPositiveX: checkLogX && samples.some((sample) => sample.x <= 0),
    hasNonPositiveY: checkLogY && samples.some((sample) => sample.y <= 0),
  };
};

const getAxisScaleWarnings = (
  mode: AxisScaleMode,
  violations: { hasNonPositiveX: boolean; hasNonPositiveY: boolean }
): string[] => {
  const warnings: string[] = [];

  if (violations.hasNonPositiveX && violations.hasNonPositiveY) {
    warnings.push(
      "Existen valores X o Y ≤ 0 incompatibles con escala logarítmica."
    );
    return warnings;
  }

  if (violations.hasNonPositiveX) {
    warnings.push(
      "Existen valores X ≤ 0 que no pueden mostrarse en escala logarítmica."
    );
  }

  if (violations.hasNonPositiveY) {
    warnings.push(
      "Existen valores Y ≤ 0 que no pueden mostrarse en escala logarítmica."
    );
  }

  return warnings;
};

const clampPositiveLogDomain = (
  min: number,
  max: number,
  fallbackMin = 1e-6
): [number, number] | undefined => {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= 0) {
    return undefined;
  }

  const safeMin = min > 0 ? min : fallbackMin;
  const safeMax = max > safeMin ? max : safeMin * 10;
  return [safeMin, safeMax];
};

const adaptYDomainForLogScale = (
  domain: [number, number] | undefined
): [number, number] | undefined => {
  if (!domain) return undefined;
  return clampPositiveLogDomain(domain[0], domain[1]);
};

const collectChartScaleSamples = (
  chartData: Record<string, number>[],
  visibleMinX: number,
  visibleMaxX: number,
  curveIndices: number[],
  experimentalSeries: ExperimentalSeries[],
  extraPoints: { x: number; y: number }[]
): ChartScaleSample[] => {
  const samples: ChartScaleSample[] = [];

  for (const point of chartData) {
    if (point.x < visibleMinX || point.x > visibleMaxX) continue;
    if (!Number.isFinite(point.x)) continue;

    for (const idx of curveIndices) {
      const y = point[`y${idx + 1}`];
      if (typeof y === "number" && Number.isFinite(y)) {
        samples.push({ x: point.x, y });
      }
    }
  }

  for (const series of experimentalSeries) {
    for (const point of series.points) {
      if (
        point.x >= visibleMinX &&
        point.x <= visibleMaxX &&
        Number.isFinite(point.x) &&
        Number.isFinite(point.y)
      ) {
        samples.push({ x: point.x, y: point.y });
      }
    }
  }

  for (const point of extraPoints) {
    if (
      point.x >= visibleMinX &&
      point.x <= visibleMaxX &&
      Number.isFinite(point.x) &&
      Number.isFinite(point.y)
    ) {
      samples.push({ x: point.x, y: point.y });
    }
  }

  return samples;
};

const formatScaleWarning = (yMetrics: YMetrics): string | null => {
  const { minObservedY, maxObservedY, perCurve } = yMetrics;

  if (minObservedY == null || maxObservedY == null || maxObservedY <= 0) {
    return null;
  }

  if (perCurve.length < 2) return null;

  const curveStats = perCurve
    .filter((c) => c.minObservedY != null && c.maxObservedY != null)
    .map((c) => {
      const min = c.minObservedY as number;
      const max = c.maxObservedY as number;
      const maxAbsY = Math.max(Math.abs(min), Math.abs(max));
      const span = max - min;
      const minPositiveSpan = span > 0 ? span : maxAbsY;

      return { maxAbsY, minPositiveSpan };
    })
    .filter((c) => c.minPositiveSpan > 0);

  if (curveStats.length < 2) return null;

  const maxAbsY = Math.max(...curveStats.map((c) => c.maxAbsY));
  const minPositiveSpan = Math.min(...curveStats.map((c) => c.minPositiveSpan));

  if (minPositiveSpan <= 0) return null;

  const factor = maxAbsY / minPositiveSpan;
  if (factor < 100) return null;

  const formattedFactor = formatScaleFactor(factor);
  let message = `⚠ Existe una diferencia de escala de aproximadamente ${formattedFactor}× entre curvas.`;

  if (factor >= 1000) {
    message +=
      "\nConsidere visualizar las curvas por separado o utilizar un rango más acotado.";
  }

  return message;
};

const logDiscardMetrics = (metrics: DiscardMetrics) => {
  console.log("globalDiscardRate", metrics.globalDiscardRate);
  console.log("maxPerCurveDiscardRate", metrics.maxPerCurveDiscardRate);
  console.log("discardedPerCurve", metrics.discardedPerCurve);
};

const logYMetrics = (metrics: YMetrics) => {
  console.log("minObservedY", metrics.minObservedY);
  console.log("maxObservedY", metrics.maxObservedY);
};

type GraphEditorProps = {
  shareGraphId?: string;
};

export function GraphEditor({ shareGraphId }: GraphEditorProps) {
  const [title, setTitle] = useState("");
  const [curves, setCurves] = useState<Curve[]>([
    { id: 1, expression: "", color: DEFAULT_CURVE_COLORS[0] },
  ]);
  const [graphs, setGraphs] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [mathWarning, setMathWarning] = useState<string | null>(null);
  const [rangeWarning, setRangeWarning] = useState<string[]>([]);
  const [discardMetrics, setDiscardMetrics] =
    useState<DiscardMetrics>(emptyDiscardMetrics);
  const [yMetrics, setYMetrics] = useState<YMetrics>(computeYMetrics([]));
  const [scaleWarning, setScaleWarning] = useState<string | null>(null);
  const [selectedGraphId, setSelectedGraphId] = useState<string | null>(null);
  const [shareNotFound, setShareNotFound] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [jsonImportError, setJsonImportError] = useState<string | null>(null);

  const [minX, setMinX] = useState(-10);
  const [maxX, setMaxX] = useState(10);
  const [visibleMinX, setVisibleMinX] = useState(-10);
  const [visibleMaxX, setVisibleMaxX] = useState(10);
  const [autoScaleY, setAutoScaleY] = useState(false);
  const [useSecondaryYAxis, setUseSecondaryYAxis] = useState(false);
  const [regressionModel, setRegressionModel] = useState<RegressionModel>("none");
  const [showDerivative, setShowDerivative] = useState(false);
  const [showIntegral, setShowIntegral] = useState(false);
  const [showIntersections, setShowIntersections] = useState(false);
  const [showCriticalPoints, setShowCriticalPoints] = useState(false);
  const [showRoots, setShowRoots] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showErrorBars, setShowErrorBars] = useState(false);
  const [errorBarMode, setErrorBarMode] = useState<ErrorBarMode>("sd");
  const [showCorrelation, setShowCorrelation] = useState(false);
  const [correlationMethod, setCorrelationMethod] =
    useState<CorrelationMethod>("pearson");
  const [showOutliers, setShowOutliers] = useState(false);
  const [outlierMethod, setOutlierMethod] = useState<OutlierMethod>("iqr");
  const [showHistogram, setShowHistogram] = useState(false);
  const [histogramBins, setHistogramBins] = useState(HISTOGRAM_BINS_DEFAULT);
  const [showBoxPlot, setShowBoxPlot] = useState(false);
  const [showNormality, setShowNormality] = useState(false);
  const [showQQPlot, setShowQQPlot] = useState(false);
  const [showViolinPlot, setShowViolinPlot] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>("correlation");
  const [showBubblePlot, setShowBubblePlot] = useState(false);
  const [showRadarPlot, setShowRadarPlot] = useState(false);
  const [showKernelDensity, setShowKernelDensity] = useState(false);
  const [showForestPlot, setShowForestPlot] = useState(false);
  const [showPCA, setShowPCA] = useState(false);
  const [showScatterMatrix, setShowScatterMatrix] = useState(false);
  const [showParallelCoordinates, setShowParallelCoordinates] = useState(false);
  const [showCorrelationNetwork, setShowCorrelationNetwork] = useState(false);
  const [showMDS, setShowMDS] = useState(false);
  const [showDistanceMatrix, setShowDistanceMatrix] = useState(false);
  const [showSimilarityNetwork, setShowSimilarityNetwork] = useState(false);
  const [showVariableImportance, setShowVariableImportance] = useState(false);
  const [showClusterHeatmap, setShowClusterHeatmap] = useState(false);
  const [showClusteredDistanceHeatmap, setShowClusteredDistanceHeatmap] =
    useState(false);
  const [showMultivariateDashboard, setShowMultivariateDashboard] =
    useState(false);
  const [showManovaExplorer, setShowManovaExplorer] = useState(false);
  const [showLdaExplorer, setShowLdaExplorer] = useState(false);
  const [showCanonicalCorrelationExplorer, setShowCanonicalCorrelationExplorer] =
    useState(false);
  const [showPcrExplorer, setShowPcrExplorer] = useState(false);
  const [showHierarchicalClustering, setShowHierarchicalClustering] =
    useState(false);
  const [showTTest, setShowTTest] = useState(false);
  const [selectedTTestSeriesA, setSelectedTTestSeriesA] = useState<
    string | null
  >(null);
  const [selectedTTestSeriesB, setSelectedTTestSeriesB] = useState<
    string | null
  >(null);
  const [showAnova, setShowAnova] = useState(false);
  const [showPostHoc, setShowPostHoc] = useState(false);
  const [showNonParametric, setShowNonParametric] = useState(false);
  const [nonParametricMode, setNonParametricMode] =
    useState<NonParametricMode>("mann-whitney");
  const [selectedMannWhitneySeriesA, setSelectedMannWhitneySeriesA] = useState<
    string | null
  >(null);
  const [selectedMannWhitneySeriesB, setSelectedMannWhitneySeriesB] =
    useState<string | null>(null);
  const [showStatisticalAdvisor, setShowStatisticalAdvisor] = useState(false);
  const [showScientificReport, setShowScientificReport] = useState(false);
  const [showScientificInterpretation, setShowScientificInterpretation] =
    useState(false);
  const [showScientificAssistant, setShowScientificAssistant] = useState(false);
  const [scientificReportCopied, setScientificReportCopied] = useState(false);
  const [scientificInterpretationCopied, setScientificInterpretationCopied] =
    useState(false);
  const [scientificAssistantCopied, setScientificAssistantCopied] =
    useState(false);
  const [scientificReportPdfExporting, setScientificReportPdfExporting] =
    useState(false);
  const [scientificReportPdfMessage, setScientificReportPdfMessage] = useState<
    string | null
  >(null);
  const [axisScaleMode, setAxisScaleMode] = useState<AxisScaleMode>("linear");
  const [naturalLanguageEnabled, setNaturalLanguageEnabled] = useState(true);
  const [hiddenLegendKeys, setHiddenLegendKeys] = useState<string[]>([]);
  // Curva actualmente seleccionada para los botones de ejemplos
  const [activeCurveIndex, setActiveCurveIndex] = useState<number>(0);
  const [functionSearch, setFunctionSearch] = useState("");
  const [activeWorkspaceSection, setActiveWorkspaceSection] =
    useState<WorkspaceSection>("data");
  const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>(
    () => createDefaultEnabledModules()
  );
  const [analysisInspectorSection, setAnalysisInspectorSection] =
    useState<AnalysisInspectorSection>("visualization");
  const visibleInspectorCategories = useMemo(
    () =>
      ANALYSIS_INSPECTOR_CATEGORIES.filter((category) =>
        isScientificModuleEnabled(enabledModules, category.moduleId)
      ),
    [enabledModules]
  );
  const visibleWorkspaceTabs = useMemo(
    () =>
      WORKSPACE_TABS.filter(
        (tab) =>
          !WORKSPACE_SECTION_MODULE_GATE[tab.id] ||
          isScientificModuleEnabled(
            enabledModules,
            WORKSPACE_SECTION_MODULE_GATE[tab.id]!
          )
      ),
    [enabledModules]
  );
  const activeModuleCount = useMemo(
    () =>
      SCIENTIFIC_MODULES.filter((module) =>
        isScientificModuleEnabled(enabledModules, module.id)
      ).length,
    [enabledModules]
  );
  const activeAnalysisInspectorCategory = getAnalysisInspectorCategory(
    analysisInspectorSection
  );
  const isBasicModuleEnabled = isScientificModuleEnabled(enabledModules, "basic");
  const isMathematicsModuleEnabled = isScientificModuleEnabled(
    enabledModules,
    "mathematics"
  );
  const isStatisticsModuleEnabled = isScientificModuleEnabled(
    enabledModules,
    "statistics"
  );
  const isInferenceModuleEnabled = isScientificModuleEnabled(
    enabledModules,
    "inference"
  );
  const isAssistantModuleEnabled = isScientificModuleEnabled(
    enabledModules,
    "assistant"
  );
  const isReportsModuleEnabled = isScientificModuleEnabled(
    enabledModules,
    "reports"
  );
  const [controlPanelTab, setControlPanelTab] = useState<
    "graph" | "library" | "data"
  >("graph");
  const [experimentalSeries, setExperimentalSeries] = useState<
    ExperimentalSeries[]
  >([]);
  const [selectedDataSourceId, setSelectedDataSourceId] =
    useState<ExperimentalDataSourceId>(DEFAULT_EXPERIMENTAL_DATA_SOURCE_ID);
  const [experimentalImportError, setExperimentalImportError] = useState<
    string | null
  >(null);
  const [preserveAnalysisConfiguration, setPreserveAnalysisConfiguration] =
    useState(false);
  const [currentDatasetInfo, setCurrentDatasetInfo] =
    useState<ImportedDatasetInfo | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    const visible = ANALYSIS_INSPECTOR_CATEGORIES.filter((category) =>
      isScientificModuleEnabled(enabledModules, category.moduleId)
    );
    if (
      visible.length > 0 &&
      !visible.some((category) => category.id === analysisInspectorSection)
    ) {
      setAnalysisInspectorSection(visible[0].id);
    }
  }, [enabledModules, analysisInspectorSection]);

  useEffect(() => {
    if (activeWorkspaceSection === "reports" && !isReportsModuleEnabled) {
      setActiveWorkspaceSection("data");
    }
  }, [activeWorkspaceSection, isReportsModuleEnabled]);

  const toggleScientificModule = (moduleId: string) => {
    setEnabledModules((previous) => ({
      ...previous,
      [moduleId]: !isScientificModuleEnabled(previous, moduleId),
    }));
  };

  const nextCurveIdRef = useRef(2);
  const chartExportRef = useRef<HTMLDivElement>(null);
  const chartInteractionRef = useRef<HTMLDivElement>(null);
  const jsonImportInputRef = useRef<HTMLInputElement>(null);
  const experimentalFileInputRef = useRef<HTMLInputElement>(null);
  const visibleRangeRef = useRef({
    visibleMinX,
    visibleMaxX,
    minX,
    maxX,
  });
  const panStateRef = useRef({
    isPanning: false,
    startX: 0,
    startMin: 0,
    startMax: 0,
  });
  const expression = curves[0]?.expression ?? "";

  const resetVisibleRange = () => {
    setVisibleMinX(minX);
    setVisibleMaxX(maxX);
  };

  const duplicateGraph = () => {
    if (!selectedGraphId) return;

    setTitle(getDuplicateTitle(title));
    setSelectedGraphId(null);
    setHiddenLegendKeys([]);
    setVisibleMinX(minX);
    setVisibleMaxX(maxX);
  };

  const addCurve = () => {
    const id = nextCurveIdRef.current++;
    setCurves((prev) => [
      ...prev,
      { id, expression: "", color: getDefaultColorForIndex(prev.length) },
    ]);
  };

  const removeCurve = (id: number) => {
    setCurves((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((c) => c.id !== id);
    });
  };

  const updateCurveExpression = (id: number, value: string) => {
    setCurves((prev) =>
      prev.map((c) => (c.id === id ? { ...c, expression: value } : c))
    );
  };

  const applyInterpretedExpression = (curveId: number, interpreted: string) => {
    const curveIndex = curves.findIndex((curve) => curve.id === curveId);
    if (curveIndex >= 0) {
      setActiveCurveIndex(curveIndex);
    }
    updateCurveExpression(curveId, interpreted);
    setErrorMessage("");
    setFunctionSearch("");
  };

  const updateCurveColor = (id: number, value: string) => {
    setCurves((prev) =>
      prev.map((c) => (c.id === id ? { ...c, color: value } : c))
    );
  };

  const resetToSingleCurve = (expr: string) => {
    nextCurveIdRef.current = 2;
    setCurves([
      { id: 1, expression: expr, color: getDefaultColorForIndex(0) },
    ]);
  };

  const toggleLegendVisibility = (key: string) => {
    setHiddenLegendKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const removeExperimentalSeries = (id: string) => {
    setExperimentalSeries((prev) => {
      const next = prev.filter((series) => series.id !== id);
      if (next.length === 0) {
        setCurrentDatasetInfo(null);
      }
      return next;
    });
    setHiddenLegendKeys((prev) =>
      prev.filter((key) => key !== experimentalLegendKey(id))
    );
  };

  const exportChartPng = async () => {
    if (
      !chartExportRef.current ||
      (chartData.length === 0 && experimentalSeries.length === 0)
    ) {
      return;
    }

    try {
      const dataUrl = await captureChartAsPngDataUrl(
        chartExportRef.current,
        "png-export"
      );
      if (!dataUrl) return;

      const link = document.createElement("a");
      link.download = getChartExportFileName(title, "png");
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error al exportar PNG:", error);
    }
  };

  const exportChartSvg = async () => {
    if (
      !chartExportRef.current ||
      (chartData.length === 0 && experimentalSeries.length === 0)
    ) {
      return;
    }

    try {
      const dataUrl = await toSvg(chartExportRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = getChartExportFileName(title, "svg");
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error al exportar SVG:", error);
    }
  };

  const exportChartJson = () => {
    const legacyColor =
      HEX_TO_LEGACY_COLOR[curves[0]?.color?.toLowerCase() ?? ""] ?? "blue";
    const graphTitle = title.trim() || expression.trim() || "grafico";

    const payload: GraphJsonExport = {
      title: graphTitle,
      expression: expression.trim(),
      curves: curves.map((c) => ({
        expression: c.expression,
        color: c.color,
      })),
      min_x: minX,
      max_x: maxX,
      auto_scale_y: autoScaleY,
      color: legacyColor,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = getChartExportFileName(title, "json");
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportScientificReportPdf = async () => {
    if (!scientificReport) {
      setScientificReportPdfMessage(
        "No hay reporte disponible para exportar."
      );
      window.setTimeout(() => setScientificReportPdfMessage(null), 4000);
      return;
    }

    setScientificReportPdfExporting(true);
    setScientificReportPdfMessage("Exportando PDF...");

    let chartImageDataUrl: string | null = null;
    if (
      chartExportRef.current &&
      (chartData.length > 0 || experimentalSeries.length > 0)
    ) {
      chartImageDataUrl = await captureChartAsPngDataUrl(
        chartExportRef.current,
        "pdf-export"
      );
    } else {
      console.log(
        "[chart-capture:pdf-export] chartExportRef exists:",
        Boolean(chartExportRef.current),
        "hasChartContent:",
        chartData.length > 0 || experimentalSeries.length > 0
      );
    }

    try {
      await exportScientificReportPdf({
        report: scientificReport,
        chartImageDataUrl,
        statisticalRecommendation,
        datasetInfo: currentDatasetInfo,
      });
      setScientificReportPdfMessage("PDF descargado correctamente.");
    } catch (error) {
      console.error("Error al exportar PDF científico:", error);
      setScientificReportPdfMessage("Error al generar el PDF.");
    } finally {
      setScientificReportPdfExporting(false);
      window.setTimeout(() => setScientificReportPdfMessage(null), 4000);
    }
  };

  const handleJsonImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      const graph = normalizeImportedGraph(parsed);

      if (!graph) {
        setJsonImportError("Archivo de gráfico inválido");
        return;
      }

      setJsonImportError(null);
      loadGraph(graph, { asNew: true });
    } catch {
      setJsonImportError("Archivo de gráfico inválido");
    }
  };

  const resetAnalysisSession = () => {
    setShowStatistics(false);
    setShowErrorBars(false);
    setShowCorrelation(false);
    setShowOutliers(false);
    setShowHistogram(false);
    setShowBoxPlot(false);
    setShowNormality(false);
    setShowQQPlot(false);
    setShowViolinPlot(false);
    setShowHeatmap(false);
    setShowBubblePlot(false);
    setShowRadarPlot(false);
    setShowKernelDensity(false);
    setShowForestPlot(false);
    setShowPCA(false);
    setShowScatterMatrix(false);
    setShowParallelCoordinates(false);
    setShowCorrelationNetwork(false);
    setShowMDS(false);
    setShowDistanceMatrix(false);
    setShowSimilarityNetwork(false);
    setShowVariableImportance(false);
    setShowClusterHeatmap(false);
    setShowClusteredDistanceHeatmap(false);
    setShowMultivariateDashboard(false);
    setShowManovaExplorer(false);
    setShowLdaExplorer(false);
    setShowCanonicalCorrelationExplorer(false);
    setShowPcrExplorer(false);
    setShowHierarchicalClustering(false);
    setShowTTest(false);
    setShowAnova(false);
    setShowPostHoc(false);
    setShowNonParametric(false);
    setShowStatisticalAdvisor(false);
    setShowScientificReport(false);
    setShowScientificInterpretation(false);
    setShowScientificAssistant(false);
    setErrorBarMode("sd");
    setCorrelationMethod("pearson");
    setOutlierMethod("iqr");
    setHeatmapMode("correlation");
    setNonParametricMode("mann-whitney");
    setHistogramBins(HISTOGRAM_BINS_DEFAULT);
    setSelectedTTestSeriesA(null);
    setSelectedTTestSeriesB(null);
    setSelectedMannWhitneySeriesA(null);
    setSelectedMannWhitneySeriesB(null);
    setScientificReportCopied(false);
    setScientificInterpretationCopied(false);
    setScientificAssistantCopied(false);
    setScientificReportPdfExporting(false);
    setScientificReportPdfMessage(null);
    setHiddenLegendKeys([]);
    setRegressionModel("none");
  };

  const handleExperimentalImport = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const source = getExperimentalDataSource(selectedDataSourceId);
    if (!source?.enabled) return;

    try {
      const importedSeries = await importExperimentalDataFile(
        selectedDataSourceId,
        file
      );

      if (!importedSeries || importedSeries.length === 0) {
        setExperimentalImportError("Archivo de datos inválido");
        return;
      }

      setExperimentalImportError(null);
      if (!preserveAnalysisConfiguration) {
        resetAnalysisSession();
      }
      const curveCount = curves.filter((curve) => curve.expression.trim())
        .length;
      const mappedSeries = importedSeries.map((series, index) => ({
        ...series,
        color: getDefaultColorForIndex(curveCount + index),
      }));
      setExperimentalSeries(mappedSeries);
      setCurrentDatasetInfo({
        fileName: file.name,
        importedAt: new Date().toLocaleString(),
        seriesCount: mappedSeries.length,
        observationCount: mappedSeries.reduce(
          (sum, series) => sum + series.points.length,
          0
        ),
      });
    } catch {
      setExperimentalImportError("Archivo de datos inválido");
    }
  };

  const selectedDataSource = getExperimentalDataSource(selectedDataSourceId);
  const canImportExperimentalData = selectedDataSource?.enabled ?? false;

  const resolveCurvesForMath = (sourceCurves: Curve[]): Curve[] =>
    sourceCurves.map((curve) => ({
      ...curve,
      expression: resolveNaturalLanguageExpression(
        curve.expression,
        naturalLanguageEnabled
      ),
    }));

  const generateGraph = (curveSource?: Curve[]) => {
    try {
      const rawCurves = curveSource ?? curves;
      const sourceCurves = naturalLanguageEnabled
        ? resolveCurvesForMath(rawCurves)
        : rawCurves;

      if (naturalLanguageEnabled && !curveSource) {
        setCurves(sourceCurves);
      }
      const points = [];
      let discardedCount = 0;
      const activeCurves = sourceCurves
        .map((c, idx) => ({
          idx,
          expression: c.expression.trim(),
          color: c.color,
        }))
        .filter((c) => c.expression.length > 0);

      const discardedPerCurve = activeCurves.map(() => 0);
      const numX = countXSteps(minX, maxX);
      const validYValues: number[] = [];
      const validYPerCurve = activeCurves.map(() => [] as number[]);

      for (let x = minX; x <= maxX; x += 0.5) {
        const point: Record<string, number> = { x };
        for (let ci = 0; ci < activeCurves.length; ci++) {
          const curve = activeCurves[ci];
          const y = toPlottableY(evaluateExpression(curve.expression, { x }));
          if (y !== undefined) {
            point[`y${curve.idx + 1}`] = y;
            validYValues.push(y);
            validYPerCurve[ci].push(y);
          } else {
            discardedCount++;
            discardedPerCurve[ci]++;
          }
        }

        points.push(point);
      }

      setChartData(points);
      setErrorMessage("");
      setMathWarning(formatMathWarning(discardedCount));
      const metrics = computeDiscardMetrics(
        discardedCount,
        discardedPerCurve,
        numX
      );
      setDiscardMetrics(metrics);
      setRangeWarning(
        formatRangeWarning(
          metrics.maxPerCurveDiscardRate,
          activeCurves.map((c) => c.expression)
        )
      );
      const nextYMetrics = computeYMetrics(validYValues, validYPerCurve);
      setYMetrics(nextYMetrics);
      setScaleWarning(formatScaleWarning(nextYMetrics));
      logDiscardMetrics(metrics);
      logYMetrics(nextYMetrics);
      setVisibleMinX(minX);
      setVisibleMaxX(maxX);
    } catch (error) {
      console.error("Error al generar gráfico:", error);

      setErrorMessage("La expresión matemática es inválida.");
      setMathWarning(null);
      setRangeWarning([]);
      setScaleWarning(null);
      setDiscardMetrics(emptyDiscardMetrics());
      setYMetrics(computeYMetrics([]));
    }
  };

  const graphExpression = (expr: string) => {
    if (activeCurveIndex < 0 || activeCurveIndex >= curves.length) return;

    const trimmedExpr = resolveNaturalLanguageExpression(
      expr.trim(),
      naturalLanguageEnabled
    );
    const nextCurves = curves.map((c, i) =>
      i === activeCurveIndex ? { ...c, expression: trimmedExpr } : c
    );

    setCurves(nextCurves);
    generateGraph(nextCurves);
  };

  const loadGraphs = async () => {
    const { data, error } = await supabase
      .from("graphs")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setGraphs(data);
    }
  };

  const copyShareLink = async () => {
    if (!selectedGraphId) return;

    const url = `${window.location.origin}/graph/${selectedGraphId}`;

    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error("Error al copiar enlace:", error);
    }
  };

  const saveGraph = async () => {
    const resolvedCurves = naturalLanguageEnabled
      ? resolveCurvesForMath(curves)
      : curves;

    if (naturalLanguageEnabled) {
      setCurves(resolvedCurves);
    }

    const primaryExpression = resolvedCurves[0]?.expression ?? expression;
    if (!primaryExpression.trim()) return;

    const graphTitle = title.trim() || primaryExpression;
    const legacyColor =
      HEX_TO_LEGACY_COLOR[curves[0]?.color?.toLowerCase() ?? ""] ?? "blue";

    const graphPayload = {
      title: graphTitle,
      expression: primaryExpression,
      curves: resolvedCurves.map((c) => ({
        expression: c.expression,
        color: c.color,
      })),
      color: legacyColor,
      min_x: minX,
      max_x: maxX,
      auto_scale_y: autoScaleY,
    };

    if (selectedGraphId) {
      const { error } = await supabase
        .from("graphs")
        .update(graphPayload)
        .eq("id", selectedGraphId);

      if (!error) {
        generateGraph();
        loadGraphs();
      }
      return;
    }

    const { error } = await supabase.from("graphs").insert([graphPayload]);

    if (!error) {
      generateGraph();
      loadGraphs();
    }
  };

  const newGraph = () => {
    setSelectedGraphId(null);
    setJsonImportError(null);
    setTitle("");
    resetToSingleCurve("");
    setChartData([]);
    setErrorMessage("");
    setMathWarning(null);
    setRangeWarning([]);
    setScaleWarning(null);
    setDiscardMetrics(emptyDiscardMetrics());
    setYMetrics(computeYMetrics([]));
    setMinX(-10);
    setMaxX(10);
    setVisibleMinX(-10);
    setVisibleMaxX(10);
    setAutoScaleY(false);
    setHiddenLegendKeys([]);
  };

  const loadGraph = (graph: any, options?: { asNew?: boolean }) => {
    setHiddenLegendKeys([]);
    setSelectedGraphId(options?.asNew ? null : graph.id ?? null);
    setJsonImportError(null);
    setTitle(graph.title || graph.expression);
    const dbCurves = graph.curves;
    let nextCurves: Curve[] = [
      {
        id: 1,
        expression: graph.expression ?? "",
        color: getDefaultColorForIndex(0),
      },
    ];

    if (Array.isArray(dbCurves) && dbCurves.length > 0) {
      nextCurves = dbCurves.map((c: any, idx: number) => {
        const curveExpression =
          typeof c === "string" ? c : String(c?.expression ?? "");
        const savedColor =
          typeof c === "object" && c?.color ? String(c.color) : "";

        return {
          id: idx + 1,
          expression: curveExpression,
          color: savedColor || getDefaultColorForIndex(idx),
        };
      });
    }

    nextCurveIdRef.current = nextCurves.length + 1;
    setCurves(nextCurves);
    setMinX(Number(graph.min_x ?? -10));
    setMaxX(Number(graph.max_x ?? 10));
    setAutoScaleY(graph.auto_scale_y === true);

    try {
      const points = [];
      let discardedCount = 0;
      const activeCurves = nextCurves
        .map((c, idx) => ({
          idx,
          expression: c.expression.trim(),
          color: c.color,
        }))
        .filter((c) => c.expression.length > 0);

      const loadMinX = Number(graph.min_x ?? -10);
      const loadMaxX = Number(graph.max_x ?? 10);
      const discardedPerCurve = activeCurves.map(() => 0);
      const numX = countXSteps(loadMinX, loadMaxX);
      const validYValues: number[] = [];
      const validYPerCurve = activeCurves.map(() => [] as number[]);

      for (let x = loadMinX; x <= loadMaxX; x += 0.5) {
        const point: Record<string, number> = { x };
        for (let ci = 0; ci < activeCurves.length; ci++) {
          const curve = activeCurves[ci];
          const y = toPlottableY(evaluateExpression(curve.expression, { x }));
          if (y !== undefined) {
            point[`y${curve.idx + 1}`] = y;
            validYValues.push(y);
            validYPerCurve[ci].push(y);
          } else {
            discardedCount++;
            discardedPerCurve[ci]++;
          }
        }
        points.push(point);
      }

      setChartData(points);
      setErrorMessage("");
      setMathWarning(formatMathWarning(discardedCount));
      const metrics = computeDiscardMetrics(
        discardedCount,
        discardedPerCurve,
        numX
      );
      setDiscardMetrics(metrics);
      setRangeWarning(
        formatRangeWarning(
          metrics.maxPerCurveDiscardRate,
          activeCurves.map((c) => c.expression)
        )
      );
      const nextYMetrics = computeYMetrics(validYValues, validYPerCurve);
      setYMetrics(nextYMetrics);
      setScaleWarning(formatScaleWarning(nextYMetrics));
      logDiscardMetrics(metrics);
      logYMetrics(nextYMetrics);
      setVisibleMinX(loadMinX);
      setVisibleMaxX(loadMaxX);
    } catch (error) {
      console.error(error);
      setErrorMessage("La expresión matemática es inválida.");
      setMathWarning(null);
      setRangeWarning([]);
      setScaleWarning(null);
      setDiscardMetrics(emptyDiscardMetrics());
      setYMetrics(computeYMetrics([]));
    }
  };

  const deleteGraph = async (id: string) => {
    const confirmDelete = confirm("¿Eliminar este gráfico?");

    if (!confirmDelete) return;

    const { error } = await supabase.from("graphs").delete().eq("id", id);

    if (!error) {
      if (selectedGraphId === id) {
        newGraph();
      }
      loadGraphs();
    }
  };

  const getGraphDisplayTitle = (graph: any) =>
    graph.title?.trim() || graph.expression;

  const isEditing = selectedGraphId !== null;
  const filteredFunctionLibrary = useMemo(
    () => filterFunctionLibrary(functionSearch),
    [functionSearch]
  );
  const functionLibraryHasResults = filteredFunctionLibrary.length > 0;
  const activeCurveNaturalLanguagePreview = useMemo(() => {
    if (!naturalLanguageEnabled) return null;

    const raw = curves[activeCurveIndex]?.expression?.trim() ?? "";
    if (!raw) return null;

    const translated = translateNaturalLanguageToMath(raw);
    if (expressionsAreEquivalent(raw, translated)) return null;

    return translated;
  }, [naturalLanguageEnabled, curves, activeCurveIndex]);
  const activeCurves = curves
    .map((c, idx) => ({
      idx,
      expression: c.expression.trim(),
      color: c.color,
    }))
    .filter((c) => c.expression.length > 0);
  const visibleExperimentalSeries = useMemo(
    () =>
      experimentalSeries.filter(
        (series) => !hiddenLegendKeys.includes(experimentalLegendKey(series.id))
      ),
    [experimentalSeries, hiddenLegendKeys]
  );
  const visibleActiveCurves = useMemo(
    () =>
      activeCurves.filter(
        (curve) => !hiddenLegendKeys.includes(curveLegendKey(curve.idx))
      ),
    [activeCurves, hiddenLegendKeys]
  );
  const derivativeCurves = useMemo<DerivativeCurve[]>(() => {
    if (!showDerivative) return [];

    return visibleActiveCurves.reduce<DerivativeCurve[]>((acc, curve) => {
      const derivativeExpression = computeSymbolicDerivative(curve.expression);
      if (!derivativeExpression) return acc;

      const points = generateDerivativePoints(
        derivativeExpression,
        visibleMinX,
        visibleMaxX
      );
      if (points.length === 0) return acc;

      acc.push({
        id: curve.idx,
        sourceExpression: curve.expression,
        expression: derivativeExpression,
        color: curve.color,
        points,
      });
      return acc;
    }, []);
  }, [showDerivative, visibleActiveCurves, visibleMinX, visibleMaxX]);
  const visibleDerivativeCurves = useMemo(
    () =>
      derivativeCurves.filter(
        (curve) => !hiddenLegendKeys.includes(derivativeLegendKey(curve.id))
      ),
    [derivativeCurves, hiddenLegendKeys]
  );
  const integralCurves = useMemo<IntegralCurve[]>(() => {
    if (!showIntegral) return [];

    return visibleActiveCurves.reduce<IntegralCurve[]>((acc, curve) => {
      const integralExpression = computeSymbolicIntegral(curve.expression);
      if (!integralExpression) return acc;

      const points = generateIntegralPoints(
        integralExpression,
        visibleMinX,
        visibleMaxX
      );
      if (points.length === 0) return acc;

      acc.push({
        id: String(curve.idx),
        sourceExpression: curve.expression,
        expression: integralExpression,
        color: curve.color,
        points,
      });
      return acc;
    }, []);
  }, [showIntegral, visibleActiveCurves, visibleMinX, visibleMaxX]);
  const visibleIntegralCurves = useMemo(
    () =>
      integralCurves.filter(
        (curve) => !hiddenLegendKeys.includes(integralLegendKey(Number(curve.id)))
      ),
    [integralCurves, hiddenLegendKeys]
  );
  const curveAreaResults = useMemo(() => {
    if (!showIntegral) return [];

    return visibleActiveCurves
      .map((curve) => {
        const points = generateMathExpressionPoints(
          curve.expression,
          visibleMinX,
          visibleMaxX
        );
        const area = calculateAreaUnderCurve(points, visibleMinX, visibleMaxX);

        return {
          id: curve.idx,
          expression: curve.expression,
          area,
        };
      })
      .filter(
        (item): item is { id: number; expression: string; area: number } =>
          item.area !== null
      );
  }, [showIntegral, visibleActiveCurves, visibleMinX, visibleMaxX]);
  const intersectionAnalysis = useMemo(() => {
    if (!showIntersections || chartData.length === 0) {
      return { intersections: [], identicalPairMessage: null };
    }

    return calculateCurveIntersections(
      chartData,
      visibleActiveCurves,
      visibleMinX,
      visibleMaxX
    );
  }, [
    showIntersections,
    chartData,
    visibleActiveCurves,
    visibleMinX,
    visibleMaxX,
  ]);
  const curveIntersections = intersectionAnalysis.intersections;
  const identicalCurvesIntersectionMessage =
    intersectionAnalysis.identicalPairMessage;
  const intersectionChartPoints = useMemo(
    () => curveIntersections.map(({ x, y }) => ({ x, y })),
    [curveIntersections]
  );
  const criticalPoints = useMemo(() => {
    if (!showCriticalPoints || chartData.length === 0) {
      return [];
    }

    return calculateCriticalPoints(
      chartData,
      visibleActiveCurves,
      visibleMinX,
      visibleMaxX
    );
  }, [
    showCriticalPoints,
    chartData,
    visibleActiveCurves,
    visibleMinX,
    visibleMaxX,
  ]);
  const criticalMaxChartPoints = useMemo(
    () =>
      criticalPoints
        .filter((point) => point.type === "maximum")
        .map(({ x, y }) => ({ x, y })),
    [criticalPoints]
  );
  const criticalMinChartPoints = useMemo(
    () =>
      criticalPoints
        .filter((point) => point.type === "minimum")
        .map(({ x, y }) => ({ x, y })),
    [criticalPoints]
  );
  const curveRoots = useMemo(() => {
    if (!showRoots || chartData.length === 0) {
      return [];
    }

    return calculateCurveRoots(
      chartData,
      visibleActiveCurves,
      visibleMinX,
      visibleMaxX
    );
  }, [showRoots, chartData, visibleActiveCurves, visibleMinX, visibleMaxX]);
  const rootChartPoints = useMemo(
    () => curveRoots.map(({ x, y }) => ({ x, y })),
    [curveRoots]
  );
  const experimentalStatistics = useMemo(
    () => calculateExperimentalStatistics(visibleExperimentalSeries),
    [visibleExperimentalSeries]
  );
  const errorBarSeries = useMemo(
    () =>
      buildErrorBarSeries(
        experimentalStatistics,
        visibleExperimentalSeries,
        errorBarMode
      ),
    [experimentalStatistics, visibleExperimentalSeries, errorBarMode]
  );
  const correlationAnalysis = useMemo(
    () =>
      visibleExperimentalSeries.length >= 2
        ? buildCorrelationAnalysis(
            visibleExperimentalSeries,
            correlationMethod
          )
        : { results: [], unavailablePairs: [], matrix: [] },
    [visibleExperimentalSeries, correlationMethod]
  );
  const experimentalOutliers = useMemo(
    () =>
      detectExperimentalOutliers(visibleExperimentalSeries, outlierMethod),
    [visibleExperimentalSeries, outlierMethod]
  );
  const outlierSummaryBySeries = useMemo(
    () =>
      summarizeOutliersBySeries(
        visibleExperimentalSeries,
        experimentalOutliers
      ),
    [visibleExperimentalSeries, experimentalOutliers]
  );
  const outlierChartPoints = useMemo(
    () =>
      experimentalOutliers.map((outlier) => ({
        x: outlier.x,
        y: outlier.y,
        __outlier: true as const,
        seriesName: outlier.seriesName,
        method: outlier.method,
        score: outlier.score,
      })),
    [experimentalOutliers]
  );
  const seriesHistograms = useMemo(
    () => generateSeriesHistograms(visibleExperimentalSeries, histogramBins),
    [visibleExperimentalSeries, histogramBins]
  );
  const boxPlotAnalyses = useMemo(
    () => calculateBoxPlotStatisticsForSeries(visibleExperimentalSeries),
    [visibleExperimentalSeries]
  );
  const normalityAnalyses = useMemo(
    () => analyzeNormalityForSeries(visibleExperimentalSeries),
    [visibleExperimentalSeries]
  );
  const qqPlotAnalyses = useMemo(
    () => calculateQQPlotsForSeries(visibleExperimentalSeries),
    [visibleExperimentalSeries]
  );
  const qqPlotAnalysesBySeriesName = useMemo(
    () =>
      new Map(
        qqPlotAnalyses.map((analysis) => [analysis.seriesName, analysis])
      ),
    [qqPlotAnalyses]
  );
  const violinPlotAnalyses = useMemo(
    () => calculateViolinPlotsForSeries(visibleExperimentalSeries),
    [visibleExperimentalSeries]
  );
  const violinPlotAnalysesBySeriesName = useMemo(
    () =>
      new Map(
        violinPlotAnalyses.map((analysis) => [analysis.seriesName, analysis])
      ),
    [violinPlotAnalyses]
  );
  const correlationHeatmap = useMemo(
    () => buildCorrelationHeatmap(visibleExperimentalSeries),
    [visibleExperimentalSeries]
  );
  const valuesHeatmap = useMemo(
    () => buildValuesHeatmap(visibleExperimentalSeries),
    [visibleExperimentalSeries]
  );
  const heatmapAnalysis = useMemo(
    () =>
      heatmapMode === "correlation" ? correlationHeatmap : valuesHeatmap,
    [heatmapMode, correlationHeatmap, valuesHeatmap]
  );
  const bubblePlotAnalysis = useMemo(
    () => buildBubblePlotAnalysis(visibleExperimentalSeries),
    [visibleExperimentalSeries]
  );
  const radarPlotAnalysis = useMemo(
    () => buildRadarPlotAnalysis(experimentalStatistics),
    [experimentalStatistics]
  );
  const radarSeriesColors = useMemo(
    () =>
      new Map(
        visibleExperimentalSeries.map((item) => [item.name, item.color])
      ),
    [visibleExperimentalSeries]
  );
  const kernelDensityAnalyses = useMemo(
    () => calculateKernelDensityAnalysesForSeries(visibleExperimentalSeries),
    [visibleExperimentalSeries]
  );
  const integratedNormalityAssessment = useMemo(
    () =>
      buildIntegratedNormalityAssessment(
        normalityAnalyses,
        qqPlotAnalyses,
        violinPlotAnalyses,
        kernelDensityAnalyses
      ),
    [
      normalityAnalyses,
      qqPlotAnalyses,
      violinPlotAnalyses,
      kernelDensityAnalyses,
    ]
  );
  const normalityConsensus = useMemo(
    () =>
      buildNormalityConsensus(
        normalityAnalyses,
        qqPlotAnalyses,
        violinPlotAnalyses,
        kernelDensityAnalyses
      ),
    [
      normalityAnalyses,
      qqPlotAnalyses,
      violinPlotAnalyses,
      kernelDensityAnalyses,
    ]
  );
  const integratedNormalityBySeriesName = useMemo(
    () =>
      new Map(
        integratedNormalityAssessment.seriesAssessments.map((assessment) => [
          assessment.seriesName,
          assessment,
        ])
      ),
    [integratedNormalityAssessment]
  );
  const forestPlotAnalysis = useMemo(
    () => buildForestPlotAnalysis(experimentalStatistics),
    [experimentalStatistics]
  );
  const pcaObservationCount = useMemo(() => {
    if (visibleExperimentalSeries.length < 2) return 0;
    const counts = visibleExperimentalSeries.map((item) => item.points.length);
    const firstCount = counts[0] ?? 0;
    if (firstCount < 3) return 0;
    if (!counts.every((count) => count === firstCount)) return 0;
    return firstCount;
  }, [visibleExperimentalSeries]);
  const pcaAnalysis = useMemo(
    () =>
      pcaObservationCount > 0
        ? buildPCAAnalysis(visibleExperimentalSeries)
        : null,
    [visibleExperimentalSeries, pcaObservationCount]
  );
  const scatterMatrixAnalysis = useMemo(
    () => buildScatterMatrixAnalysis(visibleExperimentalSeries),
    [visibleExperimentalSeries]
  );
  const parallelCoordinatesAnalysis = useMemo(
    () => buildParallelCoordinatesAnalysis(visibleExperimentalSeries),
    [visibleExperimentalSeries]
  );
  const correlationNetworkAnalysis = useMemo(
    () => buildCorrelationNetworkAnalysis(visibleExperimentalSeries),
    [visibleExperimentalSeries]
  );
  const mdsAnalysis = useMemo(
    () => buildMDSAnalysis(visibleExperimentalSeries),
    [visibleExperimentalSeries]
  );
  const distanceMatrixAnalysis = useMemo(
    () => buildDistanceMatrixAnalysis(visibleExperimentalSeries),
    [visibleExperimentalSeries]
  );
  const similarityNetworkAnalysis = useMemo(
    () => buildSimilarityNetworkAnalysis(distanceMatrixAnalysis),
    [distanceMatrixAnalysis]
  );
  const variableImportanceAnalysis = useMemo(
    () =>
      buildVariableImportanceAnalysis({
        series: visibleExperimentalSeries,
        pcaAnalysis,
        correlationNetworkAnalysis,
        similarityNetworkAnalysis,
        distanceMatrixAnalysis,
        experimentalStatistics,
      }),
    [
      visibleExperimentalSeries,
      pcaAnalysis,
      correlationNetworkAnalysis,
      similarityNetworkAnalysis,
      distanceMatrixAnalysis,
      experimentalStatistics,
    ]
  );
  const hierarchicalClusteringAnalysis = useMemo(
    () => buildHierarchicalClusteringAnalysis(visibleExperimentalSeries),
    [visibleExperimentalSeries]
  );
  const clusterHeatmapAnalysis = useMemo(
    () =>
      buildClusterHeatmapAnalysis(
        distanceMatrixAnalysis,
        hierarchicalClusteringAnalysis
      ),
    [distanceMatrixAnalysis, hierarchicalClusteringAnalysis]
  );
  const clusteredDistanceHeatmapAnalysis = useMemo(
    () =>
      buildClusteredDistanceHeatmapAnalysis(
        clusterHeatmapAnalysis,
        hierarchicalClusteringAnalysis,
        distanceMatrixAnalysis
      ),
    [
      clusterHeatmapAnalysis,
      hierarchicalClusteringAnalysis,
      distanceMatrixAnalysis,
    ]
  );
  const multivariateDashboardAnalysis = useMemo(
    () =>
      buildMultivariateDashboardAnalysis({
        pcaAnalysis,
        hierarchicalClusteringAnalysis,
        mdsAnalysis,
        variableImportanceAnalysis,
        similarityNetworkAnalysis,
        distanceMatrixAnalysis,
      }),
    [
      pcaAnalysis,
      hierarchicalClusteringAnalysis,
      mdsAnalysis,
      variableImportanceAnalysis,
      similarityNetworkAnalysis,
      distanceMatrixAnalysis,
    ]
  );
  const manovaExplorerAnalysis = useMemo(
    () =>
      buildManovaExplorerAnalysis({
        series: visibleExperimentalSeries,
        pcaAnalysis,
        distanceMatrixAnalysis,
        hierarchicalClusteringAnalysis,
        similarityNetworkAnalysis,
        observationCount: pcaObservationCount,
      }),
    [
      visibleExperimentalSeries,
      pcaAnalysis,
      distanceMatrixAnalysis,
      hierarchicalClusteringAnalysis,
      similarityNetworkAnalysis,
      pcaObservationCount,
    ]
  );
  const ldaExplorerAnalysis = useMemo(
    () =>
      buildLdaExplorerAnalysis({
        pcaAnalysis,
        manovaExplorerAnalysis,
        variableImportanceAnalysis,
        hierarchicalClusteringAnalysis,
      }),
    [
      pcaAnalysis,
      manovaExplorerAnalysis,
      variableImportanceAnalysis,
      hierarchicalClusteringAnalysis,
    ]
  );
  const canonicalCorrelationExplorerAnalysis = useMemo(
    () =>
      buildCanonicalCorrelationExplorerAnalysis({
        correlationNetworkAnalysis,
        similarityNetworkAnalysis,
        variableImportanceAnalysis,
        manovaExplorerAnalysis,
        ldaExplorerAnalysis,
      }),
    [
      correlationNetworkAnalysis,
      similarityNetworkAnalysis,
      variableImportanceAnalysis,
      manovaExplorerAnalysis,
      ldaExplorerAnalysis,
    ]
  );
  const pcrExplorerAnalysis = useMemo(
    () =>
      buildPcrExplorerAnalysis({
        pcaAnalysis,
        variableImportanceAnalysis,
        ldaExplorerAnalysis,
        canonicalCorrelationExplorerAnalysis,
      }),
    [
      pcaAnalysis,
      variableImportanceAnalysis,
      ldaExplorerAnalysis,
      canonicalCorrelationExplorerAnalysis,
    ]
  );
  const tTestSeriesA = useMemo(
    () =>
      resolveTTestSeriesSelection(
        visibleExperimentalSeries,
        selectedTTestSeriesA,
        0
      ),
    [visibleExperimentalSeries, selectedTTestSeriesA]
  );
  const tTestSeriesB = useMemo(
    () =>
      resolveTTestSeriesSelection(
        visibleExperimentalSeries,
        selectedTTestSeriesB,
        1,
        tTestSeriesA?.id ?? null
      ),
    [visibleExperimentalSeries, selectedTTestSeriesB, tTestSeriesA]
  );
  const tTestResult = useMemo(() => {
    if (!tTestSeriesA || !tTestSeriesB) return null;
    if (tTestSeriesA.id === tTestSeriesB.id) return null;
    return calculateIndependentTTest(tTestSeriesA, tTestSeriesB);
  }, [tTestSeriesA, tTestSeriesB]);
  const anovaAnalysis = useMemo(
    () => calculateOneWayAnova(visibleExperimentalSeries),
    [visibleExperimentalSeries]
  );
  const postHocComparisons = useMemo(
    () => (anovaAnalysis ? calculateTukeyComparisons(anovaAnalysis) : []),
    [anovaAnalysis]
  );
  const hasVisibleExperimentalSeries = visibleExperimentalSeries.length > 0;
  const hasEnoughSeriesForCorrelation = visibleExperimentalSeries.length >= 2;
  const hasEnoughSeriesForScatterMatrix = isScatterMatrixInputValid(
    visibleExperimentalSeries
  );
  const hasEnoughSeriesForParallelCoordinates = isParallelCoordinatesInputValid(
    visibleExperimentalSeries
  );
  const hasEnoughSeriesForCorrelationNetwork = isCorrelationNetworkInputValid(
    visibleExperimentalSeries
  );
  const hasEnoughSeriesForMDS = isMDSInputValid(visibleExperimentalSeries);
  const hasEnoughSeriesForDistanceMatrix = isDistanceMatrixInputValid(
    visibleExperimentalSeries
  );
  const hasEnoughSeriesForSimilarityNetwork = isDistanceMatrixInputValid(
    visibleExperimentalSeries
  );
  const hasEnoughSeriesForVariableImportance = isVariableImportanceInputValid(
    visibleExperimentalSeries
  );
  const hasEnoughSeriesForClusterHeatmap =
    visibleExperimentalSeries.length >= 2 &&
    hierarchicalClusteringAnalysis !== null;
  const hasEnoughSeriesForClusteredDistanceHeatmap =
    hierarchicalClusteringAnalysis !== null &&
    distanceMatrixAnalysis !== null;
  const hasEnoughSeriesForMultivariateDashboard = canBuildMultivariateDashboard(
    pcaAnalysis,
    hierarchicalClusteringAnalysis,
    mdsAnalysis,
    variableImportanceAnalysis,
    similarityNetworkAnalysis
  );
  const hasEnoughSeriesForManovaExplorer =
    visibleExperimentalSeries.length >= 2 && pcaAnalysis !== null;
  const hasEnoughSeriesForLdaExplorer =
    pcaAnalysis !== null && variableImportanceAnalysis !== null;
  const hasEnoughSeriesForCanonicalCorrelationExplorer =
    correlationNetworkAnalysis !== null &&
    variableImportanceAnalysis !== null;
  const hasEnoughSeriesForPcrExplorer =
    pcaAnalysis !== null && variableImportanceAnalysis !== null;
  const hasEnoughSeriesForAnova = visibleExperimentalSeries.length >= 3;
  const isPostHocAvailable = hasEnoughSeriesForAnova && anovaAnalysis !== null;
  const mannWhitneySeriesA = useMemo(
    () =>
      resolveTTestSeriesSelection(
        visibleExperimentalSeries,
        selectedMannWhitneySeriesA,
        0
      ),
    [visibleExperimentalSeries, selectedMannWhitneySeriesA]
  );
  const mannWhitneySeriesB = useMemo(
    () =>
      resolveTTestSeriesSelection(
        visibleExperimentalSeries,
        selectedMannWhitneySeriesB,
        1,
        mannWhitneySeriesA?.id ?? null
      ),
    [visibleExperimentalSeries, selectedMannWhitneySeriesB, mannWhitneySeriesA]
  );
  const mannWhitneyResult = useMemo(() => {
    if (!mannWhitneySeriesA || !mannWhitneySeriesB) return null;
    if (mannWhitneySeriesA.id === mannWhitneySeriesB.id) return null;
    return calculateMannWhitney(mannWhitneySeriesA, mannWhitneySeriesB);
  }, [mannWhitneySeriesA, mannWhitneySeriesB]);
  const kruskalWallisResult = useMemo(
    () => calculateKruskalWallis(visibleExperimentalSeries),
    [visibleExperimentalSeries]
  );
  const statisticalRecommendation = useMemo(
    () =>
      buildStatisticalRecommendation(
        visibleExperimentalSeries,
        normalityAnalyses,
        showCorrelation
      ),
    [visibleExperimentalSeries, normalityAnalyses, showCorrelation]
  );
  const scientificReport = useMemo(
    () =>
      generateScientificReport({
        graphTitle: title,
        series: visibleExperimentalSeries,
        experimentalStatistics,
        normalityAnalyses,
        qqPlotAnalyses,
        violinPlotAnalyses,
        correlationHeatmap,
        valuesHeatmap,
        bubblePlotAnalysis,
        radarPlotAnalysis,
        kernelDensityAnalyses,
        forestPlotAnalysis,
        pcaAnalysis,
        pcaObservationCount,
        hierarchicalClusteringAnalysis,
        scatterMatrixAnalysis,
        parallelCoordinatesAnalysis,
        correlationNetworkAnalysis,
        mdsAnalysis,
        distanceMatrixAnalysis,
        similarityNetworkAnalysis,
        variableImportanceAnalysis,
        clusterHeatmapAnalysis,
        clusteredDistanceHeatmapAnalysis,
        multivariateDashboardAnalysis,
        manovaExplorerAnalysis,
        ldaExplorerAnalysis,
        canonicalCorrelationExplorerAnalysis,
        pcrExplorerAnalysis,
        correlationAnalysis,
        correlationMethod,
        experimentalOutliers,
        outlierMethod,
        tTestResult,
        anovaAnalysis,
        postHocComparisons,
        mannWhitneyResult,
        kruskalWallisResult,
        statisticalRecommendation,
        datasetInfo: currentDatasetInfo,
      }),
    [
      title,
      visibleExperimentalSeries,
      experimentalStatistics,
      normalityAnalyses,
      qqPlotAnalyses,
      violinPlotAnalyses,
      correlationHeatmap,
      valuesHeatmap,
      bubblePlotAnalysis,
      radarPlotAnalysis,
      kernelDensityAnalyses,
      forestPlotAnalysis,
      pcaAnalysis,
      pcaObservationCount,
      hierarchicalClusteringAnalysis,
      scatterMatrixAnalysis,
      parallelCoordinatesAnalysis,
      correlationNetworkAnalysis,
      mdsAnalysis,
      distanceMatrixAnalysis,
      similarityNetworkAnalysis,
      variableImportanceAnalysis,
      clusterHeatmapAnalysis,
      clusteredDistanceHeatmapAnalysis,
      multivariateDashboardAnalysis,
      manovaExplorerAnalysis,
      ldaExplorerAnalysis,
      canonicalCorrelationExplorerAnalysis,
      pcrExplorerAnalysis,
      correlationAnalysis,
      correlationMethod,
      experimentalOutliers,
      outlierMethod,
      tTestResult,
      anovaAnalysis,
      postHocComparisons,
      mannWhitneyResult,
      kruskalWallisResult,
      statisticalRecommendation,
      currentDatasetInfo,
    ]
  );
  const scientificInterpretation = useMemo(
    () =>
      generateScientificInterpretation({
        series: visibleExperimentalSeries,
        correlationAnalysis,
        normalityAnalyses,
        qqPlotAnalyses,
        violinPlotAnalyses,
        correlationHeatmap,
        valuesHeatmap,
        bubblePlotAnalysis,
        radarPlotAnalysis,
        kernelDensityAnalyses,
        forestPlotAnalysis,
        pcaAnalysis,
        scatterMatrixAnalysis,
        parallelCoordinatesAnalysis,
        correlationNetworkAnalysis,
        mdsAnalysis,
        distanceMatrixAnalysis,
        similarityNetworkAnalysis,
        variableImportanceAnalysis,
        clusterHeatmapAnalysis,
        clusteredDistanceHeatmapAnalysis,
        multivariateDashboardAnalysis,
        manovaExplorerAnalysis,
        ldaExplorerAnalysis,
        canonicalCorrelationExplorerAnalysis,
        pcrExplorerAnalysis,
        hierarchicalClusteringAnalysis,
        experimentalOutliers,
        tTestResult,
        anovaAnalysis,
        postHocComparisons,
        mannWhitneyResult,
        kruskalWallisResult,
        statisticalRecommendation,
        scientificReport,
      }),
    [
      visibleExperimentalSeries,
      correlationAnalysis,
      normalityAnalyses,
      qqPlotAnalyses,
      violinPlotAnalyses,
      correlationHeatmap,
      valuesHeatmap,
      bubblePlotAnalysis,
      radarPlotAnalysis,
      kernelDensityAnalyses,
      forestPlotAnalysis,
      pcaAnalysis,
      scatterMatrixAnalysis,
      parallelCoordinatesAnalysis,
      correlationNetworkAnalysis,
      mdsAnalysis,
      distanceMatrixAnalysis,
      similarityNetworkAnalysis,
      variableImportanceAnalysis,
      clusterHeatmapAnalysis,
      clusteredDistanceHeatmapAnalysis,
      multivariateDashboardAnalysis,
      manovaExplorerAnalysis,
      ldaExplorerAnalysis,
      canonicalCorrelationExplorerAnalysis,
      pcrExplorerAnalysis,
      hierarchicalClusteringAnalysis,
      experimentalOutliers,
      tTestResult,
      anovaAnalysis,
      postHocComparisons,
      mannWhitneyResult,
      kruskalWallisResult,
      statisticalRecommendation,
      scientificReport,
    ]
  );
  const scientificAssistantReport = useMemo(
    () =>
      generateScientificAssistantReport({
        series: visibleExperimentalSeries,
        experimentalStatistics,
        correlationAnalysis,
        normalityAnalyses,
        qqPlotAnalyses,
        violinPlotAnalyses,
        correlationHeatmap,
        valuesHeatmap,
        bubblePlotAnalysis,
        radarPlotAnalysis,
        kernelDensityAnalyses,
        forestPlotAnalysis,
        pcaAnalysis,
        scatterMatrixAnalysis,
        parallelCoordinatesAnalysis,
        correlationNetworkAnalysis,
        mdsAnalysis,
        distanceMatrixAnalysis,
        similarityNetworkAnalysis,
        variableImportanceAnalysis,
        clusterHeatmapAnalysis,
        clusteredDistanceHeatmapAnalysis,
        multivariateDashboardAnalysis,
        manovaExplorerAnalysis,
        ldaExplorerAnalysis,
        canonicalCorrelationExplorerAnalysis,
        pcrExplorerAnalysis,
        hierarchicalClusteringAnalysis,
        showHierarchicalClustering,
        showClusterHeatmap,
        showClusteredDistanceHeatmap,
        showPCA,
        experimentalOutliers,
        tTestResult,
        anovaAnalysis,
        postHocComparisons,
        mannWhitneyResult,
        kruskalWallisResult,
        statisticalRecommendation,
        scientificReport,
        scientificInterpretation,
      }),
    [
      visibleExperimentalSeries,
      experimentalStatistics,
      correlationAnalysis,
      normalityAnalyses,
      qqPlotAnalyses,
      violinPlotAnalyses,
      correlationHeatmap,
      valuesHeatmap,
      bubblePlotAnalysis,
      radarPlotAnalysis,
      kernelDensityAnalyses,
      forestPlotAnalysis,
      pcaAnalysis,
      scatterMatrixAnalysis,
      parallelCoordinatesAnalysis,
      correlationNetworkAnalysis,
      mdsAnalysis,
      distanceMatrixAnalysis,
      similarityNetworkAnalysis,
      variableImportanceAnalysis,
      clusterHeatmapAnalysis,
      clusteredDistanceHeatmapAnalysis,
      multivariateDashboardAnalysis,
      manovaExplorerAnalysis,
      ldaExplorerAnalysis,
      canonicalCorrelationExplorerAnalysis,
      pcrExplorerAnalysis,
      hierarchicalClusteringAnalysis,
      showHierarchicalClustering,
      showClusterHeatmap,
      showClusteredDistanceHeatmap,
      showPCA,
      experimentalOutliers,
      tTestResult,
      anovaAnalysis,
      postHocComparisons,
      mannWhitneyResult,
      kruskalWallisResult,
      statisticalRecommendation,
      scientificReport,
      scientificInterpretation,
    ]
  );
  const handleCopyScientificReport = async () => {
    if (!scientificReport) return;

    try {
      await navigator.clipboard.writeText(
        formatScientificReportAsText(scientificReport)
      );
      setScientificReportCopied(true);
      window.setTimeout(() => setScientificReportCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };
  const handleCopyScientificInterpretation = async () => {
    if (!scientificInterpretation) return;

    try {
      await navigator.clipboard.writeText(
        formatScientificInterpretationAsText(scientificInterpretation)
      );
      setScientificInterpretationCopied(true);
      window.setTimeout(() => setScientificInterpretationCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };
  const handleCopyScientificAssistantReport = async () => {
    if (!scientificAssistantReport) return;

    try {
      await navigator.clipboard.writeText(
        formatScientificAssistantReportAsText(scientificAssistantReport)
      );
      setScientificAssistantCopied(true);
      window.setTimeout(() => setScientificAssistantCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };
  const overlayMathYValues = useMemo(
    () => [
      ...visibleDerivativeCurves.flatMap((curve) =>
        curve.points.map((point) => point.y)
      ),
      ...visibleIntegralCurves.flatMap((curve) =>
        curve.points.map((point) => point.y)
      ),
    ],
    [visibleDerivativeCurves, visibleIntegralCurves]
  );
  const mathYMetrics = useMemo(() => {
    const values = visibleActiveCurves.flatMap((curve) =>
      chartData
        .map((point) => point[`y${curve.idx + 1}`] as number | undefined)
        .filter(
          (value): value is number =>
            typeof value === "number" && Number.isFinite(value)
        )
    );
    const combinedValues = [...values, ...overlayMathYValues];

    return computeYMetrics(combinedValues);
  }, [visibleActiveCurves, chartData, overlayMathYValues]);
  const experimentalYMetrics = useMemo(() => {
    const values = visibleExperimentalSeries.flatMap((series) =>
      series.points.map((point) => point.y)
    );

    return computeYMetrics(values);
  }, [visibleExperimentalSeries]);
  const displayYMetrics = useMemo(() => {
    const merged = mergeYMetricsWithExperimental(
      yMetrics,
      visibleExperimentalSeries
    );
    if (overlayMathYValues.length === 0) return merged;

    const combinedValues = [
      ...(merged.minObservedY != null ? [merged.minObservedY] : []),
      ...(merged.maxObservedY != null ? [merged.maxObservedY] : []),
      ...overlayMathYValues,
    ];

    if (combinedValues.length === 0) return merged;

    return {
      ...merged,
      minObservedY: Math.min(...combinedValues),
      maxObservedY: Math.max(...combinedValues),
    };
  }, [yMetrics, visibleExperimentalSeries, overlayMathYValues]);
  const regressionComparisons = useMemo<RegressionComparison[]>(
    () =>
      visibleExperimentalSeries.map((series) => {
        const linear = calculateLinearRegression(series.points);
        const quadratic = calculateQuadraticRegression(series.points);
        const exponential = calculateExponentialRegression(series.points);
        const logarithmic = calculateLogarithmicRegression(series.points);
        const power = calculatePowerRegression(series.points);
        const bestModel = chooseBestRegressionModel(
          linear,
          quadratic,
          exponential,
          logarithmic,
          power
        );
        const bestR2 =
          bestModel === "linear"
            ? linear?.r2 ?? null
            : bestModel === "logarithmic"
              ? logarithmic?.r2 ?? null
            : bestModel === "exponential"
              ? exponential?.r2 ?? null
            : bestModel === "power"
              ? power?.r2 ?? null
            : bestModel === "quadratic"
              ? quadratic?.r2 ?? null
              : null;

        return {
          id: series.id,
          name: series.name,
          color: series.color,
          linear,
          quadratic,
          exponential,
          logarithmic,
          power,
          bestModel,
          bestR2,
        };
      }),
    [visibleExperimentalSeries]
  );
  const regressionCurves = useMemo<RegressionCurve[]>(
    () => {
      if (regressionModel === "none") return [];

      return regressionComparisons.reduce<RegressionCurve[]>(
        (acc, comparison) => {
          const {
            id,
            name,
            color,
            linear,
            quadratic,
            exponential,
            logarithmic,
            power,
            bestModel,
          } =
            comparison;
          const series = visibleExperimentalSeries.find((item) => item.id === id);
          if (!series) return acc;

          const xs = series.points.map((point) => point.x);
          const minX = Math.min(...xs);
          const maxX = Math.max(...xs);

          if (regressionModel === "linear") {
            if (!linear) return acc;

            acc.push({
              id,
              name,
              color,
              model: "linear" as const,
              r2: linear.r2,
              slope: linear.slope,
              intercept: linear.intercept,
              points: [
                {
                  x: minX,
                  y: linear.slope * minX + linear.intercept,
                },
                {
                  x: maxX,
                  y: linear.slope * maxX + linear.intercept,
                },
              ],
            });
            return acc;
          }

          if (regressionModel === "quadratic") {
            if (!quadratic) return acc;

            const samples = 100;
            const span = maxX - minX;
            const points =
              span === 0
                ? [
                    {
                      x: minX,
                      y:
                        quadratic.a * minX * minX +
                        quadratic.b * minX +
                        quadratic.c,
                    },
                  ]
                : Array.from({ length: samples }, (_, index) => {
                    const t = index / (samples - 1);
                    const x = minX + span * t;
                    return {
                      x,
                      y: quadratic.a * x * x + quadratic.b * x + quadratic.c,
                    };
                  });

            acc.push({
              id,
              name,
              color,
              model: "quadratic" as const,
              r2: quadratic.r2,
              a: quadratic.a,
              b: quadratic.b,
              c: quadratic.c,
              points,
            });
            return acc;
          }

          if (regressionModel === "logarithmic") {
            if (!logarithmic) return acc;

            const positiveX = xs.filter((x) => x > 0);
            if (positiveX.length === 0) return acc;
            const minPositiveX = Math.min(...positiveX);
            const startX =
              minX <= 0 ? Math.max(minPositiveX, 0.000001) : minX;
            const endX = maxX;
            if (endX <= 0 || startX > endX) return acc;

            const samples = 100;
            const span = endX - startX;
            const points =
              span === 0
                ? [{ x: startX, y: logarithmic.intercept + logarithmic.slope * Math.log(startX) }]
                : Array.from({ length: samples }, (_, index) => {
                    const t = index / (samples - 1);
                    const x = startX + span * t;
                    return {
                      x,
                      y: logarithmic.intercept + logarithmic.slope * Math.log(x),
                    };
                  });

            acc.push({
              id,
              name,
              color,
              model: "logarithmic" as const,
              r2: logarithmic.r2,
              slope: logarithmic.slope,
              intercept: logarithmic.intercept,
              points,
            });
            return acc;
          }

          if (regressionModel === "exponential") {
            if (!exponential) return acc;

            const samples = 100;
            const span = maxX - minX;
            const points =
              span === 0
                ? [{ x: minX, y: exponential.a * Math.exp(exponential.b * minX) }]
                : Array.from({ length: samples }, (_, index) => {
                    const t = index / (samples - 1);
                    const x = minX + span * t;
                    return { x, y: exponential.a * Math.exp(exponential.b * x) };
                  });

            acc.push({
              id,
              name,
              color,
              model: "exponential" as const,
              r2: exponential.r2,
              a: exponential.a,
              b: exponential.b,
              points,
            });
            return acc;
          }

          if (regressionModel === "power") {
            if (!power) return acc;

            const positiveX = xs.filter((x) => x > 0);
            if (positiveX.length === 0) return acc;
            const minPositiveX = Math.min(...positiveX);
            const startX =
              minX <= 0 ? Math.max(minPositiveX, 0.000001) : minX;
            const endX = maxX;
            if (endX <= 0 || startX > endX) return acc;

            const samples = 100;
            const span = endX - startX;
            const points =
              span === 0
                ? [{ x: startX, y: power.a * Math.pow(startX, power.b) }]
                : Array.from({ length: samples }, (_, index) => {
                    const t = index / (samples - 1);
                    const x = startX + span * t;
                    return { x, y: power.a * Math.pow(x, power.b) };
                  });

            acc.push({
              id,
              name,
              color,
              model: "power" as const,
              r2: power.r2,
              a: power.a,
              b: power.b,
              points,
            });
            return acc;
          }

          if (bestModel === "linear" && linear) {
            acc.push({
              id,
              name,
              color,
              model: "linear" as const,
              r2: linear.r2,
              slope: linear.slope,
              intercept: linear.intercept,
              points: [
                {
                  x: minX,
                  y: linear.slope * minX + linear.intercept,
                },
                {
                  x: maxX,
                  y: linear.slope * maxX + linear.intercept,
                },
              ],
            });
            return acc;
          }

          if (bestModel === "logarithmic" && logarithmic) {
            const positiveX = xs.filter((x) => x > 0);
            if (positiveX.length === 0) return acc;
            const minPositiveX = Math.min(...positiveX);
            const startX =
              minX <= 0 ? Math.max(minPositiveX, 0.000001) : minX;
            const endX = maxX;
            if (endX <= 0 || startX > endX) return acc;

            const samples = 100;
            const span = endX - startX;
            const points =
              span === 0
                ? [{ x: startX, y: logarithmic.intercept + logarithmic.slope * Math.log(startX) }]
                : Array.from({ length: samples }, (_, index) => {
                    const t = index / (samples - 1);
                    const x = startX + span * t;
                    return {
                      x,
                      y: logarithmic.intercept + logarithmic.slope * Math.log(x),
                    };
                  });

            acc.push({
              id,
              name,
              color,
              model: "logarithmic" as const,
              r2: logarithmic.r2,
              slope: logarithmic.slope,
              intercept: logarithmic.intercept,
              points,
            });
            return acc;
          }

          if (bestModel === "exponential" && exponential) {
            const samples = 100;
            const span = maxX - minX;
            const points =
              span === 0
                ? [{ x: minX, y: exponential.a * Math.exp(exponential.b * minX) }]
                : Array.from({ length: samples }, (_, index) => {
                    const t = index / (samples - 1);
                    const x = minX + span * t;
                    return { x, y: exponential.a * Math.exp(exponential.b * x) };
                  });

            acc.push({
              id,
              name,
              color,
              model: "exponential" as const,
              r2: exponential.r2,
              a: exponential.a,
              b: exponential.b,
              points,
            });
            return acc;
          }

          if (bestModel === "power" && power) {
            const positiveX = xs.filter((x) => x > 0);
            if (positiveX.length === 0) return acc;
            const minPositiveX = Math.min(...positiveX);
            const startX =
              minX <= 0 ? Math.max(minPositiveX, 0.000001) : minX;
            const endX = maxX;
            if (endX <= 0 || startX > endX) return acc;

            const samples = 100;
            const span = endX - startX;
            const points =
              span === 0
                ? [{ x: startX, y: power.a * Math.pow(startX, power.b) }]
                : Array.from({ length: samples }, (_, index) => {
                    const t = index / (samples - 1);
                    const x = startX + span * t;
                    return { x, y: power.a * Math.pow(x, power.b) };
                  });

            acc.push({
              id,
              name,
              color,
              model: "power" as const,
              r2: power.r2,
              a: power.a,
              b: power.b,
              points,
            });
            return acc;
          }

          if (bestModel !== "quadratic" || !quadratic) return acc;
          const samples = 100;
          const span = maxX - minX;
          const points =
            span === 0
              ? [
                  {
                    x: minX,
                    y:
                      quadratic.a * minX * minX +
                      quadratic.b * minX +
                      quadratic.c,
                  },
                ]
              : Array.from({ length: samples }, (_, index) => {
                  const t = index / (samples - 1);
                  const x = minX + span * t;
                  return {
                    x,
                    y: quadratic.a * x * x + quadratic.b * x + quadratic.c,
                  };
                });

          acc.push({
            id,
            name,
            color,
            model: "quadratic" as const,
            r2: quadratic.r2,
            a: quadratic.a,
            b: quadratic.b,
            c: quadratic.c,
            points,
          });
          return acc;
        },
        []
      );
    },
    [visibleExperimentalSeries, regressionModel, regressionComparisons]
  );
  const visibleRegressionCurves = useMemo(
    () =>
      regressionCurves.filter(
        (curve) => !hiddenLegendKeys.includes(regressionLegendKey(curve.id))
      ),
    [regressionCurves, hiddenLegendKeys]
  );
  const selectedRegressionSeriesStatus = useMemo<RegressionSeriesStatus[]>(() => {
    if (regressionModel === "none" || regressionModel === "compare") return [];

    const selectedModel = regressionModel as
      | "linear"
      | "quadratic"
      | "exponential"
      | "logarithmic"
      | "power";
    return visibleExperimentalSeries.map((series) => {
      const curve =
        regressionCurves.find((item) => item.id === series.id) ?? null;

      return {
        id: series.id,
        name: series.name,
        model: selectedModel,
        curve,
        unavailableReason: curve ? null : getRegressionUnavailableReason(selectedModel),
      };
    });
  }, [regressionModel, visibleExperimentalSeries, regressionCurves]);
  const useDualYAxis =
    useSecondaryYAxis &&
    visibleActiveCurves.length > 0 &&
    visibleExperimentalSeries.length > 0;
  const mathYAxisDomain = autoScaleY
    ? computeYAxisDomain(mathYMetrics)
    : undefined;
  const experimentalYAxisDomain = autoScaleY
    ? computeYAxisDomain(experimentalYMetrics)
    : undefined;
  const yAxisDomain = autoScaleY
    ? computeYAxisDomain(displayYMetrics)
    : undefined;
  const usesLogX = usesLogXScale(axisScaleMode);
  const usesLogY = usesLogYScale(axisScaleMode);
  const chartScaleSamples = useMemo(
    () =>
      collectChartScaleSamples(
        chartData,
        visibleMinX,
        visibleMaxX,
        visibleActiveCurves.map((curve) => curve.idx),
        visibleExperimentalSeries,
        [
          ...visibleDerivativeCurves.flatMap((curve) => curve.points),
          ...visibleIntegralCurves.flatMap((curve) => curve.points),
          ...regressionCurves.flatMap((curve) => curve.points),
          ...curveIntersections.map(({ x, y }) => ({ x, y })),
          ...criticalPoints.map(({ x, y }) => ({ x, y })),
          ...curveRoots.map(({ x, y }) => ({ x, y })),
          ...errorBarSeries.flatMap((bar) => [
            { x: bar.meanX, y: bar.meanY },
            { x: bar.meanX, y: bar.lower },
            { x: bar.meanX, y: bar.upper },
          ]),
        ]
      ),
    [
      chartData,
      visibleMinX,
      visibleMaxX,
      visibleActiveCurves,
      visibleExperimentalSeries,
      visibleDerivativeCurves,
      visibleIntegralCurves,
      regressionCurves,
      curveIntersections,
      criticalPoints,
      curveRoots,
      errorBarSeries,
    ]
  );
  const axisScaleViolations = useMemo(
    () => getAxisScaleViolations(chartScaleSamples, axisScaleMode),
    [chartScaleSamples, axisScaleMode]
  );
  const axisScaleWarnings = useMemo(
    () => getAxisScaleWarnings(axisScaleMode, axisScaleViolations),
    [axisScaleMode, axisScaleViolations]
  );
  const xAxisDomain = useMemo((): [number, number] => {
    if (!usesLogX) {
      return [visibleMinX, visibleMaxX];
    }

    const clamped = clampPositiveLogDomain(visibleMinX, visibleMaxX);
    if (clamped) return clamped;

    const positiveX = chartScaleSamples
      .filter((sample) => sample.x > 0)
      .map((sample) => sample.x);
    if (positiveX.length === 0) {
      return [1e-6, 1];
    }

    return [Math.min(...positiveX), Math.max(...positiveX)];
  }, [usesLogX, visibleMinX, visibleMaxX, chartScaleSamples]);
  const mathYAxisDomainForChart = useMemo(
    () =>
      usesLogY ? adaptYDomainForLogScale(mathYAxisDomain) : mathYAxisDomain,
    [usesLogY, mathYAxisDomain]
  );
  const experimentalYAxisDomainForChart = useMemo(
    () =>
      usesLogY
        ? adaptYDomainForLogScale(experimentalYAxisDomain)
        : experimentalYAxisDomain,
    [usesLogY, experimentalYAxisDomain]
  );
  const yAxisDomainForChart = useMemo(
    () => (usesLogY ? adaptYDomainForLogScale(yAxisDomain) : yAxisDomain),
    [usesLogY, yAxisDomain]
  );
  const hasChartContent =
    chartData.length > 0 || experimentalSeries.length > 0;
  const hasLegendItems =
    activeCurves.length > 0 ||
    derivativeCurves.length > 0 ||
    integralCurves.length > 0 ||
    experimentalSeries.length > 0 ||
    regressionCurves.length > 0;
  const hasActiveMathCurves = activeCurves.length > 0;
  const hasMathResults =
    (regressionModel === "compare" && regressionComparisons.length > 0) ||
    (regressionModel !== "compare" &&
      selectedRegressionSeriesStatus.length > 0) ||
    (showDerivative && derivativeCurves.length > 0) ||
    (showIntegral && integralCurves.length > 0) ||
    (showIntegral && curveAreaResults.length > 0);
  const showMathResultsPanel =
    (isMathematicsModuleEnabled &&
      (hasMathResults ||
        showDerivative ||
        showIntegral ||
        showIntersections ||
        showCriticalPoints ||
        showRoots ||
        regressionModel !== "none")) ||
    (isStatisticsModuleEnabled &&
      (showStatistics ||
        showErrorBars ||
        showCorrelation ||
        showOutliers ||
        showHistogram ||
        showBoxPlot ||
        showNormality ||
        showQQPlot ||
        showViolinPlot ||
        showHeatmap ||
        showBubblePlot ||
        showRadarPlot ||
        showKernelDensity ||
        showForestPlot ||
        showPCA ||
        showScatterMatrix ||
        showParallelCoordinates ||
        showCorrelationNetwork ||
        showMDS ||
        showDistanceMatrix ||
        showSimilarityNetwork ||
        showVariableImportance ||
        showClusterHeatmap ||
        showClusteredDistanceHeatmap ||
        showMultivariateDashboard ||
        showManovaExplorer ||
        showLdaExplorer ||
        showCanonicalCorrelationExplorer ||
        showPcrExplorer ||
        showHierarchicalClustering)) ||
    (isInferenceModuleEnabled &&
      (showTTest || showAnova || showPostHoc || showNonParametric)) ||
    (isAssistantModuleEnabled &&
      (showStatisticalAdvisor ||
        showScientificInterpretation ||
        showScientificAssistant));
  const composedChartData = useMemo(() => {
    if (chartData.length > 0) return chartData;

    // Las series experimentales se dibujan con Scatter por serie; no fusionar
    // filas por X compartido (evita claves duplicadas en ComposedChart).
    return chartData;
  }, [chartData]);
  const chartTheme = useMemo(() => getChartTheme(themeMode), [themeMode]);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === "dark") {
        setThemeMode("dark");
      }
    } catch {
      // ignore storage errors
    }
    setThemeLoaded(true);
  }, []);

  useEffect(() => {
    if (!themeLoaded) return;

    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch {
      // ignore storage errors
    }
  }, [themeMode, themeLoaded]);

  useEffect(() => {
    loadGraphs();
  }, []);

  useEffect(() => {
    if (!shareGraphId) return;

    let cancelled = false;

    const loadSharedGraph = async () => {
      setShareNotFound(false);

      const { data, error } = await supabase
        .from("graphs")
        .select("*")
        .eq("id", shareGraphId)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        setShareNotFound(true);
        return;
      }

      await loadGraphs();
      if (!cancelled) {
        loadGraph(data);
      }
    };

    loadSharedGraph();

    return () => {
      cancelled = true;
    };
  }, [shareGraphId]);

  useEffect(() => {
    visibleRangeRef.current = { visibleMinX, visibleMaxX, minX, maxX };
  }, [visibleMinX, visibleMaxX, minX, maxX]);

  useEffect(() => {
    const el = chartInteractionRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { visibleMinX, visibleMaxX, minX, maxX } = visibleRangeRef.current;
      const span = visibleMaxX - visibleMinX;
      if (span <= 0) return;

      const rect = el.getBoundingClientRect();
      const ratio = Math.min(
        1,
        Math.max(0, (e.clientX - rect.left) / rect.width)
      );
      const focusX = visibleMinX + ratio * span;
      const zoomFactor = e.deltaY > 0 ? 1.15 : 1 / 1.15;
      const dataSpan = maxX - minX;
      const newSpan = Math.max(0.5, Math.min(dataSpan, span * zoomFactor));
      const newMin = focusX - ratio * newSpan;
      const newMax = focusX + (1 - ratio) * newSpan;
      const [clampedMin, clampedMax] = clampVisibleXRange(
        newMin,
        newMax,
        minX,
        maxX
      );

      setVisibleMinX(clampedMin);
      setVisibleMaxX(clampedMax);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [chartData.length, experimentalSeries.length]);

  useEffect(() => {
    const endPan = () => {
      panStateRef.current.isPanning = false;
    };

    window.addEventListener("mouseup", endPan);
    return () => window.removeEventListener("mouseup", endPan);
  }, []);

  const handleChartMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;

    panStateRef.current = {
      isPanning: true,
      startX: e.clientX,
      startMin: visibleMinX,
      startMax: visibleMaxX,
    };
  };

  const handleChartMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!panStateRef.current.isPanning) return;

    const el = chartInteractionRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const { startX, startMin, startMax } = panStateRef.current;
    const span = startMax - startMin;
    const deltaData = (-(e.clientX - startX) / rect.width) * span;
    const [clampedMin, clampedMax] = clampVisibleXRange(
      startMin + deltaData,
      startMax + deltaData,
      minX,
      maxX
    );

    setVisibleMinX(clampedMin);
    setVisibleMaxX(clampedMax);
  };

  const handleChartMouseUp = () => {
    panStateRef.current.isPanning = false;
  };

  return (
    <main className={`flex min-h-screen flex-col lg:flex-row ${getAppShell(themeMode)}`}>
      <aside className="w-full lg:w-[280px] lg:max-w-[300px] lg:min-h-screen shrink-0 bg-[var(--app-surface)] border-b lg:border-b-0 lg:border-r border-[var(--app-border)] flex flex-col transition-colors duration-200">
        <div className="px-4 py-3 border-b border-[var(--app-border)]">
          <h2 className={`${panelHeading} text-base`}>📊 Dashboard Científico</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          <button
            onClick={newGraph}
            className={`w-full bg-emerald-600 hover:bg-emerald-700 ${btnPrimary} text-sm font-semibold`}
          >
            + Nuevo gráfico
          </button>

          <div className={sidebarDivider} />

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
              📈 Mis gráficos
            </p>
            <p className="text-xs text-[var(--app-text-muted)]">
              {graphs.length}{" "}
              {graphs.length === 1 ? "gráfico guardado" : "gráficos guardados"}
            </p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
              {graphs.map((graph) => (
                <button
                  key={graph.id}
                  onClick={() => loadGraph(graph)}
                  className={`w-full text-left border rounded-lg px-2.5 py-2 text-sm transition-all duration-200 ${
                    selectedGraphId === graph.id
                      ? "bg-[var(--app-accent)]/10 border-[var(--app-accent)] text-[var(--app-heading)] shadow-sm ring-1 ring-[var(--app-accent)]/25 font-medium"
                      : "border-[var(--app-border)] text-[var(--app-text)] hover:bg-[var(--app-surface-muted)] hover:border-[var(--app-text-muted)]"
                  }`}
                >
                  <span className="line-clamp-2">
                    {getGraphDisplayTitle(graph)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <DashboardSection title="Módulos" icon="🧩" defaultOpen>
            <p className="text-xs text-[var(--app-text-muted)] mb-2">
              Módulos activos: {activeModuleCount} de {SCIENTIFIC_MODULES.length}
            </p>
            <div className="space-y-2">
              {SCIENTIFIC_MODULES.map((module) => (
                <ScientificModuleCard
                  key={module.id}
                  module={module}
                  enabled={isScientificModuleEnabled(enabledModules, module.id)}
                  onToggle={() => toggleScientificModule(module.id)}
                />
              ))}
            </div>
          </DashboardSection>

          <DashboardSection title="Herramientas" icon="🧠" defaultOpen={false}>
            <div
              className={`${sidebarNavItem} opacity-60 cursor-not-allowed`}
              aria-disabled
            >
              <span>🧠 Asistente IA</span>
              <span className={sidebarSoonBadge}>Soon</span>
            </div>
            <div
              className={`${sidebarNavItem} opacity-60 cursor-not-allowed`}
              aria-disabled
            >
              <span>📄 Reportes</span>
              <span className="text-xs text-[var(--app-text-muted)]">
                Próximamente
              </span>
            </div>
          </DashboardSection>

          <DashboardSection title="Recursos" icon="📚" defaultOpen={false}>
            <button
              type="button"
              onClick={() => {
                setActiveWorkspaceSection("data");
                setControlPanelTab("library");
              }}
              className={`${sidebarNavItem} hover:bg-[var(--app-surface-muted)] text-left`}
            >
              Biblioteca de funciones
            </button>
            <div
              className={`${sidebarNavItem} opacity-60 cursor-not-allowed`}
              aria-disabled
            >
              <span>🕘 Historial</span>
              <span className="text-xs text-[var(--app-text-muted)]">
                Próximamente
              </span>
            </div>
          </DashboardSection>

          <DashboardSection title="Sistema" icon="⚙" defaultOpen>
            <div
              className={`${contentPanel} flex items-center justify-between gap-2 py-2`}
            >
              <span className="text-sm text-[var(--app-text)]">Tema oscuro</span>
              <label className={`${toggleShell} cursor-pointer shrink-0`}>
                <input
                  type="checkbox"
                  className={toggleInput}
                  checked={themeMode === "dark"}
                  onChange={(e) =>
                    setThemeMode(e.target.checked ? "dark" : "light")
                  }
                  aria-label="Alternar tema oscuro"
                />
                <span className={toggleTrackBg} aria-hidden />
                <span className={toggleThumb} aria-hidden />
              </label>
            </div>
            <div className="flex items-center justify-between gap-2 px-2.5 py-1 text-xs text-[var(--app-text-muted)]">
              <span>☀ Claro</span>
              <span>🌙 Oscuro</span>
            </div>
            <div
              className={`${sidebarNavItem} opacity-60 cursor-not-allowed`}
              aria-disabled
            >
              <span>Configuración</span>
              <span className="text-xs text-[var(--app-text-muted)]">
                Próximamente
              </span>
            </div>
          </DashboardSection>
        </div>
      </aside>

      <div className="flex-1 min-w-0 overflow-auto">
        <div className="w-full px-3 sm:px-5 lg:px-6 xl:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5">
          <header className="pb-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--app-heading)] tracking-tight">
              Scientific Graph AI
            </h1>
            <p className="text-[var(--app-text-muted)] mt-1 text-sm sm:text-base">
              Visualiza, guarda y gestiona tus funciones matemáticas
            </p>
          </header>

          <nav
            className="flex flex-wrap gap-2 border-b border-[var(--app-border)] pb-3"
            role="tablist"
            aria-label="Workspace científico"
          >
            {visibleWorkspaceTabs.map((tab) => (
              <WorkspaceTab
                key={tab.id}
                section={tab.id}
                label={tab.label}
                isActive={activeWorkspaceSection === tab.id}
                onSelect={setActiveWorkspaceSection}
              />
            ))}
          </nav>

          {!isEditing && activeWorkspaceSection === "data" && (
            <>
              <section className={card}>
                <h2 className={panelHeading}>Bienvenido a Scientific Graph</h2>
                <ul className="mt-3 space-y-2 text-sm text-[var(--app-text)]">
                  <li>• Crear gráficos matemáticos</li>
                  <li>• Analizar datos experimentales</li>
                  <li>• Ajustar regresiones</li>
                  <li>• Calcular derivadas</li>
                  <li>• Calcular integrales</li>
                </ul>
              </section>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {(
                  [
                    ["📈", "Funciones"],
                    ["📊", "Datos"],
                    ["📐", "Análisis"],
                    ["📄", "Exportación"],
                  ] as const
                ).map(([icon, label]) => (
                  <div
                    key={label}
                    className={`${contentPanel} flex items-center gap-2 opacity-60 cursor-not-allowed`}
                    aria-disabled
                  >
                    <span aria-hidden>{icon}</span>
                    <span className="font-medium text-[var(--app-heading)]">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          <section
            className={activeWorkspaceSection === "data" ? "" : "hidden"}
            aria-hidden={activeWorkspaceSection !== "data"}
          >
            <h2 className={sectionLabel}>📁 Datos</h2>
            <p className={`${panelHeadingSubtext} -mt-2 mb-3`}>
              Funciones, biblioteca, series experimentales e importaciones
            </p>
            <div className="space-y-3">
              <NotebookSection
                title="Constructor de gráfico"
                icon="📐"
                subtitle="Define título y expresión matemática"
                defaultOpen
                badge={isEditing ? "Editando" : "Nuevo"}
              >
                <div className="space-y-5">
                  <div>
                    <label className={fieldLabel}>
                      Título
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ej: Parábola cuadrática"
                      className={inputField}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <p className={`${fieldLabel} mb-0`}>
                      Curvas
                    </p>
                    <button
                      type="button"
                      onClick={addCurve}
                      className="text-sm font-semibold text-[var(--app-accent)] hover:opacity-80 hover:underline"
                    >
                      + Agregar curva
                    </button>
                  </div>

                  <div className="space-y-4">
                    {curves.map((curve, idx) => (
                      <div key={curve.id}>
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <label className={`${fieldLabel} mb-0`}>
                            Expresión {idx + 1}
                          </label>
                          <div className="flex items-center gap-3">
                            <label className="inline-flex items-center gap-2 text-sm text-[var(--app-text-muted)] cursor-pointer">
                              <input
                                type="color"
                                value={curve.color}
                                onChange={(e) =>
                                  updateCurveColor(curve.id, e.target.value)
                                }
                                className="h-9 w-12 cursor-pointer rounded border border-[var(--app-border)] bg-[var(--app-surface)] p-0.5"
                                title="Color de la curva"
                              />
                              Color
                            </label>
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => removeCurve(curve.id)}
                                className="text-sm font-semibold text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:underline"
                                title="Eliminar curva"
                              >
                                Eliminar
                              </button>
                            )}
                          </div>
                        </div>
                        <input
                          type="text"
                          value={curve.expression}
                          onFocus={() => setActiveCurveIndex(idx)}
                          onChange={(e) => {
                            updateCurveExpression(curve.id, e.target.value);
                            setErrorMessage("");
                          }}
                          placeholder={
                            idx === 0 ? "Ej: x^2 + 3*x + 1" : "Ej: sin(x)"
                          }
                          className={inputField}
                        />
                        {idx === activeCurveIndex &&
                          activeCurveNaturalLanguagePreview && (
                            <p className="mt-2 text-sm text-[var(--app-text)]">
                              <span className="font-semibold">Interpretado como:</span>{" "}
                              <button
                                type="button"
                                onClick={() =>
                                  applyInterpretedExpression(
                                    curve.id,
                                    activeCurveNaturalLanguagePreview
                                  )
                                }
                                className="font-mono text-[var(--app-accent)] cursor-pointer rounded px-1 -mx-1 transition-colors hover:bg-[var(--app-surface-muted)] hover:opacity-90"
                                title="Usar esta expresión en el campo"
                              >
                                {activeCurveNaturalLanguagePreview}
                              </button>
                            </p>
                          )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-2.5 text-base text-[var(--app-text)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={naturalLanguageEnabled}
                        onChange={(e) =>
                          setNaturalLanguageEnabled(e.target.checked)
                        }
                        className="h-4 w-4 rounded border-[var(--app-border)] text-[var(--app-accent)] focus:ring-[var(--app-accent)]/20"
                      />
                      Interpretar lenguaje natural
                    </label>
                    <p className="text-sm text-[var(--app-text-muted)]">
                      Permite escribir expresiones como &apos;seno de x&apos;,
                      &apos;x al cuadrado más 3&apos;, etc.
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-1 border-t border-[var(--app-border)]">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-x-4">
                    <div className={actionBarGroup}>
                      <button
                        type="button"
                        onClick={() => generateGraph()}
                        className={actionBarBtnPrimary}
                      >
                        Graficar
                      </button>
                      <button
                        type="button"
                        onClick={saveGraph}
                        className={actionBarBtnSave}
                      >
                        {isEditing ? "Actualizar" : "Guardar"}
                      </button>
                    </div>

                    <span className={actionBarDivider} aria-hidden />

                    <div className={actionBarGroup}>
                      <button
                        type="button"
                        onClick={() => jsonImportInputRef.current?.click()}
                        className={`${actionBarBtnNeutral} min-w-[8.5rem]`}
                      >
                        Importar JSON
                      </button>
                      <input
                        ref={jsonImportInputRef}
                        type="file"
                        accept=".json,application/json"
                        className="hidden"
                        onChange={handleJsonImport}
                      />
                    </div>
                  </div>

                  {isEditing && selectedGraphId && (
                    <div
                      className={`${actionBarGroup} mt-2 pt-2 border-t border-dashed border-[var(--app-border)] w-full`}
                    >
                      <button
                        type="button"
                        onClick={copyShareLink}
                        className={`${actionBarBtnNeutral} min-w-[8.5rem]`}
                      >
                        {linkCopied ? "Enlace copiado" : "Copiar enlace"}
                      </button>
                      <button
                        type="button"
                        onClick={duplicateGraph}
                        className={`${actionBarBtnNeutral} min-w-[7.5rem]`}
                      >
                        Duplicar
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteGraph(selectedGraphId)}
                        className={`${actionBarBtn} bg-red-600 text-white hover:bg-red-700 min-w-[7.5rem]`}
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </NotebookSection>

              <NotebookSection
                title="Biblioteca de funciones"
                icon="📚"
                subtitle="Busca y haz clic para insertar en la curva activa"
                defaultOpen
              >
                  <div className="max-h-72 overflow-y-auto pr-1">
                    <input
                      type="search"
                      value={functionSearch}
                      onChange={(e) => setFunctionSearch(e.target.value)}
                      placeholder="Buscar función..."
                      className={`${inputField} mb-3`}
                      aria-label="Buscar función"
                    />
                    {functionSearch.trim() && !functionLibraryHasResults ? (
                      <p className="text-sm text-[var(--app-text-muted)]">
                        No se encontraron funciones
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {filteredFunctionLibrary.map((category) => (
                          <div key={category.category} className="min-w-0">
                            <p className="text-xs font-semibold text-[var(--app-text)] mb-1.5">
                              {category.category}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {category.functions.map((fn) => (
                                <button
                                  key={`${category.category}-${fn.expression}`}
                                  type="button"
                                  onClick={() => graphExpression(fn.expression)}
                                  className={`${btnOutlineSm} font-mono`}
                                >
                                  {fn.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
              </NotebookSection>

              <NotebookSection
                title="Series experimentales"
                icon="📊"
                subtitle="Series importadas visibles en el gráfico"
                defaultOpen={false}
                badge={
                  experimentalSeries.length > 0
                    ? String(experimentalSeries.length)
                    : undefined
                }
              >
                    {experimentalSeries.length > 0 ? (
                      <ul className="space-y-2">
                        {experimentalSeries.map((series) => (
                          <li
                            key={series.id}
                            className="flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--app-text)]"
                          >
                            <span>
                              {series.name} ({series.points.length} puntos)
                            </span>
                            <button
                              type="button"
                              onClick={() => removeExperimentalSeries(series.id)}
                              className={`${btnOutlineSm} text-[var(--app-danger-text)] border-[var(--app-danger-border)] hover:bg-[var(--app-danger-bg)]`}
                            >
                              Eliminar serie
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className={emptyState}>
                        No hay series experimentales importadas.
                      </p>
                    )}
              </NotebookSection>

              <div className={`${subsectionCard} mt-3`}>
                <p className={subsectionHeading}>📄 Dataset actual</p>
                {currentDatasetInfo ? (
                  <div className="space-y-1 text-sm text-[var(--app-text)]">
                    <p>
                      <span className="font-semibold">Nombre:</span>{" "}
                      {currentDatasetInfo.fileName}
                    </p>
                    <p>
                      <span className="font-semibold">Importado:</span>{" "}
                      {currentDatasetInfo.importedAt}
                    </p>
                    <p>
                      <span className="font-semibold">Series:</span>{" "}
                      {currentDatasetInfo.seriesCount}
                    </p>
                    <p>
                      <span className="font-semibold">Observaciones:</span>{" "}
                      {currentDatasetInfo.observationCount}
                    </p>
                  </div>
                ) : (
                  <p className={emptyState}>
                    No hay dataset experimental cargado.
                  </p>
                )}
              </div>

              <NotebookSection
                title="Importación de datos"
                icon="📥"
                subtitle="CSV, TXT, XLSX u ODS"
                defaultOpen={false}
              >
                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3">
                      <div className="min-w-0 flex-1 sm:max-w-xs">
                        <label
                          htmlFor="experimental-data-source"
                          className="block text-sm font-medium text-[var(--app-heading)] mb-2"
                        >
                          Fuente de datos
                        </label>
                        <select
                          id="experimental-data-source"
                          value={selectedDataSourceId}
                          onChange={(e) => {
                            setSelectedDataSourceId(
                              e.target.value as ExperimentalDataSourceId
                            );
                            setExperimentalImportError(null);
                          }}
                          className={inputField}
                        >
                          {EXPERIMENTAL_DATA_SOURCES.map((source) => (
                            <option
                              key={source.id}
                              value={source.id}
                              disabled={!source.enabled}
                            >
                              {source.label}
                              {!source.enabled ? " (próximamente)" : ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => experimentalFileInputRef.current?.click()}
                        disabled={!canImportExperimentalData}
                        className={`${btnOutline} sm:min-w-[160px] px-5 py-2.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        Importar archivo
                      </button>

                      <input
                        ref={experimentalFileInputRef}
                        type="file"
                        accept={selectedDataSource?.accept ?? undefined}
                        className="hidden"
                        onChange={handleExperimentalImport}
                      />
                    </div>

                    <div className="mt-3 space-y-2">
                      <label className="inline-flex items-center gap-2.5 text-base text-[var(--app-text)] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preserveAnalysisConfiguration}
                          onChange={(e) =>
                            setPreserveAnalysisConfiguration(e.target.checked)
                          }
                          className="h-4 w-4 rounded border-[var(--app-border)] text-[var(--app-accent)] focus:ring-[var(--app-accent)]/20"
                        />
                        Mantener configuración de análisis al importar
                      </label>
                      <p className="text-sm text-[var(--app-text-muted)]">
                        Conserva los análisis seleccionados al cargar un nuevo
                        dataset.
                      </p>
                    </div>

                    {experimentalImportError && (
                      <p className={`mt-3 ${alertError}`}>
                        {experimentalImportError}
                      </p>
                    )}
              </NotebookSection>
            </div>
          </section>

          <section
            className={activeWorkspaceSection === "analysis" ? "" : "hidden"}
            aria-hidden={activeWorkspaceSection !== "analysis"}
          >
            <h2 className={sectionLabel}>🔬 Análisis</h2>
            <p className={`${panelHeadingSubtext} -mt-2 mb-3`}>
              Inspector contextual: seleccione una categoría para ver sus
              controles
            </p>
            <div className={`${card} w-full`}>
              <div className="flex flex-col gap-4 lg:flex-row">
                <nav
                  className="w-full shrink-0 space-y-1 lg:w-[30%] xl:w-[35%]"
                  role="tablist"
                  aria-label="Categorías del inspector"
                >
                  {visibleInspectorCategories.map((category) => (
                    <InspectorCategoryButton
                      key={category.id}
                      icon={category.icon}
                      label={category.label}
                      isActive={analysisInspectorSection === category.id}
                      onSelect={() =>
                        setAnalysisInspectorSection(category.id)
                      }
                    />
                  ))}
                </nav>

                <div className="min-w-0 flex-1">
                  {visibleInspectorCategories.length === 0 ? (
                    <p className={emptyState}>
                      No hay categorías de análisis activas. Active módulos en
                      el panel Módulos del dashboard.
                    </p>
                  ) : (
                  <>
                  <div className="mb-4 border-b border-[var(--app-border)] pb-3">
                    <h3 className={panelHeading}>
                      <span aria-hidden>
                        {activeAnalysisInspectorCategory.icon}{" "}
                      </span>
                      {activeAnalysisInspectorCategory.label}
                    </h3>
                    <p className={panelHeadingSubtext}>
                      {activeAnalysisInspectorCategory.description}
                    </p>
                  </div>

                  <div
                    className={getAnalysisInspectorPanelClass(
                      "visualization",
                      analysisInspectorSection
                    )}
                    aria-hidden={analysisInspectorSection !== "visualization"}
                  >
                  <div className={subsectionCard}>
                    <p className={subsectionHeading}>📏 Rango</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={fieldLabel}>
                          Min X
                        </label>
                        <input
                          type="number"
                          value={minX}
                          onChange={(e) => setMinX(Number(e.target.value))}
                          placeholder="Desde"
                          className={inputField}
                        />
                      </div>
                      <div>
                        <label className={fieldLabel}>
                          Max X
                        </label>
                        <input
                          type="number"
                          value={maxX}
                          onChange={(e) => setMaxX(Number(e.target.value))}
                          placeholder="Hasta"
                          className={inputField}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={subsectionCard}>
                    <p className={subsectionHeading}>📊 Ejes</p>
                    <div className="space-y-3">
                      <label className={toggleLabel}>
                        <span className="flex-1 min-w-0">
                          Ajustar eje Y automáticamente
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={autoScaleY}
                            onChange={(e) => setAutoScaleY(e.target.checked)}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label className={toggleLabel}>
                        <span className="flex-1 min-w-0">
                          Usar eje Y secundario para datos experimentales
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={useSecondaryYAxis}
                            onChange={(e) =>
                              setUseSecondaryYAxis(e.target.checked)
                            }
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className={subsectionCard}>
                    <p className={subsectionHeading}>📐 Escalas</p>
                    <div>
                      <label
                        htmlFor="axis-scale-mode-select"
                        className={fieldLabel}
                      >
                        Escala
                      </label>
                      <select
                        id="axis-scale-mode-select"
                        value={axisScaleMode}
                        onChange={(e) =>
                          setAxisScaleMode(e.target.value as AxisScaleMode)
                        }
                        className={inputField}
                      >
                        <option value="linear">Lineal</option>
                        <option value="logX">Semilog X</option>
                        <option value="logY">Semilog Y</option>
                        <option value="logLog">Log-Log</option>
                      </select>
                    </div>
                  </div>
                  </div>

                  <div
                    className={getAnalysisInspectorPanelClass(
                      "mathematics",
                      analysisInspectorSection
                    )}
                    aria-hidden={analysisInspectorSection !== "mathematics"}
                  >
                      <div>
                        <label
                          htmlFor="regression-model-select"
                          className={fieldLabel}
                        >
                          Mostrar regresión
                        </label>
                        <select
                          id="regression-model-select"
                          value={regressionModel}
                          onChange={(e) =>
                            setRegressionModel(e.target.value as RegressionModel)
                          }
                          disabled={experimentalSeries.length === 0}
                          className={`${inputField} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <option value="none">Ninguna</option>
                          <option value="linear">Lineal</option>
                          <option value="quadratic">Polinómica grado 2</option>
                          <option value="exponential">Exponencial</option>
                          <option value="logarithmic">Logarítmica</option>
                          <option value="power">Potencial</option>
                          <option value="compare">Comparar modelos</option>
                        </select>
                      </div>

                      <label
                        className={`${toggleLabel} ${
                          !hasActiveMathCurves
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">Mostrar derivada</span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showDerivative}
                            onChange={(e) => setShowDerivative(e.target.checked)}
                            disabled={!hasActiveMathCurves}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          !hasActiveMathCurves
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">Mostrar integral</span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showIntegral}
                            onChange={(e) => setShowIntegral(e.target.checked)}
                            disabled={!hasActiveMathCurves}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          visibleActiveCurves.length < 2 || chartData.length === 0
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar intersecciones
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showIntersections}
                            onChange={(e) =>
                              setShowIntersections(e.target.checked)
                            }
                            disabled={
                              visibleActiveCurves.length < 2 ||
                              chartData.length === 0
                            }
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          visibleActiveCurves.length === 0 || chartData.length === 0
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar máximos y mínimos
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showCriticalPoints}
                            onChange={(e) =>
                              setShowCriticalPoints(e.target.checked)
                            }
                            disabled={
                              visibleActiveCurves.length === 0 ||
                              chartData.length === 0
                            }
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          visibleActiveCurves.length === 0 || chartData.length === 0
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">Mostrar raíces</span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showRoots}
                            onChange={(e) => setShowRoots(e.target.checked)}
                            disabled={
                              visibleActiveCurves.length === 0 ||
                              chartData.length === 0
                            }
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>
                  </div>

                  <div
                    className={getAnalysisInspectorPanelClass(
                      "statistics",
                      analysisInspectorSection
                    )}
                    aria-hidden={analysisInspectorSection !== "statistics"}
                  >
                      <label
                        className={`${toggleLabel} ${
                          !hasVisibleExperimentalSeries
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar estadísticas
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showStatistics}
                            onChange={(e) =>
                              setShowStatistics(e.target.checked)
                            }
                            disabled={!hasVisibleExperimentalSeries}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          !hasVisibleExperimentalSeries
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar barras de error
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showErrorBars}
                            onChange={(e) =>
                              setShowErrorBars(e.target.checked)
                            }
                            disabled={!hasVisibleExperimentalSeries}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <div
                        className={
                          !hasVisibleExperimentalSeries || !showErrorBars
                            ? "opacity-50 pointer-events-none"
                            : ""
                        }
                      >
                        <label
                          htmlFor="error-bar-mode-select"
                          className={fieldLabel}
                        >
                          Tipo
                        </label>
                        <select
                          id="error-bar-mode-select"
                          value={errorBarMode}
                          onChange={(e) =>
                            setErrorBarMode(e.target.value as ErrorBarMode)
                          }
                          disabled={
                            !hasVisibleExperimentalSeries || !showErrorBars
                          }
                          className={`${inputField} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <option value="sd">SD</option>
                          <option value="sem">SEM</option>
                          <option value="ci95">IC95%</option>
                        </select>
                      </div>

                      <label
                        className={`${toggleLabel} ${
                          !hasEnoughSeriesForCorrelation
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar correlación
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showCorrelation}
                            onChange={(e) =>
                              setShowCorrelation(e.target.checked)
                            }
                            disabled={!hasEnoughSeriesForCorrelation}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <div
                        className={
                          !hasEnoughSeriesForCorrelation || !showCorrelation
                            ? "opacity-50 pointer-events-none"
                            : ""
                        }
                      >
                        <label
                          htmlFor="correlation-method-select"
                          className={fieldLabel}
                        >
                          Método
                        </label>
                        <select
                          id="correlation-method-select"
                          value={correlationMethod}
                          onChange={(e) =>
                            setCorrelationMethod(
                              e.target.value as CorrelationMethod
                            )
                          }
                          disabled={
                            !hasEnoughSeriesForCorrelation || !showCorrelation
                          }
                          className={`${inputField} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <option value="pearson">Pearson</option>
                          <option value="spearman">Spearman</option>
                        </select>
                      </div>

                      <label
                        className={`${toggleLabel} ${
                          !hasVisibleExperimentalSeries
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar outliers
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showOutliers}
                            onChange={(e) => setShowOutliers(e.target.checked)}
                            disabled={!hasVisibleExperimentalSeries}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <div
                        className={
                          !hasVisibleExperimentalSeries || !showOutliers
                            ? "opacity-50 pointer-events-none"
                            : ""
                        }
                      >
                        <label
                          htmlFor="outlier-method-select"
                          className={fieldLabel}
                        >
                          Método
                        </label>
                        <select
                          id="outlier-method-select"
                          value={outlierMethod}
                          onChange={(e) =>
                            setOutlierMethod(e.target.value as OutlierMethod)
                          }
                          disabled={
                            !hasVisibleExperimentalSeries || !showOutliers
                          }
                          className={`${inputField} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <option value="iqr">IQR</option>
                          <option value="zscore">Z-Score</option>
                        </select>
                      </div>

                      <label
                        className={`${toggleLabel} ${
                          !hasVisibleExperimentalSeries
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar histogramas
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showHistogram}
                            onChange={(e) => setShowHistogram(e.target.checked)}
                            disabled={!hasVisibleExperimentalSeries}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <div
                        className={
                          !hasVisibleExperimentalSeries || !showHistogram
                            ? "opacity-50 pointer-events-none"
                            : ""
                        }
                      >
                        <label
                          htmlFor="histogram-bins-input"
                          className={fieldLabel}
                        >
                          Número de bins
                        </label>
                        <input
                          id="histogram-bins-input"
                          type="number"
                          min={HISTOGRAM_BINS_MIN}
                          max={HISTOGRAM_BINS_MAX}
                          value={histogramBins}
                          onChange={(event) => {
                            const parsed = Number(event.target.value);
                            if (!Number.isFinite(parsed)) return;
                            setHistogramBins(clampHistogramBins(parsed));
                          }}
                          disabled={
                            !hasVisibleExperimentalSeries || !showHistogram
                          }
                          className={`${inputField} disabled:opacity-50 disabled:cursor-not-allowed`}
                        />
                      </div>

                      <label
                        className={`${toggleLabel} ${
                          !hasVisibleExperimentalSeries
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar Box Plot
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showBoxPlot}
                            onChange={(e) => setShowBoxPlot(e.target.checked)}
                            disabled={!hasVisibleExperimentalSeries}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          !hasVisibleExperimentalSeries
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar normalidad
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showNormality}
                            onChange={(e) =>
                              setShowNormality(e.target.checked)
                            }
                            disabled={!hasVisibleExperimentalSeries}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          !hasVisibleExperimentalSeries
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar Q-Q Plot
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showQQPlot}
                            onChange={(e) => setShowQQPlot(e.target.checked)}
                            disabled={!hasVisibleExperimentalSeries}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          !hasVisibleExperimentalSeries
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar Violin Plot
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showViolinPlot}
                            onChange={(e) =>
                              setShowViolinPlot(e.target.checked)
                            }
                            disabled={!hasVisibleExperimentalSeries}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          !hasVisibleExperimentalSeries
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar Heatmap
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showHeatmap}
                            onChange={(e) => setShowHeatmap(e.target.checked)}
                            disabled={!hasVisibleExperimentalSeries}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <div
                        className={`mt-2 space-y-2 ${
                          !hasVisibleExperimentalSeries || !showHeatmap
                            ? "opacity-50 pointer-events-none"
                            : ""
                        }`}
                      >
                        <label
                          htmlFor="heatmap-mode-select"
                          className={fieldLabel}
                        >
                          Modo de Heatmap
                        </label>
                        <select
                          id="heatmap-mode-select"
                          value={heatmapMode}
                          onChange={(event) =>
                            setHeatmapMode(
                              event.target.value as HeatmapMode
                            )
                          }
                          disabled={
                            !hasVisibleExperimentalSeries || !showHeatmap
                          }
                          className={`${inputField} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <option value="correlation">Correlaciones</option>
                          <option value="values">Valores</option>
                        </select>
                      </div>

                      <label
                        className={`${toggleLabel} ${
                          !hasVisibleExperimentalSeries
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar Bubble Plot
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showBubblePlot}
                            onChange={(e) =>
                              setShowBubblePlot(e.target.checked)
                            }
                            disabled={!hasVisibleExperimentalSeries}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          !hasVisibleExperimentalSeries
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar Radar Plot
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showRadarPlot}
                            onChange={(e) =>
                              setShowRadarPlot(e.target.checked)
                            }
                            disabled={!hasVisibleExperimentalSeries}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          !hasVisibleExperimentalSeries
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar Kernel Density Plot
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showKernelDensity}
                            onChange={(e) =>
                              setShowKernelDensity(e.target.checked)
                            }
                            disabled={!hasVisibleExperimentalSeries}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          !hasVisibleExperimentalSeries
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar Forest Plot
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showForestPlot}
                            onChange={(e) =>
                              setShowForestPlot(e.target.checked)
                            }
                            disabled={!hasVisibleExperimentalSeries}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          !hasEnoughSeriesForCorrelation
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">Mostrar PCA</span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showPCA}
                            onChange={(e) => setShowPCA(e.target.checked)}
                            disabled={!hasEnoughSeriesForCorrelation}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          !hasEnoughSeriesForScatterMatrix
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar Scatter Matrix
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showScatterMatrix}
                            onChange={(e) =>
                              setShowScatterMatrix(e.target.checked)
                            }
                            disabled={!hasEnoughSeriesForScatterMatrix}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          !hasEnoughSeriesForParallelCoordinates
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar Parallel Coordinates Plot
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showParallelCoordinates}
                            onChange={(e) =>
                              setShowParallelCoordinates(e.target.checked)
                            }
                            disabled={!hasEnoughSeriesForParallelCoordinates}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          !hasEnoughSeriesForCorrelationNetwork
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar Correlation Network
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showCorrelationNetwork}
                            onChange={(e) =>
                              setShowCorrelationNetwork(e.target.checked)
                            }
                            disabled={!hasEnoughSeriesForCorrelationNetwork}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          !hasEnoughSeriesForMDS
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">Mostrar MDS</span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showMDS}
                            onChange={(e) => setShowMDS(e.target.checked)}
                            disabled={!hasEnoughSeriesForMDS}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          !hasEnoughSeriesForDistanceMatrix
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar matriz de distancias
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showDistanceMatrix}
                            onChange={(e) =>
                              setShowDistanceMatrix(e.target.checked)
                            }
                            disabled={!hasEnoughSeriesForDistanceMatrix}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          !hasEnoughSeriesForSimilarityNetwork
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar Similarity Network
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showSimilarityNetwork}
                            onChange={(e) =>
                              setShowSimilarityNetwork(e.target.checked)
                            }
                            disabled={!hasEnoughSeriesForSimilarityNetwork}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          !hasEnoughSeriesForVariableImportance
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar importancia de variables
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showVariableImportance}
                            onChange={(e) =>
                              setShowVariableImportance(e.target.checked)
                            }
                            disabled={!hasEnoughSeriesForVariableImportance}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          !hasEnoughSeriesForClusterHeatmap
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar Cluster Heatmap
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showClusterHeatmap}
                            onChange={(e) =>
                              setShowClusterHeatmap(e.target.checked)
                            }
                            disabled={!hasEnoughSeriesForClusterHeatmap}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          !hasEnoughSeriesForClusteredDistanceHeatmap
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar Clustered Distance Heatmap
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showClusteredDistanceHeatmap}
                            onChange={(e) =>
                              setShowClusteredDistanceHeatmap(e.target.checked)
                            }
                            disabled={!hasEnoughSeriesForClusteredDistanceHeatmap}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          !hasEnoughSeriesForMultivariateDashboard
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar Dashboard Multivariante
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showMultivariateDashboard}
                            onChange={(e) =>
                              setShowMultivariateDashboard(e.target.checked)
                            }
                            disabled={!hasEnoughSeriesForMultivariateDashboard}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          !hasEnoughSeriesForManovaExplorer
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar MANOVA Explorer
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showManovaExplorer}
                            onChange={(e) =>
                              setShowManovaExplorer(e.target.checked)
                            }
                            disabled={!hasEnoughSeriesForManovaExplorer}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          !hasEnoughSeriesForLdaExplorer
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar LDA Explorer
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showLdaExplorer}
                            onChange={(e) =>
                              setShowLdaExplorer(e.target.checked)
                            }
                            disabled={!hasEnoughSeriesForLdaExplorer}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          !hasEnoughSeriesForCanonicalCorrelationExplorer
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar Canonical Correlation Explorer
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showCanonicalCorrelationExplorer}
                            onChange={(e) =>
                              setShowCanonicalCorrelationExplorer(
                                e.target.checked
                              )
                            }
                            disabled={
                              !hasEnoughSeriesForCanonicalCorrelationExplorer
                            }
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          !hasEnoughSeriesForPcrExplorer
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar PCR Explorer
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showPcrExplorer}
                            onChange={(e) =>
                              setShowPcrExplorer(e.target.checked)
                            }
                            disabled={!hasEnoughSeriesForPcrExplorer}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          !hasEnoughSeriesForCorrelation
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar clustering jerárquico
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showHierarchicalClustering}
                            onChange={(e) =>
                              setShowHierarchicalClustering(e.target.checked)
                            }
                            disabled={!hasEnoughSeriesForCorrelation}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>
                  </div>

                  <div
                    className={getAnalysisInspectorPanelClass(
                      "inference",
                      analysisInspectorSection
                    )}
                    aria-hidden={analysisInspectorSection !== "inference"}
                  >
                      <label
                        className={`${toggleLabel} ${
                          !hasEnoughSeriesForCorrelation
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">Mostrar t-test</span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showTTest}
                            onChange={(e) => setShowTTest(e.target.checked)}
                            disabled={!hasEnoughSeriesForCorrelation}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <div
                        className={
                          !hasEnoughSeriesForCorrelation || !showTTest
                            ? "opacity-50 pointer-events-none"
                            : ""
                        }
                      >
                        <label
                          htmlFor="ttest-series-a-select"
                          className={fieldLabel}
                        >
                          Serie A
                        </label>
                        <select
                          id="ttest-series-a-select"
                          value={tTestSeriesA?.id ?? ""}
                          onChange={(event) =>
                            setSelectedTTestSeriesA(event.target.value)
                          }
                          disabled={
                            !hasEnoughSeriesForCorrelation || !showTTest
                          }
                          className={`${inputField} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {visibleExperimentalSeries.map((series) => (
                            <option key={series.id} value={series.id}>
                              {series.name}
                            </option>
                          ))}
                        </select>

                        <label
                          htmlFor="ttest-series-b-select"
                          className={`${fieldLabel} mt-2`}
                        >
                          Serie B
                        </label>
                        <select
                          id="ttest-series-b-select"
                          value={tTestSeriesB?.id ?? ""}
                          onChange={(event) =>
                            setSelectedTTestSeriesB(event.target.value)
                          }
                          disabled={
                            !hasEnoughSeriesForCorrelation || !showTTest
                          }
                          className={`${inputField} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {visibleExperimentalSeries.map((series) => (
                            <option key={series.id} value={series.id}>
                              {series.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <label
                        className={`${toggleLabel} ${
                          !hasEnoughSeriesForAnova
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">Mostrar ANOVA</span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showAnova}
                            onChange={(e) => setShowAnova(e.target.checked)}
                            disabled={!hasEnoughSeriesForAnova}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          !isPostHocAvailable
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar comparaciones múltiples
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showPostHoc}
                            onChange={(e) => setShowPostHoc(e.target.checked)}
                            disabled={!isPostHocAvailable}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          !hasVisibleExperimentalSeries
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar pruebas no paramétricas
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showNonParametric}
                            onChange={(e) =>
                              setShowNonParametric(e.target.checked)
                            }
                            disabled={!hasVisibleExperimentalSeries}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <div
                        className={
                          !hasVisibleExperimentalSeries || !showNonParametric
                            ? "opacity-50 pointer-events-none"
                            : ""
                        }
                      >
                        <label
                          htmlFor="non-parametric-mode-select"
                          className={fieldLabel}
                        >
                          Método
                        </label>
                        <select
                          id="non-parametric-mode-select"
                          value={nonParametricMode}
                          onChange={(event) =>
                            setNonParametricMode(
                              event.target.value as NonParametricMode
                            )
                          }
                          disabled={
                            !hasVisibleExperimentalSeries || !showNonParametric
                          }
                          className={`${inputField} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <option value="mann-whitney">Mann-Whitney U</option>
                          <option value="kruskal-wallis">Kruskal-Wallis H</option>
                        </select>

                        {nonParametricMode === "mann-whitney" && (
                          <>
                            <label
                              htmlFor="mann-whitney-series-a-select"
                              className={`${fieldLabel} mt-2`}
                            >
                              Serie A
                            </label>
                            <select
                              id="mann-whitney-series-a-select"
                              value={mannWhitneySeriesA?.id ?? ""}
                              onChange={(event) =>
                                setSelectedMannWhitneySeriesA(
                                  event.target.value
                                )
                              }
                              disabled={
                                !hasEnoughSeriesForCorrelation ||
                                !showNonParametric
                              }
                              className={`${inputField} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {visibleExperimentalSeries.map((series) => (
                                <option key={series.id} value={series.id}>
                                  {series.name}
                                </option>
                              ))}
                            </select>

                            <label
                              htmlFor="mann-whitney-series-b-select"
                              className={`${fieldLabel} mt-2`}
                            >
                              Serie B
                            </label>
                            <select
                              id="mann-whitney-series-b-select"
                              value={mannWhitneySeriesB?.id ?? ""}
                              onChange={(event) =>
                                setSelectedMannWhitneySeriesB(
                                  event.target.value
                                )
                              }
                              disabled={
                                !hasEnoughSeriesForCorrelation ||
                                !showNonParametric
                              }
                              className={`${inputField} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {visibleExperimentalSeries.map((series) => (
                                <option key={series.id} value={series.id}>
                                  {series.name}
                                </option>
                              ))}
                            </select>
                          </>
                        )}
                      </div>
                  </div>

                  <div
                    className={getAnalysisInspectorPanelClass(
                      "advisor",
                      analysisInspectorSection
                    )}
                    aria-hidden={analysisInspectorSection !== "advisor"}
                  >
                      <label
                        className={`${toggleLabel} ${
                          !hasVisibleExperimentalSeries
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar Advisor Estadístico
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showStatisticalAdvisor}
                            onChange={(e) =>
                              setShowStatisticalAdvisor(e.target.checked)
                            }
                            disabled={!hasVisibleExperimentalSeries}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          !hasVisibleExperimentalSeries
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar reporte científico
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showScientificReport}
                            onChange={(e) =>
                              setShowScientificReport(e.target.checked)
                            }
                            disabled={!hasVisibleExperimentalSeries}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          !hasVisibleExperimentalSeries
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar interpretación científica
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showScientificInterpretation}
                            onChange={(e) =>
                              setShowScientificInterpretation(e.target.checked)
                            }
                            disabled={!hasVisibleExperimentalSeries}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>

                      <label
                        className={`${toggleLabel} ${
                          !hasVisibleExperimentalSeries
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0">
                          Mostrar asistente científico
                        </span>
                        <span className={toggleShell}>
                          <input
                            type="checkbox"
                            className={toggleInput}
                            checked={showScientificAssistant}
                            onChange={(e) =>
                              setShowScientificAssistant(e.target.checked)
                            }
                            disabled={!hasVisibleExperimentalSeries}
                          />
                          <span className={toggleTrackBg} aria-hidden />
                          <span className={toggleThumb} aria-hidden />
                        </span>
                      </label>
                  </div>
                  </>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section
            className={activeWorkspaceSection === "results" ? "" : "hidden"}
            aria-hidden={activeWorkspaceSection !== "results"}
          >
            <h2 className={`${sectionLabel} mb-3`}>📈 Resultados</h2>
            <div className="space-y-3">
            {isBasicModuleEnabled && (
            <NotebookSection
              title="Gráfico principal"
              icon="📈"
              subtitle={`Escala actual: ${getAxisScaleModeLabel(axisScaleMode)}`}
              defaultOpen
            >
            <div className="flex flex-wrap items-center justify-end gap-2 mb-3">
              <button
                type="button"
                onClick={resetVisibleRange}
                disabled={!hasChartContent}
                className={`${btnOutline} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Restablecer vista
              </button>
            </div>
            <div
              ref={chartExportRef}
              className={`${card} w-full`}
            >
              {hasLegendItems && (
                <div className="flex flex-wrap gap-3 mb-3 pb-3 border-b border-[var(--app-border)]">
                  {activeCurves.map((curve) => {
                    const legendKey = curveLegendKey(curve.idx);
                    const isHidden = hiddenLegendKeys.includes(legendKey);

                    return (
                      <button
                        key={legendKey}
                        type="button"
                        onClick={() => toggleLegendVisibility(legendKey)}
                        className={`flex items-center gap-2 transition-opacity cursor-pointer ${
                          isHidden ? "opacity-50" : "opacity-100"
                        }`}
                        title={isHidden ? "Mostrar curva" : "Ocultar curva"}
                      >
                        <span
                          className="inline-block w-5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: curve.color }}
                        />
                        <span
                          className={`text-sm font-mono ${
                            isHidden
                              ? "text-[var(--app-text-muted)] opacity-60"
                              : "text-[var(--app-text)]"
                          }`}
                        >
                          {curve.expression}
                        </span>
                      </button>
                    );
                  })}
                  {derivativeCurves.map((curve) => {
                    const legendKey = derivativeLegendKey(curve.id);
                    const isHidden = hiddenLegendKeys.includes(legendKey);

                    return (
                      <button
                        key={legendKey}
                        type="button"
                        onClick={() => toggleLegendVisibility(legendKey)}
                        className={`flex items-center gap-2 transition-opacity cursor-pointer ${
                          isHidden ? "opacity-50" : "opacity-100"
                        }`}
                        title={
                          isHidden ? "Mostrar derivada" : "Ocultar derivada"
                        }
                      >
                        <span
                          className="inline-block w-5 h-0.5 rounded-full shrink-0 border-t-2 border-dashed"
                          style={{
                            borderColor: curve.color,
                            opacity: DERIVATIVE_STROKE_OPACITY,
                          }}
                        />
                        <span
                          className={`text-sm font-mono ${
                            isHidden
                              ? "text-[var(--app-text-muted)] opacity-60"
                              : "text-[var(--app-text)]"
                          }`}
                        >
                          f&apos;({curve.sourceExpression})
                        </span>
                      </button>
                    );
                  })}
                  {integralCurves.map((curve) => {
                    const curveIndex = Number(curve.id);
                    const legendKey = integralLegendKey(curveIndex);
                    const isHidden = hiddenLegendKeys.includes(legendKey);

                    return (
                      <button
                        key={legendKey}
                        type="button"
                        onClick={() => toggleLegendVisibility(legendKey)}
                        className={`flex items-center gap-2 transition-opacity cursor-pointer ${
                          isHidden ? "opacity-50" : "opacity-100"
                        }`}
                        title={
                          isHidden ? "Mostrar integral" : "Ocultar integral"
                        }
                      >
                        <span
                          className="inline-block w-5 h-0.5 rounded-full shrink-0 border-t-2 border-dashed"
                          style={{
                            borderColor: curve.color,
                            opacity: INTEGRAL_STROKE_OPACITY,
                          }}
                        />
                        <span
                          className={`text-sm font-mono ${
                            isHidden
                              ? "text-[var(--app-text-muted)] opacity-60"
                              : "text-[var(--app-text)]"
                          }`}
                        >
                          ∫({curve.sourceExpression})
                        </span>
                      </button>
                    );
                  })}
                  {experimentalSeries.map((series) => {
                    const legendKey = experimentalLegendKey(series.id);
                    const isHidden = hiddenLegendKeys.includes(legendKey);

                    return (
                      <button
                        key={legendKey}
                        type="button"
                        onClick={() => toggleLegendVisibility(legendKey)}
                        className={`flex items-center gap-2 transition-opacity cursor-pointer ${
                          isHidden ? "opacity-50" : "opacity-100"
                        }`}
                        title={isHidden ? "Mostrar serie" : "Ocultar serie"}
                      >
                        <span
                          className="inline-block w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: series.color }}
                        />
                        <span
                          className={`text-sm ${
                            isHidden
                              ? "text-[var(--app-text-muted)] opacity-60"
                              : "text-[var(--app-text)]"
                          }`}
                        >
                          {series.name}
                        </span>
                      </button>
                    );
                  })}
                  {regressionCurves.map((regression) => {
                    const legendKey = regressionLegendKey(regression.id);
                    const isHidden = hiddenLegendKeys.includes(legendKey);

                    return (
                      <button
                        key={legendKey}
                        type="button"
                        onClick={() => toggleLegendVisibility(legendKey)}
                        className={`flex items-center gap-2 transition-opacity cursor-pointer ${
                          isHidden ? "opacity-50" : "opacity-100"
                        }`}
                        title={
                          isHidden
                            ? "Mostrar regresión"
                            : "Ocultar regresión"
                        }
                      >
                        <span
                          className="inline-block w-5 h-0.5 rounded-full shrink-0 border-t-2 border-dashed"
                          style={{ borderColor: regression.color }}
                        />
                        <span
                          className={`text-sm ${
                            isHidden
                              ? "text-[var(--app-text-muted)] opacity-60"
                              : "text-[var(--app-text)]"
                          }`}
                        >
                          📈 Regresión - {regression.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div
                ref={chartInteractionRef}
                className="w-full min-h-[360px] h-[min(42vh,480px)] sm:min-h-[400px] sm:h-[min(48vh,520px)] max-h-[520px] select-none cursor-grab active:cursor-grabbing"
                onMouseDown={handleChartMouseDown}
                onMouseMove={handleChartMouseMove}
                onMouseUp={handleChartMouseUp}
                onMouseLeave={handleChartMouseUp}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={composedChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                    <XAxis
                      dataKey="x"
                      type="number"
                      scale={usesLogX ? "log" : "linear"}
                      domain={xAxisDomain}
                      allowDataOverflow
                      stroke={chartTheme.axis}
                      tick={{ fill: chartTheme.axis }}
                      fontSize={14}
                    />
                    {useDualYAxis ? (
                      <>
                        <YAxis
                          yAxisId="left"
                          orientation="left"
                          scale={usesLogY ? "log" : "linear"}
                          stroke={chartTheme.axis}
                          tick={{ fill: chartTheme.axis }}
                          fontSize={14}
                          domain={mathYAxisDomainForChart}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          scale={usesLogY ? "log" : "linear"}
                          stroke={chartTheme.axis}
                          tick={{ fill: chartTheme.axis }}
                          fontSize={14}
                          domain={experimentalYAxisDomainForChart}
                        />
                      </>
                    ) : (
                      <YAxis
                        scale={usesLogY ? "log" : "linear"}
                        stroke={chartTheme.axis}
                        tick={{ fill: chartTheme.axis }}
                        fontSize={14}
                        domain={yAxisDomainForChart}
                      />
                    )}
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;

                        const pointPayload = payload[0]?.payload as
                          | {
                              __errorBar?: boolean;
                              __outlier?: boolean;
                              seriesName?: string;
                              meanY?: number;
                              stdDevY?: number;
                              semY?: number;
                              ci95Y?: number;
                              method?: OutlierMethod;
                              score?: number;
                            }
                          | undefined;

                        if (pointPayload?.__errorBar) {
                          return (
                            <div
                              className="rounded-lg border px-3 py-2 text-sm shadow-sm"
                              style={{
                                borderColor: chartTheme.tooltipBorder,
                                backgroundColor: chartTheme.tooltipBg,
                                color: chartTheme.tooltipColor,
                              }}
                            >
                              <p className="font-semibold">
                                Serie: {pointPayload.seriesName}
                              </p>
                              <p>
                                Media:{" "}
                                {formatExperimentalStat(pointPayload.meanY ?? 0)}
                              </p>
                              <p>
                                SD:{" "}
                                {formatExperimentalStat(
                                  pointPayload.stdDevY ?? 0
                                )}
                              </p>
                              <p>
                                SEM:{" "}
                                {formatExperimentalStat(pointPayload.semY ?? 0)}
                              </p>
                              <p>
                                IC95:{" "}
                                {formatExperimentalStat(
                                  pointPayload.ci95Y ?? 0
                                )}
                              </p>
                            </div>
                          );
                        }

                        if (pointPayload?.__outlier) {
                          return (
                            <div
                              className="rounded-lg border px-3 py-2 text-sm shadow-sm"
                              style={{
                                borderColor: chartTheme.tooltipBorder,
                                backgroundColor: chartTheme.tooltipBg,
                                color: chartTheme.tooltipColor,
                              }}
                            >
                              <p className="font-semibold">Outlier</p>
                              <p>
                                Serie: {pointPayload.seriesName}
                              </p>
                              <p>X: {formatExperimentalStat(label as number)}</p>
                              <p>
                                Y:{" "}
                                {formatExperimentalStat(
                                  Number(payload[0]?.value ?? 0)
                                )}
                              </p>
                              <p>
                                Método:{" "}
                                {getOutlierMethodLabel(
                                  pointPayload.method ?? outlierMethod
                                )}
                              </p>
                              <p>
                                Score:{" "}
                                {formatOutlierScore(pointPayload.score ?? 0)}
                              </p>
                            </div>
                          );
                        }

                        return (
                          <div
                            className="rounded-lg border px-3 py-2 text-sm shadow-sm"
                            style={{
                              borderColor: chartTheme.tooltipBorder,
                              backgroundColor: chartTheme.tooltipBg,
                              color: chartTheme.tooltipColor,
                            }}
                          >
                            {label != null && (
                              <p className="font-semibold mb-1">{label}</p>
                            )}
                            {payload.map((entry, entryIndex) => (
                              <p
                                key={`${entry.name}-${entry.dataKey}-${entry.value}-${entryIndex}`}
                              >
                                {entry.name}: {entry.value}
                              </p>
                            ))}
                          </div>
                        );
                      }}
                    />
                    {activeCurves.map((curve) =>
                      hiddenLegendKeys.includes(curveLegendKey(curve.idx)) ? null : (
                        <Line
                          key={curveLegendKey(curve.idx)}
                          type="monotone"
                          dataKey={`y${curve.idx + 1}`}
                          yAxisId={useDualYAxis ? "left" : undefined}
                          stroke={curve.color}
                          strokeWidth={2}
                          dot={false}
                          connectNulls
                        />
                      )
                    )}
                    {derivativeCurves.map((curve) =>
                      hiddenLegendKeys.includes(
                        derivativeLegendKey(curve.id)
                      ) ? null : (
                        <Line
                          key={derivativeLegendKey(curve.id)}
                          type="monotone"
                          data={curve.points}
                          dataKey="y"
                          yAxisId={useDualYAxis ? "left" : undefined}
                          stroke={curve.color}
                          strokeOpacity={DERIVATIVE_STROKE_OPACITY}
                          strokeDasharray="8 4"
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                      )
                    )}
                    {integralCurves.map((curve) =>
                      hiddenLegendKeys.includes(
                        integralLegendKey(Number(curve.id))
                      ) ? null : (
                        <Line
                          key={integralLegendKey(Number(curve.id))}
                          type="monotone"
                          data={curve.points}
                          dataKey="y"
                          yAxisId={useDualYAxis ? "left" : undefined}
                          stroke={curve.color}
                          strokeOpacity={INTEGRAL_STROKE_OPACITY}
                          strokeDasharray="4 4"
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                      )
                    )}
                    {experimentalSeries.map((series) =>
                      hiddenLegendKeys.includes(
                        experimentalLegendKey(series.id)
                      ) ? null : (
                        <Scatter
                          key={experimentalLegendKey(series.id)}
                          name={series.name}
                          data={mapExperimentalScatterData(
                            series.name,
                            series.points
                          )}
                          dataKey="y"
                          yAxisId={useDualYAxis ? "right" : undefined}
                          fill={series.color}
                          line={false}
                          isAnimationActive={false}
                        />
                      )
                    )}
                    {showErrorBars &&
                      errorBarSeries.map((bar) => (
                        <Line
                          key={`error-bar-line-${bar.seriesId}`}
                          data={[
                            { x: bar.meanX, y: bar.lower },
                            { x: bar.meanX, y: bar.upper },
                          ]}
                          type="linear"
                          dataKey="y"
                          stroke={bar.color}
                          strokeWidth={2}
                          dot={false}
                          activeDot={false}
                          isAnimationActive={false}
                          legendType="none"
                          yAxisId={useDualYAxis ? "right" : undefined}
                        />
                      ))}
                    {showErrorBars &&
                      errorBarSeries.map((bar) => (
                        <Scatter
                          key={`error-bar-mean-${bar.seriesId}`}
                          name={bar.seriesName}
                          data={[
                            {
                              x: bar.meanX,
                              y: bar.meanY,
                              __errorBar: true,
                              seriesName: bar.seriesName,
                              meanY: bar.meanY,
                              stdDevY: bar.stdDevY,
                              semY: bar.semY,
                              ci95Y: bar.ci95Y,
                            },
                          ]}
                          dataKey="y"
                          yAxisId={useDualYAxis ? "right" : undefined}
                          fill={bar.color}
                          line={false}
                          isAnimationActive={false}
                          r={5}
                        />
                      ))}
                    {regressionCurves.map((regression) =>
                      hiddenLegendKeys.includes(
                        regressionLegendKey(regression.id)
                      ) ? null : (
                        <Line
                          key={regressionLegendKey(regression.id)}
                          type={
                            regression.model === "quadratic" ||
                            regression.model === "exponential" ||
                            regression.model === "logarithmic" ||
                            regression.model === "power"
                              ? "monotone"
                              : "linear"
                          }
                          data={regression.points}
                          dataKey="y"
                          yAxisId={useDualYAxis ? "right" : undefined}
                          stroke={regression.color}
                          strokeDasharray="6 4"
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                      )
                    )}
                    {showIntersections && intersectionChartPoints.length > 0 && (
                      <Scatter
                        name="Intersección"
                        data={intersectionChartPoints}
                        dataKey="y"
                        fill="var(--app-accent)"
                        line={false}
                        isAnimationActive={false}
                        r={6}
                      />
                    )}
                    {showCriticalPoints && criticalMaxChartPoints.length > 0 && (
                      <Scatter
                        name="Máximo local"
                        data={criticalMaxChartPoints}
                        dataKey="y"
                        fill="var(--app-success)"
                        line={false}
                        isAnimationActive={false}
                        shape={renderMaximumMarker}
                      />
                    )}
                    {showCriticalPoints && criticalMinChartPoints.length > 0 && (
                      <Scatter
                        name="Mínimo local"
                        data={criticalMinChartPoints}
                        dataKey="y"
                        fill="var(--app-danger)"
                        line={false}
                        isAnimationActive={false}
                        shape={renderMinimumMarker}
                      />
                    )}
                    {showRoots && rootChartPoints.length > 0 && (
                      <Scatter
                        name="Raíz"
                        data={rootChartPoints}
                        dataKey="y"
                        fill="var(--app-warning)"
                        line={false}
                        isAnimationActive={false}
                        r={6}
                      />
                    )}
                    {showOutliers && outlierChartPoints.length > 0 && (
                      <Scatter
                        name="Outlier"
                        data={outlierChartPoints}
                        dataKey="y"
                        yAxisId={useDualYAxis ? "right" : undefined}
                        fill="#dc2626"
                        stroke="#ffffff"
                        strokeWidth={2}
                        line={false}
                        isAnimationActive={false}
                        r={7}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {showPCA && (
                <div className={`${contentPanel} mt-4`}>
                  <p className={subsectionHeading}>🧭 PCA</p>
                  {!pcaAnalysis ? (
                    <p className={emptyState}>
                      No hay datos suficientes para realizar PCA.
                    </p>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                        <p>
                          <span className="font-semibold">Varianza PC1:</span>{" "}
                          {formatPCAVariancePercent(pcaAnalysis.component1Variance)}
                        </p>
                        <p>
                          <span className="font-semibold">Varianza PC2:</span>{" "}
                          {formatPCAVariancePercent(pcaAnalysis.component2Variance)}
                        </p>
                        <p>
                          <span className="font-semibold">Acumulada:</span>{" "}
                          {formatPCAVariancePercent(pcaAnalysis.cumulativeVariance)}
                        </p>
                      </div>
                      <ScientificPCAPlotChart
                        analysis={pcaAnalysis}
                        chartTheme={chartTheme}
                      />
                      <p className="mt-2 text-sm">{pcaAnalysis.interpretation}</p>
                      <ScientificPCALoadingsSection analysis={pcaAnalysis} />
                    </>
                  )}
                </div>
              )}

              {showHierarchicalClustering && (
                <div className={`${contentPanel} mt-4`}>
                  <p className={subsectionHeading}>🌳 Clustering jerárquico</p>
                  {!hierarchicalClusteringAnalysis ? (
                    <p className={emptyState}>
                      No hay datos suficientes para realizar clustering.
                    </p>
                  ) : (
                    <>
                      <p>
                        <span className="font-semibold">Series:</span>{" "}
                        {hierarchicalClusteringAnalysis.seriesCount}
                      </p>
                      <p className="mt-2 text-sm">
                        {hierarchicalClusteringAnalysis.interpretation}
                      </p>
                      <ScientificHierarchicalClusteringDendrogram
                        analysis={hierarchicalClusteringAnalysis}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
            </NotebookSection>
            )}

          {isBasicModuleEnabled &&
            axisScaleWarnings.map((warning, index) => (
            <div key={`axis-scale-warning-${index}`} className={alertWarning}>
              {warning}
            </div>
          ))}

          {showMathResultsPanel && (
            <NotebookSection
              title="Resultados matemáticos"
              icon="📊"
              subtitle="Salidas de análisis activas"
              defaultOpen
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {showDerivative && (
                  <div className={subsectionCard}>
                    <p className={subsectionHeading}>📘 Derivadas</p>
                    {derivativeCurves.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {derivativeCurves.map((curve) => (
                  <div
                    key={curve.id}
                    className={contentPanel}
                  >
                    <p>
                      <span className="font-semibold">Función:</span>{" "}
                      <span className="font-mono">{curve.sourceExpression}</span>
                    </p>
                    <p className="mt-1">
                      <span className="font-semibold">Derivada:</span>{" "}
                      <span className="font-mono">{curve.expression}</span>
                    </p>
                  </div>
                ))}
                    </div>
                    ) : (
                      <p className={emptyState}>No hay derivadas activas.</p>
                    )}
                  </div>
                )}

                {showIntegral && (
                  <div className={subsectionCard}>
                    <p className={subsectionHeading}>📗 Integrales</p>
                    {integralCurves.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {integralCurves.map((curve) => (
                  <div
                    key={curve.id}
                    className={contentPanel}
                  >
                    <p>
                      <span className="font-semibold">Función:</span>{" "}
                      <span className="font-mono">{curve.sourceExpression}</span>
                    </p>
                    <p className="mt-1">
                      <span className="font-semibold">Integral:</span>{" "}
                      <span className="font-mono">{curve.expression}</span>
                    </p>
                  </div>
                ))}
                    </div>
                    ) : (
                      <p className={emptyState}>No hay integrales activas.</p>
                    )}
                  </div>
                )}

                {showIntegral && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>📐 Área bajo la curva</p>
                    {curveAreaResults.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                      {curveAreaResults.map((item) => (
                  <div
                    key={item.id}
                    className={contentPanel}
                  >
                    <p>
                      <span className="font-semibold">Función:</span>{" "}
                      <span className="font-mono">{item.expression}</span>
                    </p>
                    <p className="mt-1">
                      <span className="font-semibold">Intervalo:</span> [
                      {visibleMinX.toFixed(4)}, {visibleMaxX.toFixed(4)}]
                    </p>
                    <p className="mt-1">
                      <span className="font-semibold">Área:</span>{" "}
                      {item.area.toFixed(4)}
                    </p>
                  </div>
                ))}
                    </div>
                    ) : (
                      <p className={emptyState}>
                        No hay datos suficientes para calcular áreas.
                      </p>
                    )}
                  </div>
                )}

                {showIntersections && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>✳ Intersecciones</p>
                    {curveIntersections.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                        {curveIntersections.map((intersection) => (
                          <div key={intersection.id} className={contentPanel}>
                            <p>
                              <span className="font-semibold">Curvas:</span>{" "}
                              <span className="font-mono">
                                {intersection.curveA} ↔ {intersection.curveB}
                              </span>
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold">x =</span>{" "}
                              {intersection.x.toFixed(4)}
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold">y =</span>{" "}
                              {intersection.y.toFixed(4)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={emptyState}>
                        {identicalCurvesIntersectionMessage ??
                          "No se encontraron intersecciones en el rango visible."}
                      </p>
                    )}
                  </div>
                )}

                {showCriticalPoints && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>📍 Puntos críticos</p>
                    {criticalPoints.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                        {criticalPoints.map((point) => (
                          <div key={point.id} className={contentPanel}>
                            <p>
                              <span className="font-semibold">Curva:</span>{" "}
                              <span className="font-mono">{point.curve}</span>
                            </p>
                            <p className="mt-1 font-semibold">
                              {point.type === "maximum"
                                ? "Máximo local"
                                : "Mínimo local"}
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold">x =</span>{" "}
                              {point.x.toFixed(4)}
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold">y =</span>{" "}
                              {point.y.toFixed(4)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={emptyState}>
                        No se detectaron puntos críticos en el rango visible.
                      </p>
                    )}
                  </div>
                )}

                {showRoots && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>⚫ Raíces</p>
                    {curveRoots.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                        {curveRoots.map((root) => (
                          <div key={root.id} className={contentPanel}>
                            <p>
                              <span className="font-semibold">Curva:</span>{" "}
                              <span className="font-mono">{root.curve}</span>
                            </p>
                            <p className="mt-1 font-semibold">Raíz:</p>
                            <p className="mt-1">
                              <span className="font-semibold">x =</span>{" "}
                              {root.x.toFixed(4)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={emptyState}>
                        No se detectaron raíces en el rango visible.
                      </p>
                    )}
                  </div>
                )}

                {showStatistics && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>
                      📊 Estadística experimental
                    </p>
                    {experimentalStatistics.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {experimentalStatistics.map((stats) => (
                          <div key={stats.seriesId} className={contentPanel}>
                            <p>
                              <span className="font-semibold">Serie:</span>{" "}
                              {stats.seriesName}
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold">N:</span>{" "}
                              {stats.count}
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold">Media:</span>{" "}
                              {formatExperimentalStat(stats.meanY)}
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold">Mediana:</span>{" "}
                              {formatExperimentalStat(stats.medianY)}
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold">Mínimo:</span>{" "}
                              {formatExperimentalStat(stats.minY)}
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold">Máximo:</span>{" "}
                              {formatExperimentalStat(stats.maxY)}
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold">Rango:</span>{" "}
                              {formatExperimentalStat(stats.rangeY)}
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold">Varianza:</span>{" "}
                              {formatExperimentalStat(stats.varianceY)}
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold">
                                Desv. estándar:
                              </span>{" "}
                              {formatExperimentalStat(stats.stdDevY)}
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold">CV:</span>{" "}
                              {stats.coefficientOfVariation == null
                                ? "N/A"
                                : `${formatExperimentalStat(stats.coefficientOfVariation)}%`}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={emptyState}>
                        No hay series experimentales visibles.
                      </p>
                    )}
                  </div>
                )}

                {showErrorBars && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>📉 Barras de error</p>
                    {errorBarSeries.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {errorBarSeries.map((bar) => (
                          <div key={bar.seriesId} className={contentPanel}>
                            <p>
                              <span className="font-semibold">Serie:</span>{" "}
                              {bar.seriesName}
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold">Media:</span>{" "}
                              {formatExperimentalStat(bar.meanY)}
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold">SD:</span>{" "}
                              {formatExperimentalStat(bar.stdDevY)}
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold">SEM:</span>{" "}
                              {formatExperimentalStat(bar.semY)}
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold">IC95:</span>{" "}
                              {formatExperimentalStat(bar.ci95Y)}
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold">Modo activo:</span>{" "}
                              {getErrorBarModeLabel(bar.mode)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={emptyState}>
                        No hay series experimentales visibles.
                      </p>
                    )}
                  </div>
                )}

                {showCorrelation && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>🔗 Correlación</p>
                    {!hasEnoughSeriesForCorrelation ? (
                      <p className={emptyState}>
                        Se requieren al menos dos series experimentales visibles
                        para calcular correlaciones.
                      </p>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {correlationAnalysis.results.map((result) => (
                            <div
                              key={`${result.seriesA}-${result.seriesB}-${result.method}`}
                              className={contentPanel}
                            >
                              <p>
                                <span className="font-semibold">
                                  {result.seriesA}
                                </span>{" "}
                                ↔{" "}
                                <span className="font-semibold">
                                  {result.seriesB}
                                </span>
                              </p>
                              <p className="mt-1">
                                <span className="font-semibold">Método:</span>{" "}
                                {getCorrelationMethodLabel(result.method)}
                              </p>
                              <p className="mt-1">
                                <span className="font-semibold">
                                  Coeficiente:
                                </span>{" "}
                                {formatCorrelationCoefficient(
                                  result.coefficient
                                )}
                              </p>
                              <p className="mt-1">
                                <span className="font-semibold">
                                  Correlación:
                                </span>{" "}
                                {getCorrelationStrengthLabel(
                                  result.strength,
                                  result.direction
                                )}
                              </p>
                            </div>
                          ))}
                          {correlationAnalysis.unavailablePairs.map((pair) => (
                            <div
                              key={`${pair.seriesA}-${pair.seriesB}-unavailable`}
                              className={contentPanel}
                            >
                              <p>
                                <span className="font-semibold">
                                  {pair.seriesA}
                                </span>{" "}
                                ↔{" "}
                                <span className="font-semibold">
                                  {pair.seriesB}
                                </span>
                              </p>
                              <p className="mt-1">
                                <span className="font-semibold">Método:</span>{" "}
                                {getCorrelationMethodLabel(pair.method)}
                              </p>
                              <p className={`mt-1 ${emptyState}`}>
                                Correlación no disponible.
                              </p>
                            </div>
                          ))}
                        </div>

                        {correlationAnalysis.matrix.length >= 3 && (
                          <div className={`${contentPanel} mt-3`}>
                            <p className={subsectionHeading}>
                              📋 Matriz de correlación
                            </p>
                            <div className="overflow-x-auto mt-2">
                              <table className="min-w-full text-sm border-collapse">
                                <thead>
                                  <tr>
                                    <th className="px-2 py-1 text-left font-semibold" />
                                    {correlationAnalysis.matrix.map((row) => (
                                      <th
                                        key={`header-${row.seriesName}`}
                                        className="px-2 py-1 text-center font-semibold"
                                        title={row.seriesName}
                                      >
                                        {row.seriesName}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {correlationAnalysis.matrix.map((row) => (
                                    <tr key={`row-${row.seriesName}`}>
                                      <th
                                        className="px-2 py-1 text-left font-semibold"
                                        title={row.seriesName}
                                      >
                                        {row.seriesName}
                                      </th>
                                      {row.correlations.map(
                                        (value, columnIndex) => (
                                          <td
                                            key={`${row.seriesName}-${columnIndex}`}
                                            className="px-2 py-1 text-center tabular-nums"
                                          >
                                            {formatCorrelationMatrixValue(
                                              value
                                            )}
                                          </td>
                                        )
                                      )}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {correlationAnalysis.results.length === 0 &&
                          correlationAnalysis.unavailablePairs.length === 0 && (
                            <p className={`${emptyState} mt-2`}>
                              No hay pares de series con datos suficientes para
                              calcular correlaciones.
                            </p>
                          )}
                      </>
                    )}
                  </div>
                )}

                {showOutliers && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>🚨 Outliers</p>
                    {!hasVisibleExperimentalSeries ? (
                      <p className={emptyState}>
                        No hay series experimentales visibles.
                      </p>
                    ) : (
                      <>
                        {outlierSummaryBySeries.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                            {outlierSummaryBySeries.map((summary) => (
                              <div
                                key={summary.seriesId}
                                className={contentPanel}
                              >
                                <p>
                                  <span className="font-semibold">Serie:</span>{" "}
                                  {summary.seriesName}
                                </p>
                                <p className="mt-1">
                                  <span className="font-semibold">
                                    Outliers detectados:
                                  </span>{" "}
                                  {summary.count}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {experimentalOutliers.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {experimentalOutliers.map((outlier) => (
                              <div key={outlier.id} className={contentPanel}>
                                <p>
                                  <span className="font-semibold">Serie:</span>{" "}
                                  {outlier.seriesName}
                                </p>
                                <p className="mt-1">
                                  <span className="font-semibold">X:</span>{" "}
                                  {formatExperimentalStat(outlier.x)}
                                </p>
                                <p className="mt-1">
                                  <span className="font-semibold">Y:</span>{" "}
                                  {formatExperimentalStat(outlier.y)}
                                </p>
                                <p className="mt-1">
                                  <span className="font-semibold">Método:</span>{" "}
                                  {getOutlierMethodLabel(outlier.method)}
                                </p>
                                <p className="mt-1">
                                  <span className="font-semibold">Score:</span>{" "}
                                  {formatOutlierScore(outlier.score)}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className={emptyState}>
                            No se detectaron valores atípicos con el método
                            seleccionado.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {showHistogram && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>📊 Histogramas</p>
                    {!hasVisibleExperimentalSeries ? (
                      <p className={emptyState}>
                        No hay series experimentales visibles.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {seriesHistograms.map((histogram) => (
                          <div
                            key={histogram.seriesId}
                            className={contentPanel}
                          >
                            <p>
                              <span className="font-semibold">Serie:</span>{" "}
                              {histogram.seriesName}
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold">Muestras:</span>{" "}
                              {histogram.sampleSize}
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold">Bins:</span>{" "}
                              {histogram.bins.length}
                            </p>

                            {histogram.sampleSize > 0 ? (
                              <>
                                <div className="h-48 mt-3">
                                  <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                  >
                                    <BarChart
                                      data={toHistogramChartData(histogram)}
                                      margin={{
                                        top: 8,
                                        right: 8,
                                        left: 0,
                                        bottom: 0,
                                      }}
                                    >
                                      <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke={chartTheme.grid}
                                      />
                                      <XAxis
                                        dataKey="label"
                                        tick={{
                                          fill: chartTheme.axis,
                                          fontSize: 10,
                                        }}
                                        interval={0}
                                        angle={-25}
                                        textAnchor="end"
                                        height={56}
                                      />
                                      <YAxis
                                        allowDecimals={false}
                                        tick={{
                                          fill: chartTheme.axis,
                                          fontSize: 12,
                                        }}
                                      />
                                      <Tooltip
                                        content={({ active, payload }) => {
                                          if (!active || !payload?.length) {
                                            return null;
                                          }

                                          const item = payload[0]?.payload as
                                            | { label?: string; count?: number }
                                            | undefined;

                                          return (
                                            <div
                                              className="rounded-lg border px-3 py-2 text-sm shadow-sm"
                                              style={{
                                                borderColor:
                                                  chartTheme.tooltipBorder,
                                                backgroundColor:
                                                  chartTheme.tooltipBg,
                                                color: chartTheme.tooltipColor,
                                              }}
                                            >
                                              <p className="font-semibold">
                                                {item?.label}
                                              </p>
                                              <p>
                                                Frecuencia: {item?.count ?? 0}
                                              </p>
                                            </div>
                                          );
                                        }}
                                      />
                                      <Bar
                                        dataKey="count"
                                        fill="var(--app-accent)"
                                        radius={[4, 4, 0, 0]}
                                        isAnimationActive={false}
                                      />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>

                                <div className="mt-3">
                                  <p className="font-semibold text-sm mb-1">
                                    Bin / Frecuencia
                                  </p>
                                  {histogram.bins.map((bin, index) => (
                                    <p
                                      key={`${histogram.seriesId}-bin-${index}`}
                                      className="text-sm"
                                    >
                                      {formatHistogramBinRange(bin)} →{" "}
                                      {bin.count}
                                    </p>
                                  ))}
                                </div>
                              </>
                            ) : (
                              <p className={`${emptyState} mt-2`}>
                                Sin datos válidos en esta serie.
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {showBoxPlot && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>📦 Box Plot</p>
                    {!hasVisibleExperimentalSeries ? (
                      <p className={emptyState}>
                        No hay series experimentales visibles.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {boxPlotAnalyses.map((analysis) => (
                          <div
                            key={analysis.seriesId}
                            className={contentPanel}
                          >
                            <p>
                              <span className="font-semibold">Serie:</span>{" "}
                              {analysis.seriesName}
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold">N:</span>{" "}
                              {analysis.sampleSize}
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold">Q1:</span>{" "}
                              {formatExperimentalStat(analysis.q1)}
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold">Mediana:</span>{" "}
                              {formatExperimentalStat(analysis.median)}
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold">Q3:</span>{" "}
                              {formatExperimentalStat(analysis.q3)}
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold">IQR:</span>{" "}
                              {formatExperimentalStat(analysis.iqr)}
                            </p>

                            <div className="h-40 mt-3">
                              <MiniBoxPlot analysis={analysis} />
                            </div>

                            <div className="mt-3">
                              <p className="font-semibold text-sm mb-1">
                                Resumen
                              </p>
                              <p className="text-sm">
                                <span className="font-semibold">Mínimo:</span>{" "}
                                {formatExperimentalStat(analysis.min)}
                              </p>
                              <p className="text-sm">
                                <span className="font-semibold">Q1:</span>{" "}
                                {formatExperimentalStat(analysis.q1)}
                              </p>
                              <p className="text-sm">
                                <span className="font-semibold">Mediana:</span>{" "}
                                {formatExperimentalStat(analysis.median)}
                              </p>
                              <p className="text-sm">
                                <span className="font-semibold">Q3:</span>{" "}
                                {formatExperimentalStat(analysis.q3)}
                              </p>
                              <p className="text-sm">
                                <span className="font-semibold">Máximo:</span>{" "}
                                {formatExperimentalStat(analysis.max)}
                              </p>
                              <p className="text-sm">
                                <span className="font-semibold">Outliers:</span>{" "}
                                {analysis.outlierCount}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {(showNormality ||
                  showQQPlot ||
                  showViolinPlot ||
                  showKernelDensity) &&
                  normalityConsensus.length > 0 && (
                    <div className={`${subsectionCard} lg:col-span-2`}>
                      <p className={subsectionHeading}>
                        🧩 Consenso de normalidad
                      </p>
                      {!hasVisibleExperimentalSeries ? (
                        <p className={emptyState}>
                          No hay series disponibles para consenso de normalidad.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {normalityConsensus.map((consensus) => (
                            <div
                              key={`normality-consensus-${consensus.seriesName}`}
                              className={contentPanel}
                            >
                              <p>
                                <span className="font-semibold">Serie:</span>{" "}
                                {consensus.seriesName}
                              </p>
                              <p className="mt-1">
                                <span className="font-semibold">Conclusión:</span>{" "}
                                {getNormalityConsensusEmoji(consensus.conclusion)}{" "}
                                {getNormalityConsensusConclusionLabel(
                                  consensus.conclusion
                                )}
                              </p>
                              <p className="mt-1">
                                <span className="font-semibold">Confianza:</span>{" "}
                                {getNormalityConfidenceLabel(consensus.confidence)}
                              </p>
                              <ul className={`mt-2 list-disc pl-5 text-sm ${emptyState}`}>
                                {consensus.reasons.map((reason) => (
                                  <li key={`${consensus.seriesName}-${reason}`}>
                                    {reason}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                {(showNormality ||
                  showQQPlot ||
                  showViolinPlot ||
                  showKernelDensity) &&
                  integratedNormalityAssessment.seriesAssessments.length > 0 && (
                    <div className={`${subsectionCard} lg:col-span-2`}>
                      <p className={subsectionHeading}>
                        🔬 Coherencia de normalidad
                      </p>
                      {!hasVisibleExperimentalSeries ? (
                        <p className={emptyState}>
                          No hay series disponibles para evaluar coherencia.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {integratedNormalityAssessment.globalConclusion.map(
                            (line) => (
                              <p key={line} className="text-sm">
                                {line}
                              </p>
                            )
                          )}
                          {integratedNormalityAssessment.coherenceWarnings.map(
                            (warning) => (
                              <p
                                key={warning}
                                className="text-sm text-amber-600 dark:text-amber-400"
                              >
                                {warning}
                              </p>
                            )
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {integratedNormalityAssessment.seriesAssessments.map(
                              (seriesAssessment) => (
                                <div
                                  key={`integrated-normality-${seriesAssessment.seriesName}`}
                                  className={contentPanel}
                                >
                                  <p>
                                    <span className="font-semibold">Serie:</span>{" "}
                                    {seriesAssessment.seriesName}
                                  </p>
                                  <p className="mt-1">
                                    <span className="font-semibold">
                                      Veredicto integrado:
                                    </span>{" "}
                                    {getIntegratedNormalityVerdictLabel(
                                      seriesAssessment.verdict
                                    )}
                                  </p>
                                  <p className={`mt-2 text-sm ${emptyState}`}>
                                    {seriesAssessment.conclusion}
                                  </p>
                                  {seriesAssessment.sourceSummary.map(
                                    (sourceLine) => (
                                      <p
                                        key={`${seriesAssessment.seriesName}-${sourceLine}`}
                                        className={`mt-1 text-xs ${emptyState}`}
                                      >
                                        {sourceLine}
                                      </p>
                                    )
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                {showNormality && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>📈 Normalidad</p>
                    {!hasVisibleExperimentalSeries ? (
                      <p className={emptyState}>
                        No hay series experimentales visibles.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {normalityAnalyses.map((analysis) => {
                          const badge = getNormalityClassificationBadge(
                            analysis.classification
                          );

                          return (
                            <div
                              key={analysis.seriesId}
                              className={contentPanel}
                            >
                              <p>
                                <span className="font-semibold">Serie:</span>{" "}
                                {analysis.seriesName}
                              </p>
                              <p className="mt-1">
                                <span className="font-semibold">N:</span>{" "}
                                {analysis.sampleSize}
                              </p>
                              <p className="mt-1">
                                <span className="font-semibold">Media:</span>{" "}
                                {formatExperimentalStat(analysis.mean)}
                              </p>
                              <p className="mt-1">
                                <span className="font-semibold">SD:</span>{" "}
                                {formatExperimentalStat(
                                  analysis.standardDeviation
                                )}
                              </p>
                              <p className="mt-1">
                                <span className="font-semibold">Skewness:</span>{" "}
                                {formatNormalityMoment(
                                  analysis.skewness,
                                  analysis.classification
                                )}
                              </p>
                              <p className="mt-1">
                                <span className="font-semibold">Kurtosis:</span>{" "}
                                {formatNormalityMoment(
                                  analysis.kurtosis,
                                  analysis.classification
                                )}
                              </p>
                              <p className="mt-1">
                                <span className="font-semibold">
                                  Clasificación:
                                </span>{" "}
                                {getNormalityClassificationLabel(
                                  analysis.classification
                                )}
                              </p>
                              <p className="mt-1">
                                <span className="font-semibold">Confianza:</span>{" "}
                                {getNormalityConfidenceLabel(analysis.confidence)}
                              </p>

                              {badge && (
                                <p className="mt-2 font-semibold">{badge}</p>
                              )}

                              <p className={`mt-2 text-sm ${emptyState}`}>
                                {getNormalityRecommendation(
                                  analysis.classification
                                )}
                              </p>
                              {getIntegratedNormalitySeriesFooterText(
                                integratedNormalityBySeriesName.get(
                                  analysis.seriesName
                                )
                              ) && (
                                <p
                                  className={`mt-2 border-t border-[var(--app-border)] pt-2 text-sm ${
                                    integratedNormalityBySeriesName.get(
                                      analysis.seriesName
                                    )?.verdict === "contradictory"
                                      ? "text-amber-600 dark:text-amber-400"
                                      : emptyState
                                  }`}
                                >
                                  {getIntegratedNormalitySeriesFooterText(
                                    integratedNormalityBySeriesName.get(
                                      analysis.seriesName
                                    )
                                  )}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {showQQPlot && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>📈 Q-Q Plot</p>
                    {!hasVisibleExperimentalSeries ? (
                      <p className={emptyState}>
                        No hay datos suficientes para generar un Q-Q Plot.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {visibleExperimentalSeries.map((series) => {
                          const analysis = qqPlotAnalysesBySeriesName.get(
                            series.name
                          );

                          return (
                            <div key={series.id} className={contentPanel}>
                              <p>
                                <span className="font-semibold">Serie:</span>{" "}
                                {series.name}
                              </p>

                              {!analysis ? (
                                <p className={`mt-2 text-sm ${emptyState}`}>
                                  Resultado no disponible para esta serie.
                                </p>
                              ) : (
                                <>
                                  <p className="mt-1">
                                    <span className="font-semibold">N:</span>{" "}
                                    {analysis.sampleSize}
                                  </p>
                                  <p className="mt-1">
                                    <span className="font-semibold">
                                      Correlación:
                                    </span>{" "}
                                    r = {analysis.correlation.toFixed(4)}
                                  </p>
                                  <p className="mt-1">
                                    <span className="font-semibold">
                                      Clasificación:
                                    </span>{" "}
                                    {getQQPlotInterpretationLabel(
                                      analysis.interpretation
                                    )}
                                  </p>
                                  <p className={`mt-2 text-sm ${emptyState}`}>
                                    {getQQPlotInterpretationMessage(
                                      analysis.interpretation
                                    )}
                                  </p>
                                  {getIntegratedNormalitySeriesFooterText(
                                    integratedNormalityBySeriesName.get(
                                      series.name
                                    )
                                  ) && (
                                    <p
                                      className={`mt-2 border-t border-[var(--app-border)] pt-2 text-sm ${
                                        integratedNormalityBySeriesName.get(
                                          series.name
                                        )?.verdict === "contradictory"
                                          ? "text-amber-600 dark:text-amber-400"
                                          : emptyState
                                      }`}
                                    >
                                      {getIntegratedNormalitySeriesFooterText(
                                        integratedNormalityBySeriesName.get(
                                          series.name
                                        )
                                      )}
                                    </p>
                                  )}

                                  <div className="h-[240px] mt-3">
                                    <ResponsiveContainer
                                      width="100%"
                                      height="100%"
                                    >
                                      <ScatterChart
                                        margin={{
                                          top: 8,
                                          right: 12,
                                          left: 0,
                                          bottom: 0,
                                        }}
                                      >
                                        <CartesianGrid
                                          strokeDasharray="3 3"
                                          stroke={chartTheme.grid}
                                        />
                                        <XAxis
                                          type="number"
                                          dataKey="theoretical"
                                          name="Cuantil teórico"
                                          tick={{
                                            fill: chartTheme.axis,
                                            fontSize: 11,
                                          }}
                                        />
                                        <YAxis
                                          type="number"
                                          dataKey="sample"
                                          name="Muestra"
                                          tick={{
                                            fill: chartTheme.axis,
                                            fontSize: 11,
                                          }}
                                        />
                                        <Tooltip
                                          content={({ active, payload }) => {
                                            if (!active || !payload?.length) {
                                              return null;
                                            }

                                            const point = payload[0]
                                              ?.payload as QQPoint | undefined;
                                            if (!point) return null;

                                            return (
                                              <div
                                                className="rounded-lg border px-3 py-2 text-sm shadow-sm"
                                                style={{
                                                  borderColor:
                                                    chartTheme.tooltipBorder,
                                                  backgroundColor:
                                                    chartTheme.tooltipBg,
                                                  color: chartTheme.tooltipColor,
                                                }}
                                              >
                                                <p>
                                                  Teórico:{" "}
                                                  {point.theoretical.toFixed(4)}
                                                </p>
                                                <p>
                                                  Muestra:{" "}
                                                  {point.sample.toFixed(4)}
                                                </p>
                                              </div>
                                            );
                                          }}
                                        />
                                        <Scatter
                                          name="Observado"
                                          data={analysis.points}
                                          fill="var(--app-accent)"
                                          line={false}
                                          isAnimationActive={false}
                                        />
                                        {(() => {
                                          const bounds = getQQPlotAxisBounds(
                                            analysis.points
                                          );
                                          if (!bounds) return null;

                                          return (
                                            <ReferenceLine
                                              segment={[
                                                {
                                                  x: bounds.minValue,
                                                  y: bounds.minValue,
                                                },
                                                {
                                                  x: bounds.maxValue,
                                                  y: bounds.maxValue,
                                                },
                                              ]}
                                              stroke="var(--app-text-muted)"
                                              strokeDasharray="6 4"
                                              ifOverflow="extendDomain"
                                            />
                                          );
                                        })()}
                                      </ScatterChart>
                                    </ResponsiveContainer>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {showViolinPlot && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>🎻 Violin Plot</p>
                    {!hasVisibleExperimentalSeries ? (
                      <p className={emptyState}>
                        No hay datos suficientes para generar un Violin Plot.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {visibleExperimentalSeries.map((series) => {
                          const analysis = violinPlotAnalysesBySeriesName.get(
                            series.name
                          );

                          return (
                            <div key={series.id} className={contentPanel}>
                              <p>
                                <span className="font-semibold">Serie:</span>{" "}
                                {series.name}
                              </p>

                              {!analysis ? (
                                <p className={`mt-2 text-sm ${emptyState}`}>
                                  Resultado no disponible para esta serie.
                                </p>
                              ) : (
                                <>
                                  <p className="mt-1">
                                    <span className="font-semibold">N:</span>{" "}
                                    {analysis.sampleSize}
                                  </p>
                                  <p className="mt-1">
                                    <span className="font-semibold">Mínimo:</span>{" "}
                                    {formatExperimentalStat(analysis.min)}
                                  </p>
                                  <p className="mt-1">
                                    <span className="font-semibold">Q1:</span>{" "}
                                    {formatExperimentalStat(analysis.q1)}
                                  </p>
                                  <p className="mt-1">
                                    <span className="font-semibold">Mediana:</span>{" "}
                                    {formatExperimentalStat(analysis.median)}
                                  </p>
                                  <p className="mt-1">
                                    <span className="font-semibold">Q3:</span>{" "}
                                    {formatExperimentalStat(analysis.q3)}
                                  </p>
                                  <p className="mt-1">
                                    <span className="font-semibold">Máximo:</span>{" "}
                                    {formatExperimentalStat(analysis.max)}
                                  </p>
                                  <p className={`mt-2 text-sm ${emptyState}`}>
                                    {getViolinShapeInterpretationMessage(
                                      analysis.shapeInterpretation
                                    )}
                                  </p>
                                  {getIntegratedNormalitySeriesFooterText(
                                    integratedNormalityBySeriesName.get(
                                      series.name
                                    )
                                  ) && (
                                    <p
                                      className={`mt-2 border-t border-[var(--app-border)] pt-2 text-sm ${
                                        integratedNormalityBySeriesName.get(
                                          series.name
                                        )?.verdict === "contradictory"
                                          ? "text-amber-600 dark:text-amber-400"
                                          : emptyState
                                      }`}
                                    >
                                      {getIntegratedNormalitySeriesFooterText(
                                        integratedNormalityBySeriesName.get(
                                          series.name
                                        )
                                      )}
                                    </p>
                                  )}

                                  <div className="h-[240px] mt-3">
                                    <MiniViolinPlot analysis={analysis} />
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {showHeatmap && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>🔥 Heatmap</p>
                    {!hasVisibleExperimentalSeries || !heatmapAnalysis ? (
                      <p className={emptyState}>
                        No hay datos suficientes para generar un Heatmap.
                      </p>
                    ) : (
                      <div className={contentPanel}>
                        <p>
                          <span className="font-semibold">Modo activo:</span>{" "}
                          {getHeatmapModeLabel(heatmapAnalysis.mode)}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">Series:</span>{" "}
                          {heatmapAnalysis.rows.length}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">Dimensión:</span>{" "}
                          {heatmapAnalysis.rows.length}×
                          {heatmapAnalysis.columns.length}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--app-text-muted)]">
                          {heatmapAnalysis.mode === "correlation" ? (
                            <>
                              <span className="inline-flex items-center gap-1">
                                <span
                                  className="inline-block h-3 w-6 rounded-sm"
                                  style={{ backgroundColor: "rgb(220, 38, 38)" }}
                                />
                                -1
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <span
                                  className="inline-block h-3 w-6 rounded-sm"
                                  style={{ backgroundColor: "rgb(148, 163, 184)" }}
                                />
                                0
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <span
                                  className="inline-block h-3 w-6 rounded-sm"
                                  style={{ backgroundColor: "rgb(37, 99, 235)" }}
                                />
                                +1
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="inline-flex items-center gap-1">
                                <span
                                  className="inline-block h-3 w-6 rounded-sm"
                                  style={{ backgroundColor: "rgb(241, 245, 249)" }}
                                />
                                Mínimo
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <span
                                  className="inline-block h-3 w-6 rounded-sm"
                                  style={{ backgroundColor: "rgb(37, 99, 235)" }}
                                />
                                Máximo
                              </span>
                            </>
                          )}
                        </div>

                        <ScientificHeatmapGrid analysis={heatmapAnalysis} />

                        <div className="mt-3 space-y-1">
                          {getHeatmapInterpretationLines(heatmapAnalysis)
                            .filter(
                              (line) =>
                                !line.startsWith("Modo:") &&
                                !line.startsWith("Series:") &&
                                !line.startsWith("Dimensión:")
                            )
                            .map((line) => (
                              <p key={line} className={`text-sm ${emptyState}`}>
                                {line}
                              </p>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {showBubblePlot && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>🫧 Bubble Plot</p>
                    {!hasVisibleExperimentalSeries || !bubblePlotAnalysis ? (
                      <p className={emptyState}>
                        No hay datos suficientes para generar un Bubble Plot.
                      </p>
                    ) : (
                      <div className={contentPanel}>
                        <p>
                          <span className="font-semibold">
                            Series visibles:
                          </span>{" "}
                          {visibleExperimentalSeries.length}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">Puntos:</span>{" "}
                          {bubblePlotAnalysis.totalPoints}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">
                            Rango de tamaños:
                          </span>{" "}
                          {bubblePlotAnalysis.minSize.toFixed(1)}–
                          {bubblePlotAnalysis.maxSize.toFixed(1)} px
                        </p>

                        <ScientificBubblePlotChart
                          analysis={bubblePlotAnalysis}
                          series={visibleExperimentalSeries}
                          outliers={experimentalOutliers}
                          chartTheme={chartTheme}
                        />

                        <div className="mt-3 space-y-1">
                          {getBubblePlotInterpretationLines(
                            bubblePlotAnalysis,
                            experimentalOutliers.length
                          )
                            .filter(
                              (line) =>
                                !line.startsWith("Puntos representados:") &&
                                !line.startsWith("Rango de radios:")
                            )
                            .map((line) => (
                              <p key={line} className={`text-sm ${emptyState}`}>
                                {line}
                              </p>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {showForestPlot && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>🌲 Forest Plot</p>
                    {!hasVisibleExperimentalSeries || !forestPlotAnalysis ? (
                      <p className={emptyState}>
                        No hay datos suficientes para generar un Forest Plot.
                      </p>
                    ) : (
                      <div className={contentPanel}>
                        <ScientificForestPlot
                          analysis={forestPlotAnalysis}
                          seriesColors={radarSeriesColors}
                        />

                        <p className="mt-2 text-xs text-[var(--app-text-muted)]">
                          ■ media · ─── intervalo de confianza 95%
                        </p>

                        <div className="mt-3 space-y-3">
                          {forestPlotAnalysis.entries.map((entry) => (
                            <div
                              key={`forest-info-${entry.seriesName}`}
                              className="rounded-lg border border-[var(--app-border)] px-3 py-2"
                            >
                              <p>
                                <span className="font-semibold">Serie:</span>{" "}
                                {entry.seriesName}
                              </p>
                              <p className="mt-1">
                                <span className="font-semibold">N:</span>{" "}
                                {entry.sampleSize}
                              </p>
                              <p className="mt-1">
                                <span className="font-semibold">Media:</span>{" "}
                                {formatExperimentalStat(entry.mean)}
                              </p>
                              <p className="mt-1">
                                <span className="font-semibold">SD:</span>{" "}
                                {formatExperimentalStat(
                                  entry.standardDeviation
                                )}
                              </p>
                              <p className="mt-1">
                                <span className="font-semibold">SE:</span>{" "}
                                {formatExperimentalStat(entry.standardError)}
                              </p>
                              <p className="mt-1">
                                <span className="font-semibold">IC95%:</span>{" "}
                                [{formatExperimentalStat(entry.confidence95Lower)}
                                ,{" "}
                                {formatExperimentalStat(entry.confidence95Upper)}
                                ]
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-3 space-y-1">
                          {getForestPlotInterpretationLines(forestPlotAnalysis)
                            .filter((line) => !line.startsWith('"'))
                            .map((line) => (
                              <p key={line} className={`text-sm ${emptyState}`}>
                                {line}
                              </p>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {showPCA && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>🧭 PCA</p>
                    {!pcaAnalysis ? (
                      <p className={emptyState}>
                        No hay datos suficientes para realizar PCA.
                      </p>
                    ) : (
                      <div className={contentPanel}>
                        <p>
                          <span className="font-semibold">
                            Componentes analizados:
                          </span>{" "}
                          PC1, PC2
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">
                            Varianza explicada PC1:
                          </span>{" "}
                          {formatPCAVariancePercent(pcaAnalysis.component1Variance)}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">
                            Varianza explicada PC2:
                          </span>{" "}
                          {formatPCAVariancePercent(pcaAnalysis.component2Variance)}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">
                            Varianza acumulada:
                          </span>{" "}
                          {formatPCAVariancePercent(pcaAnalysis.cumulativeVariance)}
                        </p>
                        <p className="mt-2 text-sm">{pcaAnalysis.interpretation}</p>

                        <ScientificPCAPlotChart
                          analysis={pcaAnalysis}
                          chartTheme={chartTheme}
                        />
                        <ScientificPCALoadingsSection analysis={pcaAnalysis} />
                      </div>
                    )}
                  </div>
                )}

                {showScatterMatrix && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>🔳 Scatter Matrix</p>
                    {!scatterMatrixAnalysis ? (
                      <p className={emptyState}>
                        No hay datos suficientes para generar Scatter Matrix.
                      </p>
                    ) : (
                      <div className={contentPanel}>
                        <p>
                          <span className="font-semibold">Variables:</span>{" "}
                          {scatterMatrixAnalysis.variables.join(", ")}
                        </p>
                        {scatterMatrixAnalysis.interpretation.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {scatterMatrixAnalysis.interpretation.map(
                              (line, index) => (
                                <p
                                  key={`scatter-matrix-interpretation-${index}`}
                                  className={`text-sm ${emptyState}`}
                                >
                                  {line}
                                </p>
                              )
                            )}
                          </div>
                        )}
                        <ScientificScatterMatrix
                          analysis={scatterMatrixAnalysis}
                          seriesColors={radarSeriesColors}
                          experimentalStatistics={experimentalStatistics}
                        />
                      </div>
                    )}
                  </div>
                )}

                {showParallelCoordinates && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>
                      🧬 Parallel Coordinates Plot
                    </p>
                    {!parallelCoordinatesAnalysis ? (
                      <p className={emptyState}>
                        No hay datos suficientes para generar Parallel
                        Coordinates Plot.
                      </p>
                    ) : (
                      <div className={contentPanel}>
                        <p>
                          <span className="font-semibold">Variables:</span>{" "}
                          {parallelCoordinatesAnalysis.axes
                            .map((axis) => axis.variable)
                            .join(", ")}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">Observaciones:</span>{" "}
                          {parallelCoordinatesAnalysis.observations.length}
                        </p>
                        {parallelCoordinatesAnalysis.interpretation.length >
                          0 && (
                          <div className="mt-2 space-y-1">
                            {parallelCoordinatesAnalysis.interpretation.map(
                              (line, index) => (
                                <p
                                  key={`parallel-coordinates-interpretation-${index}`}
                                  className={`text-sm ${emptyState}`}
                                >
                                  {line}
                                </p>
                              )
                            )}
                          </div>
                        )}
                        <ScientificParallelCoordinatesPlot
                          analysis={parallelCoordinatesAnalysis}
                        />
                      </div>
                    )}
                  </div>
                )}

                {showCorrelationNetwork && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>🕸 Correlation Network</p>
                    {!correlationNetworkAnalysis ? (
                      <p className={emptyState}>
                        No hay datos suficientes para generar Correlation
                        Network.
                      </p>
                    ) : (
                      <div className={contentPanel}>
                        <p>
                          <span className="font-semibold">Variables:</span>{" "}
                          {correlationNetworkAnalysis.nodes
                            .map((node) => node.label)
                            .join(", ")}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">Conexiones:</span>{" "}
                          {correlationNetworkAnalysis.edges.length}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">Densidad:</span>{" "}
                          {(
                            getCorrelationNetworkDensity(
                              correlationNetworkAnalysis
                            ) * 100
                          ).toFixed(0)}
                          %
                        </p>
                        {correlationNetworkAnalysis.interpretation.length >
                          0 && (
                          <div className="mt-2 space-y-1">
                            {correlationNetworkAnalysis.interpretation.map(
                              (line, index) => (
                                <p
                                  key={`correlation-network-interpretation-${index}`}
                                  className={`text-sm ${emptyState}`}
                                >
                                  {line}
                                </p>
                              )
                            )}
                          </div>
                        )}
                        <ScientificCorrelationNetwork
                          analysis={correlationNetworkAnalysis}
                        />
                      </div>
                    )}
                  </div>
                )}

                {showMDS && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>
                      🧭 Multidimensional Scaling (MDS)
                    </p>
                    {!mdsAnalysis ? (
                      <p className={emptyState}>
                        No hay datos suficientes para generar MDS.
                      </p>
                    ) : (
                      <div className={contentPanel}>
                        <p>
                          <span className="font-semibold">Variables:</span>{" "}
                          {mdsAnalysis.points
                            .map((point) => point.seriesName)
                            .join(", ")}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">Stress:</span>{" "}
                          {mdsAnalysis.stress.toFixed(3)} (
                          {getMDSStressClassification(mdsAnalysis.stress)})
                        </p>
                        {mdsAnalysis.interpretation.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {mdsAnalysis.interpretation.map((line, index) => (
                              <p
                                key={`mds-interpretation-${index}`}
                                className={`text-sm ${emptyState}`}
                              >
                                {line}
                              </p>
                            ))}
                          </div>
                        )}
                        <ScientificMDSPlot
                          analysis={mdsAnalysis}
                          seriesColors={radarSeriesColors}
                          chartTheme={chartTheme}
                        />
                      </div>
                    )}
                  </div>
                )}

                {showDistanceMatrix && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>📏 Distance Matrix</p>
                    {!distanceMatrixAnalysis ? (
                      <p className={emptyState}>
                        No hay datos suficientes para generar Distance Matrix.
                      </p>
                    ) : (
                      <div className={contentPanel}>
                        <p>
                          <span className="font-semibold">Variables:</span>{" "}
                          {distanceMatrixAnalysis.variables.join(", ")}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">Rango:</span>{" "}
                          {distanceMatrixAnalysis.minDistance.toFixed(2)} –{" "}
                          {distanceMatrixAnalysis.maxDistance.toFixed(2)}{" "}
                          (promedio{" "}
                          {distanceMatrixAnalysis.averageDistance.toFixed(2)})
                        </p>
                        {distanceMatrixAnalysis.interpretation.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {distanceMatrixAnalysis.interpretation.map(
                              (line, index) => (
                                <p
                                  key={`distance-matrix-interpretation-${index}`}
                                  className={`text-sm ${emptyState}`}
                                >
                                  {line}
                                </p>
                              )
                            )}
                          </div>
                        )}
                        <ScientificDistanceMatrix
                          analysis={distanceMatrixAnalysis}
                        />
                      </div>
                    )}
                  </div>
                )}

                {showSimilarityNetwork && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>🔗 Similarity Network</p>
                    {!similarityNetworkAnalysis ? (
                      <p className={emptyState}>
                        No hay datos suficientes para generar Similarity
                        Network.
                      </p>
                    ) : (
                      <div className={contentPanel}>
                        <p>
                          <span className="font-semibold">Variables:</span>{" "}
                          {similarityNetworkAnalysis.nodes
                            .map((node) => node.id)
                            .join(", ")}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">Conexiones:</span>{" "}
                          {similarityNetworkAnalysis.edges.length}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">
                            Similitud promedio:
                          </span>{" "}
                          {similarityNetworkAnalysis.averageSimilarity.toFixed(
                            2
                          )}
                        </p>
                        {similarityNetworkAnalysis.interpretation.length >
                          0 && (
                          <div className="mt-2 space-y-1">
                            {similarityNetworkAnalysis.interpretation.map(
                              (line, index) => (
                                <p
                                  key={`similarity-network-interpretation-${index}`}
                                  className={`text-sm ${emptyState}`}
                                >
                                  {line}
                                </p>
                              )
                            )}
                          </div>
                        )}
                        <ScientificSimilarityNetwork
                          analysis={similarityNetworkAnalysis}
                          seriesColors={radarSeriesColors}
                        />
                      </div>
                    )}
                  </div>
                )}

                {showVariableImportance && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>🏆 Variable Importance</p>
                    {!variableImportanceAnalysis ? (
                      <p className={emptyState}>
                        No hay datos suficientes para generar Variable
                        Importance.
                      </p>
                    ) : (
                      <div className={contentPanel}>
                        <div className="space-y-1">
                          {[...variableImportanceAnalysis.entries]
                            .sort((left, right) => left.rank - right.rank)
                            .map((entry) => (
                              <p key={`variable-importance-rank-${entry.rank}`}>
                                <span className="font-semibold">
                                  {entry.rank}. {entry.variable}
                                </span>{" "}
                                — {entry.normalizedScore.toFixed(0)}%
                              </p>
                            ))}
                        </div>
                        {variableImportanceAnalysis.interpretation.length >
                          0 && (
                          <div className="mt-2 space-y-1">
                            {variableImportanceAnalysis.interpretation.map(
                              (line, index) => (
                                <p
                                  key={`variable-importance-interpretation-${index}`}
                                  className={`text-sm ${emptyState}`}
                                >
                                  {line}
                                </p>
                              )
                            )}
                          </div>
                        )}
                        <ScientificVariableImportanceChart
                          analysis={variableImportanceAnalysis}
                          chartTheme={chartTheme}
                        />
                      </div>
                    )}
                  </div>
                )}

                {showClusterHeatmap && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>🧩 Cluster Heatmap</p>
                    {!clusterHeatmapAnalysis ? (
                      <p className={emptyState}>
                        No hay datos suficientes para generar Cluster Heatmap.
                      </p>
                    ) : (
                      <div className={contentPanel}>
                        <p>
                          <span className="font-semibold">Variables:</span>{" "}
                          {clusterHeatmapAnalysis.variables.join(", ")}
                        </p>
                        <p className="mt-2">
                          <span className="font-semibold">
                            Orden del clustering:
                          </span>{" "}
                          {clusterHeatmapAnalysis.orderedVariables.join(" → ")}
                        </p>
                        {clusterHeatmapAnalysis.interpretation.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {clusterHeatmapAnalysis.interpretation.map(
                              (line, index) => (
                                <p
                                  key={`cluster-heatmap-interpretation-${index}`}
                                  className={`text-sm ${emptyState}`}
                                >
                                  {line}
                                </p>
                              )
                            )}
                          </div>
                        )}
                        {distanceMatrixAnalysis && (
                          <ScientificClusterHeatmap
                            analysis={clusterHeatmapAnalysis}
                            minDistance={distanceMatrixAnalysis.minDistance}
                            maxDistance={distanceMatrixAnalysis.maxDistance}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}

                {showClusteredDistanceHeatmap && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>
                      🌡️ Clustered Distance Heatmap
                    </p>
                    {!clusteredDistanceHeatmapAnalysis ||
                    !hierarchicalClusteringAnalysis ||
                    !clusterHeatmapAnalysis ? (
                      <p className={emptyState}>
                        No hay datos suficientes para generar Clustered
                        Distance Heatmap.
                      </p>
                    ) : (
                      <div className={contentPanel}>
                        <p>
                          <span className="font-semibold">Variables:</span>{" "}
                          {clusteredDistanceHeatmapAnalysis.orderedVariables.join(
                            ", "
                          )}
                        </p>
                        <p className="mt-2">
                          <span className="font-semibold">
                            Orden del clustering:
                          </span>{" "}
                          {clusteredDistanceHeatmapAnalysis.orderedVariables.join(
                            " → "
                          )}
                        </p>
                        <p className="mt-2">
                          <span className="font-semibold">
                            Distancia media:
                          </span>{" "}
                          {clusteredDistanceHeatmapAnalysis.averageDistance.toFixed(
                            2
                          )}
                        </p>
                        <p className="mt-2">
                          <span className="font-semibold">
                            Distancia máxima:
                          </span>{" "}
                          {clusteredDistanceHeatmapAnalysis.maxDistance.toFixed(
                            2
                          )}
                        </p>
                        {clusteredDistanceHeatmapAnalysis.interpretation
                          .length > 0 && (
                          <div className="mt-2 space-y-1">
                            {clusteredDistanceHeatmapAnalysis.interpretation.map(
                              (line, index) => (
                                <p
                                  key={`clustered-distance-heatmap-interpretation-${index}`}
                                  className={`text-sm ${emptyState}`}
                                >
                                  {line}
                                </p>
                              )
                            )}
                          </div>
                        )}
                        <ScientificClusteredDistanceHeatmap
                          clusteringAnalysis={hierarchicalClusteringAnalysis}
                          clusterHeatmapAnalysis={clusterHeatmapAnalysis}
                          analysis={clusteredDistanceHeatmapAnalysis}
                        />
                      </div>
                    )}
                  </div>
                )}

                {showMultivariateDashboard && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>
                      📊 Multivariate Summary Dashboard
                    </p>
                    {!multivariateDashboardAnalysis ? (
                      <p className={emptyState}>
                        No hay datos suficientes para generar Multivariate
                        Dashboard.
                      </p>
                    ) : (
                      <div className={contentPanel}>
                        <ScientificMultivariateDashboard
                          analysis={multivariateDashboardAnalysis}
                        />
                      </div>
                    )}
                  </div>
                )}

                {showManovaExplorer && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>🎯 MANOVA Explorer</p>
                    {!manovaExplorerAnalysis ? (
                      <p className={emptyState}>
                        No hay datos suficientes para generar MANOVA Explorer.
                      </p>
                    ) : (
                      <div className={contentPanel}>
                        <ScientificManovaExplorer
                          analysis={manovaExplorerAnalysis}
                        />
                      </div>
                    )}
                  </div>
                )}

                {showLdaExplorer && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>🎯 LDA Explorer</p>
                    {!ldaExplorerAnalysis || !pcaAnalysis ? (
                      <p className={emptyState}>
                        No hay datos suficientes para generar LDA Explorer.
                      </p>
                    ) : (
                      <div className={contentPanel}>
                        <ScientificLdaExplorer
                          analysis={ldaExplorerAnalysis}
                          pcaVariance={pcaAnalysis.cumulativeVariance}
                        />
                      </div>
                    )}
                  </div>
                )}

                {showCanonicalCorrelationExplorer && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>
                      🔗 Canonical Correlation Explorer
                    </p>
                    {!canonicalCorrelationExplorerAnalysis ||
                    !correlationNetworkAnalysis ? (
                      <p className={emptyState}>
                        No hay datos suficientes para generar Canonical
                        Correlation Explorer.
                      </p>
                    ) : (
                      <div className={contentPanel}>
                        <ScientificCanonicalCorrelationExplorer
                          analysis={canonicalCorrelationExplorerAnalysis}
                          correlationDensity={getCorrelationNetworkDensity(
                            correlationNetworkAnalysis
                          )}
                        />
                      </div>
                    )}
                  </div>
                )}

                {showPcrExplorer && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>📈 PCR Explorer</p>
                    {!pcrExplorerAnalysis || !pcaAnalysis ? (
                      <p className={emptyState}>
                        No hay datos suficientes para generar PCR Explorer.
                      </p>
                    ) : (
                      <div className={contentPanel}>
                        <ScientificPcrExplorer
                          analysis={pcrExplorerAnalysis}
                          pcaVariance={pcaAnalysis.cumulativeVariance}
                        />
                      </div>
                    )}
                  </div>
                )}

                {showHierarchicalClustering && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>
                      🌳 Clustering jerárquico
                    </p>
                    {!hierarchicalClusteringAnalysis ? (
                      <p className={emptyState}>
                        No hay datos suficientes para realizar clustering.
                      </p>
                    ) : (
                      <div className={contentPanel}>
                        <p>
                          <span className="font-semibold">
                            Número de series:
                          </span>{" "}
                          {hierarchicalClusteringAnalysis.seriesCount}
                        </p>
                        <p className="mt-2 text-sm">
                          {hierarchicalClusteringAnalysis.interpretation}
                        </p>
                        <ScientificHierarchicalClusteringDendrogram
                          analysis={hierarchicalClusteringAnalysis}
                        />
                      </div>
                    )}
                  </div>
                )}

                {showKernelDensity && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>
                      📈 Kernel Density Plot
                    </p>
                    {!hasVisibleExperimentalSeries ||
                    kernelDensityAnalyses.length === 0 ? (
                      <p className={emptyState}>
                        No hay datos suficientes para generar un Kernel
                        Density Plot.
                      </p>
                    ) : (
                      <div className={contentPanel}>
                        <ScientificKernelDensityPlotChart
                          analyses={kernelDensityAnalyses}
                          seriesColors={radarSeriesColors}
                          chartTheme={chartTheme}
                        />

                        <div className="mt-3 flex flex-wrap gap-2">
                          {kernelDensityAnalyses.map((analysis) => (
                            <span
                              key={`kde-legend-${analysis.seriesName}`}
                              className="inline-flex items-center gap-1.5 text-xs text-[var(--app-text)]"
                            >
                              <span
                                className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                                style={{
                                  backgroundColor:
                                    radarSeriesColors.get(
                                      analysis.seriesName
                                    ) ?? "var(--app-accent)",
                                }}
                              />
                              {analysis.seriesName}
                            </span>
                          ))}
                        </div>

                        <div className="mt-3 space-y-3">
                          {kernelDensityAnalyses.map((analysis) => (
                            <div
                              key={`kde-info-${analysis.seriesName}`}
                              className="rounded-lg border border-[var(--app-border)] px-3 py-2"
                            >
                              <p>
                                <span className="font-semibold">Serie:</span>{" "}
                                {analysis.seriesName}
                              </p>
                              <p className="mt-1">
                                <span className="font-semibold">N:</span>{" "}
                                {analysis.sampleSize}
                              </p>
                              <p className="mt-1">
                                <span className="font-semibold">
                                  Bandwidth:
                                </span>{" "}
                                {analysis.bandwidth.toFixed(4)}
                              </p>
                              <p className="mt-1">
                                <span className="font-semibold">
                                  Densidad máxima:
                                </span>{" "}
                                {analysis.peakDensity.toFixed(4)}
                              </p>
                              <p className="mt-1">
                                <span className="font-semibold">
                                  Forma detectada:
                                </span>{" "}
                                {getKernelDistributionShapeLabel(
                                  analysis.distributionShape
                                )}
                              </p>
                              <p className={`mt-2 text-sm ${emptyState}`}>
                                {getKernelDistributionShapeMessage(
                                  analysis.distributionShape
                                )}
                              </p>
                              {getIntegratedNormalitySeriesFooterText(
                                integratedNormalityBySeriesName.get(
                                  analysis.seriesName
                                )
                              ) && (
                                <p
                                  className={`mt-2 border-t border-[var(--app-border)] pt-2 text-sm ${
                                    integratedNormalityBySeriesName.get(
                                      analysis.seriesName
                                    )?.verdict === "contradictory"
                                      ? "text-amber-600 dark:text-amber-400"
                                      : emptyState
                                  }`}
                                >
                                  {getIntegratedNormalitySeriesFooterText(
                                    integratedNormalityBySeriesName.get(
                                      analysis.seriesName
                                    )
                                  )}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {showRadarPlot && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>🕸 Radar Plot</p>
                    {!hasVisibleExperimentalSeries || !radarPlotAnalysis ? (
                      <p className={emptyState}>
                        No hay datos suficientes para generar un Radar Plot.
                      </p>
                    ) : (
                      <div className={contentPanel}>
                        <p>
                          <span className="font-semibold">
                            Series comparadas:
                          </span>{" "}
                          {radarPlotAnalysis.profiles.length}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">Métricas:</span>{" "}
                          {radarPlotAnalysis.metricLabels.join(", ")}
                        </p>

                        <ScientificRadarPlot
                          analysis={radarPlotAnalysis}
                          seriesColors={radarSeriesColors}
                        />

                        <div className="mt-3 flex flex-wrap gap-2">
                          {radarPlotAnalysis.profiles.map((profile) => (
                            <span
                              key={`radar-legend-${profile.seriesName}`}
                              className="inline-flex items-center gap-1.5 text-xs text-[var(--app-text)]"
                            >
                              <span
                                className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                                style={{
                                  backgroundColor:
                                    radarSeriesColors.get(
                                      profile.seriesName
                                    ) ?? "var(--app-accent)",
                                }}
                              />
                              {profile.seriesName}
                            </span>
                          ))}
                        </div>

                        <div className="mt-3 space-y-1">
                          {getRadarPlotInterpretationLines(radarPlotAnalysis)
                            .filter(
                              (line) =>
                                !line.startsWith("Series comparadas:") &&
                                !line.startsWith("Métricas usadas:")
                            )
                            .map((line) => (
                              <p key={line} className={`text-sm ${emptyState}`}>
                                {line}
                              </p>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {showTTest && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>🧪 t-Test</p>
                    {!hasEnoughSeriesForCorrelation ? (
                      <p className={emptyState}>
                        Se requieren dos series experimentales visibles.
                      </p>
                    ) : tTestResult ? (
                      <div className={contentPanel}>
                        <p>
                          <span className="font-semibold">Serie A:</span>{" "}
                          {tTestResult.seriesA}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">Serie B:</span>{" "}
                          {tTestResult.seriesB}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">Media A:</span>{" "}
                          {formatExperimentalStat(tTestResult.meanA)}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">Media B:</span>{" "}
                          {formatExperimentalStat(tTestResult.meanB)}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">SD A:</span>{" "}
                          {formatExperimentalStat(
                            tTestResult.standardDeviationA
                          )}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">SD B:</span>{" "}
                          {formatExperimentalStat(
                            tTestResult.standardDeviationB
                          )}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">t:</span>{" "}
                          {formatExperimentalStat(tTestResult.tStatistic)}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">gl:</span>{" "}
                          {tTestResult.degreesOfFreedom}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">p:</span>{" "}
                          {formatPValue(tTestResult.pValue)}
                        </p>

                        <p className="mt-2 font-semibold">
                          {getTTestBadge(tTestResult)}
                        </p>
                        <p className={`mt-2 text-sm ${emptyState}`}>
                          {getTTestInterpretation(tTestResult)}
                        </p>
                        <p className={`mt-2 text-sm ${emptyState}`}>
                          El t-test asume independencia y distribución
                          aproximadamente normal.
                        </p>
                      </div>
                    ) : (
                      <p className={emptyState}>
                        {tTestSeriesA?.id === tTestSeriesB?.id
                          ? "Seleccione dos series distintas para comparar."
                          : "Resultado no disponible para las series seleccionadas."}
                      </p>
                    )}
                  </div>
                )}

                {showAnova && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>🧪 ANOVA</p>
                    {!hasEnoughSeriesForAnova ? (
                      <p className={emptyState}>
                        Se requieren al menos tres series experimentales
                        visibles para ejecutar ANOVA.
                      </p>
                    ) : anovaAnalysis ? (
                      <>
                        <div className={contentPanel}>
                          <p>
                            <span className="font-semibold">
                              Número de grupos:
                            </span>{" "}
                            {anovaAnalysis.result.groupCount}
                          </p>
                          <p className="mt-1">
                            <span className="font-semibold">N total:</span>{" "}
                            {anovaAnalysis.result.totalSampleSize}
                          </p>
                          <p className="mt-1">
                            <span className="font-semibold">SS Between:</span>{" "}
                            {formatExperimentalStat(
                              anovaAnalysis.result.betweenGroupsSS
                            )}
                          </p>
                          <p className="mt-1">
                            <span className="font-semibold">SS Within:</span>{" "}
                            {formatExperimentalStat(
                              anovaAnalysis.result.withinGroupsSS
                            )}
                          </p>
                          <p className="mt-1">
                            <span className="font-semibold">SS Total:</span>{" "}
                            {formatExperimentalStat(anovaAnalysis.result.totalSS)}
                          </p>
                          <p className="mt-1">
                            <span className="font-semibold">DF Between:</span>{" "}
                            {anovaAnalysis.result.betweenGroupsDF}
                          </p>
                          <p className="mt-1">
                            <span className="font-semibold">DF Within:</span>{" "}
                            {anovaAnalysis.result.withinGroupsDF}
                          </p>
                          <p className="mt-1">
                            <span className="font-semibold">F:</span>{" "}
                            {formatExperimentalStat(
                              anovaAnalysis.result.fStatistic
                            )}
                          </p>
                          <p className="mt-1">
                            <span className="font-semibold">p:</span>{" "}
                            {formatPValue(anovaAnalysis.result.pValue)}
                          </p>

                          <p className="mt-2 font-semibold">
                            {getAnovaBadge(anovaAnalysis.result)}
                          </p>
                          <p className={`mt-2 text-sm ${emptyState}`}>
                            {getAnovaInterpretation(anovaAnalysis.result)}
                          </p>
                          <p className={`mt-2 text-sm ${emptyState}`}>
                            ANOVA asume independencia, normalidad aproximada y
                            homogeneidad de varianzas.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                          {anovaAnalysis.groups.map((group) => (
                            <div key={group.seriesId} className={contentPanel}>
                              <p>
                                <span className="font-semibold">Serie:</span>{" "}
                                {group.seriesName}
                              </p>
                              <p className="mt-1">
                                <span className="font-semibold">N:</span>{" "}
                                {group.sampleSize}
                              </p>
                              <p className="mt-1">
                                <span className="font-semibold">Media:</span>{" "}
                                {formatExperimentalStat(group.mean)}
                              </p>
                              <p className="mt-1">
                                <span className="font-semibold">SD:</span>{" "}
                                {formatExperimentalStat(group.standardDeviation)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className={emptyState}>
                        Resultado no disponible para las series seleccionadas.
                      </p>
                    )}
                  </div>
                )}

                {showPostHoc && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>
                      🔬 Comparaciones múltiples
                    </p>
                    {!isPostHocAvailable ? (
                      <p className={emptyState}>
                        Se requieren al menos tres series experimentales
                        visibles con ANOVA disponible.
                      </p>
                    ) : (
                      <>
                        {anovaAnalysis && !anovaAnalysis.result.significant && (
                          <p className={`${emptyState} mb-3`}>
                            ANOVA no detectó diferencias globales
                            significativas. Las comparaciones múltiples pueden
                            no ser necesarias.
                          </p>
                        )}

                        {postHocComparisons.length > 0 ? (
                          <>
                            <p className={`text-sm mb-3 ${emptyState}`}>
                              {buildPostHocSummary(postHocComparisons)}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {postHocComparisons.map((comparison) => (
                                <div
                                  key={`${comparison.seriesA}-${comparison.seriesB}`}
                                  className={contentPanel}
                                >
                                  <p>
                                    <span className="font-semibold">
                                      {comparison.seriesA}
                                    </span>{" "}
                                    ↔{" "}
                                    <span className="font-semibold">
                                      {comparison.seriesB}
                                    </span>
                                  </p>
                                  <p className="mt-1">
                                    <span className="font-semibold">
                                      Diferencia de medias:
                                    </span>{" "}
                                    {formatExperimentalStat(
                                      comparison.meanDifference
                                    )}
                                  </p>
                                  <p className="mt-1">
                                    <span className="font-semibold">SE:</span>{" "}
                                    {formatExperimentalStat(
                                      comparison.standardError
                                    )}
                                  </p>
                                  <p className="mt-1">
                                    <span className="font-semibold">q:</span>{" "}
                                    {formatExperimentalStat(
                                      comparison.qStatistic
                                    )}
                                  </p>
                                  <p className="mt-1 font-semibold">
                                    {getPostHocComparisonResultLabel(
                                      comparison.significant
                                    )}
                                  </p>
                                </div>
                              ))}
                            </div>

                            <div className={`${contentPanel} mt-3 overflow-x-auto`}>
                              <table className="min-w-full text-sm border-collapse">
                                <thead>
                                  <tr>
                                    <th className="px-2 py-1 text-left font-semibold">
                                      Grupo A
                                    </th>
                                    <th className="px-2 py-1 text-left font-semibold">
                                      Grupo B
                                    </th>
                                    <th className="px-2 py-1 text-right font-semibold">
                                      Δ Media
                                    </th>
                                    <th className="px-2 py-1 text-right font-semibold">
                                      q
                                    </th>
                                    <th className="px-2 py-1 text-left font-semibold">
                                      Resultado
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {postHocComparisons.map((comparison) => (
                                    <tr
                                      key={`table-${comparison.seriesA}-${comparison.seriesB}`}
                                    >
                                      <td className="px-2 py-1">
                                        {comparison.seriesA}
                                      </td>
                                      <td className="px-2 py-1">
                                        {comparison.seriesB}
                                      </td>
                                      <td className="px-2 py-1 text-right tabular-nums">
                                        {formatExperimentalStat(
                                          comparison.meanDifference
                                        )}
                                      </td>
                                      <td className="px-2 py-1 text-right tabular-nums">
                                        {formatExperimentalStat(
                                          comparison.qStatistic
                                        )}
                                      </td>
                                      <td className="px-2 py-1">
                                        {comparison.significant
                                          ? "Significativa"
                                          : "No significativa"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </>
                        ) : (
                          <p className={emptyState}>
                            No hay comparaciones disponibles para las series
                            actuales.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {showNonParametric && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>
                      📊 Pruebas no paramétricas
                    </p>
                    <p className={`text-sm mb-3 ${emptyState}`}>
                      Método activo:{" "}
                      {getNonParametricModeLabel(nonParametricMode)}
                    </p>

                    {nonParametricMode === "mann-whitney" ? (
                      !hasEnoughSeriesForCorrelation ? (
                        <p className={emptyState}>
                          Se requieren dos series visibles.
                        </p>
                      ) : mannWhitneyResult ? (
                        <div className={contentPanel}>
                          <p>
                            <span className="font-semibold">Serie A:</span>{" "}
                            {mannWhitneyResult.seriesA}
                          </p>
                          <p className="mt-1">
                            <span className="font-semibold">Serie B:</span>{" "}
                            {mannWhitneyResult.seriesB}
                          </p>
                          <p className="mt-1">
                            <span className="font-semibold">U:</span>{" "}
                            {formatExperimentalStat(mannWhitneyResult.uStatistic)}
                          </p>
                          <p className="mt-1">
                            <span className="font-semibold">Z:</span>{" "}
                            {formatExperimentalStat(mannWhitneyResult.zScore)}
                          </p>
                          <p className="mt-1">
                            <span className="font-semibold">p:</span>{" "}
                            {formatPValue(mannWhitneyResult.pValue)}
                          </p>
                          <p className="mt-2 font-semibold">
                            {getNonParametricBadge(mannWhitneyResult.significant)}
                          </p>
                          <p className={`mt-2 text-sm ${emptyState}`}>
                            {getNonParametricRecommendation(
                              normalityAnalyses,
                              [
                                mannWhitneyResult.seriesA,
                                mannWhitneyResult.seriesB,
                              ]
                            )}
                          </p>
                        </div>
                      ) : (
                        <p className={emptyState}>
                          {mannWhitneySeriesA?.id === mannWhitneySeriesB?.id
                            ? "Seleccione dos series distintas para comparar."
                            : "Resultado no disponible para las series seleccionadas."}
                        </p>
                      )
                    ) : !hasEnoughSeriesForAnova ? (
                      <p className={emptyState}>
                        Se requieren tres series visibles.
                      </p>
                    ) : kruskalWallisResult ? (
                      <div className={contentPanel}>
                        <p>
                          <span className="font-semibold">
                            Número de grupos:
                          </span>{" "}
                          {kruskalWallisResult.groupCount}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">N total:</span>{" "}
                          {kruskalWallisResult.totalSampleSize}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">H:</span>{" "}
                          {formatExperimentalStat(
                            kruskalWallisResult.hStatistic
                          )}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">gl:</span>{" "}
                          {kruskalWallisResult.degreesOfFreedom}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">p:</span>{" "}
                          {formatPValue(kruskalWallisResult.pValue)}
                        </p>
                        <p className="mt-2 font-semibold">
                          {getNonParametricBadge(kruskalWallisResult.significant)}
                        </p>
                        <p className={`mt-2 text-sm ${emptyState}`}>
                          {getNonParametricRecommendation(
                            normalityAnalyses,
                            visibleExperimentalSeries.map(
                              (series) => series.name
                            )
                          )}
                        </p>
                      </div>
                    ) : (
                      <p className={emptyState}>
                        Resultado no disponible para las series seleccionadas.
                      </p>
                    )}
                  </div>
                )}

                {showStatisticalAdvisor && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>🧠 Advisor Estadístico</p>
                    {statisticalRecommendation ? (
                      <div className={contentPanel}>
                        <p>
                          <span className="font-semibold">
                            Prueba recomendada:
                          </span>{" "}
                          {statisticalRecommendation.recommendedTest}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">
                            Nivel de confianza:
                          </span>{" "}
                          {getStatisticalAdvisorConfidenceLabel(
                            statisticalRecommendation.confidence
                          )}
                        </p>

                        {statisticalRecommendation.assumptionsPassed.length >
                          0 && (
                          <div className="mt-3">
                            <p className="font-semibold text-sm mb-1">
                              Supuestos cumplidos
                            </p>
                            {statisticalRecommendation.assumptionsPassed.map(
                              (assumption) => (
                                <p
                                  key={`passed-${assumption}`}
                                  className="text-sm"
                                >
                                  ✓ {assumption}
                                </p>
                              )
                            )}
                          </div>
                        )}

                        {statisticalRecommendation.assumptionsFailed.length >
                          0 && (
                          <div className="mt-3">
                            <p className="font-semibold text-sm mb-1">
                              Supuestos incumplidos
                            </p>
                            {statisticalRecommendation.assumptionsFailed.map(
                              (assumption) => (
                                <p
                                  key={`failed-${assumption}`}
                                  className="text-sm"
                                >
                                  ✗ {assumption}
                                </p>
                              )
                            )}
                          </div>
                        )}

                        {statisticalRecommendation.warnings.length > 0 && (
                          <div className="mt-3">
                            <p className="font-semibold text-sm mb-1">
                              Advertencias
                            </p>
                            {statisticalRecommendation.warnings.map(
                              (warning) => (
                                <p key={warning} className={`text-sm ${emptyState}`}>
                                  {warning}
                                </p>
                              )
                            )}
                          </div>
                        )}

                        {statisticalRecommendation.reasoning.length > 0 && (
                          <div className="mt-3">
                            <p className="font-semibold text-sm mb-1">
                              Justificación automática
                            </p>
                            {statisticalRecommendation.reasoning.map(
                              (reason) => (
                                <p key={reason} className="text-sm mt-1">
                                  {reason}
                                </p>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className={emptyState}>
                        No hay información suficiente para generar una
                        recomendación estadística.
                      </p>
                    )}
                  </div>
                )}

                {regressionModel === "compare" && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>📈 Regresiones</p>
                    {regressionComparisons.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {regressionComparisons.map((comparison) => {
                        const bestQuality =
                          comparison.bestR2 != null
                            ? getFitQuality(comparison.bestR2)
                            : null;
                        return (
                          <div key={comparison.id} className={contentPanel}>
                            <p>
                              <span className="font-semibold">Serie:</span>{" "}
                              {comparison.name}
                            </p>
                            <p>
                              <span className="font-semibold">Lineal:</span>
                            </p>
                            <p>
                              R² ={" "}
                              {comparison.linear
                                ? comparison.linear.r2.toFixed(4)
                                : "No disponible"}
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold">Logarítmica:</span>
                            </p>
                            <p>
                              R² ={" "}
                              {comparison.logarithmic
                                ? comparison.logarithmic.r2.toFixed(4)
                                : "No disponible"}
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold">Exponencial:</span>
                            </p>
                            <p>
                              R² ={" "}
                              {comparison.exponential
                                ? comparison.exponential.r2.toFixed(4)
                                : "No disponible"}
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold">Potencial:</span>
                            </p>
                            <p>
                              R² ={" "}
                              {comparison.power
                                ? comparison.power.r2.toFixed(4)
                                : "No disponible"}
                            </p>
                            <p className="mt-1">
                              <span className="font-semibold">Cuadrática:</span>
                            </p>
                            <p>
                              R² ={" "}
                              {comparison.quadratic
                                ? comparison.quadratic.r2.toFixed(4)
                                : "No disponible"}
                            </p>
                            {comparison.bestModel && comparison.bestR2 != null && (
                              <div className="mt-2 rounded-md bg-[var(--app-surface-muted)] px-3 py-2">
                                <p className="font-semibold">🏆 Mejor ajuste:</p>
                                <p>
                                  {comparison.bestModel === "linear"
                                    ? "Lineal"
                                    : comparison.bestModel === "logarithmic"
                                      ? "Logarítmica"
                                    : comparison.bestModel === "exponential"
                                      ? "Exponencial"
                                    : comparison.bestModel === "power"
                                      ? "Potencial"
                                      : "Cuadrática"}
                                </p>
                                <p>
                                  <span className="font-semibold">R² ganador:</span>{" "}
                                  {comparison.bestR2.toFixed(4)}
                                </p>
                                <p>
                                  <span className="font-semibold">Calidad:</span>{" "}
                                  {bestQuality?.label}
                                </p>
                                {bestQuality && (
                                  <span className="mt-1 inline-flex rounded-md bg-[var(--app-surface)] border border-[var(--app-border)] px-2.5 py-1 text-xs font-medium text-[var(--app-text)]">
                                    {bestQuality.badge}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    ) : (
                      <p className={emptyState}>No hay regresiones activas.</p>
                    )}
                  </div>
                )}

                {regressionModel !== "compare" && regressionModel !== "none" && (
                  <div className={`${subsectionCard} lg:col-span-2`}>
                    <p className={subsectionHeading}>📈 Regresiones</p>
                    {selectedRegressionSeriesStatus.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedRegressionSeriesStatus.map((status) => {
                        if (!status.curve) {
                          return (
                            <div key={status.id} className={contentPanel}>
                              <p>
                                <span className="font-semibold">Serie:</span>{" "}
                                {status.name}
                              </p>
                              <p>
                                <span className="font-semibold">Modelo:</span>{" "}
                                {getRegressionModelLabel(status.model)}
                              </p>
                              <p>
                                <span className="font-semibold">Estado:</span>{" "}
                                No disponible
                              </p>
                              {status.unavailableReason && (
                                <p className="mt-1 text-[var(--app-text-muted)]">
                                  <span className="font-semibold">Motivo:</span>{" "}
                                  {status.unavailableReason}
                                </p>
                              )}
                            </div>
                          );
                        }

                        const regression = status.curve;
                        const r2Text = regression.r2.toFixed(4);
                        const quality = getFitQuality(regression.r2);

                        return (
                          <div key={status.id} className={contentPanel}>
                            <p>
                              <span className="font-semibold">Serie:</span>{" "}
                              {status.name}
                            </p>
                            <p>
                              <span className="font-semibold">Modelo:</span> y ={" "}
                              {regression.model === "linear" &&
                              regression.slope != null &&
                              regression.intercept != null ? (
                                <>
                                  {regression.slope.toFixed(4)}x{" "}
                                  {regression.intercept >= 0 ? "+" : "-"}{" "}
                                  {Math.abs(regression.intercept).toFixed(4)}
                                </>
                              ) : regression.model === "exponential" &&
                                regression.a != null &&
                                regression.b != null ? (
                                <>
                                  {regression.a.toFixed(4)} · e^(
                                  {regression.b.toFixed(4)}x)
                                </>
                              ) : regression.model === "logarithmic" &&
                                regression.slope != null &&
                                regression.intercept != null ? (
                                <>
                                  {regression.intercept.toFixed(4)}{" "}
                                  {regression.slope >= 0 ? "+" : "-"}{" "}
                                  {Math.abs(regression.slope).toFixed(4)}·ln(x)
                                </>
                              ) : regression.model === "power" &&
                                regression.a != null &&
                                regression.b != null ? (
                                <>
                                  {regression.a.toFixed(4)} · x^
                                  {regression.b.toFixed(4)}
                                </>
                              ) : regression.a != null &&
                                regression.b != null &&
                                regression.c != null ? (
                                <>
                                  {regression.a.toFixed(4)}x²{" "}
                                  {regression.b >= 0 ? "+" : "-"}{" "}
                                  {Math.abs(regression.b).toFixed(4)}x{" "}
                                  {regression.c >= 0 ? "+" : "-"}{" "}
                                  {Math.abs(regression.c).toFixed(4)}
                                </>
                              ) : (
                                "N/A"
                              )}
                            </p>
                            <p>
                              <span className="font-semibold">R²:</span> {r2Text}
                            </p>
                            <p>
                              <span className="font-semibold">Calidad:</span>{" "}
                              {quality.label}
                            </p>
                            <span className="mt-1 inline-flex rounded-md bg-[var(--app-surface)] border border-[var(--app-border)] px-2.5 py-1 text-xs font-medium text-[var(--app-text)]">
                              {quality.badge}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    ) : (
                      <p className={emptyState}>No hay regresiones activas.</p>
                    )}
                  </div>
                )}
              </div>
            </NotebookSection>
          )}

            {isAssistantModuleEnabled && showScientificInterpretation && (
              <NotebookSection
                title="Interpretación científica"
                icon="🧠"
                subtitle="Lenguaje natural a partir de resultados"
                defaultOpen={false}
              >
                {scientificInterpretation ? (
                  <div className={contentPanel}>
                    {scientificInterpretation.summary.length > 0 && (
                      <div className="mb-4">
                        <p className="font-semibold text-sm mb-2">
                          Resumen general
                        </p>
                        {scientificInterpretation.summary.map((line) => (
                          <p key={`summary-${line}`} className="text-sm mt-1">
                            {line}
                          </p>
                        ))}
                      </div>
                    )}

                    {scientificInterpretation.findings.length > 0 && (
                      <div className="mb-4">
                        <p className="font-semibold text-sm mb-2">
                          Hallazgos principales
                        </p>
                        {scientificInterpretation.findings.map((line) => (
                          <p key={`finding-${line}`} className="text-sm mt-1">
                            {line}
                          </p>
                        ))}
                      </div>
                    )}

                    {scientificInterpretation.recommendations.length > 0 && (
                      <div className="mb-4">
                        <p className="font-semibold text-sm mb-2">
                          Recomendaciones
                        </p>
                        {scientificInterpretation.recommendations.map(
                          (line) => (
                            <p
                              key={`recommendation-${line}`}
                              className="text-sm mt-1"
                            >
                              {line}
                            </p>
                          )
                        )}
                      </div>
                    )}

                    {scientificInterpretation.warnings.length > 0 && (
                      <div>
                        <p className="font-semibold text-sm mb-2">
                          Advertencias
                        </p>
                        {scientificInterpretation.warnings.map((line) => (
                          <p
                            key={`warning-${line}`}
                            className={`text-sm mt-1 ${emptyState}`}
                          >
                            {line}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className={emptyState}>
                    No hay información suficiente para generar una
                    interpretación científica.
                  </p>
                )}
              </NotebookSection>
            )}

            {isAssistantModuleEnabled && showScientificAssistant && (
              <NotebookSection
                title="Asistente científico"
                icon="🧪"
                subtitle="Conclusiones y flujo recomendado"
                defaultOpen={false}
              >
                {scientificAssistantReport ? (
                  <div className={contentPanel}>
                    <div className="mb-4">
                      <p className="font-semibold text-sm mb-2">
                        Evaluación general
                      </p>
                      <p className="text-sm">
                        {scientificAssistantReport.overallAssessment}
                      </p>
                      <p className="text-sm mt-2">
                        <span className="font-semibold">
                          Nivel de confianza:
                        </span>{" "}
                        {getScientificAssistantConfidenceLabel(
                          scientificAssistantReport.confidenceLevel
                        )}
                      </p>
                    </div>

                    {scientificAssistantReport.keyFindings.length > 0 && (
                      <div className="mb-4">
                        <p className="font-semibold text-sm mb-2">
                          Hallazgos clave
                        </p>
                        {scientificAssistantReport.keyFindings.map(
                          (finding) => (
                            <p
                              key={`assistant-finding-${finding}`}
                              className="text-sm mt-1"
                            >
                              • {finding}
                            </p>
                          )
                        )}
                      </div>
                    )}

                    {scientificAssistantReport.recommendedWorkflow.length >
                      0 && (
                      <div className="mb-4">
                        <p className="font-semibold text-sm mb-2">
                          Flujo recomendado
                        </p>
                        {scientificAssistantReport.recommendedWorkflow.map(
                          (step, index) => (
                            <p
                              key={`assistant-workflow-${step}`}
                              className="text-sm mt-1"
                            >
                              {index + 1}. {step}
                            </p>
                          )
                        )}
                      </div>
                    )}

                    {scientificAssistantReport.nextSteps.length > 0 && (
                      <div className="mb-4">
                        <p className="font-semibold text-sm mb-2">
                          Próximos pasos
                        </p>
                        {scientificAssistantReport.nextSteps.map((step) => (
                          <p
                            key={`assistant-next-${step}`}
                            className="text-sm mt-1"
                          >
                            • {step}
                          </p>
                        ))}
                      </div>
                    )}

                    {scientificAssistantReport.cautions.length > 0 && (
                      <div>
                        <p className="font-semibold text-sm mb-2">
                          Advertencias
                        </p>
                        {scientificAssistantReport.cautions.map((caution) => (
                          <p
                            key={`assistant-caution-${caution}`}
                            className={`text-sm mt-1 ${emptyState}`}
                          >
                            {caution}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className={emptyState}>
                    No existe información suficiente para generar
                    recomendaciones científicas.
                  </p>
                )}
              </NotebookSection>
            )}
            </div>
          </section>

          <section
            className={
              activeWorkspaceSection === "reports" && isReportsModuleEnabled
                ? ""
                : "hidden"
            }
            aria-hidden={
              activeWorkspaceSection !== "reports" || !isReportsModuleEnabled
            }
          >
            <h2 className={sectionLabel}>📄 Reportes</h2>
            <p className={`${panelHeadingSubtext} -mt-2 mb-3`}>
              Exportaciones, reporte científico y copia de análisis
            </p>

            <div className="space-y-3">
              {showScientificReport && (
                <NotebookSection
                  title="Reporte científico"
                  icon="📄"
                  subtitle="Documento generado automáticamente"
                  defaultOpen
                >
                  {scientificReport ? (
                    <div className={contentPanel}>
                      <p className="font-semibold text-base">
                        {scientificReport.title}
                      </p>
                      <p className="text-sm text-[var(--app-text-muted)] mt-1">
                        {formatScientificReportDate(
                          scientificReport.generatedAt
                        )}
                      </p>
                      <div className={`${contentPanel} mt-3`}>
                        <p className="font-semibold text-sm">
                          Resumen ejecutivo
                        </p>
                        <p className="text-sm mt-1">
                          {scientificReport.summary}
                        </p>
                      </div>
                      <div className="mt-3">
                        {scientificReport.sections.map((section) => (
                          <ScientificReportSectionCollapsible
                            key={section.title}
                            title={section.title}
                            content={section.content}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className={emptyState}>
                      No hay datos suficientes para generar un reporte.
                    </p>
                  )}
                </NotebookSection>
              )}

              <NotebookSection
                title="Exportaciones"
                icon="📤"
                subtitle="Gráfico y documento científico"
                defaultOpen={false}
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-x-4">
                  <div className={actionBarGroup}>
                    <button
                      type="button"
                      onClick={exportChartPng}
                      disabled={!hasChartContent}
                      title="Exportar PNG"
                      className={actionBarBtnExport}
                    >
                      PNG
                    </button>
                    <button
                      type="button"
                      onClick={exportChartSvg}
                      disabled={!hasChartContent}
                      title="Exportar SVG"
                      className={actionBarBtnExport}
                    >
                      SVG
                    </button>
                    <button
                      type="button"
                      onClick={exportChartJson}
                      title="Exportar JSON"
                      className={actionBarBtnExport}
                    >
                      JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void handleExportScientificReportPdf();
                      }}
                      disabled={scientificReportPdfExporting}
                      title="Exportar reporte científico en PDF"
                      className={`${actionBarBtnExport} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {scientificReportPdfExporting
                        ? "Exportando PDF..."
                        : "📄 Exportar PDF"}
                    </button>
                  </div>
                </div>
                {scientificReportPdfMessage && (
                  <p className="text-xs text-[var(--app-text-muted)] mt-2">
                    {scientificReportPdfMessage}
                  </p>
                )}
              </NotebookSection>

              <NotebookSection
                title="Copiar contenido"
                icon="📋"
                subtitle="Portapapeles para reporte, interpretación y asistente"
                defaultOpen={false}
              >
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      void handleCopyScientificReport();
                    }}
                    disabled={!scientificReport}
                    className={`${btnOutline} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {scientificReportCopied ? "Copiado" : "Copiar reporte"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void handleCopyScientificInterpretation();
                    }}
                    disabled={!scientificInterpretation}
                    className={`${btnOutline} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {scientificInterpretationCopied
                      ? "Copiado"
                      : "📋 Copiar interpretación"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void handleCopyScientificAssistantReport();
                    }}
                    disabled={!scientificAssistantReport}
                    className={`${btnOutline} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {scientificAssistantCopied
                      ? "Copiado"
                      : "📋 Copiar análisis"}
                  </button>
                </div>
              </NotebookSection>

              {!showScientificReport &&
                !showScientificInterpretation &&
                !showScientificAssistant && (
                  <p className={emptyState}>
                    Active reporte, interpretación o asistente en la pestaña
                    Análisis para ver contenido aquí.
                  </p>
                )}
            </div>
          </section>

          {shareNotFound && (
            <div className={alertError}>
              Gráfico no encontrado
            </div>
          )}

          {jsonImportError && (
            <div className={alertError}>
              {jsonImportError}
            </div>
          )}

          {errorMessage && (
            <div className={alertError}>
              {errorMessage}
            </div>
          )}

          {mathWarning && (
            <div className={alertWarning}>
              {mathWarning}
            </div>
          )}

          {rangeWarning.map((warning, index) => (
            <div
              key={index}
              className={alertWarning}
            >
              {warning}
            </div>
          ))}

          {scaleWarning && (
            <div className={`${alertWarning} whitespace-pre-line`}>
              {scaleWarning}
            </div>
          )}


        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return <GraphEditor />;
}
