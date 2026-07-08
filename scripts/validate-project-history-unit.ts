import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  runProjectHistoryAdapterCaseSuite,
  runProjectHistoryHookCases,
} from "../src/lib/project-history/__tests__/project-history-adapter.cases";
import { runProjectHistoryDomainCaseSuite } from "../src/lib/project-history/__tests__/project-history.cases";
import { createAssertCase, type CaseResult } from "../src/lib/project-history/__tests__/run-assertions";

type CaseResultWithPhase = CaseResult;

const MIN_CASE_COUNT = 18;

const ALLOWED_PUBLIC_EXPORTS = new Set([
  "DEFAULT_MAX_PROJECT_HISTORY_ENTRIES",
  "ProjectHistoryEntry",
  "ProjectHistoryEventType",
  "ProjectHistoryPayloadMap",
  "ProjectHistoryStore",
  "PROJECT_HISTORY_EVENT_TYPES",
  "isProjectHistoryEventType",
  "buildProjectHistoryEntry",
  "createProjectHistoryStore",
  "appendProjectHistoryEntry",
  "listProjectHistoryEntries",
  "clearProjectHistory",
]);

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const barrelSource = readFileSync(
  join(repoRoot, "src/lib/project-history/index.ts"),
  "utf8"
);

const results: CaseResultWithPhase[] = [
  ...runProjectHistoryDomainCaseSuite(),
  ...runProjectHistoryAdapterCaseSuite(),
];

const assertCase = createAssertCase(results);
runProjectHistoryHookCases(assertCase);

function setsEqual(a: readonly string[], b: readonly string[]): boolean {
  const setA = new Set(a);
  const setB = new Set(b);
  if (setA.size !== setB.size) return false;
  for (const value of setA) {
    if (!setB.has(value)) return false;
  }
  return true;
}

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

const consumerFiles = [
  join(repoRoot, "src/app/page.tsx"),
  join(repoRoot, "src/app/useProjectHistory.ts"),
  join(repoRoot, "src/components/project-activity/HistoryPanel.tsx"),
];

const deepImportHits = consumerFiles.flatMap((filePath) => {
  const source = readFileSync(filePath, "utf8");
  const matches = source.match(/@\/lib\/project-history\/[A-Za-z0-9_/-]+/g) ?? [];
  return matches.map((hit) => `${filePath}:${hit}`);
});

assertCase(
  "architecture.noDeepImportsConsumers",
  deepImportHits.length === 0,
  deepImportHits.join("; ") || "none"
);

const domainSources = ["types.ts", "events.ts", "builders.ts", "adapter.ts"].map(
  (file) => readFileSync(join(repoRoot, "src/lib/project-history", file), "utf8")
);

const domainHasReact = domainSources.some((source) =>
  /from\s+["']react["']|@\/app|@\/components/.test(source)
);

assertCase("architecture.domainPure", !domainHasReact);

const summary = {
  phase: "project-history-unit",
  pass: results.every((item) => item.pass) && results.length >= MIN_CASE_COUNT,
  caseCount: results.length,
  minCaseCount: MIN_CASE_COUNT,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
