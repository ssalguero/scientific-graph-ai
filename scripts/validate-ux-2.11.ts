/**
 * UX-2.11 — Collapse / Expand UI gate.
 * Chrome only; PanelState / persistence / resize APIs frozen.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const workspaceDir = join(repoRoot, "src/components/workspace");
const panelsDir = join(workspaceDir, "panels");
const stateDir = join(panelsDir, "state");
const persistenceDir = join(panelsDir, "persistence");
const resizeDir = join(panelsDir, "resize");
const packagePath = join(repoRoot, "package.json");
const docPath = join(repoRoot, "docs/UX-2.11-collapse-expand.md");
const roadmapPath = join(repoRoot, "docs/UX-2.0-roadmap.md");

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

const headerSource = read(join(panelsDir, "PanelHeader.tsx"));
const panelSource = read(join(panelsDir, "Panel.tsx"));
const railSource = read(join(panelsDir, "PanelExpandRail.tsx"));
const bodyLayoutSource = read(join(panelsDir, "WorkspaceBodyLayout.tsx"));
const leftSource = read(join(panelsDir, "LeftPanel.tsx"));
const rightSource = read(join(panelsDir, "RightPanel.tsx"));
const bottomSource = read(join(panelsDir, "BottomPanel.tsx"));
const panelStateSource = read(join(stateDir, "PanelState.ts"));
const panelContextSource = read(join(stateDir, "PanelContext.tsx"));
const panelProviderSource = read(join(stateDir, "PanelProvider.tsx"));
const serializerSource = read(join(persistenceDir, "PanelSerializer.ts"));
const deserializerSource = read(join(persistenceDir, "PanelDeserializer.ts"));
const panelsBarrel = read(join(panelsDir, "index.ts"));
const workspaceBarrel = read(join(workspaceDir, "index.ts"));
const pkg = read(packagePath);
const doc = read(docPath);
const roadmap = read(roadmapPath);
const allResizeSources = collectTsSources(resizeDir).join("\n");
const allPersistenceSources = collectTsSources(persistenceDir).join("\n");

/* -------------------------------------------------------------------------- */
/* A. PanelHeader — generic toggle affordance                                 */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux211.header.exists",
  existsSync(join(panelsDir, "PanelHeader.tsx")),
  "PanelHeader.tsx present"
);

assertCase(
  "ux211.header.props",
  /collapsed\?:\s*boolean/.test(headerSource) &&
    /onToggle\?:\s*\(\)\s*=>\s*void/.test(headerSource),
  "PanelHeaderProps: collapsed? + onToggle?"
);

assertCase(
  "ux211.header.toggle",
  /data-panel-toggle/.test(headerSource) &&
    /onClick=\{onToggle\}/.test(headerSource) &&
    /type=["']button["']/.test(headerSource),
  "toggle button: type=button + data-panel-toggle + onClick"
);

assertCase(
  "ux211.header.aria",
  /aria-expanded=\{expanded\}/.test(headerSource) &&
    /aria-label=\{label\}/.test(headerSource) &&
    /Collapse \$\{title\}/.test(headerSource) &&
    /Expand \$\{title\}/.test(headerSource),
  "aria-expanded + aria-label from title"
);

assertCase(
  "ux211.header.icons",
  /getIcon\(["']collapse["']\)/.test(headerSource) &&
    /getIcon\(["']expand["']\)/.test(headerSource) &&
    /from\s+["']@\/lib\/ui\/icons["']/.test(headerSource),
  "uses existing icons.ts glyphs only"
);

assertCase(
  "ux211.header.noDomainNames",
  !/\bExplorer\b/.test(headerSource) &&
    !/\bInspector\b/.test(headerSource) &&
    !/\bConsole\b/.test(headerSource),
  "PanelHeader has no Explorer/Inspector/Console knowledge"
);

assertCase(
  "ux211.header.noInternals",
  !/from\s+["'][^"']*PanelState[^"']*["']/.test(headerSource) &&
    !/from\s+["'][^"']*\/state[^"']*["']/.test(headerSource) &&
    !/from\s+["'][^"']*persistence[^"']*["']/.test(headerSource) &&
    !/from\s+["'][^"']*resize[^"']*["']/.test(headerSource) &&
    !/usePanelState/.test(headerSource) &&
    !/usePanelResize/.test(headerSource),
  "PanelHeader does not import state/persistence/resize internals"
);

/* -------------------------------------------------------------------------- */
/* B. Wrappers wire toggle*                                                   */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux211.left.toggle",
  /toggleLeft/.test(leftSource) &&
    /usePanelState/.test(leftSource) &&
    /onToggle=\{handleToggle\}/.test(leftSource),
  "LeftPanel wires toggleLeft via usePanelState"
);

assertCase(
  "ux211.right.toggle",
  /toggleRight/.test(rightSource) &&
    /usePanelState/.test(rightSource) &&
    /onToggle=\{handleToggle\}/.test(rightSource),
  "RightPanel wires toggleRight via usePanelState"
);

assertCase(
  "ux211.bottom.toggle",
  /toggleBottom/.test(bottomSource) &&
    /usePanelState/.test(bottomSource) &&
    /onToggle=\{handleToggle\}/.test(bottomSource),
  "BottomPanel wires toggleBottom via usePanelState"
);

assertCase(
  "ux211.wrappers.focusCollapse",
  /focusRailAfterCollapse\(["']left["']\)/.test(leftSource) &&
    /focusRailAfterCollapse\(["']right["']\)/.test(rightSource) &&
    /focusRailAfterCollapse\(["']bottom["']\)/.test(bottomSource),
  "wrappers move focus to expand rail on collapse"
);

/* -------------------------------------------------------------------------- */
/* C. Expand rails in WorkspaceBodyLayout                                     */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux211.rails.file",
  existsSync(join(panelsDir, "PanelExpandRail.tsx")),
  "PanelExpandRail.tsx present"
);

assertCase(
  "ux211.rails.attrs",
  /data-panel-expand=\{position\}/.test(railSource) ||
    /data-panel-expand=["']left["']/.test(railSource),
  "data-panel-expand attribute"
);

assertCase(
  "ux211.rails.exports",
  /LeftExpandRail/.test(railSource) &&
    /RightExpandRail/.test(railSource) &&
    /BottomExpandRail/.test(railSource),
  "Left/Right/BottomExpandRail exports"
);

assertCase(
  "ux211.rails.inBodyLayout",
  /LeftExpandRail/.test(bodyLayoutSource) &&
    /RightExpandRail/.test(bodyLayoutSource) &&
    /BottomExpandRail/.test(bodyLayoutSource) &&
    /leftCollapsed/.test(bodyLayoutSource) &&
    /rightCollapsed/.test(bodyLayoutSource) &&
    /bottomCollapsed/.test(bodyLayoutSource),
  "rails mounted in WorkspaceBodyLayout when collapsed"
);

assertCase(
  "ux211.rails.expandCalls",
  /expandLeft/.test(bodyLayoutSource) &&
    /expandRight/.test(bodyLayoutSource) &&
    /expandBottom/.test(bodyLayoutSource) &&
    /focusToggleAfterExpand/.test(bodyLayoutSource),
  "rails call expand* + focusToggleAfterExpand"
);

assertCase(
  "ux211.rails.notInPanel",
  !/ExpandRail/.test(panelSource) &&
    !/data-panel-expand/.test(panelSource),
  "Panel.tsx does not host expand rails"
);

/* -------------------------------------------------------------------------- */
/* D. Animation + collapsed mount contract                                    */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux211.animated.class",
  /animated/.test(panelSource) &&
    /transition-\[width,height\]/.test(panelSource) &&
    /duration-200/.test(panelSource),
  "Panel animated class for width/height transition"
);

assertCase(
  "ux211.animated.disableOnResize",
  /session\s*==\s*null/.test(bodyLayoutSource) &&
    /usePanelResize/.test(bodyLayoutSource) &&
    /animated=\{animated\}/.test(bodyLayoutSource),
  "animated only when resize.session == null"
);

assertCase(
  "ux211.animated.noInlineTransition",
  !/transition:\s*['"]/.test(panelSource) &&
    !/style=\{\{[^}]*transition/.test(panelSource),
  "no inline transition styles on Panel"
);

assertCase(
  "ux211.collapsed.geometry",
  (/width:\s*0/.test(panelSource) || /width:\s*0\s*\}/.test(panelSource)) &&
    (/height:\s*0/.test(panelSource) || /height:\s*0\s*\}/.test(panelSource)),
  "collapsed still width/height 0"
);

assertCase(
  "ux211.children.mounted",
  !/collapsed\s*\?\s*null/.test(panelSource) &&
    !/collapsed\s*\?\s*null/.test(leftSource) &&
    !/collapsed\s*\?\s*null/.test(rightSource) &&
    !/collapsed\s*\?\s*null/.test(bottomSource) &&
    /\{children\}/.test(panelSource),
  "children always mounted; collapse does not unmount"
);

assertCase(
  "ux211.handles.hide",
  /showLeftHandle\s*=\s*!state\.leftCollapsed/.test(bodyLayoutSource) &&
    /showRightHandle\s*=\s*!state\.rightCollapsed/.test(bodyLayoutSource) &&
    /showBottomHandle\s*=\s*!state\.bottomCollapsed/.test(bodyLayoutSource),
  "resize handles still hidden when collapsed"
);

/* -------------------------------------------------------------------------- */
/* E. API / persistence / resize freezes                                      */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux211.state.shape",
  /leftCollapsed/.test(panelStateSource) &&
    /rightCollapsed/.test(panelStateSource) &&
    /bottomCollapsed/.test(panelStateSource) &&
    /leftWidth/.test(panelStateSource) &&
    /rightWidth/.test(panelStateSource) &&
    /bottomHeight/.test(panelStateSource),
  "PanelState shape unchanged (collapsed + sizes)"
);

assertCase(
  "ux211.context.api",
  /toggleLeft\(\):\s*void/.test(panelContextSource) &&
    /toggleRight\(\):\s*void/.test(panelContextSource) &&
    /toggleBottom\(\):\s*void/.test(panelContextSource) &&
    /expandLeft\(\):\s*void/.test(panelContextSource) &&
    /expandRight\(\):\s*void/.test(panelContextSource) &&
    /expandBottom\(\):\s*void/.test(panelContextSource),
  "PanelContext public API unchanged"
);

assertCase(
  "ux211.persistence.schema",
  /version:\s*1/.test(serializerSource) &&
    /version\s*===\s*1/.test(deserializerSource) &&
    /collapsed/.test(serializerSource),
  "persistence schema v1 + collapsed intact"
);

assertCase(
  "ux211.persistence.noUx211Chrome",
  !/PanelHeader/.test(allPersistenceSources) &&
    !/ExpandRail/.test(allPersistenceSources) &&
    !/data-panel-toggle/.test(allPersistenceSources) &&
    !/data-panel-expand/.test(allPersistenceSources),
  "persistence does not reference collapse chrome"
);

assertCase(
  "ux211.resize.untouched",
  !/data-panel-toggle/.test(allResizeSources) &&
    !/ExpandRail/.test(allResizeSources) &&
    !/focusRailAfterCollapse/.test(allResizeSources) &&
    /computeNextSize/.test(allResizeSources),
  "resize/ unchanged for collapse chrome; math still present"
);

assertCase(
  "ux211.workspace.barrel.frozen",
  !/ExpandRail/.test(workspaceBarrel) &&
    !/PanelHeader/.test(workspaceBarrel) &&
    /WorkspaceLayout/.test(workspaceBarrel),
  "workspace public barrel not expanded with panel chrome"
);

assertCase(
  "ux211.panels.barrel.rails",
  /LeftExpandRail/.test(panelsBarrel) &&
    /RightExpandRail/.test(panelsBarrel) &&
    /BottomExpandRail/.test(panelsBarrel),
  "panels barrel exports expand rails"
);

/* -------------------------------------------------------------------------- */
/* F. No toolbar / menu rewire                                                */
/* -------------------------------------------------------------------------- */

const ux211Sources = [
  headerSource,
  railSource,
  bodyLayoutSource,
  leftSource,
  rightSource,
  bottomSource,
  panelSource,
].join("\n");

assertCase(
  "ux211.noMenus",
  !/\bFile\s*[▼▾]/.test(ux211Sources) &&
    !/File\s*\/\s*Edit\s*\/\s*View/.test(ux211Sources) &&
    !/\bFileMenu\b/.test(ux211Sources) &&
    !/\bEditMenu\b/.test(ux211Sources) &&
    !/\bViewMenu\b/.test(ux211Sources),
  "no File/Edit/View menus"
);

assertCase(
  "ux211.noToolbarRewire",
  !/AdaptiveToolbar/.test(ux211Sources) &&
    !/from\s+["'][^"']*toolbar[^"']*["']/.test(ux211Sources),
  "no AdaptiveToolbar / toolbar rewire in UX-2.11 surfaces"
);

/* -------------------------------------------------------------------------- */
/* G. Docs + package                                                          */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux211.doc.exists",
  existsSync(docPath) && /UX-2\.11/.test(doc) && /Collapse/.test(doc),
  "docs/UX-2.11-collapse-expand.md present"
);

assertCase(
  "ux211.roadmap.status",
  /UX-2\.11/.test(roadmap) &&
    (/COMPLETE \(awaiting/.test(roadmap) ||
      /UX-2\.11\s*=\s*COMPLETE/.test(roadmap)),
  "roadmap marks UX-2.11 COMPLETE (awaiting review)"
);

assertCase(
  "ux211.package.script",
  /"validate:ux-2\.11"\s*:/.test(pkg),
  "validate:ux-2.11 in package.json"
);

/* -------------------------------------------------------------------------- */
/* H. Delegates — regression UX-2.7 → UX-2.10                                 */
/* -------------------------------------------------------------------------- */

/**
 * Run prior-phase validators as leaf checks (no nested npm/tsc fan-out).
 * Each script still executes its full local assert suite.
 */
const runLeafValidator = (
  scriptFile: string
): { ok: boolean; detail: string } => {
  const r = spawnSync("npx", ["tsx", scriptFile], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
    env: { ...process.env, UX_SKIP_DELEGATES: "1" },
  });
  const out = `${r.stdout ?? ""}\n${r.stderr ?? ""}`.trim();
  return {
    ok: r.status === 0,
    detail: r.status === 0 ? "PASS (leaf)" : out.slice(-1200),
  };
};

const ux27 = runLeafValidator("scripts/validate-ux-2.7.ts");
assertCase("ux211.delegate.ux-2.7", ux27.ok, ux27.detail);

const ux28 = runLeafValidator("scripts/validate-ux-2.8.ts");
assertCase("ux211.delegate.ux-2.8", ux28.ok, ux28.detail);

const ux29 = runLeafValidator("scripts/validate-ux-2.9.ts");
assertCase("ux211.delegate.ux-2.9", ux29.ok, ux29.detail);

const ux210 = runLeafValidator("scripts/validate-ux-2.10.ts");
assertCase("ux211.delegate.ux-2.10", ux210.ok, ux210.detail);

const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
  cwd: repoRoot,
  encoding: "utf8",
  shell: true,
});
assertCase(
  "ux211.typescript",
  tsc.status === 0,
  tsc.status === 0
    ? "PASS"
    : `${tsc.stdout ?? ""}\n${tsc.stderr ?? ""}`.trim().slice(-1200)
);

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "ux-2.11-collapse-expand",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — ux-2.11-collapse-expand"
    : `\nFAIL — ux-2.11-collapse-expand (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
