import { resolvePdfSectionsForState } from "@/lib/scientific/visibility";
import type { VisibilityState } from "@/lib/scientific/visibility";
import { COMPOSITE_METHODOLOGY_PRIMARY_LABELS } from "@/lib/scientific/methodology/disclosure";
import type { AssertCase } from "../../comparison/__tests__/run-assertions";
import {
  PDF_BLOCK_ADVISOR_ID,
  PDF_BLOCK_COMPARISON_ID,
  filterScientificReportSectionsForPdf,
  shouldIncludePdfExportBlock,
} from "../pdf-section-filter";

const sampleSections = [
  { title: "Descripción de datos", content: ["a"] },
  {
    title: COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-50"],
    content: ["b"],
  },
  { title: "Normalidad", content: ["c"] },
  { title: "Effect Size & Power", content: ["d"] },
  { title: "Recomendación final", content: ["e"] },
] as const;

export const runPdfSectionFilterCases = (assertCase: AssertCase): void => {
  const filteredEmpty = filterScientificReportSectionsForPdf(sampleSections, []);
  assertCase(
    "export2.filter.alwaysIncludesDescripcion",
    filteredEmpty.length === 1 &&
      filteredEmpty[0]?.title === "Descripción de datos"
  );

  const filteredSci50 = filterScientificReportSectionsForPdf(sampleSections, [
    "sci-50-consistency",
  ]);
  const sci50Titles = filteredSci50.map((section) => section.title);
  assertCase(
    "export2.filter.includesSci50WhenAllowed",
    sci50Titles.includes("Descripción de datos") &&
      sci50Titles.includes(COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-50"]) &&
      !sci50Titles.includes("Normalidad")
  );

  const filteredNormality = filterScientificReportSectionsForPdf(
    sampleSections,
    ["panel--normality"]
  );
  const normalityTitles = filteredNormality.map((section) => section.title);
  assertCase(
    "export2.filter.excludesSci50WhenNotAllowed",
    normalityTitles.includes("Normalidad") &&
      !normalityTitles.includes(COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-50"])
  );

  const filteredAll = filterScientificReportSectionsForPdf(sampleSections, [
    "sci-50-consistency",
    "panel--normality",
    "sci-57-effect-size-power",
    "scientific-advisor",
  ]);
  assertCase(
    "export2.filter.preservesDeterministicOrder",
    filteredAll.map((section) => section.title).join("|") ===
      `Descripción de datos|${COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-50"]}|Normalidad|Effect Size & Power|Recomendación final`
  );

  assertCase(
    "export2.blocks.historicalWhenIdsOmitted",
    shouldIncludePdfExportBlock(PDF_BLOCK_COMPARISON_ID, undefined) &&
      shouldIncludePdfExportBlock(PDF_BLOCK_ADVISOR_ID, undefined)
  );

  const withAdvisor = ["scientific-advisor"];
  const withComparison = ["sci-58-comparison-dashboard"];
  assertCase(
    "export2.blocks.gatedByAllowedIds",
    shouldIncludePdfExportBlock(PDF_BLOCK_ADVISOR_ID, withAdvisor) &&
      !shouldIncludePdfExportBlock(PDF_BLOCK_COMPARISON_ID, withAdvisor) &&
      shouldIncludePdfExportBlock(PDF_BLOCK_COMPARISON_ID, withComparison) &&
      !shouldIncludePdfExportBlock(PDF_BLOCK_ADVISOR_ID, withComparison)
  );

  const emptyState: VisibilityState = {};
  const defaults = resolvePdfSectionsForState(emptyState);
  const filteredDefaults = filterScientificReportSectionsForPdf(
    sampleSections,
    defaults
  );
  const defaultsTitles = filteredDefaults.map((section) => section.title);

  const visible: VisibilityState = {
    showConsistencyEngine: true,
    showNormality: true,
  };
  const allowed = resolvePdfSectionsForState(visible);
  const filteredVisible = filterScientificReportSectionsForPdf(
    sampleSections,
    allowed
  );
  const visibleTitles = filteredVisible.map((section) => section.title);

  assertCase(
    "export2.policy.wiringRespectsResolvePdfSections",
    defaultsTitles.includes("Descripción de datos") &&
      !defaultsTitles.includes(COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-50"]) &&
      !defaultsTitles.includes("Normalidad") &&
      visibleTitles.includes(COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-50"]) &&
      visibleTitles.includes("Normalidad") &&
      allowed.includes("sci-50-consistency") &&
      allowed.includes("panel--normality")
  );
};
