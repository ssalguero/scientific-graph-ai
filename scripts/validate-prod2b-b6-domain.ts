/**
 * Gate PROD-2B B6.1 — domain persistence-conflict + persistence-status.
 */
import { runPersistenceConflictDomainCaseSuite } from "../src/lib/project/domain/__tests__/persistence-conflict.cases";

const main = () => {
  const results = runPersistenceConflictDomainCaseSuite();
  const failed = results.filter((item) => !item.pass);
  console.log(
    JSON.stringify(
      {
        gate: "validate:prod2b-b6-domain",
        phase: "prod-2b-b6.1",
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
