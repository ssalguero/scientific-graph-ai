/**
 * UX-6.7 — Toolbar Foundation gate.
 *
 * Blocks:
 * toolbarStructure · toolbarCatalog · toolbarBuilder · toolbarContract
 * providerContract · diagnostics · apiFreeze · noUI
 * noExecution · tscCompile
 *
 * Architectural principles:
 * - Toolbar references CommandId only; commandRegistry remains SSOT.
 * - Toolbar is opaque (public brand only); read helpers are package-internal.
 * - Builder: validate → freeze → preserve order → seal.
 * - No React UI · no production mount · prior UX-6.x APIs frozen.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "toolbarStructure"
  | "toolbarCatalog"
  | "toolbarBuilder"
  | "toolbarContract"
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

const TOOLBAR_DIR = "src/ui/toolbar";
const TOOLBAR_TYPES = `${TOOLBAR_DIR}/ToolbarTypes.ts`;
const TOOLBAR_DEFINITION = `${TOOLBAR_DIR}/ToolbarDefinition.ts`;
const TOOLBAR_CATALOG = `${TOOLBAR_DIR}/ToolbarCatalog.ts`;
const TOOLBAR = `${TOOLBAR_DIR}/Toolbar.ts`;
const TOOLBAR_BUILDER = `${TOOLBAR_DIR}/ToolbarBuilder.ts`;
const TOOLBAR_CONTEXT = `${TOOLBAR_DIR}/ToolbarContext.tsx`;
const TOOLBAR_PROVIDER = `${TOOLBAR_DIR}/ToolbarProvider.tsx`;
const USE_TOOLBAR = `${TOOLBAR_DIR}/useToolbar.ts`;
const TOOLBAR_BRIDGE = `${TOOLBAR_DIR}/ToolbarBridge.tsx`;
const TOOLBAR_DIAGNOSTICS = `${TOOLBAR_DIR}/ToolbarDiagnostics.ts`;
const TOOLBAR_BARREL = `${TOOLBAR_DIR}/index.ts`;

const MENUS_DIR = "src/ui/menus";
const MENU_DEFINITION = `${MENUS_DIR}/MenuDefinition.ts`;
const MENU_TREE = `${MENUS_DIR}/MenuTree.ts`;
const MENU_PROVIDER = `${MENUS_DIR}/MenuProvider.tsx`;
const USE_MENUS = `${MENUS_DIR}/useMenus.ts`;
const MENU_BRIDGE = `${MENUS_DIR}/MenuBridge.tsx`;
const MENU_DIAGNOSTICS = `${MENUS_DIR}/MenuDiagnostics.ts`;

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

const PALETTE_DIR = "src/ui/palette";
const PALETTE_DEFINITION = `${PALETTE_DIR}/CommandPaletteDefinition.ts`;
const PALETTE_INDEX = `${PALETTE_DIR}/CommandPaletteIndex.ts`;
const PALETTE_SEARCH = `${PALETTE_DIR}/CommandPaletteSearch.ts`;
const PALETTE_CONTEXT = `${PALETTE_DIR}/CommandPaletteContext.tsx`;
const PALETTE_PROVIDER = `${PALETTE_DIR}/CommandPaletteProvider.tsx`;
const USE_COMMAND_PALETTE = `${PALETTE_DIR}/useCommandPalette.ts`;
const PALETTE_BRIDGE = `${PALETTE_DIR}/CommandPaletteBridge.tsx`;

const UI_INDEX = "src/ui/index.ts";
const ROADMAP_6 = "docs/UX/UX-6.0-roadmap.md";
const DOC_6_7 = "docs/UX/UX-6.7.md";
const PACKAGE_JSON = "package.json";

const PURE_TOOLBAR_MODULES = [
  TOOLBAR_TYPES,
  TOOLBAR_DEFINITION,
  TOOLBAR_CATALOG,
  TOOLBAR,
  TOOLBAR_BUILDER,
  TOOLBAR_DIAGNOSTICS,
  TOOLBAR_BARREL,
] as const;

const REACT_TOOLBAR_MODULES = [
  TOOLBAR_CONTEXT,
  TOOLBAR_PROVIDER,
  USE_TOOLBAR,
  TOOLBAR_BRIDGE,
] as const;

const FORBIDDEN_UI = [
  /\bMenubar\b/,
  /\bDropdown\b/,
  /\bFloating\b/,
  /\bHover\b/,
  /\bAdaptiveToolbar\b/,
  /\bModal\b/,
  /\bOverlay\b/,
  /\bDialog\b/,
  /\bSeparator\b/,
  /\bOverflow\b/,
  /\b<button\b/i,
  /\b<input\b/i,
  /\btextarea\b/i,
  /\bfocus\(/i,
  /\bautoFocus\b/,
  /\bonClick\b/,
  /\bonMouse\w+\b/,
  /\bonKeyDown\b/,
  /\bKeyboardEvent\b/,
];

const FORBIDDEN_EXEC = [
  /\bhandler\b/i,
  /\bcallback\b/i,
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
/* PASS 01 — toolbarStructure                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "toolbarStructure";

  for (const [id, rel] of [
    ["exists.ToolbarTypes", TOOLBAR_TYPES],
    ["exists.ToolbarDefinition", TOOLBAR_DEFINITION],
    ["exists.ToolbarCatalog", TOOLBAR_CATALOG],
    ["exists.Toolbar", TOOLBAR],
    ["exists.ToolbarBuilder", TOOLBAR_BUILDER],
    ["exists.ToolbarContext", TOOLBAR_CONTEXT],
    ["exists.ToolbarProvider", TOOLBAR_PROVIDER],
    ["exists.useToolbar", USE_TOOLBAR],
    ["exists.ToolbarBridge", TOOLBAR_BRIDGE],
    ["exists.ToolbarDiagnostics", TOOLBAR_DIAGNOSTICS],
    ["exists.index", TOOLBAR_BARREL],
    ["exists.doc", DOC_6_7],
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
    /"validate:ux-6\.7"\s*:/.test(pkg),
    "package.json has validate:ux-6.7",
  );

  const toolbarDir = join(repoRoot, TOOLBAR_DIR);
  const nestedDirs =
    existsSync(toolbarDir) &&
    readdirSync(toolbarDir).some((name) =>
      statSync(join(toolbarDir, name)).isDirectory(),
    );
  assertCase(
    block,
    "structure.flat",
    !nestedDirs,
    "src/ui/toolbar/ remains flat (no nested folders)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — toolbarCatalog                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "toolbarCatalog";

  const catalogSrc = existsSync(join(repoRoot, TOOLBAR_CATALOG))
    ? stripComments(read(TOOLBAR_CATALOG))
    : "";
  const defSrc = existsSync(join(repoRoot, TOOLBAR_DEFINITION))
    ? stripComments(read(TOOLBAR_DEFINITION))
    : "";
  const defBody = extractReadonlyTypeBody(defSrc, "ToolbarDefinition");
  const itemBody = extractReadonlyTypeBody(defSrc, "ToolbarItem");

  assertCase(
    block,
    "catalog.export",
    /export\s+const\s+TOOLBAR_CATALOG\b/.test(catalogSrc),
    "TOOLBAR_CATALOG exported",
  );
  assertCase(
    block,
    "catalog.primary",
    /toolbar\.primary/.test(catalogSrc),
    "Catalog includes Primary toolbar (toolbar.primary)",
  );
  assertCase(
    block,
    "catalog.system.catalog",
    /system\.catalog/.test(catalogSrc),
    "Catalog references system.catalog",
  );
  assertCase(
    block,
    "catalog.system.diagnostics",
    /system\.diagnostics/.test(catalogSrc),
    "Catalog references system.diagnostics",
  );
  assertCase(
    block,
    "catalog.system.ping",
    /system\.ping/.test(catalogSrc),
    "Catalog references system.ping",
  );
  assertCase(
    block,
    "catalog.noHandlers",
    !/\bhandler\b/i.test(catalogSrc) &&
      !/\bcallback\b/i.test(catalogSrc) &&
      !/\bexecute\b/i.test(catalogSrc),
    "Catalog has no handlers/callbacks/execute",
  );
  assertCase(
    block,
    "definition.shape",
    /\bid\b/.test(defBody) &&
      /\bitems\b/.test(defBody) &&
      !/\btitle\b/.test(defBody) &&
      !/\bhandler\b/.test(defBody) &&
      !/\bcallback\b/.test(defBody) &&
      !/\bexecute\b/.test(defBody) &&
      !/\benabled\b/.test(defBody) &&
      !/\bvisible\b/.test(defBody) &&
      !/\bicon\b/.test(defBody) &&
      !/\btooltip\b/.test(defBody) &&
      !/\bseparator\b/.test(defBody) &&
      !/\bgroup\b/.test(defBody) &&
      !/\boverflow\b/.test(defBody) &&
      !/\bpriority\b/.test(defBody),
    "ToolbarDefinition = { id, items } only",
  );
  assertCase(
    block,
    "item.commandIdOnly",
    /\bcommandId\b/.test(itemBody) &&
      !/\bhandler\b/.test(itemBody) &&
      !/\bcallback\b/.test(itemBody) &&
      !/\bexecute\b/.test(itemBody) &&
      !/\benabled\b/.test(itemBody) &&
      !/\bvisible\b/.test(itemBody) &&
      !/\bicon\b/.test(itemBody),
    "ToolbarItem = { commandId } only",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — toolbarBuilder                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "toolbarBuilder";

  const builderSrc = existsSync(join(repoRoot, TOOLBAR_BUILDER))
    ? stripComments(read(TOOLBAR_BUILDER))
    : "";
  const buildBody = extractFunctionBody(builderSrc, "buildToolbar");

  assertCase(
    block,
    "builder.export",
    /export\s+function\s+buildToolbar\s*\(/.test(builderSrc),
    "buildToolbar exported",
  );
  assertCase(
    block,
    "builder.usesCatalog",
    /TOOLBAR_CATALOG/.test(builderSrc),
    "Builder consumes TOOLBAR_CATALOG",
  );
  assertCase(
    block,
    "builder.validateDuplicateToolbarId",
    /Duplicate ToolbarId|seenToolbarIds|duplicate.*ToolbarId/i.test(
      buildBody,
    ) && /throw\s+new\s+Error/.test(buildBody),
    "Builder throws on duplicate ToolbarId",
  );
  assertCase(
    block,
    "builder.validateEmptyCatalog",
    (/catalog\.length\s*===\s*0|must not be empty/i.test(buildBody) ||
      /Empty catalog/i.test(buildBody)) &&
      /throw\s+new\s+Error/.test(buildBody),
    "Builder throws on empty catalog",
  );
  assertCase(
    block,
    "builder.validateEmptyItems",
    (/items\.length\s*===\s*0|Empty items/i.test(buildBody)) &&
      /throw\s+new\s+Error/.test(buildBody),
    "Builder throws on empty items",
  );
  assertCase(
    block,
    "builder.recordsDuplicatedItems",
    /duplicatedItems/.test(buildBody),
    "Builder records duplicatedItems on the toolbar",
  );
  assertCase(
    block,
    "builder.seals",
    /sealToolbar/.test(buildBody),
    "Builder seals opaque Toolbar",
  );
  assertCase(
    block,
    "builder.noSort",
    !/\.sort\s*\(/.test(buildBody),
    "Builder does not sort catalog order",
  );
  assertCase(
    block,
    "builder.reactFree",
    !/\bfrom\s+["']react["']/.test(builderSrc) &&
      !/"use client"/.test(builderSrc),
    "Builder remains React-free",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — toolbarContract                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "toolbarContract";

  const toolbarSrc = existsSync(join(repoRoot, TOOLBAR))
    ? stripComments(read(TOOLBAR))
    : "";
  const toolbarType = extractReadonlyTypeBody(toolbarSrc, "Toolbar");
  const barrelSrc = existsSync(join(repoRoot, TOOLBAR_BARREL))
    ? stripComments(read(TOOLBAR_BARREL))
    : "";

  assertCase(
    block,
    "toolbar.type",
    /export\s+type\s+Toolbar\s*=/.test(toolbarSrc),
    "Toolbar type exported",
  );
  assertCase(
    block,
    "toolbar.opaqueBrand",
    /__brand/.test(toolbarType) &&
      /Toolbar/.test(toolbarType) &&
      !/\btoolbars\b/.test(toolbarType) &&
      !/\bitems\b/.test(toolbarType) &&
      !/\bduplicatedItems\b/.test(toolbarType) &&
      !/\bmap\b/i.test(toolbarType),
    "Toolbar is opaque (brand only; no internal fields)",
  );
  assertCase(
    block,
    "toolbar.weakMapPrivate",
    /WeakMap/.test(toolbarSrc) && /toolbarStore|WeakMap/.test(toolbarSrc),
    "Toolbar internals stored privately (WeakMap)",
  );
  assertCase(
    block,
    "toolbar.noMutators",
    !/\binsert\b/i.test(toolbarSrc) &&
      !/\bdelete\b/i.test(toolbarSrc) &&
      !/\bmutate\b/i.test(toolbarSrc) &&
      !/\bpush\b/.test(toolbarSrc) &&
      !/\bregister\b/i.test(toolbarSrc),
    "Toolbar has no insert/delete/mutate APIs",
  );
  assertCase(
    block,
    "toolbar.helpersExist",
    /getToolbarToolbars/.test(toolbarSrc) &&
      /getToolbarItems/.test(toolbarSrc) &&
      /getToolbarDuplicatedItems/.test(toolbarSrc),
    "Toolbar module has package-internal read helpers",
  );
  assertCase(
    block,
    "toolbar.helpersNotInBarrel",
    !/getToolbarToolbars/.test(barrelSrc) &&
      !/getToolbarItems/.test(barrelSrc) &&
      !/getToolbarDuplicatedItems/.test(barrelSrc) &&
      !/sealToolbar/.test(barrelSrc),
    "Barrel does not export opaque helpers or sealToolbar",
  );
  assertCase(
    block,
    "toolbar.reactFree",
    !/\bfrom\s+["']react["']/.test(toolbarSrc) &&
      !/"use client"/.test(toolbarSrc),
    "Toolbar module remains React-free",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — providerContract                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "providerContract";

  const ctxSrc = existsSync(join(repoRoot, TOOLBAR_CONTEXT))
    ? stripComments(read(TOOLBAR_CONTEXT))
    : "";
  const ctxBody = extractReadonlyTypeBody(ctxSrc, "ToolbarContextValue");
  assertCase(
    block,
    "context.value",
    /\btoolbar\b/.test(ctxBody) &&
      !/\btoolbars\b/.test(ctxBody) &&
      !/\bduplicatedItems\b/.test(ctxBody) &&
      !/\bdispatch\b/.test(ctxBody),
    "ToolbarContextValue = { toolbar } only",
  );

  const providerSrc = existsSync(join(repoRoot, TOOLBAR_PROVIDER))
    ? stripComments(read(TOOLBAR_PROVIDER))
    : "";
  const providerBody = extractFunctionBody(providerSrc, "ToolbarProvider");
  assertCase(
    block,
    "provider.useRef",
    /useRef/.test(providerBody),
    "Provider holds toolbar via useRef",
  );
  assertCase(
    block,
    "provider.buildsToolbar",
    /buildToolbar/.test(providerBody),
    "Provider builds toolbar via buildToolbar",
  );
  assertCase(
    block,
    "provider.exposesToolbarOnly",
    /toolbar\s*:/.test(providerBody) &&
      !/\bduplicatedItems\b/.test(providerBody),
    "Provider exposes opaque toolbar only",
  );
  assertCase(
    block,
    "provider.noUseState",
    !/\buseState\b/.test(providerBody) && !/\buseReducer\b/.test(providerBody),
    "Provider has no useState/useReducer",
  );

  const hookSrc = existsSync(join(repoRoot, USE_TOOLBAR))
    ? stripComments(read(USE_TOOLBAR))
    : "";
  const hookBody = extractFunctionBody(hookSrc, "useToolbar");
  assertCase(
    block,
    "hook.readOnly",
    /useContext\s*\(\s*ToolbarContext\s*\)/.test(hookBody) &&
      /throw\s+new\s+Error/.test(hookBody),
    "useToolbar is read-only and throws outside Provider",
  );

  const bridgeSrc = existsSync(join(repoRoot, TOOLBAR_BRIDGE))
    ? stripComments(read(TOOLBAR_BRIDGE))
    : "";
  const bridgeBody = extractFunctionBody(bridgeSrc, "ToolbarBridge");
  assertCase(
    block,
    "bridge.passThrough",
    /useToolbar\s*\(/.test(bridgeBody) &&
      (/return\s+<>\s*\{\s*children\s*\}\s*<\/>/.test(bridgeBody) ||
        /return\s+children/.test(bridgeBody)) &&
      !/\bdispatch\b/.test(bridgeBody),
    "ToolbarBridge remains pass-through",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — diagnostics                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "diagnostics";

  const diagSrc = existsSync(join(repoRoot, TOOLBAR_DIAGNOSTICS))
    ? stripComments(read(TOOLBAR_DIAGNOSTICS))
    : "";
  const reportBody = extractReadonlyTypeBody(
    diagSrc,
    "ToolbarDiagnosticsReport",
  );
  const createBody = extractFunctionBody(
    diagSrc,
    "createToolbarDiagnosticsReport",
  );

  assertCase(
    block,
    "diag.report",
    /export\s+type\s+ToolbarDiagnosticsReport\s*=/.test(diagSrc),
    "ToolbarDiagnosticsReport type exported",
  );
  assertCase(
    block,
    "diag.create",
    /export\s+function\s+createToolbarDiagnosticsReport\s*\(/.test(diagSrc),
    "createToolbarDiagnosticsReport exported",
  );
  assertCase(
    block,
    "diag.toolbars",
    /\btoolbars\b/.test(reportBody),
    "Report has toolbars",
  );
  assertCase(
    block,
    "diag.items",
    /\bitems\b/.test(reportBody),
    "Report has items",
  );
  assertCase(
    block,
    "diag.orphanCommands",
    /\borphanCommands\b/.test(reportBody),
    "Report has orphanCommands",
  );
  assertCase(
    block,
    "diag.duplicatedItems",
    /\bduplicatedItems\b/.test(reportBody),
    "Report has duplicatedItems",
  );
  assertCase(
    block,
    "diag.readsBuilderDupes",
    /getToolbarDuplicatedItems/.test(createBody),
    "Diagnostics reads Builder-precomputed duplicatedItems",
  );
  assertCase(
    block,
    "diag.importsHelpersFromToolbar",
    /from\s+["']\.\/Toolbar["']/.test(diagSrc) &&
      /getToolbarToolbars/.test(diagSrc) &&
      /getToolbarItems/.test(diagSrc),
    "Diagnostics imports helpers from ./Toolbar",
  );
  assertCase(
    block,
    "diag.orphanViaRegistry",
    /registry\.has/.test(createBody) || /\.has\s*\(/.test(createBody),
    "orphanCommands compares against commandRegistry",
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

  const defSrc = existsSync(join(repoRoot, TOOLBAR_DEFINITION))
    ? stripComments(read(TOOLBAR_DEFINITION))
    : "";
  const defBody = extractReadonlyTypeBody(defSrc, "ToolbarDefinition");
  const itemBody = extractReadonlyTypeBody(defSrc, "ToolbarItem");
  assertCase(
    block,
    "freeze.toolbarDefinition",
    /\bid\b/.test(defBody) && /\bitems\b/.test(defBody),
    "ToolbarDefinition freeze = { id, items }",
  );
  assertCase(
    block,
    "freeze.toolbarItem",
    /\bcommandId\b/.test(itemBody),
    "ToolbarItem freeze = { commandId }",
  );

  const toolbarSrc = existsSync(join(repoRoot, TOOLBAR))
    ? stripComments(read(TOOLBAR))
    : "";
  const toolbarType = extractReadonlyTypeBody(toolbarSrc, "Toolbar");
  assertCase(
    block,
    "freeze.toolbarApi",
    /__brand/.test(toolbarType) &&
      /export\s+function\s+sealToolbar\s*\(/.test(toolbarSrc),
    "Toolbar public API frozen (opaque + seal)",
  );

  assertCase(
    block,
    "freeze.toolbarProviderExists",
    existsSync(join(repoRoot, TOOLBAR_PROVIDER)),
    "ToolbarProvider file intact",
  );
  assertCase(
    block,
    "freeze.useToolbarExists",
    existsSync(join(repoRoot, USE_TOOLBAR)),
    "useToolbar file intact",
  );
  assertCase(
    block,
    "freeze.toolbarBridgeExists",
    existsSync(join(repoRoot, TOOLBAR_BRIDGE)),
    "ToolbarBridge file intact",
  );
  assertCase(
    block,
    "freeze.toolbarDiagnosticsExists",
    existsSync(join(repoRoot, TOOLBAR_DIAGNOSTICS)),
    "ToolbarDiagnostics file intact",
  );

  // Prior Menus contracts remain intact.
  const menuDef = existsSync(join(repoRoot, MENU_DEFINITION))
    ? stripComments(read(MENU_DEFINITION))
    : "";
  const menuDefBody = extractReadonlyTypeBody(menuDef, "MenuDefinition");
  assertCase(
    block,
    "freeze.menuDefinition",
    /\bid\b/.test(menuDefBody) &&
      /\btitle\b/.test(menuDefBody) &&
      /\bentries\b/.test(menuDefBody),
    "MenuDefinition remains { id, title, entries }",
  );

  const menuTree = existsSync(join(repoRoot, MENU_TREE))
    ? stripComments(read(MENU_TREE))
    : "";
  const menuTreeType = extractReadonlyTypeBody(menuTree, "MenuTree");
  assertCase(
    block,
    "freeze.menuTree",
    /__brand/.test(menuTreeType),
    "MenuTree remains opaque",
  );

  assertCase(
    block,
    "freeze.menuProviderExists",
    existsSync(join(repoRoot, MENU_PROVIDER)),
    "MenuProvider file intact",
  );
  assertCase(
    block,
    "freeze.useMenusExists",
    existsSync(join(repoRoot, USE_MENUS)),
    "useMenus file intact",
  );
  assertCase(
    block,
    "freeze.menuBridgeExists",
    existsSync(join(repoRoot, MENU_BRIDGE)),
    "MenuBridge file intact",
  );
  assertCase(
    block,
    "freeze.menuDiagnosticsExists",
    existsSync(join(repoRoot, MENU_DIAGNOSTICS)),
    "MenuDiagnostics file intact",
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

  // Prior Palette contracts remain intact.
  const palDef = existsSync(join(repoRoot, PALETTE_DEFINITION))
    ? stripComments(read(PALETTE_DEFINITION))
    : "";
  const palDefBody = extractReadonlyTypeBody(palDef, "CommandPaletteDefinition");
  assertCase(
    block,
    "freeze.paletteDefinition",
    /\bcommandId\b/.test(palDefBody) && !/\bkeywords\b/.test(palDefBody),
    "CommandPaletteDefinition remains { commandId }",
  );

  const palIndex = existsSync(join(repoRoot, PALETTE_INDEX))
    ? stripComments(read(PALETTE_INDEX))
    : "";
  const palIndexType = extractReadonlyTypeBody(palIndex, "CommandPaletteIndex");
  assertCase(
    block,
    "freeze.paletteIndex",
    /__brand/.test(palIndexType),
    "CommandPaletteIndex remains opaque",
  );

  assertCase(
    block,
    "freeze.paletteSearchExists",
    existsSync(join(repoRoot, PALETTE_SEARCH)),
    "CommandPaletteSearch file intact",
  );
  assertCase(
    block,
    "freeze.paletteProviderExists",
    existsSync(join(repoRoot, PALETTE_PROVIDER)),
    "CommandPaletteProvider file intact",
  );
  assertCase(
    block,
    "freeze.useCommandPaletteExists",
    existsSync(join(repoRoot, USE_COMMAND_PALETTE)),
    "useCommandPalette file intact",
  );
  assertCase(
    block,
    "freeze.paletteBridgeExists",
    existsSync(join(repoRoot, PALETTE_BRIDGE)),
    "CommandPaletteBridge file intact",
  );
  assertCase(
    block,
    "freeze.paletteContextExists",
    existsSync(join(repoRoot, PALETTE_CONTEXT)),
    "CommandPaletteContext file intact",
  );

  const uiIndex = existsSync(join(repoRoot, UI_INDEX))
    ? stripComments(read(UI_INDEX))
    : "";
  assertCase(
    block,
    "freeze.publicBarrelIntact",
    !/\btoolbar\b/.test(uiIndex) &&
      !/ToolbarProvider/.test(uiIndex) &&
      !/useToolbar/.test(uiIndex) &&
      !/\bmenus\b/.test(uiIndex) &&
      !/MenuProvider/.test(uiIndex) &&
      !/\bpalette\b/.test(uiIndex) &&
      !/CommandPaletteProvider/.test(uiIndex) &&
      !/\bshortcuts\b/.test(uiIndex) &&
      !/ShortcutProvider/.test(uiIndex) &&
      !/\bcommands\b/.test(uiIndex) &&
      !/CommandProvider/.test(uiIndex),
    "src/ui/index.ts does not export toolbar, menus, palette, shortcuts, or commands",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — noUI                                                             */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noUI";

  const toolbarFiles = walkFiles(join(repoRoot, TOOLBAR_DIR));
  let hasForbiddenUi = false;
  let hasForbiddenBrowser = false;

  for (const full of toolbarFiles) {
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
    "No AdaptiveToolbar/Button/Separator/Overflow/chrome under toolbar/",
  );
  assertCase(
    block,
    "ui.noBrowserApis",
    !hasForbiddenBrowser,
    "No window/document/KeyboardEvent under toolbar/",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — noExecution                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noExecution";

  const toolbarFiles = walkFiles(join(repoRoot, TOOLBAR_DIR));
  let hasForbiddenExec = false;
  let hasExecuteMethod = false;
  let pureHasReact = false;

  for (const full of toolbarFiles) {
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

    if ((PURE_TOOLBAR_MODULES as readonly string[]).includes(rel)) {
      if (/\bfrom\s+["']react["']/.test(src) || /"use client"/.test(raw)) {
        pureHasReact = true;
      }
    }
  }

  assertCase(
    block,
    "exec.noHandlerCallbackPipeline",
    !hasForbiddenExec,
    "No handler/callback/preventDefault/pipeline.dispatch under toolbar/",
  );
  assertCase(
    block,
    "exec.noExecuteMethod",
    !hasExecuteMethod,
    "No execute() under toolbar/",
  );
  assertCase(
    block,
    "exec.pureModulesReactFree",
    !pureHasReact,
    "Pure toolbar modules remain React-free",
  );

  for (const rel of REACT_TOOLBAR_MODULES) {
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
    if (rel.startsWith("src/ui/toolbar/")) continue;
    const src = stripComments(readFileSync(full, "utf8"));
    if (
      /ToolbarProvider/.test(src) ||
      /ToolbarBridge/.test(src) ||
      /from\s+["']@\/ui\/toolbar/.test(src) ||
      /from\s+["'][^"']*\/ui\/toolbar/.test(src)
    ) {
      productWire = true;
      break;
    }
  }

  assertCase(
    block,
    "exec.noProductionMount",
    !productWire,
    "No ToolbarProvider/Bridge import outside src/ui/toolbar/",
  );

  const doc = existsSync(join(repoRoot, DOC_6_7)) ? read(DOC_6_7) : "";
  assertCase(
    block,
    "exec.docNoProduction",
    /NO production mount/i.test(doc) || /sin montaje en producción/i.test(doc),
    "UX-6.7.md documents no production mount",
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
  { id: "toolbarStructure", ca: "CA-UX-6.7.1" },
  { id: "toolbarCatalog", ca: "CA-UX-6.7.2" },
  { id: "toolbarBuilder", ca: "CA-UX-6.7.3" },
  { id: "toolbarContract", ca: "CA-UX-6.7.4" },
  { id: "providerContract", ca: "CA-UX-6.7.5" },
  { id: "diagnostics", ca: "CA-UX-6.7.6" },
  { id: "apiFreeze", ca: "CA-UX-6.7.7" },
  { id: "noUI", ca: "CA-UX-6.7.8" },
  { id: "noExecution", ca: "CA-UX-6.7.9" },
  { id: "tscCompile", ca: "CA-UX-6.7.10" },
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
