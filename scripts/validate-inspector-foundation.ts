/**
 * D50.3 — Inspector Foundation static gate.
 * Verifies frozen Inspector Dock Shell contracts (no product changes).
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const inspectorDir = join(repoRoot, "src/components/inspector");
const pagePath = join(repoRoot, "src/app/page.tsx");
const uiTokensPath = join(repoRoot, "src/lib/ui/tokens.ts");

const REQUIRED_FILES = [
  "Inspector.tsx",
  "InspectorLayout.tsx",
  "InspectorPanel.tsx",
  "InspectorSection.tsx",
  "InspectorTokens.ts",
  "types.ts",
  "index.ts",
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

const readInspectorFile = (file: string): string => {
  const full = join(inspectorDir, file);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

// --- Exact file set ---
assertCase("inspector.dir.exists", existsSync(inspectorDir), inspectorDir);

const present = existsSync(inspectorDir)
  ? readdirSync(inspectorDir).filter((name) => !name.startsWith("."))
  : [];
const presentSet = new Set(present);
const requiredSet = new Set<string>(REQUIRED_FILES);

assertCase(
  "inspector.files.exact",
  present.length === REQUIRED_FILES.length &&
    REQUIRED_FILES.every((f) => presentSet.has(f)) &&
    present.every((f) => requiredSet.has(f)),
  `present=[${present.sort().join(", ")}] expected=[${REQUIRED_FILES.join(", ")}]`
);

const barrelSource = readInspectorFile("index.ts");
const typesSource = readInspectorFile("types.ts");
const tokensBridgeSource = readInspectorFile("InspectorTokens.ts");
const inspectorSource = readInspectorFile("Inspector.tsx");
const layoutSource = readInspectorFile("InspectorLayout.tsx");
const panelSource = readInspectorFile("InspectorPanel.tsx");
const sectionSource = readInspectorFile("InspectorSection.tsx");
const pageSource = existsSync(pagePath) ? readFileSync(pagePath, "utf8") : "";
const uiTokensSource = existsSync(uiTokensPath)
  ? readFileSync(uiTokensPath, "utf8")
  : "";

const allInspectorSources = [
  inspectorSource,
  layoutSource,
  panelSource,
  sectionSource,
  tokensBridgeSource,
  typesSource,
  barrelSource,
].join("\n");

const componentSources = [
  inspectorSource,
  layoutSource,
  panelSource,
  sectionSource,
].join("\n");

// ============================================================================
// Gate 1 — No scientific / page / graph / analysis imports
// ============================================================================
const forbiddenHits: string[] = [];
for (const pattern of FORBIDDEN_IMPORT_PATHS) {
  if (pattern.test(allInspectorSources)) {
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
  !/@\/app\/page/.test(allInspectorSources) &&
    !/from\s+["'][^"']*page\.tsx["']/.test(allInspectorSources),
  "no page.tsx imports"
);

assertCase(
  "gate1.noAnalysisImport",
  !/@\/components\/analysis/.test(allInspectorSources) &&
    !/from\s+["'][^"']*analysis[^"']*["']/.test(allInspectorSources),
  "no analysis imports"
);

assertCase(
  "gate1.noGraphImport",
  !/@\/lib\/graph/.test(allInspectorSources) &&
    !/@\/components\/graph/.test(allInspectorSources),
  "no graph imports"
);

assertCase(
  "gate1.noScientificImport",
  !/@\/lib\/scientific/.test(allInspectorSources) &&
    !/from\s+["'][^"']*scientific[^"']*["']/.test(allInspectorSources),
  "no scientific imports"
);

// ============================================================================
// Gate 2 — No hooks
// ============================================================================
const hasHooks =
  /\buse(State|Effect|Memo|Callback|Reducer|Ref|Context|LayoutEffect|ImperativeHandle)\s*[<(]/.test(
    allInspectorSources
  );

assertCase("gate2.noHooks", !hasHooks, "no React hooks in inspector/");

// ============================================================================
// Gate 3 — No local state / setters / reducers
// ============================================================================
const hasState =
  /\buse(State|Reducer)\s*[<(]/.test(allInspectorSources) ||
  /\bset[A-Z]\w*\s*=/.test(componentSources) ||
  /\bcreateContext\b/.test(allInspectorSources) ||
  /\buseReducer\b/.test(allInspectorSources);

assertCase(
  "gate3.noLocalState",
  !hasState,
  "no local state / setters / reducers / context providers"
);

// ============================================================================
// Gate 4 — Tokens only / no Tailwind inline
// ============================================================================
assertCase(
  "gate4.uiTokens.inspector",
  /export const inspector\b/.test(uiTokensSource) &&
    /UI_TOKENS\s*=\s*\{[\s\S]*\binspector\b/.test(uiTokensSource),
  "UI_TOKENS.inspector present in tokens.ts"
);

assertCase(
  "gate4.tokensBridge",
  /export const INSPECTOR_TOKENS\s*=\s*UI_TOKENS\.inspector/.test(
    tokensBridgeSource
  ) && /from\s+["']@\/lib\/ui\/tokens["']/.test(tokensBridgeSource),
  "INSPECTOR_TOKENS = UI_TOKENS.inspector"
);

const adHocClassNameLiteral =
  /className\s*=\s*["'][^"']+["']/.test(componentSources) ||
  /className\s*=\s*`[^`]+`/.test(componentSources);

assertCase(
  "gate4.tokensOnly",
  !adHocClassNameLiteral && /INSPECTOR_TOKENS/.test(componentSources),
  adHocClassNameLiteral
    ? "ad-hoc className literal in inspector components"
    : "components use INSPECTOR_TOKENS"
);

assertCase(
  "gate4.noTailwindInline",
  !adHocClassNameLiteral &&
    !/\bclassName\s*=\s*["'](?:flex|w-|h-|p-|m-|gap-|space-|text-|bg-|border)/.test(
      componentSources
    ),
  "no ad-hoc Tailwind className strings"
);

// ============================================================================
// Gate 5 — Barrel unique public export
// ============================================================================
const barrelHas = {
  Inspector:
    /export\s*\{\s*Inspector\s*\}\s*from\s*["']\.\/Inspector["']/.test(
      barrelSource
    ),
  InspectorLayout:
    /export\s*\{\s*InspectorLayout\s*\}\s*from\s*["']\.\/InspectorLayout["']/.test(
      barrelSource
    ),
  InspectorPanel:
    /export\s*\{\s*InspectorPanel\s*\}\s*from\s*["']\.\/InspectorPanel["']/.test(
      barrelSource
    ),
  InspectorSection:
    /export\s*\{\s*InspectorSection\s*\}\s*from\s*["']\.\/InspectorSection["']/.test(
      barrelSource
    ),
  INSPECTOR_TOKENS:
    /export\s*\{\s*INSPECTOR_TOKENS\s*\}\s*from\s*["']\.\/InspectorTokens["']/.test(
      barrelSource
    ),
  types: /export\s+type\s*\{[^}]*\}\s*from\s*["']\.\/types["']/.test(
    barrelSource
  ),
};

assertCase(
  "gate5.barrelStable",
  Object.values(barrelHas).every(Boolean),
  JSON.stringify(barrelHas)
);

assertCase(
  "gate5.page.barrelOnly",
  /from\s+["']@\/components\/inspector["']/.test(pageSource) &&
    !/from\s+["']@\/components\/inspector\//.test(pageSource),
  'page imports from "@/components/inspector" only'
);

// ============================================================================
// Gate 6 — API Freeze
// ============================================================================
assertCase(
  "gate6.apiFreeze.InspectorProps",
  /export\s+type\s+InspectorProps\s*=/.test(typesSource) &&
    /visible:\s*boolean/.test(typesSource) &&
    /width:\s*number/.test(typesSource) &&
    /children\?:\s*ReactNode/.test(typesSource),
  "InspectorProps frozen shape"
);

assertCase(
  "gate6.apiFreeze.InspectorPanelProps",
  /export\s+type\s+InspectorPanelProps\s*=/.test(typesSource) &&
    /children\?:\s*ReactNode/.test(typesSource),
  "InspectorPanelProps frozen shape"
);

assertCase(
  "gate6.apiFreeze.InspectorSectionProps",
  /export\s+type\s+InspectorSectionProps\s*=/.test(typesSource) &&
    /title:\s*string/.test(typesSource) &&
    /children\?:\s*ReactNode/.test(typesSource),
  "InspectorSectionProps frozen shape"
);

assertCase(
  "gate6.apiFreeze.InspectorContext.reserved",
  /export\s+type\s+InspectorContext\s*=/.test(typesSource) &&
    /selectedObject:/.test(typesSource) &&
    /selectionType:/.test(typesSource) &&
    /reserved:/.test(typesSource) &&
    !/\bcreateContext\b/.test(allInspectorSources) &&
    !/\bProvider\b/.test(componentSources),
  "InspectorContext reserved; no provider"
);

// ============================================================================
// Gate 7 — Empty dock wiring + Analysis Inspector stays in page
// ============================================================================
assertCase(
  "gate7.page.mounts.Inspector",
  /<Inspector[\s>]/.test(pageSource),
  "<Inspector present in page.tsx"
);

assertCase(
  "gate7.page.visibleFalse",
  /<Inspector[\s\S]*?\bvisible=\{false\}/.test(pageSource),
  "visible={false}"
);

assertCase(
  "gate7.analysisInspector.staysInPage",
  /ANALYSIS_INSPECTOR_CATEGORIES/.test(pageSource) &&
    /getAnalysisInspectorPanelClass/.test(pageSource) &&
    /Inspector contextual/.test(pageSource) &&
    /Categorías del inspector/.test(pageSource),
  "Analysis Inspector markers remain in page.tsx"
);

assertCase(
  "gate7.analysisNotMigratedToModule",
  !/ANALYSIS_INSPECTOR_CATEGORIES/.test(allInspectorSources) &&
    !/getAnalysisInspectorPanelClass/.test(allInspectorSources) &&
    !/InspectorToggleGroup/.test(allInspectorSources),
  "Analysis Inspector not moved into inspector/"
);

// ============================================================================
// Gate 8 — Move-only / decoupled infrastructure
// ============================================================================
assertCase(
  "gate8.moveOnly.wiringOnly",
  /from\s+["']@\/components\/inspector["']/.test(pageSource) &&
    /<Inspector[\s\S]*?\bvisible=\{false\}/.test(pageSource) &&
    /<WorkspacePanels>/.test(pageSource),
  "Inspector wired in WorkspacePanels; empty dock"
);

assertCase(
  "gate8.moveOnly.layoutReturnsNull",
  /if\s*\(\s*!visible\s*\)\s*\{?\s*return\s+null/.test(layoutSource) ||
    /if\s*\(\s*!visible\s*\)\s*return\s+null/.test(layoutSource),
  "InspectorLayout returns null when !visible"
);

assertCase(
  "gate8.moveOnly.noScientificInModule",
  forbiddenHits.length === 0 && !hasHooks && !hasState,
  "decoupled: no domain imports / hooks / state"
);

assertCase(
  "gate8.moveOnly.noDeepImports",
  !/from\s+["']@\/components\/inspector\//.test(pageSource),
  "no deep inspector imports from page"
);

// --- Official 8-gate rollup ---
const gateGroups: { id: string; prefix: string }[] = [
  { id: "CA-D50.gate1.noScientificImports", prefix: "gate1." },
  { id: "CA-D50.gate2.noHooks", prefix: "gate2." },
  { id: "CA-D50.gate3.noState", prefix: "gate3." },
  { id: "CA-D50.gate4.tokensOnly", prefix: "gate4." },
  { id: "CA-D50.gate5.barrel", prefix: "gate5." },
  { id: "CA-D50.gate6.apiFreeze", prefix: "gate6." },
  { id: "CA-D50.gate7.emptyDock", prefix: "gate7." },
  { id: "CA-D50.gate8.moveOnly", prefix: "gate8." },
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

const officialGates = results.filter((r) => r.id.startsWith("CA-D50.gate"));
const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "inspector-foundation",
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
    ? "\nPASS — inspector-foundation (CA-D50 8/8)"
    : `\nFAIL — inspector-foundation (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
