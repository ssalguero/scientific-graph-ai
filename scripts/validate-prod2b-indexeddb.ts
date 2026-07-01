/**
 * Gate umbrella PROD-2B B5 — persistencia local IndexedDB.
 *
 * La certificación funcional de B5 se basa en este gate junto con
 * `validate:prod2b-b2-gate`, `validate:prod2c-c8-regression-gate` y `tsc`.
 * `validate:full` sigue siendo requerido para regresión global del producto;
 * un `ERR_CONNECTION_REFUSED` por servidor local ausente no invalida B5 por sí solo.
 */
import { runIndexedDbLocalProjectCaseSuite } from "../src/lib/project/__tests__/indexeddb-local-project.cases";

const main = async () => {
  const results = await runIndexedDbLocalProjectCaseSuite();
  const failed = results.filter((item) => !item.pass);
  console.log(
    JSON.stringify(
      {
        gate: "validate:prod2b-indexeddb",
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

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
