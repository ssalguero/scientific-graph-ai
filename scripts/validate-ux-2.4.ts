/**
 * UX-2.4 — Workspace Panels Foundation gate (amended UX-2.5 for renamed panels).
 * Presentation-only IDE body chrome; D47 shell / props freezes preserved.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const workspaceDir = join(repoRoot, "src/components/workspace");
const panelsDir = join(workspaceDir, "panels");
const contentPath = join(workspaceDir, "WorkspaceContent.tsx");
const layoutPath = join(workspaceDir, "WorkspaceLayout.tsx");
const overlayPanelsPath = join(workspaceDir, "WorkspacePanels.tsx");
const typesPath = join(workspaceDir, "types.ts");
const packagePath = join(repoRoot, "package.json");

/** Core UX-2.4 panel surface files (renamed in UX-2.5). */
const PANEL_CORE_FILES = [
  "LeftPanel.tsx",
  "RightPanel.tsx",
  "BottomPanel.tsx",
  "WorkspaceBodyLayout.tsx",
  "index.ts",
] as const;

/** UX-2.5 shell primitives (allowed alongside UX-2.4 core). */
const PANEL_SHELL_FILES = [
  "Panel.tsx",
  "PanelHeader.tsx",
  "PanelBody.tsx",
] as const;

const ALLOWED_PANEL_FILES = new Set<string>([
  ...PANEL_CORE_FILES,
  ...PANEL_SHELL_FILES,
]);

const results: { id: string; pass: boolean; detail: string }[] = [];

const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const read = (path: string): string =>
  existsSync(path) ? readFileSync(path, "utf8") : "";

const contentSource = read(contentPath);
const layoutSource = read(layoutPath);
const overlayPanelsSource = read(overlayPanelsPath);
const typesSource = read(typesPath);
const bodyLayoutSource = read(join(panelsDir, "WorkspaceBodyLayout.tsx"));
const leftSource = read(join(panelsDir, "LeftPanel.tsx"));
const rightSource = read(join(panelsDir, "RightPanel.tsx"));
const bottomSource = read(join(panelsDir, "BottomPanel.tsx"));
const panelsBarrelSource = read(join(panelsDir, "index.ts"));
const allPanelSources = existsSync(panelsDir)
  ? readdirSync(panelsDir)
      .filter((name) => !name.startsWith("."))
      .map((name) => read(join(panelsDir, name)))
      .join("\n")
  : "";

/* -------------------------------------------------------------------------- */
/* A. panels/ structure                                                       */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux24.panels.dir.exists",
  existsSync(panelsDir) &&
    (existsSync(panelsDir) ? statSync(panelsDir).isDirectory() : false),
  panelsDir
);

const panelPresent = existsSync(panelsDir)
  ? readdirSync(panelsDir).filter((name) => !name.startsWith("."))
  : [];
const panelPresentSet = new Set(panelPresent);

assertCase(
  "ux24.panels.files.core",
  PANEL_CORE_FILES.every((f) => panelPresentSet.has(f)),
  `present=[${panelPresent.sort().join(", ")}] core=[${PANEL_CORE_FILES.join(", ")}]`
);

assertCase(
  "ux24.panels.files.allowedOnly",
  panelPresent.every((f) => ALLOWED_PANEL_FILES.has(f)),
  `present=[${panelPresent.sort().join(", ")}] allowed=[${[...ALLOWED_PANEL_FILES].sort().join(", ")}]`
);

for (const file of PANEL_CORE_FILES) {
  assertCase(
    `ux24.panels.file.${file}`,
    panelPresentSet.has(file),
    join(panelsDir, file)
  );
}

/* -------------------------------------------------------------------------- */
/* B. Barrel exports                                                          */
/* -------------------------------------------------------------------------- */

const panelsBarrelHas = {
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
  "ux24.panels.barrel.exports",
  Object.values(panelsBarrelHas).every(Boolean),
  JSON.stringify(panelsBarrelHas)
);

/* -------------------------------------------------------------------------- */
/* C. Composition + DOM contract                                              */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux24.content.composes.BodyLayout",
  /from\s+["']\.\/panels["']/.test(contentSource) &&
    /<WorkspaceBodyLayout>\s*\{workspace\}\s*<\/WorkspaceBodyLayout>/.test(
      contentSource.replace(/\r\n/g, "\n")
    ),
  "WorkspaceContent → <WorkspaceBodyLayout>{workspace}</WorkspaceBodyLayout>"
);

assertCase(
  "ux24.body.props.childrenOnly",
  /WorkspaceBodyLayoutProps\s*=\s*\{\s*children:\s*ReactNode\s*;\s*\}/.test(
    bodyLayoutSource.replace(/\r\n/g, "\n")
  ) ||
    /type\s+WorkspaceBodyLayoutProps\s*=\s*\{\s*children:\s*React\.ReactNode\s*;\s*\}/.test(
      bodyLayoutSource.replace(/\r\n/g, "\n")
    ),
  "WorkspaceBodyLayoutProps = { children }"
);

const countCanvasAttrs = (source: string) =>
  (source.match(/data-workspace-canvas(?=[\s>=])/g) ?? []).length;

const canvasInBody = countCanvasAttrs(bodyLayoutSource);
const canvasInContent = countCanvasAttrs(contentSource);
const canvasInPanels =
  countCanvasAttrs(leftSource) +
  countCanvasAttrs(rightSource) +
  countCanvasAttrs(bottomSource);

assertCase(
  "ux24.canvas.ownedByBodyLayout",
  canvasInBody === 1 && canvasInContent === 0 && canvasInPanels === 0,
  `body=${canvasInBody} content=${canvasInContent} sidePanels=${canvasInPanels}`
);

const workspaceCount = (contentSource.match(/\{workspace\}/g) ?? []).length;
assertCase(
  "ux24.dom.workspace.once",
  workspaceCount === 1,
  `{workspace} count=${workspaceCount}`
);

assertCase(
  "ux24.dom.children.directChildOfCanvas",
  /data-workspace-canvas[\s\S]*?>\s*\{children\}\s*</.test(bodyLayoutSource),
  "{children} direct child of data-workspace-canvas"
);

assertCase(
  "ux24.dom.canvas.minW0",
  /data-workspace-canvas[\s\S]*?min-w-0/.test(bodyLayoutSource),
  "canvas column min-w-0"
);

assertCase(
  "ux24.panel.marker.left",
  /data-workspace-panel=["']left["']/.test(leftSource) ||
    /position=["']left["']/.test(leftSource),
  'left panel position / marker'
);
assertCase(
  "ux24.panel.marker.right",
  /data-workspace-panel=["']right["']/.test(rightSource) ||
    /position=["']right["']/.test(rightSource),
  'right panel position / marker'
);
assertCase(
  "ux24.panel.marker.bottom",
  /data-workspace-panel=["']bottom["']/.test(bottomSource) ||
    /position=["']bottom["']/.test(bottomSource),
  'bottom panel position / marker'
);

assertCase(
  "ux24.body.composes.LeftPanel",
  /<LeftPanel\s*\/>/.test(bodyLayoutSource) ||
    /<LeftPanel[\s>]/.test(bodyLayoutSource),
  "WorkspaceBodyLayout → LeftPanel"
);
assertCase(
  "ux24.body.composes.RightPanel",
  /<RightPanel\s*\/>/.test(bodyLayoutSource) ||
    /<RightPanel[\s>]/.test(bodyLayoutSource),
  "WorkspaceBodyLayout → RightPanel"
);
assertCase(
  "ux24.body.composes.BottomPanel",
  /<BottomPanel\s*\/>/.test(bodyLayoutSource) ||
    /<BottomPanel[\s>]/.test(bodyLayoutSource),
  "WorkspaceBodyLayout → BottomPanel"
);

assertCase(
  "ux24.placeholder.noMap",
  !/\.map\s*\(/.test(leftSource) &&
    !/\.map\s*\(/.test(rightSource) &&
    !/\.map\s*\(/.test(bottomSource),
  "no .map() in panel wrappers"
);

assertCase(
  "ux24.content.toolbar.header.order",
  /\{toolbar\}[\s\S]*?data-workspace-header[\s\S]*?WorkspaceBodyLayout[\s\S]*?\{workspace\}/.test(
    contentSource
  ),
  "toolbar → header → BodyLayout → {workspace}"
);

/* -------------------------------------------------------------------------- */
/* D. Governance: presentation-only panels                                    */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux24.governance.noHooks",
  !/\buse(State|Reducer|Effect|Memo|Callback|Ref|Context|LayoutEffect|ImperativeHandle|EffectEvent)\s*[<(]/.test(
    allPanelSources
  ),
  "no React hooks in panels/*"
);

const panelImportLines = allPanelSources
  .split(/\r?\n/)
  .filter((line) => /^\s*import\s/.test(line));
const domainImportHit = panelImportLines.some((line) => {
  if (/from\s+["']react["']/.test(line) || /from\s+["']\.\/[^"']+["']/.test(line)) {
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
  "ux24.governance.noDomainImports",
  !domainImportHit,
  domainImportHit ? "domain-like import detected" : "clean"
);

const hexInPanels =
  /#[0-9a-fA-F]{3,8}\b/.test(allPanelSources) ||
  /\brgba?\s*\(/.test(allPanelSources) ||
  /\bhsl[a]?\s*\(/.test(allPanelSources);

assertCase(
  "ux24.no.hardcoded.colors",
  !hexInPanels,
  hexInPanels ? "hex/rgb/hsl in panels/*" : "clean --app-* / utilities"
);

/* -------------------------------------------------------------------------- */
/* E. Frozen shell / overlay / props                                          */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux24.layout.props.frozen",
  /WorkspaceLayoutProps\s*=\s*\{[\s\S]*?themeMode\?:\s*ThemeMode;[\s\S]*?sidebar:\s*ReactNode;[\s\S]*?workspace:\s*ReactNode;[\s\S]*?panels\?:\s*ReactNode;[\s\S]*?className\?:\s*string;[\s\S]*?\}/.test(
    typesSource
  ),
  "WorkspaceLayoutProps shape unchanged"
);

assertCase(
  "ux24.content.props.frozen",
  /WorkspaceContentProps\s*=\s*\{[\s\S]*?toolbar\?:\s*ReactNode;[\s\S]*?workspace:\s*ReactNode;[\s\S]*?\}/.test(
    typesSource
  ),
  "WorkspaceContentProps shape unchanged"
);

assertCase(
  "ux24.layout.shell.slots",
  /\{sidebar\}/.test(layoutSource) &&
    /\{workspace\}/.test(layoutSource) &&
    /\{panels\}/.test(layoutSource) &&
    /<main[\s>]/.test(layoutSource),
  "WorkspaceLayout still renders sidebar | workspace | panels in <main>"
);

assertCase(
  "ux24.overlay.FloatingWindowBridge",
  /FloatingWindowBridge/.test(overlayPanelsSource) &&
    /from\s+["']@\/components\/windows["']/.test(overlayPanelsSource),
  "WorkspacePanels hosts FloatingWindowBridge"
);

assertCase(
  "ux24.overlay.notIdePanels",
  !/LeftPanel|RightPanel|BottomPanel|WorkspaceBodyLayout|LeftWorkspacePanel|RightWorkspacePanel|BottomWorkspacePanel/.test(
    overlayPanelsSource
  ),
  "WorkspacePanels does not import IDE panels"
);

const pkg = read(packagePath);
assertCase(
  "ux24.package.script",
  /"validate:ux-2\.4"\s*:/.test(pkg),
  "validate:ux-2.4 in package.json"
);

/* -------------------------------------------------------------------------- */
/* F. Delegate gates                                                          */
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
  "ux24.delegate.workspace-architecture",
  workspaceArch.ok,
  workspaceArch.detail
);

const designTokens = runNpm("validate:design-tokens-v2");
assertCase(
  "ux24.delegate.design-tokens-v2",
  designTokens.ok,
  designTokens.detail
);

const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
  cwd: repoRoot,
  encoding: "utf8",
  shell: true,
});
assertCase(
  "ux24.typescript",
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
  phase: "ux-2.4-workspace-panels",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — ux-2.4-workspace-panels"
    : `\nFAIL — ux-2.4-workspace-panels (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
