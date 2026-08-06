/**
 * ENGINE-5 — Session coordination unit gate.
 * Runs restore / save / autosave cases under src/engine/__tests__.
 */
import { runSessionCoordinationCaseSuite } from "../src/engine/__tests__/session-coordination.cases";

const MIN_CASE_COUNT = 28;

async function main(): Promise<void> {
  const results = await runSessionCoordinationCaseSuite();

  const failed = results.filter((r) => !r.pass);
  const summary = {
    phase: "engine-session-unit",
    pass: failed.length === 0 && results.length >= MIN_CASE_COUNT,
    caseCount: results.length,
    minCaseCount: MIN_CASE_COUNT,
    failed: failed.map((f) => f.id),
    cases: results,
  };

  console.log(JSON.stringify(summary, null, 2));
  console.log(
    summary.pass
      ? "\nPASS — engine-session-unit"
      : `\nFAIL — engine-session-unit (${failed.map((f) => f.id).join(", ")})`,
  );
  process.exit(summary.pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
