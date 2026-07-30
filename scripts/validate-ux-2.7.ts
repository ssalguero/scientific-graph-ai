/**
 * UX-2.7 — Panel State & Resizing Foundation gate.
 * Context / Provider / hook + CSS-var sizing; no resize handles or persistence.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const workspaceDir = join(repoRoot, "src/components/workspace");
const panelsDir = join(workspaceDir, "panels");
const stateDir = join(panelsDir, "state");
const contentPath = join(workspaceDir, "WorkspaceContent.tsx");
const packagePath = join(repoRoot, "package.json");
const srcDir = join(repoRoot, "src");

const STATE_FILES = [
  "PanelState.ts",
  "PanelContext.tsx",
  "PanelProvider.tsx",
  "usePanelState.ts",
  "index.ts",
] as const;

/** Direct storage APIs — banned everywhere under panels/state. */
const DIRECT_STORAGE_RE = /\blocalStorage\b|\bindexedDB\b|\bIndexedDB\b/;

/**
 * UX-2.8 amend — persistence facade words allowed only in PanelProvider.tsx.
 * Other state files still ban persist/save/restore/load keywords.
 */
const PERSISTENCE_FACADE_RE = /\bpersist\b|\bsave\b|\brestore\b|\bload\b/i;

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

/** Collect matching JSX tags across src/ for ownership checks. */
const collectSrcMatches = (pattern: RegExp): string[] => {
  const hits: string[] = [];
  const walk = (dir: string) => {
    if (!existsSync(dir) || !statSync(dir).isDirectory()) return;
    for (const name of readdirSync(dir)) {
      if (name.startsWith(".")) continue;
      const full = join(dir, name);
      const st = statSync(full);
      if (st.isDirectory()) {
        if (name === "node_modules" || name === ".next") continue;
        walk(full);
        continue;
      }
      if (!/\.(tsx?|mts|cts)$/.test(name)) continue;
      const source = read(full);
      const m = source.match(pattern);
      if (m) {
        for (let i = 0; i < m.length; i++) {
          hits.push(full);
        }
      }
    }
  };
  walk(srcDir);
  return hits;
};

const contentSource = read(contentPath);
const bodyLayoutSource = read(join(panelsDir, "WorkspaceBodyLayout.tsx"));
const panelSource = read(join(panelsDir, "Panel.tsx"));
const leftSource = read(join(panelsDir, "LeftPanel.tsx"));
const rightSource = read(join(panelsDir, "RightPanel.tsx"));
const bottomSource = read(join(panelsDir, "BottomPanel.tsx"));
const panelsBarrelSource = read(join(panelsDir, "index.ts"));
const statePanelState = read(join(stateDir, "PanelState.ts"));
const stateContext = read(join(stateDir, "PanelContext.tsx"));
const stateProvider = read(join(stateDir, "PanelProvider.tsx"));
const stateHook = read(join(stateDir, "usePanelState.ts"));
const stateBarrel = read(join(stateDir, "index.ts"));
const allStateSources = collectTsSources(stateDir).join("\n");

/* -------------------------------------------------------------------------- */
/* A. Files                                                                   */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux27.state.dir.exists",
  existsSync(stateDir) && statSync(stateDir).isDirectory(),
  stateDir
);

const statePresent = existsSync(stateDir)
  ? readdirSync(stateDir).filter((name) => !name.startsWith("."))
  : [];
const statePresentSet = new Set(statePresent);

for (const file of STATE_FILES) {
  assertCase(
    `ux27.file.${file}`,
    statePresentSet.has(file),
    join(stateDir, file)
  );
}

/* -------------------------------------------------------------------------- */
/* B. PanelState / defaults / PanelId                                         */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux27.panelId",
  /export\s+type\s+PanelId\s*=/.test(statePanelState) &&
    /"left"/.test(statePanelState) &&
    /"right"/.test(statePanelState) &&
    /"bottom"/.test(statePanelState),
  "PanelId = left | right | bottom"
);

assertCase(
  "ux27.default.readonly",
  /export\s+const\s+DEFAULT_PANEL_STATE\s*:\s*Readonly<\s*PanelState\s*>/.test(
    statePanelState
  ),
  "DEFAULT_PANEL_STATE: Readonly<PanelState>"
);

assertCase(
  "ux27.default.values",
  /leftWidth:\s*280/.test(statePanelState) &&
    /rightWidth:\s*280/.test(statePanelState) &&
    /bottomHeight:\s*240/.test(statePanelState),
  "defaults 280 / 280 / 240 (UX-2.10 Planning sync)"
);

assertCase(
  "ux27.no.dock.import",
  !/from\s+["'][^"']*dock[^"']*["']/i.test(allStateSources) &&
    !/\bDOCK_TOKENS\b|\bUI_TOKENS\b/.test(allStateSources),
  "state/ does not import dock tokens"
);

/* -------------------------------------------------------------------------- */
/* C. Context nested state                                                    */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux27.context.nestedState",
  /interface\s+PanelContextValue\s*\{[\s\S]*?\bstate\s*:\s*PanelState\b/.test(
    stateContext
  ),
  "PanelContextValue.state: PanelState"
);

assertCase(
  "ux27.context.api",
  /collapseLeft/.test(stateContext) &&
    /expandLeft/.test(stateContext) &&
    /toggleLeft/.test(stateContext) &&
    /setLeftWidth/.test(stateContext) &&
    /collapseRight/.test(stateContext) &&
    /setRightWidth/.test(stateContext) &&
    /collapseBottom/.test(stateContext) &&
    /setBottomHeight/.test(stateContext),
  "collapse/expand/toggle/setters for all panels"
);

/* -------------------------------------------------------------------------- */
/* D. Provider + clamps + hook                                                */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux27.provider.exists",
  /export\s+function\s+PanelProvider\b/.test(stateProvider) &&
    /\buseState\b/.test(stateProvider),
  "PanelProvider uses useState"
);

assertCase(
  "ux27.setters.clamp",
  /Math\.max\s*\(\s*180\s*,/.test(stateProvider) ||
    (/Math\.max\s*\(\s*PANEL_MIN_SIZE\s*,/.test(stateProvider) &&
      /PANEL_MIN_SIZE\s*=\s*180/.test(statePanelState)),
  "setters clamp Math.max(180, …)"
);

assertCase(
  "ux27.hook.exists",
  /export\s+function\s+usePanelState\b/.test(stateHook) &&
    /throw\s+new\s+Error/.test(stateHook),
  "usePanelState throws if provider missing"
);

assertCase(
  "ux27.state.barrel",
  /PanelProvider/.test(stateBarrel) &&
    /usePanelState/.test(stateBarrel) &&
    /DEFAULT_PANEL_STATE/.test(stateBarrel) &&
    /PanelId/.test(stateBarrel),
  "state/index.ts exports"
);

/* -------------------------------------------------------------------------- */
/* E. Provider ownership                                                      */
/* -------------------------------------------------------------------------- */

const providerOpenTags = collectSrcMatches(/<PanelProvider[\s>]/g);
assertCase(
  "ux27.provider.exactlyOnce",
  providerOpenTags.length === 1,
  `PanelProvider opens=${providerOpenTags.length} paths=${[
    ...new Set(providerOpenTags),
  ].join(", ")}`
);

assertCase(
  "ux27.provider.onlyInWorkspaceContent",
  providerOpenTags.length === 1 &&
    /WorkspaceContent\.tsx$/.test(providerOpenTags[0] ?? ""),
  `sole owner=${providerOpenTags[0] ?? "none"}`
);

assertCase(
  "ux27.content.wraps.BodyLayout",
  /<PanelProvider[\s>][\s\S]*?<WorkspaceBodyLayout>\s*\{workspace\}\s*<\/WorkspaceBodyLayout>[\s\S]*?<\/PanelProvider>/.test(
    contentSource.replace(/\r\n/g, "\n")
  ),
  "WorkspaceContent → PanelProvider → BodyLayout"
);

assertCase(
  "ux27.content.noHooks",
  !/\buse(State|Reducer|Effect|Memo|Callback|Ref|Context|LayoutEffect|ImperativeHandle|EffectEvent)\s*[<(]/.test(
    contentSource
  ),
  "WorkspaceContent has no hooks"
);

/* -------------------------------------------------------------------------- */
/* F. BodyLayout + wrappers                                                   */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux27.body.usesHook",
  /usePanelState\s*\(/.test(bodyLayoutSource) &&
    /\bstate\b/.test(bodyLayoutSource),
  "WorkspaceBodyLayout uses usePanelState / state"
);

assertCase(
  "ux27.body.forwards.collapsedSize",
  /collapsed=\{state\.leftCollapsed\}/.test(bodyLayoutSource) &&
    /size=\{state\.leftWidth\}/.test(bodyLayoutSource) &&
    /collapsed=\{state\.rightCollapsed\}/.test(bodyLayoutSource) &&
    /size=\{state\.rightWidth\}/.test(bodyLayoutSource) &&
    /collapsed=\{state\.bottomCollapsed\}/.test(bodyLayoutSource) &&
    /size=\{state\.bottomHeight\}/.test(bodyLayoutSource),
  "BodyLayout forwards collapsed + size"
);

assertCase(
  "ux27.canvas.unchanged",
  (bodyLayoutSource.match(/data-workspace-canvas(?=[\s>=])/g) ?? []).length ===
    1 &&
    /data-workspace-canvas[\s\S]*?>\s*\{children\}\s*</.test(bodyLayoutSource),
  "canvas ownership unchanged"
);

assertCase(
  "ux27.wrappers.forward",
  /size=\{size\}/.test(leftSource) &&
    /sizeKey=["']left["']/.test(leftSource) &&
    /size=\{size\}/.test(rightSource) &&
    /sizeKey=["']right["']/.test(rightSource) &&
    /size=\{size\}/.test(bottomSource) &&
    /sizeKey=["']bottom["']/.test(bottomSource),
  "wrappers forward size + sizeKey"
);

/* -------------------------------------------------------------------------- */
/* G. Panel CSS vars / no hardcoded sizes / children mounted                  */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux27.panel.cssVars",
  /PANEL_CSS_VARS/.test(panelSource) &&
    /--workspace-left-width/.test(panelSource) &&
    /--workspace-right-width/.test(panelSource) &&
    /--workspace-bottom-height/.test(panelSource),
  "PANEL_CSS_VARS present"
);

assertCase(
  "ux27.panel.noExpandedSize",
  !/EXPANDED_SIZE/.test(panelSource) &&
    !/w-\[320px\]/.test(panelSource) &&
    !/w-\[340px\]/.test(panelSource) &&
    !/h-\[220px\]/.test(panelSource),
  "no EXPANDED_SIZE / Tailwind hardcoded sizes"
);

assertCase(
  "ux27.panel.childrenAlwaysMounted",
  /\{children\}/.test(panelSource) &&
    !/collapsed\s*\?\s*null/.test(panelSource) &&
    !/collapsed\s*\?\s*undefined/.test(panelSource),
  "children always mounted (no collapsed ? null)"
);

/* -------------------------------------------------------------------------- */
/* H. No direct storage / no resize in state (UX-2.8 amend)                   */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux27.no.directStorage",
  !DIRECT_STORAGE_RE.test(allStateSources),
  "no localStorage/indexedDB directly in panels/state"
);

const stateFilesExceptProvider = [
  statePanelState,
  stateContext,
  stateHook,
  stateBarrel,
].join("\n");

assertCase(
  "ux27.no.persistence.exceptProvider",
  !PERSISTENCE_FACADE_RE.test(stateFilesExceptProvider),
  "persist/save/restore/load only allowed in PanelProvider (UX-2.8 facade)"
);

assertCase(
  "ux27.provider.persistenceViaFacade",
  !PERSISTENCE_FACADE_RE.test(stateProvider) ||
    /from\s+["'][^"']*persistence[^"']*["']/.test(stateProvider),
  "PanelProvider load/save must go through persistence facade (UX-2.8)"
);

assertCase(
  "ux27.no.resizeDrag",
  !/\bimport\b[^;]*ResizeHandle/.test(allStateSources) &&
    !/\bpointerdown\b|\bonPointer(Down|Move|Up)\b|\bdraggable\b/.test(
      allStateSources
    ),
  "no resize/drag APIs in panels/state"
);

/* -------------------------------------------------------------------------- */
/* I. Barrel                                                                  */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux27.panels.barrel",
  /PanelProvider/.test(panelsBarrelSource) &&
    /usePanelState/.test(panelsBarrelSource) &&
    /DEFAULT_PANEL_STATE/.test(panelsBarrelSource) &&
    /PanelId/.test(panelsBarrelSource),
  "panels/index.ts re-exports state API"
);

const pkg = read(packagePath);
assertCase(
  "ux27.package.script",
  /"validate:ux-2\.7"\s*:/.test(pkg),
  "validate:ux-2.7 in package.json"
);

/* -------------------------------------------------------------------------- */
/* J. Delegates                                                               */
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

const ux25 = runNpm("validate:ux-2.5");
assertCase("ux27.delegate.ux-2.5", ux25.ok, ux25.detail);

const ux26 = runNpm("validate:ux-2.6");
assertCase("ux27.delegate.ux-2.6", ux26.ok, ux26.detail);

const workspaceArch = runNpm("validate:workspace-architecture");
assertCase(
  "ux27.delegate.workspace-architecture",
  workspaceArch.ok,
  workspaceArch.detail
);

const designTokens = runNpm("validate:design-tokens-v2");
assertCase(
  "ux27.delegate.design-tokens-v2",
  designTokens.ok,
  designTokens.detail
);

const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
  cwd: repoRoot,
  encoding: "utf8",
  shell: true,
});
assertCase(
  "ux27.typescript",
  tsc.status === 0,
  tsc.status === 0
    ? "PASS"
    : `${tsc.stdout ?? ""}\n${tsc.stderr ?? ""}`.trim().slice(-800)
);

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "ux-2.7-panel-state",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — ux-2.7-panel-state"
    : `\nFAIL — ux-2.7-panel-state (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
