"use client";

import type { ReactNode } from "react";

import type { ChartViewportInteractionResult } from "./types";

type ChartInteractionSurfaceProps = {
  surfaceProps: ChartViewportInteractionResult["surfaceProps"];
  children: ReactNode;
};

const CHART_INTERACTION_SURFACE_CLASS_NAME =
  "w-full min-h-[360px] h-[min(42vh,480px)] sm:min-h-[400px] sm:h-[min(48vh,520px)] max-h-[520px] select-none cursor-grab active:cursor-grabbing";

export function ChartInteractionSurface({
  surfaceProps,
  children,
}: ChartInteractionSurfaceProps) {
  const { ref, onMouseDown, onMouseMove, onMouseUp, onMouseLeave } =
    surfaceProps;

  return (
    <div
      ref={ref}
      className={CHART_INTERACTION_SURFACE_CLASS_NAME}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
}
