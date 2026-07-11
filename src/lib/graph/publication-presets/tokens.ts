import type { ChartRenderTokens, PublicationPresetId } from "./types";

/** Paridad visual con previews VGB actuales (Recharts + tema claro). */
export const DEFAULT_CHART_RENDER_TOKENS: ChartRenderTokens = {
  aspectRatio: 1.8,
  margin: { top: 8, right: 12, left: 0, bottom: 0 },
  grid: { stroke: "#e2e8f0", strokeDasharray: "3 3" },
  axis: { stroke: "#64748b", tickFontSize: 12, labelFontSize: 12 },
  tooltip: {
    background: "#ffffff",
    border: "#e2e8f0",
    color: "#334155",
    fontSize: 12,
  },
  series: { strokeWidth: 2, fillOpacity: 0.85, defaultColor: "#3b82f6" },
  heatmap: { labelFontSize: 11, cellGapPx: 2 },
  background: "transparent",
};

export const JOURNAL_CHART_RENDER_TOKENS: ChartRenderTokens = {
  aspectRatio: 1.6,
  margin: { top: 4, right: 8, left: 4, bottom: 4 },
  grid: { stroke: "#cbd5e1", strokeDasharray: "2 2" },
  axis: { stroke: "#0f172a", tickFontSize: 9, labelFontSize: 10 },
  tooltip: {
    background: "#ffffff",
    border: "#0f172a",
    color: "#0f172a",
    fontSize: 9,
  },
  series: { strokeWidth: 1.5, fillOpacity: 0.9, defaultColor: "#0f172a" },
  heatmap: { labelFontSize: 8, cellGapPx: 1 },
  background: "#ffffff",
};

export const PRESENTATION_CHART_RENDER_TOKENS: ChartRenderTokens = {
  aspectRatio: 2.0,
  margin: { top: 16, right: 16, left: 8, bottom: 8 },
  grid: { stroke: "#94a3b8", strokeDasharray: "4 4" },
  axis: { stroke: "#1e293b", tickFontSize: 16, labelFontSize: 18 },
  tooltip: {
    background: "#ffffff",
    border: "#1e293b",
    color: "#1e293b",
    fontSize: 14,
  },
  series: { strokeWidth: 3, fillOpacity: 0.75, defaultColor: "#2563eb" },
  heatmap: { labelFontSize: 14, cellGapPx: 3 },
  background: "#ffffff",
};

const PRESET_TOKEN_BUNDLES: Record<PublicationPresetId, ChartRenderTokens> = {
  default: DEFAULT_CHART_RENDER_TOKENS,
  journal: JOURNAL_CHART_RENDER_TOKENS,
  presentation: PRESENTATION_CHART_RENDER_TOKENS,
};

export const getChartRenderTokensForPreset = (
  presetId: PublicationPresetId
): ChartRenderTokens => cloneChartRenderTokens(PRESET_TOKEN_BUNDLES[presetId]);

export const cloneChartRenderTokens = (
  tokens: ChartRenderTokens
): ChartRenderTokens => ({
  aspectRatio: tokens.aspectRatio,
  margin: { ...tokens.margin },
  grid: { ...tokens.grid },
  axis: { ...tokens.axis },
  tooltip: { ...tokens.tooltip },
  series: { ...tokens.series },
  heatmap: { ...tokens.heatmap },
  background: tokens.background,
});
