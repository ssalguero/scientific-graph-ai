/**
 * UX-2.9 — Panel Resize System gate.
 * Session orchestration + Pointer Capture handles over UX-2.7/2.8 sizes.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const workspaceDir = join(repoRoot, "src/components/workspace");
const panelsDir = join(workspaceDir, "panels");
const resizeDir = join(panelsDir, "resize");
const contentDir = join(panelsDir, "content");
const packagePath = join(repoRoot, "package.json");

const RESIZE_FILES = [
  "PanelResizeHandle.tsx",
  "PanelResizeContext.tsx",
  "PanelResizeProvider.tsx",
  "usePanelResize.ts",
  "ResizeTypes.ts",
  "ResizeMath.ts",
  "ResizeConstraints.ts",
  "index.ts",
] as const;

const results: { id: string; pass: boolean; detail: string }[] = [];

const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const read = (path: string): string =>
  existsSync(path) ? readFileSync(path, "utf8") : "";

const collectTsSources = (dir: string): string[] => {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return [];
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...collectTsSources(full));
      continue;
    }
    if (/\.(tsx?|mts|cts)$/.test(name)) {
      out.push(read(full));
    }
  }
  return out;
};

const resizePresent = existsSync(resizeDir)
  ? readdirSync(resizeDir).filter((name) => !name.startsWith("."))
  : [];
const resizeSet = new Set(resizePresent);

const typesSource = read(join(resizeDir, "ResizeTypes.ts"));
const mathSource = read(join(resizeDir, "ResizeMath.ts"));
const constraintsSource = read(join(resizeDir, "ResizeConstraints.ts"));
const contextSource = read(join(resizeDir, "PanelResizeContext.tsx"));
const providerSource = read(join(resizeDir, "PanelResizeProvider.tsx"));
const handleSource = read(join(resizeDir, "PanelResizeHandle.tsx"));
const hookSource = read(join(resizeDir, "usePanelResize.ts"));
const barrelSource = read(join(resizeDir, "index.ts"));
const panelsBarrelSource = read(join(panelsDir, "index.ts"));
const bodyLayoutSource = read(join(panelsDir, "WorkspaceBodyLayout.tsx"));
const contentSource = read(join(workspaceDir, "WorkspaceContent.tsx"));
const explorerSource = read(join(contentDir, "ExplorerContent.tsx"));
const inspectorSource = read(join(contentDir, "InspectorContent.tsx"));
const consoleSource = read(join(contentDir, "ConsoleContent.tsx"));
const allResizeSources = collectTsSources(resizeDir).join("\n");
const pkg = read(packagePath);

/* -------------------------------------------------------------------------- */
/* A. Architecture                                                            */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux29.resize.dir.exists",
  existsSync(resizeDir) && statSync(resizeDir).isDirectory(),
  resizeDir
);

for (const file of RESIZE_FILES) {
  assertCase(
    `ux29.file.${file}`,
    resizeSet.has(file),
    join(resizeDir, file)
  );
}

assertCase(
  "ux29.resize.files.exact",
  resizePresent.length === RESIZE_FILES.length &&
    RESIZE_FILES.every((f) => resizeSet.has(f)),
  `present=[${resizePresent.sort().join(", ")}]`
);

/* -------------------------------------------------------------------------- */
/* B. Session + Provider API freeze                                           */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux29.types.ResizeAxis",
  /type\s+ResizeAxis\s*=\s*["']left["']\s*\|\s*["']right["']\s*\|\s*["']bottom["']/.test(
    typesSource
  ),
  "ResizeAxis = left | right | bottom"
);

assertCase(
  "ux29.types.ResizeSession",
  /interface\s+ResizeSession\s*\{/.test(typesSource) &&
    /\baxis:\s*ResizeAxis\b/.test(typesSource) &&
    /\bpointerId:\s*number\b/.test(typesSource) &&
    /\bstartClient:\s*number\b/.test(typesSource) &&
    /\bstartSize:\s*number\b/.test(typesSource),
  "ResizeSession frozen fields"
);

assertCase(
  "ux29.context.api",
  /beginResize\s*\(\s*pointerId:\s*number\s*,\s*axis:\s*ResizeAxis\s*,\s*client:\s*number\s*\)/.test(
    contextSource
  ) &&
    /updateResize\s*\(\s*client:\s*number\s*\)/.test(contextSource) &&
    /endResize\s*\(\s*\)/.test(contextSource) &&
    /session:\s*ResizeSession\s*\|\s*null/.test(contextSource),
  "beginResize / updateResize(client) / endResize"
);

assertCase(
  "ux29.provider.noPointerEvent",
  !/\bPointerEvent\b/.test(providerSource) &&
    !/\bReactPointerEvent\b/.test(providerSource),
  "PanelResizeProvider has no PointerEvent"
);

assertCase(
  "ux29.provider.usesPanelSetters",
  /usePanelState\s*\(/.test(providerSource) &&
    /setLeftWidth/.test(providerSource) &&
    /setRightWidth/.test(providerSource) &&
    /setBottomHeight/.test(providerSource),
  "Provider uses Panel State setters"
);

assertCase(
  "ux29.provider.computeNextSize",
  /computeNextSize\s*\(/.test(providerSource) &&
    /startSize/.test(providerSource),
  "update path uses computeNextSize + startSize"
);

assertCase(
  "ux29.provider.notSizeStore",
  !/\bleftWidth\b/.test(providerSource.replace(/state\.leftWidth/g, "")) ||
    (/state\.leftWidth/.test(providerSource) &&
      !/useState\s*<[^>]*leftWidth/.test(providerSource)),
  "Provider does not own durable size state"
);

assertCase(
  "ux29.hook.exists",
  /export\s+function\s+usePanelResize/.test(hookSource) &&
    /PanelResizeContext/.test(hookSource),
  "usePanelResize reads PanelResizeContext"
);

/* -------------------------------------------------------------------------- */
/* C. ResizeMath freeze                                                       */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux29.math.exports",
  /export\s+function\s+clamp\s*\(/.test(mathSource) &&
    /export\s+function\s+delta\s*\(/.test(mathSource) &&
    /export\s+function\s+applyLimits\s*\(/.test(mathSource) &&
    /export\s+function\s+computeNextSize\s*\(/.test(mathSource) &&
    /export\s+function\s+snap\s*\(/.test(mathSource),
  "clamp / delta / applyLimits / computeNextSize / snap"
);

assertCase(
  "ux29.math.noReact",
  !/\bfrom\s+["']react["']/.test(mathSource) &&
    !/\bReact\b/.test(mathSource) &&
    !/\buse[A-Z]/.test(mathSource),
  "ResizeMath has no React"
);

assertCase(
  "ux29.math.noDomPointer",
  !/\bPointerEvent\b/.test(mathSource) &&
    !/\bdocument\b/.test(mathSource) &&
    !/\bwindow\b/.test(mathSource),
  "ResizeMath has no DOM / PointerEvent"
);

assertCase(
  "ux29.math.computeSignature",
  /computeNextSize\s*\(\s*startSize:\s*number\s*,\s*startClient:\s*number\s*,\s*currentClient:\s*number\s*,\s*axis:\s*ResizeAxis\s*,\s*constraints:\s*ResizeConstraintSet\s*\)/.test(
    mathSource.replace(/\s+/g, " ")
  ) ||
    (/function\s+computeNextSize\s*\(/.test(mathSource) &&
      /startSize/.test(mathSource) &&
      /startClient/.test(mathSource) &&
      /currentClient/.test(mathSource) &&
      /axis/.test(mathSource) &&
      /constraints/.test(mathSource)),
  "computeNextSize(startSize, startClient, currentClient, axis, constraints)"
);

/* -------------------------------------------------------------------------- */
/* D. Constraints + Handle                                                    */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux29.constraints.constants",
  /export\s+const\s+MIN_LEFT\s*=\s*180/.test(constraintsSource) &&
    /export\s+const\s+MAX_LEFT\s*=/.test(constraintsSource) &&
    /export\s+const\s+MIN_RIGHT\s*=\s*180/.test(constraintsSource) &&
    /export\s+const\s+MAX_RIGHT\s*=/.test(constraintsSource) &&
    /export\s+const\s+MIN_BOTTOM\s*=\s*180/.test(constraintsSource) &&
    /export\s+const\s+MAX_BOTTOM\s*=/.test(constraintsSource) &&
    /export\s+const\s+HANDLE_SIZE\s*=/.test(constraintsSource),
  "MIN/MAX_* + HANDLE_SIZE frozen"
);

assertCase(
  "ux29.constraints.noReact",
  !/\bfrom\s+["']react["']/.test(constraintsSource),
  "ResizeConstraints has no React"
);

assertCase(
  "ux29.handle.pointerCapture",
  /setPointerCapture/.test(handleSource) &&
    /releasePointerCapture/.test(handleSource),
  "Handle uses set/releasePointerCapture"
);

assertCase(
  "ux29.handle.pointerEvents",
  /onPointerDown/.test(handleSource) &&
    /onPointerMove/.test(handleSource) &&
    /onPointerUp/.test(handleSource) &&
    /onPointerCancel/.test(handleSource),
  "pointerdown/move/up/cancel"
);

assertCase(
  "ux29.handle.noWindowDocumentListeners",
  !/\bwindow\.(on)?(mouse|pointer)/.test(handleSource) &&
    !/\bdocument\.(on)?(mouse|pointer)/.test(handleSource) &&
    !/\baddEventListener\b/.test(handleSource) &&
    !/\bonmousemove\b/i.test(handleSource) &&
    !/\bonmouseup\b/i.test(handleSource),
  "no window/document mouse globals"
);

assertCase(
  "ux29.handle.callsClientApi",
  /beginResize\s*\(/.test(handleSource) &&
    /updateResize\s*\(/.test(handleSource) &&
    /endResize\s*\(/.test(handleSource),
  "Handle calls begin/update/end with primitives"
);

/* -------------------------------------------------------------------------- */
/* E. Integration                                                             */
/* -------------------------------------------------------------------------- */

const contentNorm = contentSource.replace(/\r\n/g, "\n");

assertCase(
  "ux29.mount.hierarchy",
  /<WorkspaceModeProvider>[\s\S]*?<PanelProvider[\s>][\s\S]*?<PanelResizeProvider>[\s\S]*?<WorkspaceBodyLayout>[\s\S]*?<\/WorkspaceBodyLayout>[\s\S]*?<\/PanelResizeProvider>[\s\S]*?<\/PanelProvider>[\s\S]*?<\/WorkspaceModeProvider>/.test(
    contentNorm
  ),
  "WorkspaceModeProvider → PanelProvider → PanelResizeProvider → BodyLayout"
);

assertCase(
  "ux29.body.usesHandles",
  /PanelResizeHandle/.test(bodyLayoutSource) &&
    /axis=["']left["']/.test(bodyLayoutSource) &&
    /axis=["']right["']/.test(bodyLayoutSource) &&
    /axis=["']bottom["']/.test(bodyLayoutSource),
  "BodyLayout mounts left/right/bottom handles"
);

assertCase(
  "ux29.body.hideCollapsed",
  /leftCollapsed/.test(bodyLayoutSource) &&
    /rightCollapsed/.test(bodyLayoutSource) &&
    /bottomCollapsed/.test(bodyLayoutSource),
  "BodyLayout gates handles on collapsed"
);

assertCase(
  "ux29.body.keepsPanelState",
  /usePanelState\s*\(/.test(bodyLayoutSource) &&
    /size=\{state\.leftWidth\}/.test(bodyLayoutSource) &&
    /size=\{state\.rightWidth\}/.test(bodyLayoutSource) &&
    /size=\{state\.bottomHeight\}/.test(bodyLayoutSource),
  "BodyLayout still sizes from Panel State"
);

/* -------------------------------------------------------------------------- */
/* F. Persistence isolation                                                   */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux29.resize.noPersistenceImport",
  !/from\s+["'][^"']*persistence[^"']*["']/.test(allResizeSources) &&
    !/\blocalStorage\b/.test(allResizeSources) &&
    !/\bindexedDB\b/i.test(allResizeSources),
  "resize/ imports no persistence / storage"
);

assertCase(
  "ux29.content.noHooks",
  !/\buse(State|Reducer|Effect|Memo|Callback|Ref|Context|LayoutEffect|ImperativeHandle|EffectEvent)\s*[<(]/.test(
    contentSource
  ),
  "WorkspaceContent remains hook-free"
);

/* -------------------------------------------------------------------------- */
/* G. Quality + performance                                                   */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux29.noAny",
  !/:\s*any\b/.test(allResizeSources) && !/\bas\s+any\b/.test(allResizeSources),
  "no any in resize/"
);

assertCase(
  "ux29.memo.explorer",
  /\bmemo\s*\(/.test(explorerSource),
  "ExplorerContent wrapped in memo"
);

assertCase(
  "ux29.memo.inspector",
  /\bmemo\s*\(/.test(inspectorSource),
  "InspectorContent wrapped in memo"
);

assertCase(
  "ux29.memo.console",
  /\bmemo\s*\(/.test(consoleSource),
  "ConsoleContent wrapped in memo"
);

assertCase(
  "ux29.types.noReact",
  !/\bfrom\s+["']react["']/.test(typesSource),
  "ResizeTypes has no React"
);

/* -------------------------------------------------------------------------- */
/* H. Barrel                                                                  */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux29.barrel.core",
  /PanelResizeHandle/.test(barrelSource) &&
    /PanelResizeProvider/.test(barrelSource) &&
    /PanelResizeContext/.test(barrelSource) &&
    /usePanelResize/.test(barrelSource),
  "resize/index exports Provider/Context/Hook/Handle"
);

assertCase(
  "ux29.barrel.mathConstraints",
  /computeNextSize/.test(barrelSource) &&
    /clamp/.test(barrelSource) &&
    /delta/.test(barrelSource) &&
    /applyLimits/.test(barrelSource) &&
    /snap/.test(barrelSource) &&
    /MIN_LEFT/.test(barrelSource) &&
    /HANDLE_SIZE/.test(barrelSource),
  "resize/index exports math + constraints"
);

assertCase(
  "ux29.panels.barrel.reexports",
  /PanelResizeProvider/.test(panelsBarrelSource) &&
    /PanelResizeHandle/.test(panelsBarrelSource) &&
    /usePanelResize/.test(panelsBarrelSource) &&
    /computeNextSize/.test(panelsBarrelSource),
  "panels/index re-exports resize API"
);

assertCase(
  "ux29.package.script",
  /"validate:ux-2\.9"\s*:/.test(pkg),
  "validate:ux-2.9 in package.json"
);

/* -------------------------------------------------------------------------- */
/* I. Delegates                                                               */
/* -------------------------------------------------------------------------- */

const runNpm = (script: string): { ok: boolean; detail: string } => {
  const r = spawnSync("npm", ["run", script], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
  });
  const out = `${r.stdout ?? ""}\n${r.stderr ?? ""}`.trim();
  return {
    ok: r.status === 0,
    detail: r.status === 0 ? "PASS" : out.slice(-800),
  };
};

/** UX-2.11 — Parent suites set UX_SKIP_DELEGATES=1 to avoid nested npm/tsc fan-out. */
const skipDelegates = process.env.UX_SKIP_DELEGATES === "1";

if (!skipDelegates) {
  const ux28 = runNpm("validate:ux-2.8");
  assertCase("ux29.delegate.ux-2.8", ux28.ok, ux28.detail);

  const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
  });
  assertCase(
    "ux29.typescript",
    tsc.status === 0,
    tsc.status === 0
      ? "PASS"
      : `${tsc.stdout ?? ""}\n${tsc.stderr ?? ""}`.trim().slice(-800)
  );
} else {
  assertCase("ux29.delegate.skipped", true, "UX_SKIP_DELEGATES=1 (leaf)");
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "ux-2.9-panel-resize",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — ux-2.9-panel-resize"
    : `\nFAIL — ux-2.9-panel-resize (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
