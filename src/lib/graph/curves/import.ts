import type { GraphJsonExport } from "./types";

export const normalizeImportedGraph = (parsed: unknown): GraphJsonExport | null => {
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
