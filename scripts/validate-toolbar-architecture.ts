/**
 * D49.4 — Toolbar architecture + governance static gate.
 * Verifies frozen Adaptive Toolbar contracts (no product changes).
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const toolbarDir = join(repoRoot, "src/components/toolbar");
const uiTokensPath = join(repoRoot, "src/lib/ui/tokens.ts");

const REQUIRED_FILES = [
  "AdaptiveToolbar.tsx",
  "ToolbarSection.tsx",
  "ToolbarGroup.tsx",
  "ToolbarAction.tsx",
  "ToolbarOverflow.tsx",
  "ToolbarTokens.ts",
  "types.ts",
  "index.ts",
] as const;

const FORBIDDEN_IMPORT_PATHS = [
  /@\/components\/workspace/,
  /@\/app\/page/,
  /@\/lib\/scientific/,
  /@\/lib\/graph/,
  /@\/components\/graph/,
  /@\/components\/analysis/,
  /supabase/i,
  /\/stores?\b/,
  /@\/lib\/.*math/,
  /dataset/i,
];

const results: { id: string; pass: boolean; detail: string }[] = [];

const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const readToolbarFile = (file: string): string => {
  const full = join(toolbarDir, file);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

// --- A. Directory + exact file set ---
assertCase("toolbar.dir.exists", existsSync(toolbarDir), toolbarDir);

const present = existsSync(toolbarDir)
  ? readdirSync(toolbarDir).filter((name) => !name.startsWith("."))
  : [];
const presentSet = new Set(present);
const requiredSet = new Set<string>(REQUIRED_FILES);

assertCase(
  "toolbar.files.exact",
  present.length === REQUIRED_FILES.length &&
    REQUIRED_FILES.every((f) => presentSet.has(f)) &&
    present.every((f) => requiredSet.has(f)),
  `present=[${present.sort().join(", ")}] expected=[${REQUIRED_FILES.join(", ")}]`
);

for (const file of REQUIRED_FILES) {
  assertCase(`toolbar.file.${file}`, presentSet.has(file), join(toolbarDir, file));
}

const barrelSource = readToolbarFile("index.ts");
const typesSource = readToolbarFile("types.ts");
const tokensBridgeSource = readToolbarFile("ToolbarTokens.ts");
const adaptiveSource = readToolbarFile("AdaptiveToolbar.tsx");
const sectionSource = readToolbarFile("ToolbarSection.tsx");
const groupSource = readToolbarFile("ToolbarGroup.tsx");
const actionSource = readToolbarFile("ToolbarAction.tsx");
const overflowSource = readToolbarFile("ToolbarOverflow.tsx");

const allToolbarSources = [
  adaptiveSource,
  sectionSource,
  groupSource,
  actionSource,
  overflowSource,
  tokensBridgeSource,
  typesSource,
  barrelSource,
].join("\n");

const componentSources = [
  adaptiveSource,
  sectionSource,
  groupSource,
  actionSource,
  overflowSource,
].join("\n");

// --- B. Barrel stable ---
const barrelHas = {
  AdaptiveToolbar:
    /export\s*\{\s*AdaptiveToolbar\s*\}\s*from\s*["']\.\/AdaptiveToolbar["']/.test(
      barrelSource
    ),
  ToolbarSection:
    /export\s*\{\s*ToolbarSection\s*\}\s*from\s*["']\.\/ToolbarSection["']/.test(
      barrelSource
    ),
  ToolbarGroup:
    /export\s*\{\s*ToolbarGroup\s*\}\s*from\s*["']\.\/ToolbarGroup["']/.test(
      barrelSource
    ),
  ToolbarAction:
    /export\s*\{\s*ToolbarAction\s*\}\s*from\s*["']\.\/ToolbarAction["']/.test(
      barrelSource
    ),
  ToolbarOverflow:
    /export\s*\{\s*ToolbarOverflow\s*\}\s*from\s*["']\.\/ToolbarOverflow["']/.test(
      barrelSource
    ),
  TOOLBAR_TOKENS:
    /export\s*\{\s*TOOLBAR_TOKENS\s*\}\s*from\s*["']\.\/ToolbarTokens["']/.test(
      barrelSource
    ),
  types: /export\s+type\s*\{[^}]*\}\s*from\s*["']\.\/types["']/.test(barrelSource),
};

assertCase(
  "toolbar.barrelStable",
  Object.values(barrelHas).every(Boolean),
  JSON.stringify(barrelHas)
);

assertCase(
  "toolbar.apiFreeze",
  /export\s+type\s+AdaptiveToolbarProps\s*=/.test(typesSource) &&
    /left:\s*ReactNode/.test(typesSource) &&
    /center\?:\s*ReactNode/.test(typesSource) &&
    /right\?:\s*ReactNode/.test(typesSource) &&
    /export\s+type\s+ToolbarSectionProps\s*=/.test(typesSource) &&
    /align:\s*"left"\s*\|\s*"center"\s*\|\s*"right"/.test(typesSource) &&
    /export\s+type\s+ToolbarGroupProps\s*=/.test(typesSource) &&
    /compact\?:/.test(typesSource) &&
    /export\s+type\s+ToolbarActionProps\s*=/.test(typesSource) &&
    /disabled\?:/.test(typesSource) &&
    /active\?:/.test(typesSource) &&
    /export\s+type\s+ToolbarOverflowProps\s*=/.test(typesSource),
  "frozen prop types present in types.ts"
);

// --- C. Tokens bridge ---
assertCase(
  "toolbar.tokens.file",
  /export const TOOLBAR_TOKENS\b/.test(tokensBridgeSource),
  "export const TOOLBAR_TOKENS"
);

const uiTokensSource = existsSync(uiTokensPath)
  ? readFileSync(uiTokensPath, "utf8")
  : "";

assertCase(
  "toolbar.uiTokens.toolbar",
  /toolbar\s*,/.test(uiTokensSource) ||
    /toolbar\s*:/.test(uiTokensSource) ||
    /,\s*toolbar\s*\}/.test(uiTokensSource) ||
    /toolbar,\s*\n/.test(uiTokensSource) ||
    /\btoolbar,\s*$/m.test(uiTokensSource) ||
    /UI_TOKENS\s*=\s*\{[\s\S]*\btoolbar\b/.test(uiTokensSource),
  "UI_TOKENS.toolbar present in tokens.ts"
);

const toolbarTokenValueLines = tokensBridgeSource
  .split(/\r?\n/)
  .filter((line) => /^\s*\w+:\s*/.test(line));

const allValuesReferenceUiToolbar = toolbarTokenValueLines.every((line) =>
  /UI_TOKENS\.toolbar\.\w+/.test(line)
);

const hasStringLiteralInBridge =
  /:\s*["']/.test(tokensBridgeSource) ||
  /:\s*`/.test(tokensBridgeSource) ||
  /=\s*["'][^"']*["']/.test(
    tokensBridgeSource.replace(/from\s+["'][^"']+["']/g, "")
  );

assertCase(
  "toolbar.tokensOnly.bridge",
  /from\s+["']@\/lib\/ui\/tokens["']/.test(tokensBridgeSource) &&
    allValuesReferenceUiToolbar &&
    !hasStringLiteralInBridge,
  allValuesReferenceUiToolbar
    ? hasStringLiteralInBridge
      ? "string literals found in ToolbarTokens.ts"
      : "TOOLBAR_TOKENS → UI_TOKENS.toolbar.* only"
    : "non-UI_TOKENS.toolbar value detected"
);

// Components use TOOLBAR_TOKENS for className (Overflow may be passthrough)
const classNameUsages = componentSources.match(/className=\{[^}]+\}/g) ?? [];
const adHocClassNameLiteral =
  /className\s*=\s*["'][^"']+["']/.test(componentSources) ||
  /className\s*=\s*`[^`]+`/.test(componentSources);

assertCase(
  "toolbar.tokensOnly",
  !adHocClassNameLiteral &&
    (/TOOLBAR_TOKENS/.test(adaptiveSource) ||
      /TOOLBAR_TOKENS/.test(sectionSource)),
  adHocClassNameLiteral
    ? "ad-hoc className literal in toolbar components"
    : `className bindings=${classNameUsages.length}`
);

assertCase(
  "toolbar.noTailwind",
  !adHocClassNameLiteral &&
    !/\bclassName\s*=\s*["'](?:flex|w-|h-|p-|m-|gap-|space-|text-|bg-|border)/.test(
      componentSources
    ),
  "no ad-hoc Tailwind className strings in toolbar components"
);

const hexHit =
  /#[0-9a-fA-F]{3,8}\b/.test(allToolbarSources) ||
  /\b(?:bg|text|border)-slate-\d+/.test(allToolbarSources) ||
  /\b(?:bg|text|border)-zinc-\d+/.test(allToolbarSources);

assertCase(
  "toolbar.noHex",
  !hexHit,
  hexHit ? "hex/slate/zinc found" : "clean"
);

// --- D. Governance imports / state / logic ---
assertCase(
  "toolbar.noWorkspaceImports",
  !/@\/components\/workspace/.test(allToolbarSources) &&
    !/from\s+["'][^"']*workspace[^"']*["']/.test(allToolbarSources),
  "no workspace imports in toolbar/"
);

const scientificHit =
  /@\/lib\/scientific/.test(allToolbarSources) ||
  /from\s+["'][^"']*scientific[^"']*["']/.test(allToolbarSources);

assertCase(
  "toolbar.noScientificImports",
  !scientificHit,
  "no scientific imports in toolbar/"
);

const forbiddenHits: string[] = [];
for (const pattern of FORBIDDEN_IMPORT_PATHS) {
  if (pattern.test(allToolbarSources)) {
    forbiddenHits.push(String(pattern));
  }
}

assertCase(
  "toolbar.noForbiddenDomainImports",
  forbiddenHits.length === 0,
  forbiddenHits.length ? forbiddenHits.join(",") : "clean"
);

const hasStateHooks =
  /\buse(State|Reducer|Effect|Memo|Callback|Ref|Context|LayoutEffect|ImperativeHandle)\s*[<(]/.test(
    allToolbarSources
  );

assertCase(
  "toolbar.noState",
  !hasStateHooks,
  "no React state/effect hooks in toolbar/"
);

const hasOwnedHandlers =
  /\bon(Click|Change|Select|Submit|Cancel)\s*=/.test(componentSources) ||
  /\baddEventListener\b/.test(componentSources) ||
  /\bfetch\s*\(/.test(componentSources);

assertCase(
  "toolbar.noBusinessLogic",
  !hasOwnedHandlers &&
    !/\buse(State|Reducer|Effect)\s*[<(]/.test(componentSources),
  hasOwnedHandlers
    ? "owned handlers / side effects detected"
    : "presentational only"
);

assertCase(
  "toolbar.overflow.passthrough",
  /return\s+children\s*;/.test(overflowSource) &&
    !/matchMedia|ResizeObserver|IntersectionObserver|useMedia|@media/.test(
      overflowSource
    ),
  "ToolbarOverflow = children passthrough; no responsive logic"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "toolbar-architecture",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — toolbar-architecture"
    : `\nFAIL — toolbar-architecture (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
