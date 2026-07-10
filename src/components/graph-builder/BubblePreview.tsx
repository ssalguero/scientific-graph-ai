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

import { computeYAxisDomainFromValues } from "@/lib/graph/viewport";
import type { VisualGraphPreviewBubblePoint } from "@/lib/visualGraphBuilder";

/** Width / height — matches GraphPreview chart aspect. */
const CHART_ASPECT_RATIO = 1.8;

/** Visual scale: maps domain `size` units to SVG radius (not data normalization). */
const BUBBLE_PIXEL_RADIUS_BASE = 12;

type BubblePreviewProps = {
  data: VisualGraphPreviewBubblePoint[];
};

type BubbleScatterShapeProps = {
  cx?: number;
  cy?: number;
  payload?: VisualGraphPreviewBubblePoint;
  fill?: string;
};

function renderBubbleShape(props: BubbleScatterShapeProps) {
  const { cx, cy, payload, fill } = props;
  if (cx == null || cy == null || payload == null) {
    return null;
  }

  const radius = payload.size * BUBBLE_PIXEL_RADIUS_BASE;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={radius}
      fill={fill ?? "var(--app-accent)"}
      fillOpacity={0.7}
      stroke={fill ?? "var(--app-accent)"}
      strokeWidth={1}
    />
  );
}

export function BubblePreview({ data }: BubblePreviewProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-full min-h-[12rem] items-center justify-center text-sm text-[var(--app-text-muted)]">
        Sin puntos válidos para visualizar.
      </div>
    );
  }

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
        <Tooltip />
        <Scatter
          data={data}
          fill="var(--app-accent)"
          shape={renderBubbleShape}
          line={false}
          isAnimationActive={false}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
