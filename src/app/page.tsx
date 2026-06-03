"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
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
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
  const [axisScaleMode, setAxisScaleMode] = useState<AxisScaleMode>("linear");
  const [naturalLanguageEnabled, setNaturalLanguageEnabled] = useState(true);
  const [hiddenLegendKeys, setHiddenLegendKeys] = useState<string[]>([]);
  // Curva actualmente seleccionada para los botones de ejemplos
  const [activeCurveIndex, setActiveCurveIndex] = useState<number>(0);
  const [functionSearch, setFunctionSearch] = useState("");
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
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "light";
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark") return stored;
    } catch {
      // ignore storage errors
    }
    return "light";
  });

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
    setExperimentalSeries((prev) => prev.filter((series) => series.id !== id));
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
      const dataUrl = await toPng(chartExportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

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

  const handleExperimentalImport = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const source = getExperimentalDataSource(selectedDataSourceId);
    if (!source?.enabled) return;

    try {
      const series = await importExperimentalDataFile(
        selectedDataSourceId,
        file
      );

      if (!series) {
        setExperimentalImportError("Archivo de datos inválido");
        return;
      }

      setExperimentalImportError(null);
      setExperimentalSeries((prev) => [
        ...prev,
        {
          ...series,
          color: getDefaultColorForIndex(
            curves.filter((curve) => curve.expression.trim()).length + prev.length
          ),
        },
      ]);
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
  const hasVisibleExperimentalSeries = visibleExperimentalSeries.length > 0;
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
    hasMathResults ||
    showDerivative ||
    showIntegral ||
    showIntersections ||
    showCriticalPoints ||
    showRoots ||
    showStatistics ||
    showErrorBars ||
    regressionModel !== "none";
  const composedChartData = useMemo(() => {
    if (chartData.length > 0) return chartData;

    const visiblePoints = visibleExperimentalSeries.flatMap(
      (series) => series.points
    );

    return visiblePoints.length > 0 ? visiblePoints : chartData;
  }, [chartData, visibleExperimentalSeries]);
  const chartTheme = useMemo(() => getChartTheme(themeMode), [themeMode]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch {
      // ignore storage errors
    }
  }, [themeMode]);

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
              onClick={() => setControlPanelTab("library")}
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

          {!isEditing && (
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

          <section>
            <h2 className={sectionLabel}>Panel de control</h2>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
              <div className={`${card} lg:col-span-8 flex flex-col gap-4`}>
                <div
                  className="flex flex-wrap gap-1 border-b border-[var(--app-border)] pb-2"
                  role="tablist"
                  aria-label="Secciones del panel"
                >
                  {(
                    [
                      ["graph", "Información del gráfico"],
                      ["library", "Biblioteca"],
                      ["data", "Fuentes de datos"],
                    ] as const
                  ).map(([tab, label]) => (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={controlPanelTab === tab}
                      onClick={() => setControlPanelTab(tab)}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        controlPanelTab === tab
                          ? "bg-[var(--app-accent)] text-white shadow-sm"
                          : "text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {controlPanelTab === "graph" && (
                <>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={panelHeading}>📐 Constructor de gráfico</h3>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                        isEditing
                          ? "bg-[var(--app-info-bg)] text-[var(--app-info-text)]"
                          : "bg-[var(--app-success-bg)] text-[var(--app-success-text)]"
                      }`}
                    >
                      {isEditing ? "Editando gráfico" : "Nuevo gráfico"}
                    </span>
                  </div>
                  <p className={panelHeadingSubtext}>
                    Define título y expresión matemática
                  </p>
                </div>

                <div className="space-y-5 flex-1">
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

                    <span className={actionBarDivider} aria-hidden />

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
                    </div>

                    <span
                      className="hidden lg:inline text-xs text-[var(--app-text-muted)] ml-auto"
                      aria-hidden
                    >
                      Compartir · IA · Reportes
                    </span>
                  </div>

                  {isEditing && selectedGraphId && (
                    <div
                      className={`${actionBarGroup} mt-2 pt-2 border-t border-dashed border-[var(--app-border)]`}
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
                </>
                )}

                {controlPanelTab === "library" && (
                  <div>
                    <h3 className={panelHeading}>📚 Biblioteca de funciones</h3>
                    <p className={`${panelHeadingSubtext} mb-3`}>
                      Busca y haz clic para insertar en la curva activa
                    </p>
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
                  </div>
                )}

                {controlPanelTab === "data" && (
                  <div>
                    <h3 className={panelHeading}>📊 Fuentes de datos</h3>
                    <p className={`${panelHeadingSubtext} mb-3`}>
                      Importa series experimentales desde CSV, TXT, XLSX u ODS
                    </p>
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

                    {experimentalImportError && (
                      <p className={`mt-3 ${alertError}`}>
                        {experimentalImportError}
                      </p>
                    )}

                    {experimentalSeries.length > 0 && (
                      <ul className="mt-3 space-y-2">
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
                    )}
                  </div>
                )}
              </div>

              <div
                className={`${card} lg:col-span-4 flex flex-col gap-4 lg:min-w-[280px]`}
              >
                <div>
                  <h3 className={panelHeading}>🔧 Herramientas de visualización</h3>
                  <p className={panelHeadingSubtext}>
                    Rango, ejes y opciones de análisis
                  </p>
                </div>

                <div className="space-y-3">
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

                  <div className={subsectionCard}>
                    <p className={subsectionHeading}>📈 Análisis</p>
                    <div className="space-y-3">
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h2 className={`${panelHeading} mb-0`}>📈 Visualización</h2>
                <p className={`${panelHeadingSubtext} mb-0`}>
                  Escala actual: {getAxisScaleModeLabel(axisScaleMode)}
                </p>
              </div>
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
                              seriesName?: string;
                              meanY?: number;
                              stdDevY?: number;
                              semY?: number;
                              ci95Y?: number;
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
                            {payload.map((entry) => (
                              <p key={`${entry.name}-${entry.value}`}>
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
                          data={series.points}
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
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {axisScaleWarnings.map((warning, index) => (
            <div key={`axis-scale-warning-${index}`} className={alertWarning}>
              {warning}
            </div>
          ))}

          {showMathResultsPanel && (
            <section className={card}>
              <h3 className={`${panelHeading} mb-3`}>
                📊 Resultados matemáticos
              </h3>
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
            </section>
          )}

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
