/**
 * UX-2.24 — Workspace Navigation Foundation gate.
 * Presentational navigation grammar only; no router / logic.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const workspaceDir = join(repoRoot, "src/components/workspace");
const navigationDir = join(workspaceDir, "navigation");
const semanticsDir = join(workspaceDir, "semantics");
const panelsDir = join(workspaceDir, "panels");
const panelContentDir = join(panelsDir, "content");
const packagePath = join(repoRoot, "package.json");
const docPath = join(repoRoot, "docs/UX-2.24-workspace-navigation.md");
const roadmapPath = join(repoRoot, "docs/UX-2.0-roadmap.md");

const results: { id: string; pass: boolean; detail: string }[] = [];

const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const read = (path: string): string =>
  existsSync(path) ? readFileSync(path, "utf8") : "";

const collectTsFiles = (
  dir: string
): { path: string; source: string; name: string }[] => {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return [];
  const out: { path: string; source: string; name: string }[] = [];
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...collectTsFiles(full));
      continue;
    }
    if (/\.(tsx?|mts|cts)$/.test(name)) {
      out.push({ path: full, source: read(full), name });
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

const hasHookCall = (source: string): boolean =>
  /\buseState\s*\(/.test(source) ||
  /\buseMemo\s*\(/.test(source) ||
  /\buseEffect\s*\(/.test(source) ||
  /\buseLayoutEffect\s*\(/.test(source) ||
  /\buseCallback\s*\(/.test(source) ||
  /\buseRef\s*\(/.test(source) ||
  /\buseContext\s*\(/.test(source);

const childrenOnlyOk = (source: string, typeName: string): boolean => {
  const m = source.match(
    new RegExp(`export\\s+type\\s+${typeName}\\s*=\\s*\\{([\\s\\S]*?)\\}`)
  );
  if (!m) return false;
  const body = m[1];
  const props = [...body.matchAll(/(\w+)\s*\??\s*:/g)].map((x) => x[1]);
  return props.length === 1 && props[0] === "children";
};

const navigationFiles = collectTsFiles(navigationDir);
const navigationSource = navigationFiles.map((f) => f.source).join("\n");
const navigationBarrel = read(join(navigationDir, "index.ts"));
const tokensSource = read(join(navigationDir, "navigationTokens.ts"));
const navigationComp = read(join(navigationDir, "Navigation.tsx"));
const breadcrumbsComp = read(join(navigationDir, "Breadcrumbs.tsx"));
const breadcrumbItemComp = read(join(navigationDir, "BreadcrumbItem.tsx"));
const breadcrumbSeparatorComp = read(
  join(navigationDir, "BreadcrumbSeparator.tsx")
);
const pageTitleComp = read(join(navigationDir, "PageTitle.tsx"));
const semanticHeader = read(join(semanticsDir, "SemanticHeader.tsx"));
const explorerSource = read(join(panelContentDir, "ExplorerContent.tsx"));
const inspectorSource = read(join(panelContentDir, "InspectorContent.tsx"));
const consoleSource = read(join(panelContentDir, "ConsoleContent.tsx"));
const bodyLayoutSource = read(join(panelsDir, "WorkspaceBodyLayout.tsx"));
const workspaceBarrel = read(join(workspaceDir, "index.ts"));
const pkg = read(packagePath);
const doc = read(docPath);
const roadmap = read(roadmapPath);

const panelSources = [
  { id: "explorer", source: explorerSource, panel: "Explorer" },
  { id: "inspector", source: inspectorSource, panel: "Inspector" },
  { id: "console", source: consoleSource, panel: "Console" },
  { id: "canvas", source: bodyLayoutSource, panel: "Canvas" },
];

/* -------------------------------------------------------------------------- */
/* A. navigation/ structure + barrel                                          */
/* -------------------------------------------------------------------------- */

const requiredFiles = [
  "navigationTokens.ts",
  "Navigation.tsx",
  "Breadcrumbs.tsx",
  "BreadcrumbItem.tsx",
  "BreadcrumbSeparator.tsx",
  "PageTitle.tsx",
  "index.ts",
];
for (const f of requiredFiles) {
  assertCase(
    `ux224.navigation.file.${f}`,
    existsSync(join(navigationDir, f)),
    `workspace/navigation/${f} present`
  );
}

assertCase(
  "ux224.navigation.barrel",
  /NAVIGATION_TOKENS/.test(navigationBarrel) &&
    /Navigation/.test(navigationBarrel) &&
    /Breadcrumbs/.test(navigationBarrel) &&
    /BreadcrumbItem/.test(navigationBarrel) &&
    /BreadcrumbSeparator/.test(navigationBarrel) &&
    /PageTitle/.test(navigationBarrel),
  "navigation barrel exports public API"
);

assertCase(
  "ux224.navigation.barrel.noHelpers",
  !/export\s+function\s+/.test(navigationBarrel),
  "navigation barrel is re-exports only"
);

assertCase(
  "ux224.navigation.noPublicBarrel",
  !/from\s+["']\.\/navigation/.test(workspaceBarrel) &&
    !/Navigation/.test(workspaceBarrel) &&
    !/NAVIGATION_TOKENS/.test(workspaceBarrel) &&
    !/PageTitle/.test(workspaceBarrel) &&
    !/Breadcrumbs/.test(workspaceBarrel),
  "workspace public barrel does not export navigation/"
);

/* -------------------------------------------------------------------------- */
/* B. Tokens — independent compose-only SSOT                                  */
/* -------------------------------------------------------------------------- */

const requiredKeys = [
  "flexDirection",
  "height",
  "alignItems",
  "gap",
  "breadcrumbGap",
  "separatorGap",
  "titleGap",
  "fontSize",
  "fontWeight",
  "color",
  "mutedColor",
  "separatorColor",
];

assertCase(
  "ux224.tokens.keys",
  requiredKeys.every((k) => new RegExp(`\\b${k}\\s*:`).test(tokensSource)),
  "NAVIGATION_TOKENS has required keys"
);

assertCase(
  "ux224.tokens.separatorGlyph",
  /separator\s*:\s*\{[\s\S]*glyph\s*:\s*["']›["']/.test(tokensSource),
  "NAVIGATION_TOKENS.separator.glyph is ›"
);

assertCase(
  "ux224.tokens.composeOnlyDocs",
  /compose-only/i.test(tokensSource) && /MUST NOT/.test(tokensSource),
  "NAVIGATION_TOKENS documents compose-only independence"
);

assertCase(
  "ux224.tokens.noTokenObjectDeps",
  !hasImportPath(tokensSource, "ui/tokens") &&
    !hasImportPath(tokensSource, "UI_TOKENS") &&
    !hasImportPath(tokensSource, "SURFACE_TOKENS") &&
    !hasImportPath(tokensSource, "CONTENT_TOKENS") &&
    !hasImportPath(tokensSource, "LAYOUT_TOKENS") &&
    !hasImportPath(tokensSource, "SEMANTIC_TOKENS") &&
    !hasImportPath(tokensSource, "ACTION_TOKENS") &&
    !hasImportPath(tokensSource, "ICON_TOKENS") &&
    !/export\s+\{\s*UI_TOKENS/.test(tokensSource) &&
    !/export\s+\*\s+from/.test(tokensSource),
  "NAVIGATION_TOKENS does not import/re-export other *_TOKENS objects"
);

assertCase(
  "ux224.tokens.noHexColors",
  !/#[0-9a-fA-F]{3,8}\b/.test(tokensSource),
  "NAVIGATION_TOKENS has no hex colors"
);

const primitivesReadTokens = [
  ["Navigation", navigationComp],
  ["Breadcrumbs", breadcrumbsComp],
  ["BreadcrumbItem", breadcrumbItemComp],
  ["BreadcrumbSeparator", breadcrumbSeparatorComp],
  ["PageTitle", pageTitleComp],
] as const;

for (const [name, source] of primitivesReadTokens) {
  assertCase(
    `ux224.tokens.consumedBy.${name}`,
    /NAVIGATION_TOKENS/.test(source),
    `${name} reads NAVIGATION_TOKENS`
  );
}

/* -------------------------------------------------------------------------- */
/* C. Governance                                                              */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux224.governance.noUseClient",
  !/"use client"/.test(navigationSource),
  "navigation/ has no use client"
);

assertCase(
  "ux224.governance.noHooks",
  !hasHookCall(navigationSource),
  "navigation/ has no hooks"
);

assertCase(
  "ux224.governance.noAppImports",
  !hasImportPath(navigationSource, "@/app") &&
    !/from\s+["'][^"']*\/app\//.test(navigationSource),
  "navigation/ has no app imports"
);

assertCase(
  "ux224.governance.noRouter",
  !/\bnext\/navigation\b/.test(navigationSource) &&
    !/\buseRouter\b/.test(navigationSource) &&
    !/\busePathname\b/.test(navigationSource) &&
    !/\bpathname\b/.test(navigationSource),
  "navigation/ has no router / pathname"
);

assertCase(
  "ux224.governance.noHardcodedFlexDir",
  !navigationFiles
    .filter((f) => f.name !== "navigationTokens.ts")
    .some(
      (f) =>
        /["'`][^"'`]*\bflex-col\b/.test(f.source) ||
        /["'`][^"'`]*\bflex-row\b/.test(f.source)
    ),
  "navigation components have no hardcoded flex-col/flex-row"
);

/* -------------------------------------------------------------------------- */
/* D. API freeze                                                              */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux224.api.Navigation",
  childrenOnlyOk(navigationComp, "NavigationProps"),
  "Navigation: children? only"
);

assertCase(
  "ux224.api.Breadcrumbs",
  childrenOnlyOk(breadcrumbsComp, "BreadcrumbsProps"),
  "Breadcrumbs: children? only"
);

assertCase(
  "ux224.api.BreadcrumbItem",
  childrenOnlyOk(breadcrumbItemComp, "BreadcrumbItemProps"),
  "BreadcrumbItem: children? only"
);

assertCase(
  "ux224.api.PageTitle",
  childrenOnlyOk(pageTitleComp, "PageTitleProps"),
  "PageTitle: children? only"
);

assertCase(
  "ux224.api.BreadcrumbSeparator.noProps",
  !/export\s+type\s+BreadcrumbSeparatorProps/.test(breadcrumbSeparatorComp) &&
    /export\s+function\s+BreadcrumbSeparator\s*\(\s*\)/.test(
      breadcrumbSeparatorComp
    ) &&
    /NAVIGATION_TOKENS\.separator\.glyph/.test(breadcrumbSeparatorComp),
  "BreadcrumbSeparator: no props; renders token glyph"
);

/* -------------------------------------------------------------------------- */
/* E. SemanticHeader title passthrough                                        */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux224.semanticHeader.titlePassthrough",
  /\{title\s*!=\s*null\s*\?\s*title\s*:\s*null\}/.test(semanticHeader) ||
    (/\{title\}/.test(semanticHeader) &&
      !/SEMANTIC_TOKENS\.label\}>\{title\}/.test(semanticHeader) &&
      !/className=\{SEMANTIC_TOKENS\.label\}>\{title\}/.test(semanticHeader)),
  "SemanticHeader title is passthrough (no label wrapper)"
);

assertCase(
  "ux224.semanticHeader.apiPreserved",
  /title\?:/.test(semanticHeader) &&
    /subtitle\?:/.test(semanticHeader) &&
    /leading\?:/.test(semanticHeader) &&
    /trailing\?:/.test(semanticHeader),
  "SemanticHeader API props unchanged"
);

assertCase(
  "ux224.semanticHeader.leadingIconSize",
  /SEMANTIC_TOKENS\.ICON_SIZE/.test(semanticHeader),
  "SemanticHeader.leading still uses ICON_SIZE"
);

/* -------------------------------------------------------------------------- */
/* F. Shell wiring                                                            */
/* -------------------------------------------------------------------------- */

for (const { id, source, panel } of panelSources) {
  assertCase(
    `ux224.wiring.${id}.components`,
    hasJsxComponent(source, "SemanticHeader") &&
      hasJsxComponent(source, "Navigation") &&
      hasJsxComponent(source, "Breadcrumbs") &&
      hasJsxComponent(source, "BreadcrumbItem") &&
      hasJsxComponent(source, "BreadcrumbSeparator") &&
      hasJsxComponent(source, "PageTitle") &&
      hasJsxComponent(source, "WorkspaceIcon") &&
      /leading=\{/.test(source) &&
      /title=\{/.test(source),
    `${id}: SemanticHeader + Navigation tree + leading icon`
  );

  assertCase(
    `ux224.wiring.${id}.staticCopy`,
    new RegExp(`<BreadcrumbItem>${panel}<\\/BreadcrumbItem>`).test(source) &&
      new RegExp(`<PageTitle>${panel}<\\/PageTitle>`).test(source) &&
      /<BreadcrumbItem>Workspace<\/BreadcrumbItem>/.test(source),
    `${id}: Workspace › ${panel} + PageTitle ${panel}`
  );

  assertCase(
    `ux224.wiring.${id}.importNavigation`,
    hasImportPath(source, "navigation"),
    `${id}: imports workspace/navigation`
  );
}

assertCase(
  "ux224.wiring.explorer.noOldTitle",
  /title=\{\s*\n?\s*<Navigation\b/.test(explorerSource) &&
    hasJsxComponent(explorerSource, "PageTitle") &&
    /<PageTitle>Explorer<\/PageTitle>/.test(explorerSource),
  "Explorer SemanticHeader title uses Navigation (not string Project)"
);

/* -------------------------------------------------------------------------- */
/* G. Docs                                                                    */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux224.doc.exists",
  existsSync(docPath) && /UX-2\.24/.test(doc) && /COMPLETE/.test(doc),
  "docs/UX-2.24-workspace-navigation.md COMPLETE"
);

assertCase(
  "ux224.roadmap.status",
  /UX-2\.24\s*=\s*COMPLETE/.test(roadmap) &&
    /Navigation/i.test(roadmap) &&
    (/NEXT\s*=\s*UX-3\.0/.test(roadmap) || /NEXT\s*→\s*UX-3\.0/.test(roadmap)),
  "roadmap marks UX-2.24 COMPLETE; NEXT → UX-3.0"
);

assertCase(
  "ux224.package.script",
  /"validate:ux-2\.24"\s*:/.test(pkg),
  "validate:ux-2.24 in package.json"
);

/* -------------------------------------------------------------------------- */
/* H. Delegates — UX-2.23 + tsc + eslint                                      */
/* -------------------------------------------------------------------------- */

if (process.env.UX_SKIP_DELEGATES !== "1") {
  const ux223 = spawnSync("npx", ["tsx", "scripts/validate-ux-2.23.ts"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
    env: { ...process.env, UX_SKIP_DELEGATES: "1" },
  });
  assertCase(
    "ux224.delegate.ux-2.23",
    ux223.status === 0,
    ux223.status === 0
      ? "PASS (leaf)"
      : `${ux223.stdout ?? ""}\n${ux223.stderr ?? ""}`.trim().slice(-1200)
  );

  const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
  });
  assertCase(
    "ux224.typescript",
    tsc.status === 0,
    tsc.status === 0
      ? "PASS"
      : `${tsc.stdout ?? ""}\n${tsc.stderr ?? ""}`.trim().slice(-1200)
  );

  const eslint = spawnSync(
    "npx",
    [
      "eslint",
      "src/components/workspace/navigation",
      "src/components/workspace/semantics/SemanticHeader.tsx",
      "src/components/workspace/panels/content",
      "src/components/workspace/panels/WorkspaceBodyLayout.tsx",
      "scripts/validate-ux-2.24.ts",
    ],
    {
      cwd: repoRoot,
      encoding: "utf8",
      shell: true,
    }
  );
  assertCase(
    "ux224.eslint",
    eslint.status === 0,
    eslint.status === 0
      ? "PASS"
      : `${eslint.stdout ?? ""}\n${eslint.stderr ?? ""}`.trim().slice(-1200)
  );
} else {
  assertCase(
    "ux224.delegate.skipped",
    true,
    "UX_SKIP_DELEGATES=1 — leaf suite skipped"
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "ux-2.24-workspace-navigation",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — ux-2.24-workspace-navigation"
    : `\nFAIL — ux-2.24-workspace-navigation (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
