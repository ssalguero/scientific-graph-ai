/**
 * UX-2.5 — Panel Infrastructure Foundation gate.
 * Shared Panel shell + Header/Body; wrappers compose; no domain content.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const workspaceDir = join(repoRoot, "src/components/workspace");
const panelsDir = join(workspaceDir, "panels");
const contentPath = join(workspaceDir, "WorkspaceContent.tsx");
const packagePath = join(repoRoot, "package.json");

const REQUIRED_FILES = [
  "Panel.tsx",
  "PanelHeader.tsx",
  "PanelBody.tsx",
  "LeftPanel.tsx",
  "RightPanel.tsx",
  "BottomPanel.tsx",
  "WorkspaceBodyLayout.tsx",
  "index.ts",
] as const;

const results: { id: string; pass: boolean; detail: string }[] = [];

const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const read = (path: string): string =>
  existsSync(path) ? readFileSync(path, "utf8") : "";

const contentSource = read(contentPath);
const panelSource = read(join(panelsDir, "Panel.tsx"));
const headerSource = read(join(panelsDir, "PanelHeader.tsx"));
const bodySource = read(join(panelsDir, "PanelBody.tsx"));
const leftSource = read(join(panelsDir, "LeftPanel.tsx"));
const rightSource = read(join(panelsDir, "RightPanel.tsx"));
const bottomSource = read(join(panelsDir, "BottomPanel.tsx"));
const bodyLayoutSource = read(join(panelsDir, "WorkspaceBodyLayout.tsx"));
const panelsBarrelSource = read(join(panelsDir, "index.ts"));
const allPanelSources = existsSync(panelsDir)
  ? readdirSync(panelsDir)
      .filter((name) => !name.startsWith("."))
      .map((name) => read(join(panelsDir, name)))
      .join("\n")
  : "";

/* -------------------------------------------------------------------------- */
/* A. Files                                                                   */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux25.panels.dir.exists",
  existsSync(panelsDir) && statSync(panelsDir).isDirectory(),
  panelsDir
);

const panelPresent = existsSync(panelsDir)
  ? readdirSync(panelsDir).filter((name) => !name.startsWith("."))
  : [];
const panelPresentSet = new Set(panelPresent);

for (const file of REQUIRED_FILES) {
  assertCase(
    `ux25.file.${file}`,
    panelPresentSet.has(file),
    join(panelsDir, file)
  );
}

assertCase(
  "ux25.no.legacy.WorkspacePanel",
  !panelPresentSet.has("LeftWorkspacePanel.tsx") &&
    !panelPresentSet.has("RightWorkspacePanel.tsx") &&
    !panelPresentSet.has("BottomWorkspacePanel.tsx"),
  "legacy *WorkspacePanel.tsx deleted"
);

/* -------------------------------------------------------------------------- */
/* B. Panel shell freeze                                                      */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux25.panel.shellOnly",
  !/from\s+["']\.\/PanelHeader["']/.test(panelSource) &&
    !/from\s+["']\.\/PanelBody["']/.test(panelSource) &&
    /\{children\}/.test(panelSource),
  "Panel does not import Header/Body; renders {children}"
);

assertCase(
  "ux25.panel.layout.flex",
  /\bflex\b/.test(panelSource) &&
    /\bflex-col\b/.test(panelSource) &&
    /\bmin-h-0\b/.test(panelSource) &&
    /\boverflow-hidden\b/.test(panelSource),
  "Panel: flex flex-col min-h-0 overflow-hidden"
);

assertCase(
  "ux25.header.layout.flexNone",
  /\bflex-none\b/.test(headerSource),
  "PanelHeader: flex-none"
);

assertCase(
  "ux25.body.layout.scroll",
  /\bflex-1\b/.test(bodySource) &&
    /\bmin-h-0\b/.test(bodySource) &&
    /\boverflow-auto\b/.test(bodySource),
  "PanelBody: flex-1 min-h-0 overflow-auto"
);

assertCase(
  "ux25.panel.attrs.workspace",
  /data-workspace-panel=\{position\}/.test(panelSource) ||
    /data-workspace-panel=\{/.test(panelSource),
  "data-workspace-panel"
);

assertCase(
  "ux25.panel.attrs.position",
  /data-panel-position=\{position\}/.test(panelSource) ||
    /data-panel-position=\{/.test(panelSource),
  "data-panel-position"
);

assertCase(
  "ux25.panel.attrs.collapsed",
  /data-panel-collapsed=/.test(panelSource),
  "data-panel-collapsed"
);

assertCase(
  "ux25.panel.collapsed.contract",
  (/w-0/.test(panelSource) || /width:\s*0/.test(panelSource)) &&
    (/h-0/.test(panelSource) || /height:\s*0/.test(panelSource)) &&
    /\boverflow-hidden\b/.test(panelSource),
  "collapsed → w-0 / h-0 + overflow-hidden"
);

assertCase(
  "ux25.sizes.left.320",
  /w-\[320px\]/.test(panelSource) || /320/.test(leftSource),
  "left 320px"
);

assertCase(
  "ux25.sizes.right.340",
  /w-\[340px\]/.test(panelSource) || /340/.test(rightSource),
  "right 340px"
);

assertCase(
  "ux25.sizes.bottom.220",
  /h-\[220px\]/.test(panelSource) || /220/.test(bottomSource),
  "bottom 220px"
);

assertCase(
  "ux25.panel.ariaLabel",
  /aria-label=\{title\}/.test(panelSource),
  "aria-label={title}"
);

/* -------------------------------------------------------------------------- */
/* C. Wrappers use Panel + compose Header/Body                                */
/* -------------------------------------------------------------------------- */

const wrapperUsesPanel = (source: string, title: string) =>
  /from\s+["']\.\/Panel["']/.test(source) &&
  /<Panel[\s>]/.test(source) &&
  /from\s+["']\.\/PanelHeader["']/.test(source) &&
  /from\s+["']\.\/PanelBody["']/.test(source) &&
  new RegExp(`title=["']${title}["']`).test(source);

assertCase(
  "ux25.left.usesPanel",
  wrapperUsesPanel(leftSource, "Explorer"),
  "LeftPanel → Panel + Header + Body (Explorer)"
);
assertCase(
  "ux25.right.usesPanel",
  wrapperUsesPanel(rightSource, "Inspector"),
  "RightPanel → Panel + Header + Body (Inspector)"
);
assertCase(
  "ux25.bottom.usesPanel",
  wrapperUsesPanel(bottomSource, "Console"),
  "BottomPanel → Panel + Header + Body (Console)"
);

/* -------------------------------------------------------------------------- */
/* D. Barrel                                                                  */
/* -------------------------------------------------------------------------- */

const barrelHas = {
  Panel: /export\s*\{\s*Panel\s*\}\s*from\s*["']\.\/Panel["']/.test(
    panelsBarrelSource
  ),
  PanelHeader:
    /export\s*\{\s*PanelHeader\s*\}\s*from\s*["']\.\/PanelHeader["']/.test(
      panelsBarrelSource
    ),
  PanelBody:
    /export\s*\{\s*PanelBody\s*\}\s*from\s*["']\.\/PanelBody["']/.test(
      panelsBarrelSource
    ),
  LeftPanel:
    /export\s*\{\s*LeftPanel\s*\}\s*from\s*["']\.\/LeftPanel["']/.test(
      panelsBarrelSource
    ),
  RightPanel:
    /export\s*\{\s*RightPanel\s*\}\s*from\s*["']\.\/RightPanel["']/.test(
      panelsBarrelSource
    ),
  BottomPanel:
    /export\s*\{\s*BottomPanel\s*\}\s*from\s*["']\.\/BottomPanel["']/.test(
      panelsBarrelSource
    ),
  WorkspaceBodyLayout:
    /export\s*\{\s*WorkspaceBodyLayout\s*\}\s*from\s*["']\.\/WorkspaceBodyLayout["']/.test(
      panelsBarrelSource
    ),
};

assertCase(
  "ux25.barrel.exports",
  Object.values(barrelHas).every(Boolean),
  JSON.stringify(barrelHas)
);

/* -------------------------------------------------------------------------- */
/* E. WorkspaceContent composition-only                                       */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux25.content.composes.BodyLayout",
  /from\s+["']\.\/panels["']/.test(contentSource) &&
    /<WorkspaceBodyLayout>\s*\{workspace\}\s*<\/WorkspaceBodyLayout>/.test(
      contentSource.replace(/\r\n/g, "\n")
    ),
  "WorkspaceContent → BodyLayout only"
);

assertCase(
  "ux25.content.noHooks",
  !/\buse(State|Reducer|Effect|Memo|Callback|Ref|Context|LayoutEffect|ImperativeHandle|EffectEvent)\s*[<(]/.test(
    contentSource
  ),
  "WorkspaceContent no hooks"
);

assertCase(
  "ux25.content.noPanelLogic",
  !/\bcollapsed\b/.test(contentSource) &&
    !/<LeftPanel/.test(contentSource) &&
    !/<RightPanel/.test(contentSource) &&
    !/<BottomPanel/.test(contentSource),
  "WorkspaceContent has no panel logic"
);

assertCase(
  "ux25.canvas.unchanged.owner",
  (bodyLayoutSource.match(/data-workspace-canvas(?=[\s>=])/g) ?? []).length ===
    1 &&
    /data-workspace-canvas[\s\S]*?>\s*\{children\}\s*</.test(bodyLayoutSource),
  "canvas still owned by BodyLayout; children direct"
);

/* -------------------------------------------------------------------------- */
/* F. Governance                                                              */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux25.governance.noHooks",
  !/\buse(State|Reducer|Effect|Memo|Callback|Ref|Context|LayoutEffect|ImperativeHandle|EffectEvent)\s*[<(]/.test(
    allPanelSources
  ),
  "no React hooks in panels/*"
);

const panelImportLines = allPanelSources
  .split(/\r?\n/)
  .filter((line) => /^\s*import\s/.test(line));
const domainImportHit = panelImportLines.some((line) => {
  if (
    /from\s+["']react["']/.test(line) ||
    /from\s+["']\.\/[^"']+["']/.test(line)
  ) {
    return false;
  }
  return (
    /graph|analysis|dataset|supabase|math|store|session|window|dock/i.test(
      line
    ) ||
    /@\/app\//.test(line) ||
    /@\/lib\/scientific/.test(line) ||
    /@\/components\/(?!workspace\/panels)/.test(line)
  );
});

assertCase(
  "ux25.governance.noDomainImports",
  !domainImportHit,
  domainImportHit ? "domain-like import detected" : "clean"
);

const hexInPanels =
  /#[0-9a-fA-F]{3,8}\b/.test(allPanelSources) ||
  /\brgba?\s*\(/.test(allPanelSources) ||
  /\bhsl[a]?\s*\(/.test(allPanelSources);

assertCase(
  "ux25.no.hardcoded.colors",
  !hexInPanels,
  hexInPanels ? "hex/rgb/hsl in panels/*" : "clean --app-* / utilities"
);

const pkg = read(packagePath);
assertCase(
  "ux25.package.script",
  /"validate:ux-2\.5"\s*:/.test(pkg),
  "validate:ux-2.5 in package.json"
);

/* -------------------------------------------------------------------------- */
/* G. Delegates                                                               */
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

const workspaceArch = runNpm("validate:workspace-architecture");
assertCase(
  "ux25.delegate.workspace-architecture",
  workspaceArch.ok,
  workspaceArch.detail
);

const designTokens = runNpm("validate:design-tokens-v2");
assertCase(
  "ux25.delegate.design-tokens-v2",
  designTokens.ok,
  designTokens.detail
);

const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
  cwd: repoRoot,
  encoding: "utf8",
  shell: true,
});
assertCase(
  "ux25.typescript",
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
  phase: "ux-2.5-panel-infrastructure",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — ux-2.5-panel-infrastructure"
    : `\nFAIL — ux-2.5-panel-infrastructure (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
