export type GraphJsonExport = {
  title: string;
  expression: string;
  curves: { expression: string; color: string }[];
  min_x: number;
  max_x: number;
  auto_scale_y: boolean;
  color: string;
};

export type CurveSamplePoint = { x: number; y: number };

export type CurveIntersection = {
  id: string;
  curveA: string;
  curveB: string;
  x: number;
  y: number;
};

export type CurveIntersectionInput = {
  idx: number;
  expression: string;
};

export type CriticalPoint = {
  id: string;
  curve: string;
  type: "maximum" | "minimum";
  x: number;
  y: number;
};

export type CurveRoot = {
  id: string;
  curve: string;
  x: number;
  y: number;
};

export type DiscardMetrics = {
  globalDiscardRate: number;
  maxPerCurveDiscardRate: number;
  discardedPerCurve: number[];
};

export type CurveYMetrics = {
  minObservedY: number | null;
  maxObservedY: number | null;
};

export type YMetrics = {
  minObservedY: number | null;
  maxObservedY: number | null;
  perCurve: CurveYMetrics[];
};

export type ChartScaleSample = { x: number; y: number };
