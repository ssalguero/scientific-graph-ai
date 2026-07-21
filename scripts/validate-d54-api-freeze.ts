/**
 * D54.4 — Layout Engine API Freeze gate (D54 → D56).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const engineDir = join(repoRoot, "src/components/layout-engine");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const read = (file: string): string => {
  const full = join(engineDir, file);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

const typesSource = read("types.ts");
const regionsSource = read("LayoutRegions.ts");
const visibilitySource = read("LayoutVisibility.ts");
const engineSource = read("LayoutEngine.ts");
const barrelSource = read("index.ts");

assertCase(
  "d54.api.layoutNode",
  /export type LayoutNode\s*=/.test(typesSource) &&
    /id:\s*LayoutNodeId/.test(typesSource) &&
    /type:\s*LayoutNodeType/.test(typesSource) &&
    /parent:\s*LayoutNodeId\s*\|\s*null/.test(typesSource) &&
    /children:\s*LayoutNodeId\[\]/.test(typesSource) &&
    /visibility:\s*LayoutVisibility/.test(typesSource) &&
    /constraints:\s*LayoutConstraints/.test(typesSource) &&
    /region:\s*LayoutRegion/.test(typesSource) &&
    /size:\s*\{/.test(typesSource),
  "LayoutNode shape"
);

assertCase(
  "d54.api.layoutTree",
  /export type LayoutTree\s*=/.test(typesSource) &&
    /rootId:\s*LayoutNodeId/.test(typesSource) &&
    /nodes:\s*Record<LayoutNodeId,\s*LayoutNode>/.test(typesSource),
  "LayoutTree shape"
);

assertCase(
  "d54.api.layoutRegion",
  /LEFT/.test(regionsSource) &&
    /RIGHT/.test(regionsSource) &&
    /TOP/.test(regionsSource) &&
    /BOTTOM/.test(regionsSource) &&
    /CENTER/.test(regionsSource) &&
    /FLOATING/.test(regionsSource) &&
    /export const LayoutRegion/.test(regionsSource),
  "LayoutRegion values"
);

assertCase(
  "d54.api.layoutVisibility",
  /VISIBLE/.test(visibilitySource) &&
    /HIDDEN/.test(visibilitySource) &&
    /COLLAPSED/.test(visibilitySource) &&
    /export const LayoutVisibility/.test(visibilitySource),
  "LayoutVisibility values"
);

assertCase(
  "d54.api.layoutConstraints",
  /export type LayoutConstraints\s*=/.test(typesSource) &&
    /minWidth\?:/.test(typesSource) &&
    /maxWidth\?:/.test(typesSource) &&
    /minHeight\?:/.test(typesSource) &&
    /maxHeight\?:/.test(typesSource) &&
    /collapsed:\s*boolean/.test(typesSource) &&
    /locked:\s*boolean/.test(typesSource),
  "LayoutConstraints shape"
);

assertCase(
  "d54.api.layoutNodeType",
  /export type LayoutNodeType\s*=/.test(typesSource) &&
    /"ROOT"/.test(typesSource) &&
    /"SIDEBAR"/.test(typesSource) &&
    /"WORKSPACE"/.test(typesSource) &&
    /"TOOLBAR"/.test(typesSource) &&
    /"DOCK"/.test(typesSource) &&
    /"INSPECTOR"/.test(typesSource) &&
    /"FLOATING_LAYERS"/.test(typesSource) &&
    /"OVERLAYS"/.test(typesSource),
  "LayoutNodeType union"
);

assertCase(
  "d54.api.layoutNodeId",
  /export type LayoutNodeId\s*=\s*string/.test(typesSource),
  "LayoutNodeId"
);

assertCase(
  "d54.api.layoutEngine",
  /export const LayoutEngine/.test(engineSource) &&
    /\bresolve\b/.test(engineSource) &&
    /\bgetNode\b/.test(engineSource) &&
    /\bgetChildren\b/.test(engineSource) &&
    /\bvalidateRegion\b/.test(engineSource) &&
    /\bvalidateConstraints\b/.test(engineSource),
  "LayoutEngine operations"
);

assertCase(
  "d54.api.layoutEngineProps",
  /export type LayoutEngineProps\s*=/.test(typesSource) &&
    /tree\?:/.test(typesSource),
  "LayoutEngineProps"
);

assertCase(
  "d54.api.barrel",
  /LayoutEngine/.test(barrelSource) &&
    /LayoutRegion/.test(barrelSource) &&
    /LayoutVisibility/.test(barrelSource) &&
    /LayoutNode/.test(barrelSource) &&
    /LayoutTree/.test(barrelSource) &&
    /LayoutConstraints/.test(barrelSource) &&
    /LayoutNodeType/.test(barrelSource) &&
    /LayoutNodeId/.test(barrelSource) &&
    /LayoutEngineProps/.test(barrelSource),
  "barrel exports freeze symbols"
);

/** Detect unexpected value exports from the public barrel. */
const FORBIDDEN_BARREL_VALUE_EXPORTS = [
  "createDefaultLayoutTree",
  "normalizeLayoutTree",
  "validateLayoutTree",
  "createLayoutNode",
  "normalizeLayoutNode",
  "LayoutUtils",
  "DEFAULT_LAYOUT_NODE_IDS",
  "isLayoutRegion",
  "isLayoutVisibility",
  "createDefaultConstraints",
];

const forbiddenValueHits = FORBIDDEN_BARREL_VALUE_EXPORTS.filter((name) =>
  new RegExp(`\\b${name}\\b`).test(barrelSource)
);

assertCase(
  "d54.api.noExtraPublicExports",
  forbiddenValueHits.length === 0,
  forbiddenValueHits.length
    ? `extra: ${forbiddenValueHits.join(",")}`
    : "no internal helpers in barrel"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d54-api-freeze",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d54-api-freeze"
    : `\nFAIL — d54-api-freeze (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
