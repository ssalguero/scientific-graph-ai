/**
 * ENGINE-6 — Import Dataset + Export Results unit gate.
 * Runs cases under src/engine/__tests__/import-export-product-flows.cases.ts
 */
import { runImportExportProductFlowsCaseSuite } from "../src/engine/__tests__/import-export-product-flows.cases";

const MIN_CASE_COUNT = 28;

async function main(): Promise<void> {
  const results = await runImportExportProductFlowsCaseSuite();

  const failed = results.filter((r) => !r.pass);
  const summary = {
    phase: "engine-import-export-unit",
    pass: failed.length === 0 && results.length >= MIN_CASE_COUNT,
    caseCount: results.length,
    minCaseCount: MIN_CASE_COUNT,
    failed: failed.map((f) => f.id),
    cases: results,
  };

  console.log(JSON.stringify(summary, null, 2));
  console.log(
    summary.pass
      ? "\nPASS — engine-import-export-unit"
      : `\nFAIL — engine-import-export-unit (${failed.map((f) => f.id).join(", ")})`,
  );
  process.exit(summary.pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
