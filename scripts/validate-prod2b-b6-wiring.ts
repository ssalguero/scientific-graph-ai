/**
 * Gate PROD-2B B6.4 — persistence React wiring.
 */
import { runPersistenceWiringCaseSuite } from "../src/app/__tests__/persistence-wiring.cases";

const main = () => {
  const results = runPersistenceWiringCaseSuite();
  const failed = results.filter((item) => !item.pass);
  console.log(
    JSON.stringify(
      {
        gate: "validate:prod2b-b6-wiring",
        phase: "prod-2b-b6.4",
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
