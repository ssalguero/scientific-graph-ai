"use client";

export type ScatterMarkerProps = {
  cx?: number;
  cy?: number;
};

export const renderMaximumMarker = ({ cx, cy }: ScatterMarkerProps) => {
  if (cx == null || cy == null) return null;

  return (
    <polygon
      points={`${cx},${cy - 6} ${cx - 5},${cy + 4} ${cx + 5},${cy + 4}`}
      fill="var(--app-success)"
    />
  );
};

export const renderMinimumMarker = ({ cx, cy }: ScatterMarkerProps) => {
  if (cx == null || cy == null) return null;

  return (
    <polygon
      points={`${cx},${cy + 6} ${cx - 5},${cy - 4} ${cx + 5},${cy - 4}`}
      fill="var(--app-danger)"
    />
  );
};
