/**
 * D57.5 — Window Drag System · Drag API Freeze gate.
 * D58.1 — GeometryState supersession (x/y/width/height); D55/D56 public APIs intact.
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

const stripComments = (source: string): string =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/.*$/gm, " ");

const REQUIRED_FILES = [
  "WindowGeometryState.ts",
  "WindowDragBridge.ts",
  "WindowDragContext.tsx",
  "WindowGeometryContext.tsx",
] as const;

for (const file of REQUIRED_FILES) {
  assertCase(
    `d57.api.file.${file}`,
    existsSync(join(windowsDir, file)),
    existsSync(join(windowsDir, file)) ? "exists" : "missing"
  );
}

const geometrySource = read("WindowGeometryState.ts");
const dragSource = read("WindowDragBridge.ts");
const windowApiSource = read("WindowTypes.ts");
const floatingTypes = read("FloatingWindowTypes.ts");
const barrelSource = read("index.ts");

assertCase(
  "d57.api.windowGeometry",
  /export type WindowGeometry\s*=/.test(geometrySource) &&
    /x:\s*number/.test(geometrySource) &&
    /y:\s*number/.test(geometrySource) &&
    /width:\s*number/.test(geometrySource) &&
    /height:\s*number/.test(geometrySource),
  "WindowGeometry is { x, y, width, height }"
);

assertCase(
  "d57.api.geometryStateSurface",
  /export type WindowGeometryState\s*=/.test(geometrySource) &&
    /set\(/.test(geometrySource) &&
    /get\(/.test(geometrySource) &&
    /\bhas\(/.test(geometrySource) &&
    /delete\(/.test(geometrySource) &&
    /clear\(/.test(geometrySource) &&
    /getAll\(/.test(geometrySource) &&
    /subscribe\(/.test(geometrySource) &&
    /createWindowGeometryState/.test(geometrySource),
  "WindowGeometryState surface"
);

assertCase(
  "d57.api.windowDragState",
  /export type WindowDragState\s*=/.test(dragSource) &&
    /status:\s*"idle"/.test(dragSource) &&
    /status:\s*"dragging"/.test(dragSource),
  "WindowDragState idle | dragging"
);

assertCase(
  "d57.api.windowDragAPI",
  /export type WindowDragAPI\s*=/.test(dragSource) &&
    /beginDrag\(/.test(dragSource) &&
    /updateDrag\(/.test(dragSource) &&
    /endDrag\(/.test(dragSource) &&
    /createWindowDragBridge/.test(dragSource),
  "WindowDragAPI triad"
);

const dragApiBody =
  dragSource.match(/export type WindowDragAPI\s*=\s*\{([\s\S]*?)\}/)?.[1] ??
  "";
const forbiddenDragMethods = [
  "cancelDrag",
  "moveWindow",
  "setPosition",
  "animate",
  "inertia",
] as const;
const dragForbiddenHits = forbiddenDragMethods.filter((name) =>
  new RegExp(`\\b${name}\\s*\\(`).test(dragApiBody)
);

assertCase(
  "d57.api.noCreepMethods",
  dragForbiddenHits.length === 0,
  dragForbiddenHits.length
    ? `forbidden: ${dragForbiddenHits.join(",")}`
    : "no cancelDrag/moveWindow/setPosition/animate/inertia"
);

assertCase(
  "d57.api.windowApiIntact",
  /export interface WindowAPI\b/.test(windowApiSource) &&
    /create\(/.test(windowApiSource) &&
    /register\(/.test(windowApiSource) &&
    /unregister\(/.test(windowApiSource) &&
    /activate\(/.test(windowApiSource) &&
    /focus\(/.test(windowApiSource) &&
    /minimize\(/.test(windowApiSource) &&
    /restore\(/.test(windowApiSource) &&
    /close\(/.test(windowApiSource) &&
    /get\(/.test(windowApiSource) &&
    /getAll\(/.test(windowApiSource) &&
    !/\bmoveWindow\s*\(/.test(windowApiSource) &&
    !/\bsetPosition\s*\(/.test(windowApiSource) &&
    !/\bbeginDrag\s*\(/.test(windowApiSource),
  "WindowAPI D55 intact — no geometry/drag methods"
);

assertCase(
  "d57.api.floatingModelIntact",
  /export interface FloatingWindowModel\b/.test(floatingTypes) &&
    /export interface FloatingWindowProps\b/.test(floatingTypes) &&
    /export interface FloatingWindowLayerProps\b/.test(floatingTypes) &&
    /window:\s*FloatingWindowModel/.test(floatingTypes) &&
    /windows:\s*readonly FloatingWindowModel\[\]/.test(floatingTypes),
  "Floating APIs D56 intact"
);

const INTERNAL_LEAKS = [
  "createWindowGeometryState",
  "createWindowDragBridge",
  "createWindowResizeBridge",
  "useWindowDrag",
  "useWindowGeometry",
  "useWindowResize",
  "WindowGeometryState",
  "WindowDragAPI",
  "WindowDragProvider",
  "WindowGeometryProvider",
  "WindowResizeProvider",
] as const;

const leaked = INTERNAL_LEAKS.filter((name) => {
  return new RegExp(`\\b${name}\\b`).test(
    barrelSource
      .split("\n")
      .filter((l) => /^\s*export\s/.test(l))
      .join("\n")
  );
});

assertCase(
  "d57.api.noInternalBarrelLeak",
  leaked.length === 0,
  leaked.length ? `leaked: ${leaked.join(",")}` : "D57/D58 internals not barrel-exported"
);

assertCase(
  "d57.api.dragBridgeUsesGeometry",
  /geometryState\.set/.test(stripComments(dragSource)) &&
    /from\s+["']\.\/WindowGeometryState["']/.test(dragSource),
  "WindowDragBridge mutates via GeometryState only"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d57-drag-api",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d57-drag-api"
    : `\nFAIL — d57-drag-api (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
