"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ChartRenderTokens } from "@/lib/graph/publication-presets/types";
import { DEFAULT_CHART_RENDER_TOKENS } from "@/lib/graph/publication-presets/tokens";
import { computeYAxisDomainFromValues } from "@/lib/graph/viewport";
import type {
  VisualGraphMarkerStyle,
  VisualGraphPreview,
} from "@/lib/visualGraphBuilder";

import { HeatmapPreview } from "./HeatmapPreview";
import { BubblePreview } from "./BubblePreview";
import { ScatterPreview } from "./ScatterPreview";
import { PCAPreview } from "./PCAPreview";

export type ScatterPreviewStyle = {
  color: string;
  markerSize: number;
  marker: VisualGraphMarkerStyle;
};

type GraphPreviewProps = {
  preview: VisualGraphPreview | null;
  errorMessage?: string | null;
  /** Resolved in VisualGraphBuilder; legacy callers omit for default tokens. */
  chartTokens?: ChartRenderTokens;
  lineStrokeDasharray?: string;
  scatterStyle?: ScatterPreviewStyle | null;
};

const rechartsTooltipStyle = (chartTokens: ChartRenderTokens) => ({
  backgroundColor: chartTokens.tooltip.background,
  border: `1px solid ${chartTokens.tooltip.border}`,
  color: chartTokens.tooltip.color,
  fontSize: chartTokens.tooltip.fontSize,
});

function BoxPlotPreview({
  data,
}: {
  data: VisualGraphPreview["boxPlotData"];
}) {
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.group} className="rounded-lg border border-[var(--app-border)] p-3">
          <p className="mb-2 text-xs font-semibold text-[var(--app-heading)]">
            {item.group}
          </p>
          <div className="grid grid-cols-5 gap-2 text-[10px] text-[var(--app-text-muted)]">
            <span>Min: {item.min.toFixed(2)}</span>
            <span>Q1: {item.q1.toFixed(2)}</span>
            <span>Med: {item.median.toFixed(2)}</span>
            <span>Q3: {item.q3.toFixed(2)}</span>
            <span>Max: {item.max.toFixed(2)}</span>
          </div>
          <div className="relative mt-3 h-8 rounded bg-[var(--app-surface-muted)]">
            <div
              className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-[var(--app-accent)]"
              style={{
                left: "8%",
                width: "84%",
              }}
            />
            <div
              className="absolute top-1/2 h-5 -translate-y-1/2 rounded border border-[var(--app-accent)] bg-[var(--app-accent)]/15"
              style={{
                left: "28%",
                width: "44%",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ViolinPreview({
  data,
}: {
  data: VisualGraphPreview["violinData"];
}) {
  return (
    <div className="space-y-3">
      {data.map((item) => {
        const min = Math.min(...item.values);
        const max = Math.max(...item.values);
        const range = max - min || 1;
        return (
          <div
            key={item.group}
            className="rounded-lg border border-[var(--app-border)] p-3"
          >
            <p className="mb-2 text-xs font-semibold text-[var(--app-heading)]">
              {item.group}
            </p>
            <div className="flex h-24 items-end gap-0.5">
              {item.values.map((value, index) => (
                <div
                  key={`${item.group}-${index}`}
                  className="flex-1 rounded-t bg-[var(--app-accent)]/70"
                  style={{
                    height: `${Math.max(8, ((value - min) / range) * 100)}%`,
                  }}
                  title={String(value)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function GraphPreview({
  preview,
  errorMessage,
  chartTokens,
  lineStrokeDasharray,
  scatterStyle,
}: GraphPreviewProps) {
  if (errorMessage) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center rounded-xl border border-[var(--app-danger-border)] bg-[var(--app-danger-bg)] p-4 text-sm text-[var(--app-danger-text)]">
        {errorMessage}
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center rounded-xl border border-dashed border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4 text-sm text-[var(--app-text-muted)]">
        Configure el gráfico para ver la vista previa.
      </div>
    );
  }

  const effectiveChartTokens = chartTokens ?? DEFAULT_CHART_RENDER_TOKENS;

  const chartSurfaceStyle =
    effectiveChartTokens.background !== "transparent"
      ? { backgroundColor: effectiveChartTokens.background }
      : undefined;

  return (
    <div className="flex h-full min-h-[320px] flex-col rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3">
      <div className="mb-2">
        <p className="text-sm font-semibold text-[var(--app-heading)]">
          {preview.title}
        </p>
        <p className="text-xs text-[var(--app-text-muted)]">
          {preview.xLabel}
          {preview.yLabel ? ` · ${preview.yLabel}` : ""}
        </p>
      </div>

      <div className="w-full" style={chartSurfaceStyle}>
        {preview.graphType === "scatter" ? (
          <ScatterPreview
            data={preview.scatterPoints}
            chartTokens={effectiveChartTokens}
            color={scatterStyle?.color ?? effectiveChartTokens.series.defaultColor}
            markerSize={scatterStyle?.markerSize ?? 6}
            marker={scatterStyle?.marker ?? "circle"}
          />
        ) : null}

        {preview.graphType === "line" && preview.lineSeries.length > 0 ? (
          <ResponsiveContainer width="100%" aspect={effectiveChartTokens.aspectRatio}>
            <ComposedChart
              data={preview.lineSeries[0]?.points ?? []}
              margin={effectiveChartTokens.margin}
            >
              <CartesianGrid
                strokeDasharray={effectiveChartTokens.grid.strokeDasharray}
                stroke={effectiveChartTokens.grid.stroke}
              />
              <XAxis
                dataKey="x"
                type="number"
                stroke={effectiveChartTokens.axis.stroke}
                fontSize={effectiveChartTokens.axis.tickFontSize}
              />
              <YAxis
                domain={computeYAxisDomainFromValues(
                  (preview.lineSeries[0]?.points ?? []).map((point) => point.y)
                )}
                stroke={effectiveChartTokens.axis.stroke}
                fontSize={effectiveChartTokens.axis.tickFontSize}
              />
              <Tooltip contentStyle={rechartsTooltipStyle(effectiveChartTokens)} />
              <Line
                type="monotone"
                dataKey="y"
                stroke={
                  preview.lineSeries[0]?.color ??
                  effectiveChartTokens.series.defaultColor
                }
                strokeWidth={effectiveChartTokens.series.strokeWidth}
                strokeDasharray={lineStrokeDasharray}
                dot
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : null}

        {preview.graphType === "histogram" && preview.histogramBins.length > 0 ? (
          <ResponsiveContainer width="100%" aspect={effectiveChartTokens.aspectRatio}>
            <BarChart data={preview.histogramBins} margin={effectiveChartTokens.margin}>
              <CartesianGrid
                strokeDasharray={effectiveChartTokens.grid.strokeDasharray}
                stroke={effectiveChartTokens.grid.stroke}
              />
              <XAxis
                dataKey="label"
                stroke={effectiveChartTokens.axis.stroke}
                fontSize={effectiveChartTokens.axis.tickFontSize}
              />
              <YAxis
                domain={computeYAxisDomainFromValues(
                  preview.histogramBins.map((bin) => bin.count)
                )}
                stroke={effectiveChartTokens.axis.stroke}
                fontSize={effectiveChartTokens.axis.tickFontSize}
              />
              <Tooltip contentStyle={rechartsTooltipStyle(effectiveChartTokens)} />
              <Bar
                dataKey="count"
                fill={effectiveChartTokens.series.defaultColor}
                fillOpacity={effectiveChartTokens.series.fillOpacity}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : null}

        {preview.graphType === "bar" && preview.barData.length > 0 ? (
          <ResponsiveContainer width="100%" aspect={effectiveChartTokens.aspectRatio}>
            <BarChart data={preview.barData} margin={effectiveChartTokens.margin}>
              <CartesianGrid
                strokeDasharray={effectiveChartTokens.grid.strokeDasharray}
                stroke={effectiveChartTokens.grid.stroke}
              />
              <XAxis
                dataKey="category"
                stroke={effectiveChartTokens.axis.stroke}
                fontSize={effectiveChartTokens.axis.tickFontSize}
              />
              <YAxis
                domain={computeYAxisDomainFromValues(
                  preview.barData.map((item) => item.value)
                )}
                stroke={effectiveChartTokens.axis.stroke}
                fontSize={effectiveChartTokens.axis.tickFontSize}
              />
              <Tooltip contentStyle={rechartsTooltipStyle(effectiveChartTokens)} />
              <Bar
                dataKey="value"
                fill={effectiveChartTokens.series.defaultColor}
                fillOpacity={effectiveChartTokens.series.fillOpacity}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : null}

        {preview.graphType === "boxPlot" && preview.boxPlotData.length > 0 ? (
          <BoxPlotPreview data={preview.boxPlotData} />
        ) : null}

        {preview.graphType === "violin" && preview.violinData.length > 0 ? (
          <ViolinPreview data={preview.violinData} />
        ) : null}

        {preview.graphType === "heatmap" ? (
          <HeatmapPreview
            data={preview.heatmapData}
            chartTokens={effectiveChartTokens}
          />
        ) : null}

        {preview.graphType === "bubble" ? (
          <BubblePreview
            data={preview.bubbleData}
            chartTokens={effectiveChartTokens}
          />
        ) : null}

        {preview.graphType === "pca" ? (
          <PCAPreview
            pcaData={preview.pcaData}
            pcaMeta={preview.pcaMeta}
            chartTokens={effectiveChartTokens}
          />
        ) : null}
      </div>
    </div>
  );
}
