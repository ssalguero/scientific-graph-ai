/**
 * UX-2.17 — Workspace Composition Foundation gate.
 * Presentational only; PanelState / persistence / resize / focus / modes frozen.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const workspaceDir = join(repoRoot, "src/components/workspace");
const compositionDir = join(workspaceDir, "composition");
const surfacesDir = join(workspaceDir, "surfaces");
const panelsDir = join(workspaceDir, "panels");
const contentDir = join(panelsDir, "content");
const stateDir = join(panelsDir, "state");
const persistenceDir = join(panelsDir, "persistence");
const resizeDir = join(panelsDir, "resize");
const focusDir = join(workspaceDir, "focus");
const modesDir = join(workspaceDir, "modes");
const packagePath = join(repoRoot, "package.json");
const docPath = join(repoRoot, "docs/UX-2.17-workspace-composition.md");
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
  /["'`][^"'`]*\b(gap|mb|mt|space-y)-\S+/.test(source);

const compositionSource = collectTsSources(compositionDir).join("\n");
const compositionBarrel = read(join(compositionDir, "index.ts"));
const tokensSource = read(join(surfacesDir, "SurfaceTokens.ts"));
const sectionSource = read(join(compositionDir, "WorkspaceSection.tsx"));
const stackSource = read(join(compositionDir, "WorkspaceStack.tsx"));
const groupSource = read(join(compositionDir, "WorkspaceGroup.tsx"));
const dividerSource = read(join(compositionDir, "WorkspaceDivider.tsx"));
const spacerSource = read(join(compositionDir, "WorkspaceSpacer.tsx"));
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
/* A. composition/ structure + barrel                                         */
/* -------------------------------------------------------------------------- */

const compositionFiles = [
  "WorkspaceSection.tsx",
  "WorkspaceStack.tsx",
  "WorkspaceGroup.tsx",
  "WorkspaceDivider.tsx",
  "WorkspaceSpacer.tsx",
  "index.ts",
];
for (const f of compositionFiles) {
  assertCase(
    `ux217.composition.file.${f}`,
    existsSync(join(compositionDir, f)),
    `workspace/composition/${f} present`
  );
}

assertCase(
  "ux217.composition.barrel",
  /WorkspaceSection/.test(compositionBarrel) &&
    /WorkspaceStack/.test(compositionBarrel) &&
    /WorkspaceGroup/.test(compositionBarrel) &&
    /WorkspaceDivider/.test(compositionBarrel) &&
    /WorkspaceSpacer/.test(compositionBarrel),
  "composition barrel exports public API only"
);

assertCase(
  "ux217.workspace.barrel.noComposition",
  !/WorkspaceSection/.test(workspaceBarrel) &&
    !/WorkspaceStack/.test(workspaceBarrel) &&
    !/from\s+["']\.\/composition/.test(workspaceBarrel),
  "public workspace barrel does not export composition/"
);

/* -------------------------------------------------------------------------- */
/* B. SURFACE_TOKENS composition keys                                         */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux217.tokens.compositionKeys",
  /workspaceGap\s*:/.test(tokensSource) &&
    /sectionGap\s*:/.test(tokensSource) &&
    /groupGap\s*:/.test(tokensSource) &&
    /dividerColor\s*:/.test(tokensSource) &&
    /dividerMuted\s*:/.test(tokensSource) &&
    /dividerInset\s*:/.test(tokensSource) &&
    /sectionPadding\s*:/.test(tokensSource) &&
    /spacer\s*:/.test(tokensSource),
  "SURFACE_TOKENS exports composition density keys"
);

/* -------------------------------------------------------------------------- */
/* C. Primitive contracts                                                     */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux217.stack.defaults",
  /spacing\s*=\s*["']md["']/.test(stackSource) &&
    /direction\s*=\s*["']vertical["']/.test(stackSource),
  "WorkspaceStack defaults: spacing=md, direction=vertical"
);

assertCase(
  "ux217.stack.workspaceGap",
  /SURFACE_TOKENS\.workspaceGap/.test(stackSource),
  "WorkspaceStack uses SURFACE_TOKENS.workspaceGap"
);

assertCase(
  "ux217.stack.noLocalMaps",
  !/const\s+\w*[Ss]pacing\w*\s*[:=]\s*\{/.test(stackSource) &&
    !/spacingClasses/.test(stackSource) &&
    !/const\s+\w*[Dd]irection\w*\s*[:=]\s*\{/.test(stackSource),
  "WorkspaceStack has no local spacing/direction maps"
);

assertCase(
  "ux217.section.noDefaultFlex",
  !/\bflex\b/.test(sectionSource) ||
    (!/flex-col/.test(sectionSource) &&
      !/flex-row/.test(sectionSource) &&
      !/"flex"/.test(sectionSource) &&
      !/'flex'/.test(sectionSource)),
  "WorkspaceSection does not introduce flex by default"
);

assertCase(
  "ux217.group.groupGap",
  /SURFACE_TOKENS\.groupGap/.test(groupSource),
  "WorkspaceGroup uses SURFACE_TOKENS.groupGap"
);

assertCase(
  "ux217.divider.tokensOnly",
  /SURFACE_TOKENS\.dividerColor/.test(dividerSource) &&
    /SURFACE_TOKENS\.dividerInset/.test(dividerSource) &&
    /SURFACE_TOKENS\.dividerMuted/.test(dividerSource) &&
    !/<hr\b/.test(dividerSource) &&
    /<div\b[^>]*aria-hidden/.test(dividerSource),
  "WorkspaceDivider uses dividerColor/Inset/Muted; decorative div only"
);

assertCase(
  "ux217.divider.noInlineOpacityGray",
  !/opacity-\d+/.test(dividerSource) &&
    !/border-gray-/.test(dividerSource) &&
    !/style=\{/.test(dividerSource),
  "WorkspaceDivider has no inline opacity / border-gray / style logic"
);

assertCase(
  "ux217.spacer.frozenScale",
  /"none"\s*\|\s*"sm"\s*\|\s*"md"/.test(spacerSource) &&
    !/"lg"/.test(spacerSource) &&
    !/"xl"/.test(spacerSource) &&
    /SURFACE_TOKENS\.spacer/.test(spacerSource),
  "WorkspaceSpacer scale frozen to none|sm|md via tokens"
);

/* -------------------------------------------------------------------------- */
/* D. Zero hooks + zero use client                                            */
/* -------------------------------------------------------------------------- */

const hookTargets = [
  ["WorkspaceSection", sectionSource],
  ["WorkspaceStack", stackSource],
  ["WorkspaceGroup", groupSource],
  ["WorkspaceDivider", dividerSource],
  ["WorkspaceSpacer", spacerSource],
] as const;

for (const [name, source] of hookTargets) {
  assertCase(
    `ux217.${name}.noHooks`,
    !hasHookCall(source),
    `${name} has zero hooks`
  );
}

assertCase(
  "ux217.composition.noUseClient",
  !/"use client"/.test(compositionSource) &&
    !/'use client'/.test(compositionSource),
  'workspace/composition/ has zero "use client"'
);

/* -------------------------------------------------------------------------- */
/* E. Wiring                                                                  */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux217.wire.explorer",
  hasJsxComponent(explorerSource, "PanelLayout") &&
    hasJsxComponent(explorerSource, "WorkspaceGroup") &&
    hasJsxComponent(explorerSource, "PanelSurface") &&
    hasJsxComponent(explorerSource, "DisclosureSection"),
  "Explorer: PanelLayout shell + WorkspaceGroup affinity"
);

assertCase(
  "ux217.wire.inspector",
  hasJsxComponent(inspectorSource, "PanelLayout") &&
    hasJsxComponent(inspectorSource, "WorkspaceGroup") &&
    hasJsxComponent(inspectorSource, "PanelDivider") &&
    hasJsxComponent(inspectorSource, "ContextDivider") &&
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
    })(),
  "Inspector: PanelLayout + Accent → PanelDivider → ContextDivider → Disclosure"
);

assertCase(
  "ux217.wire.console",
  hasJsxComponent(consoleSource, "PanelLayout") &&
    hasJsxComponent(consoleSource, "WorkspaceGroup") &&
    hasJsxComponent(consoleSource, "DisclosureSection"),
  "Console: PanelLayout + WorkspaceGroup around Output + Advanced"
);

assertCase(
  "ux217.wire.canvas",
  hasJsxComponent(bodyLayoutSource, "PanelLayout") &&
    hasJsxComponent(bodyLayoutSource, "PanelSurface") &&
    /data-workspace-canvas/.test(bodyLayoutSource) &&
    (() => {
      const canvasIdx = bodyLayoutSource.indexOf("data-workspace-canvas");
      const surfaceIdx = bodyLayoutSource.indexOf("<PanelSurface");
      const layoutIdx = bodyLayoutSource.indexOf("<PanelLayout");
      return (
        canvasIdx >= 0 && surfaceIdx > canvasIdx && layoutIdx > surfaceIdx
      );
    })(),
  "Canvas: PanelLayout inside PanelSurface; outer node untouched"
);

/* -------------------------------------------------------------------------- */
/* F. Extra checks 18–20                                                      */
/* -------------------------------------------------------------------------- */

const wiredSources = [
  ["explorer", explorerSource],
  ["inspector", inspectorSource],
  ["console", consoleSource],
  ["canvas", bodyLayoutSource],
] as const;

for (const [name, source] of wiredSources) {
  assertCase(
    `ux217.wire.${name}.noAdHocSpacing`,
    !hasAdHocSpacingLiteral(source),
    `${name}: no new gap-*/mb-*/mt-*/space-y-* class literals`
  );
}

assertCase(
  "ux217.check19.stackNoLocalMaps",
  /SURFACE_TOKENS\.workspaceGap/.test(stackSource) &&
    !/spacingClasses/.test(stackSource) &&
    !/const\s+\w*[Ss]pacing\w*\s*[:=]\s*\{/.test(stackSource),
  "check 19: WorkspaceStack no local spacing map"
);

assertCase(
  "ux217.check20.dividerExclusive",
  /SURFACE_TOKENS\.dividerColor/.test(dividerSource) &&
    /SURFACE_TOKENS\.dividerInset/.test(dividerSource) &&
    /SURFACE_TOKENS\.dividerMuted/.test(dividerSource) &&
    !/opacity-\d+/.test(dividerSource.replace(/SURFACE_TOKENS\.dividerMuted/g, "")) &&
    !/border-gray-/.test(dividerSource),
  "check 20: WorkspaceDivider exclusively uses dividerColor/Inset/Muted"
);

/* -------------------------------------------------------------------------- */
/* G. Isolation + architecture freeze                                         */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux217.composition.forbidden.symbols",
  !hasImportPath(compositionSource, "PanelContext") &&
    !hasImportPath(compositionSource, "WorkspaceContext") &&
    !hasImportPath(compositionSource, "SessionContext") &&
    !/\buseActivePanel\s*[<(]/.test(compositionSource) &&
    !/\busePanelResize\s*[<(]/.test(compositionSource) &&
    !/\busePanelState\s*[<(]/.test(compositionSource) &&
    !/\buseWorkspaceMode\s*[<(]/.test(compositionSource),
  "composition/ forbids context/hook symbols"
);

assertCase(
  "ux217.composition.forbidden.imports",
  !hasImportPath(compositionSource, "PanelState") &&
    !hasImportPath(compositionSource, "/PanelProvider") &&
    !hasImportPath(compositionSource, "panels/state") &&
    !hasImportPath(compositionSource, "persistence") &&
    !hasImportPath(compositionSource, "/resize") &&
    !hasImportPath(compositionSource, "/focus") &&
    !hasImportPath(compositionSource, "/modes") &&
    !hasImportPath(compositionSource, "session") &&
    !hasImportPath(compositionSource, "Docking") &&
    !/\bPanelState\b/.test(compositionSource),
  "composition/ forbids Session/Persistence/PanelState/resize/focus/modes/docking"
);

assertCase(
  "ux217.panelState.unchanged",
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
  "ux217.architecture.untouched",
  /export\s+function\s+PanelProvider/.test(panelProviderSource) &&
    /version:\s*1/.test(allPersistenceSources) &&
    /computeNextSize|ResizeSession/.test(allResizeSources) &&
    /PlanningMode|WorkspaceMode/.test(allModesSources) &&
    existsSync(join(focusDir, "ActivePanelProvider.tsx")),
  "Provider / persistence / resize / modes / focus still present"
);

/* -------------------------------------------------------------------------- */
/* H. Docs + package                                                          */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux217.doc.exists",
  existsSync(docPath) &&
    /UX-2\.17/.test(doc) &&
    /WorkspaceSection/.test(doc) &&
    /Composition hierarchy/.test(doc) &&
    /workspaceGap/.test(doc),
  "docs/UX-2.17-workspace-composition.md present"
);

assertCase(
  "ux217.roadmap.status",
  /UX-2\.17/.test(roadmap) &&
    /Workspace Composition Foundation/.test(roadmap) &&
    /Toolbar & Action Refinement/.test(roadmap) &&
    /UX-2\.18/.test(roadmap) &&
    /UX-2\.19/.test(roadmap) &&
    /UX-2\.20/.test(roadmap) &&
    (/COMPLETE \(awaiting/.test(roadmap) ||
      /UX-2\.17\s*=\s*COMPLETE/.test(roadmap)),
  "roadmap marks UX-2.17 composition; 2.18–2.20 resequence"
);

assertCase(
  "ux217.package.script",
  /"validate:ux-2\.17"\s*:/.test(pkg),
  "validate:ux-2.17 in package.json"
);

/* -------------------------------------------------------------------------- */
/* I. Delegates — UX-2.16 + tsc + eslint                                      */
/* -------------------------------------------------------------------------- */

if (process.env.UX_SKIP_DELEGATES !== "1") {
  const ux216 = spawnSync("npx", ["tsx", "scripts/validate-ux-2.16.ts"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
    env: { ...process.env, UX_SKIP_DELEGATES: "1" },
  });
  assertCase(
    "ux217.delegate.ux-2.16",
    ux216.status === 0,
    ux216.status === 0
      ? "PASS (leaf)"
      : `${ux216.stdout ?? ""}\n${ux216.stderr ?? ""}`.trim().slice(-1200)
  );

  const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
  });
  assertCase(
    "ux217.typescript",
    tsc.status === 0,
    tsc.status === 0
      ? "PASS"
      : `${tsc.stdout ?? ""}\n${tsc.stderr ?? ""}`.trim().slice(-1200)
  );

  const eslint = spawnSync(
    "npx",
    [
      "eslint",
      "src/components/workspace/composition",
      "src/components/workspace/surfaces/SurfaceTokens.ts",
      "src/components/workspace/panels/WorkspaceBodyLayout.tsx",
      "src/components/workspace/panels/content/ExplorerContent.tsx",
      "src/components/workspace/panels/content/InspectorContent.tsx",
      "src/components/workspace/panels/content/ConsoleContent.tsx",
      "scripts/validate-ux-2.17.ts",
    ],
    {
      cwd: repoRoot,
      encoding: "utf8",
      shell: true,
    }
  );
  assertCase(
    "ux217.eslint",
    eslint.status === 0,
    eslint.status === 0
      ? "PASS"
      : `${eslint.stdout ?? ""}\n${eslint.stderr ?? ""}`.trim().slice(-1200)
  );
} else {
  assertCase(
    "ux217.delegate.skipped",
    true,
    "UX_SKIP_DELEGATES=1 — leaf suite skipped"
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "ux-2.17-workspace-composition",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — ux-2.17-workspace-composition"
    : `\nFAIL — ux-2.17-workspace-composition (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
