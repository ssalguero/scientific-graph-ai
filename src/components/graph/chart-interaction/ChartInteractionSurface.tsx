"use client";

import type { ReactNode } from "react";

import type { ChartViewportInteractionResult } from "./types";

type ChartInteractionSurfaceProps = {
  surfaceProps: ChartViewportInteractionResult["surfaceProps"];
  children: ReactNode;
};

const CHART_INTERACTION_SURFACE_CLASS_NAME =
  "w-full min-h-[440px] h-[min(62vh,680px)] sm:min-h-[480px] sm:h-[min(68vh,720px)] max-h-[720px] select-none cursor-grab active:cursor-grabbing";

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
      aria-label="Área interactiva del gráfico principal"
    >
      {children}
    </div>
  );
}
