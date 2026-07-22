/**
 * D63.9 — Lifecycle + Tab ↔ Series Wiring · Content API Freeze gate.
 * Authority: docs/D63.0-content-lifecycle-discovery.md · D63.1–D63.8 builds.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const windowsDir = join(repoRoot, "src/components/windows");
const contentDir = join(windowsDir, "content");
const srcDir = join(repoRoot, "src");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const readContent = (file: string): string => {
  const full = join(contentDir, file);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

const readWindows = (file: string): string => {
  const full = join(windowsDir, file);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

const REQUIRED_CONTENT_FILES = [
  "ContentTypes.ts",
  "ContentRegistry.ts",
  "ContentSlots.ts",
  "TabSeriesBridge.ts",
  "ContentBridge.ts",
  "ContentHost.tsx",
  "ContentIntegration.ts",
  "index.ts",
] as const;

for (const file of REQUIRED_CONTENT_FILES) {
  const exists = existsSync(join(contentDir, file));
  assertCase(
    `d63.api.content.file.${file}`,
    exists,
    exists ? "exists" : "missing"
  );
}

const types = readContent("ContentTypes.ts");
const registry = readContent("ContentRegistry.ts");
const slots = readContent("ContentSlots.ts");
const tabSeries = readContent("TabSeriesBridge.ts");
const bridge = readContent("ContentBridge.ts");
const host = readContent("ContentHost.tsx");
const integration = readContent("ContentIntegration.ts");
const barrel = readContent("index.ts");
const windowsBarrel = readWindows("index.ts");

/* —— ContentDefinition opaque shape —— */
assertCase(
  "d63.api.ContentDefinition",
  /export type ContentDefinition\s*=/.test(types) &&
    /id:\s*string/.test(types) &&
    /kind:\s*string/.test(types) &&
    /title:\s*string/.test(types) &&
    !/\bcomponent\s*:/.test(types) &&
    !/\bfactory\s*:/.test(types) &&
    !/\brenderer\s*:/.test(types) &&
    !/\bmetadata\s*:/.test(types),
  "ContentDefinition = { id, kind, title } only"
);

assertCase(
  "d63.api.ContentHostProps",
  /export type ContentHostProps\s*=/.test(types) &&
    /contentId:\s*string/.test(types),
  "ContentHostProps = { contentId }"
);

/* —— Registry —— */
assertCase(
  "d63.api.createContentRegistry",
  /export function createContentRegistry\s*\(/.test(registry) &&
    /export type ContentRegistry\s*=/.test(registry) &&
    /register\s*\(/.test(registry) &&
    /unregister\s*\(/.test(registry) &&
    /get\s*\(/.test(registry) &&
    /list\s*\(/.test(registry),
  "createContentRegistry + register/unregister/get/list"
);

/* —— Slots —— */
assertCase(
  "d63.api.ContentSlots",
  /export type ContentSlot\s*=/.test(slots) &&
    /export type ContentSlots\s*=/.test(slots),
  "ContentSlot / ContentSlots types"
);

/* —— TabSeriesBridge —— */
assertCase(
  "d63.api.createTabSeriesBridge",
  /export function createTabSeriesBridge\s*\(/.test(tabSeries) &&
    /export type TabSeriesBridge\s*=/.test(tabSeries) &&
    /bind\s*\(/.test(tabSeries) &&
    /unbind\s*\(/.test(tabSeries) &&
    /hasTab\s*\(/.test(tabSeries) &&
    /hasSeries\s*\(/.test(tabSeries) &&
    /getSeriesForTab\s*\(/.test(tabSeries) &&
    /getTabForSeries\s*\(/.test(tabSeries) &&
    /clear\s*\(/.test(tabSeries),
  "createTabSeriesBridge 1↔1 surface"
);

/* —— ContentBridge —— */
assertCase(
  "d63.api.createContentBridge",
  /export function createContentBridge\s*\(/.test(bridge) &&
    /export type ContentBridge\s*=/.test(bridge) &&
    /resolve\s*\(/.test(bridge) &&
    /registry\.get\s*\(\s*handle\.contentId\s*\)/.test(bridge),
  "createContentBridge.resolve → Registry.get"
);

/* —— ContentHost —— */
assertCase(
  "d63.api.ContentHost",
  /export function ContentHost\s*\(/.test(host),
  "ContentHost presentational export"
);

/* —— Integration library-only —— */
assertCase(
  "d63.api.createContentIntegration",
  /export function createContentIntegration\s*\(/.test(integration) &&
    /export type ContentIntegration\s*=/.test(integration),
  "createContentIntegration library-only helper"
);

/* —— barrel —— */
const REQUIRED_EXPORTS = [
  "ContentDefinition",
  "ContentHostProps",
  "ContentRegistry",
  "createContentRegistry",
  "ContentSlot",
  "ContentSlots",
  "TabSeriesBridge",
  "createTabSeriesBridge",
  "ContentBridge",
  "createContentBridge",
  "ContentHost",
] as const;

const missingExports = REQUIRED_EXPORTS.filter(
  (name) => !new RegExp(`\\b${name}\\b`).test(barrel)
);

assertCase(
  "d63.api.contentBarrelExports",
  missingExports.length === 0,
  missingExports.length
    ? `missing: ${missingExports.join(",")}`
    : "content/index.ts exports D63.1–D63.6 surface"
);

/* —— no leaks to windows/index.ts —— */
const CONTENT_LEAKS = [
  "ContentDefinition",
  "ContentHostProps",
  "ContentRegistry",
  "createContentRegistry",
  "ContentSlot",
  "ContentSlots",
  "TabSeriesBridge",
  "createTabSeriesBridge",
  "ContentBridge",
  "createContentBridge",
  "ContentHost",
  "createContentIntegration",
  "ContentIntegration",
] as const;

const windowsBarrelExportLines = windowsBarrel
  .split("\n")
  .filter((l) => /^\s*export\s/.test(l))
  .join("\n");

const leaked = CONTENT_LEAKS.filter((name) =>
  new RegExp(`\\b${name}\\b`).test(windowsBarrelExportLines)
);

assertCase(
  "d63.api.noWindowsBarrelLeak",
  leaked.length === 0 && !/from\s+["']\.\/content/.test(windowsBarrel),
  leaked.length
    ? `leaked: ${leaked.join(",")}`
    : "Content*/TabSeries* not exported from windows/index.ts"
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
      if (normalized.endsWith("/windows/content")) {
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
      /from\s+["'][^"']*windows\/content\/(?!index["'])[^"']+["']/.test(src) ||
      /from\s+["']\.\.\/content\/(?!index["'])[^"']+["']/.test(src)
    ) {
      deepImportHits.push(full.replace(repoRoot, "").replace(/\\/g, "/"));
    }
  }
};
walkSrc(srcDir);

assertCase(
  "d63.api.noDeepImports",
  deepImportHits.length === 0,
  deepImportHits.length
    ? `deep imports: ${deepImportHits.slice(0, 8).join(",")}`
    : "no deep imports into content/* outside barrel"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d63-content-api",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d63-content-api"
    : `\nFAIL — d63-content-api (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
