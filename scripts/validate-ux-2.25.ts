/**
 * UX-2.25 — Workspace Density & Spacing System gate.
 * Compose-only density SSOT; DensityProvider is a semantic boundary (not Context).
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const workspaceDir = join(repoRoot, "src/components/workspace");
const densityDir = join(workspaceDir, "density");
const layoutDir = join(workspaceDir, "layout");
const surfaceDir = join(workspaceDir, "surface");
const contentDir = join(workspaceDir, "content");
const semanticsDir = join(workspaceDir, "semantics");
const navigationDir = join(workspaceDir, "navigation");
const panelsDir = join(workspaceDir, "panels");
const panelContentDir = join(panelsDir, "content");
const toolbarDir = join(workspaceDir, "toolbar");
const packagePath = join(repoRoot, "package.json");
const docPath = join(repoRoot, "docs/UX-2.25-workspace-density.md");
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

/** Extract a top-level string literal for key in an `as const` object source. */
const extractTokenString = (source: string, key: string): string | null => {
  const m = source.match(
    new RegExp(`\\b${key}\\s*:\\s*["'\`]([^"'\`]+)["'\`]`)
  );
  return m ? m[1] : null;
};

const extractNestedTokenString = (
  source: string,
  parent: string,
  key: string
): string | null => {
  const block = source.match(
    new RegExp(`\\b${parent}\\s*:\\s*\\{([\\s\\S]*?)\\n\\s*\\}`)
  );
  if (!block) return null;
  const m = block[1].match(
    new RegExp(`\\b${key}\\s*:\\s*["'\`]([^"'\`]+)["'\`]`)
  );
  return m ? m[1] : null;
};

const densityFiles = collectTsFiles(densityDir);
const densitySource = densityFiles.map((f) => f.source).join("\n");
const densityBarrel = read(join(densityDir, "index.ts"));
const tokensSource = read(join(densityDir, "densityTokens.ts"));
const providerSource = read(join(densityDir, "DensityProvider.tsx"));
const spacerSource = read(join(densityDir, "DensitySpacer.tsx"));
const layoutTokens = read(join(layoutDir, "LayoutTokens.ts"));
const surfaceTokens = read(join(surfaceDir, "SURFACE_TOKENS.ts"));
const contentTokens = read(join(contentDir, "CONTENT_TOKENS.ts"));
const semanticTokens = read(join(semanticsDir, "SEMANTIC_TOKENS.ts"));
const actionTokens = read(join(toolbarDir, "ACTION_TOKENS.ts"));
const explorerSource = read(join(panelContentDir, "ExplorerContent.tsx"));
const inspectorSource = read(join(panelContentDir, "InspectorContent.tsx"));
const consoleSource = read(join(panelContentDir, "ConsoleContent.tsx"));
const bodyLayoutSource = read(join(panelsDir, "WorkspaceBodyLayout.tsx"));
const navigationSource = read(join(navigationDir, "Navigation.tsx"));
const surfaceSource = read(join(surfaceDir, "Surface.tsx"));
const surfaceHeaderSource = read(join(surfaceDir, "SurfaceHeader.tsx"));
const surfaceDividerSource = read(join(surfaceDir, "SurfaceDivider.tsx"));
const semanticHeaderSource = read(join(semanticsDir, "SemanticHeader.tsx"));
const contentGroupSource = read(join(contentDir, "ContentGroup.tsx"));
const panelLayoutSource = read(join(layoutDir, "PanelLayout.tsx"));
const workspaceContentSource = read(join(workspaceDir, "WorkspaceContent.tsx"));
const workspaceBarrel = read(join(workspaceDir, "index.ts"));
const pkg = read(packagePath);
const doc = read(docPath);
const roadmap = read(roadmapPath);

/* -------------------------------------------------------------------------- */
/* A. density/ structure + barrel                                             */
/* -------------------------------------------------------------------------- */

const requiredFiles = [
  "densityTokens.ts",
  "DensityProvider.tsx",
  "DensitySpacer.tsx",
  "index.ts",
];
for (const f of requiredFiles) {
  assertCase(
    `ux225.density.file.${f}`,
    existsSync(join(densityDir, f)),
    `workspace/density/${f} present`
  );
}

assertCase(
  "ux225.density.barrel",
  /WORKSPACE_DENSITY_TOKENS/.test(densityBarrel) &&
    /DensityProvider/.test(densityBarrel) &&
    /DensitySpacer/.test(densityBarrel),
  "density barrel exports public API"
);

assertCase(
  "ux225.density.barrel.onlyThree",
  !/DENSITY_SPACER_MAP/.test(densityBarrel) &&
    !/export\s+function\s+/.test(densityBarrel) &&
    (densityBarrel.match(/export\s+\{/g) ?? []).length >= 3,
  "density barrel is re-exports only; no DENSITY_SPACER_MAP"
);

assertCase(
  "ux225.density.noPublicBarrel",
  !/from\s+["']\.\/density/.test(workspaceBarrel) &&
    !/WORKSPACE_DENSITY_TOKENS/.test(workspaceBarrel) &&
    !/DensityProvider/.test(workspaceBarrel) &&
    !/DensitySpacer/.test(workspaceBarrel),
  "workspace public barrel does not export density/"
);

/* -------------------------------------------------------------------------- */
/* B. Tokens — frozen keys + compose-only                                     */
/* -------------------------------------------------------------------------- */

const requiredKeys = [
  "panelPadding",
  "panelGap",
  "headerHeight",
  "headerGap",
  "contentGap",
  "sectionGap",
  "rowGap",
  "controlHeight",
  "toolbarGap",
  "iconGap",
  "listGap",
  "cardGap",
] as const;

const expectedValues: Record<(typeof requiredKeys)[number], string> = {
  panelPadding: "p-2.5",
  panelGap: "gap-2",
  headerHeight: "min-h-8",
  headerGap: "gap-2",
  contentGap: "gap-2",
  sectionGap: "my-2.5",
  rowGap: "gap-2",
  controlHeight: "min-h-4",
  toolbarGap: "gap-2",
  iconGap: "gap-1.5",
  listGap: "gap-1.5",
  cardGap: "gap-2",
};

assertCase(
  "ux225.tokens.keys",
  requiredKeys.every((k) => new RegExp(`\\b${k}\\s*:`).test(tokensSource)),
  "WORKSPACE_DENSITY_TOKENS has exact frozen keys"
);

assertCase(
  "ux225.tokens.asConst",
  /WORKSPACE_DENSITY_TOKENS\s*=\s*\{[\s\S]*\}\s*as\s+const/.test(tokensSource),
  "WORKSPACE_DENSITY_TOKENS is as const"
);

for (const key of requiredKeys) {
  const got = extractTokenString(tokensSource, key);
  assertCase(
    `ux225.tokens.value.${key}`,
    got === expectedValues[key],
    `${key} === "${expectedValues[key]}" (got ${JSON.stringify(got)})`
  );
}

assertCase(
  "ux225.tokens.composeOnlyDocs",
  /compose-only/i.test(tokensSource) && /MUST NOT/.test(tokensSource),
  "WORKSPACE_DENSITY_TOKENS documents compose-only independence"
);

assertCase(
  "ux225.tokens.noTokenObjectDeps",
  !hasImportPath(tokensSource, "ui/tokens") &&
    !hasImportPath(tokensSource, "UI_TOKENS") &&
    !hasImportPath(tokensSource, "SURFACE_TOKENS") &&
    !hasImportPath(tokensSource, "CONTENT_TOKENS") &&
    !hasImportPath(tokensSource, "LAYOUT_TOKENS") &&
    !hasImportPath(tokensSource, "SEMANTIC_TOKENS") &&
    !hasImportPath(tokensSource, "ACTION_TOKENS") &&
    !hasImportPath(tokensSource, "ICON_TOKENS") &&
    !hasImportPath(tokensSource, "NAVIGATION_TOKENS") &&
    !/export\s+\*\s+from/.test(tokensSource),
  "WORKSPACE_DENSITY_TOKENS does not import/re-export other *_TOKENS"
);

/* -------------------------------------------------------------------------- */
/* C. Governance                                                              */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux225.governance.noUseClient",
  !/"use client"/.test(densitySource),
  "density/ has no use client"
);

assertCase(
  "ux225.governance.noHooks",
  !hasHookCall(densitySource),
  "density/ has no hooks"
);

assertCase(
  "ux225.governance.noAppImports",
  !hasImportPath(densitySource, "@/app") &&
    !/from\s+["'][^"']*\/app\//.test(densitySource),
  "density/ has no app imports"
);

assertCase(
  "ux225.governance.noContext",
  !/\bcreateContext\b/.test(densitySource) &&
    !/\buseContext\b/.test(densitySource) &&
    !/\bContext\.Provider\b/.test(densitySource),
  "density/ has no React Context"
);

assertCase(
  "ux225.governance.noRuntimeLogic",
  !/\bif\s*\(/.test(densitySource) &&
    !/\bswitch\s*\(/.test(densitySource) &&
    !/\buseState\b/.test(densitySource) &&
    !/\buseEffect\b/.test(densitySource),
  "density/ has no if/switch/useState/useEffect runtime logic"
);

/* -------------------------------------------------------------------------- */
/* D. DensityProvider                                                         */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux225.provider.props",
  /density\?\s*:\s*["']comfortable["']\s*\|\s*["']compact["']/.test(
    providerSource
  ) && /children\?\s*:/.test(providerSource),
  "DensityProviderProps: density? + children?"
);

assertCase(
  "ux225.provider.propsOnly",
  (() => {
    const m = providerSource.match(
      /export\s+type\s+DensityProviderProps\s*=\s*\{([\s\S]*?)\}/
    );
    if (!m) return false;
    const props = [...m[1].matchAll(/(\w+)\s*\??\s*:/g)].map((x) => x[1]);
    return (
      props.length === 2 &&
      props.includes("density") &&
      props.includes("children")
    );
  })(),
  "DensityProvider props only density? + children?"
);

assertCase(
  "ux225.provider.fragment",
  /return\s+<>\{children\}<\/>/.test(providerSource) ||
    /return\s+<Fragment>\{children\}<\/Fragment>/.test(providerSource),
  "DensityProvider returns Fragment only"
);

assertCase(
  "ux225.provider.noWrapperDom",
  !/return\s+<\s*div\b/.test(providerSource),
  "DensityProvider has no wrapper DOM"
);

assertCase(
  "ux225.provider.semanticBoundaryDocs",
  /compose-only semantic boundary/i.test(providerSource) &&
    /Not a React Context provider/i.test(providerSource) &&
    /no runtime work/i.test(providerSource),
  "DensityProvider documents semantic boundary governance"
);

assertCase(
  "ux225.provider.defaultComfortable",
  /density\s*=\s*["']comfortable["']/.test(providerSource),
  "DensityProvider defaults density=comfortable"
);

/* -------------------------------------------------------------------------- */
/* E. DensitySpacer                                                           */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux225.spacer.map",
  /const\s+DENSITY_SPACER_MAP\s*=\s*\{[\s\S]*section\s*:[\s\S]*row\s*:[\s\S]*list\s*:[\s\S]*card\s*:[\s\S]*\}\s*as\s+const/.test(
    spacerSource
  ),
  "DENSITY_SPACER_MAP frozen as const with section/row/list/card"
);

assertCase(
  "ux225.spacer.mapPrivate",
  !/export\s+(const|type|function)\s+DENSITY_SPACER_MAP/.test(spacerSource) &&
    !/DENSITY_SPACER_MAP/.test(densityBarrel),
  "DENSITY_SPACER_MAP is file-private"
);

assertCase(
  "ux225.spacer.noBranching",
  !/\bif\s*\(/.test(spacerSource) &&
    !/\bswitch\s*\(/.test(spacerSource) &&
    !/\?\s*[^:]+:/.test(
      spacerSource.replace(/size\s*:\s*["']section["']\s*\|\s*["']row["']\s*\|\s*["']list["']\s*\|\s*["']card["']/, "")
    ),
  "DensitySpacer has no if/switch/ternary on size"
);

assertCase(
  "ux225.spacer.props",
  /size\s*:\s*["']section["']\s*\|\s*["']row["']\s*\|\s*["']list["']\s*\|\s*["']card["']/.test(
    spacerSource
  ),
  "DensitySpacerProps size union frozen"
);

assertCase(
  "ux225.spacer.render",
  /DENSITY_SPACER_MAP\[size\]/.test(spacerSource) &&
    /aria-hidden/.test(spacerSource),
  "DensitySpacer renders map lookup + aria-hidden"
);

/* -------------------------------------------------------------------------- */
/* F. Unidirectional parity (Density === mirror)                              */
/* -------------------------------------------------------------------------- */

const densityPanelGap = extractTokenString(tokensSource, "panelGap");
const densityHeaderGap = extractTokenString(tokensSource, "headerGap");
const densityContentGap = extractTokenString(tokensSource, "contentGap");
const densityToolbarGap = extractTokenString(tokensSource, "toolbarGap");
const densityPanelPadding = extractTokenString(tokensSource, "panelPadding");
const densityHeaderHeight = extractTokenString(tokensSource, "headerHeight");
const densityRowGap = extractTokenString(tokensSource, "rowGap");
const densityControlHeight = extractTokenString(tokensSource, "controlHeight");
const densitySectionGap = extractTokenString(tokensSource, "sectionGap");

assertCase(
  "ux225.parity.layout.panelGap",
  densityPanelGap != null &&
    densityPanelGap === extractTokenString(layoutTokens, "panelGap"),
  "Density.panelGap === Layout.panelGap"
);

assertCase(
  "ux225.parity.layout.headerGap",
  densityHeaderGap != null &&
    densityHeaderGap === extractTokenString(layoutTokens, "headerGap"),
  "Density.headerGap === Layout.headerGap"
);

assertCase(
  "ux225.parity.layout.contentGap",
  densityContentGap != null &&
    densityContentGap === extractTokenString(layoutTokens, "contentGap"),
  "Density.contentGap === Layout.contentGap"
);

assertCase(
  "ux225.parity.layout.toolbarGap",
  densityToolbarGap != null &&
    densityToolbarGap === extractTokenString(layoutTokens, "toolbarGap"),
  "Density.toolbarGap === Layout.toolbarGap"
);

assertCase(
  "ux225.parity.layout.regionPadding.md",
  densityPanelPadding != null &&
    densityPanelPadding ===
      extractNestedTokenString(layoutTokens, "regionPadding", "md"),
  "Density.panelPadding === Layout.regionPadding.md"
);

assertCase(
  "ux225.parity.surface.panelPadding",
  densityPanelPadding != null &&
    densityPanelPadding === extractTokenString(surfaceTokens, "panelPadding"),
  "Density.panelPadding === Surface.panelPadding"
);

assertCase(
  "ux225.parity.surface.headerHeight",
  densityHeaderHeight != null &&
    densityHeaderHeight === extractTokenString(surfaceTokens, "headerHeight"),
  "Density.headerHeight === Surface.headerHeight"
);

assertCase(
  "ux225.parity.surface.bodyGap",
  densityPanelGap != null &&
    densityPanelGap === extractTokenString(surfaceTokens, "bodyGap"),
  "Density.panelGap === Surface.bodyGap"
);

assertCase(
  "ux225.parity.semantic.HEADER_GAP",
  densityHeaderGap != null &&
    densityHeaderGap === extractTokenString(semanticTokens, "HEADER_GAP"),
  "Density.headerGap === Semantic.HEADER_GAP"
);

assertCase(
  "ux225.parity.content.rowGap.md",
  densityRowGap != null &&
    densityRowGap === extractNestedTokenString(contentTokens, "rowGap", "md"),
  "Density.rowGap === Content.rowGap.md"
);

assertCase(
  "ux225.parity.content.divider.spacing",
  densitySectionGap != null &&
    densitySectionGap ===
      extractNestedTokenString(contentTokens, "divider", "spacing"),
  "Density.sectionGap === Content.divider.spacing"
);

assertCase(
  "ux225.parity.action.height",
  densityControlHeight != null &&
    densityControlHeight === extractTokenString(actionTokens, "height"),
  "Density.controlHeight === Action.height"
);

assertCase(
  "ux225.parity.action.gap",
  densityToolbarGap != null &&
    densityToolbarGap === extractTokenString(actionTokens, "gap"),
  "Density.toolbarGap === Action.gap"
);

/* -------------------------------------------------------------------------- */
/* G. Wiring                                                                  */
/* -------------------------------------------------------------------------- */

const wiringTargets: { id: string; source: string }[] = [
  { id: "explorer", source: explorerSource },
  { id: "inspector", source: inspectorSource },
  { id: "console", source: consoleSource },
  { id: "canvas", source: bodyLayoutSource },
  { id: "navigation", source: navigationSource },
  { id: "surface", source: surfaceSource },
  { id: "surfaceHeader", source: surfaceHeaderSource },
  { id: "semanticHeader", source: semanticHeaderSource },
  { id: "content", source: contentGroupSource },
  { id: "panelLayout", source: panelLayoutSource },
];

for (const { id, source } of wiringTargets) {
  assertCase(
    `ux225.wiring.${id}`,
    hasImportPath(source, "density") && hasJsxComponent(source, "DensityProvider"),
    `${id}: imports density + DensityProvider`
  );
}

assertCase(
  "ux225.wiring.header",
  hasJsxComponent(semanticHeaderSource, "DensityProvider") ||
    hasJsxComponent(surfaceHeaderSource, "DensityProvider"),
  "Header (SemanticHeader and/or SurfaceHeader) uses DensityProvider"
);

assertCase(
  "ux225.wiring.surfaceDivider",
  hasImportPath(surfaceDividerSource, "density") &&
    /WORKSPACE_DENSITY_TOKENS\.sectionGap/.test(surfaceDividerSource) &&
    !/["'`]my-2\.5["'`]/.test(surfaceDividerSource),
  "SurfaceDivider uses WORKSPACE_DENSITY_TOKENS.sectionGap"
);

assertCase(
  "ux225.wiring.canvas.panelPadding",
  /WORKSPACE_DENSITY_TOKENS\.panelPadding/.test(bodyLayoutSource),
  "Canvas uses WORKSPACE_DENSITY_TOKENS.panelPadding"
);

assertCase(
  "ux225.wiring.workspaceContent",
  hasImportPath(workspaceContentSource, "density") &&
    /WORKSPACE_DENSITY_TOKENS/.test(workspaceContentSource) &&
    !/\bpb-3\b/.test(workspaceContentSource) &&
    !/\bspace-y-0\.5\b/.test(workspaceContentSource),
  "WorkspaceContent uses density tokens; no pb-3 / space-y-0.5"
);

/* -------------------------------------------------------------------------- */
/* H. Docs                                                                    */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux225.doc.exists",
  existsSync(docPath) && /UX-2\.25/.test(doc) && /COMPLETE/.test(doc),
  "docs/UX-2.25-workspace-density.md COMPLETE"
);

assertCase(
  "ux225.doc.governance",
  /compose-only semantic boundary/i.test(doc) &&
    /must never evolve into Context/i.test(doc) &&
    /DENSITY_SPACER_MAP/.test(doc) &&
    /unidirectional/i.test(doc),
  "doc covers marker / spacer map / unidirectional parity"
);

assertCase(
  "ux225.roadmap.status",
  /UX-2\.25\s*=\s*COMPLETE/.test(roadmap) &&
    /Density/i.test(roadmap) &&
    (/NEXT\s*=\s*UX-3\.0/.test(roadmap) || /NEXT\s*→\s*UX-3\.0/.test(roadmap)),
  "roadmap marks UX-2.25 COMPLETE; NEXT → UX-3.0"
);

assertCase(
  "ux225.package.script",
  /"validate:ux-2\.25"\s*:/.test(pkg),
  "validate:ux-2.25 in package.json"
);

/* -------------------------------------------------------------------------- */
/* I. Delegates — UX-2.24 + tsc + eslint                                      */
/* -------------------------------------------------------------------------- */

if (process.env.UX_SKIP_DELEGATES !== "1") {
  const ux224 = spawnSync("npx", ["tsx", "scripts/validate-ux-2.24.ts"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
    env: { ...process.env, UX_SKIP_DELEGATES: "1" },
  });
  assertCase(
    "ux225.delegate.ux-2.24",
    ux224.status === 0,
    ux224.status === 0
      ? "PASS (leaf)"
      : `${ux224.stdout ?? ""}\n${ux224.stderr ?? ""}`.trim().slice(-1200)
  );

  const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
  });
  assertCase(
    "ux225.typescript",
    tsc.status === 0,
    tsc.status === 0
      ? "PASS"
      : `${tsc.stdout ?? ""}\n${tsc.stderr ?? ""}`.trim().slice(-1200)
  );

  const eslint = spawnSync(
    "npx",
    [
      "eslint",
      "src/components/workspace/density",
      "src/components/workspace/navigation/Navigation.tsx",
      "src/components/workspace/surface",
      "src/components/workspace/semantics/SemanticHeader.tsx",
      "src/components/workspace/layout/PanelLayout.tsx",
      "src/components/workspace/layout/LayoutTokens.ts",
      "src/components/workspace/content/ContentGroup.tsx",
      "src/components/workspace/panels/content",
      "src/components/workspace/panels/WorkspaceBodyLayout.tsx",
      "src/components/workspace/WorkspaceContent.tsx",
      "scripts/validate-ux-2.25.ts",
    ],
    {
      cwd: repoRoot,
      encoding: "utf8",
      shell: true,
    }
  );
  assertCase(
    "ux225.eslint",
    eslint.status === 0,
    eslint.status === 0
      ? "PASS"
      : `${eslint.stdout ?? ""}\n${eslint.stderr ?? ""}`.trim().slice(-1200)
  );
} else {
  assertCase(
    "ux225.delegate.skipped",
    true,
    "UX_SKIP_DELEGATES=1 — leaf suite skipped"
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "ux-2.25-workspace-density",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — ux-2.25-workspace-density"
    : `\nFAIL — ux-2.25-workspace-density (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
