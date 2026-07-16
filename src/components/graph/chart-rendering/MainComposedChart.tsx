"use client";

import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  curveLegendKey,
  derivativeLegendKey,
  experimentalLegendKey,
  integralLegendKey,
  regressionLegendKey,
} from "./legendKeys";
import { renderMaximumMarker, renderMinimumMarker } from "./markers";
import { mapExperimentalScatterData } from "./scatterAdapters";
import {
  DERIVATIVE_STROKE_OPACITY,
  INTEGRAL_STROKE_OPACITY,
} from "./tokens";
import type { ChartOutlierMethod, MainComposedChartProps } from "./types";

export function MainComposedChart({
  data,
  chartTheme,
  usesLogX,
  usesLogY,
  useDualYAxis,
  xAxisDomain,
  mathYAxisDomainForChart,
  experimentalYAxisDomainForChart,
  yAxisDomainForChart,
  activeCurves,
  derivativeCurves,
  integralCurves,
  visibleExperimentalSeries,
  errorBarSeries,
  regressionCurves,
  hiddenLegendKeys,
  showErrorBars,
  showIntersections,
  showCriticalPoints,
  showRoots,
  showOutliers,
  intersectionChartPoints,
  criticalMaxChartPoints,
  criticalMinChartPoints,
  rootChartPoints,
  outlierChartPoints,
  outlierMethod,
  formatStat,
  formatOutlierScore,
  getOutlierMethodLabel,
}: MainComposedChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data}>
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
                  method?: ChartOutlierMethod;
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
                    Media: {formatStat(pointPayload.meanY ?? 0)}
                  </p>
                  <p>
                    SD: {formatStat(pointPayload.stdDevY ?? 0)}
                  </p>
                  <p>
                    SEM: {formatStat(pointPayload.semY ?? 0)}
                  </p>
                  <p>
                    IC95: {formatStat(pointPayload.ci95Y ?? 0)}
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
                  <p>X: {formatStat(label as number)}</p>
                  <p>
                    Y: {formatStat(Number(payload[0]?.value ?? 0))}
                  </p>
                  <p>
                    Método:{" "}
                    {getOutlierMethodLabel(
                      pointPayload.method ?? outlierMethod
                    )}
                  </p>
                  <p>
                    Score: {formatOutlierScore(pointPayload.score ?? 0)}
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
          hiddenLegendKeys.includes(derivativeLegendKey(curve.id)) ? null : (
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
        {visibleExperimentalSeries.map((series) =>
          hiddenLegendKeys.includes(
            experimentalLegendKey(series.id)
          ) ? null : (
            <Scatter
              key={experimentalLegendKey(series.id)}
              name={series.name}
              data={mapExperimentalScatterData(series.name, series.points)}
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
  );
}
