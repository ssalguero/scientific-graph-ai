/**
 * D61.10 — Window Tabs Foundation · Tabs API Freeze gate.
 * Authority: docs/D61.0-tabs-discovery.md · D61.1–D61.9 builds.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const windowsDir = join(repoRoot, "src/components/windows");
const tabsDir = join(windowsDir, "tabs");
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

const REQUIRED_FILES = [
  "TabId.ts",
  "TabTypes.ts",
  "TabRegistryTypes.ts",
  "TabRegistryStore.ts",
  "TabRegistry.ts",
  "TabSelectionTypes.ts",
  "TabSelectionStore.ts",
  "TabSelectionBridge.ts",
  "WindowTabsBridge.ts",
  "index.ts",
] as const;

for (const file of REQUIRED_FILES) {
  const exists = existsSync(join(tabsDir, file));
  assertCase(`d61.api.file.${file}`, exists, exists ? "exists" : "missing");
}

const tabId = readTabs("TabId.ts");
const tabTypes = readTabs("TabTypes.ts");
const registryTypes = readTabs("TabRegistryTypes.ts");
const registryStore = readTabs("TabRegistryStore.ts");
const registry = readTabs("TabRegistry.ts");
const selectionTypes = readTabs("TabSelectionTypes.ts");
const selectionStore = readTabs("TabSelectionStore.ts");
const selectionBridge = readTabs("TabSelectionBridge.ts");
const windowBridge = readTabs("WindowTabsBridge.ts");
const tabsBarrel = readTabs("index.ts");
const windowsBarrel = readWindows("index.ts");
const windowTypes = readWindows("WindowTypes.ts");

assertCase(
  "d61.api.tabId",
  /export type TabId\s*=\s*string/.test(tabId) &&
    /export function createTabId\s*\(/.test(tabId) &&
    /export function isTabId\s*\(/.test(tabId),
  "TabId + createTabId + isTabId"
);

const stripComments = (source: string): string =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/.*$/gm, " ");

const tabTypesCode = stripComments(tabTypes);

assertCase(
  "d61.api.tabTypes",
  /export type TabDefinition\s*=/.test(tabTypes) &&
    /export type TabState\s*=/.test(tabTypes) &&
    /export type TabReference\s*=/.test(tabTypes) &&
    /export type TabEntry\s*=/.test(tabTypes) &&
    /tabId\s*:\s*TabId/.test(tabTypes) &&
    !/\bwindowId\b/.test(tabTypesCode) &&
    !/\bseriesId\b/.test(tabTypesCode),
  "TabDefinition / TabState / TabReference / TabEntry — no Window/Series fields"
);

assertCase(
  "d61.api.tabRegistry",
  /export type TabRegistry\s*=/.test(registryTypes) &&
    /register\s*\(/.test(registryTypes) &&
    /unregister\s*\(/.test(registryTypes) &&
    /get\s*\(/.test(registryTypes) &&
    /has\s*\(/.test(registryTypes) &&
    /list\s*\(/.test(registryTypes) &&
    /clear\s*\(/.test(registryTypes) &&
    /export function createTabRegistryStore\s*\(/.test(registryStore) &&
    /export function createTabRegistry\s*\(/.test(registry),
  "TabRegistry Freeze + Store + createTabRegistry"
);

assertCase(
  "d61.api.tabSelection",
  /export type TabSelectionStore\s*=/.test(selectionTypes) &&
    /get\s*\(/.test(selectionTypes) &&
    /setActive\s*\(/.test(selectionTypes) &&
    /clear\s*\(/.test(selectionTypes) &&
    /export function createTabSelectionStore\s*\(/.test(selectionStore) &&
    /export type TabSelectionBridge\s*=/.test(selectionBridge) &&
    /export function createTabSelectionBridge\s*\(/.test(selectionBridge),
  "Selection contracts + store + bridge"
);

assertCase(
  "d61.api.windowTabsBridge",
  /export type WindowTabsBridge\s*=/.test(windowBridge) &&
    /attach\s*\(/.test(windowBridge) &&
    /detach\s*\(/.test(windowBridge) &&
    /listTabs\s*\(/.test(windowBridge) &&
    /getWindow\s*\(/.test(windowBridge) &&
    /hasWindow\s*\(/.test(windowBridge) &&
    /hasTab\s*\(/.test(windowBridge) &&
    /clear\s*\(/.test(windowBridge) &&
    /export function createWindowTabsBridge\s*\(/.test(windowBridge),
  "WindowTabsBridge surface + factory"
);

assertCase(
  "d61.api.tabsBarrelExports",
  /export type \{ TabId \}/.test(tabsBarrel) &&
    /createTabId/.test(tabsBarrel) &&
    /isTabId/.test(tabsBarrel) &&
    /TabDefinition/.test(tabsBarrel) &&
    /TabRegistry/.test(tabsBarrel) &&
    /createTabRegistry/.test(tabsBarrel) &&
    /createTabRegistryStore/.test(tabsBarrel) &&
    /TabSelectionStore/.test(tabsBarrel) &&
    /createTabSelectionStore/.test(tabsBarrel) &&
    /createTabSelectionBridge/.test(tabsBarrel) &&
    /WindowTabsBridge/.test(tabsBarrel) &&
    /createWindowTabsBridge/.test(tabsBarrel),
  "tabs/index.ts exports Freeze surface"
);

const TABS_LEAKS = [
  "TabId",
  "createTabId",
  "isTabId",
  "TabDefinition",
  "TabState",
  "TabReference",
  "TabEntry",
  "TabRegistry",
  "createTabRegistry",
  "TabRegistryStore",
  "createTabRegistryStore",
  "TabSelectionStore",
  "createTabSelectionStore",
  "TabSelectionBridge",
  "createTabSelectionBridge",
  "WindowTabsBridge",
  "createWindowTabsBridge",
] as const;

const windowsBarrelExportLines = windowsBarrel
  .split("\n")
  .filter((l) => /^\s*export\s/.test(l))
  .join("\n");

const leaked = TABS_LEAKS.filter((name) =>
  new RegExp(`\\b${name}\\b`).test(windowsBarrelExportLines)
);

assertCase(
  "d61.api.noTabsWindowsBarrelLeak",
  leaked.length === 0 && !/from\s+["']\.\/tabs/.test(windowsBarrel),
  leaked.length
    ? `leaked: ${leaked.join(",")}`
    : "Tabs* not exported from windows/index.ts"
);

assertCase(
  "d61.api.noTabsOnWindowDefinition",
  /export interface WindowDefinition\b/.test(windowTypes) &&
    !/\btabId\b/i.test(windowTypes) &&
    !/\bTabId\b/.test(windowTypes) &&
    !/\btabs\b/.test(windowTypes),
  "Hard Rule: no Tabs fields on WindowDefinition/WindowState types file"
);

/** Ban deep imports into tabs/* from outside tabs/ (barrel-only). */
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
      // Skip the tabs package itself (relative sibling imports allowed).
      if (full.replace(/\\/g, "/").endsWith("/windows/tabs")) {
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
  "d61.api.noDeepImports",
  deepImportHits.length === 0,
  deepImportHits.length
    ? `deep imports: ${deepImportHits.slice(0, 8).join(",")}`
    : "no deep imports into tabs/* outside barrel"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d61-tabs-api",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d61-tabs-api"
    : `\nFAIL — d61-tabs-api (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
