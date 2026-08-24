import { readFileSync } from "node:fs";
import { join } from "node:path";

import { runNumericScientificExportCases } from "../src/lib/scientific/export/__tests__/numeric-scientific-export.cases";
import { runScientificNumericExportActionCases } from "../src/lib/scientific/export/__tests__/scientific-numeric-export-actions.cases";
import {
  createAssertCase,
  type CaseResult,
} from "../src/lib/scientific/comparison/__tests__/run-assertions";

const results: CaseResult[] = [];
const assertCase = createAssertCase(results);
runNumericScientificExportCases(assertCase);
runScientificNumericExportActionCases(assertCase);

const read = (path: string): string =>
  readFileSync(join(process.cwd(), path), "utf8");
const contract = read(
  "src/lib/scientific/export/numeric-scientific-export.ts"
);
const action = read("src/app/scientificNumericExportActions.ts");
const page = read("src/app/page.tsx");

assertCase(
  "pr3b.integration.single-json-schema",
  contract.includes('"scientific-numeric-export/v1"') &&
    contract.includes(
      '"scientific-graph-ai.numeric-scientific-export"'
    ) &&
    !contract.includes("csv")
);
assertCase(
  "pr3b.boundary.contract-io-free",
  !contract.includes("document.") &&
    !contract.includes("createObjectURL") &&
    action.includes("createObjectUrl")
);
assertCase(
  "pr3b.integration.chart-json-distinguished",
  page.includes("Configuración JSON") &&
    page.includes("no es exportación científica numérica") &&
    page.includes("createScientificNumericExport")
);
assertCase(
  "pr3b.boundary.no-generated-prose",
  !contract.includes("GeneratedTextReview") &&
    !contract.includes("interpretation")
);

const failed = results.filter((result) => !result.pass);
const summary = {
  phase: "pr3-numeric-export-unit",
  pass: failed.length === 0 && results.length >= 20,
  caseCount: results.length,
  minCaseCount: 20,
  failed: failed.map((result) => result.id),
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
