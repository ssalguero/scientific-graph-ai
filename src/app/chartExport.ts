/**
 * EXPORT-1 chart capture surface (R-A1 move-only + consolidated PNG/SVG).
 * Ownership: export handlers — not GRAPH domain / barrels.
 */
import { toPng, toSvg } from "html-to-image";

export const DEFAULT_LIVE_CHART_SAMPLE_STEP = 0.5;
export const DEFAULT_EXPORT_SAMPLE_STEP = 0.5;
export const DEFAULT_CHART_EXPORT_PIXEL_RATIO = 2;
export const MIN_CHART_EXPORT_PIXEL_RATIO = 2;

export const CHART_EXPORT_SAMPLE_STEP_PRESETS = [0.25, 0.5, 1] as const;
export const CHART_EXPORT_PIXEL_RATIO_PRESETS = [2, 3, 4] as const;

export type ChartExportFileExtension = "png" | "svg" | "json";

export type ChartCaptureLogContext = "png-export" | "pdf-export" | "svg-export";

export type ChartCaptureVisibilityRestore = {
  section: HTMLElement;
  hadHiddenClass: boolean;
  ariaHidden: string | null;
  notebookPanel: HTMLElement | null;
  notebookHadCollapsedGrid: boolean;
};

export type ChartExportCurveSample = {
  idx: number;
  expression: string;
};

export const getChartExportFileName = (
  title: string,
  extension: ChartExportFileExtension
) => {
  const trimmed = title.trim();
  if (!trimmed) return `grafico.${extension}`;

  const safe = trimmed
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);

  return safe ? `grafico-${safe}.${extension}` : `grafico.${extension}`;
};

export const resolveChartExportPixelRatio = (value: number): number => {
  if (!Number.isFinite(value) || value < MIN_CHART_EXPORT_PIXEL_RATIO) {
    return DEFAULT_CHART_EXPORT_PIXEL_RATIO;
  }
  return value;
};

export const resolveChartExportSampleStep = (value: number): number => {
  if (!Number.isFinite(value) || value <= 0) {
    return DEFAULT_EXPORT_SAMPLE_STEP;
  }
  return value;
};

/** Baseline PNG options (PT-DPI: pixelRatio ≥ 2). */
export const getChartCapturePngOptions = (pixelRatio?: number) =>
  ({
    cacheBust: true,
    pixelRatio: resolveChartExportPixelRatio(
      pixelRatio ?? DEFAULT_CHART_EXPORT_PIXEL_RATIO
    ),
    backgroundColor: "#ffffff",
  }) as const;

/** @deprecated Prefer getChartCapturePngOptions — kept as default baseline alias. */
export const CHART_CAPTURE_PNG_OPTIONS = getChartCapturePngOptions();

export const getChartCaptureSvgOptions = () =>
  ({
    cacheBust: true,
    backgroundColor: "#ffffff",
  }) as const;

export const waitForChartPaint = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });

export const prepareChartExportVisibility = (
  chartNode: HTMLElement
): ChartCaptureVisibilityRestore | null => {
  const section = chartNode.closest<HTMLElement>("section");
  if (!section) return null;

  const restore: ChartCaptureVisibilityRestore = {
    section,
    hadHiddenClass: section.classList.contains("hidden"),
    ariaHidden: section.getAttribute("aria-hidden"),
    notebookPanel: null,
    notebookHadCollapsedGrid: false,
  };

  if (restore.hadHiddenClass) {
    section.classList.remove("hidden");
    section.setAttribute("aria-hidden", "false");
  }

  const notebookGrid = chartNode.closest<HTMLElement>(".grid.transition-all");
  if (notebookGrid?.classList.contains("grid-rows-[0fr]")) {
    restore.notebookPanel = notebookGrid;
    restore.notebookHadCollapsedGrid = true;
    notebookGrid.classList.remove("grid-rows-[0fr]", "opacity-0", "mt-0");
    notebookGrid.classList.add("grid-rows-[1fr]", "opacity-100", "mt-3");
  }

  return restore;
};

export const restoreChartExportVisibility = (
  restore: ChartCaptureVisibilityRestore | null
) => {
  if (!restore) return;

  if (restore.notebookHadCollapsedGrid && restore.notebookPanel) {
    restore.notebookPanel.classList.remove(
      "grid-rows-[1fr]",
      "opacity-100",
      "mt-3"
    );
    restore.notebookPanel.classList.add("grid-rows-[0fr]", "opacity-0", "mt-0");
  }

  if (restore.hadHiddenClass) {
    restore.section.classList.add("hidden");
    if (restore.ariaHidden !== null) {
      restore.section.setAttribute("aria-hidden", restore.ariaHidden);
    } else {
      restore.section.removeAttribute("aria-hidden");
    }
  }
};

const isValidPngDataUrl = (dataUrl: string) =>
  dataUrl.startsWith("data:image/png") && dataUrl.length > 100;

const isValidSvgDataUrl = (dataUrl: string) =>
  (dataUrl.startsWith("data:image/svg+xml") ||
    dataUrl.startsWith("data:image/svg")) &&
  dataUrl.length > 50;

/**
 * Shared PNG capture used by EXPORT-1 and PDF (OUT) — keep signature compatible.
 * Optional pixelRatio must default to ≥ 2 (PT-DPI).
 */
export const captureChartAsPngDataUrl = async (
  chartNode: HTMLElement,
  logContext: "png-export" | "pdf-export",
  options?: { pixelRatio?: number }
): Promise<string | null> => {
  const visibilityRestore = prepareChartExportVisibility(chartNode);
  const pngOptions = getChartCapturePngOptions(options?.pixelRatio);

  console.log(`[chart-capture:${logContext}] chartExportRef exists: true`);
  console.log(
    `[chart-capture:${logContext}] DOM node:`,
    chartNode.tagName,
    chartNode.className
  );
  console.log(
    `[chart-capture:${logContext}] size before paint:`,
    chartNode.offsetWidth,
    chartNode.offsetHeight
  );
  console.log(
    `[chart-capture:${logContext}] pixelRatio:`,
    pngOptions.pixelRatio
  );

  try {
    await waitForChartPaint();

    const width = chartNode.offsetWidth;
    const height = chartNode.offsetHeight;
    console.log(`[chart-capture:${logContext}] size after paint:`, width, height);

    if (width <= 0 || height <= 0) {
      console.warn(
        `[chart-capture:${logContext}] toPng skipped: zero-size container`
      );
      return null;
    }

    const dataUrl = await toPng(chartNode, pngOptions);
    const captureOk = isValidPngDataUrl(dataUrl);
    console.log(
      `[chart-capture:${logContext}] toPng success:`,
      captureOk,
      "length:",
      dataUrl.length
    );
    return captureOk ? dataUrl : null;
  } catch (error) {
    console.error(`[chart-capture:${logContext}] toPng failed:`, error);
    return null;
  } finally {
    restoreChartExportVisibility(visibilityRestore);
  }
};

/** SVG capture — same visibility/paint path as PNG (EXPORT-1-02). */
export const captureChartAsSvgDataUrl = async (
  chartNode: HTMLElement,
  logContext: "svg-export" = "svg-export"
): Promise<string | null> => {
  const visibilityRestore = prepareChartExportVisibility(chartNode);
  const svgOptions = getChartCaptureSvgOptions();

  console.log(`[chart-capture:${logContext}] chartExportRef exists: true`);
  console.log(
    `[chart-capture:${logContext}] DOM node:`,
    chartNode.tagName,
    chartNode.className
  );

  try {
    await waitForChartPaint();

    const width = chartNode.offsetWidth;
    const height = chartNode.offsetHeight;
    console.log(`[chart-capture:${logContext}] size after paint:`, width, height);

    if (width <= 0 || height <= 0) {
      console.warn(
        `[chart-capture:${logContext}] toSvg skipped: zero-size container`
      );
      return null;
    }

    const dataUrl = await toSvg(chartNode, svgOptions);
    const captureOk = isValidSvgDataUrl(dataUrl);
    console.log(
      `[chart-capture:${logContext}] toSvg success:`,
      captureOk,
      "length:",
      dataUrl.length
    );
    return captureOk ? dataUrl : null;
  } catch (error) {
    console.error(`[chart-capture:${logContext}] toSvg failed:`, error);
    return null;
  } finally {
    restoreChartExportVisibility(visibilityRestore);
  }
};

/**
 * Export-surface curve sampling (EXPORT-1-01).
 * Does not modify GRAPH barrels; mirrors page generateGraph loop with configurable step.
 */
export const buildChartExportSeriesPoints = (
  activeCurves: ChartExportCurveSample[],
  minX: number,
  maxX: number,
  sampleStep: number,
  evaluateY: (expression: string, x: number) => number | undefined
): Record<string, number>[] => {
  const step = resolveChartExportSampleStep(sampleStep);
  const points: Record<string, number>[] = [];

  for (let x = minX; x <= maxX; x += step) {
    const point: Record<string, number> = { x };
    for (const curve of activeCurves) {
      const y = evaluateY(curve.expression, x);
      if (y !== undefined) {
        point[`y${curve.idx + 1}`] = y;
      }
    }
    points.push(point);
  }

  return points;
};
