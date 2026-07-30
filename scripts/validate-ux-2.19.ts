/**
 * UX-2.19 — Toolbar & Action Foundation gate.
 * Presentational only; actions/semantics/layout/surfaces frozen downward.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const workspaceDir = join(repoRoot, "src/components/workspace");
const toolbarDir = join(workspaceDir, "toolbar");
const actionsDir = join(workspaceDir, "actions");
const panelsDir = join(workspaceDir, "panels");
const contentDir = join(panelsDir, "content");
const stateDir = join(panelsDir, "state");
const packagePath = join(repoRoot, "package.json");
const docPath = join(repoRoot, "docs/UX-2.19-toolbar-actions.md");
const roadmapPath = join(repoRoot, "docs/UX-2.0-roadmap.md");
const ux218bDocPath = join(repoRoot, "docs/UX-2.18b-panel-semantics.md");

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

const toolbarSource = collectTsSources(toolbarDir).join("\n");
const toolbarBarrel = read(join(toolbarDir, "index.ts"));
const tokensSource = read(join(toolbarDir, "ACTION_TOKENS.ts"));
const buttonSource = read(join(toolbarDir, "ActionButton.tsx"));
const groupSource = read(join(toolbarDir, "ActionGroup.tsx"));
const panelToolbarSource = read(join(toolbarDir, "PanelToolbar.tsx"));
const spacerSource = read(join(toolbarDir, "ToolbarSpacer.tsx"));
const iconSlotSource = read(join(toolbarDir, "IconSlot.tsx"));
const bodyLayoutSource = read(join(panelsDir, "WorkspaceBodyLayout.tsx"));
const explorerSource = read(join(contentDir, "ExplorerContent.tsx"));
const inspectorSource = read(join(contentDir, "InspectorContent.tsx"));
const consoleSource = read(join(contentDir, "ConsoleContent.tsx"));
const leftPanelSource = read(join(panelsDir, "LeftPanel.tsx"));
const rightPanelSource = read(join(panelsDir, "RightPanel.tsx"));
const bottomPanelSource = read(join(panelsDir, "BottomPanel.tsx"));
const workspaceBarrel = read(join(workspaceDir, "index.ts"));
const actionsBarrel = read(join(actionsDir, "index.ts"));
const contextActionSource = read(join(actionsDir, "ContextAction.tsx"));
const contextActionsSource = read(join(actionsDir, "ContextActions.tsx"));
const panelStateSource = read(join(stateDir, "PanelState.ts"));
const pkg = read(packagePath);
const doc = read(docPath);
const roadmap = read(roadmapPath);
const ux218bDoc = read(ux218bDocPath);

/* -------------------------------------------------------------------------- */
/* A. toolbar/ structure + barrel                                             */
/* -------------------------------------------------------------------------- */

const toolbarFiles = [
  "ACTION_TOKENS.ts",
  "ActionButton.tsx",
  "ActionGroup.tsx",
  "PanelToolbar.tsx",
  "ToolbarSpacer.tsx",
  "IconSlot.tsx",
  "index.ts",
];
for (const f of toolbarFiles) {
  assertCase(
    `ux219.toolbar.file.${f}`,
    existsSync(join(toolbarDir, f)),
    `workspace/toolbar/${f} present`
  );
}

assertCase(
  "ux219.toolbar.barrel",
  /ACTION_TOKENS/.test(toolbarBarrel) &&
    /ActionButton/.test(toolbarBarrel) &&
    /ActionGroup/.test(toolbarBarrel) &&
    /PanelToolbar/.test(toolbarBarrel) &&
    /ToolbarSpacer/.test(toolbarBarrel) &&
    /IconSlot/.test(toolbarBarrel),
  "toolbar barrel exports public API only"
);

assertCase(
  "ux219.toolbar.noPublicBarrel",
  !/from\s+["']\.\/toolbar/.test(workspaceBarrel) &&
    !/ActionButton/.test(workspaceBarrel) &&
    !/ACTION_TOKENS/.test(workspaceBarrel) &&
    !/PanelToolbar/.test(workspaceBarrel),
  "workspace/index.ts does not export toolbar/"
);

/* -------------------------------------------------------------------------- */
/* B. ACTION_TOKENS compose-only SSOT                                         */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux219.tokens.keys",
  /height:/.test(tokensSource) &&
    /gap:/.test(tokensSource) &&
    /iconSize:/.test(tokensSource) &&
    /padding:/.test(tokensSource) &&
    /radius:/.test(tokensSource) &&
    /hoverOpacity:/.test(tokensSource) &&
    /disabledOpacity:/.test(tokensSource) &&
    /button:/.test(tokensSource) &&
    /group:/.test(tokensSource) &&
    /toolbar:/.test(tokensSource) &&
    /spacer:/.test(tokensSource) &&
    /iconSlot:/.test(tokensSource) &&
    /appearances:/.test(tokensSource),
  "ACTION_TOKENS has required keys"
);

assertCase(
  "ux219.tokens.composeOnlyDoc",
  /compose-only|compose only|únicamente compone|aliases existing/i.test(
    tokensSource + "\n" + doc
  ) &&
    !/export\s+const\s+SURFACE_TOKENS/.test(tokensSource) &&
    !/export\s+const\s+LAYOUT_TOKENS/.test(tokensSource) &&
    !/export\s+const\s+SEMANTIC_TOKENS/.test(tokensSource),
  "ACTION_TOKENS is compose-only; does not redefine SURFACE/LAYOUT/SEMANTIC"
);

assertCase(
  "ux219.tokens.noDownwardImport",
  !hasImportPath(tokensSource, "SurfaceTokens") &&
    !hasImportPath(tokensSource, "LayoutTokens") &&
    !hasImportPath(tokensSource, "SEMANTIC_TOKENS") &&
    !hasImportPath(tokensSource, "surfaces") &&
    !hasImportPath(tokensSource, "layout") &&
    !hasImportPath(tokensSource, "semantics") &&
    !/import\s+.*SURFACE_TOKENS/.test(tokensSource) &&
    !/import\s+.*LAYOUT_TOKENS/.test(tokensSource) &&
    !/import\s+.*SEMANTIC_TOKENS/.test(tokensSource),
  "ACTION_TOKENS does not import SURFACE/LAYOUT/SEMANTIC token objects"
);

const componentSources = [
  ["ActionButton", buttonSource],
  ["ActionGroup", groupSource],
  ["PanelToolbar", panelToolbarSource],
  ["ToolbarSpacer", spacerSource],
  ["IconSlot", iconSlotSource],
] as const;

for (const [name, source] of componentSources) {
  assertCase(
    `ux219.${name}.usesActionTokens`,
    /ACTION_TOKENS\./.test(source),
    `${name} reads ACTION_TOKENS`
  );
  assertCase(
    `ux219.${name}.noAdHocSpacing`,
    !hasAdHocSpacingLiteral(source),
    `${name} has no local spacing class literals`
  );
}

/* -------------------------------------------------------------------------- */
/* C. API freeze                                                              */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux219.ActionButton.apiFreeze",
  /icon\?:/.test(buttonSource) &&
    /children\?:/.test(buttonSource) &&
    /appearance\?:/.test(buttonSource) &&
    /"default"/.test(buttonSource) &&
    /"muted"/.test(buttonSource) &&
    /"active"/.test(buttonSource) &&
    /"disabled"/.test(buttonSource) &&
    !/\blabel\s*[?:]/.test(buttonSource) &&
    !/\bonClick\s*[?:]/.test(buttonSource) &&
    !/\btitle\s*[?:]/.test(buttonSource) &&
    /<span\b/.test(buttonSource) &&
    !/<button\b/.test(buttonSource),
  "ActionButton API frozen to icon/children/appearance; span only"
);

assertCase(
  "ux219.ActionGroup.apiFreeze",
  /children\?:/.test(groupSource) &&
    !/\bonClick\s*[?:]/.test(groupSource) &&
    !/\borientation\s*[?:]/.test(groupSource),
  "ActionGroup API frozen to children only"
);

assertCase(
  "ux219.PanelToolbar.apiFreeze",
  /children\?:/.test(panelToolbarSource) &&
    !/\btitle\s*[?:]/.test(panelToolbarSource) &&
    !/\bleading\s*[?:]/.test(panelToolbarSource) &&
    !/\bhints\s*[?:]/.test(panelToolbarSource) &&
    !/\bstatus\s*[?:]/.test(panelToolbarSource) &&
    !/\bonClick\s*[?:]/.test(panelToolbarSource),
  "PanelToolbar API frozen to children only"
);

assertCase(
  "ux219.ToolbarSpacer.apiFreeze",
  /export\s+function\s+ToolbarSpacer\s*\(\s*\)/.test(spacerSource) &&
    !/ToolbarSpacerProps/.test(spacerSource),
  "ToolbarSpacer has no props"
);

assertCase(
  "ux219.IconSlot.apiFreeze",
  /children\?:/.test(iconSlotSource) &&
    !/\bsize\s*[?:]/.test(iconSlotSource) &&
    !/\btone\s*[?:]/.test(iconSlotSource) &&
    !/\bonClick\s*[?:]/.test(iconSlotSource),
  "IconSlot API frozen to children only"
);

assertCase(
  "ux219.doc.apiFreeze",
  /API frozen after UX-2\.19/i.test(doc) &&
    /explicit API review/i.test(doc),
  "docs declare Action*/PanelToolbar API freeze"
);

/* -------------------------------------------------------------------------- */
/* D. Zero hooks + zero use client + no onClick + isolation                   */
/* -------------------------------------------------------------------------- */

for (const [name, source] of componentSources) {
  assertCase(
    `ux219.${name}.noHooks`,
    !hasHookCall(source),
    `${name} has zero hooks`
  );
  assertCase(
    `ux219.${name}.noOnClick`,
    !/\bonClick\b/.test(source),
    `${name} has no onClick`
  );
}

assertCase(
  "ux219.toolbar.noUseClient",
  !/"use client"/.test(toolbarSource) &&
    !/'use client'/.test(toolbarSource),
  'workspace/toolbar/ has zero "use client"'
);

assertCase(
  "ux219.toolbar.noDownwardDeps",
  !hasImportPath(toolbarSource, "/actions") &&
    !hasImportPath(toolbarSource, "workspace/actions") &&
    !hasImportPath(toolbarSource, "/layout") &&
    !hasImportPath(toolbarSource, "workspace/layout") &&
    !hasImportPath(toolbarSource, "/surfaces") &&
    !hasImportPath(toolbarSource, "workspace/surfaces") &&
    !hasImportPath(toolbarSource, "/composition") &&
    !hasImportPath(toolbarSource, "workspace/composition") &&
    !hasImportPath(toolbarSource, "/disclosure") &&
    !hasImportPath(toolbarSource, "workspace/disclosure") &&
    !hasImportPath(toolbarSource, "/semantics") &&
    !hasImportPath(toolbarSource, "workspace/semantics") &&
    !hasImportPath(toolbarSource, "ContextAction") &&
    !hasImportPath(toolbarSource, "HintGroup") &&
    !hasImportPath(toolbarSource, "StatusChip"),
  "toolbar/ does not import actions/layout/surfaces/composition/disclosure/semantics"
);

assertCase(
  "ux219.toolbar.forbidden.imports",
  !hasImportPath(toolbarSource, "PanelState") &&
    !hasImportPath(toolbarSource, "/PanelProvider") &&
    !hasImportPath(toolbarSource, "panels/state") &&
    !hasImportPath(toolbarSource, "persistence") &&
    !hasImportPath(toolbarSource, "/resize") &&
    !hasImportPath(toolbarSource, "/focus") &&
    !hasImportPath(toolbarSource, "/modes") &&
    !hasImportPath(toolbarSource, "session") &&
    !/\busePanelState\b/.test(toolbarSource) &&
    !/\buseActivePanel\b/.test(toolbarSource),
  "toolbar/ forbids Session/Persistence/PanelState/resize/focus/modes"
);

assertCase(
  "ux219.PanelToolbar.agnostic",
  !/HintGroup/.test(panelToolbarSource) &&
    !/StatusChip/.test(panelToolbarSource) &&
    !/ContextAction/.test(panelToolbarSource),
  "PanelToolbar source does not reference HintGroup/StatusChip/ContextAction"
);

/* -------------------------------------------------------------------------- */
/* E. Wiring                                                                  */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux219.wire.explorer",
  hasJsxComponent(explorerSource, "SemanticHeader") &&
    hasJsxComponent(explorerSource, "PanelToolbar") &&
    hasJsxComponent(explorerSource, "ActionGroup") &&
    /trailing=\{/.test(explorerSource) &&
    /title=["']Project["']/.test(explorerSource),
  "Explorer: SemanticHeader.trailing → PanelToolbar > ActionGroup"
);

assertCase(
  "ux219.wire.inspector",
  hasJsxComponent(inspectorSource, "SemanticHeader") &&
    hasJsxComponent(inspectorSource, "PanelToolbar") &&
    hasJsxComponent(inspectorSource, "ActionGroup") &&
    /trailing=\{/.test(inspectorSource),
  "Inspector: SemanticHeader.trailing → PanelToolbar > ActionGroup"
);

assertCase(
  "ux219.wire.console",
  hasJsxComponent(consoleSource, "SemanticHeader") &&
    hasJsxComponent(consoleSource, "PanelToolbar") &&
    hasJsxComponent(consoleSource, "ActionGroup") &&
    /trailing=\{/.test(consoleSource),
  "Console: SemanticHeader.trailing → PanelToolbar > ActionGroup"
);

assertCase(
  "ux219.wire.canvas",
  hasJsxComponent(bodyLayoutSource, "SemanticHeader") &&
    hasJsxComponent(bodyLayoutSource, "PanelToolbar") &&
    hasJsxComponent(bodyLayoutSource, "ActionGroup") &&
    hasJsxComponent(bodyLayoutSource, "ToolbarSpacer") &&
    hasJsxComponent(bodyLayoutSource, "PanelToolbarRegion") &&
    hasJsxComponent(bodyLayoutSource, "HintGroup") &&
    hasJsxComponent(bodyLayoutSource, "StatusChip") &&
    (() => {
      const toolbarRegionIdx = bodyLayoutSource.indexOf("<PanelToolbarRegion");
      const hintIdx = bodyLayoutSource.indexOf("<HintGroup");
      const spacerIdx = bodyLayoutSource.indexOf("<ToolbarSpacer");
      const chipIdx = bodyLayoutSource.indexOf("<StatusChip");
      return (
        toolbarRegionIdx >= 0 &&
        hintIdx > toolbarRegionIdx &&
        spacerIdx > hintIdx &&
        chipIdx > spacerIdx
      );
    })(),
  "Canvas: PanelToolbarRegion wraps HintGroup + ToolbarSpacer + StatusChip"
);

assertCase(
  "ux219.wire.chrome.untouched",
  /ContextActions/.test(leftPanelSource) &&
    /ContextActions/.test(rightPanelSource) &&
    !/from\s+["'][^"']*toolbar[^"']*["']/.test(leftPanelSource) &&
    !/from\s+["'][^"']*toolbar[^"']*["']/.test(rightPanelSource) &&
    !/from\s+["'][^"']*toolbar[^"']*["']/.test(bottomPanelSource) &&
    !/PanelToolbar/.test(leftPanelSource) &&
    !/PanelToolbar/.test(rightPanelSource) &&
    !/PanelToolbar/.test(bottomPanelSource),
  "Left/Right/Bottom panels do not import toolbar/; ContextActions remain"
);

/* -------------------------------------------------------------------------- */
/* F. actions/ package untouched                                              */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux219.actions.untouched",
  /export\s+\{ ContextAction \}/.test(actionsBarrel) &&
    /export\s+\{ ContextActions \}/.test(actionsBarrel) &&
    /onClick\?:/.test(contextActionSource) &&
    /actions:\s*ContextActionItem\[\]/.test(contextActionsSource) &&
    !/ActionButton/.test(actionsBarrel) &&
    !/ACTION_TOKENS/.test(actionsBarrel) &&
    !/PanelToolbar/.test(actionsBarrel),
  "workspace/actions/ ContextAction(s) API and barrel unchanged"
);

assertCase(
  "ux219.panelState.unchanged",
  /export\s+interface\s+PanelState\s*\{/.test(panelStateSource) &&
    /leftCollapsed:\s*boolean/.test(panelStateSource),
  "PanelState shape unchanged"
);

/* -------------------------------------------------------------------------- */
/* G. Docs + package                                                          */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux219.doc.exists",
  existsSync(docPath) &&
    /UX-2\.19/.test(doc) &&
    /ACTION_TOKENS/.test(doc) &&
    /ActionButton/.test(doc) &&
    /PanelToolbar/.test(doc) &&
    /compose-only|únicamente compone/i.test(doc) &&
    /API frozen after UX-2\.19/i.test(doc),
  "docs/UX-2.19-toolbar-actions.md present with contracts"
);

assertCase(
  "ux219.ux218b.next",
  /Next:\s*UX-2\.19/i.test(ux218bDoc) || /→ UX-2\.19/.test(ux218bDoc),
  "UX-2.18b NEXT points to UX-2.19"
);

assertCase(
  "ux219.roadmap.status",
  /UX-2\.19/.test(roadmap) &&
    /Toolbar & Action/.test(roadmap) &&
    /UX-2\.20/.test(roadmap) &&
    /UX-2\.21/.test(roadmap) &&
    (/UX-2\.19\s*=\s*COMPLETE/.test(roadmap) ||
      /UX-2\.19 = COMPLETE/.test(roadmap)),
  "roadmap marks UX-2.19 COMPLETE; 2.20–2.21 IDs unchanged"
);

assertCase(
  "ux219.package.script",
  /"validate:ux-2\.19"\s*:/.test(pkg),
  "validate:ux-2.19 in package.json"
);

/* -------------------------------------------------------------------------- */
/* H. Delegates — UX-2.18b + tsc + eslint                                     */
/* -------------------------------------------------------------------------- */

if (process.env.UX_SKIP_DELEGATES !== "1") {
  const ux218b = spawnSync("npx", ["tsx", "scripts/validate-ux-2.18b.ts"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
    env: { ...process.env, UX_SKIP_DELEGATES: "1" },
  });
  assertCase(
    "ux219.delegate.ux-2.18b",
    ux218b.status === 0,
    ux218b.status === 0
      ? "PASS (leaf)"
      : `${ux218b.stdout ?? ""}\n${ux218b.stderr ?? ""}`.trim().slice(-1200)
  );

  const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
  });
  assertCase(
    "ux219.typescript",
    tsc.status === 0,
    tsc.status === 0
      ? "PASS"
      : `${tsc.stdout ?? ""}\n${tsc.stderr ?? ""}`.trim().slice(-1200)
  );

  const eslint = spawnSync(
    "npx",
    [
      "eslint",
      "src/components/workspace/toolbar",
      "src/components/workspace/panels/WorkspaceBodyLayout.tsx",
      "src/components/workspace/panels/content/ExplorerContent.tsx",
      "src/components/workspace/panels/content/InspectorContent.tsx",
      "src/components/workspace/panels/content/ConsoleContent.tsx",
      "scripts/validate-ux-2.19.ts",
    ],
    {
      cwd: repoRoot,
      encoding: "utf8",
      shell: true,
    }
  );
  assertCase(
    "ux219.eslint",
    eslint.status === 0,
    eslint.status === 0
      ? "PASS"
      : `${eslint.stdout ?? ""}\n${eslint.stderr ?? ""}`.trim().slice(-1200)
  );
} else {
  assertCase(
    "ux219.delegate.skipped",
    true,
    "UX_SKIP_DELEGATES=1 — leaf suite skipped"
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "ux-2.19-toolbar-actions",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — ux-2.19-toolbar-actions"
    : `\nFAIL — ux-2.19-toolbar-actions (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
