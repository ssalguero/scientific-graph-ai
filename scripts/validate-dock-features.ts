/**
 * D52.3 — Dock features / governance / barrel public surface gate.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { extractBarrelExports } from "./lib/methodology-gate-utils";

const repoRoot = process.cwd();
const dockingDir = join(repoRoot, "src/components/docking");
const pagePath = join(repoRoot, "src/app/page.tsx");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const read = (file: string): string => {
  const full = join(dockingDir, file);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

const extractTypeBody = (source: string, typeName: string): string => {
  const re = new RegExp(
    `export\\s+type\\s+${typeName}\\s*=\\s*\\{([\\s\\S]*?)\\n\\};`
  );
  return source.match(re)?.[1] ?? "";
};

const FORBIDDEN_IMPORT_PATHS = [
  /@\/app\/page/,
  /@\/lib\/scientific/,
  /@\/lib\/graph/,
  /@\/components\/graph/,
  /@\/components\/analysis/,
  /from\s+["'][^"']*scientific[^"']*["']/,
  /from\s+["'][^"']*\/graph[^"']*["']/,
  /from\s+["'][^"']*analysis[^"']*["']/,
  /supabase/i,
  /\/stores?\b/,
];

const BARREL_ALLOWLIST = [
  "DockRoot",
  "DockZone",
  "DockPanel",
  "DockProvider",
  "useDockContext",
  "DOCK_TOKENS",
  "DOCK_REGISTRY",
  "DOCK_PANEL_IDS",
  "DOCK_FEATURES",
  "DEFAULT_DOCK_LAYOUT",
  "DockSide",
  "DockLocation",
  "DockSize",
  "DockState",
  "DockRootProps",
  "DockZoneProps",
  "DockPanelProps",
  "DockRegistryEntry",
  "DockContextValue",
  "DockRegistryQuery",
  "DockRegistrationApi",
  "DockVisibilityApi",
  "DockLayoutDefinition",
  "DockSlotDefinition",
] as const;

const BARREL_DENYLIST = [
  "mutator",
  "createDockRegistry",
  "DockRegistryMutator",
  "DockRegistryStore",
  "createDockRegistrationApi",
  "createDockVisibilityApi",
  "DEFAULT_DOCK_SLOTS",
  "hydrateFromSeed",
] as const;

const typesSource = read("types.ts");
const featuresSource = read("dockFeatures.ts");
const tokensBridgeSource = read("DockTokens.ts");
const barrelSource = read("index.ts");
const rootSource = read("DockRoot.tsx");
const zoneSource = read("DockZone.tsx");
const panelSource = read("DockPanel.tsx");
const pageSource = existsSync(pagePath) ? readFileSync(pagePath, "utf8") : "";

const dockingFiles = existsSync(dockingDir)
  ? readdirSync(dockingDir).filter((name) => !name.startsWith("."))
  : [];
const allDockingSources = dockingFiles
  .map((name) => read(name))
  .join("\n");

assertCase(
  "dock.features.flagsShape",
  /export const DOCK_FEATURES\s*=\s*\{/.test(featuresSource) &&
    /registration:\s*false/.test(featuresSource) &&
    /visibility:\s*false/.test(featuresSource) &&
    /layout:\s*false/.test(featuresSource) &&
    /slots:\s*false/.test(featuresSource),
  "DOCK_FEATURES keys present"
);

assertCase(
  "dock.features.allFalse",
  /registration:\s*false/.test(featuresSource) &&
    /visibility:\s*false/.test(featuresSource) &&
    /layout:\s*false/.test(featuresSource) &&
    /slots:\s*false/.test(featuresSource) &&
    !/:\s*true/.test(featuresSource),
  "all feature flags false"
);

const contextBody = extractTypeBody(typesSource, "DockContextValue");
const requiredContextKeys = [
  "state",
  "registry",
  "registration",
  "visibility",
  "layout",
  "features",
] as const;
assertCase(
  "dock.features.contextKeys",
  requiredContextKeys.every((key) =>
    new RegExp(`\\b${key}\\s*:`).test(contextBody)
  ),
  `DockContextValue keys checked`
);

const hostSources = [rootSource, zoneSource, panelSource].join("\n");
assertCase(
  "dock.features.zeroUxWiring",
  /<Inspector[\s\S]*?\bvisible=\{false\}/.test(pageSource) &&
    /return\s*<>\s*\{children\}\s*<\/>/.test(zoneSource) &&
    /return\s*<>\s*\{children\}\s*<\/>/.test(panelSource) &&
    !/\bclassName\b/.test(hostSources) &&
    !/<(div|section|aside)\b/.test(hostSources),
  "visible={false} + transparent hosts"
);

const forbiddenHits: string[] = [];
for (const pattern of FORBIDDEN_IMPORT_PATHS) {
  if (pattern.test(allDockingSources)) {
    forbiddenHits.push(String(pattern));
  }
}
assertCase(
  "dock.features.noScientificImports",
  forbiddenHits.length === 0,
  forbiddenHits.length ? forbiddenHits.join(",") : "clean"
);

assertCase(
  "dock.features.tokensSsot",
  /export const DOCK_TOKENS\s*=\s*UI_TOKENS\.dock/.test(tokensBridgeSource),
  "DOCK_TOKENS = UI_TOKENS.dock"
);

const barrelExports = extractBarrelExports(barrelSource);
const missingAllow = BARREL_ALLOWLIST.filter(
  (name) => !barrelExports.includes(name)
);
const deniedPresent = BARREL_DENYLIST.filter((name) =>
  barrelExports.includes(name)
);
assertCase(
  "dock.barrel.publicSurface",
  missingAllow.length === 0 && deniedPresent.length === 0,
  missingAllow.length || deniedPresent.length
    ? `missing=[${missingAllow.join(", ")}] denied=[${deniedPresent.join(", ")}]`
    : `public surface ok (${barrelExports.length} exports)`
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "dock-features",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — dock-features"
    : `\nFAIL — dock-features (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
