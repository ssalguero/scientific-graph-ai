/**
 * D57.5 — Window Drag System · governance gate.
 * Authority: D57.0 Discovery governance · D55/D56 freezes · TitleBar → Drag Bridge path.
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
const positionStore = stripComments(read("WindowPositionStore.ts"));
const floatingRaw = read("FloatingWindow.tsx");

assertCase(
  "d57.gov.managerOwnsPosition",
  /createWindowPositionStore/.test(manager) &&
    /WindowPositionProvider/.test(manager) &&
    /createWindowDragBridge/.test(manager),
  "manager-owns-position: Manager hosts Position Store + Drag Bridge"
);

assertCase(
  "d57.gov.noLocalPosition",
  !/\buseState\s*\(/.test(floatingWindow) &&
    !/positionStore\.set/.test(floatingWindow) &&
    !/\.style\.(left|top)\s*=/.test(floatingWindow),
  "no-local-position: FloatingWindow has no local position state"
);

assertCase(
  "d57.gov.bridgeRequired",
  /\bbeginDrag\b/.test(floatingWindow) &&
    /\bupdateDrag\b/.test(floatingWindow) &&
    /\bendDrag\b/.test(floatingWindow) &&
    !/createWindowPositionStore/.test(floatingWindow) &&
    /positionStore\.set/.test(dragBridge),
  "bridge-required: mutations only via WindowDragBridge → Store"
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
  "d57.gov.titleBarOnly",
  /data-floating-window-title/.test(floatingWindow) &&
    /onPointerDown/.test(floatingWindow) &&
    /setPointerCapture/.test(floatingWindow) &&
    /releasePointerCapture/.test(floatingWindow) &&
    /<header[\s\S]*onPointerDown[\s\S]*<\/header>/.test(floatingRaw) &&
    !/<section[^>]*\sonPointer/i.test(floatingWindow),
  "title-bar-only: Pointer Events exclusively on header"
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
  !/\b(useState|useEffect|useWindowDrag|useWindowPosition|useWindowContext)\s*\(/.test(
    floatingLayer
  ) && /FloatingWindowLayerProps/.test(read("FloatingWindowLayer.tsx")),
  "render-without-logic: Layer is presentational only"
);

assertCase(
  "d57.gov.positionStoreXYonly",
  /export type WindowPosition\s*=/.test(positionStore) &&
    !/width:\s*number/.test(
      positionStore.match(/export type WindowPosition\s*=\s*\{([^}]+)\}/)?.[1] ??
        "width: number"
    ),
  "Position Store owns x/y only"
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
