/**
 * ENGINE-3 — Command Orchestrator unit gate.
 * Runs business-command round-trip / unregistered / bridge cases under src/engine/__tests__.
 */
import { runCommandOrchestratorCaseSuite } from "../src/engine/__tests__/command-orchestrator.cases";

const MIN_CASE_COUNT = 18;

async function main(): Promise<void> {
  const results = await runCommandOrchestratorCaseSuite();

  const failed = results.filter((r) => !r.pass);
  const summary = {
    phase: "engine-command-unit",
    pass: failed.length === 0 && results.length >= MIN_CASE_COUNT,
    caseCount: results.length,
    minCaseCount: MIN_CASE_COUNT,
    failed: failed.map((f) => f.id),
    cases: results,
  };

  console.log(JSON.stringify(summary, null, 2));
  console.log(
    summary.pass
      ? "\nPASS — engine-command-unit"
      : `\nFAIL — engine-command-unit (${failed.map((f) => f.id).join(", ")})`,
  );
  process.exit(summary.pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
