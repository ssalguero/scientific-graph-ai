import {
  VGB_DISPLAY_SERIES_DISPOSITION,
  type VgbDisplaySeriesDisposition,
} from "@/lib/scientific/contracts";
import type { ProjectVisualGraphEntry } from "@/lib/visualGraphBuilder";

/**
 * FINAL-PG-008 / PD-03: displaySeries is runtime reconstruction for scatter/line
 * Working Figures. It is not persisted, not an Analysis feed, and not
 * publication authority.
 */
export { VGB_DISPLAY_SERIES_DISPOSITION };

export const getVgbDisplaySeriesDisposition = (): VgbDisplaySeriesDisposition =>
  VGB_DISPLAY_SERIES_DISPOSITION;

export const isVgbDisplaySeriesAnalysisFeed = (
  _entry?: ProjectVisualGraphEntry
): boolean => false;

export const shouldPersistVgbDisplaySeries = (
  _entry?: ProjectVisualGraphEntry
): boolean => false;

export const publicationFigureUsesDisplaySeries = (): boolean => false;
