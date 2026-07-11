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
import type {
  VisualGraphPreviewPcaMeta,
  VisualGraphPreviewPcaPoint,
} from "@/lib/visualGraphBuilder";

type PCAPreviewProps = {
  pcaData: VisualGraphPreviewPcaPoint[];
  pcaMeta: VisualGraphPreviewPcaMeta | null;
  chartTokens: ChartRenderTokens;
};

const formatVariancePercent = (value: number) => `${value.toFixed(1)}%`;

const formatPcaScore = (value: number) => value.toFixed(4);

type PCAPreviewTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload?: VisualGraphPreviewPcaPoint }>;
  chartTokens: ChartRenderTokens;
};

function PCAPreviewTooltip({
  active,
  payload,
  chartTokens,
}: PCAPreviewTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0]?.payload;
  if (!point) {
    return null;
  }

  return (
    <div
      className="rounded-lg px-3 py-2 text-sm shadow-sm"
      style={{
        backgroundColor: chartTokens.tooltip.background,
        border: `1px solid ${chartTokens.tooltip.border}`,
        color: chartTokens.tooltip.color,
        fontSize: chartTokens.tooltip.fontSize,
      }}
    >
      <p className="font-semibold">{point.label}</p>
      <p>PC1 = {formatPcaScore(point.pc1)}</p>
      <p>PC2 = {formatPcaScore(point.pc2)}</p>
    </div>
  );
}

export function PCAPreview({ pcaData, pcaMeta, chartTokens }: PCAPreviewProps) {
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
          dataKey="pc1"
          name="PC1"
          label={{
            value: xAxisLabel,
            position: "insideBottom",
            offset: -4,
            fill: chartTokens.axis.stroke,
            fontSize: chartTokens.axis.labelFontSize,
          }}
          stroke={chartTokens.axis.stroke}
          fontSize={chartTokens.axis.tickFontSize}
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
            fill: chartTokens.axis.stroke,
            fontSize: chartTokens.axis.labelFontSize,
          }}
          stroke={chartTokens.axis.stroke}
          fontSize={chartTokens.axis.tickFontSize}
        />
        <Tooltip content={<PCAPreviewTooltip chartTokens={chartTokens} />} />
        <Scatter
          name="Observaciones"
          data={pcaData}
          fill={seriesColor}
          fillOpacity={chartTokens.series.fillOpacity}
          line={false}
          isAnimationActive={false}
          r={6}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
