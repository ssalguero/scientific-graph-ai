/**
 * ENGINE-7 — Document Engine + Lifecycle Coordinator unit gate.
 * Runs document register/activate + lifecycle sequence cases under src/engine/__tests__.
 */
import { runLifecycleUnitCaseSuite } from "../src/engine/__tests__/lifecycle-document.cases";

const MIN_CASE_COUNT = 30;

async function main(): Promise<void> {
  const results = await runLifecycleUnitCaseSuite();

  const failed = results.filter((r) => !r.pass);
  const summary = {
    phase: "engine-lifecycle-unit",
    pass: failed.length === 0 && results.length >= MIN_CASE_COUNT,
    caseCount: results.length,
    minCaseCount: MIN_CASE_COUNT,
    failed: failed.map((f) => f.id),
    cases: results,
  };

  console.log(JSON.stringify(summary, null, 2));
  console.log(
    summary.pass
      ? "\nPASS — engine-lifecycle-unit"
      : `\nFAIL — engine-lifecycle-unit (${failed.map((f) => f.id).join(", ")})`,
  );
  process.exit(summary.pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
