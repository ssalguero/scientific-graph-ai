/**
 * UX-2.18b — Panel Semantics Foundation gate.
 * Presentational only; layout/surfaces/composition/disclosure frozen downward.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const workspaceDir = join(repoRoot, "src/components/workspace");
const semanticsDir = join(workspaceDir, "semantics");
const layoutDir = join(workspaceDir, "layout");
const panelsDir = join(workspaceDir, "panels");
const contentDir = join(panelsDir, "content");
const stateDir = join(panelsDir, "state");
const persistenceDir = join(panelsDir, "persistence");
const resizeDir = join(panelsDir, "resize");
const focusDir = join(workspaceDir, "focus");
const modesDir = join(workspaceDir, "modes");
const packagePath = join(repoRoot, "package.json");
const docPath = join(repoRoot, "docs/UX-2.18b-panel-semantics.md");
const roadmapPath = join(repoRoot, "docs/UX-2.0-roadmap.md");
const ux218DocPath = join(repoRoot, "docs/UX-2.18-semantic-layout.md");

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

const semanticsSource = collectTsSources(semanticsDir).join("\n");
const semanticsBarrel = read(join(semanticsDir, "index.ts"));
const tokensSource = read(join(semanticsDir, "SEMANTIC_TOKENS.ts"));
const headerSource = read(join(semanticsDir, "SemanticHeader.tsx"));
const statusSource = read(join(semanticsDir, "SemanticStatus.tsx"));
const sectionLabelSource = read(join(semanticsDir, "SemanticSectionLabel.tsx"));
const infoSource = read(join(semanticsDir, "SemanticInfoBlock.tsx"));
const footerSource = read(join(semanticsDir, "SemanticFooter.tsx"));
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
const layoutTokensSource = read(join(layoutDir, "LayoutTokens.ts"));
const pkg = read(packagePath);
const doc = read(docPath);
const roadmap = read(roadmapPath);
const ux218Doc = read(ux218DocPath);

/* -------------------------------------------------------------------------- */
/* A. semantics/ structure + barrel                                           */
/* -------------------------------------------------------------------------- */

const semanticsFiles = [
  "SEMANTIC_TOKENS.ts",
  "SemanticHeader.tsx",
  "SemanticStatus.tsx",
  "SemanticSectionLabel.tsx",
  "SemanticInfoBlock.tsx",
  "SemanticFooter.tsx",
  "index.ts",
];
for (const f of semanticsFiles) {
  assertCase(
    `ux218b.semantics.file.${f}`,
    existsSync(join(semanticsDir, f)),
    `workspace/semantics/${f} present`
  );
}

assertCase(
  "ux218b.semantics.barrel",
  /SEMANTIC_TOKENS/.test(semanticsBarrel) &&
    /SemanticHeader/.test(semanticsBarrel) &&
    /SemanticStatus/.test(semanticsBarrel) &&
    /SemanticSectionLabel/.test(semanticsBarrel) &&
    /SemanticInfoBlock/.test(semanticsBarrel) &&
    /SemanticFooter/.test(semanticsBarrel),
  "semantics barrel exports public API only"
);

assertCase(
  "ux218b.semantics.noPublicBarrel",
  !/from\s+["']\.\/semantics/.test(workspaceBarrel) &&
    !/SemanticHeader/.test(workspaceBarrel) &&
    !/SEMANTIC_TOKENS/.test(workspaceBarrel),
  "workspace/index.ts does not export semantics/"
);

assertCase(
  "ux218b.naming.noChromeCollision",
  !/export\s+function\s+PanelHeader\b/.test(semanticsSource) &&
    !/export\s+function\s+PanelStatus\b/.test(semanticsSource) &&
    !/export\s+\{\s*PanelHeader\b/.test(semanticsBarrel) &&
    !/export\s+\{\s*PanelStatus\b/.test(semanticsBarrel),
  "semantics/ never exports PanelHeader or PanelStatus"
);

/* -------------------------------------------------------------------------- */
/* B. SEMANTIC_TOKENS compose-only SSOT                                       */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux218b.tokens.keys",
  /HEADER_GAP/.test(tokensSource) &&
    /SECTION_GAP/.test(tokensSource) &&
    /STATUS_HEIGHT/.test(tokensSource) &&
    /INFO_PADDING/.test(tokensSource) &&
    /FOOTER_HEIGHT/.test(tokensSource) &&
    /LABEL_OPACITY/.test(tokensSource) &&
    /MUTED_TEXT/.test(tokensSource) &&
    /ICON_SIZE/.test(tokensSource) &&
    /headerRow/.test(tokensSource) &&
    /statusRow/.test(tokensSource) &&
    /label:/.test(tokensSource) &&
    /infoRoot/.test(tokensSource) &&
    /footerRoot/.test(tokensSource),
  "SEMANTIC_TOKENS has required keys"
);

assertCase(
  "ux218b.tokens.composeOnlyDoc",
  /compose-only|compose only|únicamente compone|aliases existing/i.test(
    tokensSource + "\n" + doc
  ) &&
    !/export\s+const\s+SURFACE_TOKENS/.test(tokensSource) &&
    !/export\s+const\s+LAYOUT_TOKENS/.test(tokensSource),
  "SEMANTIC_TOKENS is compose-only; does not redefine SURFACE/LAYOUT"
);

assertCase(
  "ux218b.tokens.noDownwardImport",
  !hasImportPath(tokensSource, "SurfaceTokens") &&
    !hasImportPath(tokensSource, "LayoutTokens") &&
    !hasImportPath(tokensSource, "surfaces") &&
    !hasImportPath(tokensSource, "layout") &&
    !/import\s+.*SURFACE_TOKENS/.test(tokensSource) &&
    !/import\s+.*LAYOUT_TOKENS/.test(tokensSource) &&
    !/from\s+["'][^"']*SurfaceTokens[^"']*["']/.test(tokensSource) &&
    !/from\s+["'][^"']*LayoutTokens[^"']*["']/.test(tokensSource),
  "SEMANTIC_TOKENS does not import SURFACE_TOKENS or LAYOUT_TOKENS"
);

const componentSources = [
  ["SemanticHeader", headerSource],
  ["SemanticStatus", statusSource],
  ["SemanticSectionLabel", sectionLabelSource],
  ["SemanticInfoBlock", infoSource],
  ["SemanticFooter", footerSource],
] as const;

for (const [name, source] of componentSources) {
  assertCase(
    `ux218b.${name}.usesSemanticTokens`,
    /SEMANTIC_TOKENS\./.test(source),
    `${name} reads SEMANTIC_TOKENS`
  );
  assertCase(
    `ux218b.${name}.noAdHocSpacing`,
    !hasAdHocSpacingLiteral(source),
    `${name} has no local spacing class literals`
  );
}

/* -------------------------------------------------------------------------- */
/* C. API freeze                                                              */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux218b.SemanticHeader.apiFreeze",
  /title\?:/.test(headerSource) &&
    /subtitle\?:/.test(headerSource) &&
    /leading\?:/.test(headerSource) &&
    /trailing\?:/.test(headerSource) &&
    !/\bvariant\s*[?:]/.test(headerSource) &&
    !/\bseverity\s*[?:]/.test(headerSource) &&
    !/\bstate\s*[?:]/.test(headerSource) &&
    !/\bbadge\s*[?:]/.test(headerSource) &&
    !/\bicon\s*[?:]/.test(headerSource) &&
    !/\bonClick\s*[?:]/.test(headerSource),
  "SemanticHeader API frozen to title/subtitle/leading/trailing"
);

for (const [name, source] of [
  ["SemanticStatus", statusSource],
  ["SemanticInfoBlock", infoSource],
  ["SemanticFooter", footerSource],
] as const) {
  assertCase(
    `ux218b.${name}.apiFreeze`,
    /children\?:/.test(source) &&
      !/\bvariant\s*[?:]/.test(source) &&
      !/\bseverity\s*[?:]/.test(source) &&
      !/\bstate\s*[?:]/.test(source) &&
      !/\bbadge\s*[?:]/.test(source) &&
      !/\bicon\s*[?:]/.test(source),
    `${name} API frozen to children only`
  );
}

assertCase(
  "ux218b.SemanticSectionLabel.apiFreeze",
  (/children\?:/.test(sectionLabelSource) ||
    /children:/.test(sectionLabelSource)) &&
    /label\?:/.test(sectionLabelSource) &&
    !/\bvariant\s*[?:]/.test(sectionLabelSource) &&
    !/\bseverity\s*[?:]/.test(sectionLabelSource) &&
    !/\bstate\s*[?:]/.test(sectionLabelSource),
  "SemanticSectionLabel API frozen to children/label"
);

assertCase(
  "ux218b.doc.apiFreeze",
  /API frozen after UX-2\.18b/i.test(doc) &&
    /explicit API review/i.test(doc),
  "docs declare Semantic* API freeze"
);

/* -------------------------------------------------------------------------- */
/* D. Zero hooks + zero use client + downward deps                            */
/* -------------------------------------------------------------------------- */

for (const [name, source] of componentSources) {
  assertCase(
    `ux218b.${name}.noHooks`,
    !hasHookCall(source),
    `${name} has zero hooks`
  );
}

assertCase(
  "ux218b.semantics.noUseClient",
  !/"use client"/.test(semanticsSource) &&
    !/'use client'/.test(semanticsSource),
  'workspace/semantics/ has zero "use client"'
);

assertCase(
  "ux218b.semantics.noDownwardDeps",
  !hasImportPath(semanticsSource, "/layout") &&
    !hasImportPath(semanticsSource, "workspace/layout") &&
    !hasImportPath(semanticsSource, "/surfaces") &&
    !hasImportPath(semanticsSource, "workspace/surfaces") &&
    !hasImportPath(semanticsSource, "/composition") &&
    !hasImportPath(semanticsSource, "workspace/composition") &&
    !hasImportPath(semanticsSource, "/disclosure") &&
    !hasImportPath(semanticsSource, "workspace/disclosure") &&
    !hasImportPath(semanticsSource, "SurfaceTokens") &&
    !hasImportPath(semanticsSource, "LayoutTokens") &&
    !hasImportPath(semanticsSource, "WorkspaceSection") &&
    !hasImportPath(semanticsSource, "DisclosureSection"),
  "semantics/ does not import layout/surfaces/composition/disclosure"
);

assertCase(
  "ux218b.semantics.forbidden.imports",
  !hasImportPath(semanticsSource, "PanelState") &&
    !hasImportPath(semanticsSource, "/PanelProvider") &&
    !hasImportPath(semanticsSource, "panels/state") &&
    !hasImportPath(semanticsSource, "persistence") &&
    !hasImportPath(semanticsSource, "/resize") &&
    !hasImportPath(semanticsSource, "/focus") &&
    !hasImportPath(semanticsSource, "/modes") &&
    !hasImportPath(semanticsSource, "session") &&
    !hasImportPath(semanticsSource, "Docking") &&
    !/\bPanelState\b/.test(semanticsSource) &&
    !/\busePanelState\b/.test(semanticsSource) &&
    !/\buseActivePanel\b/.test(semanticsSource),
  "semantics/ forbids Session/Persistence/PanelState/resize/focus/modes/docking"
);

/* -------------------------------------------------------------------------- */
/* E. Wiring                                                                  */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux218b.wire.explorer",
  hasJsxComponent(explorerSource, "SemanticHeader") &&
    hasJsxComponent(explorerSource, "SemanticStatus") &&
    hasJsxComponent(explorerSource, "SemanticSectionLabel") &&
    hasJsxComponent(explorerSource, "SemanticFooter") &&
    hasJsxComponent(explorerSource, "PanelHeaderRegion") &&
    hasJsxComponent(explorerSource, "PanelContentRegion") &&
    hasJsxComponent(explorerSource, "PanelFooterRegion") &&
    /title=["']Project["']/.test(explorerSource) &&
    (explorerSource.match(/<SemanticSectionLabel\b/g) ?? []).length >= 2,
  "Explorer: SemanticHeader(Project) + Status + SectionLabels + Footer"
);

assertCase(
  "ux218b.wire.inspector",
  hasJsxComponent(inspectorSource, "SemanticHeader") &&
    hasJsxComponent(inspectorSource, "SemanticStatus") &&
    hasJsxComponent(inspectorSource, "SemanticSectionLabel") &&
    hasJsxComponent(inspectorSource, "SemanticInfoBlock") &&
    hasJsxComponent(inspectorSource, "SemanticFooter") &&
    hasJsxComponent(inspectorSource, "PanelHeaderRegion") &&
    hasJsxComponent(inspectorSource, "PanelFooterRegion") &&
    (inspectorSource.match(/<SemanticSectionLabel\b/g) ?? []).length >= 2,
  "Inspector: Header/Status/SectionLabels/InfoBlock/Footer"
);

assertCase(
  "ux218b.wire.console",
  hasJsxComponent(consoleSource, "SemanticHeader") &&
    hasJsxComponent(consoleSource, "SemanticStatus") &&
    hasJsxComponent(consoleSource, "SemanticSectionLabel") &&
    hasJsxComponent(consoleSource, "SemanticFooter") &&
    hasJsxComponent(consoleSource, "PanelHeaderRegion") &&
    hasJsxComponent(consoleSource, "PanelFooterRegion") &&
    /Output/.test(consoleSource),
  "Console: Header/Status/SectionLabel(Output)/Footer"
);

assertCase(
  "ux218b.wire.canvas",
  hasJsxComponent(bodyLayoutSource, "SemanticHeader") &&
    hasJsxComponent(bodyLayoutSource, "SemanticFooter") &&
    hasJsxComponent(bodyLayoutSource, "PanelHeaderRegion") &&
    hasJsxComponent(bodyLayoutSource, "PanelFooterRegion") &&
    hasJsxComponent(bodyLayoutSource, "PanelToolbarRegion") &&
    hasJsxComponent(bodyLayoutSource, "PanelContentRegion") &&
    (() => {
      const headerIdx = bodyLayoutSource.indexOf("<PanelHeaderRegion");
      const toolbarIdx = bodyLayoutSource.indexOf("<PanelToolbarRegion");
      const contentIdx = bodyLayoutSource.indexOf("<PanelContentRegion");
      const footerIdx = bodyLayoutSource.indexOf("<PanelFooterRegion");
      return (
        headerIdx >= 0 &&
        toolbarIdx > headerIdx &&
        contentIdx > toolbarIdx &&
        footerIdx > contentIdx
      );
    })(),
  "Canvas: Header → Toolbar → Content → Footer with SemanticHeader/Footer"
);

assertCase(
  "ux218b.wire.explorer.noInventedStatus",
  /<SemanticStatus\s*\/>/.test(explorerSource) ||
    /<SemanticStatus>\s*<\/SemanticStatus>/.test(explorerSource),
  "Explorer SemanticStatus has no invented text children"
);

assertCase(
  "ux218b.wire.console.noReadyDuplicate",
  !/<SemanticStatus[^>]*>[\s\S]*Ready/.test(consoleSource),
  "Console does not duplicate Ready into SemanticStatus"
);

/* -------------------------------------------------------------------------- */
/* F. Prior layers frozen                                                     */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux218b.layout.stillPresent",
  /export\s+const\s+LAYOUT_TOKENS/.test(layoutTokensSource) &&
    existsSync(join(layoutDir, "PanelLayout.tsx")) &&
    existsSync(join(layoutDir, "PanelHeaderRegion.tsx")) &&
    existsSync(join(layoutDir, "PanelFooterRegion.tsx")),
  "layout package + LAYOUT_TOKENS still present"
);

assertCase(
  "ux218b.panelState.unchanged",
  /export\s+interface\s+PanelState\s*\{/.test(panelStateSource) &&
    /leftCollapsed:\s*boolean/.test(panelStateSource) &&
    /rightCollapsed:\s*boolean/.test(panelStateSource) &&
    /bottomCollapsed:\s*boolean/.test(panelStateSource),
  "PanelState shape unchanged"
);

assertCase(
  "ux218b.architecture.untouched",
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
  "ux218b.doc.exists",
  existsSync(docPath) &&
    /UX-2\.18b/.test(doc) &&
    /SEMANTIC_TOKENS/.test(doc) &&
    /SemanticHeader/.test(doc) &&
    /compose-only|únicamente compone/i.test(doc) &&
    /API frozen after UX-2\.18b/i.test(doc),
  "docs/UX-2.18b-panel-semantics.md present with contracts"
);

assertCase(
  "ux218b.ux218.next",
  /Next:\s*UX-2\.18b/i.test(ux218Doc) || /→ UX-2\.18b/.test(ux218Doc),
  "UX-2.18 NEXT points to UX-2.18b"
);

assertCase(
  "ux218b.roadmap.status",
  /UX-2\.18b/.test(roadmap) &&
    /Panel Semantics/.test(roadmap) &&
    /Toolbar & Action/.test(roadmap) &&
    /UX-2\.19/.test(roadmap) &&
    /UX-2\.20/.test(roadmap) &&
    /UX-2\.21/.test(roadmap) &&
    (/UX-2\.18b\s*=\s*COMPLETE/.test(roadmap) ||
      /UX-2\.18b = COMPLETE/.test(roadmap)),
  "roadmap marks UX-2.18b bridge; 2.19–2.21 IDs unchanged"
);

assertCase(
  "ux218b.package.script",
  /"validate:ux-2\.18b"\s*:/.test(pkg),
  "validate:ux-2.18b in package.json"
);

/* -------------------------------------------------------------------------- */
/* H. Delegates — UX-2.18 + tsc + eslint                                      */
/* -------------------------------------------------------------------------- */

if (process.env.UX_SKIP_DELEGATES !== "1") {
  const ux218 = spawnSync("npx", ["tsx", "scripts/validate-ux-2.18.ts"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
    env: { ...process.env, UX_SKIP_DELEGATES: "1" },
  });
  assertCase(
    "ux218b.delegate.ux-2.18",
    ux218.status === 0,
    ux218.status === 0
      ? "PASS (leaf)"
      : `${ux218.stdout ?? ""}\n${ux218.stderr ?? ""}`.trim().slice(-1200)
  );

  const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
  });
  assertCase(
    "ux218b.typescript",
    tsc.status === 0,
    tsc.status === 0
      ? "PASS"
      : `${tsc.stdout ?? ""}\n${tsc.stderr ?? ""}`.trim().slice(-1200)
  );

  const eslint = spawnSync(
    "npx",
    [
      "eslint",
      "src/components/workspace/semantics",
      "src/components/workspace/panels/WorkspaceBodyLayout.tsx",
      "src/components/workspace/panels/content/ExplorerContent.tsx",
      "src/components/workspace/panels/content/InspectorContent.tsx",
      "src/components/workspace/panels/content/ConsoleContent.tsx",
      "scripts/validate-ux-2.18b.ts",
    ],
    {
      cwd: repoRoot,
      encoding: "utf8",
      shell: true,
    }
  );
  assertCase(
    "ux218b.eslint",
    eslint.status === 0,
    eslint.status === 0
      ? "PASS"
      : `${eslint.stdout ?? ""}\n${eslint.stderr ?? ""}`.trim().slice(-1200)
  );
} else {
  assertCase(
    "ux218b.delegate.skipped",
    true,
    "UX_SKIP_DELEGATES=1 — leaf suite skipped"
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "ux-2.18b-panel-semantics",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — ux-2.18b-panel-semantics"
    : `\nFAIL — ux-2.18b-panel-semantics (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
