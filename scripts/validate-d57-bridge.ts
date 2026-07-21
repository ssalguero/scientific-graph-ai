/**
 * D57.5 — Window Drag System · Bridge Mapping / pipeline gate.
 * Authority: D57.0 Discovery · D57.4 Bridge Mapping pipeline freeze.
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

const bridge = stripComments(read("FloatingWindowBridge.tsx"));
const manager = stripComments(read("WindowManager.tsx"));
const floatingWindow = stripComments(read("FloatingWindow.tsx"));
const dragBridge = stripComments(read("WindowDragBridge.ts"));
const positionCtx = stripComments(read("WindowPositionContext.tsx"));
const dragCtx = stripComments(read("WindowDragContext.tsx"));

assertCase(
  "d57.bridge.mappingFn",
  /mapToFloatingWindowModels/.test(bridge),
  "Bridge Mapping function present"
);

assertCase(
  "d57.bridge.readsPositionStore",
  /\buseWindowPosition\s*\(/.test(bridge) && /store\.getAll/.test(bridge),
  "Bridge reads Position Store reactively"
);

assertCase(
  "d57.bridge.readsWindowState",
  /\buseWindowContext\s*\(/.test(bridge),
  "Bridge reads WindowState via useWindowContext"
);

assertCase(
  "d57.bridge.noEmptyPlaceholder",
  !/windows=\{\[\]\}/.test(bridge) &&
    /<FloatingWindowLayer\s+windows=\{windows\}\s*\/>/.test(bridge),
  "windows={[]} removed — mapped models passed to Layer"
);

assertCase(
  "d57.bridge.managerProviders",
  /WindowPositionProvider/.test(manager) &&
    /WindowDragProvider/.test(manager) &&
    /WindowProvider/.test(manager),
  "Manager wires Window / Position / Drag providers"
);

assertCase(
  "d57.bridge.positionRevision",
  /positionRevision|revision/.test(manager) &&
    /subscribe/.test(manager),
  "Reactive revision tick subscribed to Position Store"
);

assertCase(
  "d57.bridge.pointerPipeline",
  /setPointerCapture/.test(floatingWindow) &&
    /\bbeginDrag\b/.test(floatingWindow) &&
    /\bupdateDrag\b/.test(floatingWindow) &&
    /\bendDrag\b/.test(floatingWindow) &&
    /releasePointerCapture/.test(floatingWindow),
  "Pointer Events → WindowDragBridge triad"
);

assertCase(
  "d57.bridge.dragMutatesStore",
  /positionStore\.set/.test(dragBridge) &&
    /updateDrag/.test(dragBridge),
  "updateDrag writes Position Store"
);

assertCase(
  "d57.bridge.contextsInternal",
  /useWindowPosition/.test(positionCtx) &&
    /useWindowDrag/.test(dragCtx) &&
    existsSync(join(windowsDir, "WindowPositionContext.tsx")) &&
    existsSync(join(windowsDir, "WindowDragContext.tsx")),
  "Position + Drag context shells present"
);

assertCase(
  "d57.bridge.pipelineCertified",
  /\bbeginDrag\b/.test(floatingWindow) &&
    /positionStore\.set/.test(dragBridge) &&
    /mapToFloatingWindowModels/.test(bridge) &&
    /FloatingWindowLayer/.test(bridge),
  "Full pipeline: Pointer → DragBridge → Store → Bridge → Model[] → Layer"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d57-bridge",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d57-bridge"
    : `\nFAIL — d57-bridge (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
