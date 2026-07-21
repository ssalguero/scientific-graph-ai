/**
 * D59.4 — Snap Foundation · Snap API Freeze gate.
 * Authority: D59.0 Discovery · D59.1–D59.3 builds · D55/D56 public APIs intact.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const windowsDir = join(repoRoot, "src/components/windows");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const read = (file: string): string => {
  const full = join(windowsDir, file);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

const REQUIRED_FILES = [
  "WindowSnapTypes.ts",
  "WindowSnapEngine.ts",
  "WindowSnapTargetProviders.ts",
  "WindowDragBridge.ts",
  "WindowResizeBridge.ts",
] as const;

for (const file of REQUIRED_FILES) {
  assertCase(
    `d59.api.file.${file}`,
    existsSync(join(windowsDir, file)),
    existsSync(join(windowsDir, file)) ? "exists" : "missing"
  );
}

const typesSource = read("WindowSnapTypes.ts");
const engineSource = read("WindowSnapEngine.ts");
const windowApiSource = read("WindowTypes.ts");
const floatingTypes = read("FloatingWindowTypes.ts");
const barrelSource = read("index.ts");
const dragSource = read("WindowDragBridge.ts");
const resizeSource = read("WindowResizeBridge.ts");

assertCase(
  "d59.api.snapConfig",
  /export type SnapConfig\s*=/.test(typesSource) &&
    /threshold:\s*number/.test(typesSource) &&
    /axisThresholdX:\s*number/.test(typesSource) &&
    /axisThresholdY:\s*number/.test(typesSource) &&
    /enabled:\s*boolean/.test(typesSource) &&
    /createDefaultSnapConfig/.test(typesSource),
  "SnapConfig + createDefaultSnapConfig"
);

assertCase(
  "d59.api.snapTarget",
  /export type SnapTarget\s*=/.test(typesSource) &&
    /export type SnapAxis\s*=/.test(typesSource) &&
    /export type SnapEdge\s*=/.test(typesSource) &&
    /SNAP_PRIORITY/.test(typesSource),
  "SnapTarget + SnapAxis + SnapEdge + SNAP_PRIORITY"
);

assertCase(
  "d59.api.engineSurface",
  /export function applyMagneticSnap\s*\(/.test(engineSource) &&
    /export function toEdges\s*\(/.test(engineSource),
  "applyMagneticSnap + toEdges exported from Engine"
);

assertCase(
  "d59.api.windowApiIntact",
  /export interface WindowAPI\b/.test(windowApiSource) &&
    !/\bsnap\s*\(/.test(windowApiSource) &&
    !/\bsetSnap\s*\(/.test(windowApiSource) &&
    !/\benableSnap\s*\(/.test(windowApiSource) &&
    !/\bapplyMagneticSnap\s*\(/.test(windowApiSource),
  "WindowAPI D55 intact — no Snap* methods"
);

assertCase(
  "d59.api.floatingApisIntact",
  /export interface FloatingWindowModel\b/.test(floatingTypes) &&
    /export interface FloatingWindowProps\b/.test(floatingTypes) &&
    !/\bsnap\b/.test(floatingTypes) &&
    !/onSnap/.test(floatingTypes) &&
    !/snapGuide/.test(floatingTypes),
  "Floating APIs D56 intact — no snap fields/callbacks"
);

assertCase(
  "d59.api.dragTriadIntact",
  /beginDrag\(/.test(dragSource) &&
    /updateDrag\(/.test(dragSource) &&
    /endDrag\(/.test(dragSource) &&
    /export type WindowDragAPI\s*=/.test(dragSource),
  "Drag triad signatures present"
);

assertCase(
  "d59.api.resizeTriadIntact",
  /beginResize\(/.test(resizeSource) &&
    /updateResize\(/.test(resizeSource) &&
    /endResize\(/.test(resizeSource) &&
    /export type WindowResizeAPI\s*=/.test(resizeSource),
  "Resize triad signatures present"
);

const dragApiBody =
  dragSource.match(/export type WindowDragAPI\s*=\s*\{([\s\S]*?)\}/)?.[1] ?? "";
const resizeApiBody =
  resizeSource.match(/export type WindowResizeAPI\s*=\s*\{([\s\S]*?)\}/)?.[1] ??
  "";

assertCase(
  "d59.api.noSnapOnTriads",
  !/\bsnap\s*\(/.test(dragApiBody) &&
    !/\bsnap\s*\(/.test(resizeApiBody) &&
    !/\bbeginSnap\s*\(/.test(dragApiBody + resizeApiBody) &&
    !/\bapplyMagneticSnap\s*\(/.test(dragApiBody + resizeApiBody),
  "Drag/Resize API surfaces have no snap methods"
);

const SNAP_LEAKS = [
  "applyMagneticSnap",
  "toEdges",
  "SnapConfig",
  "SnapTarget",
  "SnapAxis",
  "SnapEdge",
  "SNAP_PRIORITY",
  "createDefaultSnapConfig",
  "SnapTargetProvider",
  "createWorkspaceSnapTargetProvider",
  "createWindowSnapTargetProvider",
  "WindowSnapEngine",
  "WindowSnapTypes",
] as const;

const barrelExportLines = barrelSource
  .split("\n")
  .filter((l) => /^\s*export\s/.test(l))
  .join("\n");

const leaked = SNAP_LEAKS.filter((name) =>
  new RegExp(`\\b${name}\\b`).test(barrelExportLines)
);

assertCase(
  "d59.api.noSnapBarrelLeak",
  leaked.length === 0,
  leaked.length ? `leaked: ${leaked.join(",")}` : "Snap* not barrel-exported"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d59-snap-api",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d59-snap-api"
    : `\nFAIL — d59-snap-api (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
