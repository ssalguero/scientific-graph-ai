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
import type {
  VisualGraphPreviewPcaMeta,
  VisualGraphPreviewPcaPoint,
} from "@/lib/visualGraphBuilder";

/** Width / height — matches GraphPreview chart aspect. */
const CHART_ASPECT_RATIO = 1.8;

type PCAPreviewProps = {
  pcaData: VisualGraphPreviewPcaPoint[];
  pcaMeta: VisualGraphPreviewPcaMeta | null;
};

const formatVariancePercent = (value: number) => `${value.toFixed(1)}%`;

const formatPcaScore = (value: number) => value.toFixed(4);

type PCAPreviewTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload?: VisualGraphPreviewPcaPoint }>;
};

function PCAPreviewTooltip({ active, payload }: PCAPreviewTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0]?.payload;
  if (!point) {
    return null;
  }

  return (
    <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm shadow-sm">
      <p className="font-semibold text-[var(--app-heading)]">{point.label}</p>
      <p className="text-[var(--app-text)]">PC1 = {formatPcaScore(point.pc1)}</p>
      <p className="text-[var(--app-text)]">PC2 = {formatPcaScore(point.pc2)}</p>
    </div>
  );
}

export function PCAPreview({ pcaData, pcaMeta }: PCAPreviewProps) {
  if (pcaMeta == null || pcaData.length === 0) {
    return (
      <div className="flex h-full min-h-[12rem] items-center justify-center text-sm text-[var(--app-text-muted)]">
        Sin puntos válidos para visualizar.
      </div>
    );
  }

  const xAxisLabel = `PC1 (${formatVariancePercent(pcaMeta.component1Variance)})`;
  const yAxisLabel = `PC2 (${formatVariancePercent(pcaMeta.component2Variance)})`;
  const yAxisDomain = computeYAxisDomainFromValues(
    pcaData.map((point) => point.pc2)
  );

  return (
    <ResponsiveContainer width="100%" aspect={CHART_ASPECT_RATIO}>
      <ScatterChart margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
        <XAxis
          type="number"
          dataKey="pc1"
          name="PC1"
          label={{
            value: xAxisLabel,
            position: "insideBottom",
            offset: -4,
            fill: "var(--app-text-muted)",
            fontSize: 11,
          }}
          stroke="var(--app-text-muted)"
          fontSize={12}
        />
        <YAxis
          type="number"
          dataKey="pc2"
          name="PC2"
          domain={yAxisDomain}
          label={{
            value: yAxisLabel,
            angle: -90,
            position: "insideLeft",
            fill: "var(--app-text-muted)",
            fontSize: 11,
          }}
          stroke="var(--app-text-muted)"
          fontSize={12}
        />
        <Tooltip content={<PCAPreviewTooltip />} />
        <Scatter
          name="Observaciones"
          data={pcaData}
          fill="var(--app-accent)"
          line={false}
          isAnimationActive={false}
          r={6}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
