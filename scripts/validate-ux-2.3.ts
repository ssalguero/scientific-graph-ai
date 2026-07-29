/**
 * UX-2.3 — Workspace & Canvas Migration gate.
 * Presentation-only chrome inside WorkspaceContent; architecture freezes preserved.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const workspaceDir = join(repoRoot, "src/components/workspace");
const pagePath = join(repoRoot, "src/app/page.tsx");
const contentPath = join(workspaceDir, "WorkspaceContent.tsx");
const packagePath = join(repoRoot, "package.json");

const REQUIRED_FILES = [
  "WorkspaceLayout.tsx",
  "WorkspaceContent.tsx",
  "WorkspacePanels.tsx",
  "WorkspaceTokens.ts",
  "types.ts",
  "index.ts",
] as const;

const FORBIDDEN_NEW_FILES = [
  "Workspace.tsx",
  "WorkspaceCanvas.tsx",
  "WorkspaceHeader.tsx",
] as const;

const results: { id: string; pass: boolean; detail: string }[] = [];

const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const read = (path: string): string =>
  existsSync(path) ? readFileSync(path, "utf8") : "";

const contentSource = read(contentPath);
const barrelSource = read(join(workspaceDir, "index.ts"));
const layoutSource = read(join(workspaceDir, "WorkspaceLayout.tsx"));
const panelsSource = read(join(workspaceDir, "WorkspacePanels.tsx"));
const tokensSource = read(join(workspaceDir, "WorkspaceTokens.ts"));
const typesSource = read(join(workspaceDir, "types.ts"));
const pageSource = read(pagePath);
const allWorkspaceSources = [
  layoutSource,
  contentSource,
  panelsSource,
  tokensSource,
  typesSource,
  barrelSource,
].join("\n");

/* -------------------------------------------------------------------------- */
/* A. Exact 6-file set + no forbidden new files                               */
/* -------------------------------------------------------------------------- */

assertCase("ux23.workspace.dir.exists", existsSync(workspaceDir), workspaceDir);

const present = existsSync(workspaceDir)
  ? readdirSync(workspaceDir).filter((name) => !name.startsWith("."))
  : [];
const presentSet = new Set(present);
const requiredSet = new Set<string>(REQUIRED_FILES);

assertCase(
  "ux23.workspace.files.exact",
  present.length === REQUIRED_FILES.length &&
    REQUIRED_FILES.every((f) => presentSet.has(f)) &&
    present.every((f) => requiredSet.has(f)),
  `present=[${present.sort().join(", ")}] expected=[${REQUIRED_FILES.join(", ")}]`
);

for (const forbidden of FORBIDDEN_NEW_FILES) {
  assertCase(
    `ux23.no.file.${forbidden}`,
    !presentSet.has(forbidden),
    forbidden
  );
}

/* -------------------------------------------------------------------------- */
/* B. Barrel exports unchanged                                                */
/* -------------------------------------------------------------------------- */

const barrelHas = {
  WorkspaceLayout:
    /export\s*\{\s*WorkspaceLayout\s*\}\s*from\s*["']\.\/WorkspaceLayout["']/.test(
      barrelSource
    ),
  WorkspaceContent:
    /export\s*\{\s*WorkspaceContent\s*\}\s*from\s*["']\.\/WorkspaceContent["']/.test(
      barrelSource
    ),
  WorkspacePanels:
    /export\s*\{\s*WorkspacePanels\s*\}\s*from\s*["']\.\/WorkspacePanels["']/.test(
      barrelSource
    ),
  WORKSPACE_TOKENS:
    /export\s*\{\s*WORKSPACE_TOKENS\s*\}\s*from\s*["']\.\/WorkspaceTokens["']/.test(
      barrelSource
    ),
  types: /export\s+type\s*\{[^}]*\}\s*from\s*["']\.\/types["']/.test(barrelSource),
};

assertCase(
  "ux23.barrel.stable",
  Object.values(barrelHas).every(Boolean),
  JSON.stringify(barrelHas)
);

/* -------------------------------------------------------------------------- */
/* C. Chrome markers + DOM stability                                          */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux23.header.marker",
  /data-workspace-header/.test(contentSource),
  "data-workspace-header"
);

assertCase(
  "ux23.canvas.marker",
  /data-workspace-canvas/.test(contentSource),
  "data-workspace-canvas"
);

assertCase(
  "ux23.header.copy.project",
  /Scientific Graph AI/.test(contentSource) &&
    />\s*Project\s*</.test(contentSource.replace(/\r\n/g, "\n")) &&
    /Current Project/.test(contentSource) &&
    />\s*Ready\s*</.test(contentSource.replace(/\r\n/g, "\n")),
  "static Project / Scientific Graph AI / Current Project / Ready"
);

const workspaceRenderCount = (contentSource.match(/\{workspace\}/g) ?? []).length;
assertCase(
  "ux23.dom.workspace.once",
  workspaceRenderCount === 1,
  `{workspace} count=${workspaceRenderCount}`
);

assertCase(
  "ux23.dom.workspace.directChildOfCanvas",
  /data-workspace-canvas[\s\S]*?>\s*\{workspace\}\s*</.test(contentSource),
  "{workspace} direct child of data-workspace-canvas"
);

assertCase(
  "ux23.dom.toolbar.beforeHeader",
  /\{toolbar\}[\s\S]*?data-workspace-header[\s\S]*?data-workspace-canvas[\s\S]*?\{workspace\}/.test(
    contentSource
  ),
  "order: toolbar → header → canvas → {workspace}"
);

assertCase(
  "ux23.dom.noWorkspaceMapOrClone",
  !/\bChildren\.(map|toArray|only)\b/.test(contentSource) &&
    !/cloneElement/.test(contentSource) &&
    !/React\.Children/.test(contentSource),
  "no Children.map / cloneElement on workspace slot"
);

/* -------------------------------------------------------------------------- */
/* D. Tokens / no hardcoded colors                                            */
/* -------------------------------------------------------------------------- */

const hexInWorkspace =
  /#[0-9a-fA-F]{3,8}\b/.test(allWorkspaceSources) ||
  /\brgba?\s*\(/.test(allWorkspaceSources) ||
  /\bhsl[a]?\s*\(/.test(allWorkspaceSources);

assertCase(
  "ux23.no.hardcoded.colors",
  !hexInWorkspace,
  hexInWorkspace ? "hex/rgb/hsl found in workspace/*" : "clean --app-* / utilities"
);

assertCase(
  "ux23.uses.app.tokens",
  /var\(--app-border\)/.test(contentSource) &&
    /var\(--app-surface\)/.test(contentSource) &&
    /var\(--app-text-muted\)/.test(contentSource) &&
    /var\(--app-heading\)/.test(contentSource),
  "--app-border / --app-surface / --app-text-muted / --app-heading"
);

assertCase(
  "ux23.no.direct.UI_TOKENS.categories",
  !/UI_TOKENS\.(layout|spacing|radius|border|typography|transition|shadow|panel|button|sidebar|workspace)\b/.test(
    [layoutSource, contentSource, panelsSource].join("\n")
  ),
  "no direct UI_TOKENS category imports in Layout/Content/Panels (bridge may use UI_TOKENS.workspace)"
);

assertCase(
  "ux23.props.api.frozen",
  /WorkspaceContentProps\s*=\s*\{[\s\S]*?toolbar\?:\s*ReactNode;[\s\S]*?workspace:\s*ReactNode;[\s\S]*?\}/.test(
    typesSource
  ),
  "WorkspaceContentProps { toolbar?, workspace }"
);

/* -------------------------------------------------------------------------- */
/* E. Provider tree + page wiring unchanged                                   */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux23.page.provider.WindowManager",
  /<WindowManager[\s>]/.test(pageSource),
  "<WindowManager"
);

assertCase(
  "ux23.page.provider.SessionProvider",
  /<SessionProvider[\s>]/.test(pageSource),
  "<SessionProvider"
);

assertCase(
  "ux23.page.renders.GraphEditor",
  /<GraphEditor[\s/>]/.test(pageSource),
  "<GraphEditor"
);

assertCase(
  "ux23.page.renders.WorkspaceLayout",
  /<WorkspaceLayout[\s>]/.test(pageSource),
  "<WorkspaceLayout"
);

assertCase(
  "ux23.page.renders.WorkspaceContent",
  /<WorkspaceContent[\s>]/.test(pageSource),
  "<WorkspaceContent"
);

assertCase(
  "ux23.page.imports.workspace.barrel",
  /from\s+["']@\/components\/workspace["']/.test(pageSource),
  'from "@/components/workspace"'
);

assertCase(
  "ux23.page.no.internal.workspace.imports",
  !/from\s+["']@\/components\/workspace\//.test(pageSource),
  "no deep workspace imports"
);

/* Provider nesting: WindowManager … SessionProvider … GraphEditor */
const wmIdx = pageSource.search(/<WindowManager[\s>]/);
const spIdx = pageSource.search(/<SessionProvider[\s>]/);
const geIdx = pageSource.search(/<GraphEditor[\s/>]/);
assertCase(
  "ux23.page.provider.order",
  wmIdx >= 0 && spIdx > wmIdx && geIdx > spIdx,
  `wm=${wmIdx} sp=${spIdx} ge=${geIdx}`
);

/* -------------------------------------------------------------------------- */
/* F. Governance: no state / domain / cycles                                  */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux23.governance.noState",
  !/\buse(State|Reducer|Effect|Memo|Callback|Ref|Context|LayoutEffect|ImperativeHandle)\s*[<(]/.test(
    allWorkspaceSources
  ),
  "no React state hooks in workspace/*"
);

const importLines = allWorkspaceSources
  .split(/\r?\n/)
  .filter((line) => /^\s*import\s/.test(line));
const domainImportHit = importLines.some((line) => {
  if (/@\/lib\/ui\/theme/.test(line) || /@\/lib\/app-preferences/.test(line)) {
    return false;
  }
  if (/from\s+["']react["']/.test(line) || /from\s+["']\.\/[^"']+["']/.test(line)) {
    return false;
  }
  return (
    /graph|analysis|dataset|supabase|math|store/i.test(line) ||
    /@\/app\//.test(line) ||
    /@\/lib\/scientific/.test(line)
  );
});

assertCase(
  "ux23.governance.noDomainImports",
  !domainImportHit,
  domainImportHit ? "domain-like import detected" : "clean"
);

const collectLocalImports = (source: string): string[] => {
  const imports: string[] = [];
  const re = /from\s+["'](\.\/[^"']+)["']/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source)) !== null) {
    imports.push(match[1].replace(/^\.\//, "").replace(/\.tsx?$/, ""));
  }
  return imports;
};

const peers = new Set([
  "WorkspaceLayout",
  "WorkspaceContent",
  "WorkspacePanels",
]);
const peerEdges: Array<[string, string]> = [];
const componentImports: Record<string, string[]> = {
  WorkspaceLayout: collectLocalImports(layoutSource),
  WorkspaceContent: collectLocalImports(contentSource),
  WorkspacePanels: collectLocalImports(panelsSource),
};
for (const [from, imports] of Object.entries(componentImports)) {
  for (const to of imports) {
    if (peers.has(to) && to !== from) {
      peerEdges.push([from, to]);
    }
  }
}

const hasCycle = (() => {
  const adj = new Map<string, string[]>();
  for (const name of peers) adj.set(name, []);
  for (const [from, to] of peerEdges) {
    adj.get(from)?.push(to);
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const dfs = (node: string): boolean => {
    if (visiting.has(node)) return true;
    if (visited.has(node)) return false;
    visiting.add(node);
    for (const next of adj.get(node) ?? []) {
      if (dfs(next)) return true;
    }
    visiting.delete(node);
    visited.add(node);
    return false;
  };
  for (const name of peers) {
    if (dfs(name)) return true;
  }
  return false;
})();

assertCase(
  "ux23.dag.noCycles",
  !hasCycle,
  peerEdges.length
    ? `edges=${peerEdges.map((e) => e.join("->")).join(", ")}`
    : "no peer edges"
);

/* -------------------------------------------------------------------------- */
/* G. package.json script                                                     */
/* -------------------------------------------------------------------------- */

const pkg = read(packagePath);
assertCase(
  "ux23.package.script",
  /"validate:ux-2\.3"\s*:/.test(pkg),
  "validate:ux-2.3 in package.json"
);

/* -------------------------------------------------------------------------- */
/* H. Delegate gates                                                          */
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
  "ux23.delegate.workspace-architecture",
  workspaceArch.ok,
  workspaceArch.detail
);

const designTokens = runNpm("validate:design-tokens-v2");
assertCase(
  "ux23.delegate.design-tokens-v2",
  designTokens.ok,
  designTokens.detail
);

const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
  cwd: repoRoot,
  encoding: "utf8",
  shell: true,
});
assertCase(
  "ux23.typescript",
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
  phase: "ux-2.3-workspace-canvas",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — ux-2.3-workspace-canvas"
    : `\nFAIL — ux-2.3-workspace-canvas (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
