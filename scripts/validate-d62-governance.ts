/**
 * D62.10 — Tabs UI Foundation · governance gate.
 * Authority: docs/D62.0-tabs-ui-discovery.md · Hard Rules + Governance Freeze.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const tabsDir = join(repoRoot, "src/components/windows/tabs");
const tabUiDir = join(repoRoot, "src/components/windows/tab-ui");
const windowTypesPath = join(
  repoRoot,
  "src/components/windows/WindowTypes.ts"
);

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const stripComments = (source: string): string =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/.*$/gm, " ");

const listTs = (dir: string): string[] =>
  existsSync(dir)
    ? readdirSync(dir).filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"))
    : [];

const tabsFiles = listTs(tabsDir);
const tabUiFiles = listTs(tabUiDir);

assertCase(
  "d62.gov.tabsDirExists",
  existsSync(tabsDir),
  existsSync(tabsDir) ? "tabs/ exists" : "tabs/ missing"
);

assertCase(
  "d62.gov.tabUiDirExists",
  existsSync(tabUiDir),
  existsSync(tabUiDir) ? "tab-ui/ exists" : "tab-ui/ missing"
);

assertCase(
  "d62.gov.tabs.noTsx",
  tabsFiles.every((f) => f.endsWith(".ts") && !f.endsWith(".tsx")),
  tabsFiles.some((f) => f.endsWith(".tsx"))
    ? `tsx present: ${tabsFiles.filter((f) => f.endsWith(".tsx")).join(",")}`
    : "no .tsx in tabs/"
);

const tabsSources = tabsFiles.map((file) => ({
  file,
  raw: readFileSync(join(tabsDir, file), "utf8"),
  code: stripComments(readFileSync(join(tabsDir, file), "utf8")),
}));

const tabsRaw = tabsSources.map((s) => s.raw).join("\n");
const tabsCode = tabsSources.map((s) => s.code).join("\n");

assertCase(
  "d62.gov.tabs.noReact",
  !/\bfrom\s+["']react["']/.test(tabsRaw) &&
    !/\bfrom\s+["']react\//.test(tabsRaw) &&
    !/\bReact\b/.test(tabsCode) &&
    !/\bReactNode\b/.test(tabsCode),
  "tabs/** No React / ReactNode"
);

assertCase(
  "d62.gov.tabs.noJsx",
  !/<\/[A-Z]/.test(tabsCode) &&
    !/React\.createElement/.test(tabsCode) &&
    !/<[A-Z][A-Za-z0-9]*\s+[A-Za-z]/.test(tabsCode) &&
    !/<[A-Z][A-Za-z0-9]*\s*\/>/.test(tabsCode),
  "tabs/** No JSX"
);

assertCase(
  "d62.gov.tabs.noHooks",
  !/\buse(State|Effect|Ref|Memo|Callback|Context|Reducer|Id|SyncExternalStore)\s*\(/.test(
    tabsCode
  ),
  "tabs/** No hooks"
);

assertCase(
  "d62.gov.tabs.noContext",
  !/\bcreateContext\b/.test(tabsCode) &&
    !/\buseContext\b/.test(tabsCode) &&
    !/\bProvider\b/.test(tabsCode),
  "tabs/** No Context / Provider"
);

assertCase(
  "d62.gov.tabs.noDom",
  !/\bdocument\b/.test(tabsCode) &&
    !/\bHTMLElement\b/.test(tabsCode) &&
    !/\baddEventListener\b/.test(tabsCode) &&
    !/\bDOM\b/.test(tabsCode) &&
    !/\bglobalThis\.window\b/.test(tabsCode) &&
    !/(?<![A-Za-z])window\.(?!Id|To|Tabs)/.test(tabsCode),
  "tabs/** No DOM"
);

assertCase(
  "d62.gov.tabs.noWindowDefinition",
  !/\bWindowDefinition\b/.test(tabsCode),
  "tabs/** No WindowDefinition"
);

assertCase(
  "d62.gov.tabs.noWindowState",
  !/\bWindowState\b/.test(tabsCode),
  "tabs/** No WindowState"
);

assertCase(
  "d62.gov.tabs.noSeriesWiring",
  !/from\s+["'][^"']*SeriesRegistry[^"']*["']/.test(tabsRaw) &&
    !/from\s+["']\.\.\/series/.test(tabsRaw) &&
    !/\bSeriesId\b/.test(tabsCode) &&
    !/\bseriesId\b/.test(tabsCode),
  "tabs/** No Series wiring"
);

/* HR-switch-react-agnostic — Document Switch core */
const switchFiles = tabsSources.filter(
  (s) =>
    s.file === "TabDocumentSwitch.ts" || s.file === "TabDocumentSwitchTypes.ts"
);
const switchCode = switchFiles.map((s) => s.code).join("\n");
const switchRaw = switchFiles.map((s) => s.raw).join("\n");

assertCase(
  "d62.gov.hr.switchReactAgnostic",
  switchFiles.length === 2 &&
    !/\bfrom\s+["']react["']/.test(switchRaw) &&
    !/\bReactNode\b/.test(switchCode) &&
    !/\bJSX\b/.test(switchCode),
  "Document Switch React-agnostic (no ReactNode in code)"
);

/* HR-activeTab-ssot-only — Policy must not call registry.setState */
const policyFile = tabsSources.find((s) => s.file === "TabSelectionPolicy.ts");
assertCase(
  "d62.gov.hr.activeTabSsotOnly.policy",
  policyFile !== undefined && !/\.setState\s*\(/.test(policyFile.code),
  "Policy does not dual-write TabState via setState"
);

/* TabStrip derives isActive from activeTab */
const stripPath = join(tabUiDir, "TabStrip.tsx");
const stripSrc = existsSync(stripPath) ? readFileSync(stripPath, "utf8") : "";
const stripCode = stripComments(stripSrc);

assertCase(
  "d62.gov.hr.activeTabSsotOnly.ui",
  /tab\.id\s*===\s*activeTab/.test(stripCode) ||
    /activeTab\s*===\s*tab\.id/.test(stripCode),
  "TabStrip derives isActive from activeTab"
);

/* WindowDefinition / WindowState unchanged regarding tabs */
const windowTypes = existsSync(windowTypesPath)
  ? readFileSync(windowTypesPath, "utf8")
  : "";

assertCase(
  "d62.gov.noTabsOnWindowTypes",
  /export interface WindowDefinition\b/.test(windowTypes) &&
    !/\btabId\b/i.test(windowTypes) &&
    !/\bTabId\b/.test(windowTypes) &&
    !/\btabs\b/.test(windowTypes),
  "No Tabs fields on WindowDefinition/WindowState"
);

/* —— tab-ui governance (React allowed; science / Series banned) —— */
const tabUiSources = tabUiFiles.map((file) => ({
  file,
  raw: readFileSync(join(tabUiDir, file), "utf8"),
  code: stripComments(readFileSync(join(tabUiDir, file), "utf8")),
}));

const tabUiRaw = tabUiSources.map((s) => s.raw).join("\n");
const tabUiCode = tabUiSources.map((s) => s.code).join("\n");

const BANNED_WORDS: { id: string; pattern: RegExp; label: string }[] = [
  { id: "graph", pattern: /\bgraph\b/i, label: "graph" },
  { id: "chart", pattern: /\bchart\b/i, label: "chart" },
  { id: "dataset", pattern: /\bdataset\b/i, label: "dataset" },
  { id: "analysis", pattern: /\banalysis\b/i, label: "analysis" },
  { id: "scientific", pattern: /\bscientific\b/i, label: "scientific" },
];

for (const ban of BANNED_WORDS) {
  assertCase(
    `d62.gov.tabUi.no-${ban.id}`,
    !ban.pattern.test(tabUiCode),
    ban.pattern.test(tabUiCode) ? `${ban.label} found` : `no ${ban.label}`
  );
}

assertCase(
  "d62.gov.tabUi.noSeriesWiring",
  !/from\s+["'][^"']*series[^"']*["']/i.test(tabUiRaw) &&
    !/\bSeriesId\b/.test(tabUiCode) &&
    !/\bSeriesRegistry\b/.test(tabUiCode),
  "tab-ui/** No Series wiring"
);

assertCase(
  "d62.gov.tabUi.noDeepTabsImports",
  !/from\s+["']\.\.\/tabs\/(?!index["'])[^"']+["']/.test(tabUiRaw) &&
    !/from\s+["'][^"']*windows\/tabs\/(?!index["'])[^"']+["']/.test(tabUiRaw),
  "tab-ui imports tabs only via barrel"
);

assertCase(
  "d62.gov.tabUi.noWindowManager",
  !/\bWindowManager\b/.test(tabUiCode) &&
    !/\bWindowDefinition\b/.test(tabUiCode) &&
    !/\bWindowState\b/.test(tabUiCode),
  "tab-ui/** No WindowManager / WindowDefinition / WindowState"
);

assertCase(
  "d62.gov.tabs.noScientific",
  !/\bgraph\b/i.test(tabsCode) &&
    !/\bchart\b/i.test(tabsCode) &&
    !/\bdataset\b/i.test(tabsCode) &&
    !/\bscientific\b/i.test(tabsCode),
  "tabs/** No scientific domain words"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d62-governance",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d62-governance"
    : `\nFAIL — d62-governance (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
