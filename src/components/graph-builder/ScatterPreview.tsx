"use client";

import {
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ChartRenderTokens } from "@/lib/graph/publication-presets/types";
import { computeYAxisDomainFromValues } from "@/lib/graph/viewport";
import {
  clampScatterMarkerSize,
  type VisualGraphMarkerStyle,
  type VisualGraphPreviewPoint,
} from "@/lib/visualGraphBuilder";

const GROUP_PALETTE = [
  "#3b82f6",
  "#ef4444",
  "#22c55e",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

type ScatterPreviewProps = {
  data: VisualGraphPreviewPoint[];
  chartTokens: ChartRenderTokens;
  color: string;
  markerSize: number;
  marker: VisualGraphMarkerStyle;
};

type ScatterShapeProps = {
  cx?: number;
  cy?: number;
  fill?: string;
  marker: VisualGraphMarkerStyle;
  radius: number;
  fillOpacity: number;
};

function renderScatterShape(props: ScatterShapeProps) {
  const { cx, cy, fill, marker, radius, fillOpacity } = props;
  if (cx == null || cy == null || marker === "none") {
    return null;
  }

  const stroke = fill ?? "var(--app-accent)";

  if (marker === "square") {
    return (
      <rect
        x={cx - radius}
        y={cy - radius}
        width={radius * 2}
        height={radius * 2}
        fill={stroke}
        fillOpacity={fillOpacity}
      />
    );
  }

  if (marker === "diamond") {
    return (
      <polygon
        points={`${cx},${cy - radius} ${cx + radius},${cy} ${cx},${cy + radius} ${cx - radius},${cy}`}
        fill={stroke}
        fillOpacity={fillOpacity}
      />
    );
  }

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

function resolveGroupSeries(
  data: VisualGraphPreviewPoint[]
): Array<{ name: string; points: VisualGraphPreviewPoint[]; color: string }> {
  const hasGroups = data.some((point) => point.group != null && point.group !== "");
  if (!hasGroups) {
    return [{ name: "Serie", points: data, color: "" }];
  }

  const groupOrder: string[] = [];
  const grouped = new Map<string, VisualGraphPreviewPoint[]>();

  for (const point of data) {
    const name = point.group ?? "—";
    if (!grouped.has(name)) {
      groupOrder.push(name);
      grouped.set(name, []);
    }
    grouped.get(name)!.push(point);
  }

  return groupOrder.map((name, index) => ({
    name,
    points: grouped.get(name) ?? [],
    color: GROUP_PALETTE[index % GROUP_PALETTE.length] ?? "#3b82f6",
  }));
}

export function ScatterPreview({
  data,
  chartTokens,
  color,
  markerSize,
  marker,
}: ScatterPreviewProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-full min-h-[12rem] items-center justify-center text-sm text-[var(--app-text-muted)]">
        Sin puntos válidos para la combinación seleccionada.
      </div>
    );
  }

  const radius = clampScatterMarkerSize(markerSize);
  const series = resolveGroupSeries(data);
  const showLegend = series.length > 1;
  const yAxisDomain = computeYAxisDomainFromValues(data.map((point) => point.y));

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
          labelFormatter={(label) => `X: ${label}`}
          contentStyle={{
            backgroundColor: chartTokens.tooltip.background,
            border: `1px solid ${chartTokens.tooltip.border}`,
            color: chartTokens.tooltip.color,
            fontSize: chartTokens.tooltip.fontSize,
          }}
        />
        {showLegend ? <Legend /> : null}
        {series.map((item) => (
          <Scatter
            key={item.name}
            name={item.name}
            data={item.points}
            fill={item.color || color}
            line={false}
            isAnimationActive={false}
            shape={(props) =>
              renderScatterShape({
                ...props,
                marker,
                radius,
                fill: item.color || color,
                fillOpacity: chartTokens.series.fillOpacity,
              })
            }
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}
