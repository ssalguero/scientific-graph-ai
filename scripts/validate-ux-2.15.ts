/**
 * UX-2.15 — Progressive Disclosure Foundation gate.
 * Presentational only; PanelState / persistence / resize / focus / modes frozen.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const workspaceDir = join(repoRoot, "src/components/workspace");
const disclosureDir = join(workspaceDir, "disclosure");
const panelsDir = join(workspaceDir, "panels");
const contentDir = join(panelsDir, "content");
const stateDir = join(panelsDir, "state");
const persistenceDir = join(panelsDir, "persistence");
const resizeDir = join(panelsDir, "resize");
const focusDir = join(workspaceDir, "focus");
const modesDir = join(workspaceDir, "modes");
const packagePath = join(repoRoot, "package.json");
const docPath = join(repoRoot, "docs/UX-2.15-progressive-disclosure.md");
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

const disclosureSource = collectTsSources(disclosureDir).join("\n");
const disclosureBarrel = read(join(disclosureDir, "index.ts"));
const disclosureSectionSource = read(
  join(disclosureDir, "DisclosureSection.tsx")
);
const overflowSource = read(join(disclosureDir, "PanelOverflowMenu.tsx"));
const headerSource = read(join(panelsDir, "PanelHeader.tsx"));
const panelSource = read(join(panelsDir, "Panel.tsx"));
const leftSource = read(join(panelsDir, "LeftPanel.tsx"));
const rightSource = read(join(panelsDir, "RightPanel.tsx"));
const bottomSource = read(join(panelsDir, "BottomPanel.tsx"));
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
/* A. disclosure/ structure + barrel                                          */
/* -------------------------------------------------------------------------- */

const disclosureFiles = [
  "DisclosureSection.tsx",
  "AdvancedSection.tsx",
  "RevealButton.tsx",
  "InlineExpander.tsx",
  "PanelOverflowMenu.tsx",
  "ContextDivider.tsx",
  "index.ts",
];
for (const f of disclosureFiles) {
  assertCase(
    `ux215.disclosure.file.${f}`,
    existsSync(join(disclosureDir, f)),
    `workspace/disclosure/${f} present`
  );
}

assertCase(
  "ux215.disclosure.barrel",
  /DisclosureSection/.test(disclosureBarrel) &&
    /AdvancedSection/.test(disclosureBarrel) &&
    /RevealButton/.test(disclosureBarrel) &&
    /InlineExpander/.test(disclosureBarrel) &&
    /PanelOverflowMenu/.test(disclosureBarrel) &&
    /ContextDivider/.test(disclosureBarrel),
  "disclosure barrel exports six primitives"
);

assertCase(
  "ux215.workspace.barrel.noDisclosure",
  !/DisclosureSection/.test(workspaceBarrel) &&
    !/PanelOverflowMenu/.test(workspaceBarrel) &&
    !/from\s+["']\.\/disclosure/.test(workspaceBarrel),
  "public workspace barrel does not export disclosure/"
);

/* -------------------------------------------------------------------------- */
/* B. Frozen prop shapes                                                      */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux215.disclosureSection.props",
  /export\s+type\s+DisclosureSectionProps\s*=\s*\{[\s\S]*?\btitle\s*:/.test(
    disclosureSectionSource
  ) &&
    /defaultExpanded\?/.test(disclosureSectionSource) &&
    /children\?/.test(disclosureSectionSource) &&
    /useState/.test(disclosureSectionSource) &&
    !/export\s+type\s+DisclosureSectionProps\s*=\s*\{[^}]*\bexpanded\s*[?:]/.test(
      disclosureSectionSource
    ) &&
    !/export\s+type\s+DisclosureSectionProps\s*=\s*\{[^}]*\bonToggle\s*[?:]/.test(
      disclosureSectionSource
    ),
  "DisclosureSection: title/defaultExpanded/children; local useState; not semi-controlled"
);

assertCase(
  "ux215.overflow.noOpenState",
  /items\s*:/.test(overflowSource) &&
    /disabled\?/.test(overflowSource) &&
    /busy\?/.test(overflowSource) &&
    !/\bopen\s*[?:]/.test(overflowSource) &&
    !/\bisOpen\s*[?:]/.test(overflowSource) &&
    !/\bexpanded\s*[?:]/.test(overflowSource) &&
    !/createPortal/.test(overflowSource) &&
    !/Popover/.test(overflowSource) &&
    !/Dropdown/.test(overflowSource),
  "PanelOverflowMenu: items/disabled?/busy?; no open/portal/menu APIs"
);

assertCase(
  "ux215.header.overflow",
  /overflow\?:\s*ReactNode/.test(headerSource) ||
    /overflow\?:\s*React\.ReactNode/.test(headerSource),
  "PanelHeader declares overflow?"
);

assertCase(
  "ux215.header.slotOrder",
  (() => {
    const actionsIdx = headerSource.indexOf("{actions != null ? actions");
    const overflowIdx = headerSource.indexOf("{overflow != null ? overflow");
    const toggleIdx = headerSource.indexOf("{onToggle != null ? (");
    return (
      actionsIdx >= 0 &&
      overflowIdx > actionsIdx &&
      toggleIdx > overflowIdx
    );
  })(),
  "PanelHeader order: actions → overflow → collapse"
);

/* -------------------------------------------------------------------------- */
/* C. Wiring                                                                  */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux215.wire.left.overflow",
  hasJsxComponent(leftSource, "PanelOverflowMenu") &&
    /overflow=\{/.test(leftSource) &&
    /label:\s*["']Import["']/.test(leftSource) &&
    /label:\s*["']New["']/.test(leftSource),
  "LeftPanel: New primary + Import in PanelOverflowMenu"
);

assertCase(
  "ux215.wire.right.overflow",
  hasJsxComponent(rightSource, "PanelOverflowMenu") &&
    /overflow=\{/.test(rightSource) &&
    /label:\s*["']Rename["']/.test(rightSource) &&
    /label:\s*["']Color["']/.test(rightSource),
  "RightPanel: Rename/Color in PanelOverflowMenu"
);

assertCase(
  "ux215.wire.bottom.overflow",
  hasJsxComponent(bottomSource, "PanelOverflowMenu") &&
    /overflow=\{/.test(bottomSource),
  "BottomPanel wires PanelOverflowMenu"
);

assertCase(
  "ux215.wire.explorer.disclosure",
  hasJsxComponent(explorerSource, "DisclosureSection") &&
    hasJsxComponent(explorerSource, "ContextDivider") &&
    hasJsxComponent(explorerSource, "AdvancedSection"),
  "ExplorerContent uses DisclosureSection + ContextDivider + AdvancedSection"
);

assertCase(
  "ux215.wire.inspector.disclosure",
  hasJsxComponent(inspectorSource, "DisclosureSection") &&
    hasJsxComponent(inspectorSource, "ContextDivider") &&
    hasJsxComponent(inspectorSource, "AdvancedSection"),
  "InspectorContent uses DisclosureSection + ContextDivider + AdvancedSection"
);

assertCase(
  "ux215.wire.console.disclosure",
  hasJsxComponent(consoleSource, "DisclosureSection") &&
    hasJsxComponent(consoleSource, "ContextDivider") &&
    hasJsxComponent(consoleSource, "AdvancedSection"),
  "ConsoleContent uses DisclosureSection + ContextDivider + AdvancedSection"
);

assertCase(
  "ux215.noInventedContent",
  !/Graph\s*[123]/.test(explorerSource + inspectorSource + consoleSource) &&
    !/\bUUID\b/.test(explorerSource + inspectorSource + consoleSource) &&
    !/fake\s+rows/i.test(explorerSource + inspectorSource + consoleSource),
  "No invented Graph/UUID/fake-row content in panel content"
);

/* -------------------------------------------------------------------------- */
/* D. Isolation + forbidden APIs                                              */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux215.disclosure.forbidden.symbols",
  !hasImportPath(disclosureSource, "PanelContext") &&
    !hasImportPath(disclosureSource, "WorkspaceContext") &&
    !hasImportPath(disclosureSource, "SessionContext") &&
    !hasImportPath(disclosureSource, "useActivePanel") &&
    !hasImportPath(disclosureSource, "usePanelResize") &&
    !hasImportPath(disclosureSource, "useWorkspace") &&
    !/\buseActivePanel\s*[<(]/.test(disclosureSource) &&
    !/\busePanelResize\s*[<(]/.test(disclosureSource) &&
    !/\buseWorkspace\s*[<(]/.test(disclosureSource) &&
    !/\busePanelState\s*[<(]/.test(disclosureSource) &&
    !/\buseWorkspaceMode\s*[<(]/.test(disclosureSource),
  "disclosure/ forbids PanelContext/WorkspaceContext/SessionContext/useActivePanel/usePanelResize/useWorkspace"
);

assertCase(
  "ux215.disclosure.forbidden.imports",
  !hasImportPath(disclosureSource, "PanelState") &&
    !hasImportPath(disclosureSource, "/PanelProvider") &&
    !hasImportPath(disclosureSource, "panels/state") &&
    !hasImportPath(disclosureSource, "persistence") &&
    !hasImportPath(disclosureSource, "/resize") &&
    !hasImportPath(disclosureSource, "/focus") &&
    !hasImportPath(disclosureSource, "/modes") &&
    !hasImportPath(disclosureSource, "session") &&
    !/createPortal/.test(disclosureSource) &&
    !/\bPopover\b/.test(disclosureSource) &&
    !/\bDropdown\b/.test(disclosureSource) &&
    !/\bRadix\b/.test(disclosureSource) &&
    !/@radix-ui/.test(disclosureSource),
  "disclosure/ forbids Session/Persistence/PanelState/resize/focus/modes + Radix/Popover/Dropdown/createPortal"
);

assertCase(
  "ux215.panel.unchanged",
  /export\s+function\s+Panel\b/.test(panelSource) &&
    !/overflow\?:/.test(panelSource),
  "Panel.tsx not extended with overflow"
);

assertCase(
  "ux215.panelState.unchanged",
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
  "ux215.architecture.untouched",
  /export\s+function\s+PanelProvider/.test(panelProviderSource) &&
    /version:\s*1/.test(allPersistenceSources) &&
    /computeNextSize|ResizeSession/.test(allResizeSources) &&
    /PlanningMode|WorkspaceMode/.test(allModesSources) &&
    existsSync(join(focusDir, "ActivePanelProvider.tsx")),
  "Provider / persistence / resize / modes / focus still present"
);

/* -------------------------------------------------------------------------- */
/* E. Docs + package                                                          */
/* -------------------------------------------------------------------------- */

assertCase(
  "ux215.doc.exists",
  existsSync(docPath) &&
    /UX-2\.15/.test(doc) &&
    /DisclosureSection/.test(doc) &&
    /overflow\?/.test(doc),
  "docs/UX-2.15-progressive-disclosure.md present"
);

assertCase(
  "ux215.roadmap.status",
  /UX-2\.15/.test(roadmap) &&
    /Progressive Disclosure/.test(roadmap) &&
    /Toolbar & Action Refinement/.test(roadmap) &&
    /Iconography/.test(roadmap) &&
    /Workspace Polish/.test(roadmap) &&
    (/COMPLETE \(awaiting/.test(roadmap) ||
      /UX-2\.15\s*=\s*COMPLETE/.test(roadmap)),
  "roadmap marks UX-2.15 progressive disclosure; 2.16–2.18 resequence"
);

assertCase(
  "ux215.package.script",
  /"validate:ux-2\.15"\s*:/.test(pkg),
  "validate:ux-2.15 in package.json"
);

/* -------------------------------------------------------------------------- */
/* F. Delegates — UX-2.14 + tsc + eslint                                      */
/* -------------------------------------------------------------------------- */

if (process.env.UX_SKIP_DELEGATES !== "1") {
  const ux214 = spawnSync("npx", ["tsx", "scripts/validate-ux-2.14.ts"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
    env: { ...process.env, UX_SKIP_DELEGATES: "1" },
  });
  assertCase(
    "ux215.delegate.ux-2.14",
    ux214.status === 0,
    ux214.status === 0
      ? "PASS (leaf)"
      : `${ux214.stdout ?? ""}\n${ux214.stderr ?? ""}`.trim().slice(-1200)
  );

  const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
  });
  assertCase(
    "ux215.typescript",
    tsc.status === 0,
    tsc.status === 0
      ? "PASS"
      : `${tsc.stdout ?? ""}\n${tsc.stderr ?? ""}`.trim().slice(-1200)
  );

  const eslint = spawnSync(
    "npx",
    [
      "eslint",
      "src/components/workspace/disclosure",
      "src/components/workspace/panels/PanelHeader.tsx",
      "src/components/workspace/panels/LeftPanel.tsx",
      "src/components/workspace/panels/RightPanel.tsx",
      "src/components/workspace/panels/BottomPanel.tsx",
      "src/components/workspace/panels/content/ExplorerContent.tsx",
      "src/components/workspace/panels/content/InspectorContent.tsx",
      "src/components/workspace/panels/content/ConsoleContent.tsx",
      "scripts/validate-ux-2.15.ts",
    ],
    {
      cwd: repoRoot,
      encoding: "utf8",
      shell: true,
    }
  );
  assertCase(
    "ux215.eslint",
    eslint.status === 0,
    eslint.status === 0
      ? "PASS"
      : `${eslint.stdout ?? ""}\n${eslint.stderr ?? ""}`.trim().slice(-1200)
  );
} else {
  assertCase(
    "ux215.delegate.skipped",
    true,
    "UX_SKIP_DELEGATES=1 — leaf suite skipped"
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "ux-2.15-progressive-disclosure",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — ux-2.15-progressive-disclosure"
    : `\nFAIL — ux-2.15-progressive-disclosure (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
