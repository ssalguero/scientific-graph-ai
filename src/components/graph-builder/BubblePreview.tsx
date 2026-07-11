"use client";

import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ChartRenderTokens } from "@/lib/graph/publication-presets/types";
import { computeYAxisDomainFromValues } from "@/lib/graph/viewport";
import type { VisualGraphPreviewBubblePoint } from "@/lib/visualGraphBuilder";

/** Visual scale: maps domain `size` units to SVG radius (not data normalization). */
const BUBBLE_PIXEL_RADIUS_BASE = 12;

type BubblePreviewProps = {
  data: VisualGraphPreviewBubblePoint[];
  chartTokens: ChartRenderTokens;
};

type BubbleScatterShapeProps = {
  cx?: number;
  cy?: number;
  payload?: VisualGraphPreviewBubblePoint;
  fill?: string;
  fillOpacity: number;
};

function renderBubbleShape(props: BubbleScatterShapeProps) {
  const { cx, cy, payload, fill, fillOpacity } = props;
  if (cx == null || cy == null || payload == null) {
    return null;
  }

  const radius = payload.size * BUBBLE_PIXEL_RADIUS_BASE;
  const stroke = fill ?? "var(--app-accent)";

  return (
    <circle
      cx={cx}
      cy={cy}
      r={radius}
      fill={stroke}
      fillOpacity={fillOpacity}
      stroke={stroke}
      strokeWidth={1}
    />
  );
}

export function BubblePreview({ data, chartTokens }: BubblePreviewProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-full min-h-[12rem] items-center justify-center text-sm text-[var(--app-text-muted)]">
        Sin puntos válidos para visualizar.
      </div>
    );
  }

  const yAxisDomain = computeYAxisDomainFromValues(data.map((point) => point.y));
  const seriesColor = chartTokens.series.defaultColor;

  return (
    <ResponsiveContainer width="100%" aspect={chartTokens.aspectRatio}>
      <ScatterChart margin={chartTokens.margin}>
        <CartesianGrid
          strokeDasharray={chartTokens.grid.strokeDasharray}
          stroke={chartTokens.grid.stroke}
        />
        <XAxis
          type="number"
          dataKey="x"
          stroke={chartTokens.axis.stroke}
          fontSize={chartTokens.axis.tickFontSize}
        />
        <YAxis
          type="number"
          dataKey="y"
          domain={yAxisDomain}
          stroke={chartTokens.axis.stroke}
          fontSize={chartTokens.axis.tickFontSize}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: chartTokens.tooltip.background,
            border: `1px solid ${chartTokens.tooltip.border}`,
            color: chartTokens.tooltip.color,
            fontSize: chartTokens.tooltip.fontSize,
          }}
        />
        <Scatter
          data={data}
          fill={seriesColor}
          shape={(props) =>
            renderBubbleShape({
              ...props,
              fill: seriesColor,
              fillOpacity: chartTokens.series.fillOpacity,
            })
          }
          line={false}
          isAnimationActive={false}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
