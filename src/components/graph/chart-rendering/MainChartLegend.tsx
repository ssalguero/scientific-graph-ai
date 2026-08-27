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

const legendChipClass =
  "inline-flex items-center gap-2 rounded-md border border-[var(--color-border-default)] bg-[var(--color-surface-canvas)] px-2 py-1 transition-opacity cursor-pointer hover:bg-[var(--color-surface-default)]";

const legendGroupLabelClass =
  "w-full text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]";

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

  const hasCurves =
    activeCurves.length > 0 ||
    derivativeCurves.length > 0 ||
    integralCurves.length > 0;
  const hasExperimental = experimentalSeries.length > 0;
  const hasRegression = regressionCurves.length > 0;
  const showGroupLabels =
    [hasCurves, hasExperimental, hasRegression].filter(Boolean).length > 1;

  return (
    <div className="mb-2 space-y-2 border-b border-[var(--color-border-default)] pb-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-semibold text-[var(--color-text-primary)]">
          Leyenda
        </p>
        <p className="text-[11px] text-[var(--color-text-muted)]">
          Clic para mostrar u ocultar series
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {showGroupLabels && hasCurves ? (
          <span className={legendGroupLabelClass}>Curvas</span>
        ) : null}
        {activeCurves.map((curve) => {
          const legendKey = curveLegendKey(curve.idx);
          const isHidden = hiddenLegendKeys.includes(legendKey);

          return (
            <button
              key={legendKey}
              type="button"
              onClick={() => onToggleLegend(legendKey)}
              className={`${legendChipClass} ${
                isHidden ? "opacity-50" : "opacity-100"
              }`}
              title={isHidden ? "Mostrar curva" : "Ocultar curva"}
              aria-pressed={!isHidden}
            >
              <span
                className="inline-block h-1.5 w-5 shrink-0 rounded-full"
                style={{ backgroundColor: curve.color }}
              />
              <span
                className={`text-sm font-mono ${
                  isHidden
                    ? "text-[var(--color-text-muted)] opacity-60"
                    : "text-[var(--color-text-primary)]"
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
              className={`${legendChipClass} ${
                isHidden ? "opacity-50" : "opacity-100"
              }`}
              title={isHidden ? "Mostrar derivada" : "Ocultar derivada"}
              aria-pressed={!isHidden}
            >
              <span
                className="inline-block h-0.5 w-5 shrink-0 rounded-full border-t-2 border-dashed"
                style={{
                  borderColor: curve.color,
                  opacity: DERIVATIVE_STROKE_OPACITY,
                }}
              />
              <span
                className={`text-sm font-mono ${
                  isHidden
                    ? "text-[var(--color-text-muted)] opacity-60"
                    : "text-[var(--color-text-primary)]"
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
              className={`${legendChipClass} ${
                isHidden ? "opacity-50" : "opacity-100"
              }`}
              title={isHidden ? "Mostrar integral" : "Ocultar integral"}
              aria-pressed={!isHidden}
            >
              <span
                className="inline-block h-0.5 w-5 shrink-0 rounded-full border-t-2 border-dashed"
                style={{
                  borderColor: curve.color,
                  opacity: INTEGRAL_STROKE_OPACITY,
                }}
              />
              <span
                className={`text-sm font-mono ${
                  isHidden
                    ? "text-[var(--color-text-muted)] opacity-60"
                    : "text-[var(--color-text-primary)]"
                }`}
              >
                ∫({curve.sourceExpression})
              </span>
            </button>
          );
        })}

        {showGroupLabels && hasExperimental ? (
          <span className={legendGroupLabelClass}>Series</span>
        ) : null}
        {experimentalSeries.map((series) => {
          const legendKey = experimentalLegendKey(series.id);
          const isHidden = hiddenLegendKeys.includes(legendKey);

          return (
            <button
              key={legendKey}
              type="button"
              onClick={() => onToggleLegend(legendKey)}
              className={`${legendChipClass} ${
                isHidden ? "opacity-50" : "opacity-100"
              }`}
              title={isHidden ? "Mostrar serie" : "Ocultar serie"}
              aria-pressed={!isHidden}
            >
              <span
                className="inline-block h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: series.color }}
              />
              <span
                className={`text-sm ${
                  isHidden
                    ? "text-[var(--color-text-muted)] opacity-60"
                    : "text-[var(--color-text-primary)]"
                }`}
              >
                {series.name}
              </span>
            </button>
          );
        })}

        {showGroupLabels && hasRegression ? (
          <span className={legendGroupLabelClass}>Regresión</span>
        ) : null}
        {regressionCurves.map((regression) => {
          const legendKey = regressionLegendKey(regression.id);
          const isHidden = hiddenLegendKeys.includes(legendKey);

          return (
            <button
              key={legendKey}
              type="button"
              onClick={() => onToggleLegend(legendKey)}
              className={`${legendChipClass} ${
                isHidden ? "opacity-50" : "opacity-100"
              }`}
              title={isHidden ? "Mostrar regresión" : "Ocultar regresión"}
              aria-pressed={!isHidden}
            >
              <span
                className="inline-block h-0.5 w-5 shrink-0 rounded-full border-t-2 border-dashed"
                style={{ borderColor: regression.color }}
              />
              <span
                className={`text-sm ${
                  isHidden
                    ? "text-[var(--color-text-muted)] opacity-60"
                    : "text-[var(--color-text-primary)]"
                }`}
              >
                Regresión - {regression.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
