/**
 * UX-2.12 — Empty States / Contextual Actions / Hints gate.
 * Presentational only; PanelState / persistence / resize / modes frozen.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const workspaceDir = join(repoRoot, "src/components/workspace");
const panelsDir = join(workspaceDir, "panels");
const emptyDir = join(panelsDir, "empty");
const actionsDir = join(workspaceDir, "actions");
const hintsDir = join(workspaceDir, "hints");
const contentDir = join(panelsDir, "content");
const stateDir = join(panelsDir, "state");
const persistenceDir = join(panelsDir, "persistence");
const resizeDir = join(panelsDir, "resize");
const modesDir = join(workspaceDir, "modes");
const packagePath = join(repoRoot, "package.json");
const docPath = join(repoRoot, "docs/UX-2.12-empty-states.md");
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

const emptySource = collectTsSources(emptyDir).join("\n");
const actionsSource = collectTsSources(actionsDir).join("\n");
const hintsSource = collectTsSources(hintsDir).join("\n");
const emptyStateSource = read(join(emptyDir, "EmptyState.tsx"));
const contextActionSource = read(join(actionsDir, "ContextAction.tsx"));
const contextActionsSource = read(join(actionsDir, "ContextActions.tsx"));
const hintSource = read(join(hintsDir, "Hint.tsx"));
const hintGroupSource = read(join(hintsDir, "HintGroup.tsx"));
const headerSource = read(join(panelsDir, "PanelHeader.tsx"));
const panelSource = read(join(panelsDir, "Panel.tsx"));
const leftSource = read(join(panelsDir, "LeftPanel.tsx"));
const rightSource = read(join(panelsDir, "RightPanel.tsx"));
const bodyLayoutSource = read(join(panelsDir, "WorkspaceBodyLayout.tsx"));
const explorerSource = read(join(contentDir, "ExplorerContent.tsx"));
const inspectorSource = read(join(contentDir, "InspectorContent.tsx"));
const consoleSource = read(join(contentDir, "ConsoleContent.tsx"));
const panelEmptyStateSource = read(join(contentDir, "PanelEmptyState.tsx"));
const emptyBarrel = read(join(emptyDir, "index.ts"));
const actionsBarrel = read(join(actionsDir, "index.ts"));
const hintsBarrel = read(join(hintsDir, "index.ts"));
const workspaceBarrel = read(join(workspaceDir, "index.ts"));
const panelStateSource = read(join(stateDir, "PanelState.ts"));
const panelProviderSource = read(join(stateDir, "PanelProvider.tsx"));
const allPersistenceSources = collectTsSources(persistenceDir).join("\n");
const allResizeSources = collectTsSources(resizeDir).join("\n");
const allModesSources = collectTsSources(modesDir).join("\n");
const pkg = read(packagePath);
const doc = read(docPath);
const roadmap = read(roadmapPath);

/* -------------------------------------------------------------------------- */
/* A. Directory structure + barrels                                           */
/* -------------------------------------------------------------------------- */

const emptyFiles = [
  "EmptyState.tsx",
  "EmptyIcon.tsx",
  "EmptyTitle.tsx",
  "EmptyDescription.tsx",
  "EmptyAction.tsx",
  "index.ts",
];
for (const f of emptyFiles) {
  assertCase(
    `ux212.empty.file.${f}`,
    existsSync(join(emptyDir, f)),
    `panels/empty/${f} present`
  );
}

const actionFiles = ["ContextAction.tsx", "ContextActions.tsx", "index.ts"];
for (const f of actionFiles) {
  assertCase(
    `ux212.actions.file.${f}`,
    existsSync(join(actionsDir, f)),
    `workspace/actions/${f} present`
  );
}

const hintFiles = ["Hint.tsx", "HintBadge.tsx", "HintGroup.tsx", "index.ts"];
for (const f of hintFiles) {
  assertCase(
    `ux212.hints.file.${f}`,
    existsSync(join(hintsDir, f)),
    `workspace/hints/${f} present`
  );
}

assertCase(
  "ux212.empty.barrel",
  /export\s+\{\s*EmptyState\s*\}/.test(emptyBarrel) &&
    /EmptyStateProps/.test(emptyBarrel),
  "empty barrel exports EmptyState + props"
);

assertCase(
  "ux212.actions.barrel",
  /ContextActions/.test(actionsBarrel) &&
    /ContextActionItem/.test(actionsBarrel) &&
    /ContextActionsProps/.test(actionsBarrel),
  "actions barrel exports ContextActions + frozen types"
);

assertCase(
  "ux212.hints.barrel",
  /HintGroup/.test(hintsBarrel) &&
    /HintProps/.test(hintsBarrel) &&
    /HintGroupProps/.test(hintsBarrel),
  "hints barrel exports Hint/HintGroup + props"
);

assertCase(
  "ux212.workspace.barrel.unchanged",
  !/EmptyState/.test(workspaceBarrel) &&
    !/ContextActions/.test(workspaceBarrel) &&
    !/HintGroup/.test(workspaceBarrel) &&
    !/from\s+["']\.\/empty/.test(workspaceBarrel) &&
    !/from\s+["']\.\/actions/.test(workspaceBarrel) &&
    !/from\s+["']\.\/hints/.test(workspaceBarrel),
  "public workspace barrel does not export empty/actions/hints"
);

/* -------------------------------------------------------------------------- */
/* B. API Freeze                                                              */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux212.emptyState.api",
  /export\s+type\s+EmptyStateProps/.test(emptyStateSource) &&
    /icon\?:\s*ReactNode/.test(emptyStateSource) &&
    /title:\s*string/.test(emptyStateSource) &&
    /description\?:\s*string/.test(emptyStateSource) &&
    /action\?:\s*ReactNode/.test(emptyStateSource),
  "EmptyStateProps: icon? title description? action?"
);

assertCase(
  "ux212.emptyState.noExtraApi",
  !/variant\?:/.test(emptyStateSource) &&
    !/size\?:/.test(emptyStateSource) &&
    !/align(?:ment)?\?:/.test(emptyStateSource),
  "EmptyStateProps has no variant/size/alignment"
);

assertCase(
  "ux212.contextActionItem.api",
  /export\s+type\s+ContextActionItem\s*=\s*\{/.test(contextActionSource) &&
    /label:\s*string/.test(contextActionSource) &&
    /ariaLabel\?:\s*string/.test(contextActionSource) &&
    /disabled\?:\s*boolean/.test(contextActionSource) &&
    /onClick\?:\s*\(\)\s*=>\s*void/.test(contextActionSource),
  "ContextActionItem frozen fields present"
);

assertCase(
  "ux212.contextActionItem.noExtra",
  !/\bicon\?:/.test(contextActionSource) &&
    !/\bvariant\?:/.test(contextActionSource) &&
    !/\btooltip\?:/.test(contextActionSource) &&
    !/\bshortcut\?:/.test(contextActionSource) &&
    !/\bcolor\?:/.test(contextActionSource) &&
    !/\bdanger\?:/.test(contextActionSource) &&
    !/\bsize\?:/.test(contextActionSource) &&
    !/\bloading\?:/.test(contextActionSource),
  "ContextActionItem rejects icon/variant/tooltip/etc."
);

assertCase(
  "ux212.contextActions.api",
  /export\s+type\s+ContextActionsProps\s*=\s*\{/.test(contextActionsSource) &&
    /actions:\s*ContextActionItem\[\]/.test(contextActionsSource) &&
    /orientation\?:\s*"horizontal"\s*\|\s*"vertical"/.test(
      contextActionsSource
    ),
  "ContextActionsProps: actions[] + orientation?"
);

assertCase(
  "ux212.hint.api",
  /export\s+type\s+HintProps\s*=\s*\{/.test(hintSource) &&
    /variant\?:\s*"tip"\s*\|\s*"info"/.test(hintSource) &&
    /children:\s*ReactNode/.test(hintSource),
  "HintProps: variant? + children"
);

assertCase(
  "ux212.hintGroup.api",
  /export\s+type\s+HintGroupProps\s*=\s*\{/.test(hintGroupSource) &&
    /children:\s*ReactNode/.test(hintGroupSource) &&
    !/orientation\?:/.test(hintGroupSource) &&
    !/title\?:/.test(hintGroupSource) &&
    !/spacing\?:/.test(hintGroupSource),
  "HintGroupProps: children only"
);

assertCase(
  "ux212.emptyState.a11y",
  /role=["']status["']/.test(emptyStateSource),
  "EmptyState role=status"
);

/* -------------------------------------------------------------------------- */
/* C. PanelHeader + Panel.tsx                                                 */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux212.header.actionsProp",
  /actions\?:\s*ReactNode/.test(headerSource),
  "PanelHeaderProps includes actions?: ReactNode"
);

assertCase(
  "ux212.header.rendersActions",
  /\{actions\s*!=\s*null\s*\?\s*actions\s*:\s*null\}/.test(headerSource) ||
    /\{actions\}/.test(headerSource),
  "PanelHeader renders actions between title and toggle"
);

assertCase(
  "ux212.panel.unchanged",
  /export\s+type\s+PanelProps\s*=\s*\{/.test(panelSource) &&
    /title:\s*string/.test(panelSource) &&
    /position:\s*PanelPosition/.test(panelSource) &&
    /children:\s*ReactNode/.test(panelSource) &&
    !/actions\?:/.test(panelSource) &&
    !/EmptyState/.test(panelSource) &&
    !/ContextActions/.test(panelSource) &&
    !/HintGroup/.test(panelSource),
  "Panel.tsx API unchanged; no empty/actions/hints"
);

assertCase(
  "ux212.panelEmptyState.kept",
  existsSync(join(contentDir, "PanelEmptyState.tsx")) &&
    /export\s+function\s+PanelEmptyState/.test(panelEmptyStateSource),
  "PanelEmptyState.tsx kept on disk"
);

/* -------------------------------------------------------------------------- */
/* D. Integration                                                             */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux212.left.contextActions",
  /ContextActions/.test(leftSource) &&
    /actions=\{/.test(leftSource) &&
    /label:\s*["']New["']/.test(leftSource),
  "LeftPanel wires static ContextActions via PanelHeader"
);

assertCase(
  "ux212.right.contextActions",
  /ContextActions/.test(rightSource) && /actions=\{/.test(rightSource),
  "RightPanel wires ContextActions via PanelHeader"
);

assertCase(
  "ux212.explorer.emptyState",
  /EmptyState/.test(explorerSource) &&
    /from\s+["'][^"']*empty[^"']*["']/.test(explorerSource) &&
    !/PanelEmptyState/.test(explorerSource),
  "ExplorerContent uses EmptyState (not PanelEmptyState)"
);

assertCase(
  "ux212.inspector.emptyState",
  /EmptyState/.test(inspectorSource) &&
    /from\s+["'][^"']*empty[^"']*["']/.test(inspectorSource) &&
    !/PanelEmptyState/.test(inspectorSource),
  "InspectorContent uses EmptyState (not PanelEmptyState)"
);

assertCase(
  "ux212.console.emptyState",
  /EmptyState/.test(consoleSource) &&
    /from\s+["'][^"']*empty[^"']*["']/.test(consoleSource) &&
    !/PanelEmptyState/.test(consoleSource),
  "ConsoleContent uses EmptyState (not PanelEmptyState)"
);

assertCase(
  "ux212.body.hintGroup",
  /HintGroup/.test(bodyLayoutSource) &&
    /from\s+["'][^"']*hints[^"']*["']/.test(bodyLayoutSource) &&
    /data-workspace-canvas/.test(bodyLayoutSource),
  "WorkspaceBodyLayout mounts HintGroup on canvas"
);

assertCase(
  "ux212.noDomainBranching",
  !/series\.length/.test(explorerSource + inspectorSource + consoleSource) &&
    !/!\s*selection\b/.test(inspectorSource) &&
    !/\bselection\s*[=!]/.test(inspectorSource) &&
    !/\.length\s*===\s*0/.test(explorerSource + inspectorSource + consoleSource),
  "content shells do not branch on series.length / selection"
);

/* -------------------------------------------------------------------------- */
/* E. Package isolation + forbidden imports                                   */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux212.isolation.empty",
  !hasImportPath(emptySource, "/actions") &&
    !hasImportPath(emptySource, "/hints") &&
    !hasImportPath(emptySource, "workspace/actions") &&
    !hasImportPath(emptySource, "workspace/hints"),
  "empty/ does not import actions/ or hints/"
);

assertCase(
  "ux212.isolation.actions",
  !hasImportPath(actionsSource, "/empty") &&
    !hasImportPath(actionsSource, "/hints") &&
    !hasImportPath(actionsSource, "panels/empty") &&
    !hasImportPath(actionsSource, "workspace/hints"),
  "actions/ does not import empty/ or hints/"
);

assertCase(
  "ux212.isolation.hints",
  !hasImportPath(hintsSource, "/empty") &&
    !hasImportPath(hintsSource, "/actions") &&
    !hasImportPath(hintsSource, "panels/empty") &&
    !hasImportPath(hintsSource, "workspace/actions"),
  "hints/ does not import empty/ or actions/"
);

const newTrees = emptySource + "\n" + actionsSource + "\n" + hintsSource;

assertCase(
  "ux212.forbidden.imports",
  !hasImportPath(newTrees, "PanelState") &&
    !hasImportPath(newTrees, "PanelProvider") &&
    !hasImportPath(newTrees, "persistence") &&
    !hasImportPath(newTrees, "/resize") &&
    !hasImportPath(newTrees, "/modes") &&
    !/usePanelState/.test(newTrees) &&
    !/usePanelResize/.test(newTrees) &&
    !/useWorkspaceMode/.test(newTrees) &&
    !hasImportPath(newTrees, "session") &&
    !hasImportPath(newTrees, "WindowManager") &&
    !hasImportPath(newTrees, "docking"),
  "new trees forbid state/persistence/resize/modes/session/docking"
);

assertCase(
  "ux212.architecture.untouched",
  /export\s+(?:type|interface)\s+PanelState\b/.test(panelStateSource) &&
    /export\s+function\s+PanelProvider/.test(panelProviderSource) &&
    /version:\s*1/.test(allPersistenceSources) &&
    /computeNextSize|ResizeSession/.test(allResizeSources) &&
    /PlanningMode|WorkspaceMode/.test(allModesSources),
  "PanelState / Provider / persistence / resize / modes still present"
);

/* -------------------------------------------------------------------------- */
/* F. Docs + package                                                          */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux212.doc.exists",
  existsSync(docPath) &&
    /UX-2\.12/.test(doc) &&
    /EmptyState/.test(doc) &&
    /ContextActionItem/.test(doc),
  "docs/UX-2.12-empty-states.md present"
);

assertCase(
  "ux212.roadmap.status",
  /UX-2\.12/.test(roadmap) &&
    (/Empty States/.test(roadmap) || /Contextual Actions/.test(roadmap)) &&
    (/COMPLETE \(awaiting/.test(roadmap) ||
      /UX-2\.12\s*=\s*COMPLETE/.test(roadmap)),
  "roadmap marks UX-2.12 COMPLETE (awaiting review)"
);

assertCase(
  "ux212.package.script",
  /"validate:ux-2\.12"\s*:/.test(pkg),
  "validate:ux-2.12 in package.json"
);

/* -------------------------------------------------------------------------- */
/* G. Delegates — regression UX-2.7 → UX-2.11                                 */
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
  assertCase("ux212.delegate.ux-2.7", ux27.ok, ux27.detail);

  const ux28 = runLeafValidator("scripts/validate-ux-2.8.ts");
  assertCase("ux212.delegate.ux-2.8", ux28.ok, ux28.detail);

  const ux29 = runLeafValidator("scripts/validate-ux-2.9.ts");
  assertCase("ux212.delegate.ux-2.9", ux29.ok, ux29.detail);

  const ux210 = runLeafValidator("scripts/validate-ux-2.10.ts");
  assertCase("ux212.delegate.ux-2.10", ux210.ok, ux210.detail);

  const ux211 = runLeafValidator("scripts/validate-ux-2.11.ts");
  assertCase("ux212.delegate.ux-2.11", ux211.ok, ux211.detail);

  const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
  });
  assertCase(
    "ux212.typescript",
    tsc.status === 0,
    tsc.status === 0
      ? "PASS"
      : `${tsc.stdout ?? ""}\n${tsc.stderr ?? ""}`.trim().slice(-1200)
  );
} else {
  assertCase(
    "ux212.delegate.skipped",
    true,
    "UX_SKIP_DELEGATES=1 — leaf suite skipped"
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "ux-2.12-empty-states",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — ux-2.12-empty-states"
    : `\nFAIL — ux-2.12-empty-states (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
