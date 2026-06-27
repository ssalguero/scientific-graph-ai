import {
  deduplicateScientificReportPdfLines,
  drawPdfWrappedText,
  formatPdfSectionContentLine,
  INTEGRATED_NORMALITY_REPORT_SECTION_TITLE,
  shouldSkipPdfTextWrap,
} from "../pdf-export";
import { prepareScientificReportPdfLine } from "../pdf-text";
import type { AssertCase } from "../../comparison/__tests__/run-assertions";

export const runPdfExportCases = (assertCase: AssertCase) => {
  assertCase(
    "pdf.sanitize.replacesBidirectionalArrow",
    prepareScientificReportPdfLine("A ↔ B") === "A <-> B"
  );
  assertCase(
    "pdf.sanitize.replacesUnicodeMinus",
    prepareScientificReportPdfLine("Delta = −1.2") === "Delta = -1.2"
  );

  const duplicatePowerLines = [
    "Potencia observada (aprox.): 85.0%.",
    "Advertencia: la potencia observada deriva directamente del p-valor obtenido y no debe usarse para justificar resultados no significativos.",
    "Potencia observada (aprox.): 85.0%. Advertencia: la potencia observada deriva directamente del p-valor obtenido y no debe usarse para justificar resultados no significativos.",
  ];
  const deduped = deduplicateScientificReportPdfLines(duplicatePowerLines);
  assertCase(
    "pdf.dedupe.observedPowerOnce",
    deduped.filter((line) => line.startsWith("Potencia observada")).length === 1
  );
  assertCase(
    "pdf.dedupe.keepsLongestObservedPower",
    deduped.some(
      (line) =>
        line.startsWith("Potencia observada") &&
        line.includes("Advertencia: la potencia observada deriva")
    )
  );
  assertCase(
    "pdf.dedupe.dropsStandaloneDisclaimer",
    deduped.every(
      (line) =>
        line !==
        "Advertencia: la potencia observada deriva directamente del p-valor obtenido y no debe usarse para justificar resultados no significativos."
    )
  );

  assertCase("pdf.wrap.skipSingleToken", shouldSkipPdfTextWrap("Temperatura"));
  assertCase(
    "pdf.wrap.keepLongParagraph",
    shouldSkipPdfTextWrap(
      "Las series Temperatura y Presion presentan perfiles estadisticos similares."
    ) === false
  );
  assertCase(
    "pdf.normalityHeader.seriePrefix",
    formatPdfSectionContentLine(
      INTEGRATED_NORMALITY_REPORT_SECTION_TITLE,
      "Temperatura"
    ) === "Serie: Temperatura"
  );
  assertCase(
    "pdf.normalityHeader.otherSectionUntouched",
    formatPdfSectionContentLine("Normalidad", "Temperatura") === "Temperatura"
  );
  assertCase(
    "pdf.normalityHeader.labeledLineUntouched",
    formatPdfSectionContentLine(
      INTEGRATED_NORMALITY_REPORT_SECTION_TITLE,
      "Conclusión: normal"
    ) === "Conclusión: normal"
  );
  assertCase(
    "pdf.wrap.skipSeriePrefixHeader",
    shouldSkipPdfTextWrap("Serie: Temperatura")
  );

  let splitCallCount = 0;
  const mockDoc = {
    setFont: () => {},
    setFontSize: () => {},
    setCharSpace: () => {},
    splitTextToSize: (text: string) => {
      splitCallCount += 1;
      return [text];
    },
    text: (
      _text: string | string[],
      _x: number,
      _y: number,
      options?: { align?: "left" | "right" | "center" | "justify"; maxWidth?: number }
    ) => {
      if (options?.align === "justify" || options?.maxWidth) {
        throw new Error("unexpected justify/maxWidth");
      }
      return mockDoc;
    },
  };

  splitCallCount = 0;
  drawPdfWrappedText(
    mockDoc,
    "Temperatura",
    20,
    {
      marginMm: 20,
      contentWidthMm: 170,
      pageBottomMm: 280,
      addPage: () => {},
    },
    { fontSizePt: 11 }
  );
  assertCase("pdf.draw.skipSplitSingleToken", splitCallCount === 0);

  splitCallCount = 0;
  const endY = drawPdfWrappedText(
    mockDoc,
    "Temperatura <-> Presion: r = 0.85 (fuerte).",
    20,
    {
      marginMm: 20,
      contentWidthMm: 170,
      pageBottomMm: 280,
      addPage: () => {},
    },
    { fontSizePt: 11 }
  );
  assertCase("pdf.draw.wrapLongLine", splitCallCount === 1);
  assertCase("pdf.draw.leftAlignedOnly", endY > 20);
};
