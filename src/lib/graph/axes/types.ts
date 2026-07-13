export type AxisScaleMode = "linear" | "logX" | "logY" | "logLog";

export type AxisScaleViolations = {
  hasNonPositiveX: boolean;
  hasNonPositiveY: boolean;
};

export type ChartThemeTokens = {
  grid: string;
  axis: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipColor: string;
};
