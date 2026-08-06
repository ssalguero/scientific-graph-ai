/**
 * ENGINE-2 — Workflow Engine unit gate.
 * Runs empty-flow / registry / lifecycle cases under src/engine/__tests__.
 */
import { runWorkflowEngineCaseSuite } from "../src/engine/__tests__/workflow-engine.cases";

const MIN_CASE_COUNT = 16;

async function main(): Promise<void> {
  const results = await runWorkflowEngineCaseSuite();

  const failed = results.filter((r) => !r.pass);
  const summary = {
    phase: "engine-workflow-unit",
    pass: failed.length === 0 && results.length >= MIN_CASE_COUNT,
    caseCount: results.length,
    minCaseCount: MIN_CASE_COUNT,
    failed: failed.map((f) => f.id),
    cases: results,
  };

  console.log(JSON.stringify(summary, null, 2));
  console.log(
    summary.pass
      ? "\nPASS — engine-workflow-unit"
      : `\nFAIL — engine-workflow-unit (${failed.map((f) => f.id).join(", ")})`,
  );
  process.exit(summary.pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
