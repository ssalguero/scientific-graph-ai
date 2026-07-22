/**
 * D64.4 — Production Stabilization · Bridge Integrity (production boundaries).
 *
 * Scope (exclusive): Bridge direction · cache · ownership · SSOT.
 * Layout composition / tree / module integration = D64.5 (out of scope here).
 *
 * Authority: docs/D64.0-production-baseline.md · docs/D64.1-architecture-audit.md
 */
import { existsSync, readFileSync } from "node:fs";
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

const BRIDGES = {
  content: "src/components/windows/content/ContentBridge.ts",
  tabSeries: "src/components/windows/content/TabSeriesBridge.ts",
  seriesSelection: "src/components/windows/series/SeriesSelectionBridge.ts",
  windowSeries: "src/components/windows/series/WindowSeriesBridge.ts",
  tabSelection: "src/components/windows/tabs/TabSelectionBridge.ts",
  windowTabs: "src/components/windows/tabs/WindowTabsBridge.ts",
  floating: "src/components/windows/FloatingWindowBridge.tsx",
  drag: "src/components/windows/WindowDragBridge.ts",
  resize: "src/components/windows/WindowResizeBridge.ts",
} as const;

const STORES_REGISTRIES = {
  contentRegistry: "src/components/windows/content/ContentRegistry.ts",
  seriesRegistry: "src/components/windows/series/SeriesRegistry.ts",
  seriesSelectionState: "src/components/windows/series/SeriesSelectionState.ts",
  tabRegistry: "src/components/windows/tabs/TabRegistry.ts",
  tabSelectionStore: "src/components/windows/tabs/TabSelectionStore.ts",
  windowRegistry: "src/components/windows/WindowRegistry.ts",
  geometryState: "src/components/windows/WindowGeometryState.ts",
  windowManager: "src/components/windows/WindowManager.tsx",
  contentHost: "src/components/windows/content/ContentHost.tsx",
} as const;

const page = read("src/app/page.tsx");
const pageCode = stripComments(page);

const sources: Record<string, string> = {};
const codes: Record<string, string> = {};
for (const [key, rel] of Object.entries({ ...BRIDGES, ...STORES_REGISTRIES })) {
  sources[key] = read(rel);
  codes[key] = stripComments(sources[key]);
}

// ============================================================================
// 0. Bridge files exist
// ============================================================================

for (const [id, rel] of Object.entries(BRIDGES)) {
  assertCase(
    `bridge.exists.${id}`,
    existsSync(join(repoRoot, rel)),
    rel
  );
}

// ============================================================================
// 1. Directionality — Bridge → Registry / Store / UI (never reverse)
// ============================================================================

const reverseForbidden: { id: string; owner: string; bridgeNeedle: RegExp }[] =
  [
    {
      id: "contentRegistry",
      owner: "contentRegistry",
      bridgeNeedle: /ContentBridge|createContentBridge/,
    },
    {
      id: "seriesRegistry",
      owner: "seriesRegistry",
      bridgeNeedle: /SeriesSelectionBridge|WindowSeriesBridge|createSeriesSelectionBridge|createWindowSeriesBridge/,
    },
    {
      id: "seriesSelectionState",
      owner: "seriesSelectionState",
      bridgeNeedle: /SeriesSelectionBridge|createSeriesSelectionBridge/,
    },
    {
      id: "tabRegistry",
      owner: "tabRegistry",
      bridgeNeedle: /TabSelectionBridge|WindowTabsBridge|createTabSelectionBridge|createWindowTabsBridge/,
    },
    {
      id: "tabSelectionStore",
      owner: "tabSelectionStore",
      bridgeNeedle: /TabSelectionBridge|createTabSelectionBridge/,
    },
    {
      id: "windowRegistry",
      owner: "windowRegistry",
      bridgeNeedle: /FloatingWindowBridge|WindowDragBridge|WindowResizeBridge|createWindowDragBridge|createWindowResizeBridge/,
    },
    {
      id: "geometryState",
      owner: "geometryState",
      bridgeNeedle: /WindowDragBridge|WindowResizeBridge|FloatingWindowBridge|createWindowDragBridge|createWindowResizeBridge/,
    },
  ];

for (const { id, owner, bridgeNeedle } of reverseForbidden) {
  assertCase(
    `bridge.direction.noReverse.${id}`,
    !bridgeNeedle.test(codes[owner]),
    `${owner} must not import/reference Bridge (Store/Registry ← Bridge forbidden)`
  );
}

assertCase(
  "bridge.direction.contentHost.noBridgeOwnership",
  !/createContentBridge|createContentRegistry|ContentBridge|ContentRegistry/.test(
    codes.contentHost
  ),
  "ContentHost is props-only · does not own Bridge/Registry"
);

assertCase(
  "bridge.direction.contentBridge.toRegistry",
  /ContentRegistry/.test(sources.content) &&
    /registry\.get\(/.test(codes.content),
  "ContentBridge → ContentRegistry.get"
);

assertCase(
  "bridge.direction.seriesSelection.toState",
  /SeriesSelectionState/.test(sources.seriesSelection) &&
    /state\.setSelectedSeries|state\.setActiveSeries|state\.setFocusedSeries|state\.getSnapshot|state\.clear/.test(
      codes.seriesSelection
    ),
  "SeriesSelectionBridge → SeriesSelectionState (SSOT store)"
);

assertCase(
  "bridge.direction.tabSelection.toStore",
  /TabSelectionStore/.test(sources.tabSelection) &&
    /store\.get|store\.setActive|store\.clear/.test(codes.tabSelection),
  "TabSelectionBridge → TabSelectionStore"
);

assertCase(
  "bridge.direction.floating.toWindowUi",
  /useWindowContext/.test(codes.floating) &&
    /useWindowGeometry/.test(codes.floating) &&
    /FloatingWindowLayer/.test(codes.floating),
  "FloatingWindowBridge → Window context/geometry → FloatingWindowLayer UI"
);

assertCase(
  "bridge.direction.drag.toGeometry",
  /WindowGeometryState/.test(sources.drag) &&
    /geometryState\.set\(/.test(codes.drag) &&
    /geometryState\.get\(/.test(codes.drag),
  "WindowDragBridge → GeometryState"
);

assertCase(
  "bridge.direction.resize.toGeometry",
  /WindowGeometryState/.test(sources.resize) &&
    /geometryState\.set\(/.test(codes.resize) &&
    /geometryState\.get\(/.test(codes.resize),
  "WindowResizeBridge → GeometryState"
);

// Mapping bridges are Bridge → mapping authority (not Registry mutation)
assertCase(
  "bridge.direction.mapping.noRegistryMutation",
  !/createSeriesRegistry|createTabRegistry|createContentRegistry|createWindowRegistry/.test(
    codes.tabSeries + codes.windowSeries + codes.windowTabs
  ) &&
    !/\.register\s*\(/.test(codes.tabSeries) &&
    !/\.register\s*\(/.test(codes.windowSeries) &&
    !/\.register\s*\(/.test(codes.windowTabs),
  "mapping bridges do not mutate entity Registries"
);

// ============================================================================
// 2. Cache — no local catalog caches / duplicate persistent domain state in resolve bridges
// ============================================================================

assertCase(
  "bridge.cache.content.noLocalCache",
  !/new Map\s*(?:<|\()/.test(codes.content) &&
    !/\bcache\b/i.test(codes.content) &&
    !/\bweakMap\b/i.test(codes.content) &&
    /registry\.get\(handle\.contentId\)/.test(codes.content),
  "ContentBridge resolve = registry.get only · no Map/cache"
);

assertCase(
  "bridge.cache.seriesSelection.noOwnMap",
  !/new Map\s*(?:<|\()/.test(codes.seriesSelection),
  "SeriesSelectionBridge has no local Map (State is SSOT)"
);

assertCase(
  "bridge.cache.tabSelection.noOwnMap",
  !/new Map\s*(?:<|\()/.test(codes.tabSelection),
  "TabSelectionBridge has no local Map (Store is SSOT)"
);

assertCase(
  "bridge.cache.floating.noOwnedCatalog",
  !/createWindowRegistry|new Map\s*</.test(codes.floating) &&
    /geometryState\.getAll\s*\(/.test(codes.floating) &&
    /useWindowContext/.test(codes.floating),
  "FloatingWindowBridge maps from context/geometry · no owned catalog Map"
);

assertCase(
  "bridge.cache.drag.sessionOnly",
  /let state:\s*WindowDragState/.test(codes.drag) &&
    /geometryState\.set\(/.test(codes.drag) &&
    !/createWindowGeometryState\s*\(/.test(codes.drag),
  "DragBridge session state only · GeometryState remains SSOT"
);

assertCase(
  "bridge.cache.resize.sessionOnly",
  /WindowResizeState/.test(sources.resize) &&
    /geometryState\.set\(/.test(codes.resize) &&
    !/createWindowGeometryState\s*\(/.test(codes.resize),
  "ResizeBridge session state only · GeometryState remains SSOT"
);

// Mapping Maps are authorized relationship SSOT — must not also hold Selection/Registry
assertCase(
  "bridge.cache.mapping.noSelectionCoupling",
  !/setActive|setSelected|setFocused|createSeriesSelection|createTabSelection/.test(
    codes.tabSeries
  ) && !/SeriesSelectionBridge|TabSelectionBridge/.test(codes.tabSeries),
  "TabSeriesBridge mapping-only (no Selection writes)"
);

assertCase(
  "bridge.cache.mapping.tabSeriesNoRegistry",
  !/SeriesRegistry|TabRegistry|ContentRegistry|WindowRegistry/.test(
    codes.tabSeries
  ),
  "TabSeriesBridge does not reference entity Registries"
);

// ============================================================================
// 3. SSOT — bridges consult authorized Registry / Store
// ============================================================================

assertCase(
  "bridge.ssot.contentBridge.viaRegistry",
  /createContentBridge\s*\(\s*registry:\s*ContentRegistry/.test(
    sources.content
  ) || /createContentBridge\(registry: ContentRegistry\)/.test(sources.content),
  "ContentBridge bound to ContentRegistry parameter"
);

assertCase(
  "bridge.ssot.seriesSelection.viaState",
  /createSeriesSelectionBridge\s*\(\s*state:\s*SeriesSelectionState/.test(
    sources.seriesSelection
  ) ||
    /createSeriesSelectionBridge\(\s*state: SeriesSelectionState/.test(
      sources.seriesSelection
    ),
  "SeriesSelectionBridge bound to SeriesSelectionState"
);

assertCase(
  "bridge.ssot.tabSelection.viaStore",
  /createTabSelectionBridge\s*\(\s*store:\s*TabSelectionStore/.test(
    sources.tabSelection
  ) ||
    /createTabSelectionBridge\(\s*store: TabSelectionStore/.test(
      sources.tabSelection
    ),
  "TabSelectionBridge bound to TabSelectionStore"
);

assertCase(
  "bridge.ssot.floating.viaWindowManagerSurface",
  /useWindowContext/.test(codes.floating) &&
    /WindowManager/.test(codes.windowManager) &&
    /WindowProvider|createWindowRegistry/.test(codes.windowManager),
  "FloatingWindowBridge consumes WindowManager-provided context surface"
);

assertCase(
  "bridge.ssot.drag.viaGeometryState",
  /createWindowDragBridge\s*\(\s*geometryState:\s*WindowGeometryState/.test(
    sources.drag
  ) ||
    /createWindowDragBridge\(\s*geometryState: WindowGeometryState/.test(
      sources.drag
    ),
  "WindowDragBridge bound to WindowGeometryState"
);

assertCase(
  "bridge.ssot.resize.viaGeometryState",
  /createWindowResizeBridge\s*\(\s*geometryState:\s*WindowGeometryState/.test(
    sources.resize
  ) ||
    /createWindowResizeBridge\(\s*geometryState: WindowGeometryState/.test(
      sources.resize
    ),
  "WindowResizeBridge bound to WindowGeometryState"
);

// ============================================================================
// 4. Ownership — bridges are not data owners of entity catalogs
// ============================================================================

const ownershipBanned = [
  "createWindowRegistry",
  "createDockRegistry",
  "createSeriesRegistry",
  "createContentRegistry",
  "createTabRegistry",
  "createTabRegistryStore",
  "createSeriesSelectionState",
  "createTabSelectionStore",
  "createWindowGeometryState",
];

for (const [id, code] of Object.entries({
  content: codes.content,
  seriesSelection: codes.seriesSelection,
  tabSelection: codes.tabSelection,
  floating: codes.floating,
  drag: codes.drag,
  resize: codes.resize,
  tabSeries: codes.tabSeries,
  windowSeries: codes.windowSeries,
  windowTabs: codes.windowTabs,
})) {
  const hits = ownershipBanned.filter((fn) =>
    new RegExp(`${fn}\\s*\\(`).test(code)
  );
  assertCase(
    `bridge.ownership.noFactory.${id}`,
    hits.length === 0,
    hits.length ? `forbidden calls: ${hits.join(", ")}` : "no catalog/store factories"
  );
}

assertCase(
  "bridge.ownership.content.noRegister",
  !/registry\.register|registry\.unregister/.test(codes.content),
  "ContentBridge does not mutate Registry"
);

assertCase(
  "bridge.ownership.host.noOwnership",
  !/createContent|register\(|unregister\(/.test(codes.contentHost),
  "ContentHost has no create/register ownership"
);

// ============================================================================
// 5. Product wiring freeze — page.tsx must not import library-only surfaces
// ============================================================================

const libraryOnlyImports: { id: string; pattern: RegExp }[] = [
  {
    id: "series",
    pattern: /from\s+["']@\/components\/windows\/series["']/,
  },
  {
    id: "tabs",
    pattern: /from\s+["']@\/components\/windows\/tabs["']/,
  },
  {
    id: "tab-ui",
    pattern: /from\s+["']@\/components\/windows\/tab-ui["']/,
  },
  {
    id: "content",
    pattern: /from\s+["']@\/components\/windows\/content["']/,
  },
  {
    id: "series-deep",
    pattern: /from\s+["']@\/components\/windows\/series\//,
  },
  {
    id: "tabs-deep",
    pattern: /from\s+["']@\/components\/windows\/tabs\//,
  },
  {
    id: "tab-ui-deep",
    pattern: /from\s+["']@\/components\/windows\/tab-ui\//,
  },
  {
    id: "content-deep",
    pattern: /from\s+["']@\/components\/windows\/content\//,
  },
];

for (const { id, pattern } of libraryOnlyImports) {
  assertCase(
    `bridge.productFreeze.page.no-${id}`,
    !pattern.test(pageCode),
    `page.tsx must not import windows/${id.replace(/-deep$/, "")} (D60–D63 library-only)`
  );
}

assertCase(
  "bridge.productFreeze.page.allowsWindowsBarrel",
  /from\s+["']@\/components\/windows["']/.test(pageCode) ||
    /WindowManager/.test(page),
  "page may use public windows barrel / WindowManager (product shell)"
);

// ============================================================================
// Summary
// ============================================================================

const pass = results.every((r) => r.pass);
const failed = results.filter((r) => !r.pass);

console.log(
  JSON.stringify(
    {
      phase: "production-boundaries",
      scope: "bridge-integrity",
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
    ? "\nPASS — production-boundaries (Bridge Integrity)"
    : `\nFAIL — production-boundaries (${failed.length} cases)`
);
process.exit(pass ? 0 : 1);
