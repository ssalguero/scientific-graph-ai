/**
 * D53.5 — Dock Interactions API Freeze gate.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
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

const dockingFiles = existsSync(dockingDir)
  ? readdirSync(dockingDir).filter((name) => !name.startsWith("."))
  : [];
const allSources = dockingFiles.map((name) => read(name)).join("\n");
const interactionSource = read("DockInteractionContext.tsx");
const providerSource = read("DockInteractionProvider.tsx");
const hookSource = read("useDockInteraction.ts");
const dragHookSource = read("useDockDrag.ts");
const resizeHookSource = read("useDockResize.ts");
const barrelSource = read("index.ts");
const typesSource = read("types.ts");

assertCase(
  "d53.api.providerExists",
  /export function DockInteractionProvider/.test(providerSource) &&
    existsSync(join(dockingDir, "DockInteractionProvider.tsx")),
  "DockInteractionProvider"
);

assertCase(
  "d53.api.contextExists",
  /export const DockInteractionContext/.test(interactionSource),
  "DockInteractionContext"
);

assertCase(
  "d53.api.hooksExist",
  /export function useDockInteraction/.test(hookSource) &&
    /export function useDockDrag/.test(dragHookSource) &&
    /export function useDockResize/.test(resizeHookSource),
  "useDockInteraction · useDockDrag · useDockResize"
);

const requiredTypes = [
  "DockInteractionState",
  "DockFocusState",
  "DockDragState",
  "DockResizeState",
  "DockDragSession",
  "DockResizeSession",
] as const;

for (const typeName of requiredTypes) {
  assertCase(
    `d53.api.type.${typeName}`,
    new RegExp(`export\\s+type\\s+${typeName}\\b`).test(interactionSource),
    typeName
  );
}

const apiMethods = [
  "focus",
  "blur",
  "activate",
  "deactivate",
  "beginDrag",
  "updateDrag",
  "endDrag",
  "beginResize",
  "updateResize",
  "endResize",
] as const;

for (const method of apiMethods) {
  assertCase(
    `d53.api.method.${method}`,
    new RegExp(`\\b${method}\\b`).test(interactionSource) &&
      new RegExp(`\\b${method}\\b`).test(providerSource),
    method
  );
}

assertCase(
  "d53.api.dragSessionShape",
  /dockId:\s*string/.test(interactionSource) &&
    /pointerId:\s*number/.test(interactionSource) &&
    /start:\s*DockPointerPoint/.test(interactionSource) &&
    /current:\s*DockPointerPoint/.test(interactionSource) &&
    /export type DockDragSession/.test(interactionSource),
  "DockDragSession shape"
);

assertCase(
  "d53.api.resizeSessionShape",
  /export type DockResizeSession/.test(interactionSource) &&
    /edge:\s*ResizeEdge/.test(interactionSource),
  "DockResizeSession shape"
);

assertCase(
  "d53.api.dockStateUntouched",
  /export type DockState\s*=\s*\{/.test(typesSource) &&
    /activePanelIds:\s*string\[\]/.test(typesSource) &&
    /sizes:\s*Partial<Record<DockSide,\s*DockSize>>/.test(typesSource) &&
    !/focusedDock/.test(typesSource) &&
    !/dragSession/.test(typesSource),
  "DockState v1 unchanged"
);

assertCase(
  "d53.api.barrelExports",
  /useDockInteraction/.test(barrelSource) &&
    /useDockDrag/.test(barrelSource) &&
    /useDockResize/.test(barrelSource) &&
    /DockInteractionProvider/.test(barrelSource) &&
    /DockDragSession/.test(barrelSource) &&
    /DockFocusState/.test(barrelSource),
  "barrel additive exports"
);

assertCase(
  "d53.api.noBreakingD52Exports",
  /DockProvider/.test(barrelSource) &&
    /useDockContext/.test(barrelSource) &&
    /DOCK_FEATURES/.test(barrelSource) &&
    /DEFAULT_DOCK_LAYOUT/.test(barrelSource),
  "D51/D52 exports preserved"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d53-api-freeze",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d53-api-freeze"
    : `\nFAIL — d53-api-freeze (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
