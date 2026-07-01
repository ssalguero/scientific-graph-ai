/**
 * Gate PROD-2B B6.3 — persistence UX messages (userMessages.ts).
 */
import { runPersistenceUxCaseSuite } from "../src/lib/project/__tests__/persistence-ux.cases";

const main = () => {
  const results = runPersistenceUxCaseSuite();
  const failed = results.filter((item) => !item.pass);
  console.log(
    JSON.stringify(
      {
        gate: "validate:prod2b-b6-ux",
        phase: "prod-2b-b6.3",
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
