/**
 * DATA-I9 — Hardening / Quality Gate unit gate.
 */
import { runDataHardeningCaseSuite } from "../src/data/__tests__/hardening-gates.cases";

const MIN_CASE_COUNT = 20;

async function main(): Promise<void> {
  const results = await runDataHardeningCaseSuite();
  const failed = results.filter((r) => !r.pass);
  const summary = {
    phase: "data-hardening-unit",
    pass: failed.length === 0 && results.length >= MIN_CASE_COUNT,
    caseCount: results.length,
    minCaseCount: MIN_CASE_COUNT,
    failed: failed.map((f) => f.id),
    cases: results,
  };

  console.log(JSON.stringify(summary, null, 2));
  console.log(
    summary.pass
      ? "\nPASS — data-hardening-unit"
      : `\nFAIL — data-hardening-unit (${failed.map((f) => f.id).join(", ")})`
  );
  process.exit(summary.pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
