import { getChartRenderTokensForPreset } from "./tokens";
import type {
  GraphRenderStyleInput,
  PublicationPresetId,
  VisualGraphLineStyle,
} from "./types";
import {
  DEFAULT_PUBLICATION_PRESET_ID,
  PUBLICATION_PRESET_IDS,
} from "./types";
import { cloneChartRenderTokens } from "./tokens";

export const normalizePublicationPresetId = (
  id: string | null | undefined
): PublicationPresetId => {
  if (id === null || id === undefined) {
    return DEFAULT_PUBLICATION_PRESET_ID;
  }
  if ((PUBLICATION_PRESET_IDS as readonly string[]).includes(id)) {
    return id as PublicationPresetId;
  }
  return DEFAULT_PUBLICATION_PRESET_ID;
};

export const resolvePublicationPreset = (
  id: string | null | undefined
): ReturnType<typeof getChartRenderTokensForPreset> => {
  const presetId = normalizePublicationPresetId(id);
  return getChartRenderTokensForPreset(presetId);
};

export const resolveGraphRenderStyle = (
  input: GraphRenderStyleInput
): ReturnType<typeof getChartRenderTokensForPreset> => {
  const tokens = resolvePublicationPreset(input.publicationPresetId ?? null);
  if (input.color === undefined) {
    return tokens;
  }
  return {
    ...tokens,
    series: {
      ...tokens.series,
      defaultColor: input.color,
    },
  };
};

/** Utility for D30.2 line preview — maps persisted lineStyle to Recharts strokeDasharray. */
export const mapLineStyleToStrokeDasharray = (
  lineStyle: VisualGraphLineStyle
): string | undefined => {
  switch (lineStyle) {
    case "solid":
      return undefined;
    case "dashed":
      return "8 4";
    case "dotted":
      return "4 4";
    default:
      return undefined;
  }
};

export { cloneChartRenderTokens };
