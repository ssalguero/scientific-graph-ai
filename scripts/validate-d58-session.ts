/**
 * D58.4 — Window Resize System · session exclusivity gate.
 * Authority: D58.0 Discovery · drag XOR resize · end clears session.
 * Note: frozen ResizeAPI has no cancelResize; cancel semantics = endResize
 * and begin* replacing / ending the opposite session.
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

const resizeBridge = stripComments(read("WindowResizeBridge.ts"));
const dragBridge = stripComments(read("WindowDragBridge.ts"));
const manager = stripComments(read("WindowManager.tsx"));
const resizeRaw = read("WindowResizeBridge.ts");

assertCase(
  "d58.session.filesExist",
  existsSync(join(windowsDir, "WindowResizeBridge.ts")) &&
    existsSync(join(windowsDir, "WindowDragBridge.ts")),
  "Resize + Drag bridges exist"
);

assertCase(
  "d58.session.resizeTriad",
  /beginResize\(/.test(resizeBridge) &&
    /updateResize\(/.test(resizeBridge) &&
    /endResize\(/.test(resizeBridge),
  "beginResize / updateResize / endResize present"
);

assertCase(
  "d58.session.dragTriad",
  /beginDrag\(/.test(dragBridge) &&
    /updateDrag\(/.test(dragBridge) &&
    /endDrag\(/.test(dragBridge),
  "beginDrag / updateDrag / endDrag present"
);

assertCase(
  "d58.session.singleResizeState",
  /let state:\s*WindowResizeState/.test(resizeBridge) ||
    /let state: WindowResizeState/.test(resizeRaw),
  "Single resize session state variable"
);

assertCase(
  "d58.session.endResizeClears",
  /endResize\(\):\s*void\s*\{[\s\S]*status:\s*"idle"/.test(resizeRaw) ||
    (/endResize\(/.test(resizeBridge) &&
      /status:\s*"idle"/.test(resizeBridge) &&
      /endResize[\s\S]{0,200}idle/.test(resizeRaw)),
  "endResize clears session to idle"
);

assertCase(
  "d58.session.endDragClears",
  /endDrag\(/.test(dragBridge) && /status:\s*"idle"/.test(dragBridge),
  "endDrag clears session to idle"
);

assertCase(
  "d58.session.beginReplacesResize",
  /beginResize[\s\S]*status:\s*"resizing"/.test(resizeRaw),
  "beginResize establishes resizing session (replaces prior)"
);

assertCase(
  "d58.session.dragXorResize",
  /beginDrag[\s\S]{0,200}endResize\(/.test(manager) &&
    /beginResize[\s\S]{0,200}endDrag\(/.test(manager),
  "drag XOR resize: beginDrag ends resize; beginResize ends drag"
);

assertCase(
  "d58.session.cancelViaEnd",
  !/cancelResize\s*\(/.test(
    resizeRaw.match(/export type WindowResizeAPI\s*=\s*\{([\s\S]*?)\}/)?.[1] ??
      ""
  ) && /endResize\(/.test(resizeBridge),
  "cancel semantics via endResize (no cancelResize on frozen API)"
);

assertCase(
  "d58.session.managerCleansOnClose",
  /endDrag\(/.test(manager) &&
    /endResize\(/.test(manager) &&
    /close\(/.test(manager),
  "Manager ends drag/resize sessions on lifecycle cleanup"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d58-session",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d58-session"
    : `\nFAIL — d58-session (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
