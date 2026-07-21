/**
 * D56.5 — Floating Windows Foundation governance gate.
 * D57.3 — Title-bar Pointer Capture supersession (certified path only).
 * D57.4 — Bridge Mapping supersession (windows={[]} replaced by Position Store mapping).
 * Authority: D56 presentational + bridge architecture · D57 TitleBar → WindowDragBridge.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
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

const HOOK_PATTERN =
  /\b(useState|useReducer|useEffect|useMemo|useCallback|useContext|useWindowContext)\s*\(/;

const floatingWindow = read("FloatingWindow.tsx");
const floatingLayer = read("FloatingWindowLayer.tsx");
const floatingBridge = read("FloatingWindowBridge.tsx");
const floatingTypes = read("FloatingWindowTypes.ts");

const floatingWindowCode = stripComments(floatingWindow);
const floatingLayerCode = stripComments(floatingLayer);
const floatingBridgeCode = stripComments(floatingBridge);

const floatingFiles = [
  "FloatingWindow.tsx",
  "FloatingWindowLayer.tsx",
  "FloatingWindowBridge.tsx",
  "FloatingWindowTypes.ts",
  "FloatingWindowResizeHandle.tsx",
] as const;

/** D57.3 + D58.2: FloatingWindow may use useWindowDrag + useWindowResize only. */
assertCase(
  "d56.gov.floatingWindow.certifiedHooksOnly",
  /\buseWindowDrag\s*\(/.test(floatingWindowCode) &&
    /\buseWindowResize\s*\(/.test(floatingWindowCode) &&
    !HOOK_PATTERN.test(floatingWindowCode),
  "FloatingWindow uses only useWindowDrag + useWindowResize"
);

assertCase(
  "d56.gov.floatingWindow.noWindowManager",
  !/from\s+["']\.\/WindowManager["']/.test(floatingWindowCode) &&
    !/\bWindowManager\b/.test(floatingWindowCode),
  "FloatingWindow does not import WindowManager"
);

assertCase(
  "d56.gov.floatingWindow.noWindowContext",
  !/\buseWindowContext\s*\(/.test(floatingWindowCode),
  "FloatingWindow does not call useWindowContext"
);

assertCase(
  "d56.gov.floatingWindow.titleBarPointerCapture",
  /onPointerDown/.test(floatingWindowCode) &&
    /setPointerCapture/.test(floatingWindowCode) &&
    /releasePointerCapture/.test(floatingWindowCode) &&
    /\bbeginDrag\b/.test(floatingWindowCode) &&
    /\bupdateDrag\b/.test(floatingWindowCode) &&
    /\bendDrag\b/.test(floatingWindowCode) &&
    /data-floating-window-title/.test(floatingWindowCode),
  "Title bar wires Pointer Events → begin/update/endDrag"
);

assertCase(
  "d56.gov.floatingWindow.resizeHandles",
  /\bbeginResize\b/.test(floatingWindowCode) &&
    /\bupdateResize\b/.test(floatingWindowCode) &&
    /\bendResize\b/.test(floatingWindowCode) &&
    /FloatingWindowResizeHandle/.test(floatingWindowCode) &&
    /data-floating-window-edge-handle/.test(
      stripComments(read("FloatingWindowResizeHandle.tsx"))
    ),
  "Eight-edge handles wire Pointer Events → begin/update/endResize"
);

assertCase(
  "d56.gov.floatingWindow.handlesOnlyNotContent",
  /<header[\s\S]*onPointerDown[\s\S]*<\/header>/.test(floatingWindow) &&
    !/<section[^>]*\sonPointer/i.test(floatingWindowCode),
  "Pointer handlers on title bar + handles only — not content section"
);

assertCase(
  "d56.gov.floatingLayer.noHooks",
  !HOOK_PATTERN.test(floatingLayerCode) &&
    !/\buseWindowDrag\s*\(/.test(floatingLayerCode) &&
    !/\buseWindowResize\s*\(/.test(floatingLayerCode),
  "FloatingWindowLayer has no hooks"
);

assertCase(
  "d56.gov.floatingLayer.noWindowManager",
  !(
    floatingLayer.match(/^\s*import\s+.+from\s+["'][^"']+["']/gm) ?? []
  ).some((line) => /WindowManager/.test(line)) &&
    !/from\s+["']\.\/WindowManager["']/.test(floatingLayerCode),
  "Layer does not import WindowManager"
);

assertCase(
  "d56.gov.floatingLayer.noWorkspace",
  !/workspace/i.test(
    (floatingLayer.match(/from\s+["'][^"']+["']/g) ?? []).join("\n")
  ),
  "Layer does not import Workspace"
);

assertCase(
  "d56.gov.bridge.usesWindowContext",
  /\buseWindowContext\s*\(/.test(floatingBridgeCode),
  "Bridge calls useWindowContext()"
);

assertCase(
  "d56.gov.bridge.usesWindowGeometry",
  /\buseWindowGeometry\s*\(/.test(floatingBridgeCode),
  "Bridge reads GeometryState via useWindowGeometry()"
);

assertCase(
  "d56.gov.bridge.mapsModels",
  /mapToFloatingWindowModels/.test(floatingBridgeCode) &&
    /<FloatingWindowLayer\s+windows=\{windows\}\s*\/>/.test(
      floatingBridgeCode
    ) &&
    !/windows=\{\[\]\}/.test(floatingBridgeCode),
  "Bridge maps GeometryState → FloatingWindowModel[] (no windows={[]})"
);

assertCase(
  "d56.gov.bridge.onlyExtraHookIsContext",
  !/\b(useState|useReducer|useEffect|useMemo|useCallback)\s*\(/.test(
    floatingBridgeCode
  ),
  "Bridge has no state/effect/memo hooks"
);

/** Among Floating* files, only Bridge may call useWindowContext. */
const floatingSources: { file: string; source: string }[] = [
  { file: "FloatingWindow.tsx", source: floatingWindow },
  { file: "FloatingWindowLayer.tsx", source: floatingLayer },
  { file: "FloatingWindowTypes.ts", source: floatingTypes },
];

const illicitContext = floatingSources.filter(({ source }) =>
  /\buseWindowContext\s*\(/.test(stripComments(source))
);

assertCase(
  "d56.gov.bridgeSoleContextConsumer",
  illicitContext.length === 0,
  illicitContext.length
    ? `useWindowContext in: ${illicitContext.map((f) => f.file).join(",")}`
    : "Bridge is sole Floating* useWindowContext consumer"
);

const illicitPosition = floatingSources.filter(({ source }) =>
  /\buseWindowPosition\s*\(/.test(stripComments(source)) ||
  /\buseWindowGeometry\s*\(/.test(stripComments(source))
);

assertCase(
  "d56.gov.bridgeSolePositionConsumer",
  illicitPosition.length === 0,
  illicitPosition.length
    ? `geometry hooks in: ${illicitPosition.map((f) => f.file).join(",")}`
    : "Bridge is sole Floating* geometry context consumer"
);

const joinedFloating = floatingFiles.map((f) => read(f)).join("\n");

const FORBIDDEN_IMPORT_PATTERNS: { id: string; pattern: RegExp }[] = [
  { id: "scientific", pattern: /from\s+["'][^"']*scientific[^"']*["']/ },
  {
    id: "graph",
    pattern:
      /from\s+["'][^"']*(?:\/graph\/|@\/components\/graph|@\/lib\/graph)[^"']*["']/,
  },
  { id: "analysis", pattern: /from\s+["'][^"']*analysis[^"']*["']/ },
  {
    id: "page",
    pattern: /from\s+["'][^"']*(?:@\/app\/page|src\/app\/page|\/page["'])/,
  },
];

const importHits: string[] = [];
for (const { id, pattern } of FORBIDDEN_IMPORT_PATTERNS) {
  if (pattern.test(joinedFloating)) {
    importHits.push(id);
  }
}

assertCase(
  "d56.gov.noForbiddenImports",
  importHits.length === 0,
  importHits.length
    ? `forbidden imports: ${importHits.join(",")}`
    : "no scientific/graph/analysis/page imports"
);

/**
 * Capability keywords: snap/persist banned everywhere Floating*.
 * "drag" / "resize" allowed only on certified handle/title paths.
 */
const FORBIDDEN_CAPABILITY_KEYWORDS = [
  "drag",
  "resize",
  "snap",
  "createPortal",
  "persist",
  "localStorage",
  "sessionStorage",
  "IndexedDB",
] as const;

const DRAG_RESIZE_ALLOWED_FILES = new Set([
  "FloatingWindow.tsx",
  "FloatingWindowResizeHandle.tsx",
]);

const capabilityHits = FORBIDDEN_CAPABILITY_KEYWORDS.filter((kw) => {
  const pattern = new RegExp(`\\b${kw}\\b`, "i");
  return floatingFiles.some((file) => {
    if (
      (kw === "drag" || kw === "resize") &&
      DRAG_RESIZE_ALLOWED_FILES.has(file)
    ) {
      return false;
    }
    return pattern.test(stripComments(read(file)));
  });
});

assertCase(
  "d56.gov.noForbiddenCapabilities",
  capabilityHits.length === 0,
  capabilityHits.length
    ? `keywords: ${capabilityHits.join(",")}`
    : "no forbidden capabilities (drag/resize only on certified Floating paths)"
);

assertCase(
  "d56.gov.singleLayer",
  existsSync(join(windowsDir, "FloatingWindowLayer.tsx")) &&
    readdirSync(windowsDir).filter((n) =>
      /^FloatingWindowLayer\./.test(n)
    ).length === 1,
  "single FloatingWindowLayer file"
);

assertCase(
  "d56.gov.bridgeMappingActive",
  /\buseWindowGeometry\b/.test(floatingBridgeCode) &&
    !/windows=\{\[\]\}/.test(floatingBridgeCode),
  "D58.1: Bridge Mapping active (GeometryState → models)"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d56-governance",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d56-governance"
    : `\nFAIL — d56-governance (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
