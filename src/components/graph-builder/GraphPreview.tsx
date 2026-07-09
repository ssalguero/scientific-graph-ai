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

import type {
  VisualGraphMarkerStyle,
  VisualGraphPreview,
} from "@/lib/visualGraphBuilder";

import { HeatmapPreview } from "./HeatmapPreview";
import { BubblePreview } from "./BubblePreview";
import { ScatterPreview } from "./ScatterPreview";
import { PCAPreview } from "./PCAPreview";

/** Width / height — ResponsiveContainer derives height from width (no parent height needed). */
const CHART_ASPECT_RATIO = 1.8;

export type ScatterPreviewStyle = {
  color: string;
  markerSize: number;
  marker: VisualGraphMarkerStyle;
};

type GraphPreviewProps = {
  preview: VisualGraphPreview | null;
  errorMessage?: string | null;
  scatterStyle?: ScatterPreviewStyle | null;
};

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

      <div className="w-full">
        {preview.graphType === "scatter" ? (
          <ScatterPreview
            data={preview.scatterPoints}
            color={scatterStyle?.color ?? "#3b82f6"}
            markerSize={scatterStyle?.markerSize ?? 6}
            marker={scatterStyle?.marker ?? "circle"}
          />
        ) : null}

        {preview.graphType === "line" && preview.lineSeries.length > 0 ? (
          <ResponsiveContainer width="100%" aspect={CHART_ASPECT_RATIO}>
            <ComposedChart data={preview.lineSeries[0]?.points ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
              <XAxis
                dataKey="x"
                type="number"
                stroke="var(--app-text-muted)"
                fontSize={12}
              />
              <YAxis stroke="var(--app-text-muted)" fontSize={12} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="y"
                stroke={preview.lineSeries[0]?.color ?? "#3b82f6"}
                strokeWidth={2}
                dot
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : null}

        {preview.graphType === "histogram" && preview.histogramBins.length > 0 ? (
          <ResponsiveContainer width="100%" aspect={CHART_ASPECT_RATIO}>
            <BarChart data={preview.histogramBins}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
              <XAxis dataKey="label" stroke="var(--app-text-muted)" fontSize={10} />
              <YAxis stroke="var(--app-text-muted)" fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        ) : null}

        {preview.graphType === "bar" && preview.barData.length > 0 ? (
          <ResponsiveContainer width="100%" aspect={CHART_ASPECT_RATIO}>
            <BarChart data={preview.barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
              <XAxis dataKey="category" stroke="var(--app-text-muted)" fontSize={12} />
              <YAxis stroke="var(--app-text-muted)" fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
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
          <HeatmapPreview data={preview.heatmapData} />
        ) : null}

        {preview.graphType === "bubble" ? (
          <BubblePreview data={preview.bubbleData} />
        ) : null}

        {preview.graphType === "pca" ? (
          <PCAPreview
            pcaData={preview.pcaData}
            pcaMeta={preview.pcaMeta}
          />
        ) : null}
      </div>
    </div>
  );
}
