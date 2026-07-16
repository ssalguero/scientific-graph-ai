"use client";

import {
  curveLegendKey,
  derivativeLegendKey,
  experimentalLegendKey,
  integralLegendKey,
  regressionLegendKey,
} from "./legendKeys";
import {
  DERIVATIVE_STROKE_OPACITY,
  INTEGRAL_STROKE_OPACITY,
} from "./tokens";
import type { MainChartLegendProps } from "./types";

export function MainChartLegend({
  hasLegendItems,
  activeCurves,
  derivativeCurves,
  integralCurves,
  experimentalSeries,
  regressionCurves,
  hiddenLegendKeys,
  onToggleLegend,
}: MainChartLegendProps) {
  if (!hasLegendItems) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-2 pb-2 border-b border-[var(--app-border)]">
      {activeCurves.map((curve) => {
        const legendKey = curveLegendKey(curve.idx);
        const isHidden = hiddenLegendKeys.includes(legendKey);

        return (
          <button
            key={legendKey}
            type="button"
            onClick={() => onToggleLegend(legendKey)}
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
            onClick={() => onToggleLegend(legendKey)}
            className={`flex items-center gap-2 transition-opacity cursor-pointer ${
              isHidden ? "opacity-50" : "opacity-100"
            }`}
            title={isHidden ? "Mostrar derivada" : "Ocultar derivada"}
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
            onClick={() => onToggleLegend(legendKey)}
            className={`flex items-center gap-2 transition-opacity cursor-pointer ${
              isHidden ? "opacity-50" : "opacity-100"
            }`}
            title={isHidden ? "Mostrar integral" : "Ocultar integral"}
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
            onClick={() => onToggleLegend(legendKey)}
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
            onClick={() => onToggleLegend(legendKey)}
            className={`flex items-center gap-2 transition-opacity cursor-pointer ${
              isHidden ? "opacity-50" : "opacity-100"
            }`}
            title={isHidden ? "Mostrar regresión" : "Ocultar regresión"}
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
  );
}
