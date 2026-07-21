/**
 * D58.4 — Window Resize System · Resize API Freeze gate.
 * Authority: D58.0 Discovery · D58.1–D58.3 builds · D55/D56/D57 public APIs intact.
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
  "WindowResizeBridge.ts",
  "WindowGeometryConstraints.ts",
  "WindowResizeContext.tsx",
  "FloatingWindowResizeHandle.tsx",
] as const;

for (const file of REQUIRED_FILES) {
  assertCase(
    `d58.api.file.${file}`,
    existsSync(join(windowsDir, file)),
    existsSync(join(windowsDir, file)) ? "exists" : "missing"
  );
}

const geometrySource = read("WindowGeometryState.ts");
const resizeSource = read("WindowResizeBridge.ts");
const constraintsSource = read("WindowGeometryConstraints.ts");
const windowApiSource = read("WindowTypes.ts");
const floatingTypes = read("FloatingWindowTypes.ts");
const barrelSource = read("index.ts");
const dragSource = read("WindowDragBridge.ts");

assertCase(
  "d58.api.geometryState",
  /export type WindowGeometry\s*=/.test(geometrySource) &&
    /export type WindowGeometryState\s*=/.test(geometrySource) &&
    /createWindowGeometryState/.test(geometrySource) &&
    /width:\s*number/.test(geometrySource) &&
    /height:\s*number/.test(geometrySource),
  "GeometryState + WindowGeometry { x,y,width,height }"
);

assertCase(
  "d58.api.resizeBridge",
  /export type WindowResizeAPI\s*=/.test(resizeSource) &&
    /beginResize\(/.test(resizeSource) &&
    /updateResize\(/.test(resizeSource) &&
    /endResize\(/.test(resizeSource) &&
    /createWindowResizeBridge/.test(resizeSource) &&
    /computeResizedGeometry/.test(resizeSource),
  "ResizeBridge triad + edge math"
);

assertCase(
  "d58.api.resizeSession",
  /export type WindowResizeState\s*=/.test(resizeSource) &&
    /status:\s*"idle"/.test(resizeSource) &&
    /status:\s*"resizing"/.test(resizeSource) &&
    /export type WindowResizeSession\s*=/.test(resizeSource),
  "ResizeSession idle | resizing"
);

assertCase(
  "d58.api.resizeOrigin",
  /export type WindowResizeOrigin\s*=/.test(resizeSource) &&
    /pointerX:\s*number/.test(resizeSource) &&
    /pointerY:\s*number/.test(resizeSource) &&
    /geometry:\s*WindowGeometry/.test(resizeSource),
  "WindowResizeOrigin { pointerX, pointerY, geometry }"
);

assertCase(
  "d58.api.constraints",
  /export type GeometryConstraints\s*=/.test(constraintsSource) &&
    /minWidth:\s*number/.test(constraintsSource) &&
    /minHeight:\s*number/.test(constraintsSource) &&
    /export type WorkspaceConstraints\s*=/.test(constraintsSource) &&
    /left:\s*number/.test(constraintsSource) &&
    /top:\s*number/.test(constraintsSource) &&
    /right:\s*number/.test(constraintsSource) &&
    /bottom:\s*number/.test(constraintsSource) &&
    /applyConstraintPipeline/.test(constraintsSource),
  "GeometryConstraints + WorkspaceConstraints + pipeline"
);

assertCase(
  "d58.api.windowApiIntact",
  /export interface WindowAPI\b/.test(windowApiSource) &&
    !/\bresizeWindow\s*\(/.test(windowApiSource) &&
    !/\bsetSize\s*\(/.test(windowApiSource) &&
    !/\bbeginResize\s*\(/.test(windowApiSource),
  "WindowAPI D55 intact — no resize methods"
);

assertCase(
  "d58.api.floatingApisIntact",
  /export interface FloatingWindowModel\b/.test(floatingTypes) &&
    /export interface FloatingWindowProps\b/.test(floatingTypes) &&
    /windows:\s*readonly FloatingWindowModel\[\]/.test(floatingTypes) &&
    !/onResize/.test(floatingTypes) &&
    !/beginResize/.test(floatingTypes),
  "Floating APIs D56 intact — no resize callbacks"
);

assertCase(
  "d58.api.dragBridgeIntact",
  /beginDrag\(/.test(dragSource) &&
    /updateDrag\(/.test(dragSource) &&
    /endDrag\(/.test(dragSource),
  "D57 DragBridge triad intact"
);

const resizeApiBody =
  resizeSource.match(/export type WindowResizeAPI\s*=\s*\{([\s\S]*?)\}/)?.[1] ??
  "";
assertCase(
  "d58.api.noCreepOnResizeAPI",
  !/\bcancelResize\s*\(/.test(resizeApiBody) &&
    !/\bsnap\s*\(/.test(resizeApiBody) &&
    !/\bdock\s*\(/.test(resizeApiBody),
  "ResizeAPI has no cancelResize/snap/dock creep on public triad surface"
);

const INTERNAL_LEAKS = [
  "createWindowGeometryState",
  "createWindowResizeBridge",
  "createWindowDragBridge",
  "useWindowResize",
  "useWindowGeometry",
  "useWindowDrag",
  "GeometryConstraints",
  "WorkspaceConstraints",
  "WindowResizeOrigin",
  "WindowGeometryState",
  "WindowResizeProvider",
  "applyConstraintPipeline",
  "computeResizedGeometry",
] as const;

const leaked = INTERNAL_LEAKS.filter((name) =>
  new RegExp(`\\b${name}\\b`).test(
    barrelSource
      .split("\n")
      .filter((l) => /^\s*export\s/.test(l))
      .join("\n")
  )
);

assertCase(
  "d58.api.noInternalBarrelLeak",
  leaked.length === 0,
  leaked.length ? `leaked: ${leaked.join(",")}` : "D58 internals not barrel-exported"
);

assertCase(
  "d58.api.resizeWritesGeometry",
  /geometryState\.set/.test(stripComments(resizeSource)) &&
    /applyConstraintPipeline/.test(stripComments(resizeSource)),
  "updateResize writes GeometryState via constraint pipeline"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d58-resize-api",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d58-resize-api"
    : `\nFAIL — d58-resize-api (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
