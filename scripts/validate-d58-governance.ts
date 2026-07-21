/**
 * D58.4 — Window Resize System · governance gate.
 * Authority: D58.0 Discovery governance · D58.1–D58.3 certified paths.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const windowsDir = join(repoRoot, "src/components/windows");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const stripComments = (source: string): string =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/.*$/gm, " ");

const read = (file: string): string => {
  const full = join(windowsDir, file);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

const manager = stripComments(read("WindowManager.tsx"));
const floatingWindow = stripComments(read("FloatingWindow.tsx"));
const floatingLayer = stripComments(read("FloatingWindowLayer.tsx"));
const floatingBridge = stripComments(read("FloatingWindowBridge.tsx"));
const resizeBridge = stripComments(read("WindowResizeBridge.ts"));
const dragBridge = stripComments(read("WindowDragBridge.ts"));
const geometryState = stripComments(read("WindowGeometryState.ts"));
const handle = stripComments(read("FloatingWindowResizeHandle.tsx"));
const constraints = stripComments(read("WindowGeometryConstraints.ts"));

assertCase(
  "d58.gov.singleGeometryAuthority",
  /createWindowGeometryState/.test(manager) &&
    /WindowGeometryProvider/.test(manager) &&
    /export type WindowGeometryState\s*=/.test(geometryState) &&
    !/geometryState\.set/.test(floatingWindow) &&
    !/geometryState\.set/.test(handle),
  "single-geometry-authority: Manager hosts GeometryState; UI does not write"
);

assertCase(
  "d58.gov.geometryImmutableInput",
  /export function cloneGeometry/.test(read("WindowGeometryState.ts")) &&
    /cloneGeometry\(/.test(resizeBridge) &&
    /return \{\s*x,\s*y,\s*width,\s*height\s*\}/.test(constraints) &&
    /cloneGeometry\(geometry\)/.test(stripComments(read("WindowGeometryState.ts"))),
  "geometry-immutable-input: clones / new objects on write paths"
);

assertCase(
  "d58.gov.resizeBridgeRequired",
  /\bbeginResize\b/.test(floatingWindow) &&
    /\bupdateResize\b/.test(floatingWindow) &&
    /\bendResize\b/.test(floatingWindow) &&
    /geometryState\.set/.test(resizeBridge) &&
    !/createWindowGeometryState/.test(floatingWindow),
  "resize-bridge-required: size mutations via ResizeBridge only"
);

assertCase(
  "d58.gov.dragBridgeRequired",
  /\bbeginDrag\b/.test(floatingWindow) &&
    /\bupdateDrag\b/.test(floatingWindow) &&
    /\bendDrag\b/.test(floatingWindow) &&
    /geometryState\.set/.test(dragBridge),
  "drag-bridge-required: moves via DragBridge only"
);

assertCase(
  "d58.gov.bridgeOwnsPointerTranslation",
  /useWindowResize/.test(floatingWindow) &&
    /setPointerCapture/.test(floatingWindow) &&
    /FloatingWindowResizeHandle/.test(floatingWindow) &&
    !/computeResizedGeometry/.test(handle) &&
    !/applyConstraintPipeline/.test(handle),
  "bridge-owns-pointer-translation: handles presentational; math in bridge"
);

assertCase(
  "d58.gov.noDuplicatedResizeMath",
  /computeResizedGeometry/.test(resizeBridge) &&
    !/computeResizedGeometry/.test(floatingWindow) &&
    !/computeResizedGeometry/.test(handle) &&
    !/applyConstraintPipeline/.test(floatingWindow),
  "no-duplicated-resize-math: edge+constraints math only in bridge/constraints modules"
);

assertCase(
  "d58.gov.noFloatingToManager",
  !/from\s+["']\.\/WindowManager["']/.test(floatingWindow) &&
    !/\bWindowManager\b/.test(floatingWindow) &&
    !/\buseWindowContext\s*\(/.test(floatingWindow),
  "no-floating-to-manager"
);

assertCase(
  "d58.gov.renderWithoutLogic",
  !/\b(useState|useEffect|useWindowDrag|useWindowResize|useWindowGeometry|useWindowContext)\s*\(/.test(
    floatingLayer
  ),
  "render-without-logic: Layer has no hooks"
);

assertCase(
  "d58.gov.noDomGeometry",
  !/\.style\.(left|top|width|height|transform)\s*=/.test(floatingWindow) &&
    !/getBoundingClientRect/.test(floatingWindow + resizeBridge + handle) &&
    !/setAttribute\s*\(\s*["']style["']/.test(floatingWindow),
  "no-dom-geometry: React props only; no getBoundingClientRect"
);

assertCase(
  "d58.gov.handlesOnly",
  /data-floating-window-edge-handle/.test(handle) &&
    !/<section[^>]*\sonPointer/i.test(floatingWindow) &&
    /\bbeginResize\b/.test(floatingWindow),
  "handles-only: resize pointers on edge handles; not content section"
);

assertCase(
  "d58.gov.bridgeMapsGeometry",
  /\buseWindowGeometry\s*\(/.test(floatingBridge) &&
    /geometryState\.getAll/.test(floatingBridge),
  "FloatingBridge maps GeometryState → models"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d58-governance",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d58-governance"
    : `\nFAIL — d58-governance (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
