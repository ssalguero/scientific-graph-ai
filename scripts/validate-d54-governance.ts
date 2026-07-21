/**
 * D54.4 — Layout Engine governance gate (governance.layout.*).
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const engineDir = join(repoRoot, "src/components/layout-engine");
const dockingDir = join(repoRoot, "src/components/docking");
const workspaceLayoutPath = join(
  repoRoot,
  "src/components/workspace/WorkspaceLayout.tsx"
);
const pagePath = join(repoRoot, "src/app/page.tsx");

const CONSUMER_PATHS = [
  join(repoRoot, "src/components/docking"),
  join(repoRoot, "src/components/ui/sidebar"),
  join(repoRoot, "src/components/inspector"),
  join(repoRoot, "src/components/toolbar"),
] as const;

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const readEngine = (file: string): string => {
  const full = join(engineDir, file);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

const readDirSources = (dir: string): string => {
  if (!existsSync(dir)) {
    return "";
  }
  return readdirSync(dir)
    .filter((name) => /\.(ts|tsx)$/.test(name) && !name.startsWith("."))
    .map((name) => readFileSync(join(dir, name), "utf8"))
    .join("\n");
};

const engineFiles = existsSync(engineDir)
  ? readdirSync(engineDir).filter((name) => !name.startsWith("."))
  : [];
const allEngineSources = engineFiles.map((name) => readEngine(name)).join("\n");
const barrelSource = readEngine("index.ts");
const engineSource = readEngine("LayoutEngine.ts");
const treeSource = readEngine("LayoutTree.ts");
const typesSource = readEngine("types.ts");
const pageSource = existsSync(pagePath) ? readFileSync(pagePath, "utf8") : "";
const workspaceLayoutSource = existsSync(workspaceLayoutPath)
  ? readFileSync(workspaceLayoutPath, "utf8")
  : "";
const dockingSources = readDirSources(dockingDir);
const dockingTypes = existsSync(join(dockingDir, "types.ts"))
  ? readFileSync(join(dockingDir, "types.ts"), "utf8")
  : "";
const dockingLayout = existsSync(join(dockingDir, "dockLayout.ts"))
  ? readFileSync(join(dockingDir, "dockLayout.ts"), "utf8")
  : "";
const dockingBarrel = existsSync(join(dockingDir, "index.ts"))
  ? readFileSync(join(dockingDir, "index.ts"), "utf8")
  : "";

/** layout.noReactState */
assertCase(
  "d54.gov.noReactState",
  !/\buseState\b/.test(allEngineSources) &&
    !/\buseReducer\b/.test(allEngineSources) &&
    !/\bcreateContext\b/.test(allEngineSources) &&
    !/\bProvider\b/.test(allEngineSources),
  "layout.noReactState"
);

/** layout.noHooks */
assertCase(
  "d54.gov.noHooks",
  !/\buse(State|Effect|Memo|Callback|Context|Ref|Reducer|LayoutEffect)\b/.test(
    allEngineSources
  ) && !/\bfrom\s+["']react["']/.test(allEngineSources),
  "layout.noHooks"
);

/** layout.noDom */
assertCase(
  "d54.gov.noDom",
  !/\bdocument\b/.test(allEngineSources) &&
    !/\bwindow\b/.test(allEngineSources) &&
    !/\bHTMLElement\b/.test(allEngineSources) &&
    !/\bgetBoundingClientRect\b/.test(allEngineSources),
  "layout.noDom"
);

/** layout.treeImmutable */
assertCase(
  "d54.gov.treeImmutable",
  /Never mutates the input/.test(treeSource) &&
    /normalizeLayoutTree/.test(treeSource) &&
    /mapRecord\(tree\.nodes/.test(treeSource) &&
    !/tree\.nodes\[[^\]]+\]\s*=/.test(treeSource) &&
    !/tree\.rootId\s*=/.test(treeSource),
  "layout.treeImmutable"
);

/** layout.allowedImportsOnly — only relative / type-only local imports */
const importLines = allEngineSources.match(
  /^\s*import\s+.+from\s+["'][^"']+["']/gm
) ?? [];
const disallowedImports = importLines.filter((line) => {
  const match = line.match(/from\s+["']([^"']+)["']/);
  if (!match) {
    return false;
  }
  const spec = match[1];
  if (spec.startsWith("./") || spec.startsWith("../")) {
    return false;
  }
  return true;
});

assertCase(
  "d54.gov.allowedImportsOnly",
  disallowedImports.length === 0 &&
    !/@\/components\/(docking|inspector|toolbar|ui\/sidebar)/.test(
      allEngineSources
    ) &&
    !/@\/lib\/ui\/tokens/.test(allEngineSources) &&
    !/@\/app\/page/.test(allEngineSources),
  disallowedImports.length
    ? `disallowed: ${disallowedImports.slice(0, 5).join(" | ")}`
    : "layout.allowedImportsOnly"
);

/** layout.apiFrozen — nine symbols present */
assertCase(
  "d54.gov.apiFrozen",
  /export type LayoutNode\b/.test(typesSource) &&
    /export type LayoutTree\b/.test(typesSource) &&
    /export type LayoutConstraints\b/.test(typesSource) &&
    /export type LayoutNodeType\b/.test(typesSource) &&
    /export type LayoutNodeId\b/.test(typesSource) &&
    /export type LayoutEngineProps\b/.test(typesSource) &&
    /export const LayoutEngine/.test(engineSource) &&
    /LayoutRegion/.test(barrelSource) &&
    /LayoutVisibility/.test(barrelSource),
  "layout.apiFrozen"
);

/** layout.enginePure */
assertCase(
  "d54.gov.enginePure",
  /export const LayoutEngine/.test(engineSource) &&
    !/\bfetch\s*\(/.test(engineSource) &&
    !/\bsetTimeout\b/.test(engineSource) &&
    !/\bsetInterval\b/.test(engineSource) &&
    !/\blocalStorage\b/.test(engineSource) &&
    !/\bfrom\s+["']node:/.test(engineSource) &&
    !/\bfrom\s+["']fs["']/.test(engineSource),
  "layout.enginePure"
);

/** layout.noScientificImports */
const FORBIDDEN_IMPORT_PATHS = [
  /@\/app\/page/,
  /@\/lib\/scientific/,
  /@\/lib\/graph/,
  /@\/components\/graph/,
  /@\/components\/analysis/,
  /from\s+["'][^"']*scientific[^"']*["']/,
  /from\s+["'][^"']*\/graph[^"']*["']/,
  /from\s+["'][^"']*analysis[^"']*["']/,
  /from\s+["'][^"']*statistics[^"']*["']/,
  /from\s+["'][^"']*\/math[^"']*["']/,
  /from\s+["'][^"']*export[^"']*["']/,
  /supabase/i,
];

const forbiddenHits: string[] = [];
for (const pattern of FORBIDDEN_IMPORT_PATHS) {
  if (pattern.test(allEngineSources)) {
    forbiddenHits.push(String(pattern));
  }
}

assertCase(
  "d54.gov.noScientificImports",
  forbiddenHits.length === 0,
  forbiddenHits.length ? forbiddenHits.join(",") : "layout.noScientificImports"
);

/** layout.barrelFrozen */
assertCase(
  "d54.gov.barrelFrozen",
  /export\s*\{\s*LayoutEngine\s*\}/.test(barrelSource) &&
    /LayoutNode/.test(barrelSource) &&
    /LayoutTree/.test(barrelSource) &&
    /LayoutEngineProps/.test(barrelSource) &&
    !/\bcreateDefaultLayoutTree\b/.test(barrelSource) &&
    !/\bnormalizeLayoutTree\b/.test(barrelSource) &&
    !/\bLayoutUtils\b/.test(barrelSource),
  "layout.barrelFrozen"
);

/** Wiring C — consumers must not import layout-engine */
const consumerHits: string[] = [];
for (const dir of CONSUMER_PATHS) {
  const sources = readDirSources(dir);
  if (
    /@\/components\/layout-engine/.test(sources) ||
    /from\s+["'][^"']*layout-engine[^"']*["']/.test(sources)
  ) {
    consumerHits.push(dir.replace(repoRoot, "").replace(/\\/g, "/"));
  }
}

assertCase(
  "d54.gov.wiringMinimal",
  consumerHits.length === 0 &&
    !/from\s+["']@\/components\/layout-engine["']/.test(pageSource) &&
    /from\s+["']@\/components\/layout-engine["']/.test(workspaceLayoutSource),
  consumerHits.length
    ? `unexpected consumers: ${consumerHits.join(",")}`
    : "WorkspaceLayout only (Wiring C)"
);

/** DockLayoutDefinition A — coexistence */
assertCase(
  "d54.gov.dockLayoutCoexist",
  /DockLayoutDefinition/.test(dockingTypes) &&
    /DEFAULT_DOCK_LAYOUT/.test(dockingLayout) &&
    /DEFAULT_DOCK_LAYOUT/.test(dockingBarrel) &&
    !/DockLayoutDefinition/.test(allEngineSources) &&
    !/DEFAULT_DOCK_LAYOUT/.test(allEngineSources) &&
    !/panelIds/.test(allEngineSources),
  "DockLayoutDefinition coexists; engine does not own dock slots"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d54-governance",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d54-governance"
    : `\nFAIL — d54-governance (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
