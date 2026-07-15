import type { MouseEvent, RefObject } from "react";

export type PanState = {
  isPanning: boolean;
  startX: number;
  startMin: number;
  startMax: number;
};

export type VisibleRangeSnapshot = {
  visibleMinX: number;
  visibleMaxX: number;
  minX: number;
  maxX: number;
};

export type ChartViewportInteractionInput = {
  visibleMinX: number;
  visibleMaxX: number;
  minX: number;
  maxX: number;
  setVisibleMinX: (value: number) => void;
  setVisibleMaxX: (value: number) => void;
  wheelEffectKey: readonly [number, number];
};

export type ChartViewportInteractionResult = {
  chartInteractionRef: RefObject<HTMLDivElement | null>;
  resetVisibleRange: () => void;
  surfaceProps: {
    ref: RefObject<HTMLDivElement | null>;
    onMouseDown: (e: MouseEvent<HTMLDivElement>) => void;
    onMouseMove: (e: MouseEvent<HTMLDivElement>) => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
  };
};
