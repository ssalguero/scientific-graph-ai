/**
 * ENGINE-8/9 — Boundary enforcement + GraphEditor cutover unit gate.
 */
import { runBoundaryEnforcementCaseSuite } from "../src/engine/__tests__/boundary-enforcement.cases";
import { runGraphEditorCutoverCaseSuite } from "../src/engine/__tests__/graph-editor-cutover.cases";

const MIN_CASE_COUNT = 30;

async function main(): Promise<void> {
  const boundary = await runBoundaryEnforcementCaseSuite();
  const cutover = await runGraphEditorCutoverCaseSuite();
  const results = [...boundary, ...cutover];

  const failed = results.filter((r) => !r.pass);
  const summary = {
    phase: "engine-boundary-unit",
    pass: failed.length === 0 && results.length >= MIN_CASE_COUNT,
    caseCount: results.length,
    minCaseCount: MIN_CASE_COUNT,
    failed: failed.map((f) => f.id),
    cases: results,
  };

  console.log(JSON.stringify(summary, null, 2));
  console.log(
    summary.pass
      ? "\nPASS — engine-boundary-unit"
      : `\nFAIL — engine-boundary-unit (${failed.map((f) => f.id).join(", ")})`,
  );
  process.exit(summary.pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
