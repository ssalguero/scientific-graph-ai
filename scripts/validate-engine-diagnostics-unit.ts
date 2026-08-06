/**
 * ENGINE-10 — Diagnostics & Hardening unit / integration gate.
 * Runs cases under src/engine/__tests__/diagnostics-hardening.cases.ts.
 */
import { runDiagnosticsHardeningCaseSuite } from "../src/engine/__tests__/diagnostics-hardening.cases";

const MIN_CASE_COUNT = 28;

async function main(): Promise<void> {
  const results = await runDiagnosticsHardeningCaseSuite();

  const failed = results.filter((r) => !r.pass);
  const summary = {
    phase: "engine-diagnostics-unit",
    pass: failed.length === 0 && results.length >= MIN_CASE_COUNT,
    caseCount: results.length,
    minCaseCount: MIN_CASE_COUNT,
    failed: failed.map((f) => f.id),
    cases: results,
  };

  console.log(JSON.stringify(summary, null, 2));
  console.log(
    summary.pass
      ? "\nPASS — engine-diagnostics-unit"
      : `\nFAIL — engine-diagnostics-unit (${failed.map((f) => f.id).join(", ")})`,
  );
  process.exit(summary.pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
