import { readFileSync } from "node:fs";
import { join } from "node:path";

import { runPValueDisclosureCases } from "../src/lib/scientific/inference/__tests__/p-value-disclosure.cases";
import {
  createAssertCase,
  type CaseResult,
} from "../src/lib/scientific/comparison/__tests__/run-assertions";
import { SCIENTIFIC_CAPABILITY_IDENTITIES } from "../src/lib/scientific/contracts";
import { COMPOSITE_METHODOLOGY_PRIMARY_LABELS } from "../src/lib/scientific/methodology/disclosure";
import { SCIENTIFIC_REPORT_PDF_SECTION_RULES } from "../src/lib/scientific/report/pdf-section-filter";
import { VISUAL_GRAPH_TYPE_LABELS } from "../src/lib/visualGraphBuilder";

const root = process.cwd();
const readSource = (relativePath: string) =>
  readFileSync(join(root, relativePath), "utf8");

const results: CaseResult[] = [];
const assertCase = createAssertCase(results);

runPValueDisclosureCases(assertCase);

const pageSource = readSource("src/app/page.tsx");
const consistencySource = readSource(
  "src/lib/scientific/methodology/consistency/build.ts"
);

for (const identity of SCIENTIFIC_CAPABILITY_IDENTITIES) {
  assertCase(
    `identity.page.primary.${identity.id}`,
    identity.historicalAliases.every((alias) => !pageSource.includes(alias))
  );
  assertCase(
    `identity.pdf.primary.${identity.id}`,
    identity.primaryLabelEs in SCIENTIFIC_REPORT_PDF_SECTION_RULES
  );
}

assertCase(
  "pvalue.results.full-disclosure",
  pageSource.split("APPROXIMATE_P_VALUE_DISCLOSURE").length - 1 >= 5
);
assertCase(
  "pvalue.report.formatter-is-approximate",
  pageSource.includes("const formatPValue = formatApproximatePValue;")
);

const visualGraphHandler = pageSource.slice(
  pageSource.indexOf("const handleVisualGraphCreate"),
  pageSource.indexOf("const buildCurrentDatasetAnalysisProfile")
);
assertCase(
  "vgb.state-isolation.no-ge-title-mutation",
  visualGraphHandler.length > 0 && !visualGraphHandler.includes("setTitle(")
);
assertCase(
  "vgb.violin.truthful-primary-label",
  VISUAL_GRAPH_TYPE_LABELS.violin === "Raw-value Strip"
);
assertCase(
  "sci50.no-false-method-evidence",
  !/supportingModules\.push\("(?:MANOVA|LDA|PCR|PLS|Bootstrap|Sensitivity|t-SNE|UMAP)"\)/.test(
    consistencySource
  )
);
assertCase(
  "composite.labels.coverage",
  Object.keys(COMPOSITE_METHODOLOGY_PRIMARY_LABELS).join(",") ===
    "SCI-50,SCI-51,SCI-52,SCI-53,SCI-54,SCI-55,SCI-56,SCI-60"
);
assertCase(
  "composite.labels.no-journal-suitability-claim",
  Object.values(COMPOSITE_METHODOLOGY_PRIMARY_LABELS).every(
    (label) => !/journal|revista|publication ready/i.test(label)
  )
);

const failed = results.filter((result) => !result.pass);
const summary = {
  phase: "pr1-scientific-honesty-unit",
  pass: failed.length === 0,
  caseCount: results.length,
  failed: failed.map(({ id }) => id),
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — pr1-scientific-honesty-unit"
    : `\nFAIL — pr1-scientific-honesty-unit (${summary.failed.join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
