import type { ErrorBarSeries, ExperimentalSeries } from "@/lib/graph/series";

/** Structural mirror of page OutlierMethod — aliases stay in page.tsx */
export type ChartOutlierMethod = "iqr" | "zscore";

/** Structural mirror of getChartTheme(...) return value (passed as prop) */
export type ChartThemeTokens = {
  grid: string;
  axis: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipColor: string;
};

export type ChartPoint = { x: number; y: number };

export type ActiveCurveLegendItem = {
  idx: number;
  expression: string;
  color: string;
};

export type DerivativeCurveLegendItem = {
  id: number;
  sourceExpression: string;
  expression: string;
  color: string;
  points: ChartPoint[];
};

export type IntegralCurveLegendItem = {
  id: string;
  sourceExpression: string;
  expression: string;
  color: string;
  points: ChartPoint[];
};

export type RegressionCurveLegendItem = {
  id: string;
  name: string;
  color: string;
  model: "linear" | "quadratic" | "exponential" | "logarithmic" | "power";
  r2: number;
  points: ChartPoint[];
  slope?: number;
  intercept?: number;
  a?: number;
  b?: number;
  c?: number;
};

export type OutlierChartPoint = ChartPoint & {
  __outlier: true;
  seriesName: string;
  method: ChartOutlierMethod;
  score: number;
};

export type MainChartLegendProps = {
  hasLegendItems: boolean;
  activeCurves: ActiveCurveLegendItem[];
  derivativeCurves: DerivativeCurveLegendItem[];
  integralCurves: IntegralCurveLegendItem[];
  experimentalSeries: ExperimentalSeries[];
  regressionCurves: RegressionCurveLegendItem[];
  hiddenLegendKeys: string[];
  onToggleLegend: (key: string) => void;
};

export type MainComposedChartProps = {
  data: unknown[];
  chartTheme: ChartThemeTokens;
  usesLogX: boolean;
  usesLogY: boolean;
  useDualYAxis: boolean;
  xAxisDomain: [number, number];
  mathYAxisDomainForChart: [number, number] | undefined;
  experimentalYAxisDomainForChart: [number, number] | undefined;
  yAxisDomainForChart: [number, number] | undefined;
  activeCurves: ActiveCurveLegendItem[];
  derivativeCurves: DerivativeCurveLegendItem[];
  integralCurves: IntegralCurveLegendItem[];
  visibleExperimentalSeries: ExperimentalSeries[];
  errorBarSeries: ErrorBarSeries[];
  regressionCurves: RegressionCurveLegendItem[];
  hiddenLegendKeys: string[];
  showErrorBars: boolean;
  showIntersections: boolean;
  showCriticalPoints: boolean;
  showRoots: boolean;
  showOutliers: boolean;
  intersectionChartPoints: ChartPoint[];
  criticalMaxChartPoints: ChartPoint[];
  criticalMinChartPoints: ChartPoint[];
  rootChartPoints: ChartPoint[];
  outlierChartPoints: OutlierChartPoint[];
  outlierMethod: ChartOutlierMethod;
  formatStat: (value: number) => string;
  formatOutlierScore: (score: number) => string;
  getOutlierMethodLabel: (method: ChartOutlierMethod) => string;
};
