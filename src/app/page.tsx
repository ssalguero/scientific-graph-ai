"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { toPng, toSvg } from "html-to-image";
import { supabase } from "../lib/supabase";
import { evaluate } from "mathjs";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const card =
  "bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8";
const inputField =
  "w-full border border-slate-200 rounded-lg px-4 py-3 text-base text-slate-900 bg-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500";
const btnPrimary =
  "inline-flex items-center justify-center font-semibold text-white text-base px-7 py-3 rounded-lg shadow-sm transition-all hover:shadow-md active:scale-[0.98]";
const btnOutline =
  "border border-slate-200 bg-white px-4 py-2 rounded-lg text-base text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 hover:shadow";
const sectionTitle =
  "text-sm sm:text-base font-semibold uppercase tracking-wider text-slate-500 mb-5";

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

const evaluateExpression = (expression: string, scope: { x: number }) =>
  evaluate(expression.replace(/\bln\s*\(/gi, "log("), scope);

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
  const [hiddenCurves, setHiddenCurves] = useState<number[]>([]);
  // Curva actualmente seleccionada para los botones de ejemplos
  const [activeCurveIndex, setActiveCurveIndex] = useState<number>(0);

  const nextCurveIdRef = useRef(2);
  const chartExportRef = useRef<HTMLDivElement>(null);
  const chartInteractionRef = useRef<HTMLDivElement>(null);
  const jsonImportInputRef = useRef<HTMLInputElement>(null);
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
    setHiddenCurves([]);
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

  const toggleCurveVisibility = (idx: number) => {
    setHiddenCurves((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const exportChartPng = async () => {
    if (!chartExportRef.current || chartData.length === 0) return;

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
    if (!chartExportRef.current || chartData.length === 0) return;

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

  const generateGraph = (curveSource?: Curve[]) => {
    try {
      const sourceCurves = curveSource ?? curves;
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

    const trimmedExpr = expr.trim();
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
    if (!expression.trim()) return;

    const graphTitle = title.trim() || expression;
    const legacyColor =
      HEX_TO_LEGACY_COLOR[curves[0]?.color?.toLowerCase() ?? ""] ?? "blue";

    const graphPayload = {
      title: graphTitle,
      expression: expression,
      curves: curves.map((c) => ({
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
    setHiddenCurves([]);
  };

  const loadGraph = (graph: any, options?: { asNew?: boolean }) => {
    setHiddenCurves([]);
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
  const yAxisDomain = autoScaleY ? computeYAxisDomain(yMetrics) : undefined;
  const activeCurves = curves
    .map((c, idx) => ({
      idx,
      expression: c.expression.trim(),
      color: c.color,
    }))
    .filter((c) => c.expression.length > 0);

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
  }, [chartData.length]);

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
    <main className="flex min-h-screen flex-col lg:flex-row bg-slate-50">
      <aside className="w-full lg:w-[280px] lg:min-h-screen shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
            Gráficos
          </h2>
          <p className="text-base text-slate-500 mt-1">
            {graphs.length}{" "}
            {graphs.length === 1 ? "gráfico guardado" : "gráficos guardados"}
          </p>
        </div>

        <div className="p-5">
          <button
            onClick={newGraph}
            className={`w-full bg-emerald-600 hover:bg-emerald-700 ${btnPrimary} py-3.5 text-base font-semibold mb-6`}
          >
            + Nuevo gráfico
          </button>

          <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {graphs.map((graph) => (
              <button
                key={graph.id}
                onClick={() => loadGraph(graph)}
                className={`w-full text-left border rounded-lg px-3 py-3.5 text-base transition-all ${
                  selectedGraphId === graph.id
                    ? "bg-blue-50 border-blue-500 text-blue-900 shadow-sm ring-1 ring-blue-500/20 font-medium"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm"
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
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-8 lg:py-10 space-y-8 lg:space-y-12">
          <header>
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold text-slate-900 tracking-tight">
              Scientific Graph AI
            </h1>
            <p className="text-slate-500 mt-3 text-lg sm:text-xl">
              Visualiza, guarda y gestiona tus funciones matemáticas
            </p>
          </header>

          <section>
            <h2 className={sectionTitle}>Panel de control</h2>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
              <div className={`${card} lg:col-span-9 flex flex-col gap-6`}>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg xl:text-xl font-semibold text-slate-900">
                      Información del gráfico
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                        isEditing
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {isEditing ? "Editando gráfico" : "Nuevo gráfico"}
                    </span>
                  </div>
                  <p className="text-base text-slate-500 mt-2">
                    Define título y expresión matemática
                  </p>
                </div>

                <div className="space-y-5 flex-1">
                  <div>
                    <label className="block text-base font-medium text-slate-700 mb-2">
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
                    <p className="text-base font-medium text-slate-700">
                      Curvas
                    </p>
                    <button
                      type="button"
                      onClick={addCurve}
                      className="text-sm font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                    >
                      + Agregar curva
                    </button>
                  </div>

                  <div className="space-y-4">
                    {curves.map((curve, idx) => (
                      <div key={curve.id}>
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <label className="block text-base font-medium text-slate-700">
                            Expresión {idx + 1}
                          </label>
                          <div className="flex items-center gap-3">
                            <label className="inline-flex items-center gap-2 text-sm text-slate-500 cursor-pointer">
                              <input
                                type="color"
                                value={curve.color}
                                onChange={(e) =>
                                  updateCurveColor(curve.id, e.target.value)
                                }
                                className="h-9 w-12 cursor-pointer rounded border border-slate-200 bg-white p-0.5"
                                title="Color de la curva"
                              />
                              Color
                            </label>
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => removeCurve(curve.id)}
                                className="text-sm font-semibold text-slate-500 hover:text-slate-700 hover:underline"
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
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-2">
                  <button
                    onClick={() => generateGraph()}
                    className={`bg-emerald-600 hover:bg-emerald-700 ${btnPrimary} sm:min-w-[160px]`}
                  >
                    Graficar
                  </button>
                  <button
                    onClick={saveGraph}
                    className={`bg-blue-600 hover:bg-blue-700 ${btnPrimary} sm:min-w-[160px]`}
                  >
                    {isEditing ? "Actualizar" : "Guardar"}
                  </button>
                  {isEditing && selectedGraphId && (
                    <>
                      <button
                        type="button"
                        onClick={copyShareLink}
                        className={`${btnOutline} sm:min-w-[160px] px-7 py-3 font-semibold`}
                      >
                        {linkCopied ? "Enlace copiado" : "Copiar enlace"}
                      </button>
                      <button
                        type="button"
                        onClick={duplicateGraph}
                        className={`${btnOutline} sm:min-w-[160px] px-7 py-3 font-semibold`}
                      >
                        Duplicar
                      </button>
                      <button
                        onClick={() => deleteGraph(selectedGraphId)}
                        className={`bg-red-600 hover:bg-red-700 ${btnPrimary} sm:min-w-[160px]`}
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={exportChartPng}
                    disabled={chartData.length === 0}
                    className={`${btnOutline} sm:min-w-[160px] px-7 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Exportar PNG
                  </button>
                  <button
                    type="button"
                    onClick={exportChartSvg}
                    disabled={chartData.length === 0}
                    className={`${btnOutline} sm:min-w-[160px] px-7 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Exportar SVG
                  </button>
                  <button
                    type="button"
                    onClick={exportChartJson}
                    className={`${btnOutline} sm:min-w-[160px] px-7 py-3 font-semibold`}
                  >
                    Exportar JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => jsonImportInputRef.current?.click()}
                    className={`${btnOutline} sm:min-w-[160px] px-7 py-3 font-semibold`}
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

              <div className={`${card} lg:col-span-3 flex flex-col gap-6`}>
                <div>
                  <h3 className="text-lg xl:text-xl font-semibold text-slate-900">
                    Rango
                  </h3>
                  <p className="text-base text-slate-500 mt-2">
                    Define el intervalo del eje X
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-5 flex-1 content-start">
                  <div>
                    <label className="block text-base font-medium text-slate-700 mb-2">
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
                    <label className="block text-base font-medium text-slate-700 mb-2">
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

                <label className="inline-flex items-center gap-2.5 text-base text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoScaleY}
                    onChange={(e) => setAutoScaleY(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                  />
                  Ajustar eje Y automáticamente
                </label>
              </div>
            </div>
          </section>

          <section className={`${card}`}>
            <h3 className="text-lg xl:text-xl font-semibold text-slate-900 mb-2">
              Ejemplos matemáticos
            </h3>
            <p className="text-base text-slate-500 mb-5">
              Haz clic para cargar una expresión de ejemplo
            </p>

            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  📐 Básicas
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => graphExpression("x^2")}
                    className={btnOutline}
                  >
                    x²
                  </button>
                  <button
                    onClick={() => graphExpression("x^3")}
                    className={btnOutline}
                  >
                    x³
                  </button>
                  <button
                    onClick={() => graphExpression("abs(x)")}
                    className={btnOutline}
                  >
                    abs(x)
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  📈 Exponenciales y logarítmicas
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => graphExpression("exp(x)")}
                    className={btnOutline}
                  >
                    exp(x)
                  </button>
                  <button
                    onClick={() => graphExpression("log(x)")}
                    className={btnOutline}
                  >
                    log(x)
                  </button>
                  <button
                    onClick={() => graphExpression("ln(x)")}
                    className={btnOutline}
                  >
                    ln(x)
                  </button>
                  <button
                    onClick={() => graphExpression("log10(x)")}
                    className={btnOutline}
                  >
                    log10(x)
                  </button>
                  <button
                    onClick={() => graphExpression("sqrt(abs(x))")}
                    className={btnOutline}
                  >
                    sqrt(abs(x))
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  📊 Trigonométricas
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => graphExpression("sin(x)")}
                    className={btnOutline}
                  >
                    sin(x)
                  </button>
                  <button
                    onClick={() => graphExpression("cos(x)")}
                    className={btnOutline}
                  >
                    cos(x)
                  </button>
                  <button
                    onClick={() => graphExpression("tan(x)")}
                    className={btnOutline}
                  >
                    tan(x)
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  🔄 Trigonométricas inversas
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => graphExpression("asin(x)")}
                    className={btnOutline}
                  >
                    asin(x)
                  </button>
                  <button
                    onClick={() => graphExpression("acos(x)")}
                    className={btnOutline}
                  >
                    acos(x)
                  </button>
                  <button
                    onClick={() => graphExpression("atan(x)")}
                    className={btnOutline}
                  >
                    atan(x)
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  〰️ Hiperbólicas
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => graphExpression("sinh(x)")}
                    className={btnOutline}
                  >
                    sinh(x)
                  </button>
                  <button
                    onClick={() => graphExpression("cosh(x)")}
                    className={btnOutline}
                  >
                    cosh(x)
                  </button>
                  <button
                    onClick={() => graphExpression("tanh(x)")}
                    className={btnOutline}
                  >
                    tanh(x)
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  🔢 Redondeo
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => graphExpression("floor(x)")}
                    className={btnOutline}
                  >
                    floor(x)
                  </button>
                  <button
                    onClick={() => graphExpression("ceil(x)")}
                    className={btnOutline}
                  >
                    ceil(x)
                  </button>
                  <button
                    onClick={() => graphExpression("round(x)")}
                    className={btnOutline}
                  >
                    round(x)
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className={`${card}`}>
            <h3 className="text-lg xl:text-xl font-semibold text-slate-900 mb-2">
              Funciones soportadas
            </h3>
            <p className="text-base text-slate-500 mb-5">
              Sintaxis disponible para escribir expresiones
            </p>

            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  📐 Básicas
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="font-mono text-base text-slate-700 bg-slate-50 rounded-md px-3 py-1.5">
                    x
                  </span>
                  <span className="font-mono text-base text-slate-700 bg-slate-50 rounded-md px-3 py-1.5">
                    x^2
                  </span>
                  <span className="font-mono text-base text-slate-700 bg-slate-50 rounded-md px-3 py-1.5">
                    1/x
                  </span>
                  <span className="font-mono text-base text-slate-700 bg-slate-50 rounded-md px-3 py-1.5">
                    abs(x)
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  📈 Exponenciales y logarítmicas
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="font-mono text-base text-slate-700 bg-slate-50 rounded-md px-3 py-1.5">
                    exp(x)
                  </span>
                  <span className="font-mono text-base text-slate-700 bg-slate-50 rounded-md px-3 py-1.5">
                    log(x)
                  </span>
                  <span className="font-mono text-base text-slate-700 bg-slate-50 rounded-md px-3 py-1.5">
                    ln(x)
                  </span>
                  <span className="font-mono text-base text-slate-700 bg-slate-50 rounded-md px-3 py-1.5">
                    sqrt(x)
                  </span>
                  <span className="font-mono text-base text-slate-700 bg-slate-50 rounded-md px-3 py-1.5">
                    log10(x)
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  📊 Trigonométricas
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="font-mono text-base text-slate-700 bg-slate-50 rounded-md px-3 py-1.5">
                    sin(x)
                  </span>
                  <span className="font-mono text-base text-slate-700 bg-slate-50 rounded-md px-3 py-1.5">
                    cos(x)
                  </span>
                  <span className="font-mono text-base text-slate-700 bg-slate-50 rounded-md px-3 py-1.5">
                    tan(x)
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  🔄 Trigonométricas inversas
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="font-mono text-base text-slate-700 bg-slate-50 rounded-md px-3 py-1.5">
                    asin(x)
                  </span>
                  <span className="font-mono text-base text-slate-700 bg-slate-50 rounded-md px-3 py-1.5">
                    acos(x)
                  </span>
                  <span className="font-mono text-base text-slate-700 bg-slate-50 rounded-md px-3 py-1.5">
                    atan(x)
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  〰️ Hiperbólicas
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="font-mono text-base text-slate-700 bg-slate-50 rounded-md px-3 py-1.5">
                    sinh(x)
                  </span>
                  <span className="font-mono text-base text-slate-700 bg-slate-50 rounded-md px-3 py-1.5">
                    cosh(x)
                  </span>
                  <span className="font-mono text-base text-slate-700 bg-slate-50 rounded-md px-3 py-1.5">
                    tanh(x)
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  🔢 Redondeo
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="font-mono text-base text-slate-700 bg-slate-50 rounded-md px-3 py-1.5">
                    floor(x)
                  </span>
                  <span className="font-mono text-base text-slate-700 bg-slate-50 rounded-md px-3 py-1.5">
                    ceil(x)
                  </span>
                  <span className="font-mono text-base text-slate-700 bg-slate-50 rounded-md px-3 py-1.5">
                    round(x)
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  🔢 Constantes
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="font-mono text-base text-slate-700 bg-slate-50 rounded-md px-3 py-1.5">
                    pi
                  </span>
                  <span className="font-mono text-base text-slate-700 bg-slate-50 rounded-md px-3 py-1.5">
                    e
                  </span>
                </div>
              </div>
            </div>
          </section>

          {shareNotFound && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-red-700 text-base font-medium">
              Gráfico no encontrado
            </div>
          )}

          {jsonImportError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-red-700 text-base font-medium">
              {jsonImportError}
            </div>
          )}

          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-red-700 text-base font-medium">
              {errorMessage}
            </div>
          )}

          {mathWarning && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-amber-800 text-base font-medium">
              {mathWarning}
            </div>
          )}

          {rangeWarning.map((warning, index) => (
            <div
              key={index}
              className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-amber-800 text-base font-medium"
            >
              {warning}
            </div>
          ))}

          {scaleWarning && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-amber-800 text-base font-medium whitespace-pre-line">
              {scaleWarning}
            </div>
          )}

          <section>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <h2 className={`${sectionTitle} mb-0`}>Visualización</h2>
              <button
                type="button"
                onClick={resetVisibleRange}
                disabled={chartData.length === 0}
                className={`${btnOutline} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Restablecer vista
              </button>
            </div>
            <div
              ref={chartExportRef}
              className={`${card} p-5 sm:p-6 lg:p-8 w-full`}
            >
              {activeCurves.length > 0 && (
                <div className="flex flex-wrap gap-5 mb-5 pb-5 border-b border-slate-100">
                  {activeCurves.map((curve) => {
                    const isHidden = hiddenCurves.includes(curve.idx);

                    return (
                      <button
                        key={curve.idx}
                        type="button"
                        onClick={() => toggleCurveVisibility(curve.idx)}
                        className={`flex items-center gap-2.5 transition-opacity cursor-pointer ${
                          isHidden ? "opacity-50" : "opacity-100"
                        }`}
                        title={
                          isHidden
                            ? "Mostrar curva"
                            : "Ocultar curva"
                        }
                      >
                        <span
                          className="inline-block w-5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: curve.color }}
                        />
                        <span
                          className={`text-sm font-mono ${
                            isHidden ? "text-slate-400" : "text-slate-700"
                          }`}
                        >
                          {curve.expression}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div
                ref={chartInteractionRef}
                className="w-full min-h-[600px] h-[600px] sm:h-[650px] lg:h-[700px] max-h-[700px] select-none cursor-grab active:cursor-grabbing"
                onMouseDown={handleChartMouseDown}
                onMouseMove={handleChartMouseMove}
                onMouseUp={handleChartMouseUp}
                onMouseLeave={handleChartMouseUp}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="x"
                      type="number"
                      domain={[visibleMinX, visibleMaxX]}
                      allowDataOverflow
                      stroke="#64748b"
                      fontSize={14}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={14}
                      domain={yAxisDomain}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "0.5rem",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                      }}
                    />
                    {activeCurves.map((curve) =>
                      hiddenCurves.includes(curve.idx) ? null : (
                        <Line
                          key={curve.idx}
                          type="monotone"
                          dataKey={`y${curve.idx + 1}`}
                          stroke={curve.color}
                          strokeWidth={2}
                          dot={false}
                          connectNulls
                        />
                      )
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return <GraphEditor />;
}
