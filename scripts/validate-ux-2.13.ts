/**
 * UX-2.13 — Workspace Orientation / Progressive Disclosure gate.
 * UI-only focus; PanelState / persistence / resize / modes frozen.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const workspaceDir = join(repoRoot, "src/components/workspace");
const focusDir = join(workspaceDir, "focus");
const panelsDir = join(workspaceDir, "panels");
const stateDir = join(panelsDir, "state");
const persistenceDir = join(panelsDir, "persistence");
const resizeDir = join(panelsDir, "resize");
const modesDir = join(workspaceDir, "modes");
const contentDir = join(panelsDir, "content");
const emptyDir = join(panelsDir, "empty");
const actionsDir = join(workspaceDir, "actions");
const hintsDir = join(workspaceDir, "hints");
const packagePath = join(repoRoot, "package.json");
const docPath = join(repoRoot, "docs/UX-2.13-workspace-orientation.md");
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

const hasImportPath = (source: string, needle: string): boolean =>
  new RegExp(
    `from\\s+["'][^"']*${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^"']*["']`
  ).test(source);

const countOccurrences = (source: string, needle: string): number => {
  if (!needle) return 0;
  let count = 0;
  let idx = 0;
  while ((idx = source.indexOf(needle, idx)) !== -1) {
    count += 1;
    idx += needle.length;
  }
  return count;
};

const focusSource = collectTsSources(focusDir).join("\n");
const contextSource = read(join(focusDir, "PanelFocusContext.ts"));
const providerSource = read(join(focusDir, "ActivePanelProvider.tsx"));
const hookSource = read(join(focusDir, "useActivePanel.ts"));
const focusBarrel = read(join(focusDir, "index.ts"));
const panelSource = read(join(panelsDir, "Panel.tsx"));
const headerSource = read(join(panelsDir, "PanelHeader.tsx"));
const railSource = read(join(panelsDir, "PanelExpandRail.tsx"));
const leftSource = read(join(panelsDir, "LeftPanel.tsx"));
const rightSource = read(join(panelsDir, "RightPanel.tsx"));
const bottomSource = read(join(panelsDir, "BottomPanel.tsx"));
const bodyLayoutSource = read(join(panelsDir, "WorkspaceBodyLayout.tsx"));
const contentSource = read(join(workspaceDir, "WorkspaceContent.tsx"));
const workspaceBarrel = read(join(workspaceDir, "index.ts"));
const panelStateSource = read(join(stateDir, "PanelState.ts"));
const panelProviderSource = read(join(stateDir, "PanelProvider.tsx"));
const allStateSources = collectTsSources(stateDir).join("\n");
const allPersistenceSources = collectTsSources(persistenceDir).join("\n");
const allResizeSources = collectTsSources(resizeDir).join("\n");
const allModesSources = collectTsSources(modesDir).join("\n");
const contentTree = collectTsSources(contentDir).join("\n");
const emptyTree = collectTsSources(emptyDir).join("\n");
const actionsTree = collectTsSources(actionsDir).join("\n");
const hintsTree = collectTsSources(hintsDir).join("\n");
const pkg = read(packagePath);
const doc = read(docPath);
const roadmap = read(roadmapPath);

/* -------------------------------------------------------------------------- */
/* A. focus/ structure + barrels                                              */
/* -------------------------------------------------------------------------- */

const focusFiles = [
  "PanelFocusContext.ts",
  "ActivePanelProvider.tsx",
  "useActivePanel.ts",
  "index.ts",
];
for (const f of focusFiles) {
  assertCase(
    `ux213.focus.file.${f}`,
    existsSync(join(focusDir, f)),
    `workspace/focus/${f} present`
  );
}

assertCase(
  "ux213.focus.barrel",
  /ActivePanelProvider/.test(focusBarrel) &&
    /useActivePanel/.test(focusBarrel) &&
    /ActivePanelId/.test(focusBarrel) &&
    /DEFAULT_ACTIVE_PANEL/.test(focusBarrel),
  "focus barrel exports provider, hook, type, default"
);

assertCase(
  "ux213.workspace.barrel.noFocus",
  !/ActivePanelProvider/.test(workspaceBarrel) &&
    !/useActivePanel/.test(workspaceBarrel) &&
    !/from\s+["']\.\/focus/.test(workspaceBarrel),
  "public workspace barrel does not export focus/"
);

/* -------------------------------------------------------------------------- */
/* B. Frozen APIs                                                             */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux213.activePanelId.type",
  /export\s+type\s+ActivePanelId\s*=/.test(contextSource) &&
    /"canvas"/.test(contextSource) &&
    /"left"/.test(contextSource) &&
    /"right"/.test(contextSource) &&
    /"bottom"/.test(contextSource),
  "ActivePanelId frozen union exported"
);

assertCase(
  "ux213.defaultActivePanel",
  /export\s+const\s+DEFAULT_ACTIVE_PANEL/.test(contextSource) &&
    /DEFAULT_ACTIVE_PANEL[^=]*=\s*"canvas"/.test(contextSource),
  "DEFAULT_ACTIVE_PANEL = canvas"
);

assertCase(
  "ux213.provider.useStateDefault",
  /useState\s*<\s*ActivePanelId\s*>\s*\(\s*DEFAULT_ACTIVE_PANEL\s*\)/.test(
    providerSource
  ) || /useState\(\s*DEFAULT_ACTIVE_PANEL\s*\)/.test(providerSource),
  "ActivePanelProvider uses DEFAULT_ACTIVE_PANEL"
);

assertCase(
  "ux213.hook.exists",
  /export\s+function\s+useActivePanel/.test(hookSource),
  "useActivePanel exported"
);

assertCase(
  "ux213.panel.isActive",
  /isActive\?:\s*boolean/.test(panelSource) && /isActive/.test(panelSource),
  "Panel.tsx declares/consumes isActive?"
);

assertCase(
  "ux213.header.isActive",
  /isActive\?:\s*boolean/.test(headerSource) && /isActive/.test(headerSource),
  "PanelHeader.tsx declares/consumes isActive?"
);

assertCase(
  "ux213.rail.isActive",
  /isActive\?:\s*boolean/.test(railSource) && /isActive/.test(railSource),
  "PanelExpandRail.tsx declares/consumes isActive?"
);

assertCase(
  "ux213.dataAttrs.panel",
  /data-panel-id/.test(panelSource) && /data-panel-active/.test(panelSource),
  "Panel exposes data-panel-id + data-panel-active"
);

assertCase(
  "ux213.dataAttrs.canvas",
  /data-panel-id=["']canvas["']/.test(bodyLayoutSource) &&
    /data-panel-active/.test(bodyLayoutSource),
  "Canvas exposes data-panel-id=canvas + data-panel-active"
);

/* -------------------------------------------------------------------------- */
/* C. Activation loci                                                         */
/* -------------------------------------------------------------------------- */

const countSetActive = (source: string) =>
  countOccurrences(source, "setActivePanel(");

assertCase(
  "ux213.locus.left",
  countSetActive(leftSource) === 1,
  `LeftPanel setActivePanel count=${countSetActive(leftSource)} (want 1)`
);

assertCase(
  "ux213.locus.right",
  countSetActive(rightSource) === 1,
  `RightPanel setActivePanel count=${countSetActive(rightSource)} (want 1)`
);

assertCase(
  "ux213.locus.bottom",
  countSetActive(bottomSource) === 1,
  `BottomPanel setActivePanel count=${countSetActive(bottomSource)} (want 1)`
);

assertCase(
  "ux213.locus.body",
  countSetActive(bodyLayoutSource) === 1,
  `WorkspaceBodyLayout setActivePanel count=${countSetActive(bodyLayoutSource)} (want 1)`
);

const childTrees =
  contentTree + "\n" + emptyTree + "\n" + actionsTree + "\n" + hintsTree;

assertCase(
  "ux213.locus.noChildren",
  countSetActive(childTrees) === 0,
  "no setActivePanel in content/empty/actions/hints children"
);

assertCase(
  "ux213.activation.pointerdown",
  /onPointerDown/.test(leftSource) &&
    /onPointerDown/.test(rightSource) &&
    /onPointerDown/.test(bottomSource) &&
    /onPointerDown/.test(bodyLayoutSource),
  "activation uses onPointerDown at loci"
);

assertCase(
  "ux213.mount.provider",
  /ActivePanelProvider/.test(contentSource) &&
    /PanelResizeProvider/.test(contentSource) &&
    /PanelProvider/.test(contentSource),
  "WorkspaceContent mounts ActivePanelProvider under resize/panel"
);

/* -------------------------------------------------------------------------- */
/* D. Isolation + unidirectional                                              */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux213.focus.forbidden.imports",
  !hasImportPath(focusSource, "PanelState") &&
    !hasImportPath(focusSource, "/PanelProvider") &&
    !hasImportPath(focusSource, "panels/state") &&
    !hasImportPath(focusSource, "persistence") &&
    !hasImportPath(focusSource, "/resize") &&
    !hasImportPath(focusSource, "/modes") &&
    !hasImportPath(focusSource, "session") &&
    !hasImportPath(focusSource, "/Session") &&
    !/usePanelState/.test(focusSource) &&
    !/usePanelResize/.test(focusSource) &&
    !/useWorkspaceMode/.test(focusSource),
  "focus/ forbids Session/Persistence/PanelState/resize/modes"
);

assertCase(
  "ux213.unidirectional.state",
  !hasImportPath(allStateSources, "/focus") &&
    !hasImportPath(allStateSources, "ActivePanelProvider") &&
    !/useActivePanel/.test(allStateSources) &&
    !/activePanelId/.test(allStateSources),
  "panels/state does not import focus/ or activePanelId"
);

assertCase(
  "ux213.unidirectional.resize",
  !hasImportPath(allResizeSources, "/focus") &&
    !hasImportPath(allResizeSources, "ActivePanelProvider") &&
    !/useActivePanel/.test(allResizeSources),
  "panels/resize does not import focus/"
);

assertCase(
  "ux213.activePanelId.onlyInFocus",
  !/activePanelId/.test(panelStateSource) &&
    !/activePanelId/.test(allModesSources) &&
    (/activePanelId/.test(focusSource) || /activePanelId/.test(contextSource)),
  "activePanelId lives in focus context, not PanelState/modes"
);

assertCase(
  "ux213.panelState.unchanged",
  /export\s+interface\s+PanelState\s*\{/.test(panelStateSource) &&
    /leftCollapsed:\s*boolean/.test(panelStateSource) &&
    /rightCollapsed:\s*boolean/.test(panelStateSource) &&
    /bottomCollapsed:\s*boolean/.test(panelStateSource) &&
    /leftWidth:\s*number/.test(panelStateSource) &&
    /rightWidth:\s*number/.test(panelStateSource) &&
    /bottomHeight:\s*number/.test(panelStateSource) &&
    !/\bactivePanel\b/.test(panelStateSource),
  "PanelState shape unchanged (no activePanel)"
);

assertCase(
  "ux213.architecture.untouched",
  /export\s+function\s+PanelProvider/.test(panelProviderSource) &&
    /version:\s*1/.test(allPersistenceSources) &&
    /computeNextSize|ResizeSession/.test(allResizeSources) &&
    /PlanningMode|WorkspaceMode/.test(allModesSources),
  "Provider / persistence / resize / modes still present"
);

assertCase(
  "ux213.persistence.noFocusWire",
  !/useActivePanel/.test(allPersistenceSources) &&
    !hasImportPath(allPersistenceSources, "/focus"),
  "persistence does not wire focus/"
);

assertCase(
  "ux213.modes.noFocusWire",
  !/useActivePanel/.test(allModesSources) &&
    !hasImportPath(allModesSources, "/focus"),
  "modes do not wire focus/"
);

/* -------------------------------------------------------------------------- */
/* E. Docs + package                                                          */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux213.doc.exists",
  existsSync(docPath) &&
    /UX-2\.13/.test(doc) &&
    /ActivePanelId/.test(doc) &&
    /DEFAULT_ACTIVE_PANEL/.test(doc),
  "docs/UX-2.13-workspace-orientation.md present"
);

assertCase(
  "ux213.roadmap.status",
  /UX-2\.13/.test(roadmap) &&
    (/Workspace Orientation/.test(roadmap) ||
      /Progressive Disclosure/.test(roadmap)) &&
    (/COMPLETE \(awaiting/.test(roadmap) ||
      /UX-2\.13\s*=\s*COMPLETE/.test(roadmap)) &&
    /Toolbar & Action Refinement/.test(roadmap) &&
    /UX-2\.14/.test(roadmap),
  "roadmap marks UX-2.13 orientation; UX-2.14 toolbar"
);

assertCase(
  "ux213.package.script",
  /"validate:ux-2\.13"\s*:/.test(pkg),
  "validate:ux-2.13 in package.json"
);

/* -------------------------------------------------------------------------- */
/* F. Delegates — regression UX-2.7 → UX-2.12                                 */
/* -------------------------------------------------------------------------- */

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

if (process.env.UX_SKIP_DELEGATES !== "1") {
  const ux27 = runLeafValidator("scripts/validate-ux-2.7.ts");
  assertCase("ux213.delegate.ux-2.7", ux27.ok, ux27.detail);

  const ux28 = runLeafValidator("scripts/validate-ux-2.8.ts");
  assertCase("ux213.delegate.ux-2.8", ux28.ok, ux28.detail);

  const ux29 = runLeafValidator("scripts/validate-ux-2.9.ts");
  assertCase("ux213.delegate.ux-2.9", ux29.ok, ux29.detail);

  const ux210 = runLeafValidator("scripts/validate-ux-2.10.ts");
  assertCase("ux213.delegate.ux-2.10", ux210.ok, ux210.detail);

  const ux211 = runLeafValidator("scripts/validate-ux-2.11.ts");
  assertCase("ux213.delegate.ux-2.11", ux211.ok, ux211.detail);

  const ux212 = runLeafValidator("scripts/validate-ux-2.12.ts");
  assertCase("ux213.delegate.ux-2.12", ux212.ok, ux212.detail);

  const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
  });
  assertCase(
    "ux213.typescript",
    tsc.status === 0,
    tsc.status === 0
      ? "PASS"
      : `${tsc.stdout ?? ""}\n${tsc.stderr ?? ""}`.trim().slice(-1200)
  );
} else {
  assertCase(
    "ux213.delegate.skipped",
    true,
    "UX_SKIP_DELEGATES=1 — leaf suite skipped"
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "ux-2.13-workspace-orientation",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — ux-2.13-workspace-orientation"
    : `\nFAIL — ux-2.13-workspace-orientation (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
