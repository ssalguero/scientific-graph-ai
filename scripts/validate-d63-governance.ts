/**
 * D63.9 — Lifecycle + Tab ↔ Series Wiring · governance gate.
 * Authority: docs/D63.0-content-lifecycle-discovery.md · Hard Rules + Governance Freeze.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const contentDir = join(repoRoot, "src/components/windows/content");
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

assertCase(
  "d63.gov.contentDirExists",
  existsSync(contentDir),
  existsSync(contentDir) ? "content/ exists" : "content/ missing"
);

const contentFiles = listTs(contentDir);

assertCase(
  "d63.gov.onlyHostTsx",
  contentFiles.filter((f) => f.endsWith(".tsx")).every((f) => f === "ContentHost.tsx") &&
    contentFiles.includes("ContentHost.tsx"),
  "React frontier = ContentHost.tsx only"
);

const sources = contentFiles.map((file) => ({
  file,
  raw: readFileSync(join(contentDir, file), "utf8"),
  code: stripComments(readFileSync(join(contentDir, file), "utf8")),
}));

const pureSources = sources.filter((s) => s.file !== "ContentHost.tsx");
const pureRaw = pureSources.map((s) => s.raw).join("\n");
const pureCode = pureSources.map((s) => s.code).join("\n");
const allRaw = sources.map((s) => s.raw).join("\n");
const allCode = sources.map((s) => s.code).join("\n");

assertCase(
  "d63.gov.pure.noReact",
  !/\bfrom\s+["']react["']/.test(pureRaw) &&
    !/\bfrom\s+["']react\//.test(pureRaw) &&
    !/\bReact\b/.test(pureCode) &&
    !/\bReactNode\b/.test(pureCode),
  "pure content/** No React / ReactNode (Host excluded)"
);

assertCase(
  "d63.gov.pure.noJsx",
  !/<\/[A-Z]/.test(pureCode) &&
    !/React\.createElement/.test(pureCode) &&
    !/<[A-Z][A-Za-z0-9]*\s+[A-Za-z]/.test(pureCode) &&
    !/<[A-Z][A-Za-z0-9]*\s*\/>/.test(pureCode),
  "pure content/** No JSX"
);

assertCase(
  "d63.gov.noHooks",
  !/\buse(State|Effect|Ref|Memo|Callback|Context|Reducer|Id|SyncExternalStore)\s*\(/.test(
    allCode
  ),
  "content/** No hooks"
);

assertCase(
  "d63.gov.noContext",
  !/\bcreateContext\b/.test(allCode) &&
    !/\buseContext\b/.test(allCode) &&
    !/\bProvider\b/.test(allCode),
  "content/** No Context / Provider"
);

assertCase(
  "d63.gov.noCssTailwind",
  !/\.css["']/.test(allRaw) &&
    !/\bclassName\b/.test(allCode) &&
    !/\btailwind\b/i.test(allCode),
  "content/** No CSS / Tailwind / className"
);

assertCase(
  "d63.gov.noPageImport",
  !/from\s+["'][^"']*page["']/.test(allRaw) &&
    !/from\s+["'][^"']*app\/.*page/.test(allRaw),
  "content/** No page.tsx imports"
);

assertCase(
  "d63.gov.noWorkspaceImport",
  !/from\s+["'][^"']*components\/workspace/.test(allRaw) &&
    !/from\s+["'][^"']*\/workspace["']/.test(allRaw) &&
    !/from\s+["'][^"']*\/workspace\//.test(allRaw),
  "content/** No workspace/ imports"
);

assertCase(
  "d63.gov.noWindowManager",
  !/\bWindowManager\b/.test(allCode) &&
    !/\bWindowDefinition\b/.test(allCode) &&
    !/\bWindowState\b/.test(allCode),
  "content/** No WindowManager / WindowDefinition / WindowState"
);

const BANNED_WORDS: { id: string; pattern: RegExp; label: string }[] = [
  { id: "graph", pattern: /\bgraph\b/i, label: "graph" },
  { id: "chart", pattern: /\bchart\b/i, label: "chart" },
  { id: "dataset", pattern: /\bdataset\b/i, label: "dataset" },
  { id: "analysis", pattern: /\banalysis\b/i, label: "analysis" },
  { id: "heatmap", pattern: /\bheatmap\b/i, label: "heatmap" },
  { id: "pca", pattern: /\bpca\b/i, label: "pca" },
  { id: "histogram", pattern: /\bhistogram\b/i, label: "histogram" },
  { id: "scientific", pattern: /\bscientific\b/i, label: "scientific" },
];

for (const ban of BANNED_WORDS) {
  assertCase(
    `d63.gov.no-${ban.id}`,
    !ban.pattern.test(allCode),
    ban.pattern.test(allCode) ? `${ban.label} found` : `no ${ban.label}`
  );
}

/* HR-no-content-cache — Bridge always calls registry.get */
const bridgeFile = sources.find((s) => s.file === "ContentBridge.ts");
assertCase(
  "d63.gov.hr.noContentCache",
  bridgeFile !== undefined &&
    /registry\.get\s*\(\s*handle\.contentId\s*\)/.test(bridgeFile.code) &&
    !/\bnew Map\b/.test(bridgeFile.code) &&
    !/\bcache\b/i.test(bridgeFile.code),
  "ContentBridge.resolve → Registry.get · no cache Map"
);

/* HR-host-no-ownership — Host must not call register/unregister/createContentRegistry */
const hostFile = sources.find((s) => s.file === "ContentHost.tsx");
assertCase(
  "d63.gov.hr.hostNoOwnership",
  hostFile !== undefined &&
    !/\.register\s*\(/.test(hostFile.code) &&
    !/\.unregister\s*\(/.test(hostFile.code) &&
    !/\bcreateContentRegistry\b/.test(hostFile.code) &&
    !/\bcreateContentBridge\b/.test(hostFile.code),
  "ContentHost does not register/resolve/mutate Registry"
);

/* HR-tab-series-mapping-only — no Selection / Activation / Focus writes */
const tabSeriesFile = sources.find((s) => s.file === "TabSeriesBridge.ts");
assertCase(
  "d63.gov.hr.tabSeriesMappingOnly",
  tabSeriesFile !== undefined &&
    !/\bSeriesSelection\b/.test(tabSeriesFile.code) &&
    !/\bTabSelection\b/.test(tabSeriesFile.code) &&
    !/\bWindowSelection\b/.test(tabSeriesFile.code) &&
    !/\bActivation\b/.test(tabSeriesFile.code) &&
    !/\bFocus\b/.test(tabSeriesFile.code) &&
    !/\.select\s*\(/.test(tabSeriesFile.code) &&
    !/\.activate\s*\(/.test(tabSeriesFile.code) &&
    !/\.focus\s*\(/.test(tabSeriesFile.code),
  "TabSeriesBridge mapping-only · no Selection/Activation/Focus"
);

/* TabId / SeriesId via barrels only */
assertCase(
  "d63.gov.tabSeries.barrelImports",
  tabSeriesFile !== undefined &&
    /from\s+["']\.\.\/tabs["']/.test(tabSeriesFile.raw) &&
    /from\s+["']\.\.\/series["']/.test(tabSeriesFile.raw) &&
    !/from\s+["']\.\.\/tabs\//.test(tabSeriesFile.raw) &&
    !/from\s+["']\.\.\/series\//.test(tabSeriesFile.raw),
  "TabSeriesBridge consumes TabId/SeriesId via barrels"
);

/* OpaqueContentHandle via tabs barrel */
const bridgeAndIntegration = sources.filter(
  (s) => s.file === "ContentBridge.ts" || s.file === "ContentIntegration.ts"
);
assertCase(
  "d63.gov.handle.tabsBarrel",
  bridgeAndIntegration.every(
    (s) =>
      /from\s+["']\.\.\/tabs["']/.test(s.raw) &&
      !/from\s+["']\.\.\/tabs\//.test(s.raw)
  ),
  "OpaqueContentHandle via tabs barrel only"
);

/* Registry decoupled — no TabId in ContentRegistry */
const registryFile = sources.find((s) => s.file === "ContentRegistry.ts");
assertCase(
  "d63.gov.hr.registryDecoupled",
  registryFile !== undefined &&
    !/\bTabId\b/.test(registryFile.code) &&
    !/\bTabRegistry\b/.test(registryFile.code) &&
    !/\bSeriesRegistry\b/.test(registryFile.code) &&
    !/from\s+["']\.\.\/tabs/.test(registryFile.raw) &&
    !/from\s+["']\.\.\/series/.test(registryFile.raw),
  "ContentRegistry ≠ TabRegistry · no tabs/series deps"
);

/* WindowTypes untouched regarding content */
const windowTypes = existsSync(windowTypesPath)
  ? readFileSync(windowTypesPath, "utf8")
  : "";

assertCase(
  "d63.gov.noContentOnWindowTypes",
  /export interface WindowDefinition\b/.test(windowTypes) &&
    !/\bContentDefinition\b/.test(windowTypes) &&
    !/\bcontentId\b/.test(windowTypes),
  "No Content fields on WindowDefinition/WindowState"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d63-governance",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d63-governance"
    : `\nFAIL — d63-governance (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
