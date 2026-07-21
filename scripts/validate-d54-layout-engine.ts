/**
 * D54.4 — Layout Engine foundation gate.
 * Existence, purity, tree, barrel, Workspace wiring (1C).
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const engineDir = join(repoRoot, "src/components/layout-engine");
const workspaceLayoutPath = join(
  repoRoot,
  "src/components/workspace/WorkspaceLayout.tsx"
);

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const read = (file: string): string => {
  const full = join(engineDir, file);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

const EXPECTED_FILES = [
  "LayoutEngine.ts",
  "LayoutTree.ts",
  "LayoutNode.ts",
  "LayoutConstraints.ts",
  "LayoutVisibility.ts",
  "LayoutRegions.ts",
  "LayoutUtils.ts",
  "types.ts",
  "index.ts",
] as const;

assertCase(
  "d54.engine.exists",
  existsSync(engineDir),
  "src/components/layout-engine/"
);

assertCase(
  "d54.engine.filesPresent",
  EXPECTED_FILES.every((name) => existsSync(join(engineDir, name))),
  EXPECTED_FILES.join(", ")
);

assertCase(
  "d54.engine.indexExists",
  existsSync(join(engineDir, "index.ts")),
  "index.ts"
);

assertCase(
  "d54.engine.layoutEngineExists",
  existsSync(join(engineDir, "LayoutEngine.ts")),
  "LayoutEngine.ts"
);

assertCase(
  "d54.engine.layoutTreeExists",
  existsSync(join(engineDir, "LayoutTree.ts")),
  "LayoutTree.ts"
);

const engineFiles = existsSync(engineDir)
  ? readdirSync(engineDir).filter((name) => !name.startsWith("."))
  : [];
const allSources = engineFiles.map((name) => read(name)).join("\n");
const barrelSource = read("index.ts");
const engineSource = read("LayoutEngine.ts");
const treeSource = read("LayoutTree.ts");
const workspaceLayoutSource = existsSync(workspaceLayoutPath)
  ? readFileSync(workspaceLayoutPath, "utf8")
  : "";

assertCase(
  "d54.engine.barrelCorrect",
  /export\s*\{\s*LayoutEngine\s*\}/.test(barrelSource) &&
    /export\s*\{\s*LayoutRegion\s*\}/.test(barrelSource) &&
    /export\s*\{\s*LayoutVisibility\s*\}/.test(barrelSource) &&
    /LayoutNode/.test(barrelSource) &&
    /LayoutTree/.test(barrelSource) &&
    /LayoutConstraints/.test(barrelSource) &&
    /LayoutNodeType/.test(barrelSource) &&
    /LayoutNodeId/.test(barrelSource) &&
    /LayoutEngineProps/.test(barrelSource),
  "barrel exports frozen surface"
);

assertCase(
  "d54.engine.noHooks",
  !/\buse(State|Effect|Memo|Callback|Context|Ref|Reducer|LayoutEffect)\b/.test(
    allSources
  ) && !/\bfrom\s+["']react["']/.test(allSources),
  "no React hooks / react imports"
);

assertCase(
  "d54.engine.noReactState",
  !/\buseState\b/.test(allSources) &&
    !/\buseReducer\b/.test(allSources) &&
    !/\bcreateContext\b/.test(allSources),
  "no React state / context"
);

assertCase(
  "d54.engine.noDom",
  !/\bdocument\b/.test(allSources) &&
    !/\bwindow\b/.test(allSources) &&
    !/\bHTMLElement\b/.test(allSources) &&
    !/\bgetBoundingClientRect\b/.test(allSources),
  "no DOM access"
);

assertCase(
  "d54.engine.noVisualDeps",
  !/\.css["']/.test(allSources) &&
    !/\bclassName\b/.test(allSources) &&
    !/@\/lib\/ui\/tokens/.test(allSources) &&
    !/\bstyle\s*=/.test(allSources) &&
    !/\btailwind\b/i.test(allSources),
  "no CSS / tokens / Tailwind deps"
);

assertCase(
  "d54.engine.treePure",
  /export const LayoutEngine/.test(engineSource) &&
    /\bresolve\b/.test(engineSource) &&
    /normalizeLayoutTree/.test(engineSource) &&
    !/\bfetch\s*\(/.test(engineSource) &&
    !/\bsetTimeout\b/.test(engineSource) &&
    !/\blocalStorage\b/.test(engineSource) &&
    /Never mutates the input/.test(treeSource),
  "resolve path pure · immutable normalize"
);

assertCase(
  "d54.engine.workspaceUsesEngine",
  /from\s+["']@\/components\/layout-engine["']/.test(workspaceLayoutSource) &&
    /LayoutEngine\.resolveFromProps/.test(workspaceLayoutSource),
  "WorkspaceLayout consumes public LayoutEngine API"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d54-layout-engine",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d54-layout-engine"
    : `\nFAIL — d54-layout-engine (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
