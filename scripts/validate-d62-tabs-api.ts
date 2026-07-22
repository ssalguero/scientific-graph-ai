/**
 * D62.10 — Tabs UI Foundation · Tabs + tab-ui API Freeze gate.
 * Authority: docs/D62.0-tabs-ui-discovery.md · D62.1–D62.9 builds.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const windowsDir = join(repoRoot, "src/components/windows");
const tabsDir = join(windowsDir, "tabs");
const tabUiDir = join(windowsDir, "tab-ui");
const srcDir = join(repoRoot, "src");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const readWindows = (file: string): string => {
  const full = join(windowsDir, file);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

const readTabs = (file: string): string => {
  const full = join(tabsDir, file);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

const readTabUi = (file: string): string => {
  const full = join(tabUiDir, file);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

const REQUIRED_TABS_FILES = [
  "TabId.ts",
  "TabTypes.ts",
  "TabRegistryTypes.ts",
  "TabRegistryStore.ts",
  "TabRegistry.ts",
  "TabSelectionTypes.ts",
  "TabSelectionStore.ts",
  "TabSelectionBridge.ts",
  "WindowTabsBridge.ts",
  "TabSelectionPolicyTypes.ts",
  "TabSelectionPolicy.ts",
  "TabDocumentSwitchTypes.ts",
  "TabDocumentSwitch.ts",
  "index.ts",
] as const;

const REQUIRED_TAB_UI_FILES = [
  "TabUiTypes.ts",
  "TabStrip.tsx",
  "TabBar.tsx",
  "TabDocumentHost.tsx",
  "index.ts",
] as const;

for (const file of REQUIRED_TABS_FILES) {
  const exists = existsSync(join(tabsDir, file));
  assertCase(`d62.api.tabs.file.${file}`, exists, exists ? "exists" : "missing");
}

for (const file of REQUIRED_TAB_UI_FILES) {
  const exists = existsSync(join(tabUiDir, file));
  assertCase(`d62.api.tabUi.file.${file}`, exists, exists ? "exists" : "missing");
}

const registryTypes = readTabs("TabRegistryTypes.ts");
const registry = readTabs("TabRegistry.ts");
const policyTypes = readTabs("TabSelectionPolicyTypes.ts");
const policy = readTabs("TabSelectionPolicy.ts");
const switchTypes = readTabs("TabDocumentSwitchTypes.ts");
const docSwitch = readTabs("TabDocumentSwitch.ts");
const tabsBarrel = readTabs("index.ts");
const tabUiTypes = readTabUi("TabUiTypes.ts");
const tabUiBarrel = readTabUi("index.ts");
const windowsBarrel = readWindows("index.ts");

/* —— D61 compatibility surface still present —— */
assertCase(
  "d62.api.d61.createTabRegistry",
  /export function createTabRegistry\s*\(/.test(registry) &&
    /register\s*\(/.test(registryTypes) &&
    /unregister\s*\(/.test(registryTypes) &&
    /list\s*\(/.test(registryTypes),
  "D61 TabRegistry surface intact"
);

/* —— D62.1 mutator —— */
assertCase(
  "d62.api.registry.setState",
  /setState\s*\(/.test(registryTypes) && /setState\s*\(/.test(registry),
  "TabRegistry.setState public mutator"
);

/* —— D62 Policy —— */
assertCase(
  "d62.api.policy.types",
  /export type TabSelectionPolicy\s*=/.test(policyTypes) &&
    /TabSelectionPolicyAfterUnregisterArgs/.test(policyTypes) &&
    /TabSelectionPolicyEnsureActiveArgs/.test(policyTypes) &&
    /afterUnregister\s*\(/.test(policyTypes) &&
    /ensureActive\s*\(/.test(policyTypes),
  "Selection Policy types Freeze"
);

assertCase(
  "d62.api.policy.engine",
  /export function createTabSelectionPolicy\s*\(/.test(policy),
  "createTabSelectionPolicy factory"
);

/* —— D62 Document Switch —— */
assertCase(
  "d62.api.switch.types",
  /export type OpaqueContentHandle\s*=/.test(switchTypes) &&
    /export type TabDocumentSlot\s*=/.test(switchTypes) &&
    /export type TabDocumentSlots\s*=/.test(switchTypes) &&
    /export type TabDocumentSwitchResolveArgs\s*=/.test(switchTypes) &&
    /export type TabDocumentSwitchResolveResult\s*=/.test(switchTypes) &&
    /export type TabDocumentSwitch\s*=/.test(switchTypes),
  "Document Switch types Freeze"
);

assertCase(
  "d62.api.switch.engine",
  /export function createTabDocumentSwitch\s*\(/.test(docSwitch) &&
    /resolve\s*\(/.test(docSwitch),
  "createTabDocumentSwitch + resolve"
);

/* —— tabs barrel —— */
const TABS_REQUIRED_EXPORTS = [
  "createTabRegistry",
  "TabSelectionPolicy",
  "createTabSelectionPolicy",
  "OpaqueContentHandle",
  "TabDocumentSwitch",
  "createTabDocumentSwitch",
  "TabId",
  "createTabId",
  "WindowTabsBridge",
] as const;

const missingTabsExports = TABS_REQUIRED_EXPORTS.filter(
  (name) => !new RegExp(`\\b${name}\\b`).test(tabsBarrel)
);

assertCase(
  "d62.api.tabsBarrelExports",
  missingTabsExports.length === 0,
  missingTabsExports.length
    ? `missing: ${missingTabsExports.join(",")}`
    : "tabs/index.ts exports D61+D62 surface"
);

/* —— tab-ui barrel —— */
assertCase(
  "d62.api.tabUi.types",
  /export type TabStripProps\s*=/.test(tabUiTypes) &&
    /export type TabBarProps\s*=/.test(tabUiTypes) &&
    /export type TabDocumentHostProps\s*=/.test(tabUiTypes) &&
    /export type TabUiItem\s*=/.test(tabUiTypes),
  "TabUiTypes Freeze"
);

assertCase(
  "d62.api.tabUiBarrelExports",
  /TabStripProps/.test(tabUiBarrel) &&
    /TabBarProps/.test(tabUiBarrel) &&
    /TabDocumentHostProps/.test(tabUiBarrel) &&
    /TabStrip/.test(tabUiBarrel) &&
    /TabBar/.test(tabUiBarrel) &&
    /TabDocumentHost/.test(tabUiBarrel) &&
    /export \{ TabStrip \}/.test(tabUiBarrel) &&
    /export \{ TabBar \}/.test(tabUiBarrel) &&
    /export \{ TabDocumentHost \}/.test(tabUiBarrel),
  "tab-ui/index.ts exports types + components"
);

/* —— no duplicate export lines for key symbols in tabs barrel —— */
const countExportMentions = (barrel: string, name: string): number =>
  (barrel.match(new RegExp(`\\b${name}\\b`, "g")) ?? []).length;

assertCase(
  "d62.api.noDuplicateCreateTabSelectionPolicy",
  countExportMentions(tabsBarrel, "createTabSelectionPolicy") === 1,
  "single createTabSelectionPolicy export mention"
);

assertCase(
  "d62.api.noDuplicateCreateTabDocumentSwitch",
  countExportMentions(tabsBarrel, "createTabDocumentSwitch") === 1,
  "single createTabDocumentSwitch export mention"
);

/* —— no leaks to windows/index.ts —— */
const TABS_LEAKS = [
  "TabId",
  "createTabId",
  "TabRegistry",
  "createTabRegistry",
  "TabSelectionPolicy",
  "createTabSelectionPolicy",
  "OpaqueContentHandle",
  "TabDocumentSwitch",
  "createTabDocumentSwitch",
  "TabStrip",
  "TabBar",
  "TabDocumentHost",
  "TabUiItem",
  "TabStripProps",
] as const;

const windowsBarrelExportLines = windowsBarrel
  .split("\n")
  .filter((l) => /^\s*export\s/.test(l))
  .join("\n");

const leaked = TABS_LEAKS.filter((name) =>
  new RegExp(`\\b${name}\\b`).test(windowsBarrelExportLines)
);

assertCase(
  "d62.api.noWindowsBarrelLeak",
  leaked.length === 0 &&
    !/from\s+["']\.\/tabs/.test(windowsBarrel) &&
    !/from\s+["']\.\/tab-ui/.test(windowsBarrel),
  leaked.length
    ? `leaked: ${leaked.join(",")}`
    : "Tabs*/TabUi* not exported from windows/index.ts"
);

/* —— deep imports ban —— */
const deepImportHits: string[] = [];
const walkSrc = (dir: string): void => {
  if (!existsSync(dir)) {
    return;
  }
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") {
        continue;
      }
      const normalized = full.replace(/\\/g, "/");
      if (normalized.endsWith("/windows/tabs")) {
        continue;
      }
      walkSrc(full);
      continue;
    }
    if (!entry.name.endsWith(".ts") && !entry.name.endsWith(".tsx")) {
      continue;
    }
    const src = readFileSync(full, "utf8");
    if (
      /from\s+["'][^"']*windows\/tabs\/(?!index["'])[^"']+["']/.test(src) ||
      /from\s+["']\.\.\/tabs\/(?!index["'])[^"']+["']/.test(src)
    ) {
      deepImportHits.push(full.replace(repoRoot, "").replace(/\\/g, "/"));
    }
  }
};
walkSrc(srcDir);

assertCase(
  "d62.api.noDeepImports",
  deepImportHits.length === 0,
  deepImportHits.length
    ? `deep imports: ${deepImportHits.slice(0, 8).join(",")}`
    : "no deep imports into tabs/* outside barrel"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d62-tabs-api",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d62-tabs-api"
    : `\nFAIL — d62-tabs-api (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
