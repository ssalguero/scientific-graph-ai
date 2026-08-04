/**
 * UX-6.5 — Command Palette Foundation gate.
 *
 * Blocks:
 * paletteStructure · paletteCatalog · paletteIndex · searchContract
 * providerContract · diagnostics · apiFreeze · noUI
 * noExecution · tscCompile
 *
 * Architectural principles:
 * - Palette projects exclusively from commandRegistry.getAll().
 * - CommandPaletteIndex is opaque (public contract only).
 * - search(index, text) → CommandId[]; no fuzzy/ranking/execution.
 * - No React UI · no production mount · prior UX-6.x APIs frozen.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "paletteStructure"
  | "paletteCatalog"
  | "paletteIndex"
  | "searchContract"
  | "providerContract"
  | "diagnostics"
  | "apiFreeze"
  | "noUI"
  | "noExecution"
  | "tscCompile";

type CaseResult = { block: BlockId; id: string; pass: boolean; detail: string };

const results: CaseResult[] = [];

function assertCase(
  block: BlockId,
  id: string,
  pass: boolean,
  detail: string,
): void {
  results.push({ block, id, pass, detail });
}

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel: string): string {
  return readFileSync(join(repoRoot, rel), "utf8");
}

function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

function walkFiles(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (name === "node_modules" || name === ".next" || name === "dist") {
        continue;
      }
      walkFiles(full, acc);
    } else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(name)) {
      acc.push(full);
    }
  }
  return acc;
}

function extractFunctionBody(src: string, fnName: string): string {
  const re = new RegExp(
    `export\\s+function\\s+${fnName}\\s*\\([^)]*\\)\\s*(?::\\s*[^{]+)?\\{`,
  );
  const m = re.exec(src);
  if (!m || m.index === undefined) return "";
  let i = m.index + m[0].length;
  let depth = 1;
  const start = i;
  while (i < src.length && depth > 0) {
    const ch = src[i];
    if (ch === "{") depth += 1;
    else if (ch === "}") depth -= 1;
    i += 1;
  }
  return src.slice(start, i - 1);
}

function extractReadonlyTypeBody(src: string, typeName: string): string {
  const re = new RegExp(
    `export\\s+type\\s+${typeName}\\s*=\\s*Readonly\\s*<\\s*\\{`,
  );
  const m = re.exec(src);
  if (!m || m.index === undefined) return "";
  let i = m.index + m[0].length;
  let depth = 1;
  const start = i;
  while (i < src.length && depth > 0) {
    const ch = src[i];
    if (ch === "{") depth += 1;
    else if (ch === "}") depth -= 1;
    i += 1;
  }
  return src.slice(start, i - 1);
}

function extractInterfaceBody(src: string, name: string): string {
  const re = new RegExp(`export\\s+interface\\s+${name}\\s*\\{`);
  const m = re.exec(src);
  if (!m || m.index === undefined) return "";
  let i = m.index + m[0].length;
  let depth = 1;
  const start = i;
  while (i < src.length && depth > 0) {
    const ch = src[i];
    if (ch === "{") depth += 1;
    else if (ch === "}") depth -= 1;
    i += 1;
  }
  return src.slice(start, i - 1);
}

const PALETTE_DIR = "src/ui/palette";
const PALETTE_TYPES = `${PALETTE_DIR}/CommandPaletteTypes.ts`;
const PALETTE_DEFINITION = `${PALETTE_DIR}/CommandPaletteDefinition.ts`;
const PALETTE_CATALOG = `${PALETTE_DIR}/CommandPaletteCatalog.ts`;
const PALETTE_INDEX = `${PALETTE_DIR}/CommandPaletteIndex.ts`;
const PALETTE_SEARCH = `${PALETTE_DIR}/CommandPaletteSearch.ts`;
const PALETTE_CONTEXT = `${PALETTE_DIR}/CommandPaletteContext.tsx`;
const PALETTE_PROVIDER = `${PALETTE_DIR}/CommandPaletteProvider.tsx`;
const USE_COMMAND_PALETTE = `${PALETTE_DIR}/useCommandPalette.ts`;
const PALETTE_BRIDGE = `${PALETTE_DIR}/CommandPaletteBridge.tsx`;
const PALETTE_DIAGNOSTICS = `${PALETTE_DIR}/CommandPaletteDiagnostics.ts`;
const PALETTE_BARREL = `${PALETTE_DIR}/index.ts`;

const COMMANDS_DIR = "src/ui/commands";
const COMMAND_DEFINITION = `${COMMANDS_DIR}/CommandDefinition.ts`;
const COMMAND_REGISTRY = `${COMMANDS_DIR}/CommandRegistry.ts`;
const COMMAND_STATE = `${COMMANDS_DIR}/CommandState.ts`;
const COMMAND_CONTEXT = `${COMMANDS_DIR}/CommandContext.tsx`;
const COMMAND_PROVIDER = `${COMMANDS_DIR}/CommandProvider.tsx`;
const USE_COMMANDS = `${COMMANDS_DIR}/useCommands.ts`;
const COMMAND_BRIDGE = `${COMMANDS_DIR}/CommandBridge.tsx`;
const COMMAND_PIPELINE = `${COMMANDS_DIR}/CommandExecutionPipeline.ts`;

const SHORTCUTS_DIR = "src/ui/shortcuts";
const SHORTCUT_DEFINITION = `${SHORTCUTS_DIR}/ShortcutDefinition.ts`;
const SHORTCUT_CONTEXT = `${SHORTCUTS_DIR}/ShortcutContext.tsx`;
const SHORTCUT_PROVIDER = `${SHORTCUTS_DIR}/ShortcutProvider.tsx`;
const USE_SHORTCUTS = `${SHORTCUTS_DIR}/useShortcuts.ts`;
const SHORTCUT_BRIDGE = `${SHORTCUTS_DIR}/ShortcutBridge.tsx`;
const SHORTCUT_RESOLVER = `${SHORTCUTS_DIR}/ShortcutResolver.ts`;

const UI_INDEX = "src/ui/index.ts";
const ROADMAP_6 = "docs/UX/UX-6.0-roadmap.md";
const DOC_6_5 = "docs/UX/UX-6.5.md";
const PACKAGE_JSON = "package.json";

const PURE_PALETTE_MODULES = [
  PALETTE_TYPES,
  PALETTE_DEFINITION,
  PALETTE_CATALOG,
  PALETTE_INDEX,
  PALETTE_SEARCH,
  PALETTE_DIAGNOSTICS,
  PALETTE_BARREL,
] as const;

const REACT_PALETTE_MODULES = [
  PALETTE_CONTEXT,
  PALETTE_PROVIDER,
  USE_COMMAND_PALETTE,
  PALETTE_BRIDGE,
] as const;

const FORBIDDEN_UI = [
  /\bModal\b/,
  /\bOverlay\b/,
  /\bDialog\b/,
  /\bFloating\b/,
  /\bTextBox\b/,
  /\b<input\b/i,
  /\btextarea\b/i,
  /\bfocus\(/i,
  /\bautoFocus\b/,
  /\bonKeyDown\b/,
  /\bKeyboardEvent\b/,
];

const FORBIDDEN_EXEC = [
  /\bhandler\b/i,
  /\bcallback\b/i,
  /\bonClick\b/,
  /\bpreventDefault\b/,
  /\bstopPropagation\b/,
  /\bpipeline\.dispatch\b/,
  /\bCommandExecutionPipeline\b/,
];

const FORBIDDEN_BROWSER = [
  /\bwindow\b/,
  /\bdocument\b/,
  /\bKeyboardEvent\b/,
  /\baddEventListener\b/,
  /\bremoveEventListener\b/,
  /\bonKeyDown\b/,
];

/* -------------------------------------------------------------------------- */
/* PASS 01 — paletteStructure                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "paletteStructure";

  for (const [id, rel] of [
    ["exists.CommandPaletteTypes", PALETTE_TYPES],
    ["exists.CommandPaletteDefinition", PALETTE_DEFINITION],
    ["exists.CommandPaletteCatalog", PALETTE_CATALOG],
    ["exists.CommandPaletteIndex", PALETTE_INDEX],
    ["exists.CommandPaletteSearch", PALETTE_SEARCH],
    ["exists.CommandPaletteContext", PALETTE_CONTEXT],
    ["exists.CommandPaletteProvider", PALETTE_PROVIDER],
    ["exists.useCommandPalette", USE_COMMAND_PALETTE],
    ["exists.CommandPaletteBridge", PALETTE_BRIDGE],
    ["exists.CommandPaletteDiagnostics", PALETTE_DIAGNOSTICS],
    ["exists.index", PALETTE_BARREL],
    ["exists.doc", DOC_6_5],
    ["exists.roadmap", ROADMAP_6],
  ] as const) {
    assertCase(block, id, existsSync(join(repoRoot, rel)), `${rel} exists`);
  }

  const pkg = existsSync(join(repoRoot, PACKAGE_JSON))
    ? read(PACKAGE_JSON)
    : "";
  assertCase(
    block,
    "exists.npmScript",
    /"validate:ux-6\.5"\s*:/.test(pkg),
    "package.json has validate:ux-6.5",
  );

  const paletteDir = join(repoRoot, PALETTE_DIR);
  const nestedDirs =
    existsSync(paletteDir) &&
    readdirSync(paletteDir).some((name) =>
      statSync(join(paletteDir, name)).isDirectory(),
    );
  assertCase(
    block,
    "structure.flat",
    !nestedDirs,
    "src/ui/palette/ remains flat (no nested folders)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — paletteCatalog                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "paletteCatalog";

  const catalogSrc = existsSync(join(repoRoot, PALETTE_CATALOG))
    ? stripComments(read(PALETTE_CATALOG))
    : "";
  const catalogBody = extractFunctionBody(
    catalogSrc,
    "createCommandPaletteCatalog",
  );
  const defSrc = existsSync(join(repoRoot, PALETTE_DEFINITION))
    ? stripComments(read(PALETTE_DEFINITION))
    : "";
  const defBody = extractReadonlyTypeBody(defSrc, "CommandPaletteDefinition");

  assertCase(
    block,
    "catalog.create",
    /export\s+function\s+createCommandPaletteCatalog\s*\(/.test(catalogSrc),
    "createCommandPaletteCatalog exported",
  );
  assertCase(
    block,
    "catalog.usesGetAll",
    /\.getAll\s*\(/.test(catalogBody),
    "Catalog projects from registry.getAll()",
  );
  assertCase(
    block,
    "catalog.noSeed",
    !/PALETTE_CATALOG|COMMAND_PALETTE_SEED|SEED_CATALOG/.test(catalogSrc) &&
      !/asCommandId\s*\(/.test(catalogSrc),
    "No parallel palette seed catalog",
  );
  assertCase(
    block,
    "definition.commandIdOnly",
    /\bcommandId\b/.test(defBody) &&
      !/\bkeywords\b/.test(defBody) &&
      !/\bexecute\b/.test(defBody) &&
      !/\bcallback\b/.test(defBody) &&
      !/\bhandler\b/.test(defBody) &&
      !/\bicon\b/.test(defBody) &&
      !/\bgroup\b/.test(defBody) &&
      !/\bcategory\b/.test(defBody) &&
      !/\bscore\b/.test(defBody) &&
      !/\branking\b/.test(defBody) &&
      !/\bhistory\b/.test(defBody) &&
      !/\bfavorite\b/.test(defBody),
    "CommandPaletteDefinition = { commandId } only",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — paletteIndex                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "paletteIndex";

  const indexSrc = existsSync(join(repoRoot, PALETTE_INDEX))
    ? stripComments(read(PALETTE_INDEX))
    : "";
  const indexType = extractReadonlyTypeBody(indexSrc, "CommandPaletteIndex");
  const createBody = extractFunctionBody(indexSrc, "createCommandPaletteIndex");

  assertCase(
    block,
    "index.type",
    /export\s+type\s+CommandPaletteIndex\s*=/.test(indexSrc),
    "CommandPaletteIndex type exported",
  );
  assertCase(
    block,
    "index.opaqueBrand",
    /__brand/.test(indexType) &&
      /CommandPaletteIndex/.test(indexType) &&
      !/\btokens\b/.test(indexType) &&
      !/\bmap\b/i.test(indexType) &&
      !/\blookup\b/.test(indexType) &&
      !/\bhaystacks\b/.test(indexType) &&
      !/\bkeywords\b/.test(indexType),
    "CommandPaletteIndex is opaque (brand only; no internal fields)",
  );
  assertCase(
    block,
    "index.create",
    /export\s+function\s+createCommandPaletteIndex\s*\(/.test(indexSrc),
    "createCommandPaletteIndex exported",
  );
  assertCase(
    block,
    "index.weakMapPrivate",
    /WeakMap/.test(indexSrc) && /indexStore|WeakMap/.test(createBody),
    "Index internals stored privately (WeakMap)",
  );
  assertCase(
    block,
    "index.derivesKeywords",
    /split\s*\(\s*["']\.["']\s*\)/.test(indexSrc) ||
      /deriveKeywords/.test(indexSrc),
    "Index derives keywords from commandId at build time",
  );
  assertCase(
    block,
    "index.reactFree",
    !/\bfrom\s+["']react["']/.test(indexSrc) && !/"use client"/.test(indexSrc),
    "Index module remains React-free",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — searchContract                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "searchContract";

  const searchSrc = existsSync(join(repoRoot, PALETTE_SEARCH))
    ? stripComments(read(PALETTE_SEARCH))
    : "";
  const searchBody = extractFunctionBody(searchSrc, "search");

  assertCase(
    block,
    "search.export",
    /export\s+function\s+search\s*\(/.test(searchSrc),
    "search() exported",
  );
  assertCase(
    block,
    "search.signature",
    /CommandPaletteIndex/.test(searchSrc) &&
      /readonly\s+CommandId\s*\[\]/.test(searchSrc),
    "search(index, text): readonly CommandId[]",
  );
  assertCase(
    block,
    "search.trim",
    /\.trim\s*\(/.test(searchBody),
    "Search trims query text",
  );
  assertCase(
    block,
    "search.usesOpaqueHelpers",
    /getCommandPaletteIndexEntries|matchCommandPaletteIndex/.test(searchBody),
    "Search uses Index public helpers",
  );
  assertCase(
    block,
    "search.noInternalAccess",
    !/\.tokens\b/.test(searchBody) &&
      !/\.map\b/.test(searchBody) &&
      !/\.lookup\b/.test(searchBody) &&
      !/\.haystacks\b/.test(searchBody) &&
      !/indexStore/.test(searchBody) &&
      !/WeakMap/.test(searchSrc),
    "Search never accesses Index internals",
  );
  assertCase(
    block,
    "search.noFuzzyRank",
    !/\bfuzzy\b/i.test(searchSrc) &&
      !/\branking\b/i.test(searchSrc) &&
      !/\bscore\b/i.test(searchSrc) &&
      !/\bMRU\b/.test(searchSrc) &&
      !/\bhistory\b/i.test(searchSrc) &&
      !/\bfavorite\b/i.test(searchSrc),
    "No fuzzy/ranking/score/MRU/history APIs",
  );
  assertCase(
    block,
    "search.reactFree",
    !/\bfrom\s+["']react["']/.test(searchSrc) && !/"use client"/.test(searchSrc),
    "Search remains React-free",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — providerContract                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "providerContract";

  const ctxSrc = existsSync(join(repoRoot, PALETTE_CONTEXT))
    ? stripComments(read(PALETTE_CONTEXT))
    : "";
  const ctxBody = extractReadonlyTypeBody(ctxSrc, "CommandPaletteContextValue");
  assertCase(
    block,
    "context.value",
    /\bindex\b/.test(ctxBody) &&
      !/\btokens\b/.test(ctxBody) &&
      !/\bsearch\b/.test(ctxBody) &&
      !/\bdispatch\b/.test(ctxBody),
    "CommandPaletteContextValue = { index } only",
  );

  const providerSrc = existsSync(join(repoRoot, PALETTE_PROVIDER))
    ? stripComments(read(PALETTE_PROVIDER))
    : "";
  const providerBody = extractFunctionBody(
    providerSrc,
    "CommandPaletteProvider",
  );
  assertCase(
    block,
    "provider.useRef",
    /useRef/.test(providerBody),
    "Provider holds index via useRef",
  );
  assertCase(
    block,
    "provider.buildsCatalogIndex",
    /createCommandPaletteCatalog/.test(providerBody) &&
      /createCommandPaletteIndex/.test(providerBody),
    "Provider builds catalog + index",
  );
  assertCase(
    block,
    "provider.exposesIndexOnly",
    /index\s*:/.test(providerBody) && !/\btokens\b/.test(providerBody),
    "Provider exposes opaque index only",
  );
  assertCase(
    block,
    "provider.noUseState",
    !/\buseState\b/.test(providerBody) && !/\buseReducer\b/.test(providerBody),
    "Provider has no useState/useReducer",
  );

  const hookSrc = existsSync(join(repoRoot, USE_COMMAND_PALETTE))
    ? stripComments(read(USE_COMMAND_PALETTE))
    : "";
  const hookBody = extractFunctionBody(hookSrc, "useCommandPalette");
  assertCase(
    block,
    "hook.readOnly",
    /useContext\s*\(\s*CommandPaletteContext\s*\)/.test(hookBody) &&
      /throw\s+new\s+Error/.test(hookBody),
    "useCommandPalette is read-only and throws outside Provider",
  );

  const bridgeSrc = existsSync(join(repoRoot, PALETTE_BRIDGE))
    ? stripComments(read(PALETTE_BRIDGE))
    : "";
  const bridgeBody = extractFunctionBody(bridgeSrc, "CommandPaletteBridge");
  assertCase(
    block,
    "bridge.passThrough",
    /useCommandPalette\s*\(/.test(bridgeBody) &&
      (/return\s+<>\s*\{\s*children\s*\}\s*<\/>/.test(bridgeBody) ||
        /return\s+children/.test(bridgeBody)) &&
      !/\bsearch\b/.test(bridgeBody) &&
      !/\bdispatch\b/.test(bridgeBody),
    "CommandPaletteBridge remains pass-through",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — diagnostics                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "diagnostics";

  const diagSrc = existsSync(join(repoRoot, PALETTE_DIAGNOSTICS))
    ? stripComments(read(PALETTE_DIAGNOSTICS))
    : "";
  const reportBody = extractReadonlyTypeBody(
    diagSrc,
    "CommandPaletteDiagnosticsReport",
  );

  assertCase(
    block,
    "diag.report",
    /export\s+type\s+CommandPaletteDiagnosticsReport\s*=/.test(diagSrc),
    "CommandPaletteDiagnosticsReport type exported",
  );
  assertCase(
    block,
    "diag.create",
    /export\s+function\s+createCommandPaletteDiagnosticsReport\s*\(/.test(
      diagSrc,
    ),
    "createCommandPaletteDiagnosticsReport exported",
  );
  assertCase(
    block,
    "diag.entries",
    /\bentries\b/.test(reportBody),
    "Report has entries",
  );
  assertCase(
    block,
    "diag.keywords",
    /\bkeywords\b/.test(reportBody),
    "Report has keywords",
  );
  assertCase(
    block,
    "diag.duplicatedKeywords",
    /\bduplicatedKeywords\b/.test(reportBody),
    "Report has duplicatedKeywords",
  );
  assertCase(
    block,
    "diag.orphanEntries",
    /\borphanEntries\b/.test(reportBody),
    "Report has orphanEntries",
  );
  assertCase(
    block,
    "diag.noClass",
    !/\bclass\b/.test(diagSrc),
    "Diagnostics is not a class",
  );
  assertCase(
    block,
    "diag.reactFree",
    !/\bfrom\s+["']react["']/.test(diagSrc) && !/"use client"/.test(diagSrc),
    "Diagnostics remains React-free",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — apiFreeze                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "apiFreeze";

  const defSrc = existsSync(join(repoRoot, PALETTE_DEFINITION))
    ? stripComments(read(PALETTE_DEFINITION))
    : "";
  const defBody = extractReadonlyTypeBody(defSrc, "CommandPaletteDefinition");
  assertCase(
    block,
    "freeze.paletteDefinition",
    /\bcommandId\b/.test(defBody) && !/\bkeywords\b/.test(defBody),
    "CommandPaletteDefinition freeze = { commandId }",
  );

  const indexSrc = existsSync(join(repoRoot, PALETTE_INDEX))
    ? stripComments(read(PALETTE_INDEX))
    : "";
  const indexType = extractReadonlyTypeBody(indexSrc, "CommandPaletteIndex");
  assertCase(
    block,
    "freeze.paletteIndexApi",
    /__brand/.test(indexType) &&
      /export\s+function\s+createCommandPaletteIndex\s*\(/.test(indexSrc),
    "CommandPaletteIndex public API frozen (opaque + factory)",
  );

  const searchSrc = existsSync(join(repoRoot, PALETTE_SEARCH))
    ? stripComments(read(PALETTE_SEARCH))
    : "";
  assertCase(
    block,
    "freeze.searchApi",
    /export\s+function\s+search\s*\(/.test(searchSrc),
    "Search API frozen",
  );

  // Prior Commands contracts remain intact.
  const cmdDef = existsSync(join(repoRoot, COMMAND_DEFINITION))
    ? stripComments(read(COMMAND_DEFINITION))
    : "";
  const cmdDefBody = extractReadonlyTypeBody(cmdDef, "CommandDefinition");
  assertCase(
    block,
    "freeze.commandDefinition",
    /\bid\b/.test(cmdDefBody) &&
      !/\benabled\b/.test(cmdDefBody) &&
      !/\bexecute\b/.test(cmdDefBody),
    "CommandDefinition remains { id }",
  );

  const cmdReg = existsSync(join(repoRoot, COMMAND_REGISTRY))
    ? stripComments(read(COMMAND_REGISTRY))
    : "";
  const cmdRegBody = extractInterfaceBody(cmdReg, "CommandRegistryApi");
  assertCase(
    block,
    "freeze.commandRegistryApi",
    /\bget\s*\(/.test(cmdRegBody) &&
      /\bhas\s*\(/.test(cmdRegBody) &&
      /\bsize\s*\(/.test(cmdRegBody) &&
      /\bgetAll\s*\(/.test(cmdRegBody) &&
      !/\bregister\b/.test(cmdRegBody) &&
      !/\bdispatch\b/.test(cmdRegBody),
    "CommandRegistryApi remains query-only",
  );

  const cmdState = existsSync(join(repoRoot, COMMAND_STATE))
    ? stripComments(read(COMMAND_STATE))
    : "";
  const cmdStateBody = extractReadonlyTypeBody(cmdState, "CommandState");
  assertCase(
    block,
    "freeze.commandState",
    /\bid\b/.test(cmdStateBody) &&
      /\benabled\b/.test(cmdStateBody) &&
      /\bvisible\b/.test(cmdStateBody),
    "CommandState remains { id, enabled, visible }",
  );

  const cmdCtx = existsSync(join(repoRoot, COMMAND_CONTEXT))
    ? stripComments(read(COMMAND_CONTEXT))
    : "";
  const cmdCtxBody = extractReadonlyTypeBody(cmdCtx, "CommandContextValue");
  assertCase(
    block,
    "freeze.commandContext",
    /\bregistry\b/.test(cmdCtxBody) &&
      /\bstates\b/.test(cmdCtxBody) &&
      !/\bpipeline\b/.test(cmdCtxBody),
    "CommandContextValue remains { registry, states }",
  );

  assertCase(
    block,
    "freeze.commandPipelineExists",
    existsSync(join(repoRoot, COMMAND_PIPELINE)),
    "CommandExecutionPipeline file intact",
  );
  assertCase(
    block,
    "freeze.commandProviderExists",
    existsSync(join(repoRoot, COMMAND_PROVIDER)),
    "CommandProvider file intact",
  );
  assertCase(
    block,
    "freeze.useCommandsExists",
    existsSync(join(repoRoot, USE_COMMANDS)),
    "useCommands file intact",
  );
  assertCase(
    block,
    "freeze.commandBridgeExists",
    existsSync(join(repoRoot, COMMAND_BRIDGE)),
    "CommandBridge file intact",
  );

  // Prior Shortcuts contracts remain intact.
  const scDef = existsSync(join(repoRoot, SHORTCUT_DEFINITION))
    ? stripComments(read(SHORTCUT_DEFINITION))
    : "";
  const scDefBody = extractReadonlyTypeBody(scDef, "ShortcutDefinition");
  assertCase(
    block,
    "freeze.shortcutDefinition",
    /\bid\b/.test(scDefBody) &&
      /\bkey\b/.test(scDefBody) &&
      /\bcommandId\b/.test(scDefBody),
    "ShortcutDefinition remains { id, key, commandId }",
  );

  const scCtx = existsSync(join(repoRoot, SHORTCUT_CONTEXT))
    ? stripComments(read(SHORTCUT_CONTEXT))
    : "";
  const scCtxBody = extractReadonlyTypeBody(scCtx, "ShortcutContextValue");
  assertCase(
    block,
    "freeze.shortcutContext",
    /\bregistry\b/.test(scCtxBody) && !/\bresolver\b/.test(scCtxBody),
    "ShortcutContextValue remains { registry }",
  );

  assertCase(
    block,
    "freeze.shortcutProviderExists",
    existsSync(join(repoRoot, SHORTCUT_PROVIDER)),
    "ShortcutProvider file intact",
  );
  assertCase(
    block,
    "freeze.useShortcutsExists",
    existsSync(join(repoRoot, USE_SHORTCUTS)),
    "useShortcuts file intact",
  );
  assertCase(
    block,
    "freeze.shortcutBridgeExists",
    existsSync(join(repoRoot, SHORTCUT_BRIDGE)),
    "ShortcutBridge file intact",
  );
  assertCase(
    block,
    "freeze.shortcutResolverExists",
    existsSync(join(repoRoot, SHORTCUT_RESOLVER)),
    "ShortcutResolver file intact",
  );

  const uiIndex = existsSync(join(repoRoot, UI_INDEX))
    ? stripComments(read(UI_INDEX))
    : "";
  assertCase(
    block,
    "freeze.publicBarrelIntact",
    !/\bpalette\b/.test(uiIndex) &&
      !/CommandPaletteProvider/.test(uiIndex) &&
      !/useCommandPalette/.test(uiIndex) &&
      !/\bshortcuts\b/.test(uiIndex) &&
      !/ShortcutProvider/.test(uiIndex) &&
      !/\bcommands\b/.test(uiIndex) &&
      !/CommandProvider/.test(uiIndex),
    "src/ui/index.ts does not export palette, shortcuts, or commands",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — noUI                                                             */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noUI";

  const paletteFiles = walkFiles(join(repoRoot, PALETTE_DIR));
  let hasForbiddenUi = false;
  let hasForbiddenBrowser = false;

  for (const full of paletteFiles) {
    const src = stripComments(readFileSync(full, "utf8"));
    for (const re of FORBIDDEN_UI) {
      if (re.test(src)) {
        hasForbiddenUi = true;
      }
    }
    for (const re of FORBIDDEN_BROWSER) {
      if (re.test(src)) {
        hasForbiddenBrowser = true;
      }
    }
  }

  assertCase(
    block,
    "ui.noChrome",
    !hasForbiddenUi,
    "No Modal/Overlay/Dialog/Input/Focus chrome under palette/",
  );
  assertCase(
    block,
    "ui.noBrowserApis",
    !hasForbiddenBrowser,
    "No window/document/KeyboardEvent under palette/",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — noExecution                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noExecution";

  const paletteFiles = walkFiles(join(repoRoot, PALETTE_DIR));
  let hasForbiddenExec = false;
  let hasExecuteMethod = false;
  let pureHasReact = false;

  for (const full of paletteFiles) {
    const rel = relative(repoRoot, full).replace(/\\/g, "/");
    const raw = readFileSync(full, "utf8");
    const src = stripComments(raw);

    for (const re of FORBIDDEN_EXEC) {
      if (re.test(src)) {
        hasForbiddenExec = true;
      }
    }

    if (/\.execute\s*\(/.test(src) || /\bfunction\s+execute\s*\(/.test(src)) {
      hasExecuteMethod = true;
    }

    if ((PURE_PALETTE_MODULES as readonly string[]).includes(rel)) {
      if (/\bfrom\s+["']react["']/.test(src) || /"use client"/.test(raw)) {
        pureHasReact = true;
      }
    }
  }

  assertCase(
    block,
    "exec.noHandlerCallbackPipeline",
    !hasForbiddenExec,
    "No handler/callback/preventDefault/pipeline.dispatch under palette/",
  );
  assertCase(
    block,
    "exec.noExecuteMethod",
    !hasExecuteMethod,
    "No execute() under palette/",
  );
  assertCase(
    block,
    "exec.pureModulesReactFree",
    !pureHasReact,
    "Pure palette modules remain React-free",
  );

  for (const rel of REACT_PALETTE_MODULES) {
    const raw = existsSync(join(repoRoot, rel)) ? read(rel) : "";
    assertCase(
      block,
      `exec.reactAllowed.${rel.split("/").pop()}`,
      /"use client"/.test(raw),
      `${rel} is a client React module`,
    );
  }

  const srcRoot = join(repoRoot, "src");
  const allSrc = walkFiles(srcRoot);
  let productWire = false;
  for (const full of allSrc) {
    const rel = relative(repoRoot, full).replace(/\\/g, "/");
    if (rel.startsWith("src/ui/palette/")) continue;
    const src = stripComments(readFileSync(full, "utf8"));
    if (
      /CommandPaletteProvider/.test(src) ||
      /CommandPaletteBridge/.test(src) ||
      /from\s+["']@\/ui\/palette/.test(src) ||
      /from\s+["']\.\.?\/.*palette/.test(src)
    ) {
      productWire = true;
      break;
    }
  }

  assertCase(
    block,
    "exec.noProductionMount",
    !productWire,
    "No CommandPaletteProvider/Bridge import outside src/ui/palette/",
  );

  const doc = existsSync(join(repoRoot, DOC_6_5)) ? read(DOC_6_5) : "";
  assertCase(
    block,
    "exec.docNoProduction",
    /NO production mount/i.test(doc) || /sin montaje en producción/i.test(doc),
    "UX-6.5.md documents no production mount",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — tscCompile                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "tscCompile";

  const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
    timeout: 120_000,
  });

  assertCase(
    block,
    "tsc.exit0",
    tsc.status === 0,
    tsc.status === 0
      ? "tsc --noEmit exit 0"
      : `tsc failed: ${(tsc.stdout || tsc.stderr || "").slice(0, 500)}`,
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const BLOCKS: { id: BlockId; ca: string }[] = [
  { id: "paletteStructure", ca: "CA-UX-6.5.1" },
  { id: "paletteCatalog", ca: "CA-UX-6.5.2" },
  { id: "paletteIndex", ca: "CA-UX-6.5.3" },
  { id: "searchContract", ca: "CA-UX-6.5.4" },
  { id: "providerContract", ca: "CA-UX-6.5.5" },
  { id: "diagnostics", ca: "CA-UX-6.5.6" },
  { id: "apiFreeze", ca: "CA-UX-6.5.7" },
  { id: "noUI", ca: "CA-UX-6.5.8" },
  { id: "noExecution", ca: "CA-UX-6.5.9" },
  { id: "tscCompile", ca: "CA-UX-6.5.10" },
];

let passCount = 0;
for (const [i, b] of BLOCKS.entries()) {
  const cases = results.filter((r) => r.block === b.id);
  const ok = cases.length > 0 && cases.every((c) => c.pass);
  if (ok) passCount += 1;
  const label = `PASS ${String(i + 1).padStart(2, "0")} ${b.id}`;
  console.log(`${label} .... ${ok ? "PASS" : "FAIL"} (${b.ca})`);
  if (!ok) {
    for (const c of cases.filter((x) => !x.pass)) {
      console.log(`  ✗ ${c.id}: ${c.detail}`);
    }
  }
}

console.log(`${passCount}/${BLOCKS.length}`);
process.exit(passCount === BLOCKS.length ? 0 : 1);
