/**
 * UX-2.14 — Panel Status & Workspace Feedback gate.
 * Presentational only; PanelState / persistence / resize / focus / modes frozen.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const workspaceDir = join(repoRoot, "src/components/workspace");
const statusDir = join(workspaceDir, "status");
const panelsDir = join(workspaceDir, "panels");
const stateDir = join(panelsDir, "state");
const persistenceDir = join(panelsDir, "persistence");
const resizeDir = join(panelsDir, "resize");
const focusDir = join(workspaceDir, "focus");
const modesDir = join(workspaceDir, "modes");
const packagePath = join(repoRoot, "package.json");
const docPath = join(repoRoot, "docs/UX-2.14-panel-status.md");
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

const hasJsxComponent = (source: string, name: string): boolean =>
  new RegExp(`<${name}\\b`).test(source);

const statusSource = collectTsSources(statusDir).join("\n");
const visualStateSource = read(join(statusDir, "PanelVisualState.ts"));
const panelStatusSource = read(join(statusDir, "PanelStatus.tsx"));
const statusBarrel = read(join(statusDir, "index.ts"));
const headerSource = read(join(panelsDir, "PanelHeader.tsx"));
const panelSource = read(join(panelsDir, "Panel.tsx"));
const leftSource = read(join(panelsDir, "LeftPanel.tsx"));
const rightSource = read(join(panelsDir, "RightPanel.tsx"));
const bottomSource = read(join(panelsDir, "BottomPanel.tsx"));
const bodyLayoutSource = read(join(panelsDir, "WorkspaceBodyLayout.tsx"));
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
/* A. status/ structure + barrel                                              */
/* -------------------------------------------------------------------------- */

const statusFiles = [
  "PanelVisualState.ts",
  "PanelStatus.tsx",
  "StatusDot.tsx",
  "StatusBadge.tsx",
  "StatusChip.tsx",
  "LoadingSkeleton.tsx",
  "PanelBusyOverlay.tsx",
  "index.ts",
];
for (const f of statusFiles) {
  assertCase(
    `ux214.status.file.${f}`,
    existsSync(join(statusDir, f)),
    `workspace/status/${f} present`
  );
}

assertCase(
  "ux214.status.barrel",
  /PanelVisualState/.test(statusBarrel) &&
    /PanelStatus/.test(statusBarrel) &&
    /StatusDot/.test(statusBarrel) &&
    /StatusBadge/.test(statusBarrel) &&
    /StatusChip/.test(statusBarrel) &&
    /LoadingSkeleton/.test(statusBarrel) &&
    /PanelBusyOverlay/.test(statusBarrel),
  "status barrel exports type + components"
);

assertCase(
  "ux214.workspace.barrel.noStatus",
  !/PanelStatus/.test(workspaceBarrel) &&
    !/PanelVisualState/.test(workspaceBarrel) &&
    !/from\s+["']\.\/status/.test(workspaceBarrel),
  "public workspace barrel does not export status/"
);

/* -------------------------------------------------------------------------- */
/* B. PanelVisualState contract + PanelStatus children                        */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux214.visualState.contract",
  /export\s+type\s+PanelVisualState\s*=/.test(visualStateSource) &&
    /"idle"/.test(visualStateSource) &&
    /"active"/.test(visualStateSource) &&
    /"loading"/.test(visualStateSource) &&
    /"busy"/.test(visualStateSource) &&
    /"empty"/.test(visualStateSource) &&
    /"warning"/.test(visualStateSource) &&
    /"error"/.test(visualStateSource) &&
    /"success"/.test(visualStateSource),
  "PanelVisualState.ts exports full union"
);

assertCase(
  "ux214.visualState.notInPanelStatus",
  !/export\s+type\s+PanelVisualState\s*=/.test(panelStatusSource) &&
    /from\s+["']\.\/PanelVisualState["']/.test(panelStatusSource),
  "PanelStatus imports PanelVisualState; does not redefine it"
);

assertCase(
  "ux214.panelStatus.children",
  /children\??:\s*ReactNode/.test(panelStatusSource) ||
    /children\??:\s*React\.ReactNode/.test(panelStatusSource),
  "PanelStatus accepts optional children"
);

assertCase(
  "ux214.panelStatus.noLabelProp",
  !/\blabel\??:\s*/.test(panelStatusSource),
  "PanelStatus does not expose a label prop"
);

/* -------------------------------------------------------------------------- */
/* C. PanelHeader additive props                                              */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux214.header.status",
  /status\?:\s*ReactNode/.test(headerSource) ||
    /status\?:\s*React\.ReactNode/.test(headerSource),
  "PanelHeader declares status?"
);

assertCase(
  "ux214.header.badge",
  /badge\?:\s*ReactNode/.test(headerSource) ||
    /badge\?:\s*React\.ReactNode/.test(headerSource),
  "PanelHeader declares badge?"
);

assertCase(
  "ux214.header.chips",
  /chips\?:\s*ReactNode/.test(headerSource) ||
    /chips\?:\s*React\.ReactNode/.test(headerSource),
  "PanelHeader declares chips?"
);

/* -------------------------------------------------------------------------- */
/* D. Static wiring — component presence (not copy strings)                   */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux214.wire.left.PanelStatus",
  hasJsxComponent(leftSource, "PanelStatus"),
  "LeftPanel mounts <PanelStatus"
);

assertCase(
  "ux214.wire.left.StatusBadge",
  hasJsxComponent(leftSource, "StatusBadge"),
  "LeftPanel mounts <StatusBadge"
);

assertCase(
  "ux214.wire.right.PanelStatus",
  hasJsxComponent(rightSource, "PanelStatus"),
  "RightPanel mounts <PanelStatus"
);

assertCase(
  "ux214.wire.right.StatusBadge",
  hasJsxComponent(rightSource, "StatusBadge"),
  "RightPanel mounts <StatusBadge"
);

assertCase(
  "ux214.wire.right.StatusChip",
  hasJsxComponent(rightSource, "StatusChip"),
  "RightPanel mounts <StatusChip"
);

assertCase(
  "ux214.wire.bottom.PanelStatus",
  hasJsxComponent(bottomSource, "PanelStatus"),
  "BottomPanel mounts <PanelStatus"
);

assertCase(
  "ux214.wire.bottom.StatusBadge",
  hasJsxComponent(bottomSource, "StatusBadge"),
  "BottomPanel mounts <StatusBadge"
);

assertCase(
  "ux214.wire.bottom.StatusChip",
  hasJsxComponent(bottomSource, "StatusChip"),
  "BottomPanel mounts <StatusChip"
);

assertCase(
  "ux214.wire.body.StatusChip",
  hasJsxComponent(bodyLayoutSource, "StatusChip"),
  "WorkspaceBodyLayout mounts <StatusChip"
);

/* -------------------------------------------------------------------------- */
/* E. PanelBusyOverlay not mounted                                            */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux214.busyOverlay.exists",
  /export\s+function\s+PanelBusyOverlay/.test(
    read(join(statusDir, "PanelBusyOverlay.tsx"))
  ),
  "PanelBusyOverlay exported"
);

assertCase(
  "ux214.busyOverlay.notMounted",
  !hasImportPath(leftSource, "PanelBusyOverlay") &&
    !hasImportPath(rightSource, "PanelBusyOverlay") &&
    !hasImportPath(bottomSource, "PanelBusyOverlay") &&
    !hasImportPath(bodyLayoutSource, "PanelBusyOverlay") &&
    !hasJsxComponent(leftSource, "PanelBusyOverlay") &&
    !hasJsxComponent(rightSource, "PanelBusyOverlay") &&
    !hasJsxComponent(bottomSource, "PanelBusyOverlay") &&
    !hasJsxComponent(bodyLayoutSource, "PanelBusyOverlay"),
  "PanelBusyOverlay not imported/mounted in panel chrome or BodyLayout"
);

/* -------------------------------------------------------------------------- */
/* F. Isolation + frozen APIs                                                 */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux214.status.forbidden.imports",
  !hasImportPath(statusSource, "PanelState") &&
    !hasImportPath(statusSource, "/PanelProvider") &&
    !hasImportPath(statusSource, "panels/state") &&
    !hasImportPath(statusSource, "persistence") &&
    !hasImportPath(statusSource, "/resize") &&
    !hasImportPath(statusSource, "/focus") &&
    !hasImportPath(statusSource, "/modes") &&
    !hasImportPath(statusSource, "session") &&
    !hasImportPath(statusSource, "/Session") &&
    !/usePanelState/.test(statusSource) &&
    !/usePanelResize/.test(statusSource) &&
    !/useActivePanel/.test(statusSource) &&
    !/useWorkspaceMode/.test(statusSource),
  "status/ forbids Session/Persistence/PanelState/resize/focus/modes"
);

assertCase(
  "ux214.panel.unchanged",
  /export\s+function\s+Panel\b/.test(panelSource) &&
    !/status\?:/.test(panelSource) &&
    !/badge\?:/.test(panelSource) &&
    !/chips\?:/.test(panelSource),
  "Panel.tsx not extended with status/badge/chips"
);

assertCase(
  "ux214.panelState.unchanged",
  /export\s+interface\s+PanelState\s*\{/.test(panelStateSource) &&
    /leftCollapsed:\s*boolean/.test(panelStateSource) &&
    /rightCollapsed:\s*boolean/.test(panelStateSource) &&
    /bottomCollapsed:\s*boolean/.test(panelStateSource) &&
    /leftWidth:\s*number/.test(panelStateSource) &&
    /rightWidth:\s*number/.test(panelStateSource) &&
    /bottomHeight:\s*number/.test(panelStateSource),
  "PanelState shape unchanged"
);

assertCase(
  "ux214.architecture.untouched",
  /export\s+function\s+PanelProvider/.test(panelProviderSource) &&
    /version:\s*1/.test(allPersistenceSources) &&
    /computeNextSize|ResizeSession/.test(allResizeSources) &&
    /PlanningMode|WorkspaceMode/.test(allModesSources) &&
    existsSync(join(focusDir, "ActivePanelProvider.tsx")),
  "Provider / persistence / resize / modes / focus still present"
);

/* -------------------------------------------------------------------------- */
/* G. Docs + package                                                          */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux214.doc.exists",
  existsSync(docPath) &&
    /UX-2\.14/.test(doc) &&
    /PanelVisualState/.test(doc) &&
    /status\?/.test(doc),
  "docs/UX-2.14-panel-status.md present"
);

assertCase(
  "ux214.roadmap.status",
  /UX-2\.14/.test(roadmap) &&
    (/Panel Status/.test(roadmap) || /Workspace Feedback/.test(roadmap)) &&
    (/COMPLETE \(awaiting/.test(roadmap) ||
      /UX-2\.14\s*=\s*COMPLETE/.test(roadmap)) &&
    /Toolbar & Action Refinement/.test(roadmap) &&
    /Iconography/.test(roadmap) &&
    /Workspace Polish/.test(roadmap),
  "roadmap marks UX-2.14 panel status; 2.15–2.17 resequence"
);

assertCase(
  "ux214.package.script",
  /"validate:ux-2\.14"\s*:/.test(pkg),
  "validate:ux-2.14 in package.json"
);

/* -------------------------------------------------------------------------- */
/* H. Delegates — UX-2.13 + tsc + eslint                                      */
/* -------------------------------------------------------------------------- */

if (process.env.UX_SKIP_DELEGATES !== "1") {
  const ux213 = spawnSync("npx", ["tsx", "scripts/validate-ux-2.13.ts"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
    env: { ...process.env, UX_SKIP_DELEGATES: "1" },
  });
  assertCase(
    "ux214.delegate.ux-2.13",
    ux213.status === 0,
    ux213.status === 0
      ? "PASS (leaf)"
      : `${ux213.stdout ?? ""}\n${ux213.stderr ?? ""}`.trim().slice(-1200)
  );

  const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
  });
  assertCase(
    "ux214.typescript",
    tsc.status === 0,
    tsc.status === 0
      ? "PASS"
      : `${tsc.stdout ?? ""}\n${tsc.stderr ?? ""}`.trim().slice(-1200)
  );

  const eslint = spawnSync(
    "npx",
    [
      "eslint",
      "src/components/workspace/status",
      "src/components/workspace/panels/PanelHeader.tsx",
      "src/components/workspace/panels/LeftPanel.tsx",
      "src/components/workspace/panels/RightPanel.tsx",
      "src/components/workspace/panels/BottomPanel.tsx",
      "src/components/workspace/panels/WorkspaceBodyLayout.tsx",
      "scripts/validate-ux-2.14.ts",
    ],
    {
      cwd: repoRoot,
      encoding: "utf8",
      shell: true,
    }
  );
  assertCase(
    "ux214.eslint",
    eslint.status === 0,
    eslint.status === 0
      ? "PASS"
      : `${eslint.stdout ?? ""}\n${eslint.stderr ?? ""}`.trim().slice(-1200)
  );
} else {
  assertCase(
    "ux214.delegate.skipped",
    true,
    "UX_SKIP_DELEGATES=1 — leaf suite skipped"
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "ux-2.14-panel-status",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — ux-2.14-panel-status"
    : `\nFAIL — ux-2.14-panel-status (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
