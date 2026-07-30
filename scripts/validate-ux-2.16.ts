/**
 * UX-2.16 — Panel Identity & Surface Foundation gate.
 * Presentational only; PanelState / persistence / resize / focus / modes frozen.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const workspaceDir = join(repoRoot, "src/components/workspace");
const surfacesDir = join(workspaceDir, "surfaces");
const panelsDir = join(workspaceDir, "panels");
const contentDir = join(panelsDir, "content");
const stateDir = join(panelsDir, "state");
const persistenceDir = join(panelsDir, "persistence");
const resizeDir = join(panelsDir, "resize");
const focusDir = join(workspaceDir, "focus");
const modesDir = join(workspaceDir, "modes");
const packagePath = join(repoRoot, "package.json");
const docPath = join(repoRoot, "docs/UX-2.16-panel-identity-surfaces.md");
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
  /\buseCallback\s*\(/.test(source) ||
  /\buseRef\s*\(/.test(source);

const surfacesSource = collectTsSources(surfacesDir).join("\n");
const surfacesBarrel = read(join(surfacesDir, "index.ts"));
const tokensSource = read(join(surfacesDir, "SurfaceTokens.ts"));
const surfaceSource = read(join(surfacesDir, "PanelSurface.tsx"));
const accentSource = read(join(surfacesDir, "PanelAccent.tsx"));
const dividerSource = read(join(surfacesDir, "PanelDivider.tsx"));
const iconSlotSource = read(join(surfacesDir, "PanelIconSlot.tsx"));
const metadataSource = read(join(surfacesDir, "PanelMetadata.tsx"));
const bodyLayoutSource = read(join(panelsDir, "WorkspaceBodyLayout.tsx"));
const explorerSource = read(join(contentDir, "ExplorerContent.tsx"));
const inspectorSource = read(join(contentDir, "InspectorContent.tsx"));
const consoleSource = read(join(contentDir, "ConsoleContent.tsx"));
const workspaceBarrel = read(join(workspaceDir, "index.ts"));
const panelStateSource = read(join(stateDir, "PanelState.ts"));
const panelProviderSource = read(join(stateDir, "PanelProvider.tsx"));
const headerSource = read(join(panelsDir, "PanelHeader.tsx"));
const panelSource = read(join(panelsDir, "Panel.tsx"));
const allPersistenceSources = collectTsSources(persistenceDir).join("\n");
const allResizeSources = collectTsSources(resizeDir).join("\n");
const allModesSources = collectTsSources(modesDir).join("\n");
const pkg = read(packagePath);
const doc = read(docPath);
const roadmap = read(roadmapPath);

/* -------------------------------------------------------------------------- */
/* A. surfaces/ structure + barrel                                            */
/* -------------------------------------------------------------------------- */

const surfacesFiles = [
  "SurfaceTokens.ts",
  "PanelSurface.tsx",
  "PanelAccent.tsx",
  "PanelDivider.tsx",
  "PanelIconSlot.tsx",
  "PanelMetadata.tsx",
  "index.ts",
];
for (const f of surfacesFiles) {
  assertCase(
    `ux216.surfaces.file.${f}`,
    existsSync(join(surfacesDir, f)),
    `workspace/surfaces/${f} present`
  );
}

assertCase(
  "ux216.surfaces.barrel",
  /SURFACE_TOKENS/.test(surfacesBarrel) &&
    /PanelSurface/.test(surfacesBarrel) &&
    /PanelAccent/.test(surfacesBarrel) &&
    /PanelDivider/.test(surfacesBarrel) &&
    /PanelIconSlot/.test(surfacesBarrel) &&
    /PanelMetadata/.test(surfacesBarrel),
  "surfaces barrel exports public API only"
);

assertCase(
  "ux216.workspace.barrel.noSurfaces",
  !/PanelSurface/.test(workspaceBarrel) &&
    !/SURFACE_TOKENS/.test(workspaceBarrel) &&
    !/from\s+["']\.\/surfaces/.test(workspaceBarrel),
  "public workspace barrel does not export surfaces/"
);

/* -------------------------------------------------------------------------- */
/* B. SurfaceTokens SSOT + frozen props                                       */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux216.tokens.ssot",
  /export\s+const\s+SURFACE_TOKENS\s*=/.test(tokensSource) &&
    /as\s+const/.test(tokensSource) &&
    /\bradius\s*:/.test(tokensSource) &&
    /\bpadding\s*:/.test(tokensSource) &&
    /\bgap\s*:/.test(tokensSource) &&
    /\bborder\s*:/.test(tokensSource) &&
    /\bvariant\s*:/.test(tokensSource) &&
    /\btone\s*:/.test(tokensSource) &&
    /\baccent\s*:/.test(tokensSource),
  "SURFACE_TOKENS exports full visual maps as const"
);

const primitivesImportTokens = [
  ["PanelSurface", surfaceSource],
  ["PanelAccent", accentSource],
  ["PanelDivider", dividerSource],
  ["PanelIconSlot", iconSlotSource],
  ["PanelMetadata", metadataSource],
] as const;

for (const [name, source] of primitivesImportTokens) {
  assertCase(
    `ux216.${name}.importsTokens`,
    /from\s+["']\.\/SurfaceTokens["']/.test(source) &&
      /SURFACE_TOKENS/.test(source),
    `${name} imports SURFACE_TOKENS`
  );
}

assertCase(
  "ux216.noLocalToneMaps",
  !/const\s+\w*[Tt]one\w*\s*[:=]\s*\{/.test(
    surfaceSource + accentSource + dividerSource + iconSlotSource + metadataSource
  ) &&
    !/const\s+\w*[Vv]ariant\w*\s*[:=]\s*\{/.test(
      surfaceSource +
        accentSource +
        dividerSource +
        iconSlotSource +
        metadataSource
    ),
  "primitives do not define local variant/tone maps"
);

assertCase(
  "ux216.panelSurface.props",
  /export\s+type\s+PanelSurfaceProps\s*=\s*\{[\s\S]*?\bchildren\s*:/.test(
    surfaceSource
  ) &&
    /variant\?/.test(surfaceSource) &&
    /padding\?/.test(surfaceSource) &&
    /elevated\?/.test(surfaceSource) &&
    /muted\?/.test(surfaceSource) &&
    !/export\s+type\s+PanelSurfaceProps\s*=\s*\{[^}]*\btone\s*[?:]/.test(
      surfaceSource
    ),
  "PanelSurface: children/variant?/padding?/elevated?/muted?; no tone"
);

assertCase(
  "ux216.panelAccent.props",
  /position\?/.test(accentSource) && /tone\?/.test(accentSource),
  "PanelAccent: position?/tone?"
);

assertCase(
  "ux216.panelDivider.divOnly",
  /<div\b[^>]*aria-hidden/.test(dividerSource) &&
    !/<hr\b/.test(dividerSource) &&
    /spacing\?/.test(dividerSource) &&
    /muted\?/.test(dividerSource),
  "PanelDivider: decorative div aria-hidden; never hr"
);

assertCase(
  "ux216.panelMetadata.childrenOnly",
  /export\s+type\s+PanelMetadataProps\s*=\s*\{[\s\S]*?\bchildren\s*:/.test(
    metadataSource
  ) &&
    !/variant\?/.test(metadataSource) &&
    !/tone\?/.test(metadataSource) &&
    !/size\?/.test(metadataSource),
  "PanelMetadata: children only"
);

assertCase(
  "ux216.panelIconSlot.reactNode",
  /icon\s*:\s*ReactNode/.test(iconSlotSource) &&
    !/iconName/.test(iconSlotSource),
  "PanelIconSlot: icon ReactNode; no iconName"
);

/* -------------------------------------------------------------------------- */
/* C. Zero hooks + zero use client                                            */
/* -------------------------------------------------------------------------- */

const hookTargets = [
  ["PanelSurface", surfaceSource],
  ["PanelAccent", accentSource],
  ["PanelDivider", dividerSource],
  ["PanelMetadata", metadataSource],
  ["PanelIconSlot", iconSlotSource],
] as const;

for (const [name, source] of hookTargets) {
  assertCase(
    `ux216.${name}.noHooks`,
    !hasHookCall(source),
    `${name} has zero hooks`
  );
}

assertCase(
  "ux216.surfaces.noUseClient",
  !/"use client"/.test(surfacesSource) && !/'use client'/.test(surfacesSource),
  'workspace/surfaces/ has zero "use client"'
);

/* -------------------------------------------------------------------------- */
/* D. Wiring                                                                  */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux216.wire.explorer",
  hasJsxComponent(explorerSource, "PanelSurface") &&
    hasJsxComponent(explorerSource, "PanelAccent") &&
    hasJsxComponent(explorerSource, "PanelIconSlot") &&
    hasJsxComponent(explorerSource, "PanelMetadata") &&
    hasJsxComponent(explorerSource, "DisclosureSection") &&
    hasJsxComponent(explorerSource, "ContextDivider"),
  "Explorer: Surface + Accent + Icon + Metadata + Disclosure stack"
);

assertCase(
  "ux216.wire.explorer.staticMetadata",
  /<PanelMetadata>\s*(Project|Workspace)\s*<\/PanelMetadata>/.test(
    explorerSource
  ) &&
    !/graph count|selection|series\.length/i.test(explorerSource),
  "Explorer metadata is static Project/Workspace"
);

assertCase(
  "ux216.wire.inspector",
  hasJsxComponent(inspectorSource, "PanelSurface") &&
    hasJsxComponent(inspectorSource, "PanelAccent") &&
    hasJsxComponent(inspectorSource, "PanelDivider") &&
    hasJsxComponent(inspectorSource, "ContextDivider") &&
    hasJsxComponent(inspectorSource, "DisclosureSection"),
  "Inspector: Surface + Accent + PanelDivider + ContextDivider + Disclosure"
);

assertCase(
  "ux216.wire.inspector.dividerOrder",
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
  "Inspector order: Accent → PanelDivider → ContextDivider → Disclosure"
);

assertCase(
  "ux216.wire.console",
  hasJsxComponent(consoleSource, "PanelSurface") &&
    hasJsxComponent(consoleSource, "PanelAccent") &&
    hasJsxComponent(consoleSource, "DisclosureSection") &&
    !/<PanelMetadata\b/.test(consoleSource) &&
    !/\bReady\b|\bIdle\b|\bErrors\b/.test(consoleSource),
  "Console: Surface + Accent; no Ready/Idle/Errors metadata"
);

assertCase(
  "ux216.wire.canvas",
  hasJsxComponent(bodyLayoutSource, "PanelSurface") &&
    /data-workspace-canvas/.test(bodyLayoutSource) &&
    /data-panel-id=["']canvas["']/.test(bodyLayoutSource) &&
    /<PanelResizeHandle\b/.test(bodyLayoutSource) &&
    (() => {
      const canvasIdx = bodyLayoutSource.indexOf("data-workspace-canvas");
      const surfaceIdx = bodyLayoutSource.indexOf("<PanelSurface");
      return canvasIdx >= 0 && surfaceIdx > canvasIdx;
    })(),
  "Canvas: PanelSurface inside outer data-workspace-canvas node; resize handles kept"
);

/* -------------------------------------------------------------------------- */
/* E. Isolation + architecture freeze                                         */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux216.surfaces.forbidden.symbols",
  !hasImportPath(surfacesSource, "PanelContext") &&
    !hasImportPath(surfacesSource, "WorkspaceContext") &&
    !hasImportPath(surfacesSource, "SessionContext") &&
    !hasImportPath(surfacesSource, "useActivePanel") &&
    !hasImportPath(surfacesSource, "usePanelResize") &&
    !hasImportPath(surfacesSource, "useWorkspace") &&
    !/\buseActivePanel\s*[<(]/.test(surfacesSource) &&
    !/\busePanelResize\s*[<(]/.test(surfacesSource) &&
    !/\buseWorkspace\s*[<(]/.test(surfacesSource) &&
    !/\busePanelState\s*[<(]/.test(surfacesSource) &&
    !/\buseWorkspaceMode\s*[<(]/.test(surfacesSource),
  "surfaces/ forbids context/hook symbols"
);

assertCase(
  "ux216.surfaces.forbidden.imports",
  !hasImportPath(surfacesSource, "PanelState") &&
    !hasImportPath(surfacesSource, "/PanelProvider") &&
    !hasImportPath(surfacesSource, "panels/state") &&
    !hasImportPath(surfacesSource, "persistence") &&
    !hasImportPath(surfacesSource, "/resize") &&
    !hasImportPath(surfacesSource, "/focus") &&
    !hasImportPath(surfacesSource, "/modes") &&
    !hasImportPath(surfacesSource, "session") &&
    !hasImportPath(surfacesSource, "Docking") &&
    !hasImportPath(surfacesSource, "WindowManager") &&
    !/\bPanelState\b/.test(surfacesSource) &&
    !/\bWindowManager\b/.test(surfacesSource),
  "surfaces/ forbids Session/Persistence/PanelState/resize/focus/modes/docking"
);

assertCase(
  "ux216.panel.unchanged",
  /export\s+function\s+Panel\b/.test(panelSource) &&
    !/variant\?:/.test(panelSource),
  "Panel.tsx not extended with surface APIs"
);

assertCase(
  "ux216.header.unchanged",
  /overflow\?:\s*ReactNode/.test(headerSource) ||
    /overflow\?:\s*React\.ReactNode/.test(headerSource),
  "PanelHeader overflow? still present (no surface slot required)"
);

assertCase(
  "ux216.panelState.unchanged",
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
  "ux216.architecture.untouched",
  /export\s+function\s+PanelProvider/.test(panelProviderSource) &&
    /version:\s*1/.test(allPersistenceSources) &&
    /computeNextSize|ResizeSession/.test(allResizeSources) &&
    /PlanningMode|WorkspaceMode/.test(allModesSources) &&
    existsSync(join(focusDir, "ActivePanelProvider.tsx")),
  "Provider / persistence / resize / modes / focus still present"
);

/* -------------------------------------------------------------------------- */
/* F. Docs + package                                                          */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux216.doc.exists",
  existsSync(docPath) &&
    /UX-2\.16/.test(doc) &&
    /PanelSurface/.test(doc) &&
    /SURFACE_TOKENS/.test(doc),
  "docs/UX-2.16-panel-identity-surfaces.md present"
);

assertCase(
  "ux216.roadmap.status",
  /UX-2\.16/.test(roadmap) &&
    /Panel Identity/.test(roadmap) &&
    /Toolbar & Action Refinement/.test(roadmap) &&
    /Iconography/.test(roadmap) &&
    /Workspace Polish/.test(roadmap) &&
    /UX-2\.17/.test(roadmap) &&
    /UX-2\.19/.test(roadmap) &&
    (/COMPLETE \(awaiting/.test(roadmap) ||
      /UX-2\.16\s*=\s*COMPLETE/.test(roadmap)),
  "roadmap marks UX-2.16 surfaces; 2.17–2.19 resequence"
);

assertCase(
  "ux216.package.script",
  /"validate:ux-2\.16"\s*:/.test(pkg),
  "validate:ux-2.16 in package.json"
);

/* -------------------------------------------------------------------------- */
/* G. Delegates — UX-2.15 + tsc + eslint                                      */
/* -------------------------------------------------------------------------- */

if (process.env.UX_SKIP_DELEGATES !== "1") {
  const ux215 = spawnSync("npx", ["tsx", "scripts/validate-ux-2.15.ts"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
    env: { ...process.env, UX_SKIP_DELEGATES: "1" },
  });
  assertCase(
    "ux216.delegate.ux-2.15",
    ux215.status === 0,
    ux215.status === 0
      ? "PASS (leaf)"
      : `${ux215.stdout ?? ""}\n${ux215.stderr ?? ""}`.trim().slice(-1200)
  );

  const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
  });
  assertCase(
    "ux216.typescript",
    tsc.status === 0,
    tsc.status === 0
      ? "PASS"
      : `${tsc.stdout ?? ""}\n${tsc.stderr ?? ""}`.trim().slice(-1200)
  );

  const eslint = spawnSync(
    "npx",
    [
      "eslint",
      "src/components/workspace/surfaces",
      "src/components/workspace/panels/WorkspaceBodyLayout.tsx",
      "src/components/workspace/panels/content/ExplorerContent.tsx",
      "src/components/workspace/panels/content/InspectorContent.tsx",
      "src/components/workspace/panels/content/ConsoleContent.tsx",
      "scripts/validate-ux-2.16.ts",
    ],
    {
      cwd: repoRoot,
      encoding: "utf8",
      shell: true,
    }
  );
  assertCase(
    "ux216.eslint",
    eslint.status === 0,
    eslint.status === 0
      ? "PASS"
      : `${eslint.stdout ?? ""}\n${eslint.stderr ?? ""}`.trim().slice(-1200)
  );
} else {
  assertCase(
    "ux216.delegate.skipped",
    true,
    "UX_SKIP_DELEGATES=1 — leaf suite skipped"
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "ux-2.16-panel-identity-surfaces",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — ux-2.16-panel-identity-surfaces"
    : `\nFAIL — ux-2.16-panel-identity-surfaces (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
