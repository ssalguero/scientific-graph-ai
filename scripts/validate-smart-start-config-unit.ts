import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  SMART_START_CARD_OPTION_IDS,
  SMART_START_INTENT_IDS,
  SMART_START_NAV_INTENT_IDS,
} from "../src/lib/smart-start/types";
import { SMART_START_OPTIONS } from "../src/lib/smart-start/options";

type CaseResult = {
  id: string;
  pass: boolean;
  detail?: string;
};

const results: CaseResult[] = [];

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

const optionIds = SMART_START_OPTIONS.map((option) => option.id);

assertCase(
  "options.no-duplicates",
  optionIds.length === new Set(optionIds).size,
  `${optionIds.length} options, ${new Set(optionIds).size} unique`
);

assertCase(
  "options.ids-match-card-constants",
  setsEqual(optionIds, SMART_START_CARD_OPTION_IDS),
  `options=[${optionIds.join(", ")}] constants=[${SMART_START_CARD_OPTION_IDS.join(", ")}]`
);

assertCase(
  "options.ids-subset-intent-ids",
  optionIds.every((id) =>
    (SMART_START_INTENT_IDS as readonly string[]).includes(id)
  ),
  optionIds.join(", ")
);

assertCase(
  "nav-intent.card-routes-match-options",
  setsEqual(
    SMART_START_NAV_INTENT_IDS.filter((id) => id !== "idle"),
    SMART_START_CARD_OPTION_IDS
  ),
  SMART_START_NAV_INTENT_IDS.join(", ")
);

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const pageSource = readFileSync(join(repoRoot, "src/app/page.tsx"), "utf8");
const intentRulesSource = readFileSync(
  join(repoRoot, "src/lib/smart-start/intent-rules.ts"),
  "utf8"
);
const barrelSource = readFileSync(
  join(repoRoot, "src/lib/smart-start/index.ts"),
  "utf8"
);

const handlerSwitchMatch = pageSource.match(
  /const handleSmartStartSelect = \(optionId: string\) => \{[\s\S]*?switch \(optionId\) \{([\s\S]*?)\n\s*default:/
);

const handlerCaseIds =
  handlerSwitchMatch?.[1]?.match(/case "([^"]+)":/g)?.map((line) => {
    const match = line.match(/case "([^"]+)":/);
    return match?.[1] ?? "";
  }) ?? [];

assertCase(
  "handlers.switch-cases-found",
  handlerCaseIds.length > 0,
  `${handlerCaseIds.length} cases`
);

assertCase(
  "handlers.cases-match-options",
  setsEqual(handlerCaseIds, optionIds),
  `handlers=[${handlerCaseIds.join(", ")}] options=[${optionIds.join(", ")}]`
);

const intentRuleIds = [
  ...intentRulesSource.matchAll(/^\s*id: "([^"]+)",/gm),
].map((match) => match[1]);

assertCase(
  "intent-rules.found",
  intentRuleIds.length > 0,
  `${intentRuleIds.length} rules`
);

assertCase(
  "intent-rules.ids-match-intent-ids",
  setsEqual(intentRuleIds, SMART_START_INTENT_IDS),
  `rules=[${intentRuleIds.join(", ")}] intentIds=[${SMART_START_INTENT_IDS.join(", ")}]`
);

const allowedBarrelExports = new Set([
  "IntentConfidence",
  "IntentRecommendation",
  "SmartStartIntentId",
  "SmartStartNavIntent",
  "SMART_START_OPTIONS",
  "classifyIntent",
  "formatIntentRecommendationSummary",
]);

const barrelExportNames = [
  ...barrelSource.matchAll(
    /export\s+(?:type\s+\{([^}]+)\}|{([^}]+)}|\*\s+from)/g,
  ),
].flatMap((match) => {
  const block = match[1] ?? match[2] ?? "";
  return block
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
});

const unexpectedBarrelExports = barrelExportNames.filter(
  (name) => !allowedBarrelExports.has(name)
);
const missingBarrelExports = [...allowedBarrelExports].filter(
  (name) => !barrelExportNames.includes(name)
);

assertCase(
  "barrel.no-unexpected-exports",
  unexpectedBarrelExports.length === 0,
  unexpectedBarrelExports.join(", ") || "none"
);

assertCase(
  "barrel.all-required-exports-present",
  missingBarrelExports.length === 0,
  missingBarrelExports.join(", ") || "none"
);

assertCase(
  "page.no-local-smart-start-nav-intent-type",
  !pageSource.includes("type SmartStartNavIntent ="),
  "local type removed"
);

const summary = {
  phase: "smart-start-config-unit",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
