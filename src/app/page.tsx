"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
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
      <aside className="w-full lg:w-[280px] lg:min-h-screen shrink-0 bg-[var(--app-surface)] border-b lg:border-b-0 lg:border-r border-[var(--app-border)] flex flex-col transition-colors duration-200">
        <div className="p-5 border-b border-[var(--app-border)]">
          <h2 className="text-xl font-semibold text-[var(--app-heading)] tracking-tight">
            Gráficos
          </h2>
          <p className="text-base text-[var(--app-text-muted)] mt-1">
            {graphs.length}{" "}
            {graphs.length === 1 ? "gráfico guardado" : "gráficos guardados"}
          </p>
        </div>

        <div className="p-5">
          <button
            onClick={newGraph}
            className={`w-full bg-emerald-600 hover:bg-emerald-700 ${btnPrimary} py-3.5 text-base font-semibold mb-4`}
          >
            + Nuevo gráfico
          </button>

          <div
            className="mb-6 flex items-center justify-between gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2.5 transition-colors duration-200"
            role="group"
            aria-label="Tema de la aplicación"
          >
            <span
              className={`text-sm font-medium transition-colors duration-200 ${
                themeMode === "light"
                  ? "text-[var(--app-heading)]"
                  : "text-[var(--app-text-muted)]"
              }`}
            >
              ☀ Claro
            </span>
            <label className={`${toggleShell} cursor-pointer`}>
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
            <span
              className={`text-sm font-medium transition-colors duration-200 ${
                themeMode === "dark"
                  ? "text-[var(--app-heading)]"
                  : "text-[var(--app-text-muted)]"
              }`}
            >
              🌙 Oscuro
            </span>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {graphs.map((graph) => (
              <button
                key={graph.id}
                onClick={() => loadGraph(graph)}
                className={`w-full text-left border rounded-lg px-3 py-3.5 text-base transition-colors duration-200 ${
                  selectedGraphId === graph.id
                    ? "bg-[var(--app-accent)]/10 border-[var(--app-accent)] text-[var(--app-heading)] shadow-sm ring-1 ring-[var(--app-accent)]/25 font-medium"
                    : "border-[var(--app-border)] text-[var(--app-text)] hover:bg-[var(--app-surface-muted)] hover:border-[var(--app-text-muted)] hover:shadow-sm"
                }`}
              >
                <span className="line-clamp-2">
                  {getGraphDisplayTitle(graph)}
                </span>
              </button>
            ))}
          </div>
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
                    </div>
                  </div>

                  <div
                    className={`${subsectionCard} border-dashed opacity-70`}
                    aria-hidden
                  >
                    <p className={subsectionHeading}>Próximamente</p>
                    <ul className="space-y-1.5 text-xs text-[var(--app-text-muted)]">
                      <li>Intersecciones</li>
                      <li>Máximos y mínimos</li>
                      <li>Estadística</li>
                      <li>Barras de error</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h2 className={`${panelHeading} mb-0`}>📈 Visualización</h2>
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
                      domain={[visibleMinX, visibleMaxX]}
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
                          stroke={chartTheme.axis}
                          tick={{ fill: chartTheme.axis }}
                          fontSize={14}
                          domain={mathYAxisDomain}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke={chartTheme.axis}
                          tick={{ fill: chartTheme.axis }}
                          fontSize={14}
                          domain={experimentalYAxisDomain}
                        />
                      </>
                    ) : (
                      <YAxis
                        stroke={chartTheme.axis}
                        tick={{ fill: chartTheme.axis }}
                        fontSize={14}
                        domain={yAxisDomain}
                      />
                    )}
                    <Tooltip
                      contentStyle={{
                        borderRadius: "0.5rem",
                        border: `1px solid ${chartTheme.tooltipBorder}`,
                        backgroundColor: chartTheme.tooltipBg,
                        color: chartTheme.tooltipColor,
                        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                      }}
                      labelStyle={{ color: chartTheme.tooltipColor }}
                      itemStyle={{ color: chartTheme.tooltipColor }}
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
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

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
