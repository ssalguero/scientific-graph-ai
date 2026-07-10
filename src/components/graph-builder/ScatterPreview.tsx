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

import { computeYAxisDomainFromValues } from "@/lib/graph/viewport";
import {
  clampScatterMarkerSize,
  type VisualGraphMarkerStyle,
  type VisualGraphPreviewPoint,
} from "@/lib/visualGraphBuilder";

/** Width / height — matches GraphPreview / BubblePreview (local duplicate). */
const CHART_ASPECT_RATIO = 1.8;

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
};

function renderScatterShape(props: ScatterShapeProps) {
  const { cx, cy, fill, marker, radius } = props;
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
        fillOpacity={0.85}
      />
    );
  }

  if (marker === "diamond") {
    return (
      <polygon
        points={`${cx},${cy - radius} ${cx + radius},${cy} ${cx},${cy + radius} ${cx - radius},${cy}`}
        fill={stroke}
        fillOpacity={0.85}
      />
    );
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      r={radius}
      fill={stroke}
      fillOpacity={0.85}
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
    <ResponsiveContainer width="100%" aspect={CHART_ASPECT_RATIO}>
      <ScatterChart margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
        <XAxis
          type="number"
          dataKey="x"
          stroke="var(--app-text-muted)"
          fontSize={12}
        />
        <YAxis
          type="number"
          dataKey="y"
          domain={yAxisDomain}
          stroke="var(--app-text-muted)"
          fontSize={12}
        />
        <Tooltip labelFormatter={(label) => `X: ${label}`} />
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
              })
            }
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}
