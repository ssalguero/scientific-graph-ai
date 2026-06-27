import {
  buildMultiDatasetComparisonAnalysis,
  canBuildMultiDatasetComparisonAnalysis,
} from "../analysis";
import {
  buildMultiDatasetComparisonReportSection,
  canIncludeMultiDatasetComparisonInReport,
  getMultiDatasetComparisonPdfLines,
  getMultiDatasetComparisonReportLines,
  MULTI_DATASET_COMPARISON_REPORT_TITLE,
} from "../report";
import { findProblematicPdfCharacters } from "../pdf-text-audit";
import {
  buildCanonicalDataset5Profile,
  buildCanonicalDataset6Profile,
  buildEnrichedDataset5Profile,
  buildEnrichedDataset6Profile,
  buildIncompleteProfile,
} from "./fixtures/profiles";
import type { AssertCase } from "./run-assertions";

export const runReportCases = (assertCase: AssertCase) => {
  const slotA = buildCanonicalDataset5Profile();
  const slotB = buildCanonicalDataset6Profile();
  const analysis = buildMultiDatasetComparisonAnalysis({ slotA, slotB });

  assertCase(
    "report.canInclude.complete",
    canIncludeMultiDatasetComparisonInReport(analysis) === true
  );
  assertCase(
    "report.canInclude.null",
    canIncludeMultiDatasetComparisonInReport(null) === false
  );
  assertCase(
    "report.canInclude.incomplete",
    canIncludeMultiDatasetComparisonInReport(
      buildMultiDatasetComparisonAnalysis({
        slotA: buildIncompleteProfile("A"),
        slotB,
      })
    ) === false
  );

  const lines = getMultiDatasetComparisonReportLines(analysis);
  assertCase("report.lines.nonEmpty", lines.length > 0);
  assertCase(
    "report.lines.deltaReadiness",
    lines.some((line) => line.includes("Delta Readiness (B − A): -9.5"))
  );
  assertCase(
    "report.lines.slotAFile",
    lines.some((line) => line.includes("Slot A: Dataset5.csv"))
  );
  assertCase(
    "report.lines.slotBFile",
    lines.some((line) => line.includes("Slot B: Dataset6.csv"))
  );
  assertCase(
    "report.lines.kpiReadiness",
    lines.some((line) => line.includes("Readiness (SCI-55)"))
  );
  assertCase(
    "report.lines.disclaimer",
    lines.some((line) =>
      line.includes("no constituye prueba estadística combinada")
    )
  );

  const section = buildMultiDatasetComparisonReportSection(analysis);
  assertCase(
    "report.section.title",
    section.title === MULTI_DATASET_COMPARISON_REPORT_TITLE
  );
  assertCase(
    "report.section.contentMatches",
    section.content.length === lines.length
  );

  const enrichedAnalysis = buildMultiDatasetComparisonAnalysis({
    slotA: buildEnrichedDataset5Profile(),
    slotB: buildEnrichedDataset6Profile(),
  });
  const enrichedLines = getMultiDatasetComparisonReportLines(enrichedAnalysis);
  assertCase(
    "report.enriched.methodologicalKpi",
    enrichedLines.some((line) => line.includes("Consistency (SCI-50)"))
  );
  assertCase(
    "report.enriched.multivariate",
    enrichedLines.some((line) => line.includes("Multivariante (SCI-40)"))
  );

  assertCase(
    "report.canBuildMatchesInclude",
    canIncludeMultiDatasetComparisonInReport(analysis) ===
      canBuildMultiDatasetComparisonAnalysis(slotA, slotB)
  );

  const pdfLines = getMultiDatasetComparisonPdfLines(analysis);
  assertCase("report.pdf.lines.nonEmpty", pdfLines.length > 0);
  assertCase(
    "report.pdf.deltaReadiness.ascii",
    pdfLines.some((line) => line.includes("Delta Readiness (B - A): -9.5"))
  );
  assertCase(
    "report.pdf.noPipeKpiRows",
    pdfLines.every((line) => !line.includes(" | Slot A:"))
  );
  assertCase(
    "report.pdf.kpiMultiline",
    pdfLines.some((line) => line === "  Delta (B-A): -9.5 (Regresión)")
  );
  assertCase(
    "report.pdf.noProblematicChars",
    pdfLines.every((line) => findProblematicPdfCharacters(line).length === 0)
  );

  const enrichedPdfLines = getMultiDatasetComparisonPdfLines(enrichedAnalysis);
  assertCase(
    "report.pdf.enriched.effectAscii",
    enrichedPdfLines.some((line) => line.includes("-1.36"))
  );
};
