/**
 * API Freeze D30 v1.1 — shape congelado hasta cierre PROD-2E (D36).
 * Amend solo mediante revisión explícita del plan.
 */
export type PublicationPresetId = "default" | "journal" | "presentation";

export const PUBLICATION_PRESET_IDS = [
  "default",
  "journal",
  "presentation",
] as const satisfies readonly PublicationPresetId[];

export const DEFAULT_PUBLICATION_PRESET_ID: PublicationPresetId = "default";

export type ChartRenderTokens = {
  aspectRatio: number;
  margin: { top: number; right: number; left: number; bottom: number };
  grid: { stroke: string; strokeDasharray: string };
  axis: { stroke: string; tickFontSize: number; labelFontSize: number };
  tooltip: {
    background: string;
    border: string;
    color: string;
    fontSize: number;
  };
  series: { strokeWidth: number; fillOpacity: number; defaultColor: string };
  heatmap: { labelFontSize: number; cellGapPx: number };
  background: string;
};

/** Frozen key set — gate `preset.tokens.shape.frozen` */
export const CHART_RENDER_TOKEN_KEYS = [
  "aspectRatio",
  "margin",
  "grid",
  "axis",
  "tooltip",
  "series",
  "heatmap",
  "background",
] as const satisfies readonly (keyof ChartRenderTokens)[];

export type GraphRenderStyleInput = {
  publicationPresetId?: string | null;
  color?: string;
};

export type VisualGraphLineStyle = "solid" | "dashed" | "dotted";
