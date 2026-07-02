import {
  createAssertCase,
  type AssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

import { createDefaultVisibilityState } from "../defaults";
import {
  resolvePdfExportPolicy,
  resolvePdfSectionsForState,
} from "../pdf-export-policy";
import { getToggleRegistryEntry } from "../registry";
import { applyVisibilityKeys } from "../state";

export const runVisibilityPdfPolicyCases = (assertCase: AssertCase): void => {
  assertCase(
    "pdf.policy.methodologyWhenVisible",
    resolvePdfExportPolicy("showConsistencyEngine") === "when-visible" &&
      resolvePdfExportPolicy("showReportQualityEngine") === "when-visible"
  );

  assertCase(
    "pdf.policy.graphMathNever",
    resolvePdfExportPolicy("showDerivative") === "never" &&
      resolvePdfExportPolicy("showRoots") === "never"
  );

  assertCase(
    "pdf.policy.matchesRegistryMetadata",
    resolvePdfExportPolicy("showConsistencyEngine") ===
      getToggleRegistryEntry("showConsistencyEngine").pdfExportPolicy
  );

  const defaults = createDefaultVisibilityState();
  const defaultSections = resolvePdfSectionsForState(defaults);
  assertCase(
    "pdf.sections.defaultExcludesWhenVisibleOff",
    !defaultSections.includes("sci-50-consistency") &&
      !defaultSections.includes("sci-51-report-quality")
  );

  const visibleMethodology = applyVisibilityKeys(
    defaults,
    ["showConsistencyEngine"],
    true
  );
  const visibleSections = resolvePdfSectionsForState(visibleMethodology);
  assertCase(
    "pdf.sections.visibleIncludesSci50",
    visibleSections.includes("sci-50-consistency")
  );

  const graphMathOn = applyVisibilityKeys(
    defaults,
    ["showDerivative", "showIntegral"],
    true
  );
  const graphMathSections = resolvePdfSectionsForState(graphMathOn);
  assertCase(
    "pdf.sections.neverPolicyIgnoresVisibleGraphMath",
    graphMathSections.every(
      (sectionId) =>
        !sectionId.includes("derivative") && !sectionId.includes("integral")
    )
  );

  assertCase(
    "pdf.sections.sortedUnique",
    (() => {
      const mixed = applyVisibilityKeys(
        defaults,
        ["showConsistencyEngine", "showReportQualityEngine"],
        true
      );
      const sections = resolvePdfSectionsForState(mixed);
      const sorted = [...sections].sort();
      return (
        sections.length === new Set(sections).size &&
        sections.every((value, index) => value === sorted[index])
      );
    })()
  );
};

export const runVisibilityPdfPolicyCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);
  runVisibilityPdfPolicyCases(assertCase);
  return results;
};
