/**
 * Gate PROD-2B B6 — persistence conflict (domain + application).
 */
import { runPersistenceConflictDomainCaseSuite } from "../src/lib/project/domain/__tests__/persistence-conflict.cases";
import { runPersistenceConflictApplicationCaseSuite } from "../src/lib/project/application/__tests__/persistence-conflict.cases";

const main = () => {
  const results = [
    ...runPersistenceConflictDomainCaseSuite(),
    ...runPersistenceConflictApplicationCaseSuite(),
  ];
  const failed = results.filter((item) => !item.pass);
  console.log(
    JSON.stringify(
      {
        gate: "validate:prod2b-b6-conflict",
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
