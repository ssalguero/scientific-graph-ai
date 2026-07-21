/**
 * D59.4 — Snap Foundation · governance gate.
 * Authority: D59.0 Discovery governance · D59.1–D59.3 certified paths.
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

const engineRaw = read("WindowSnapEngine.ts");
const engine = stripComments(engineRaw);
const typesRaw = read("WindowSnapTypes.ts");
const types = stripComments(typesRaw);
const providersRaw = read("WindowSnapTargetProviders.ts");
const providers = stripComments(providersRaw);
const dragBridge = stripComments(read("WindowDragBridge.ts"));
const resizeBridge = stripComments(read("WindowResizeBridge.ts"));
const floatingWindow = stripComments(read("FloatingWindow.tsx"));
const floatingLayer = stripComments(read("FloatingWindowLayer.tsx"));
const floatingBridge = stripComments(read("FloatingWindowBridge.tsx"));
const manager = stripComments(read("WindowManager.tsx"));

assertCase(
  "d59.gov.enginePureNoReact",
  !/\bfrom\s+["']react["']/.test(engineRaw) &&
    !/\buse(State|Effect|Ref|Memo|Callback|Context)\s*\(/.test(engine) &&
    !/<[A-Z]/.test(engineRaw),
  "snap-engine-no-react: Engine has no React/hooks/JSX"
);

assertCase(
  "d59.gov.engineNoDomPointer",
  !/\bdocument\b/.test(engine) &&
    !/\bPointerEvent\b/.test(engine) &&
    !/\bgetBoundingClientRect\b/.test(engine) &&
    !/\baddEventListener\b/.test(engine) &&
    !/\bpointerX\b/.test(engine) &&
    !/\bpointerY\b/.test(engine),
  "Engine has no DOM / pointer"
);

assertCase(
  "d59.gov.engineNoStores",
  !/createWindowGeometryState/.test(engine) &&
    !/geometryState\./.test(engine) &&
    !/WindowState/.test(engine) &&
    !/useWindowContext/.test(engine) &&
    !/subscribe\(/.test(engine),
  "snap-engine-no-stores (may import WindowGeometry/cloneGeometry types only)"
);

assertCase(
  "d59.gov.engineNoProviders",
  !/SnapTargetProvider/.test(engine) &&
    !/createWorkspaceSnapTargetProvider/.test(engine) &&
    !/createWindowSnapTargetProvider/.test(engine) &&
    !/\.collect\s*\(/.test(engine),
  "Engine does not import or invoke providers"
);

assertCase(
  "d59.gov.engineDecoupled",
  !/WindowDragBridge/.test(engine) &&
    !/WindowResizeBridge/.test(engine) &&
    !/WindowManager/.test(engine) &&
    !/beginDrag/.test(engine) &&
    !/beginResize/.test(engine),
  "snap-engine-decoupled: no Drag/Resize/Manager"
);

assertCase(
  "d59.gov.engineNoSingleton",
  /export function applyMagneticSnap/.test(engineRaw) &&
    !/\bglobalThis\b/.test(engine),
  "snap-engine-no-singleton: pure function export"
);

assertCase(
  "d59.gov.snapViaCompositionOnly",
  /applyMagneticSnap/.test(dragBridge) &&
    /applyMagneticSnap/.test(resizeBridge) &&
    /geometryState\.set/.test(dragBridge) &&
    /geometryState\.set/.test(resizeBridge),
  "snap applied from DragBridge + ResizeBridge write paths"
);

assertCase(
  "d59.gov.noSnapInFloatingUi",
  !/applyMagneticSnap/.test(floatingWindow) &&
    !/applyMagneticSnap/.test(floatingLayer) &&
    !/applyMagneticSnap/.test(floatingBridge) &&
    !/SnapTargetProvider/.test(floatingWindow) &&
    !/snap-guide/i.test(floatingWindow + floatingLayer),
  "no-snap-ui: Floating* does not compose snap / guides"
);

assertCase(
  "d59.gov.noDockLayoutImports",
  !/from\s+["'][^"']*docking[^"']*["']/.test(engineRaw) &&
    !/from\s+["'][^"']*layout-engine[^"']*["']/.test(engineRaw) &&
    !/from\s+["'][^"']*docking[^"']*["']/.test(typesRaw) &&
    !/from\s+["'][^"']*docking[^"']*["']/.test(providersRaw) &&
    !/from\s+["'][^"']*layout-engine[^"']*["']/.test(providersRaw),
  "no-dock-imports / no layout-engine imports in snap modules"
);

assertCase(
  "d59.gov.targetsViaProviders",
  /createWorkspaceSnapTargetProvider/.test(providers) &&
    /createWindowSnapTargetProvider/.test(providers) &&
    /SNAP_PRIORITY\.workspace/.test(providers) &&
    /SNAP_PRIORITY\.window/.test(providers) &&
    !/kind:\s*["']dock["']/.test(providers),
  "snap-targets-via-providers; dock not emitted in D59"
);

assertCase(
  "d59.gov.managerHostsSnapInjection",
  /createDefaultSnapConfig/.test(manager) &&
    /createWorkspaceSnapTargetProvider/.test(manager) &&
    /createWindowSnapTargetProvider/.test(manager) &&
    /createWindowDragBridge/.test(manager) &&
    /createWindowResizeBridge/.test(manager),
  "Manager injects SnapConfig + providers into bridges"
);

assertCase(
  "d59.gov.edgesOnlyTypes",
  /"left"\s*\|\s*"right"\s*\|\s*"top"\s*\|\s*"bottom"/.test(typesRaw) &&
    !/\bcenter\b/.test(types) &&
    !/\brotation\b/.test(types) &&
    !/\bscale\b/.test(types) &&
    !/\btransform\b/.test(types),
  "snap-edges-only in SnapEdge contract"
);

assertCase(
  "d59.gov.noSnapSessionApi",
  !/beginSnap/.test(engine + dragBridge + resizeBridge + types) &&
    !/updateSnap/.test(engine + dragBridge + resizeBridge + types) &&
    !/endSnap/.test(engine + dragBridge + resizeBridge + types),
  "no-snap-session-api"
);

assertCase(
  "d59.gov.resizeRejectAxisHelper",
  /acceptSnapAxes/.test(resizeBridge) &&
    /satisfiesGeometryConstraints/.test(resizeBridge),
  "ResizeBridge discards snap axis when constraints violated"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d59-governance",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d59-governance"
    : `\nFAIL — d59-governance (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
