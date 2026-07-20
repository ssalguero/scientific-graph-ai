/**
 * D47.4 — Workspace architecture + governance static gate.
 * Verifies move-only Workspace Foundation contracts (no product changes).
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const workspaceDir = join(repoRoot, "src/components/workspace");
const pagePath = join(repoRoot, "src/app/page.tsx");

const REQUIRED_FILES = [
  "WorkspaceLayout.tsx",
  "WorkspaceContent.tsx",
  "WorkspacePanels.tsx",
  "WorkspaceTokens.ts",
  "types.ts",
  "index.ts",
] as const;

const FROZEN_TOKENS = {
  shell: "flex min-h-screen flex-col lg:flex-row",
  mainColumn: "flex-1 min-w-0 overflow-auto",
  inner: "w-full px-3 sm:px-4 lg:px-5 xl:px-6 py-2.5 sm:py-3 space-y-3",
} as const;

const FORBIDDEN_IMPORT_PATHS = [
  /@\/app\/page/,
  /@\/lib\/scientific/,
  /@\/lib\/graph/,
  /@\/components\/graph/,
  /@\/components\/analysis/,
  /supabase/i,
  /\/stores?\b/,
  /@\/lib\/.*math/,
  /dataset/i,
];

const results: { id: string; pass: boolean; detail: string }[] = [];

const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const readWorkspaceFile = (file: string): string => {
  const full = join(workspaceDir, file);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

const collectLocalImports = (source: string): string[] => {
  const imports: string[] = [];
  const re =
    /from\s+["'](\.\/[^"']+)["']/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source)) !== null) {
    imports.push(match[1].replace(/^\.\//, "").replace(/\.tsx?$/, ""));
  }
  return imports;
};

// --- A. Directory + exact file set ---
assertCase(
  "workspace.dir.exists",
  existsSync(workspaceDir),
  workspaceDir
);

const present = existsSync(workspaceDir)
  ? readdirSync(workspaceDir).filter((name) => !name.startsWith("."))
  : [];
const presentSet = new Set(present);
const requiredSet = new Set<string>(REQUIRED_FILES);

assertCase(
  "workspace.files.exact",
  present.length === REQUIRED_FILES.length &&
    REQUIRED_FILES.every((f) => presentSet.has(f)) &&
    present.every((f) => requiredSet.has(f)),
  `present=[${present.sort().join(", ")}] expected=[${REQUIRED_FILES.join(", ")}]`
);

for (const file of REQUIRED_FILES) {
  assertCase(`workspace.file.${file}`, presentSet.has(file), join(workspaceDir, file));
}

// --- B. Barrel stable ---
const barrelSource = readWorkspaceFile("index.ts");
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
  "governance.workspace.barrelStable",
  Object.values(barrelHas).every(Boolean),
  JSON.stringify(barrelHas)
);

assertCase(
  "workspace.barrel.exports.WorkspaceLayout",
  barrelHas.WorkspaceLayout,
  "export { WorkspaceLayout }"
);
assertCase(
  "workspace.barrel.exports.WorkspaceContent",
  barrelHas.WorkspaceContent,
  "export { WorkspaceContent }"
);
assertCase(
  "workspace.barrel.exports.WorkspacePanels",
  barrelHas.WorkspacePanels,
  "export { WorkspacePanels }"
);
assertCase(
  "workspace.barrel.exports.WORKSPACE_TOKENS",
  barrelHas.WORKSPACE_TOKENS,
  "export { WORKSPACE_TOKENS }"
);
assertCase(
  "workspace.barrel.exports.types",
  barrelHas.types,
  "export type { ... } from ./types"
);

// --- C + D. page.tsx wiring ---
const pageSource = existsSync(pagePath) ? readFileSync(pagePath, "utf8") : "";

assertCase(
  "page.imports.workspace.barrel",
  /from\s+["']@\/components\/workspace["']/.test(pageSource),
  'from "@/components/workspace"'
);

assertCase(
  "page.no.internal.workspace.imports",
  !/from\s+["']@\/components\/workspace\//.test(pageSource),
  "no @/components/workspace/* deep imports"
);

assertCase(
  "page.renders.WorkspaceLayout",
  /<WorkspaceLayout[\s>]/.test(pageSource),
  "<WorkspaceLayout"
);

// --- E. Inline shell gone + single main owner ---
const inlineShellMain =
  /<main[\s>][\s\S]{0,200}?flex\s+min-h-screen[\s\S]{0,80}?flex-col[\s\S]{0,80}?lg:flex-row/.test(
    pageSource
  ) ||
  /<main\s+className=\{`flex min-h-screen flex-col lg:flex-row/.test(pageSource);

assertCase(
  "page.no.inline.shell.main",
  !inlineShellMain && !/<main[\s>]/.test(pageSource),
  "no <main> / inline shell flex classes in page.tsx"
);

assertCase(
  "page.no.shell.token.strings",
  !pageSource.includes(FROZEN_TOKENS.shell) &&
    !pageSource.includes(FROZEN_TOKENS.mainColumn) &&
    !pageSource.includes(FROZEN_TOKENS.inner),
  "shell/mainColumn/inner class strings not duplicated in page.tsx"
);

const layoutSource = readWorkspaceFile("WorkspaceLayout.tsx");
const contentSource = readWorkspaceFile("WorkspaceContent.tsx");
const panelsSource = readWorkspaceFile("WorkspacePanels.tsx");
const tokensSource = readWorkspaceFile("WorkspaceTokens.ts");
const typesSource = readWorkspaceFile("types.ts");
const allWorkspaceSources = [
  layoutSource,
  contentSource,
  panelsSource,
  tokensSource,
  typesSource,
  barrelSource,
].join("\n");

const mainInLayout = /<main[\s>]/.test(layoutSource);
const mainInContent = /<main[\s>]/.test(contentSource);
const mainInPanels = /<main[\s>]/.test(panelsSource);
const mainInPage = /<main[\s>]/.test(pageSource);

assertCase(
  "governance.workspace.singleMainOwner",
  mainInLayout && !mainInContent && !mainInPanels && !mainInPage,
  `layout=${mainInLayout} content=${mainInContent} panels=${mainInPanels} page=${mainInPage}`
);

// --- Tokens frozen + tokensOnly (D48.2: literals live in UI_TOKENS.workspace) ---
const uiTokensSource = existsSync(
  join(repoRoot, "src/lib/ui/tokens.ts")
)
  ? readFileSync(join(repoRoot, "src/lib/ui/tokens.ts"), "utf8")
  : "";

const workspaceFreezeInUiTokens =
  uiTokensSource.includes(`shell: "${FROZEN_TOKENS.shell}"`) &&
  uiTokensSource.includes(`mainColumn: "${FROZEN_TOKENS.mainColumn}"`) &&
  uiTokensSource.includes(`inner: "${FROZEN_TOKENS.inner}"`);

const workspaceTokensDelegates =
  /UI_TOKENS\.workspace\.(shell|mainColumn|inner)/.test(tokensSource) &&
  /export const WORKSPACE_TOKENS/.test(tokensSource);

assertCase(
  "workspace.tokens.frozen.shape",
  workspaceFreezeInUiTokens && workspaceTokensDelegates,
  "WORKSPACE_TOKENS → UI_TOKENS.workspace; freeze literals in tokens.ts"
);

const layoutHardcodesShell =
  layoutSource.includes(FROZEN_TOKENS.shell) &&
  !/WORKSPACE_TOKENS\.shell/.test(layoutSource);
const contentHardcodes =
  (contentSource.includes(FROZEN_TOKENS.mainColumn) &&
    !/WORKSPACE_TOKENS\.mainColumn/.test(contentSource)) ||
  (contentSource.includes(FROZEN_TOKENS.inner) &&
    !/WORKSPACE_TOKENS\.inner/.test(contentSource));

assertCase(
  "governance.workspace.tokensOnly",
  /WORKSPACE_TOKENS\.shell/.test(layoutSource) &&
    /WORKSPACE_TOKENS\.mainColumn/.test(contentSource) &&
    /WORKSPACE_TOKENS\.inner/.test(contentSource) &&
    !layoutHardcodesShell &&
    !contentHardcodes,
  "Layout/Content use WORKSPACE_TOKENS; no ad-hoc shell strings"
);

// --- F + G. Move-only / governance ---
const hasStateHooks =
  /\buse(State|Reducer|Effect|Memo|Callback|Ref|Context|LayoutEffect|ImperativeHandle)\s*[<(]/.test(
    allWorkspaceSources
  );

assertCase(
  "governance.workspace.noState",
  !hasStateHooks,
  "no useState/useReducer/useEffect/other React state hooks"
);

const scientificHit =
  /@\/lib\/scientific/.test(allWorkspaceSources) ||
  /from\s+["'][^"']*scientific[^"']*["']/.test(allWorkspaceSources);

assertCase(
  "governance.workspace.noScientificImports",
  !scientificHit,
  "no @/lib/scientific or scientific module imports"
);

const forbiddenHits: string[] = [];
for (const pattern of FORBIDDEN_IMPORT_PATHS) {
  if (pattern.test(allWorkspaceSources)) {
    forbiddenHits.push(String(pattern));
  }
}
// Broader domain path scan on import lines only
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
  "governance.workspace.noDomainImports",
  forbiddenHits.length === 0 && !domainImportHit,
  forbiddenHits.length
    ? `forbidden=${forbiddenHits.join(",")}`
    : domainImportHit
      ? "domain-like import line detected"
      : "clean"
);

// --- H. DAG among Layout / Content / Panels ---
const normalizeImport = (name: string) =>
  name.replace(/^\.\//, "").replace(/\.tsx?$/, "");

const componentImports: Record<string, string[]> = {
  WorkspaceLayout: collectLocalImports(layoutSource).map(normalizeImport),
  WorkspaceContent: collectLocalImports(contentSource).map(normalizeImport),
  WorkspacePanels: collectLocalImports(panelsSource).map(normalizeImport),
};

const peers = new Set([
  "WorkspaceLayout",
  "WorkspaceContent",
  "WorkspacePanels",
]);

const peerEdges: Array<[string, string]> = [];
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
  "workspace.dag.noCycles",
  !hasCycle,
  peerEdges.length
    ? `edges=${peerEdges.map((e) => e.join("->")).join(", ")}`
    : "no peer edges (independent components)"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "workspace-architecture",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — workspace-architecture"
    : `\nFAIL — workspace-architecture (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
