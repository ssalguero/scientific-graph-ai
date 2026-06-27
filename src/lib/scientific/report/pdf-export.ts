import { prepareScientificReportPdfLine } from "./pdf-text";

export const INTEGRATED_NORMALITY_REPORT_SECTION_TITLE =
  "Evaluación integrada de normalidad";

/** Single-token lines skip jsPDF splitTextToSize to avoid join(" ") letter-spacing artifacts. */
const PDF_SINGLE_TOKEN_MAX_LENGTH = 96;

export const isBarePdfSeriesHeaderLine = (line: string): boolean => {
  const trimmed = line.trim();
  if (trimmed.length === 0 || trimmed.length > PDF_SINGLE_TOKEN_MAX_LENGTH) {
    return false;
  }
  if (trimmed.includes(":") || trimmed.startsWith("-")) {
    return false;
  }
  return !/\s/.test(trimmed);
};

export const shouldSkipPdfTextWrap = (preparedLine: string): boolean => {
  const trimmed = preparedLine.trim();
  if (trimmed.length === 0 || trimmed.length > PDF_SINGLE_TOKEN_MAX_LENGTH) {
    return false;
  }
  if (isBarePdfSeriesHeaderLine(trimmed)) {
    return true;
  }
  if (/^Serie: [^\s]+$/.test(trimmed)) {
    return true;
  }
  return false;
};

/** PDF-only visual header for normality series blocks (logical content unchanged). */
export const formatPdfSectionContentLine = (
  sectionTitle: string,
  line: string
): string => {
  const prepared = prepareScientificReportPdfLine(line);
  if (
    sectionTitle === INTEGRATED_NORMALITY_REPORT_SECTION_TITLE &&
    isBarePdfSeriesHeaderLine(prepared)
  ) {
    return `Serie: ${prepared}`;
  }
  return prepared;
};

const OBSERVED_POWER_PREFIX = "Potencia observada (aprox.):";
const OBSERVED_POWER_DISCLAIMER_PREFIX =
  "Advertencia: la potencia observada deriva";

/** PDF-only dedupe: reporting.ts and interpretation both emit observed-power lines. */
export const deduplicateScientificReportPdfLines = (
  lines: string[]
): string[] => {
  const prepared = lines.map((line) => prepareScientificReportPdfLine(line));
  const observedPowerLines = prepared.filter((line) =>
    line.startsWith(OBSERVED_POWER_PREFIX)
  );

  if (observedPowerLines.length <= 1) {
    return prepared;
  }

  const keepLine = observedPowerLines.reduce((longest, line) =>
    line.length > longest.length ? line : longest
  );
  const dropStandaloneDisclaimer =
    keepLine.includes("Advertencia:") ||
    keepLine.includes("potencia observada deriva");

  let keptObservedPower = false;
  return prepared.filter((line) => {
    if (line.startsWith(OBSERVED_POWER_PREFIX)) {
      if (line !== keepLine) {
        return false;
      }
      if (keptObservedPower) {
        return false;
      }
      keptObservedPower = true;
      return true;
    }

    if (
      dropStandaloneDisclaimer &&
      line.startsWith(OBSERVED_POWER_DISCLAIMER_PREFIX)
    ) {
      return false;
    }

    return true;
  });
};

export type PdfTextLayoutContext = {
  marginMm: number;
  contentWidthMm: number;
  pageBottomMm: number;
  addPage: () => void;
};

export type DrawPdfWrappedTextOptions = {
  fontSizePt: number;
  fontStyle?: "normal" | "bold";
  lineSpacingMm?: number;
};

/** Renders wrapped text left-aligned, one line per call — avoids jsPDF justify/charSpace artifacts. */
export const drawPdfWrappedText = (
  doc: {
    setFont: (face: string, style: string) => void;
    setFontSize: (size: number) => void;
    setCharSpace?: (space: number) => void;
    splitTextToSize: (text: string, maxWidth: number) => string | string[];
    text: (
      text: string | string[],
      x: number,
      y: number,
      options?: { align?: "left" | "right" | "center" | "justify"; maxWidth?: number }
    ) => unknown;
  },
  text: string,
  startY: number,
  layout: PdfTextLayoutContext,
  options: DrawPdfWrappedTextOptions
): number => {
  const fontStyle = options.fontStyle ?? "normal";
  const lineSpacingMm = options.lineSpacingMm ?? 1.5;
  const prepared = prepareScientificReportPdfLine(text);

  doc.setFont("helvetica", fontStyle);
  doc.setFontSize(options.fontSizePt);
  doc.setCharSpace?.(0);

  const lineHeightMm = options.fontSizePt * 0.3528 + lineSpacingMm;
  const lines = shouldSkipPdfTextWrap(prepared)
    ? [prepared]
    : (() => {
        const wrapped = doc.splitTextToSize(prepared, layout.contentWidthMm);
        return Array.isArray(wrapped) ? wrapped : [String(wrapped)];
      })();

  let cursorY = startY;
  for (const line of lines) {
    if (cursorY + lineHeightMm > layout.pageBottomMm) {
      layout.addPage();
      cursorY = layout.marginMm;
    }
    doc.text(line, layout.marginMm, cursorY, { align: "left" as const });
    cursorY += lineHeightMm;
  }

  return cursorY;
};
