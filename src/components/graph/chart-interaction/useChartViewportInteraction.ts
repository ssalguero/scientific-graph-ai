"use client";

import { useEffect, useRef } from "react";
import type { MouseEvent } from "react";

import {
  computePanVisibleRange,
  computeWheelZoomVisibleRange,
} from "@/lib/graph/axes";

import type {
  ChartViewportInteractionInput,
  ChartViewportInteractionResult,
  PanState,
  VisibleRangeSnapshot,
} from "./types";

export function useChartViewportInteraction(
  input: ChartViewportInteractionInput
): ChartViewportInteractionResult {
  const {
    visibleMinX,
    visibleMaxX,
    minX,
    maxX,
    setVisibleMinX,
    setVisibleMaxX,
    wheelEffectKey,
  } = input;

  const chartInteractionRef = useRef<HTMLDivElement>(null);
  const visibleRangeRef = useRef<VisibleRangeSnapshot>({
    visibleMinX,
    visibleMaxX,
    minX,
    maxX,
  });
  const panStateRef = useRef<PanState>({
    isPanning: false,
    startX: 0,
    startMin: 0,
    startMax: 0,
  });

  const resetVisibleRange = () => {
    setVisibleMinX(minX);
    setVisibleMaxX(maxX);
  };

  useEffect(() => {
    visibleRangeRef.current = { visibleMinX, visibleMaxX, minX, maxX };
  }, [visibleMinX, visibleMaxX, minX, maxX]);

  useEffect(() => {
    const el = chartInteractionRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const {
        visibleMinX: currentVisibleMinX,
        visibleMaxX: currentVisibleMaxX,
        minX: currentMinX,
        maxX: currentMaxX,
      } = visibleRangeRef.current;

      const rect = el.getBoundingClientRect();
      const pointerRatio = Math.min(
        1,
        Math.max(0, (e.clientX - rect.left) / rect.width)
      );
      const nextRange = computeWheelZoomVisibleRange({
        visibleMinX: currentVisibleMinX,
        visibleMaxX: currentVisibleMaxX,
        minX: currentMinX,
        maxX: currentMaxX,
        pointerRatio,
        deltaY: e.deltaY,
      });
      if (!nextRange) return;

      setVisibleMinX(nextRange[0]);
      setVisibleMaxX(nextRange[1]);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [wheelEffectKey[0], wheelEffectKey[1]]);

  useEffect(() => {
    const endPan = () => {
      panStateRef.current.isPanning = false;
    };

    window.addEventListener("mouseup", endPan);
    return () => window.removeEventListener("mouseup", endPan);
  }, []);

  const handleChartMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;

    panStateRef.current = {
      isPanning: true,
      startX: e.clientX,
      startMin: visibleMinX,
      startMax: visibleMaxX,
    };
  };

  const handleChartMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!panStateRef.current.isPanning) return;

    const el = chartInteractionRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const { startX, startMin, startMax } = panStateRef.current;
    const [clampedMin, clampedMax] = computePanVisibleRange({
      startMin,
      startMax,
      minX,
      maxX,
      deltaPixels: e.clientX - startX,
      chartWidthPixels: rect.width,
    });

    setVisibleMinX(clampedMin);
    setVisibleMaxX(clampedMax);
  };

  const handleChartMouseUp = () => {
    panStateRef.current.isPanning = false;
  };

  return {
    chartInteractionRef,
    resetVisibleRange,
    surfaceProps: {
      ref: chartInteractionRef,
      onMouseDown: handleChartMouseDown,
      onMouseMove: handleChartMouseMove,
      onMouseUp: handleChartMouseUp,
      onMouseLeave: handleChartMouseUp,
    },
  };
}
