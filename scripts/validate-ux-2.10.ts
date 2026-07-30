/**
 * UX-2.10 — Planning Mode Foundation gate.
 * Modes are pure PanelState producers; never consumers.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const workspaceDir = join(repoRoot, "src/components/workspace");
const modesDir = join(workspaceDir, "modes");
const panelsDir = join(workspaceDir, "panels");
const stateDir = join(panelsDir, "state");
const contentDir = join(panelsDir, "content");
const resizeDir = join(panelsDir, "resize");
const packagePath = join(repoRoot, "package.json");

const MODE_FILES = [
  "WorkspaceMode.ts",
  "PlanningMode.ts",
  "WorkspaceModeContext.tsx",
  "WorkspaceModeProvider.tsx",
  "useWorkspaceMode.ts",
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

const modesPresent = existsSync(modesDir)
  ? readdirSync(modesDir).filter((name) => !name.startsWith("."))
  : [];
const modesSet = new Set(modesPresent);

const modeTypeSource = read(join(modesDir, "WorkspaceMode.ts"));
const planningSource = read(join(modesDir, "PlanningMode.ts"));
const contextSource = read(join(modesDir, "WorkspaceModeContext.tsx"));
const providerSource = read(join(modesDir, "WorkspaceModeProvider.tsx"));
const hookSource = read(join(modesDir, "useWorkspaceMode.ts"));
const barrelSource = read(join(modesDir, "index.ts"));
const panelStateSource = read(join(stateDir, "PanelState.ts"));
const panelProviderSource = read(join(stateDir, "PanelProvider.tsx"));
const contentSource = read(join(workspaceDir, "WorkspaceContent.tsx"));
const workspaceBarrel = read(join(workspaceDir, "index.ts"));
const allModesSources = collectTsSources(modesDir).join("\n");
const leftSource = read(join(panelsDir, "LeftPanel.tsx"));
const rightSource = read(join(panelsDir, "RightPanel.tsx"));
const bottomSource = read(join(panelsDir, "BottomPanel.tsx"));
const allContentSources = collectTsSources(contentDir).join("\n");
const allResizeSources = collectTsSources(resizeDir).join("\n");
const pkg = read(packagePath);

const contentNorm = contentSource.replace(/\r\n/g, "\n");

/* -------------------------------------------------------------------------- */
/* A. Architecture — exact file set                                           */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux210.modes.dir.exists",
  existsSync(modesDir) && statSync(modesDir).isDirectory(),
  modesDir
);

for (const file of MODE_FILES) {
  assertCase(
    `ux210.file.${file}`,
    modesSet.has(file),
    join(modesDir, file)
  );
}

assertCase(
  "ux210.modes.files.exact",
  modesPresent.length === MODE_FILES.length &&
    MODE_FILES.every((f) => modesSet.has(f)),
  `present=[${modesPresent.sort().join(", ")}]`
);

/* -------------------------------------------------------------------------- */
/* B. WorkspaceMode / PlanningMode                                            */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux210.type.WorkspaceModeId",
  /export\s+type\s+WorkspaceModeId\s*=\s*["']planning["']/.test(
    modeTypeSource
  ),
  'WorkspaceModeId = "planning"'
);

assertCase(
  "ux210.type.WorkspaceMode",
  /export\s+interface\s+WorkspaceMode\s*\{/.test(modeTypeSource) &&
    /\bid:\s*WorkspaceModeId\b/.test(modeTypeSource) &&
    /\btitle:\s*string\b/.test(modeTypeSource) &&
    /\bapply\s*\(\s*\):\s*PanelState\b/.test(modeTypeSource),
  "WorkspaceMode { id, title, apply(): PanelState }"
);

assertCase(
  "ux210.planning.const",
  /export\s+const\s+PlanningMode\s*:\s*WorkspaceMode\s*=/.test(
    planningSource
  ) &&
    !/\bclass\s+PlanningMode\b/.test(planningSource) &&
    !/\bcreatePlanningMode\s*\(/.test(planningSource),
  "export const PlanningMode (no class/factory)"
);

assertCase(
  "ux210.planning.id",
  /id:\s*["']planning["']/.test(planningSource) &&
    /title:\s*["']Planning["']/.test(planningSource),
  "PlanningMode id/title"
);

assertCase(
  "ux210.planning.sizes",
  /REF_WIDTH\s*=\s*1120/.test(planningSource) &&
    /REF_HEIGHT\s*=\s*1200/.test(planningSource) &&
    /leftWidth:\s*LEFT_WIDTH/.test(planningSource) &&
    /rightWidth:\s*RIGHT_WIDTH/.test(planningSource) &&
    /bottomHeight:\s*BOTTOM_HEIGHT/.test(planningSource) &&
    /leftCollapsed:\s*false/.test(planningSource) &&
    /rightCollapsed:\s*false/.test(planningSource) &&
    /bottomCollapsed:\s*false/.test(planningSource),
  "Planning apply() → 280/280/240 visible"
);

assertCase(
  "ux210.planning.syncDefaults",
  /leftWidth:\s*280/.test(panelStateSource) &&
    /rightWidth:\s*280/.test(panelStateSource) &&
    /bottomHeight:\s*240/.test(panelStateSource),
  "DEFAULT_PANEL_STATE synced 280/280/240"
);

assertCase(
  "ux210.planning.noReact",
  !/\bfrom\s+["']react["']/.test(planningSource) &&
    !/\buse(State|Effect|Context)\b/.test(planningSource),
  "PlanningMode has no React"
);

/* -------------------------------------------------------------------------- */
/* C. Provider / registry / applyMode                                         */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux210.registry.private",
  /const\s+registry\s*:\s*Record<\s*WorkspaceModeId\s*,\s*WorkspaceMode\s*>/.test(
    providerSource
  ) &&
    /planning:\s*PlanningMode/.test(providerSource) &&
    !/\bexport\s+(const|let|var|type|\{)[\s\S]{0,40}\bregistry\b/.test(
      providerSource
    ) &&
    !/\bexport\s+\{[^}]*\bregistry\b/.test(barrelSource) &&
    !/\bexport\s+.*\bregistry\b/.test(barrelSource),
  "private registry; not exported"
);

assertCase(
  "ux210.context.api",
  /currentMode:\s*WorkspaceMode/.test(contextSource) &&
    /setMode\s*\(\s*id:\s*WorkspaceModeId\s*\)/.test(contextSource) &&
    /applyMode\s*\(\s*id\?:\s*WorkspaceModeId\s*\)\s*:\s*PanelState/.test(
      contextSource
    ),
  "currentMode / setMode / applyMode(id?): PanelState"
);

assertCase(
  "ux210.applyMode.timingSafe",
  /const\s+mode\s*=\s*registry\[id\]/.test(providerSource) &&
    /setCurrentMode\s*\(\s*mode\s*\)/.test(providerSource) &&
    /return\s+mode\.apply\s*\(\s*\)/.test(providerSource) &&
    /return\s+currentMode\.apply\s*\(\s*\)/.test(providerSource),
  "applyMode(id) returns registry[id].apply() immediately"
);

assertCase(
  "ux210.provider.noEffects",
  !/\buseEffect\b/.test(providerSource) &&
    !/\baddEventListener\b/.test(providerSource) &&
    !/\blocalStorage\b/.test(providerSource) &&
    !/\bindexedDB\b/i.test(providerSource),
  "Provider: no effects / listeners / storage"
);

assertCase(
  "ux210.hook.guard",
  /export\s+function\s+useWorkspaceMode\s*\(/.test(hookSource) &&
    /useContext\s*\(\s*WorkspaceModeContext\s*\)/.test(hookSource) &&
    /throw\s+new\s+Error/.test(hookSource) &&
    /WorkspaceModeProvider/.test(hookSource),
  "useWorkspaceMode throws outside Provider"
);

assertCase(
  "ux210.barrel.exports",
  /WorkspaceMode/.test(barrelSource) &&
    /WorkspaceModeId/.test(barrelSource) &&
    /PlanningMode/.test(barrelSource) &&
    /WorkspaceModeContext/.test(barrelSource) &&
    /WorkspaceModeProvider/.test(barrelSource) &&
    /useWorkspaceMode/.test(barrelSource),
  "modes barrel exports frozen public API"
);

assertCase(
  "ux210.workspace.barrel.noModes",
  !/from\s+["']\.\/modes["']/.test(workspaceBarrel) &&
    !/\bPlanningMode\b/.test(workspaceBarrel) &&
    !/\bWorkspaceModeProvider\b/.test(workspaceBarrel),
  "public workspace barrel does not export modes"
);

/* -------------------------------------------------------------------------- */
/* D. Integration                                                             */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux210.mount.hierarchy",
  /<WorkspaceModeProvider>[\s\S]*?<PanelProvider[\s>][\s\S]*?<PanelResizeProvider>[\s\S]*?<WorkspaceBodyLayout>[\s\S]*?<\/WorkspaceBodyLayout>[\s\S]*?<\/PanelResizeProvider>[\s\S]*?<\/PanelProvider>[\s\S]*?<\/WorkspaceModeProvider>/.test(
    contentNorm
  ),
  "Mode → Panel → Resize → BodyLayout"
);

assertCase(
  "ux210.mount.initialState",
  /initialState=\{PlanningMode\.apply\(\)\}/.test(contentNorm),
  "PanelProvider initialState={PlanningMode.apply()}"
);

assertCase(
  "ux210.panelProvider.initialStateProp",
  /initialState\?:\s*PanelState/.test(panelProviderSource) &&
    /initialState\s*\?\?\s*DEFAULT_PANEL_STATE/.test(panelProviderSource),
  "PanelProvider accepts initialState?"
);

assertCase(
  "ux210.content.noHooks",
  !/\buse(State|Reducer|Effect|Memo|Callback|Ref|Context|LayoutEffect|ImperativeHandle|EffectEvent)\s*[<(]/.test(
    contentSource
  ),
  "WorkspaceContent remains hook-free"
);

/* -------------------------------------------------------------------------- */
/* E. Isolation — modes pure; panels never import modes                       */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux210.modes.noStorage",
  !/\blocalStorage\b/.test(allModesSources) &&
    !/\bindexedDB\b/i.test(allModesSources) &&
    !/\bsupabase\b/i.test(allModesSources),
  "modes/: no storage APIs"
);

assertCase(
  "ux210.modes.noListeners",
  !/\baddEventListener\b/.test(allModesSources) &&
    !/\bonkeydown\b/i.test(allModesSources) &&
    !/\bshortcut/i.test(allModesSources),
  "modes/: no listeners / shortcuts"
);

assertCase(
  "ux210.modes.neverConsumePanelState",
  !/\busePanelState\b/.test(allModesSources) &&
    !/from\s+["'][^"']*PanelContext[^"']*["']/.test(allModesSources) &&
    !/from\s+["'][^"']*panels\/state[^"']*["']/.test(allModesSources.replace(
      /from\s+["'][^"']*PanelState["']/g,
      ""
    )),
  "modes produce PanelState type only; never consume live state"
);

assertCase(
  "ux210.panels.noModesImport",
  !/from\s+["'][^"']*modes[^"']*["']/.test(leftSource) &&
    !/from\s+["'][^"']*modes[^"']*["']/.test(rightSource) &&
    !/from\s+["'][^"']*modes[^"']*["']/.test(bottomSource) &&
    !/from\s+["'][^"']*modes[^"']*["']/.test(allContentSources) &&
    !/from\s+["'][^"']*modes[^"']*["']/.test(allResizeSources),
  "Left/Right/Bottom/content/resize never import modes"
);

assertCase(
  "ux210.package.script",
  /"validate:ux-2\.10"\s*:/.test(pkg),
  "validate:ux-2.10 in package.json"
);

/* -------------------------------------------------------------------------- */
/* F. Delegates                                                               */
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

const ux29 = runNpm("validate:ux-2.9");
assertCase("ux210.delegate.ux-2.9", ux29.ok, ux29.detail);

const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
  cwd: repoRoot,
  encoding: "utf8",
  shell: true,
});
assertCase(
  "ux210.typescript",
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
  phase: "ux-2.10-planning-mode",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — ux-2.10-planning-mode"
    : `\nFAIL — ux-2.10-planning-mode (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
