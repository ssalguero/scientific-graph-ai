/**
 * Gate PROD-2B B6 — project size warning assessment.
 */
import { runPersistenceSizeApplicationCaseSuite } from "../src/lib/project/application/__tests__/persistence-size.cases";

const main = () => {
  const results = runPersistenceSizeApplicationCaseSuite();
  const failed = results.filter((item) => !item.pass);
  console.log(
    JSON.stringify(
      {
        gate: "validate:prod2b-b6-size",
        phase: "prod-2b-b6",
        total: results.length,
        passed: results.length - failed.length,
        failed: failed.length,
        failures: failed,
      },
      null,
      2
    )
  );
  process.exit(failed.length === 0 ? 0 : 1);
};

main();
