/**
 * D51.4 / D52.3 — Docking Foundation static gate.
 * Verifies frozen Docking Foundation contracts (no product changes).
 * D52 additions are allowed only via explicit allowlist below.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const dockingDir = join(repoRoot, "src/components/docking");
const pagePath = join(repoRoot, "src/app/page.tsx");
const uiTokensPath = join(repoRoot, "src/lib/ui/tokens.ts");

/** D51 foundation file set (required). */
const D51_REQUIRED_FILES = [
  "types.ts",
  "DockTokens.ts",
  "DockRegistry.ts",
  "DockContext.tsx",
  "DockRoot.tsx",
  "DockZone.tsx",
  "DockPanel.tsx",
  "index.ts",
] as const;

/** D52.3 explicit allowlist — nothing else may be added. */
const D52_ALLOWED_ADDITIONS = [
  "dockRegistration.ts",
  "dockVisibility.ts",
  "dockLayout.ts",
  "dockSlots.ts",
  "dockFeatures.ts",
] as const;

const REQUIRED_FILES = [
  ...D51_REQUIRED_FILES,
  ...D52_ALLOWED_ADDITIONS,
] as const;

/** D52 additive DockContextValue keys (allowlist). */
const D52_CONTEXT_KEYS = [
  "registration",
  "visibility",
  "layout",
  "features",
] as const;

const FORBIDDEN_IMPORT_PATHS = [
  /@\/app\/page/,
  /@\/lib\/scientific/,
  /@\/lib\/graph/,
  /@\/components\/graph/,
  /@\/components\/analysis/,
  /from\s+["'][^"']*scientific[^"']*["']/,
  /from\s+["'][^"']*\/graph[^"']*["']/,
  /from\s+["'][^"']*analysis[^"']*["']/,
  /supabase/i,
  /\/stores?\b/,
];

const results: { id: string; pass: boolean; detail: string }[] = [];

const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const readDockingFile = (file: string): string => {
  const full = join(dockingDir, file);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

// --- Exact file set ---
assertCase("docking.dir.exists", existsSync(dockingDir), dockingDir);

const present = existsSync(dockingDir)
  ? readdirSync(dockingDir).filter((name) => !name.startsWith("."))
  : [];
const presentSet = new Set(present);
const requiredSet = new Set<string>(REQUIRED_FILES);

assertCase(
  "docking.files.exact",
  present.length === REQUIRED_FILES.length &&
    REQUIRED_FILES.every((f) => presentSet.has(f)) &&
    present.every((f) => requiredSet.has(f)),
  `present=[${present.sort().join(", ")}] expected=[${REQUIRED_FILES.join(", ")}]`
);

const barrelSource = readDockingFile("index.ts");
const typesSource = readDockingFile("types.ts");
const tokensBridgeSource = readDockingFile("DockTokens.ts");
const registrySource = readDockingFile("DockRegistry.ts");
const contextSource = readDockingFile("DockContext.tsx");
const rootSource = readDockingFile("DockRoot.tsx");
const zoneSource = readDockingFile("DockZone.tsx");
const panelSource = readDockingFile("DockPanel.tsx");
const pageSource = existsSync(pagePath) ? readFileSync(pagePath, "utf8") : "";
const uiTokensSource = existsSync(uiTokensPath)
  ? readFileSync(uiTokensPath, "utf8")
  : "";

const d52Sources = D52_ALLOWED_ADDITIONS.map((file) => readDockingFile(file));

const allDockingSources = [
  typesSource,
  tokensBridgeSource,
  registrySource,
  contextSource,
  rootSource,
  zoneSource,
  panelSource,
  barrelSource,
  ...d52Sources,
].join("\n");

const hostSources = [rootSource, zoneSource, panelSource].join("\n");

// ============================================================================
// Gate 1 — noScientificImports
// ============================================================================
const forbiddenHits: string[] = [];
for (const pattern of FORBIDDEN_IMPORT_PATHS) {
  if (pattern.test(allDockingSources)) {
    forbiddenHits.push(String(pattern));
  }
}

assertCase(
  "gate1.noForbiddenImports",
  forbiddenHits.length === 0,
  forbiddenHits.length ? forbiddenHits.join(",") : "clean"
);

assertCase(
  "gate1.noPageImport",
  !/@\/app\/page/.test(allDockingSources) &&
    !/from\s+["'][^"']*page\.tsx["']/.test(allDockingSources),
  "no page.tsx imports"
);

assertCase(
  "gate1.noScientificImport",
  !/@\/lib\/scientific/.test(allDockingSources) &&
    !/from\s+["'][^"']*scientific[^"']*["']/.test(allDockingSources),
  "no scientific imports"
);

assertCase(
  "gate1.noGraphImport",
  !/@\/lib\/graph/.test(allDockingSources) &&
    !/@\/components\/graph/.test(allDockingSources),
  "no graph imports"
);

assertCase(
  "gate1.noAnalysisImport",
  !/@\/components\/analysis/.test(allDockingSources) &&
    !/from\s+["'][^"']*analysis[^"']*["']/.test(allDockingSources),
  "no analysis imports"
);

// ============================================================================
// Gate 2 — moveOnly
// ============================================================================
assertCase(
  "gate2.page.mounts.DockTree",
  /<DockRoot[\s>]/.test(pageSource) &&
    /<DockZone[\s\S]*?\bside=["']right["']/.test(pageSource) &&
    /<DockPanel[\s\S]*?\bid=\{DOCK_PANEL_IDS\.inspector\}/.test(pageSource) &&
    /<Inspector[\s>]/.test(pageSource),
  "DockRoot > DockZone(right) > DockPanel(inspector) > Inspector"
);

assertCase(
  "gate2.page.visibleFalse",
  /<Inspector[\s\S]*?\bvisible=\{false\}/.test(pageSource),
  "visible={false}"
);

assertCase(
  "gate2.page.widthToken",
  /width=\{INSPECTOR_TOKENS\.defaultWidth\}/.test(pageSource),
  "width={INSPECTOR_TOKENS.defaultWidth}"
);

assertCase(
  "gate2.toasts.siblings",
  /<\/DockRoot>/.test(pageSource) &&
    /GraphSaveToast/.test(pageSource) &&
    /LabExpertModeToast/.test(pageSource) &&
    /<WorkspacePanels>/.test(pageSource),
  "toasts remain under WorkspacePanels with DockRoot"
);

assertCase(
  "gate2.noDeepImports",
  /from\s+["']@\/components\/docking["']/.test(pageSource) &&
    !/from\s+["']@\/components\/docking\//.test(pageSource),
  'page imports from "@/components/docking" only'
);

// ============================================================================
// Gate 3 — apiFreeze
// ============================================================================
assertCase(
  "gate3.apiFreeze.DockSide",
  /export\s+type\s+DockSide\s*=/.test(typesSource) &&
    /"left"\s*\|\s*"center"\s*\|\s*"right"\s*\|\s*"bottom"\s*\|\s*"floating"/.test(
      typesSource
    ),
  "DockSide frozen union"
);

assertCase(
  "gate3.apiFreeze.DockLocation",
  /export\s+type\s+DockLocation\s*=\s*DockSide/.test(typesSource),
  "DockLocation = DockSide"
);

assertCase(
  "gate3.apiFreeze.DockSize",
  /export\s+type\s+DockSize\s*=/.test(typesSource) &&
    /width\?:\s*number/.test(typesSource) &&
    /height\?:\s*number/.test(typesSource),
  "DockSize frozen shape"
);

assertCase(
  "gate3.apiFreeze.DockState",
  /export\s+type\s+DockState\s*=/.test(typesSource) &&
    /activePanelIds:\s*string\[\]/.test(typesSource) &&
    /sizes:\s*Partial<Record<DockSide,\s*DockSize>>/.test(typesSource),
  "DockState frozen shape"
);

assertCase(
  "gate3.apiFreeze.DockRootProps",
  /export\s+type\s+DockRootProps\s*=/.test(typesSource) &&
    /children\?:\s*ReactNode/.test(typesSource),
  "DockRootProps frozen shape"
);

assertCase(
  "gate3.apiFreeze.DockZoneProps",
  /export\s+type\s+DockZoneProps\s*=/.test(typesSource) &&
    /side:\s*DockSide/.test(typesSource) &&
    /children\?:\s*ReactNode/.test(typesSource),
  "DockZoneProps frozen shape"
);

assertCase(
  "gate3.apiFreeze.DockPanelProps",
  /export\s+type\s+DockPanelProps\s*=/.test(typesSource) &&
    /id:\s*string/.test(typesSource) &&
    /children\?:\s*ReactNode/.test(typesSource),
  "DockPanelProps frozen shape"
);

assertCase(
  "gate3.apiFreeze.DockRegistryEntry",
  /export\s+type\s+DockRegistryEntry\s*=/.test(typesSource) &&
    /location:\s*DockLocation/.test(typesSource) &&
    /defaultSize\?:\s*DockSize/.test(typesSource),
  "DockRegistryEntry frozen shape"
);

assertCase(
  "gate3.apiFreeze.DOCK_PANEL_IDS",
  /export\s+const\s+DOCK_PANEL_IDS\s*=/.test(typesSource) &&
    /inspector:\s*["']inspector["']/.test(typesSource),
  "DOCK_PANEL_IDS.inspector frozen"
);

assertCase(
  "gate3.apiFreeze.DockContextValue",
  /export\s+type\s+DockContextValue\s*=/.test(typesSource) &&
    /state:\s*DockState/.test(typesSource) &&
    /registry:/.test(typesSource) &&
    D52_CONTEXT_KEYS.every((key) =>
      new RegExp(`\\b${key}\\s*:`).test(typesSource)
    ),
  "DockContextValue = { state, registry } + D52 additive keys"
);

// ============================================================================
// Gate 4 — barrelStable
// ============================================================================
const barrelHas = {
  DockRoot:
    /export\s*\{\s*DockRoot\s*\}\s*from\s*["']\.\/DockRoot["']/.test(
      barrelSource
    ),
  DockZone:
    /export\s*\{\s*DockZone\s*\}\s*from\s*["']\.\/DockZone["']/.test(
      barrelSource
    ),
  DockPanel:
    /export\s*\{\s*DockPanel\s*\}\s*from\s*["']\.\/DockPanel["']/.test(
      barrelSource
    ),
  DockProvider:
    /export\s*\{\s*DockProvider,\s*useDockContext\s*\}\s*from\s*["']\.\/DockContext["']/.test(
      barrelSource
    ) ||
    /export\s*\{\s*useDockContext,\s*DockProvider\s*\}\s*from\s*["']\.\/DockContext["']/.test(
      barrelSource
    ),
  DOCK_TOKENS:
    /export\s*\{\s*DOCK_TOKENS\s*\}\s*from\s*["']\.\/DockTokens["']/.test(
      barrelSource
    ),
  DOCK_REGISTRY:
    /export\s*\{\s*DOCK_REGISTRY\s*\}\s*from\s*["']\.\/DockRegistry["']/.test(
      barrelSource
    ),
  DOCK_PANEL_IDS:
    /export\s*\{\s*DOCK_PANEL_IDS\s*\}\s*from\s*["']\.\/types["']/.test(
      barrelSource
    ),
  types: /export\s+type\s*\{[^}]*\}\s*from\s*["']\.\/types["']/.test(
    barrelSource
  ),
};

assertCase(
  "gate4.barrelStable",
  Object.values(barrelHas).every(Boolean),
  JSON.stringify(barrelHas)
);

assertCase(
  "gate4.page.barrelOnly",
  /from\s+["']@\/components\/docking["']/.test(pageSource) &&
    !/from\s+["']@\/components\/docking\//.test(pageSource),
  'page imports from "@/components/docking" only'
);

assertCase(
  "gate4.noExportStar",
  !/export\s*\*\s*from/.test(barrelSource),
  "named exports only"
);

// ============================================================================
// Gate 5 — tokensOnly
// ============================================================================
assertCase(
  "gate5.uiTokens.dock",
  /export const dock\b/.test(uiTokensSource) &&
    /UI_TOKENS\s*=\s*\{[\s\S]*\bdock\b/.test(uiTokensSource),
  "UI_TOKENS.dock present in tokens.ts"
);

assertCase(
  "gate5.tokensBridge",
  /export const DOCK_TOKENS\s*=\s*UI_TOKENS\.dock/.test(tokensBridgeSource) &&
    /from\s+["']@\/lib\/ui\/tokens["']/.test(tokensBridgeSource),
  "DOCK_TOKENS = UI_TOKENS.dock"
);

const dockKeys = [
  "leftWidth",
  "rightWidth",
  "bottomHeight",
  "minPanelWidth",
  "minPanelHeight",
  "splitterSize",
  "animationDuration",
  "zIndex",
];

assertCase(
  "gate5.dockKeys",
  dockKeys.every((key) => new RegExp(`${key}\\s*:`).test(uiTokensSource)),
  `dock keys: ${dockKeys.join(", ")}`
);

assertCase(
  "gate5.hosts.noClassName",
  !/\bclassName\b/.test(hostSources),
  "hosts have no className"
);

// ============================================================================
// Gate 6 — noInlineDockSizes
// ============================================================================
const hostInlineSize =
  /\b\d{2,4}px\b/.test(hostSources) ||
  /width\s*[:=]\s*\d+/.test(hostSources) ||
  /height\s*[:=]\s*\d+/.test(hostSources) ||
  /style\s*=/.test(hostSources);

assertCase(
  "gate6.noInlineDockSizes",
  !hostInlineSize &&
    /DOCK_TOKENS\.rightWidth/.test(registrySource) &&
    /DOCK_TOKENS\.rightWidth/.test(contextSource),
  hostInlineSize
    ? "inline size literals in hosts"
    : "sizes via DOCK_TOKENS only"
);

// ============================================================================
// Gate 7 — noTailwindDockConstants
// ============================================================================
const dockBlockMatch = uiTokensSource.match(
  /export const dock\s*=\s*\{([\s\S]*?)\}\s*as const/
);
const dockBlock = dockBlockMatch?.[1] ?? "";
const dockHasStringLiteral = /["'`]/.test(dockBlock);
const dockHasTailwindHint =
  /\b(w-|h-|flex|bg-|border|text-|p-|m-|gap-|z-)/.test(dockBlock);
const bridgeHasLiterals =
  /["'][^"']+["']/.test(tokensBridgeSource.replace(/from\s+["'][^"']+["']/g, ""));

assertCase(
  "gate7.noTailwindDockConstants",
  Boolean(dockBlockMatch) &&
    !dockHasStringLiteral &&
    !dockHasTailwindHint &&
    !bridgeHasLiterals &&
    /\d+/.test(dockBlock),
  dockHasStringLiteral || dockHasTailwindHint
    ? "string/Tailwind in UI_TOKENS.dock"
    : "numeric dock tokens only"
);

// ============================================================================
// Gate 8 — registryStable
// ============================================================================
assertCase(
  "gate8.registry.freeze",
  /export const DOCK_REGISTRY\s*=\s*Object\.freeze\s*\(/.test(registrySource),
  "Object.freeze(DOCK_REGISTRY)"
);

assertCase(
  "gate8.registry.inspectorOnly",
  /inspector\s*:/.test(registrySource) &&
    /location:\s*["']right["']/.test(registrySource) &&
    /DOCK_PANEL_IDS\.inspector/.test(registrySource) &&
    !/\b(analysis|properties|layers|history|ai)\s*:/.test(registrySource),
  "seed inspector → right only"
);

assertCase(
  "gate8.registry.widthToken",
  /width:\s*DOCK_TOKENS\.rightWidth/.test(registrySource),
  "defaultSize.width = DOCK_TOKENS.rightWidth"
);

// ============================================================================
// Gate 9 — zonesStable
// ============================================================================
assertCase(
  "gate9.zones.DockSide",
  /"left"\s*\|\s*"center"\s*\|\s*"right"\s*\|\s*"bottom"\s*\|\s*"floating"/.test(
    typesSource
  ),
  "DockSide union intact"
);

assertCase(
  "gate9.zones.rightWired",
  /<DockZone[\s\S]*?\bside=["']right["']/.test(pageSource),
  'DockZone side="right" wired'
);

assertCase(
  "gate9.zones.noOtherWired",
  !/<DockZone[\s\S]*?\bside=["'](left|center|bottom|floating)["']/.test(
    pageSource
  ),
  "no Left/Center/Bottom/Floating zones wired"
);

// ============================================================================
// Gate 10 — contextStable (D52 allowlist: additive keys; still no dispatch/drag/persist)
// ============================================================================
assertCase(
  "gate10.context.readOnlyShape",
  /state:\s*DockState/.test(typesSource) &&
    /registry:/.test(typesSource) &&
    D52_CONTEXT_KEYS.every((key) =>
      new RegExp(`\\b${key}\\s*:`).test(typesSource)
    ) &&
    /DockProvider/.test(contextSource) &&
    /useDockContext/.test(contextSource),
  "context exposes state + registry + D52 additive keys"
);

const contextWithoutComments = contextSource
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\/\/.*$/gm, "");

assertCase(
  "gate10.context.noMutationApis",
  !/\bdispatch\s*[:(=]/.test(contextWithoutComments) &&
    !/\buseReducer\b/.test(contextWithoutComments) &&
    !/\bpersist(ence)?\s*[({=]/.test(contextWithoutComments) &&
    !/\bactiveDrag\b/.test(contextWithoutComments) &&
    !/\bresize(State)?\b/.test(contextWithoutComments) &&
    !/\bdrag\b/.test(contextWithoutComments),
  "no dispatch / reducer / persistence / drag / resize APIs"
);

assertCase(
  "gate10.context.layoutReference",
  /layout:\s*DEFAULT_DOCK_LAYOUT/.test(contextWithoutComments),
  "provider layout references DEFAULT_DOCK_LAYOUT"
);

assertCase(
  "gate10.context.seedExportIntact",
  /export const DOCK_REGISTRY\s*=\s*Object\.freeze\s*\(/.test(registrySource),
  "DOCK_REGISTRY seed freeze intact"
);

// ============================================================================
// Gate 11 — noDomWrapper
// ============================================================================
const hostDomWrappers =
  /<(div|section|aside|main|article|header|footer|nav)\b/.test(hostSources) ||
  /\brole\s*=/.test(hostSources) ||
  /\bclassName\b/.test(hostSources);

assertCase(
  "gate11.noDomWrapper",
  !hostDomWrappers,
  hostDomWrappers
    ? "DOM wrapper detected in DockRoot/Zone/Panel"
    : "no layout DOM wrappers in hosts"
);

// ============================================================================
// Gate 12 — transparentHosts
// ============================================================================
assertCase(
  "gate12.transparent.DockRoot",
  /return\s*\(\s*<DockProvider>\s*\{children\}\s*<\/DockProvider>\s*\)/.test(
    rootSource
  ) || /<DockProvider>\s*\{children\}\s*<\/DockProvider>/.test(rootSource),
  "DockRoot = Provider only"
);

assertCase(
  "gate12.transparent.DockZone",
  /return\s*<>\s*\{children\}\s*<\/>/.test(zoneSource),
  "DockZone = fragment passthrough"
);

assertCase(
  "gate12.transparent.DockPanel",
  /return\s*<>\s*\{children\}\s*<\/>/.test(panelSource),
  "DockPanel = fragment passthrough"
);

// --- Official 12-gate rollup ---
const gateGroups: { id: string; prefix: string }[] = [
  { id: "CA-D51.gate1.noScientificImports", prefix: "gate1." },
  { id: "CA-D51.gate2.moveOnly", prefix: "gate2." },
  { id: "CA-D51.gate3.apiFreeze", prefix: "gate3." },
  { id: "CA-D51.gate4.barrelStable", prefix: "gate4." },
  { id: "CA-D51.gate5.tokensOnly", prefix: "gate5." },
  { id: "CA-D51.gate6.noInlineDockSizes", prefix: "gate6." },
  { id: "CA-D51.gate7.noTailwindDockConstants", prefix: "gate7." },
  { id: "CA-D51.gate8.registryStable", prefix: "gate8." },
  { id: "CA-D51.gate9.zonesStable", prefix: "gate9." },
  { id: "CA-D51.gate10.contextStable", prefix: "gate10." },
  { id: "CA-D51.gate11.noDomWrapper", prefix: "gate11." },
  { id: "CA-D51.gate12.transparentHosts", prefix: "gate12." },
];

for (const group of gateGroups) {
  const groupResults = results.filter((r) => r.id.startsWith(group.prefix));
  const pass = groupResults.length > 0 && groupResults.every((r) => r.pass);
  assertCase(
    group.id,
    pass,
    pass
      ? `${group.prefix}* PASS (${groupResults.length})`
      : `${group.prefix}* FAIL`
  );
}

const officialGates = results.filter((r) => r.id.startsWith("CA-D51.gate"));
const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "docking-foundation",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  officialGates: {
    pass: officialGates.every((g) => g.pass),
    score: `${officialGates.filter((g) => g.pass).length}/${officialGates.length}`,
    results: officialGates,
  },
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — docking-foundation (CA-D51 12/12)"
    : `\nFAIL — docking-foundation (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
