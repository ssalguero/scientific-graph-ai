/**
 * UX-2.26 — Workspace Layout Primitives Foundation gate.
 * Compose-only Stack / Inline / Cluster / Center / Spacer; LAYOUT_TOKENS expanded.
 * Preserves UX-2.18 semantic PanelLayout / regions API Freeze.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const workspaceDir = join(repoRoot, "src/components/workspace");
const layoutDir = join(workspaceDir, "layout");
const surfaceDir = join(workspaceDir, "surface");
const contentDir = join(workspaceDir, "content");
const semanticsDir = join(workspaceDir, "semantics");
const navigationDir = join(workspaceDir, "navigation");
const panelsDir = join(workspaceDir, "panels");
const panelContentDir = join(panelsDir, "content");
const statusDir = join(workspaceDir, "status");
const packagePath = join(repoRoot, "package.json");
const docPath = join(repoRoot, "docs/UX-2.26-workspace-layout-primitives.md");
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

const layoutFiles = collectTsFiles(layoutDir);
const layoutSource = layoutFiles.map((f) => f.source).join("\n");
const layoutBarrel = read(join(layoutDir, "index.ts"));
const tokensSource = read(join(layoutDir, "LayoutTokens.ts"));
const stackSource = read(join(layoutDir, "Stack.tsx"));
const inlineSource = read(join(layoutDir, "Inline.tsx"));
const clusterSource = read(join(layoutDir, "Cluster.tsx"));
const centerSource = read(join(layoutDir, "Center.tsx"));
const spacerSource = read(join(layoutDir, "Spacer.tsx"));
const panelLayoutSource = read(join(layoutDir, "PanelLayout.tsx"));
const explorerSource = read(join(panelContentDir, "ExplorerContent.tsx"));
const inspectorSource = read(join(panelContentDir, "InspectorContent.tsx"));
const consoleSource = read(join(panelContentDir, "ConsoleContent.tsx"));
const panelHeaderSource = read(join(panelsDir, "PanelHeader.tsx"));
const panelEmptySource = read(join(panelsDir, "empty", "EmptyState.tsx"));
const contentEmptySource = read(join(contentDir, "EmptyState.tsx"));
const keyValueSource = read(join(contentDir, "KeyValue.tsx"));
const noticeSource = read(join(contentDir, "Notice.tsx"));
const descriptionSource = read(join(contentDir, "Description.tsx"));
const navigationSource = read(join(navigationDir, "Navigation.tsx"));
const breadcrumbsSource = read(join(navigationDir, "Breadcrumbs.tsx"));
const semanticHeaderSource = read(join(semanticsDir, "SemanticHeader.tsx"));
const panelStatusSource = read(join(statusDir, "PanelStatus.tsx"));
const surfaceSource = read(join(surfaceDir, "Surface.tsx"));
const surfaceHeaderSource = read(join(surfaceDir, "SurfaceHeader.tsx"));
const surfaceBodySource = read(join(surfaceDir, "SurfaceBody.tsx"));
const surfaceFooterSource = read(join(surfaceDir, "SurfaceFooter.tsx"));
const workspaceBarrel = read(join(workspaceDir, "index.ts"));
const pkg = read(packagePath);
const doc = read(docPath);
const roadmap = read(roadmapPath);

/* -------------------------------------------------------------------------- */
/* A. layout/ structure + barrel                                              */
/* -------------------------------------------------------------------------- */

const requiredFiles = [
  "LayoutTokens.ts",
  "PanelLayout.tsx",
  "PanelHeaderRegion.tsx",
  "PanelToolbarRegion.tsx",
  "PanelContentRegion.tsx",
  "PanelFooterRegion.tsx",
  "PanelEmptyRegion.tsx",
  "Stack.tsx",
  "Inline.tsx",
  "Cluster.tsx",
  "Center.tsx",
  "Spacer.tsx",
  "index.ts",
];
for (const f of requiredFiles) {
  assertCase(
    `ux226.layout.file.${f}`,
    existsSync(join(layoutDir, f)),
    `workspace/layout/${f} present`
  );
}

const historicalExports = [
  "LAYOUT_TOKENS",
  "PanelLayout",
  "PanelHeaderRegion",
  "PanelToolbarRegion",
  "PanelContentRegion",
  "PanelFooterRegion",
  "PanelEmptyRegion",
] as const;

for (const name of historicalExports) {
  assertCase(
    `ux226.layout.historicalExport.${name}`,
    new RegExp(`\\b${name}\\b`).test(layoutBarrel),
    `layout barrel still exports ${name}`
  );
}

const newExports = ["Stack", "Inline", "Cluster", "Center", "Spacer"] as const;
for (const name of newExports) {
  assertCase(
    `ux226.layout.newExport.${name}`,
    new RegExp(`\\b${name}\\b`).test(layoutBarrel),
    `layout barrel exports ${name}`
  );
}

assertCase(
  "ux226.layout.noPublicBarrel",
  !/from\s+["']\.\/layout/.test(workspaceBarrel) &&
    !/PanelLayout/.test(workspaceBarrel) &&
    !/LAYOUT_TOKENS/.test(workspaceBarrel) &&
    !/\bStack\b/.test(workspaceBarrel),
  "workspace public barrel does not export layout/"
);

/* -------------------------------------------------------------------------- */
/* B. LAYOUT_TOKENS — legacy + UX-2.26 maps                                   */
/* -------------------------------------------------------------------------- */

const legacyKeys = [
  "panelGap",
  "headerGap",
  "toolbarGap",
  "contentGap",
  "footerGap",
  "regionPadding",
  "emptyMinHeight",
] as const;

assertCase(
  "ux226.tokens.legacyKeys",
  legacyKeys.every((k) => new RegExp(`\\b${k}\\s*:`).test(tokensSource)),
  "LAYOUT_TOKENS retains UX-2.18 keys"
);

const newTokenKeys = [
  "STACK_GAPS",
  "align",
  "justify",
  "wrap",
  "direction",
  "center",
  "spacer",
  "cluster",
] as const;

assertCase(
  "ux226.tokens.newKeys",
  newTokenKeys.every((k) => new RegExp(`\\b${k}\\s*:`).test(tokensSource)),
  "LAYOUT_TOKENS has UX-2.26 primitive maps"
);

assertCase(
  "ux226.tokens.stackGapsScale",
  /STACK_GAPS\s*:\s*\{/.test(tokensSource) &&
    /\bxs\s*:/.test(tokensSource) &&
    /\bsm\s*:/.test(tokensSource) &&
    /\bmd\s*:/.test(tokensSource) &&
    /\blg\s*:/.test(tokensSource) &&
    /\bxl\s*:/.test(tokensSource),
  "STACK_GAPS has xs…xl"
);

assertCase(
  "ux226.tokens.asConst",
  /as const/.test(tokensSource),
  "LAYOUT_TOKENS is as const"
);

assertCase(
  "ux226.tokens.noTokenObjectDeps",
  !hasImportPath(tokensSource, "ui/tokens") &&
    !hasImportPath(tokensSource, "UI_TOKENS") &&
    !hasImportPath(tokensSource, "SURFACE_TOKENS") &&
    !hasImportPath(tokensSource, "CONTENT_TOKENS") &&
    !hasImportPath(tokensSource, "WORKSPACE_DENSITY_TOKENS") &&
    !hasImportPath(tokensSource, "SEMANTIC_TOKENS") &&
    !hasImportPath(tokensSource, "density") &&
    !/export\s+\*\s+from/.test(tokensSource),
  "LAYOUT_TOKENS does not import other *_TOKENS"
);

/* -------------------------------------------------------------------------- */
/* C. Compose-only governance (primitives + layout package)                   */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux226.governance.noUseClient",
  !/"use client"/.test(layoutSource),
  'layout/ has zero "use client"'
);

assertCase(
  "ux226.governance.noHooks",
  !hasHookCall(layoutSource),
  "layout/ has no hooks"
);

assertCase(
  "ux226.governance.noContext",
  !/\bcreateContext\b/.test(layoutSource) &&
    !/\bContext\.Provider\b/.test(layoutSource) &&
    !/\buseContext\b/.test(layoutSource),
  "layout/ has no Context"
);

assertCase(
  "ux226.governance.noAppImports",
  !hasImportPath(layoutSource, "@/app") && !/from\s+["']@\/app/.test(layoutSource),
  "layout/ has no @/app imports"
);

assertCase(
  "ux226.cluster.ownApi",
  /export function Cluster/.test(clusterSource) &&
    /gap\s*=\s*["']sm["']/.test(clusterSource) &&
    /align\s*=\s*["']center["']/.test(clusterSource) &&
    /justify\s*=\s*["']start["']/.test(clusterSource) &&
    /wrap\s*=\s*["']wrap["']/.test(clusterSource) &&
    hasJsxComponent(clusterSource, "Inline"),
  "Cluster frozen defaults sm/center/start/wrap; may compose Inline"
);

assertCase(
  "ux226.primitives.useTokens",
  /LAYOUT_TOKENS/.test(stackSource) &&
    /LAYOUT_TOKENS/.test(inlineSource) &&
    /LAYOUT_TOKENS/.test(centerSource) &&
    /LAYOUT_TOKENS/.test(spacerSource),
  "Stack/Inline/Center/Spacer consume LAYOUT_TOKENS"
);

/* -------------------------------------------------------------------------- */
/* D. PanelLayout semantic layer                                              */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux226.panelLayout.usesStack",
  hasJsxComponent(panelLayoutSource, "Stack") &&
    /LAYOUT_TOKENS/.test(panelLayoutSource),
  "PanelLayout composes Stack + LAYOUT_TOKENS"
);

for (const [id, source] of [
  ["explorer", explorerSource],
  ["inspector", inspectorSource],
  ["console", consoleSource],
] as const) {
  assertCase(
    `ux226.panels.${id}.usesPanelLayout`,
    hasJsxComponent(source, "PanelLayout"),
    `${id} still composes PanelLayout (not bare Stack shell)`
  );
  assertCase(
    `ux226.panels.${id}.noBareStackShell`,
    !hasJsxComponent(source, "Stack"),
    `${id} does not mount Stack as panel shell`
  );
}

/* -------------------------------------------------------------------------- */
/* E. Wiring                                                                  */
/* -------------------------------------------------------------------------- */

const wiringTargets: { id: string; source: string; primitives: string[] }[] = [
  { id: "PanelLayout", source: panelLayoutSource, primitives: ["Stack"] },
  {
    id: "PanelHeader",
    source: panelHeaderSource,
    primitives: ["Inline", "Cluster"],
  },
  {
    id: "panelsEmpty",
    source: panelEmptySource,
    primitives: ["Center", "Stack"],
  },
  { id: "contentEmpty", source: contentEmptySource, primitives: ["Stack"] },
  { id: "KeyValue", source: keyValueSource, primitives: ["Inline"] },
  { id: "Navigation", source: navigationSource, primitives: ["Stack"] },
  { id: "Breadcrumbs", source: breadcrumbsSource, primitives: ["Inline"] },
  {
    id: "SemanticHeader",
    source: semanticHeaderSource,
    primitives: ["Inline", "Stack"],
  },
  { id: "PanelStatus", source: panelStatusSource, primitives: ["Inline"] },
  { id: "Surface", source: surfaceSource, primitives: ["Stack"] },
  { id: "SurfaceHeader", source: surfaceHeaderSource, primitives: ["Inline"] },
  { id: "SurfaceBody", source: surfaceBodySource, primitives: ["Stack"] },
  { id: "SurfaceFooter", source: surfaceFooterSource, primitives: ["Inline"] },
];

for (const { id, source, primitives } of wiringTargets) {
  assertCase(
    `ux226.wiring.${id}`,
    primitives.every((p) => hasJsxComponent(source, p)) &&
      (hasImportPath(source, "layout") || /from\s+["']\.\/Stack["']/.test(source) || /from\s+["']\.\/Inline["']/.test(source) || /from\s+["']\.\/Cluster["']/.test(source) || /from\s+["']\.\/Center["']/.test(source)),
    `${id} wires layout primitives: ${primitives.join(", ")}`
  );
}

assertCase(
  "ux226.wiring.noticeExists",
  existsSync(join(contentDir, "Notice.tsx")) && noticeSource.length > 0,
  "Notice present (no flex wiring required)"
);

assertCase(
  "ux226.wiring.descriptionExists",
  existsSync(join(contentDir, "Description.tsx")) &&
    descriptionSource.length > 0,
  "Description present (no flex wiring required)"
);

const noRawFlexTargets = [
  ["PanelHeaderRegion", read(join(layoutDir, "PanelHeaderRegion.tsx"))],
  ["PanelContentRegion", read(join(layoutDir, "PanelContentRegion.tsx"))],
  ["PanelFooterRegion", read(join(layoutDir, "PanelFooterRegion.tsx"))],
  ["PanelToolbarRegion", read(join(layoutDir, "PanelToolbarRegion.tsx"))],
  ["PanelLayout", panelLayoutSource],
  ["Surface", surfaceSource],
  ["contentEmpty", contentEmptySource],
  ["KeyValue", keyValueSource],
  ["Navigation", navigationSource],
  ["SemanticHeader", semanticHeaderSource],
  ["PanelStatus", panelStatusSource],
] as const;

for (const [id, source] of noRawFlexTargets) {
  assertCase(
    `ux226.wiring.noRawFlex.${id}`,
    !/["'`]flex flex-col["'`]/.test(source) &&
      !/["'`]flex flex-row/.test(source) &&
      !/["'`]flex items-/.test(source) &&
      !/["'`]inline-flex/.test(source),
    `${id}: no raw flex flex-col/row/items/inline-flex string literals`
  );
}

/* -------------------------------------------------------------------------- */
/* F. Docs                                                                    */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux226.doc.exists",
  existsSync(docPath) && /UX-2\.26/.test(doc) && /COMPLETE/.test(doc),
  "docs/UX-2.26-workspace-layout-primitives.md COMPLETE"
);

assertCase(
  "ux226.doc.governance",
  /compose-only/i.test(doc) &&
    /PanelLayout/.test(doc) &&
    /STACK_GAPS/.test(doc) &&
    /Cluster/.test(doc),
  "doc covers compose-only / PanelLayout / STACK_GAPS / Cluster"
);

assertCase(
  "ux226.roadmap.status",
  /UX-2\.26\s*=\s*COMPLETE/.test(roadmap) &&
    (/Layout Primitives/i.test(roadmap) || /layout primitives/i.test(roadmap)),
  "roadmap marks UX-2.26 COMPLETE"
);

assertCase(
  "ux226.package.script",
  /"validate:ux-2\.26"\s*:/.test(pkg),
  "validate:ux-2.26 in package.json"
);

/* -------------------------------------------------------------------------- */
/* G. Delegates — UX-2.25 + tsc + eslint                                      */
/* -------------------------------------------------------------------------- */

if (process.env.UX_SKIP_DELEGATES !== "1") {
  const ux225 = spawnSync("npx", ["tsx", "scripts/validate-ux-2.25.ts"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
    env: { ...process.env, UX_SKIP_DELEGATES: "1" },
  });
  assertCase(
    "ux226.delegate.ux-2.25",
    ux225.status === 0,
    ux225.status === 0
      ? "PASS (leaf)"
      : `${ux225.stdout ?? ""}\n${ux225.stderr ?? ""}`.trim().slice(-1200)
  );

  const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
  });
  assertCase(
    "ux226.typescript",
    tsc.status === 0,
    tsc.status === 0
      ? "PASS"
      : `${tsc.stdout ?? ""}\n${tsc.stderr ?? ""}`.trim().slice(-1200)
  );

  const eslint = spawnSync(
    "npx",
    [
      "eslint",
      "src/components/workspace/layout",
      "src/components/workspace/surface",
      "src/components/workspace/content/EmptyState.tsx",
      "src/components/workspace/content/KeyValue.tsx",
      "src/components/workspace/content/CONTENT_TOKENS.ts",
      "src/components/workspace/navigation/Navigation.tsx",
      "src/components/workspace/navigation/Breadcrumbs.tsx",
      "src/components/workspace/navigation/navigationTokens.ts",
      "src/components/workspace/semantics/SemanticHeader.tsx",
      "src/components/workspace/semantics/SemanticStatus.tsx",
      "src/components/workspace/semantics/SemanticFooter.tsx",
      "src/components/workspace/semantics/SEMANTIC_TOKENS.ts",
      "src/components/workspace/panels/PanelHeader.tsx",
      "src/components/workspace/panels/empty/EmptyState.tsx",
      "src/components/workspace/status/PanelStatus.tsx",
      "scripts/validate-ux-2.26.ts",
    ],
    {
      cwd: repoRoot,
      encoding: "utf8",
      shell: true,
    }
  );
  assertCase(
    "ux226.eslint",
    eslint.status === 0,
    eslint.status === 0
      ? "PASS"
      : `${eslint.stdout ?? ""}\n${eslint.stderr ?? ""}`.trim().slice(-1200)
  );
} else {
  assertCase(
    "ux226.delegate.skipped",
    true,
    "UX_SKIP_DELEGATES=1 — leaf suite skipped"
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "ux-2.26-workspace-layout-primitives",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — ux-2.26-workspace-layout-primitives"
    : `\nFAIL — ux-2.26-workspace-layout-primitives (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
