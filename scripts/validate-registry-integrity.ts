/**
 * D64.3 — Production Stabilization · Registry Integrity.
 *
 * Certifies SSOT, ownership, isolation, and determinism for foundation registries
 * (Window / Dock / Series / Content / Tab). Does not redefine API Freeze contracts.
 *
 * Authority: docs/D64.0-production-baseline.md · docs/D64.1-architecture-audit.md
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const read = (relPath: string): string => {
  const full = join(repoRoot, relPath);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

const stripComments = (source: string): string =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/.*$/gm, " ");

const collectTsFiles = (dir: string): string[] => {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) {
      out.push(...collectTsFiles(abs));
    } else if (/\.(ts|tsx)$/.test(name)) {
      out.push(abs);
    }
  }
  return out;
};

const hasForbiddenImport = (source: string, needles: RegExp[]): boolean =>
  needles.some((re) => re.test(source));

const SCIENTIFIC_IMPORTS = [
  /from\s+["']@\/lib\/scientific/,
  /from\s+["'][^"']*lib\/scientific/,
];

const WORKSPACE_IMPORTS = [
  /from\s+["']@\/components\/workspace/,
  /from\s+["'][^"']*components\/workspace/,
];

// —— Paths ——

const windowRegistry = read("src/components/windows/WindowRegistry.ts");
const windowManager = read("src/components/windows/WindowManager.tsx");
const windowsBarrel = read("src/components/windows/index.ts");

const dockRegistry = read("src/components/docking/DockRegistry.ts");
const dockContext = read("src/components/docking/DockContext.tsx");
const dockingBarrel = read("src/components/docking/index.ts");
const dockTypes = read("src/components/docking/types.ts");

const seriesRegistry = read("src/components/windows/series/SeriesRegistry.ts");
const seriesRegistryTypes = read(
  "src/components/windows/series/SeriesRegistryTypes.ts"
);
const seriesBarrel = read("src/components/windows/series/index.ts");

const contentRegistry = read(
  "src/components/windows/content/ContentRegistry.ts"
);
const contentBarrel = read("src/components/windows/content/index.ts");
const contentDirFiles = collectTsFiles(
  join(repoRoot, "src/components/windows/content")
);

const tabRegistry = read("src/components/windows/tabs/TabRegistry.ts");
const tabRegistryStore = read(
  "src/components/windows/tabs/TabRegistryStore.ts"
);
const tabRegistryTypes = read(
  "src/components/windows/tabs/TabRegistryTypes.ts"
);
const tabsBarrel = read("src/components/windows/tabs/index.ts");
const tabsDirFiles = collectTsFiles(
  join(repoRoot, "src/components/windows/tabs")
);

const pageSource = read("src/app/page.tsx");

const windowRegistryCode = stripComments(windowRegistry);
const dockRegistryCode = stripComments(dockRegistry);
const seriesRegistryCode = stripComments(seriesRegistry);
const contentRegistryCode = stripComments(contentRegistry);
const tabRegistryCode = stripComments(tabRegistry);
const tabStoreCode = stripComments(tabRegistryStore);

// ============================================================================
// 1. WindowRegistry — SSOT · ownership · no duplicate ownership
// ============================================================================

assertCase(
  "registry.window.fileExists",
  existsSync(join(repoRoot, "src/components/windows/WindowRegistry.ts")),
  "WindowRegistry.ts"
);

assertCase(
  "registry.window.factory",
  /export function createWindowRegistry\s*\(/.test(windowRegistry),
  "createWindowRegistry"
);

assertCase(
  "registry.window.surface",
  /export type WindowRegistry\s*=/.test(windowRegistry) &&
    /register\s*\(/.test(windowRegistry) &&
    /unregister\s*\(/.test(windowRegistry) &&
    /has\s*\(/.test(windowRegistry) &&
    /get\s*\(/.test(windowRegistry) &&
    /getAll\s*\(/.test(windowRegistry),
  "register/unregister/has/get/getAll"
);

assertCase(
  "registry.window.mapSsot",
  /new Map\s*</.test(windowRegistryCode) &&
    /entries\.has\(definition\.id\)/.test(windowRegistryCode) &&
    /entries\.set\(definition\.id/.test(windowRegistryCode),
  "Map keyed by definition.id · duplicate register no-op"
);

assertCase(
  "registry.window.deterministicReads",
  /cloneDefinition/.test(windowRegistryCode) &&
    /getAll\(\):\s*readonly/.test(windowRegistry) &&
    /Array\.from\(entries\.values/.test(windowRegistryCode),
  "get/getAll return clones · insertion-order Array.from"
);

assertCase(
  "registry.window.noReact",
  !/from\s+["']react["']/.test(windowRegistry) &&
    !/\buse(State|Effect|Ref|Memo)\b/.test(windowRegistryCode),
  "WindowRegistry is pure (no React)"
);

assertCase(
  "registry.window.noScientific",
  !hasForbiddenImport(windowRegistry, SCIENTIFIC_IMPORTS),
  "no scientific imports"
);

assertCase(
  "registry.window.owner.WindowManager",
  /createWindowRegistry\s*\(/.test(windowManager) &&
    /registryRef/.test(windowManager),
  "WindowManager owns createWindowRegistry via registryRef"
);

// createWindowRegistry call sites outside definition / barrel / manager = dual ownership risk
const windowsSrcFiles = collectTsFiles(join(repoRoot, "src/components/windows"));
const windowFactoryCallSites = windowsSrcFiles.filter((abs) => {
  const rel = abs.replace(/\\/g, "/");
  if (rel.endsWith("/WindowRegistry.ts")) return false;
  if (rel.endsWith("/windows/index.ts")) return false;
  const src = readFileSync(abs, "utf8");
  return /createWindowRegistry\s*\(/.test(stripComments(src));
});
assertCase(
  "registry.window.singleRuntimeOwner",
  windowFactoryCallSites.length === 1 &&
    windowFactoryCallSites[0].replace(/\\/g, "/").endsWith("/WindowManager.tsx"),
  `call sites=[${windowFactoryCallSites
    .map((p) => p.replace(/\\/g, "/").split("/src/")[1] ?? p)
    .join(", ")}]`
);

assertCase(
  "registry.window.noPageOwnership",
  !/createWindowRegistry\s*\(/.test(pageSource),
  "page.tsx does not create WindowRegistry"
);

// ============================================================================
// 2. DockRegistry — isolation · ownership · determinism
// ============================================================================

assertCase(
  "registry.dock.fileExists",
  existsSync(join(repoRoot, "src/components/docking/DockRegistry.ts")),
  "DockRegistry.ts"
);

assertCase(
  "registry.dock.seedFrozen",
  /export const DOCK_REGISTRY\s*=\s*Object\.freeze\s*\(/.test(dockRegistry),
  "DOCK_REGISTRY = Object.freeze"
);

assertCase(
  "registry.dock.liveFactory",
  /export function createDockRegistry\s*\(/.test(dockRegistry),
  "createDockRegistry"
);

assertCase(
  "registry.dock.queryShape",
  /export type DockRegistryQuery\s*=/.test(dockTypes) &&
    /get\s*\(/.test(dockTypes) &&
    /list\s*\(/.test(dockTypes) &&
    /has\s*\(/.test(dockTypes),
  "DockRegistryQuery get/list/has"
);

assertCase(
  "registry.dock.mapSsot",
  /hydrateFromSeed/.test(dockRegistryCode) &&
    /new Map\s*</.test(dockRegistryCode) &&
    /entries\.has\(entry\.id\)/.test(dockRegistryCode),
  "live Map hydrated from seed · unique ids"
);

assertCase(
  "registry.dock.deterministicList",
  /list\(\):\s*readonly/.test(dockRegistry) &&
    /Array\.from\(entries\.values\(\)\)/.test(dockRegistryCode),
  "list() = Array.from(entries.values())"
);

assertCase(
  "registry.dock.mutatorInternal",
  /export type DockRegistryMutator\s*=/.test(dockRegistry) &&
    !/\bDockRegistryMutator\b/.test(dockingBarrel) &&
    !/createDockRegistry/.test(dockingBarrel),
  "mutator + factory not barrel-exported (query/seed only)"
);

assertCase(
  "registry.dock.owner.DockContext",
  /createDockRegistry\s*\(/.test(dockContext) &&
    /storeRef/.test(dockContext),
  "DockContext owns live createDockRegistry"
);

const dockingSrcFiles = collectTsFiles(join(repoRoot, "src/components/docking"));
const dockFactoryCallSites = dockingSrcFiles.filter((abs) => {
  const rel = abs.replace(/\\/g, "/");
  if (rel.endsWith("/DockRegistry.ts")) return false;
  const src = readFileSync(abs, "utf8");
  // ignore type-only / import lines that are not invocations — count invoke via (
  return /createDockRegistry\s*\(/.test(stripComments(src));
});
assertCase(
  "registry.dock.singlePackageOwner",
  dockFactoryCallSites.every((p) =>
    p.replace(/\\/g, "/").endsWith("/DockContext.tsx")
  ) && dockFactoryCallSites.length >= 1,
  `call sites=[${dockFactoryCallSites
    .map((p) => p.replace(/\\/g, "/").split("/src/")[1] ?? p)
    .join(", ")}]`
);

assertCase(
  "registry.dock.isolation",
  !hasForbiddenImport(dockRegistry, SCIENTIFIC_IMPORTS) &&
    !hasForbiddenImport(dockRegistry, WORKSPACE_IMPORTS) &&
    !/from\s+["']@\/components\/windows/.test(dockRegistry),
  "DockRegistry isolated from scientific/workspace/windows"
);

assertCase(
  "registry.dock.seedInBarrel",
  /\bDOCK_REGISTRY\b/.test(dockingBarrel),
  "frozen seed exported from docking barrel"
);

// ============================================================================
// 3. SeriesRegistry — SSOT · no science · no external ownership
// ============================================================================

assertCase(
  "registry.series.fileExists",
  existsSync(
    join(repoRoot, "src/components/windows/series/SeriesRegistry.ts")
  ),
  "SeriesRegistry.ts"
);

assertCase(
  "registry.series.factory",
  /export function createSeriesRegistry\s*\(/.test(seriesRegistry),
  "createSeriesRegistry"
);

assertCase(
  "registry.series.surface",
  /export type SeriesRegistry\s*=/.test(seriesRegistryTypes) &&
    /register\s*\(/.test(seriesRegistryTypes) &&
    /get\s*\(/.test(seriesRegistryTypes) &&
    /getAll\s*\(/.test(seriesRegistryTypes),
  "SeriesRegistry type surface"
);

assertCase(
  "registry.series.mapSsot",
  /new Map\s*</.test(seriesRegistryCode) &&
    /entries\.has\(definition\.id\)/.test(seriesRegistryCode),
  "Map keyed by series id · unique register"
);

assertCase(
  "registry.series.deterministicReads",
  /cloneDefinition/.test(seriesRegistryCode) &&
    /getAll\(\):\s*readonly/.test(seriesRegistry) &&
    /Array\.from\(entries\.values/.test(seriesRegistryCode),
  "get/getAll clones · Array.from"
);

assertCase(
  "registry.series.noScientific",
  !hasForbiddenImport(seriesRegistry, SCIENTIFIC_IMPORTS) &&
    !hasForbiddenImport(seriesRegistryTypes, SCIENTIFIC_IMPORTS) &&
    !hasForbiddenImport(seriesBarrel, SCIENTIFIC_IMPORTS),
  "series registry surface free of scientific imports"
);

assertCase(
  "registry.series.noWorkspace",
  !hasForbiddenImport(seriesRegistry, WORKSPACE_IMPORTS),
  "no workspace ownership/coupling"
);

assertCase(
  "registry.series.libraryOnly",
  !/createSeriesRegistry\s*\(/.test(pageSource) &&
    !/createSeriesRegistry\s*\(/.test(windowManager) &&
    !/\bcreateSeriesRegistry\b/.test(windowsBarrel),
  "no page / WindowManager / windows barrel ownership"
);

assertCase(
  "registry.series.barrelOnly",
  /createSeriesRegistry/.test(seriesBarrel) &&
    !/from\s+["']\.\/series["']/.test(windowsBarrel),
  "exported from series barrel · leak fence intact"
);

// ============================================================================
// 4. ContentRegistry — SSOT · ≠ TabRegistry · determinism
// ============================================================================

assertCase(
  "registry.content.fileExists",
  existsSync(
    join(repoRoot, "src/components/windows/content/ContentRegistry.ts")
  ),
  "ContentRegistry.ts"
);

assertCase(
  "registry.content.factory",
  /export function createContentRegistry\s*\(/.test(contentRegistry),
  "createContentRegistry"
);

assertCase(
  "registry.content.surface",
  /export type ContentRegistry\s*=/.test(contentRegistry) &&
    /register\s*\(/.test(contentRegistry) &&
    /unregister\s*\(/.test(contentRegistry) &&
    /get\s*\(/.test(contentRegistry) &&
    /list\s*\(/.test(contentRegistry),
  "register/unregister/get/list"
);

assertCase(
  "registry.content.mapSsot",
  /new Map\s*</.test(contentRegistryCode) &&
    /entries\.has\(definition\.id\)/.test(contentRegistryCode),
  "Map keyed by content id"
);

assertCase(
  "registry.content.deterministicList",
  /cloneDefinition/.test(contentRegistryCode) &&
    /list\(\):\s*readonly/.test(contentRegistry) &&
    /Array\.from\(entries\.values/.test(contentRegistryCode) &&
    /insertion order/i.test(contentRegistry),
  "list() clones · documented insertion order"
);

assertCase(
  "registry.content.opaqueDefinition",
  /id:\s*definition\.id/.test(contentRegistryCode) &&
    /kind:\s*definition\.kind/.test(contentRegistryCode) &&
    /title:\s*definition\.title/.test(contentRegistryCode) &&
    !/\bcomponent\b/.test(contentRegistryCode) &&
    !/\brenderer\b/.test(contentRegistryCode),
  "ContentDefinition clone = { id, kind, title } only"
);

assertCase(
  "registry.content.noScientific",
  !hasForbiddenImport(contentRegistry, SCIENTIFIC_IMPORTS),
  "no scientific imports"
);

assertCase(
  "registry.content.noWorkspace",
  !hasForbiddenImport(contentRegistry, WORKSPACE_IMPORTS),
  "no workspace imports"
);

assertCase(
  "registry.content.noTabRegistryImport",
  !/TabRegistry/.test(contentRegistryCode) &&
    !/from\s+["']\.\.\/tabs["']/.test(contentRegistry),
  "ContentRegistry source does not import TabRegistry / tabs"
);

assertCase(
  "registry.content.libraryOnly",
  !/createContentRegistry\s*\(/.test(pageSource) &&
    !/\bcreateContentRegistry\b/.test(windowsBarrel),
  "library-only · not owned by page / windows barrel"
);

assertCase(
  "registry.content.barrelOnly",
  /createContentRegistry/.test(contentBarrel) &&
    !/ContentIntegration/.test(contentBarrel),
  "barrel exports registry · not ContentIntegration"
);

// ============================================================================
// 5. TabRegistry — façade · ContentRegistry ≠ TabRegistry
// ============================================================================

assertCase(
  "registry.tab.fileExists",
  existsSync(join(repoRoot, "src/components/windows/tabs/TabRegistry.ts")) &&
    existsSync(
      join(repoRoot, "src/components/windows/tabs/TabRegistryStore.ts")
    ),
  "TabRegistry.ts + TabRegistryStore.ts"
);

assertCase(
  "registry.tab.factory",
  /export function createTabRegistry\s*\(/.test(tabRegistry),
  "createTabRegistry"
);

assertCase(
  "registry.tab.storeSsot",
  /export function createTabRegistryStore\s*\(/.test(tabRegistryStore) &&
    /new Map\s*(?:<|\()/.test(tabStoreCode) &&
    /TabRegistryCatalog/.test(tabRegistryStore),
  "TabRegistryStore Map (TabRegistryCatalog) is catalog SSOT"
);

assertCase(
  "registry.tab.facadeDelegates",
  /createTabRegistryStore/.test(tabRegistryCode) &&
    /store\.has|store\.set|store\.get|store\.values/.test(tabRegistryCode),
  "TabRegistry façade delegates to store"
);

assertCase(
  "registry.tab.deterministicList",
  /list\(\):\s*readonly/.test(tabRegistry) &&
    /cloneEntry/.test(tabRegistryCode) &&
    /store\.values\(\)/.test(tabRegistryCode),
  "list() clones from store.values()"
);

assertCase(
  "registry.tab.surface",
  /export type TabRegistry\s*=/.test(tabRegistryTypes) ||
    /export type \{ TabRegistry/.test(tabsBarrel),
  "TabRegistry type exported"
);

assertCase(
  "registry.tab.noContentRegistryImport",
  !/ContentRegistry/.test(tabRegistryCode) &&
    !/from\s+["']\.\.\/content["']/.test(tabRegistry) &&
    !/ContentRegistry/.test(tabStoreCode),
  "TabRegistry does not import ContentRegistry"
);

assertCase(
  "registry.tab.noScientific",
  !hasForbiddenImport(tabRegistry, SCIENTIFIC_IMPORTS) &&
    !hasForbiddenImport(tabRegistryStore, SCIENTIFIC_IMPORTS),
  "no scientific imports"
);

assertCase(
  "registry.tab.libraryOnly",
  !/createTabRegistry\s*\(/.test(pageSource) &&
    !/\bcreateTabRegistry\b/.test(windowsBarrel),
  "library-only · leak fence"
);

// Explicit ContentRegistry ≠ TabRegistry
assertCase(
  "registry.decoupled.contentNeqTab.files",
  existsSync(
    join(repoRoot, "src/components/windows/content/ContentRegistry.ts")
  ) &&
    existsSync(join(repoRoot, "src/components/windows/tabs/TabRegistry.ts")) &&
    join(repoRoot, "src/components/windows/content/ContentRegistry.ts") !==
      join(repoRoot, "src/components/windows/tabs/TabRegistry.ts"),
  "distinct modules"
);

assertCase(
  "registry.decoupled.contentNeqTab.types",
  /export type ContentRegistry\s*=/.test(contentRegistry) &&
    (/export type TabRegistry\s*=/.test(tabRegistryTypes) ||
      /export type \{ TabRegistry/.test(tabRegistry)),
  "distinct type names ContentRegistry vs TabRegistry"
);

const contentImportsTabsRegistry = contentDirFiles.some((abs) => {
  const src = stripComments(readFileSync(abs, "utf8"));
  return (
    /TabRegistry/.test(src) &&
    !abs.replace(/\\/g, "/").endsWith("/TabSeriesBridge.ts")
  );
});
// TabSeriesBridge may mention Series/Tab ids but must not own TabRegistry
const tabSeriesBridge = read(
  "src/components/windows/content/TabSeriesBridge.ts"
);
assertCase(
  "registry.decoupled.contentPackage.noTabRegistry",
  !contentImportsTabsRegistry &&
    !/TabRegistry/.test(stripComments(tabSeriesBridge)) &&
    !/createTabRegistry/.test(stripComments(tabSeriesBridge)),
  "content/** does not use TabRegistry (mapping-only bridge ok without registry)"
);

const tabsImportContentRegistry = tabsDirFiles.some((abs) => {
  const src = stripComments(readFileSync(abs, "utf8"));
  return /ContentRegistry|createContentRegistry/.test(src);
});
assertCase(
  "registry.decoupled.tabsPackage.noContentRegistry",
  !tabsImportContentRegistry,
  "tabs/** does not import ContentRegistry"
);

// ============================================================================
// 6. Cross-cutting: unique ids · no dual ownership · no duplicate state · bans
// ============================================================================

assertCase(
  "registry.cross.uniqueIdPatterns",
  /definition\.id/.test(windowRegistryCode) &&
    /entry\.id|definition\.id/.test(dockRegistryCode) &&
    /definition\.id/.test(seriesRegistryCode) &&
    /definition\.id/.test(contentRegistryCode) &&
    /definition\.id/.test(tabRegistryCode),
  "all registries key entries by entity id"
);

assertCase(
  "registry.cross.duplicateRegisterNoop",
  [/WindowRegistry/, /DockRegistry/, /SeriesRegistry/, /ContentRegistry/, /TabRegistry/]
    .every((_, i) => {
      const codes = [
        windowRegistryCode,
        dockRegistryCode,
        seriesRegistryCode,
        contentRegistryCode,
        tabRegistryCode,
      ][i];
      return /if\s*\([^)]*\.has\(/.test(codes);
    }),
  "duplicate id register is guarded (has → no-op / skip)"
);

assertCase(
  "registry.cross.noSharedModule",
  // Five registry implementations are five separate files
  new Set([
    "src/components/windows/WindowRegistry.ts",
    "src/components/docking/DockRegistry.ts",
    "src/components/windows/series/SeriesRegistry.ts",
    "src/components/windows/content/ContentRegistry.ts",
    "src/components/windows/tabs/TabRegistry.ts",
  ]).size === 5,
  "no shared dual-SSOT module across entity types"
);

assertCase(
  "registry.cross.bridgesDoNotCreateRegistries",
  (() => {
    const bridges = [
      "src/components/windows/content/ContentBridge.ts",
      "src/components/windows/content/TabSeriesBridge.ts",
      "src/components/windows/series/SeriesSelectionBridge.ts",
      "src/components/windows/series/WindowSeriesBridge.ts",
      "src/components/windows/tabs/TabSelectionBridge.ts",
      "src/components/windows/tabs/WindowTabsBridge.ts",
      "src/components/windows/FloatingWindowBridge.tsx",
    ];
    return bridges.every((rel) => {
      const src = stripComments(read(rel));
      return (
        !/createWindowRegistry\s*\(/.test(src) &&
        !/createDockRegistry\s*\(/.test(src) &&
        !/createSeriesRegistry\s*\(/.test(src) &&
        !/createContentRegistry\s*\(/.test(src) &&
        !/createTabRegistry\s*\(/.test(src)
      );
    });
  })(),
  "bridges must not instantiate registries (no ownership / no cache SSOT)"
);

assertCase(
  "registry.cross.contentBridgeUsesGet",
  /registry\.get\(/.test(
    stripComments(read("src/components/windows/content/ContentBridge.ts"))
  ),
  "ContentBridge resolves via Registry.get (no parallel catalog)"
);

// —— Summary ——

const pass = results.every((r) => r.pass);
const failed = results.filter((r) => !r.pass);

console.log(
  JSON.stringify(
    {
      phase: "registry-integrity",
      pass,
      total: results.length,
      passed: results.filter((r) => r.pass).length,
      failed: failed.length,
      failedIds: failed.map((r) => r.id),
      results,
    },
    null,
    2
  )
);
console.log(
  pass
    ? "\nPASS — registry-integrity"
    : `\nFAIL — registry-integrity (${failed.length} cases)`
);
process.exit(pass ? 0 : 1);
