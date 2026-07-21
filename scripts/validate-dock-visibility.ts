/**
 * D52.3 — Dock visibility structural gate.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const dockingDir = join(repoRoot, "src/components/docking");

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

const typesSource = read("types.ts");
const visibilityPath = join(dockingDir, "dockVisibility.ts");
const visibilitySource = read("dockVisibility.ts");
const stateBody = extractTypeBody(typesSource, "DockState");
const visibilityBody = extractTypeBody(typesSource, "DockVisibilityApi");

assertCase(
  "dock.visibility.moduleExists",
  existsSync(visibilityPath) && visibilitySource.length > 0,
  "dockVisibility.ts"
);

assertCase(
  "dock.visibility.apiShape",
  /show\s*\(/.test(visibilityBody) &&
    /hide\s*\(/.test(visibilityBody) &&
    /isVisible\s*\(/.test(visibilityBody),
  "DockVisibilityApi = show + hide + isVisible"
);

const domTypeHits = [
  "HTMLElement",
  "DOMRect",
  "document",
  "querySelector",
  "RefObject",
].filter(
  (token) =>
    new RegExp(`\\b${token}\\b`).test(visibilitySource) ||
    new RegExp(`\\b${token}\\b`).test(stateBody) ||
    new RegExp(`\\b${token}\\b`).test(visibilityBody)
);

assertCase(
  "dock.visibility.noDomTypes",
  domTypeHits.length === 0,
  domTypeHits.length ? domTypeHits.join(",") : "clean"
);

assertCase(
  "dock.visibility.noStyleApis",
  !/export\s+(const|function|type|class)\s+\w*(animation|transition|keyframes)/i.test(
    visibilitySource
  ) &&
    !/\bclassName\b/.test(visibilitySource) &&
    !/\bstyle\s*=/.test(visibilitySource),
  "no style/animation public APIs in visibility module"
);

assertCase(
  "dock.visibility.factoryExport",
  /export\s+function\s+createDockVisibilityApi\s*\(/.test(visibilitySource),
  "createDockVisibilityApi present"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "dock-visibility",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — dock-visibility"
    : `\nFAIL — dock-visibility (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
