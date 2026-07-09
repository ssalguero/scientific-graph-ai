import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { runPersistenceCaseSuite } from "../src/lib/project/application/persistence/__tests__/persistence.cases";

type CaseResult = {
  id: string;
  pass: boolean;
  detail?: string;
};

const MIN_CASE_COUNT = 10;

const ALLOWED_PUBLIC_EXPORTS = new Set([
  "listRecentProjects",
  "RecentProjectsQuery",
]);

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const barrelPath = join(
  repoRoot,
  "src/lib/project/application/persistence/index.ts"
);
const barrelSource = readFileSync(barrelPath, "utf8");

function setsEqual(a: readonly string[], b: readonly string[]): boolean {
  const setA = new Set(a);
  const setB = new Set(b);
  if (setA.size !== setB.size) return false;
  for (const value of setA) {
    if (!setB.has(value)) return false;
  }
  return true;
}

const main = async () => {
  const results: CaseResult[] = await runPersistenceCaseSuite();

  const assertCase = (id: string, pass: boolean, detail?: string) => {
    results.push({ id, pass, detail });
  };

  const barrelExportNames = [
    ...barrelSource.matchAll(/export\s+(?:type\s+)?\{([^}]+)\}/g),
  ].flatMap((match) =>
    match[1]
      .split(",")
      .map((part) => part.trim().split(/\s+as\s+/)[0]?.trim())
      .filter((name): name is string => Boolean(name))
  );

  const unexpectedBarrelExports = barrelExportNames.filter(
    (name) => !ALLOWED_PUBLIC_EXPORTS.has(name)
  );
  const missingBarrelExports = [...ALLOWED_PUBLIC_EXPORTS].filter(
    (name) => !barrelExportNames.includes(name)
  );

  assertCase(
    "apiFreeze.exportCount",
    barrelExportNames.length === ALLOWED_PUBLIC_EXPORTS.size,
    `exports=[${barrelExportNames.join(", ")}] expected=${ALLOWED_PUBLIC_EXPORTS.size}`
  );

  assertCase(
    "apiFreeze.noUnexpectedExports",
    unexpectedBarrelExports.length === 0,
    unexpectedBarrelExports.join(", ") || "none"
  );

  assertCase(
    "apiFreeze.allRequiredExportsPresent",
    missingBarrelExports.length === 0,
    missingBarrelExports.join(", ") || "none"
  );

  assertCase(
    "apiFreeze.exactContractMatch",
    setsEqual(barrelExportNames, [...ALLOWED_PUBLIC_EXPORTS]),
    `exports=[${barrelExportNames.join(", ")}]`
  );

  assertCase(
    "apiFreeze.noExportStar",
    !/\bexport\s+\*/.test(barrelSource),
    "export * must not appear in barrel"
  );

  const moduleSources = ["types.ts", "recent-projects.ts", "index.ts"].map(
    (file) =>
      readFileSync(
        join(repoRoot, "src/lib/project/application/persistence", file),
        "utf8"
      )
  );

  const moduleHasReact = moduleSources.some((source) =>
    /from\s+["']react["']|from\s+["']next|@\/app|@\/components/.test(source)
  );

  assertCase("architecture.modulePure", !moduleHasReact);

  const testSource = readFileSync(
    join(
      repoRoot,
      "src/lib/project/application/persistence/__tests__/persistence.cases.ts"
    ),
    "utf8"
  );

  const testDeepImports =
    testSource.match(
      /@\/lib\/project\/application\/persistence\/(recent-projects|types)/
    ) ?? [];

  assertCase(
    "architecture.testsUseBarrelOnly",
    testDeepImports.length === 0,
    testDeepImports.join(", ") || "none"
  );

  const summary = {
    gate: "validate:persistence-unit",
    pass:
      results.every((item) => item.pass) && results.length >= MIN_CASE_COUNT,
    total: results.length,
    passed: results.filter((item) => item.pass).length,
    failed: results.filter((item) => !item.pass).length,
    minCaseCount: MIN_CASE_COUNT,
    failures: results.filter((item) => !item.pass),
    cases: results,
  };

  console.log(JSON.stringify(summary, null, 2));
  process.exit(summary.pass ? 0 : 1);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
