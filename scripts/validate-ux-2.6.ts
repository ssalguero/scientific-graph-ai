/**
 * UX-2.6 — Panel Content Infrastructure gate.
 * Presentational Explorer / Inspector / Console shells in Body slots.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const workspaceDir = join(repoRoot, "src/components/workspace");
const panelsDir = join(workspaceDir, "panels");
const contentDir = join(panelsDir, "content");
const contentPath = join(workspaceDir, "WorkspaceContent.tsx");
const packagePath = join(repoRoot, "package.json");

const CONTENT_FILES = [
  "PanelContentSection.tsx",
  "PanelEmptyState.tsx",
  "ExplorerContent.tsx",
  "InspectorContent.tsx",
  "ConsoleContent.tsx",
  "index.ts",
] as const;

const FROZEN_SECTION_IDS = [
  "project",
  "layers",
  "properties",
  "appearance",
  "output",
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

const workspaceContentSource = read(contentPath);
const bodyLayoutSource = read(join(panelsDir, "WorkspaceBodyLayout.tsx"));
const panelSource = read(join(panelsDir, "Panel.tsx"));
const headerSource = read(join(panelsDir, "PanelHeader.tsx"));
const bodySource = read(join(panelsDir, "PanelBody.tsx"));
const leftSource = read(join(panelsDir, "LeftPanel.tsx"));
const rightSource = read(join(panelsDir, "RightPanel.tsx"));
const bottomSource = read(join(panelsDir, "BottomPanel.tsx"));
const sectionSource = read(join(contentDir, "PanelContentSection.tsx"));
const emptySource = read(join(contentDir, "PanelEmptyState.tsx"));
const explorerSource = read(join(contentDir, "ExplorerContent.tsx"));
const inspectorSource = read(join(contentDir, "InspectorContent.tsx"));
const consoleSource = read(join(contentDir, "ConsoleContent.tsx"));
const contentBarrelSource = read(join(contentDir, "index.ts"));
const allContentSources = collectTsSources(contentDir).join("\n");

const HOOK_RE =
  /\buse(State|Reducer|Effect|Memo|Callback|Ref|Context|LayoutEffect|ImperativeHandle|EffectEvent)\s*[<(]/;

/**
 * UX-2.7 amend — hooks allowed in panels/state/** and WorkspaceBodyLayout.tsx only.
 * UX-2.8/2.9 amend — also skip persistence/** and resize/**.
 */
const collectTsSourcesForHookScan = (
  dir: string,
  relBase = ""
): string[] => {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return [];
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const full = join(dir, name);
    const rel = relBase ? `${relBase}/${name}` : name;
    const st = statSync(full);
    if (st.isDirectory()) {
      if (
        rel === "state" ||
        rel.startsWith("state/") ||
        rel === "persistence" ||
        rel.startsWith("persistence/") ||
        rel === "resize" ||
        rel.startsWith("resize/")
      ) {
        continue;
      }
      out.push(...collectTsSourcesForHookScan(full, rel));
      continue;
    }
    if (!/\.(tsx?|mts|cts)$/.test(name)) continue;
    if (rel === "WorkspaceBodyLayout.tsx") continue;
    out.push(read(full));
  }
  return out;
};

const hookScanSources = collectTsSourcesForHookScan(panelsDir).join("\n");

/* -------------------------------------------------------------------------- */
/* A. Files                                                                   */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux26.content.dir.exists",
  existsSync(contentDir) && statSync(contentDir).isDirectory(),
  contentDir
);

const contentPresent = existsSync(contentDir)
  ? readdirSync(contentDir).filter((name) => !name.startsWith("."))
  : [];
const contentPresentSet = new Set(contentPresent);

for (const file of CONTENT_FILES) {
  assertCase(
    `ux26.file.${file}`,
    contentPresentSet.has(file),
    join(contentDir, file)
  );
}

/* -------------------------------------------------------------------------- */
/* B. Freeze A — PanelContentSection                                          */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux26.freezeA.propsApi",
  /export\s+type\s+PanelContentSectionProps\s*=\s*\{[\s\S]*?\bid\s*:\s*string\b[\s\S]*?\btitle\s*:\s*string\b[\s\S]*?\bchildren\?\s*:\s*ReactNode\b/.test(
    sectionSource
  ),
  "PanelContentSectionProps = { id, title, children? }"
);

assertCase(
  "ux26.freezeA.dataAttr",
  /data-panel-content-section=\{id\}/.test(sectionSource) &&
    /<section\b/.test(sectionSource),
  "root <section data-panel-content-section={id}>"
);

assertCase(
  "ux26.freezeA.soleBlock",
  /export\s+function\s+PanelContentSection/.test(sectionSource) &&
    !/export\s+function\s+\w*Section\w*/.test(
      allContentSources.replace(sectionSource, "")
    ),
  "PanelContentSection is sole section export in content/"
);

/* -------------------------------------------------------------------------- */
/* C. Freeze B — Hierarchy                                                    */
/* -------------------------------------------------------------------------- */

const explorerUsesSection =
  /PanelContentSection/.test(explorerSource) &&
  /PanelEmptyState/.test(explorerSource) &&
  !/<PanelEmptyState[\s>]/.test(
    explorerSource.replace(
      /<PanelContentSection[\s\S]*?<\/PanelContentSection>/g,
      ""
    )
  );

const inspectorUsesSection =
  /PanelContentSection/.test(inspectorSource) &&
  /PanelEmptyState/.test(inspectorSource);

const consoleUsesSection =
  /PanelContentSection/.test(consoleSource) &&
  /PanelEmptyState/.test(consoleSource);

assertCase(
  "ux26.freezeB.explorer.hierarchy",
  explorerUsesSection &&
    (explorerSource.match(/<PanelContentSection\b/g) ?? []).length === 2 &&
    (explorerSource.match(/<PanelEmptyState\b/g) ?? []).length === 2,
  "ExplorerContent: 2 Section → EmptyState"
);

assertCase(
  "ux26.freezeB.inspector.hierarchy",
  inspectorUsesSection &&
    (inspectorSource.match(/<PanelContentSection\b/g) ?? []).length === 2 &&
    (inspectorSource.match(/<PanelEmptyState\b/g) ?? []).length === 2,
  "InspectorContent: 2 Section → EmptyState"
);

assertCase(
  "ux26.freezeB.console.hierarchy",
  consoleUsesSection &&
    (consoleSource.match(/<PanelContentSection\b/g) ?? []).length === 1 &&
    (consoleSource.match(/<PanelEmptyState\b/g) ?? []).length === 1,
  "ConsoleContent: 1 Section → EmptyState"
);

assertCase(
  "ux26.freezeB.noDirectBodyWidgets",
  !/PanelEmptyState/.test(bodyLayoutSource) &&
    !/PanelContentSection/.test(bodyLayoutSource),
  "BodyLayout mounts *Content only (not Section/EmptyState directly)"
);

/* -------------------------------------------------------------------------- */
/* D. Freeze C — Stable IDs                                                   */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux26.freezeC.explorer.ids",
  /id=["']project["']/.test(explorerSource) &&
    /id=["']layers["']/.test(explorerSource),
  "Explorer: project, layers"
);

assertCase(
  "ux26.freezeC.inspector.ids",
  /id=["']properties["']/.test(inspectorSource) &&
    /id=["']appearance["']/.test(inspectorSource),
  "Inspector: properties, appearance"
);

assertCase(
  "ux26.freezeC.console.ids",
  /id=["']output["']/.test(consoleSource),
  "Console: output"
);

assertCase(
  "ux26.freezeC.noTitleAsId",
  !/id=["'](Project|Layers|Properties|Appearance|Output)["']/.test(
    allContentSources
  ),
  "IDs are lowercase tokens, not titles"
);

for (const id of FROZEN_SECTION_IDS) {
  assertCase(
    `ux26.freezeC.id.${id}`,
    new RegExp(`id=["']${id}["']`).test(allContentSources),
    `stable id="${id}" present`
  );
}

/* -------------------------------------------------------------------------- */
/* E. data-panel-content roots                                                */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux26.attr.content.explorer",
  /data-panel-content=["']explorer["']/.test(explorerSource),
  'data-panel-content="explorer"'
);

assertCase(
  "ux26.attr.content.inspector",
  /data-panel-content=["']inspector["']/.test(inspectorSource),
  'data-panel-content="inspector"'
);

assertCase(
  "ux26.attr.content.console",
  /data-panel-content=["']console["']/.test(consoleSource),
  'data-panel-content="console"'
);

assertCase(
  "ux26.emptyState.exists",
  /export\s+function\s+PanelEmptyState/.test(emptySource) &&
    /message/.test(emptySource),
  "PanelEmptyState with message"
);

assertCase(
  "ux26.content.barrel",
  /ExplorerContent/.test(contentBarrelSource) &&
    /InspectorContent/.test(contentBarrelSource) &&
    /ConsoleContent/.test(contentBarrelSource) &&
    /PanelContentSection/.test(contentBarrelSource) &&
    /PanelEmptyState/.test(contentBarrelSource),
  "content/index.ts exports"
);

/* -------------------------------------------------------------------------- */
/* F. BodyLayout mount                                                        */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux26.bodyLayout.mounts",
  /<LeftPanel[\s>][\s\S]*?<ExplorerContent\s*\/>[\s\S]*?<\/LeftPanel>/.test(
    bodyLayoutSource.replace(/\r\n/g, "\n")
  ) &&
    /<RightPanel[\s>][\s\S]*?<InspectorContent\s*\/>[\s\S]*?<\/RightPanel>/.test(
      bodyLayoutSource.replace(/\r\n/g, "\n")
    ) &&
    /<BottomPanel[\s>][\s\S]*?<ConsoleContent\s*\/>[\s\S]*?<\/BottomPanel>/.test(
      bodyLayoutSource.replace(/\r\n/g, "\n")
    ),
  "BodyLayout wires Explorer/Inspector/Console into panel children"
);

assertCase(
  "ux26.canvas.unchanged",
  (bodyLayoutSource.match(/data-workspace-canvas(?=[\s>=])/g) ?? []).length ===
    1 &&
    /data-workspace-canvas[\s\S]*?>\s*\{children\}\s*</.test(bodyLayoutSource),
  "canvas owned by BodyLayout; children direct"
);

/* -------------------------------------------------------------------------- */
/* G. Panel shell unchanged                                                   */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux26.shell.panel.untouched",
  !/from\s+["']\.\/content/.test(panelSource) &&
    !/from\s+["']\.\/PanelHeader["']/.test(panelSource) &&
    !/from\s+["']\.\/PanelBody["']/.test(panelSource) &&
    /\{children\}/.test(panelSource),
  "Panel.tsx shell-only; no content imports"
);

assertCase(
  "ux26.shell.wrappers.noContentImports",
  !/from\s+["']\.\/content/.test(leftSource) &&
    !/from\s+["']\.\/content/.test(rightSource) &&
    !/from\s+["']\.\/content/.test(bottomSource) &&
    !/from\s+["']\.\/content/.test(headerSource) &&
    !/from\s+["']\.\/content/.test(bodySource),
  "wrappers/header/body do not import content/"
);

assertCase(
  "ux26.shell.titles.frozen",
  /title=["']Explorer["']/.test(leftSource) &&
    /title=["']Inspector["']/.test(rightSource) &&
    /title=["']Console["']/.test(bottomSource),
  "wrapper titles Explorer/Inspector/Console"
);

assertCase(
  "ux26.content.workspace.compositionOnly",
  /<WorkspaceBodyLayout>\s*\{workspace\}\s*<\/WorkspaceBodyLayout>/.test(
    workspaceContentSource.replace(/\r\n/g, "\n")
  ) &&
    !/<ExplorerContent/.test(workspaceContentSource) &&
    !/<InspectorContent/.test(workspaceContentSource) &&
    !/<ConsoleContent/.test(workspaceContentSource) &&
    !/\buse(State|Reducer|Effect|Memo|Callback|Ref|Context|LayoutEffect|ImperativeHandle|EffectEvent)\s*[<(]/.test(
      workspaceContentSource
    ),
  "WorkspaceContent unchanged composition-only"
);

/* -------------------------------------------------------------------------- */
/* H. Governance                                                              */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux26.governance.noHooks.content",
  !/\buse(State|Reducer|Effect|Memo|Callback|Ref|Context|LayoutEffect|ImperativeHandle|EffectEvent)\s*[<(]/.test(
    allContentSources
  ),
  "no React hooks in panels/content/"
);

assertCase(
  "ux26.governance.noHooks.panelsTree",
  !HOOK_RE.test(hookScanSources),
  "no React hooks outside state/**, persistence/**, resize/**, WorkspaceBodyLayout"
);

const contentImportLines = allContentSources
  .split(/\r?\n/)
  .filter((line) => /^\s*import\s/.test(line));
const domainImportHit = contentImportLines.some((line) => {
  if (
    /from\s+["']react["']/.test(line) ||
    /from\s+["']\.\/[^"']+["']/.test(line)
  ) {
    return false;
  }
  return (
    /graph|analysis|dataset|supabase|math|store|session|window|dock|sidebar|inspector/i.test(
      line
    ) ||
    /@\/app\//.test(line) ||
    /@\/lib\/scientific/.test(line) ||
    /@\/components\//.test(line)
  );
});

assertCase(
  "ux26.governance.noDomainImports",
  !domainImportHit,
  domainImportHit ? "domain-like import in content/" : "clean"
);

const hexInContent =
  /#[0-9a-fA-F]{3,8}\b/.test(allContentSources) ||
  /\brgba?\s*\(/.test(allContentSources) ||
  /\bhsl[a]?\s*\(/.test(allContentSources);

assertCase(
  "ux26.no.hardcoded.colors",
  !hexInContent,
  hexInContent ? "hex/rgb/hsl in content/" : "clean --app-* / utilities"
);

const pkg = read(packagePath);
assertCase(
  "ux26.package.script",
  /"validate:ux-2\.6"\s*:/.test(pkg),
  "validate:ux-2.6 in package.json"
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

const ux25 = runNpm("validate:ux-2.5");
assertCase("ux26.delegate.ux-2.5", ux25.ok, ux25.detail);

const workspaceArch = runNpm("validate:workspace-architecture");
assertCase(
  "ux26.delegate.workspace-architecture",
  workspaceArch.ok,
  workspaceArch.detail
);

const designTokens = runNpm("validate:design-tokens-v2");
assertCase(
  "ux26.delegate.design-tokens-v2",
  designTokens.ok,
  designTokens.detail
);

const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
  cwd: repoRoot,
  encoding: "utf8",
  shell: true,
});
assertCase(
  "ux26.typescript",
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
  phase: "ux-2.6-panel-content",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — ux-2.6-panel-content"
    : `\nFAIL — ux-2.6-panel-content (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
