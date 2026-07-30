/**
 * UX-2.18 — Semantic Layout Foundation gate.
 * Presentational only; PanelState / persistence / resize / focus / modes frozen.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const workspaceDir = join(repoRoot, "src/components/workspace");
const layoutDir = join(workspaceDir, "layout");
const panelsDir = join(workspaceDir, "panels");
const contentDir = join(panelsDir, "content");
const stateDir = join(panelsDir, "state");
const persistenceDir = join(panelsDir, "persistence");
const resizeDir = join(panelsDir, "resize");
const focusDir = join(workspaceDir, "focus");
const modesDir = join(workspaceDir, "modes");
const packagePath = join(repoRoot, "package.json");
const docPath = join(repoRoot, "docs/UX-2.18-semantic-layout.md");
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

const hasHookCall = (source: string): boolean =>
  /\buseState\s*\(/.test(source) ||
  /\buseMemo\s*\(/.test(source) ||
  /\buseEffect\s*\(/.test(source) ||
  /\buseLayoutEffect\s*\(/.test(source) ||
  /\buseCallback\s*\(/.test(source) ||
  /\buseRef\s*\(/.test(source);

/** Ad-hoc spacing utilities in className string literals (not token lookups). */
const hasAdHocSpacingLiteral = (source: string): boolean =>
  /["'`][^"'`]*\b(gap|mb|mt|space-y|p|px|py|pt|pb|pl|pr)-\S+/.test(source);

const layoutSource = collectTsSources(layoutDir).join("\n");
const layoutBarrel = read(join(layoutDir, "index.ts"));
const tokensSource = read(join(layoutDir, "LayoutTokens.ts"));
const panelLayoutSource = read(join(layoutDir, "PanelLayout.tsx"));
const headerSource = read(join(layoutDir, "PanelHeaderRegion.tsx"));
const toolbarSource = read(join(layoutDir, "PanelToolbarRegion.tsx"));
const contentRegionSource = read(join(layoutDir, "PanelContentRegion.tsx"));
const footerSource = read(join(layoutDir, "PanelFooterRegion.tsx"));
const emptySource = read(join(layoutDir, "PanelEmptyRegion.tsx"));
const bodyLayoutSource = read(join(panelsDir, "WorkspaceBodyLayout.tsx"));
const explorerSource = read(join(contentDir, "ExplorerContent.tsx"));
const inspectorSource = read(join(contentDir, "InspectorContent.tsx"));
const consoleSource = read(join(contentDir, "ConsoleContent.tsx"));
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
/* A. layout/ structure + barrel                                              */
/* -------------------------------------------------------------------------- */

const layoutFiles = [
  "LayoutTokens.ts",
  "PanelLayout.tsx",
  "PanelHeaderRegion.tsx",
  "PanelToolbarRegion.tsx",
  "PanelContentRegion.tsx",
  "PanelFooterRegion.tsx",
  "PanelEmptyRegion.tsx",
  "index.ts",
];
for (const f of layoutFiles) {
  assertCase(
    `ux218.layout.file.${f}`,
    existsSync(join(layoutDir, f)),
    `workspace/layout/${f} present`
  );
}

assertCase(
  "ux218.layout.barrel",
  /LAYOUT_TOKENS/.test(layoutBarrel) &&
    /PanelLayout/.test(layoutBarrel) &&
    /PanelHeaderRegion/.test(layoutBarrel) &&
    /PanelToolbarRegion/.test(layoutBarrel) &&
    /PanelContentRegion/.test(layoutBarrel) &&
    /PanelFooterRegion/.test(layoutBarrel) &&
    /PanelEmptyRegion/.test(layoutBarrel),
  "layout barrel exports public API only"
);

assertCase(
  "ux218.layout.noPublicBarrel",
  !/from\s+["']\.\/layout/.test(workspaceBarrel) &&
    !/PanelLayout/.test(workspaceBarrel) &&
    !/LAYOUT_TOKENS/.test(workspaceBarrel),
  "workspace/index.ts does not export layout/"
);

/* -------------------------------------------------------------------------- */
/* B. LayoutTokens SSOT                                                       */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux218.tokens.keys",
  /panelGap/.test(tokensSource) &&
    /headerGap/.test(tokensSource) &&
    /toolbarGap/.test(tokensSource) &&
    /contentGap/.test(tokensSource) &&
    /footerGap/.test(tokensSource) &&
    /regionPadding/.test(tokensSource) &&
    /emptyMinHeight/.test(tokensSource) &&
    /none:/.test(tokensSource) &&
    /sm:/.test(tokensSource) &&
    /md:/.test(tokensSource),
  "LAYOUT_TOKENS has required spacing keys"
);

assertCase(
  "ux218.tokens.noSurfaceImport",
  !hasImportPath(tokensSource, "SurfaceTokens") &&
    !hasImportPath(tokensSource, "surfaces") &&
    !/SURFACE_TOKENS/.test(tokensSource),
  "LayoutTokens does not import SURFACE_TOKENS"
);

const componentSources = [
  ["PanelLayout", panelLayoutSource],
  ["PanelHeaderRegion", headerSource],
  ["PanelToolbarRegion", toolbarSource],
  ["PanelContentRegion", contentRegionSource],
  ["PanelFooterRegion", footerSource],
  ["PanelEmptyRegion", emptySource],
] as const;

for (const [name, source] of componentSources) {
  assertCase(
    `ux218.${name}.usesLayoutTokens`,
    /LAYOUT_TOKENS\./.test(source),
    `${name} reads LAYOUT_TOKENS`
  );
  assertCase(
    `ux218.${name}.noSurfaceTokens`,
    !/SURFACE_TOKENS/.test(source) && !hasImportPath(source, "SurfaceTokens"),
    `${name} does not use SURFACE_TOKENS`
  );
  assertCase(
    `ux218.${name}.noAdHocSpacing`,
    !hasAdHocSpacingLiteral(source),
    `${name} has no local spacing class literals`
  );
}

/* -------------------------------------------------------------------------- */
/* C. API freeze + no variants                                                */
/* -------------------------------------------------------------------------- */

for (const [name, source] of componentSources) {
  assertCase(
    `ux218.${name}.apiFreeze`,
    /children:\s*ReactNode/.test(source) &&
      /className\?:\s*string/.test(source) &&
      !/\bvariant\s*[?:]/.test(source) &&
      !/\bdense\s*[?:]/.test(source) &&
      !/\bcompact\s*[?:]/.test(source) &&
      !/\bdirection\s*[?:]/.test(source) &&
      !/\borientation\s*[?:]/.test(source) &&
      !/\bpadding\s*\?:/.test(source) &&
      !/\bgap\s*\?:/.test(source) &&
      !/\bspacing\s*\?:/.test(source),
    `${name} API frozen to children + className`
  );
}

assertCase(
  "ux218.PanelLayout.noOrderingLogic",
  !/React\.Children/.test(panelLayoutSource) &&
    !/Children\./.test(panelLayoutSource) &&
    !/\.sort\(/.test(panelLayoutSource) &&
    !/\.map\(/.test(panelLayoutSource) &&
    /\{children\}/.test(panelLayoutSource),
  "PanelLayout renders children as-is (no ordering)"
);

assertCase(
  "ux218.PanelContentRegion.noScrollSizing",
  !/\bflex-1\b/.test(contentRegionSource) &&
    !/\boverflow-/.test(contentRegionSource) &&
    !/\boverflow\b/.test(
      contentRegionSource.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")
    ) &&
    !/\bscroll\b/.test(
      contentRegionSource.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")
    ) &&
    !/\bsticky\b/.test(
      contentRegionSource.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")
    ),
  "PanelContentRegion has no flex-1 / overflow / scroll / sticky"
);

/* -------------------------------------------------------------------------- */
/* D. Zero hooks + zero use client                                            */
/* -------------------------------------------------------------------------- */

for (const [name, source] of componentSources) {
  assertCase(
    `ux218.${name}.noHooks`,
    !hasHookCall(source),
    `${name} has zero hooks`
  );
}

assertCase(
  "ux218.layout.noUseClient",
  !/"use client"/.test(layoutSource) && !/'use client'/.test(layoutSource),
  'workspace/layout/ has zero "use client"'
);

/* -------------------------------------------------------------------------- */
/* E. Wiring                                                                  */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux218.wire.explorer",
  hasJsxComponent(explorerSource, "PanelLayout") &&
    hasJsxComponent(explorerSource, "PanelHeaderRegion") &&
    hasJsxComponent(explorerSource, "PanelContentRegion") &&
    hasJsxComponent(explorerSource, "WorkspaceGroup") &&
    hasJsxComponent(explorerSource, "PanelSurface") &&
    hasJsxComponent(explorerSource, "PanelAccent") &&
    !hasJsxComponent(explorerSource, "WorkspaceSection") &&
    !hasJsxComponent(explorerSource, "WorkspaceStack"),
  "Explorer: PanelLayout + Header + Content; Section/Stack removed"
);

assertCase(
  "ux218.wire.inspector",
  hasJsxComponent(inspectorSource, "PanelLayout") &&
    hasJsxComponent(inspectorSource, "PanelContentRegion") &&
    hasJsxComponent(inspectorSource, "WorkspaceGroup") &&
    (() => {
      const accentIdx = inspectorSource.indexOf("<PanelAccent");
      const panelDividerIdx = inspectorSource.indexOf("<PanelDivider");
      const contextDividerIdx = inspectorSource.indexOf("<ContextDivider");
      const disclosureIdx = inspectorSource.indexOf("<DisclosureSection");
      return (
        accentIdx >= 0 &&
        panelDividerIdx > accentIdx &&
        contextDividerIdx > panelDividerIdx &&
        disclosureIdx > contextDividerIdx
      );
    })() &&
    !hasJsxComponent(inspectorSource, "WorkspaceSection") &&
    !hasJsxComponent(inspectorSource, "WorkspaceStack"),
  "Inspector: PanelLayout + Accent → PanelDivider → ContextDivider → Disclosure"
);

assertCase(
  "ux218.wire.console",
  hasJsxComponent(consoleSource, "PanelLayout") &&
    hasJsxComponent(consoleSource, "PanelContentRegion") &&
    hasJsxComponent(consoleSource, "WorkspaceGroup") &&
    !hasJsxComponent(consoleSource, "WorkspaceSection") &&
    !hasJsxComponent(consoleSource, "WorkspaceStack"),
  "Console: PanelLayout + ContentRegion + WorkspaceGroup"
);

assertCase(
  "ux218.wire.canvas",
  hasJsxComponent(bodyLayoutSource, "PanelLayout") &&
    hasJsxComponent(bodyLayoutSource, "PanelToolbarRegion") &&
    hasJsxComponent(bodyLayoutSource, "PanelContentRegion") &&
    hasJsxComponent(bodyLayoutSource, "PanelSurface") &&
    /data-workspace-canvas/.test(bodyLayoutSource) &&
    (() => {
      const canvasIdx = bodyLayoutSource.indexOf("data-workspace-canvas");
      const surfaceIdx = bodyLayoutSource.indexOf("<PanelSurface");
      const layoutIdx = bodyLayoutSource.indexOf("<PanelLayout");
      const toolbarIdx = bodyLayoutSource.indexOf("<PanelToolbarRegion");
      const contentIdx = bodyLayoutSource.indexOf("<PanelContentRegion");
      return (
        canvasIdx >= 0 &&
        surfaceIdx > canvasIdx &&
        layoutIdx > surfaceIdx &&
        toolbarIdx > layoutIdx &&
        contentIdx > toolbarIdx
      );
    })() &&
    !hasJsxComponent(bodyLayoutSource, "WorkspaceSection") &&
    !hasJsxComponent(bodyLayoutSource, "WorkspaceStack"),
  "Canvas: data-workspace-canvas → PanelSurface → PanelLayout → Toolbar → Content"
);

assertCase(
  "ux218.wire.explorer.canonicalOrder",
  (() => {
    const headerIdx = explorerSource.indexOf("<PanelHeaderRegion");
    const contentIdx = explorerSource.indexOf("<PanelContentRegion");
    return headerIdx >= 0 && contentIdx > headerIdx;
  })(),
  "Explorer regions follow Header → Content"
);

assertCase(
  "ux218.wire.canvas.canonicalOrder",
  (() => {
    const toolbarIdx = bodyLayoutSource.indexOf("<PanelToolbarRegion");
    const contentIdx = bodyLayoutSource.indexOf("<PanelContentRegion");
    return toolbarIdx >= 0 && contentIdx > toolbarIdx;
  })(),
  "Canvas regions follow Toolbar → Content"
);

/* -------------------------------------------------------------------------- */
/* F. Isolation                                                               */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux218.layout.forbidden.symbols",
  !hasImportPath(layoutSource, "PanelContext") &&
    !hasImportPath(layoutSource, "WorkspaceContext") &&
    !hasImportPath(layoutSource, "SessionContext") &&
    !/\buseActivePanel\s*[<(]/.test(layoutSource) &&
    !/\busePanelResize\s*[<(]/.test(layoutSource) &&
    !/\busePanelState\s*[<(]/.test(layoutSource) &&
    !/\buseWorkspaceMode\s*[<(]/.test(layoutSource),
  "layout/ forbids context/hook symbols"
);

assertCase(
  "ux218.layout.forbidden.imports",
  !hasImportPath(layoutSource, "PanelState") &&
    !hasImportPath(layoutSource, "/PanelProvider") &&
    !hasImportPath(layoutSource, "panels/state") &&
    !hasImportPath(layoutSource, "persistence") &&
    !hasImportPath(layoutSource, "/resize") &&
    !hasImportPath(layoutSource, "/focus") &&
    !hasImportPath(layoutSource, "/modes") &&
    !hasImportPath(layoutSource, "session") &&
    !hasImportPath(layoutSource, "Docking") &&
    !/\bPanelState\b/.test(layoutSource),
  "layout/ forbids Session/Persistence/PanelState/resize/focus/modes/docking"
);

assertCase(
  "ux218.panelState.unchanged",
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
  "ux218.architecture.untouched",
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
  "ux218.doc.exists",
  existsSync(docPath) &&
    /UX-2\.18/.test(doc) &&
    /PanelLayout/.test(doc) &&
    /Canonical Region Order|canonical region order/i.test(doc) &&
    /LAYOUT_TOKENS|LayoutTokens/.test(doc) &&
    /No variants|no variants/i.test(doc),
  "docs/UX-2.18-semantic-layout.md present with contracts"
);

assertCase(
  "ux218.roadmap.status",
  /UX-2\.18/.test(roadmap) &&
    /Semantic Layout/.test(roadmap) &&
    /Toolbar & Action/.test(roadmap) &&
    /UX-2\.19/.test(roadmap) &&
    /UX-2\.20/.test(roadmap) &&
    /UX-2\.21/.test(roadmap) &&
    (/COMPLETE \(awaiting/.test(roadmap) ||
      /UX-2\.18\s*=\s*COMPLETE/.test(roadmap)),
  "roadmap marks UX-2.18 semantic layout; 2.19–2.21 resequence"
);

assertCase(
  "ux218.package.script",
  /"validate:ux-2\.18"\s*:/.test(pkg),
  "validate:ux-2.18 in package.json"
);

/* -------------------------------------------------------------------------- */
/* H. Delegates — UX-2.17 + tsc + eslint                                      */
/* -------------------------------------------------------------------------- */

if (process.env.UX_SKIP_DELEGATES !== "1") {
  const ux217 = spawnSync("npx", ["tsx", "scripts/validate-ux-2.17.ts"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
    env: { ...process.env, UX_SKIP_DELEGATES: "1" },
  });
  assertCase(
    "ux218.delegate.ux-2.17",
    ux217.status === 0,
    ux217.status === 0
      ? "PASS (leaf)"
      : `${ux217.stdout ?? ""}\n${ux217.stderr ?? ""}`.trim().slice(-1200)
  );

  const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
  });
  assertCase(
    "ux218.typescript",
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
      "src/components/workspace/panels/WorkspaceBodyLayout.tsx",
      "src/components/workspace/panels/content/ExplorerContent.tsx",
      "src/components/workspace/panels/content/InspectorContent.tsx",
      "src/components/workspace/panels/content/ConsoleContent.tsx",
      "scripts/validate-ux-2.18.ts",
    ],
    {
      cwd: repoRoot,
      encoding: "utf8",
      shell: true,
    }
  );
  assertCase(
    "ux218.eslint",
    eslint.status === 0,
    eslint.status === 0
      ? "PASS"
      : `${eslint.stdout ?? ""}\n${eslint.stderr ?? ""}`.trim().slice(-1200)
  );
} else {
  assertCase(
    "ux218.delegate.skipped",
    true,
    "UX_SKIP_DELEGATES=1 — leaf suite skipped"
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "ux-2.18-semantic-layout",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — ux-2.18-semantic-layout"
    : `\nFAIL — ux-2.18-semantic-layout (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
