import type { ExperimentalSeries } from "@/lib/experimentalData";

export const resolveTTestSeriesSelection = (
  series: ExperimentalSeries[],
  selectedId: string | null,
  fallbackIndex: number,
  excludedId?: string | null
): ExperimentalSeries | null => {
  if (series.length === 0) return null;

  if (selectedId) {
    const selected = series.find((item) => item.id === selectedId);
    if (selected && selected.id !== excludedId) return selected;
  }

  return (
    series.find((item, index) => index >= fallbackIndex && item.id !== excludedId) ??
    series.find((item) => item.id !== excludedId) ??
    null
  );
};
