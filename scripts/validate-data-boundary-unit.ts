/**
 * DATA-I8 — Boundary enforcement unit gate.
 */
import { runDataBoundaryEnforcementCaseSuite } from "../src/data/__tests__/boundary-enforcement.cases";

const MIN_CASE_COUNT = 25;

async function main(): Promise<void> {
  const results = await runDataBoundaryEnforcementCaseSuite();
  const failed = results.filter((r) => !r.pass);
  const summary = {
    phase: "data-boundary-unit",
    pass: failed.length === 0 && results.length >= MIN_CASE_COUNT,
    caseCount: results.length,
    minCaseCount: MIN_CASE_COUNT,
    failed: failed.map((f) => f.id),
    cases: results,
  };

  console.log(JSON.stringify(summary, null, 2));
  console.log(
    summary.pass
      ? "\nPASS — data-boundary-unit"
      : `\nFAIL — data-boundary-unit (${failed.map((f) => f.id).join(", ")})`
  );
  process.exit(summary.pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
