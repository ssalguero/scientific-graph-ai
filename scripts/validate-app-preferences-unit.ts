import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { runLocalStorageAdapterCaseSuite } from "../src/lib/app-preferences/__tests__/local-storage-adapter.cases";
import { runUserPreferencesCaseSuite } from "../src/lib/app-preferences/__tests__/user-preferences.cases";

type CaseResult = {
  id: string;
  pass: boolean;
  detail?: string;
};

const MIN_CASE_COUNT = 18;

const ALLOWED_PUBLIC_EXPORTS = new Set([
  "ThemeMode",
  "UserPreferences",
  "DEFAULT_USER_PREFERENCES",
  "createDefaultUserPreferences",
  "parseThemeMode",
  "parseShowContextualHints",
  "mergeUserPreferences",
  "validateUserPreferences",
  "APP_DISPLAY_VERSION",
  "USER_PREFERENCES_STORAGE_KEYS",
  "readUserPreferences",
  "writeUserPreferences",
  "clearUserPreferences",
]);

const results: CaseResult[] = [
  ...runUserPreferencesCaseSuite(),
  ...runLocalStorageAdapterCaseSuite(),
];

function assertCase(id: string, pass: boolean, detail?: string) {
  results.push({ id, pass, detail });
}

function setsEqual(a: readonly string[], b: readonly string[]): boolean {
  const setA = new Set(a);
  const setB = new Set(b);
  if (setA.size !== setB.size) return false;
  for (const value of setA) {
    if (!setB.has(value)) return false;
  }
  return true;
}

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const barrelSource = readFileSync(
  join(repoRoot, "src/lib/app-preferences/index.ts"),
  "utf8"
);

const barrelExportNames = [
  ...barrelSource.matchAll(/export\s+(?:type\s+)?\{([^}]+)\}/g),
].flatMap((match) =>
  match[1]
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
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

const summary = {
  phase: "app-preferences-unit",
  pass:
    results.every((item) => item.pass) && results.length >= MIN_CASE_COUNT,
  caseCount: results.length,
  minCaseCount: MIN_CASE_COUNT,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
