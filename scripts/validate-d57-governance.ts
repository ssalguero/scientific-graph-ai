/**
 * D57.5 — Window Drag System · governance gate.
 * D58.1 — GeometryState supersession; D57 TitleBar path retained.
 */
import { existsSync, readFileSync } from "node:fs";
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
const dragBridge = stripComments(read("WindowDragBridge.ts"));
const geometryState = stripComments(read("WindowGeometryState.ts"));
const floatingRaw = read("FloatingWindow.tsx");

assertCase(
  "d57.gov.managerOwnsGeometry",
  /createWindowGeometryState/.test(manager) &&
    /WindowGeometryProvider/.test(manager) &&
    /createWindowDragBridge/.test(manager),
  "manager-owns-position/geometry: Manager hosts GeometryState + Drag Bridge"
);

assertCase(
  "d57.gov.noLocalPosition",
  !/\buseState\s*\(/.test(floatingWindow) &&
    !/geometryState\.set/.test(floatingWindow) &&
    !/\.style\.(left|top)\s*=/.test(floatingWindow),
  "no-local-position: FloatingWindow has no local position state"
);

assertCase(
  "d57.gov.bridgeRequired",
  /\bbeginDrag\b/.test(floatingWindow) &&
    /\bupdateDrag\b/.test(floatingWindow) &&
    /\bendDrag\b/.test(floatingWindow) &&
    !/createWindowGeometryState/.test(floatingWindow) &&
    /geometryState\.set/.test(dragBridge),
  "bridge-required / drag-bridge-required: mutations via DragBridge → GeometryState"
);

assertCase(
  "d57.gov.singleCoordinateSpace",
  !/\bscroll\b/i.test(dragBridge + floatingWindow + floatingBridge) &&
    !/\bzoom\b/i.test(dragBridge + floatingWindow + floatingBridge) &&
    !/\bmatrix\b/i.test(dragBridge + floatingWindow + floatingBridge) &&
    !/getBoundingClientRect/.test(dragBridge + floatingWindow),
  "single-coordinate-space: no scroll/zoom/matrix transforms"
);

assertCase(
  "d57.gov.noDomPositioning",
  !/\.style\.(left|top|transform)\s*=/.test(floatingWindow) &&
    !/setAttribute\s*\(\s*["']style["']/.test(floatingWindow),
  "no-dom-positioning: React props only"
);

assertCase(
  "d57.gov.titleBarAndHandles",
  /data-floating-window-title/.test(floatingWindow) &&
    /onPointerDown/.test(floatingWindow) &&
    /setPointerCapture/.test(floatingWindow) &&
    /releasePointerCapture/.test(floatingWindow) &&
    /<header[\s\S]*onPointerDown[\s\S]*<\/header>/.test(floatingRaw) &&
    !/<section[^>]*\sonPointer/i.test(floatingWindow) &&
    /\bbeginResize\b/.test(floatingWindow),
  "title-bar drag + handles-only resize; content section has no pointers"
);

assertCase(
  "d57.gov.dragXorResize",
  /endResize\(\)/.test(manager) &&
    /endDrag\(\)/.test(manager) &&
    /WindowResizeProvider/.test(manager),
  "Manager enforces drag XOR resize via begin wrappers + ResizeProvider"
);

assertCase(
  "d57.gov.noFloatingToManager",
  !/from\s+["']\.\/WindowManager["']/.test(floatingWindow) &&
    !/\bWindowManager\b/.test(floatingWindow) &&
    !/\buseWindowContext\s*\(/.test(floatingWindow),
  "no-floating-to-manager: FloatingWindow decoupled from Manager/WindowContext"
);

assertCase(
  "d57.gov.renderWithoutLogic",
  !/\b(useState|useEffect|useWindowDrag|useWindowResize|useWindowPosition|useWindowGeometry|useWindowContext)\s*\(/.test(
    floatingLayer
  ) && /FloatingWindowLayerProps/.test(read("FloatingWindowLayer.tsx")),
  "render-without-logic: Layer is presentational only"
);

assertCase(
  "d57.gov.geometryAuthority",
  /export type WindowGeometry\s*=/.test(geometryState) &&
    /width:\s*number/.test(
      geometryState.match(/export type WindowGeometry\s*=\s*\{([^}]+)\}/)?.[1] ??
        ""
    ) &&
    /height:\s*number/.test(
      geometryState.match(/export type WindowGeometry\s*=\s*\{([^}]+)\}/)?.[1] ??
        ""
    ),
  "single-geometry-authority: WindowGeometry owns x/y/width/height"
);

assertCase(
  "d57.gov.floatingApisUnchanged",
  /export interface FloatingWindowModel\b/.test(read("FloatingWindowTypes.ts")) &&
    /export interface FloatingWindowProps\b/.test(read("FloatingWindowTypes.ts")) &&
    /windows:\s*readonly FloatingWindowModel\[\]/.test(
      read("FloatingWindowTypes.ts")
    ),
  "Floating APIs unmodified"
);

assertCase(
  "d57.gov.windowApiUnchanged",
  /export interface WindowAPI\b/.test(read("WindowTypes.ts")) &&
    !/\bmoveWindow\s*\(/.test(read("WindowTypes.ts")) &&
    !/\bsetPosition\s*\(/.test(read("WindowTypes.ts")),
  "WindowAPI unmodified"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d57-governance",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d57-governance"
    : `\nFAIL — d57-governance (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
