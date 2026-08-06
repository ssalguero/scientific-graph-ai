/**
 * ENGINE-4 — Project Product Flows unit gate.
 * Runs create/open/save/close cases under src/engine/__tests__.
 */
import { runProjectProductFlowsCaseSuite } from "../src/engine/__tests__/project-product-flows.cases";

const MIN_CASE_COUNT = 30;

async function main(): Promise<void> {
  const results = await runProjectProductFlowsCaseSuite();

  const failed = results.filter((r) => !r.pass);
  const summary = {
    phase: "engine-project-flows-unit",
    pass: failed.length === 0 && results.length >= MIN_CASE_COUNT,
    caseCount: results.length,
    minCaseCount: MIN_CASE_COUNT,
    failed: failed.map((f) => f.id),
    cases: results,
  };

  console.log(JSON.stringify(summary, null, 2));
  console.log(
    summary.pass
      ? "\nPASS — engine-project-flows-unit"
      : `\nFAIL — engine-project-flows-unit (${failed.map((f) => f.id).join(", ")})`,
  );
  process.exit(summary.pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
