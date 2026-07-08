import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  runProjectHistoryAdapterCaseSuite,
  runProjectHistoryHookCases,
} from "./project-history-adapter.cases";
import { runProjectHistoryDomainCaseSuite } from "./project-history.cases";
import {
  createAssertCase,
  summarizeCaseResults,
  type CaseResult,
} from "./run-assertions";

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

const moduleDir = dirname(fileURLToPath(import.meta.url));
const barrelPath = join(moduleDir, "..", "index.ts");
const barrelSource = readFileSync(barrelPath, "utf8");

const exportNamePattern =
  /^export\s+(?:type\s+)?(?:\{([^}]+)\}|([A-Za-z0-9_]+))/gm;

const barrelExportNames: string[] = [];
for (const match of barrelSource.matchAll(exportNamePattern)) {
  const block = match[1];
  if (block) {
    for (const part of block.split(",")) {
      const name = part
        .trim()
        .split(/\s+as\s+/)[0]
        ?.trim();
      if (name) {
        barrelExportNames.push(name);
      }
    }
    continue;
  }
  const single = match[2]?.trim();
  if (single) {
    barrelExportNames.push(single);
  }
}

const apiFreezeResults: CaseResult[] = [];
const assertApiCase = createAssertCase(apiFreezeResults);

const unexpectedExports = barrelExportNames.filter(
  (name) => !ALLOWED_PUBLIC_EXPORTS.has(name)
);
const missingExports = [...ALLOWED_PUBLIC_EXPORTS].filter(
  (name) => !barrelExportNames.includes(name)
);

assertApiCase(
  "apiFreeze.exportCount",
  barrelExportNames.length === ALLOWED_PUBLIC_EXPORTS.size,
  `exports=[${barrelExportNames.join(", ")}] expected=${ALLOWED_PUBLIC_EXPORTS.size}`
);
assertApiCase(
  "apiFreeze.noUnexpectedExports",
  unexpectedExports.length === 0,
  unexpectedExports.length > 0 ? unexpectedExports.join(", ") : undefined
);
assertApiCase(
  "apiFreeze.allRequiredExportsPresent",
  missingExports.length === 0,
  missingExports.length > 0 ? missingExports.join(", ") : undefined
);
assertApiCase(
  "apiFreeze.exactContractMatch",
  unexpectedExports.length === 0 && missingExports.length === 0
);

const hookResults: CaseResult[] = [];
runProjectHistoryHookCases(createAssertCase(hookResults));

const results: CaseResult[] = [
  ...runProjectHistoryDomainCaseSuite(),
  ...runProjectHistoryAdapterCaseSuite(),
  ...hookResults,
  ...apiFreezeResults,
];

const summary = summarizeCaseResults(results);

for (const result of results) {
  const status = result.pass ? "PASS" : "FAIL";
  const detail = result.detail ? ` — ${result.detail}` : "";
  console.log(`${status} ${result.id}${detail}`);
}

console.log("");
console.log(
  `Project history (domain + adapter + hook + API freeze): ${summary.passCount}/${results.length} PASS`
);

if (results.length < MIN_CASE_COUNT) {
  console.error(`Expected at least ${MIN_CASE_COUNT} cases, got ${results.length}.`);
  process.exit(1);
}

if (summary.failCount > 0) {
  process.exit(1);
}
