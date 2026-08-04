/**
 * UX-6.6 — Menus Foundation gate.
 *
 * Blocks:
 * menuStructure · menuCatalog · treeBuilder · treeContract
 * providerContract · diagnostics · apiFreeze · noUI
 * noExecution · tscCompile
 *
 * Architectural principles:
 * - Menus reference CommandId only; commandRegistry remains SSOT.
 * - MenuTree is opaque (public contract only).
 * - Builder: validate → freeze → preserve order → seal.
 * - No React UI · no production mount · prior UX-6.x APIs frozen.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "menuStructure"
  | "menuCatalog"
  | "treeBuilder"
  | "treeContract"
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

const MENUS_DIR = "src/ui/menus";
const MENU_TYPES = `${MENUS_DIR}/MenuTypes.ts`;
const MENU_DEFINITION = `${MENUS_DIR}/MenuDefinition.ts`;
const MENU_CATALOG = `${MENUS_DIR}/MenuCatalog.ts`;
const MENU_TREE = `${MENUS_DIR}/MenuTree.ts`;
const MENU_TREE_BUILDER = `${MENUS_DIR}/MenuTreeBuilder.ts`;
const MENU_CONTEXT = `${MENUS_DIR}/MenuContext.tsx`;
const MENU_PROVIDER = `${MENUS_DIR}/MenuProvider.tsx`;
const USE_MENUS = `${MENUS_DIR}/useMenus.ts`;
const MENU_BRIDGE = `${MENUS_DIR}/MenuBridge.tsx`;
const MENU_DIAGNOSTICS = `${MENUS_DIR}/MenuDiagnostics.ts`;
const MENU_BARREL = `${MENUS_DIR}/index.ts`;

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
const DOC_6_6 = "docs/UX/UX-6.6.md";
const PACKAGE_JSON = "package.json";

const PURE_MENU_MODULES = [
  MENU_TYPES,
  MENU_DEFINITION,
  MENU_CATALOG,
  MENU_TREE,
  MENU_TREE_BUILDER,
  MENU_DIAGNOSTICS,
  MENU_BARREL,
] as const;

const REACT_MENU_MODULES = [
  MENU_CONTEXT,
  MENU_PROVIDER,
  USE_MENUS,
  MENU_BRIDGE,
] as const;

const FORBIDDEN_UI = [
  /\bMenubar\b/,
  /\bDropdown\b/,
  /\bFloating\b/,
  /\bHover\b/,
  /\bToolbar\b/,
  /\bModal\b/,
  /\bOverlay\b/,
  /\bDialog\b/,
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
/* PASS 01 — menuStructure                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "menuStructure";

  for (const [id, rel] of [
    ["exists.MenuTypes", MENU_TYPES],
    ["exists.MenuDefinition", MENU_DEFINITION],
    ["exists.MenuCatalog", MENU_CATALOG],
    ["exists.MenuTree", MENU_TREE],
    ["exists.MenuTreeBuilder", MENU_TREE_BUILDER],
    ["exists.MenuContext", MENU_CONTEXT],
    ["exists.MenuProvider", MENU_PROVIDER],
    ["exists.useMenus", USE_MENUS],
    ["exists.MenuBridge", MENU_BRIDGE],
    ["exists.MenuDiagnostics", MENU_DIAGNOSTICS],
    ["exists.index", MENU_BARREL],
    ["exists.doc", DOC_6_6],
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
    /"validate:ux-6\.6"\s*:/.test(pkg),
    "package.json has validate:ux-6.6",
  );

  const menusDir = join(repoRoot, MENUS_DIR);
  const nestedDirs =
    existsSync(menusDir) &&
    readdirSync(menusDir).some((name) =>
      statSync(join(menusDir, name)).isDirectory(),
    );
  assertCase(
    block,
    "structure.flat",
    !nestedDirs,
    "src/ui/menus/ remains flat (no nested folders)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — menuCatalog                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "menuCatalog";

  const catalogSrc = existsSync(join(repoRoot, MENU_CATALOG))
    ? stripComments(read(MENU_CATALOG))
    : "";
  const defSrc = existsSync(join(repoRoot, MENU_DEFINITION))
    ? stripComments(read(MENU_DEFINITION))
    : "";
  const defBody = extractReadonlyTypeBody(defSrc, "MenuDefinition");
  const entryBody = extractReadonlyTypeBody(defSrc, "MenuEntry");

  assertCase(
    block,
    "catalog.export",
    /export\s+const\s+MENU_CATALOG\b/.test(catalogSrc),
    "MENU_CATALOG exported",
  );
  assertCase(
    block,
    "catalog.systemMenu",
    /menu\.system/.test(catalogSrc) && /System/.test(catalogSrc),
    "Catalog includes System menu (menu.system)",
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
      /\btitle\b/.test(defBody) &&
      /\bentries\b/.test(defBody) &&
      !/\bhandler\b/.test(defBody) &&
      !/\bcallback\b/.test(defBody) &&
      !/\bexecute\b/.test(defBody) &&
      !/\benabled\b/.test(defBody) &&
      !/\bvisible\b/.test(defBody) &&
      !/\bicon\b/.test(defBody) &&
      !/\bshortcut\b/.test(defBody) &&
      !/\bchecked\b/.test(defBody) &&
      !/\bsubmenuState\b/.test(defBody),
    "MenuDefinition = { id, title, entries } only",
  );
  assertCase(
    block,
    "entry.commandIdOnly",
    /\bcommandId\b/.test(entryBody) &&
      !/\bhandler\b/.test(entryBody) &&
      !/\bcallback\b/.test(entryBody) &&
      !/\bexecute\b/.test(entryBody) &&
      !/\benabled\b/.test(entryBody) &&
      !/\bvisible\b/.test(entryBody) &&
      !/\bicon\b/.test(entryBody),
    "MenuEntry = { commandId } only",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — treeBuilder                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "treeBuilder";

  const builderSrc = existsSync(join(repoRoot, MENU_TREE_BUILDER))
    ? stripComments(read(MENU_TREE_BUILDER))
    : "";
  const buildBody = extractFunctionBody(builderSrc, "buildMenuTree");

  assertCase(
    block,
    "builder.export",
    /export\s+function\s+buildMenuTree\s*\(/.test(builderSrc),
    "buildMenuTree exported",
  );
  assertCase(
    block,
    "builder.usesCatalog",
    /MENU_CATALOG/.test(builderSrc),
    "Builder consumes MENU_CATALOG",
  );
  assertCase(
    block,
    "builder.validateDuplicateMenuId",
    /Duplicate MenuId|seenMenuIds|duplicate.*MenuId/i.test(buildBody) &&
      /throw\s+new\s+Error/.test(buildBody),
    "Builder throws on duplicate MenuId",
  );
  assertCase(
    block,
    "builder.validateEmptyTitle",
    (/trim\s*\(/.test(buildBody) || /Empty menu title/i.test(buildBody)) &&
      /throw\s+new\s+Error/.test(buildBody),
    "Builder throws on empty title",
  );
  assertCase(
    block,
    "builder.recordsDuplicatedEntries",
    /duplicatedEntries/.test(buildBody),
    "Builder records duplicatedEntries on the tree",
  );
  assertCase(
    block,
    "builder.seals",
    /sealMenuTree/.test(buildBody),
    "Builder seals opaque MenuTree",
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
/* PASS 04 — treeContract                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "treeContract";

  const treeSrc = existsSync(join(repoRoot, MENU_TREE))
    ? stripComments(read(MENU_TREE))
    : "";
  const treeType = extractReadonlyTypeBody(treeSrc, "MenuTree");

  assertCase(
    block,
    "tree.type",
    /export\s+type\s+MenuTree\s*=/.test(treeSrc),
    "MenuTree type exported",
  );
  assertCase(
    block,
    "tree.opaqueBrand",
    /__brand/.test(treeType) &&
      /MenuTree/.test(treeType) &&
      !/\bmenus\b/.test(treeType) &&
      !/\bentries\b/.test(treeType) &&
      !/\bduplicatedEntries\b/.test(treeType) &&
      !/\bmap\b/i.test(treeType),
    "MenuTree is opaque (brand only; no internal fields)",
  );
  assertCase(
    block,
    "tree.weakMapPrivate",
    /WeakMap/.test(treeSrc) && /treeStore|WeakMap/.test(treeSrc),
    "Tree internals stored privately (WeakMap)",
  );
  assertCase(
    block,
    "tree.noMutators",
    !/\binsert\b/i.test(treeSrc) &&
      !/\bdelete\b/i.test(treeSrc) &&
      !/\bmutate\b/i.test(treeSrc) &&
      !/\bpush\b/.test(treeSrc) &&
      !/\bregister\b/i.test(treeSrc),
    "Tree has no insert/delete/mutate APIs",
  );
  assertCase(
    block,
    "tree.helpers",
    /getMenuTreeMenus/.test(treeSrc) &&
      /getMenuTreeEntries/.test(treeSrc) &&
      /getMenuTreeDuplicatedEntries/.test(treeSrc),
    "Tree exposes read helpers for Diagnostics",
  );
  assertCase(
    block,
    "tree.reactFree",
    !/\bfrom\s+["']react["']/.test(treeSrc) && !/"use client"/.test(treeSrc),
    "Tree module remains React-free",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — providerContract                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "providerContract";

  const ctxSrc = existsSync(join(repoRoot, MENU_CONTEXT))
    ? stripComments(read(MENU_CONTEXT))
    : "";
  const ctxBody = extractReadonlyTypeBody(ctxSrc, "MenuContextValue");
  assertCase(
    block,
    "context.value",
    /\btree\b/.test(ctxBody) &&
      !/\bmenus\b/.test(ctxBody) &&
      !/\bduplicatedEntries\b/.test(ctxBody) &&
      !/\bdispatch\b/.test(ctxBody),
    "MenuContextValue = { tree } only",
  );

  const providerSrc = existsSync(join(repoRoot, MENU_PROVIDER))
    ? stripComments(read(MENU_PROVIDER))
    : "";
  const providerBody = extractFunctionBody(providerSrc, "MenuProvider");
  assertCase(
    block,
    "provider.useRef",
    /useRef/.test(providerBody),
    "Provider holds tree via useRef",
  );
  assertCase(
    block,
    "provider.buildsTree",
    /buildMenuTree/.test(providerBody),
    "Provider builds tree via buildMenuTree",
  );
  assertCase(
    block,
    "provider.exposesTreeOnly",
    /tree\s*:/.test(providerBody) && !/\bduplicatedEntries\b/.test(providerBody),
    "Provider exposes opaque tree only",
  );
  assertCase(
    block,
    "provider.noUseState",
    !/\buseState\b/.test(providerBody) && !/\buseReducer\b/.test(providerBody),
    "Provider has no useState/useReducer",
  );

  const hookSrc = existsSync(join(repoRoot, USE_MENUS))
    ? stripComments(read(USE_MENUS))
    : "";
  const hookBody = extractFunctionBody(hookSrc, "useMenus");
  assertCase(
    block,
    "hook.readOnly",
    /useContext\s*\(\s*MenuContext\s*\)/.test(hookBody) &&
      /throw\s+new\s+Error/.test(hookBody),
    "useMenus is read-only and throws outside Provider",
  );

  const bridgeSrc = existsSync(join(repoRoot, MENU_BRIDGE))
    ? stripComments(read(MENU_BRIDGE))
    : "";
  const bridgeBody = extractFunctionBody(bridgeSrc, "MenuBridge");
  assertCase(
    block,
    "bridge.passThrough",
    /useMenus\s*\(/.test(bridgeBody) &&
      (/return\s+<>\s*\{\s*children\s*\}\s*<\/>/.test(bridgeBody) ||
        /return\s+children/.test(bridgeBody)) &&
      !/\bdispatch\b/.test(bridgeBody),
    "MenuBridge remains pass-through",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — diagnostics                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "diagnostics";

  const diagSrc = existsSync(join(repoRoot, MENU_DIAGNOSTICS))
    ? stripComments(read(MENU_DIAGNOSTICS))
    : "";
  const reportBody = extractReadonlyTypeBody(diagSrc, "MenuDiagnosticsReport");
  const createBody = extractFunctionBody(
    diagSrc,
    "createMenuDiagnosticsReport",
  );

  assertCase(
    block,
    "diag.report",
    /export\s+type\s+MenuDiagnosticsReport\s*=/.test(diagSrc),
    "MenuDiagnosticsReport type exported",
  );
  assertCase(
    block,
    "diag.create",
    /export\s+function\s+createMenuDiagnosticsReport\s*\(/.test(diagSrc),
    "createMenuDiagnosticsReport exported",
  );
  assertCase(
    block,
    "diag.menus",
    /\bmenus\b/.test(reportBody),
    "Report has menus",
  );
  assertCase(
    block,
    "diag.entries",
    /\bentries\b/.test(reportBody),
    "Report has entries",
  );
  assertCase(
    block,
    "diag.orphanCommands",
    /\borphanCommands\b/.test(reportBody),
    "Report has orphanCommands",
  );
  assertCase(
    block,
    "diag.duplicatedEntries",
    /\bduplicatedEntries\b/.test(reportBody),
    "Report has duplicatedEntries",
  );
  assertCase(
    block,
    "diag.readsBuilderDupes",
    /getMenuTreeDuplicatedEntries/.test(createBody),
    "Diagnostics reads Builder-precomputed duplicatedEntries",
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

  const defSrc = existsSync(join(repoRoot, MENU_DEFINITION))
    ? stripComments(read(MENU_DEFINITION))
    : "";
  const defBody = extractReadonlyTypeBody(defSrc, "MenuDefinition");
  const entryBody = extractReadonlyTypeBody(defSrc, "MenuEntry");
  assertCase(
    block,
    "freeze.menuDefinition",
    /\bid\b/.test(defBody) &&
      /\btitle\b/.test(defBody) &&
      /\bentries\b/.test(defBody),
    "MenuDefinition freeze = { id, title, entries }",
  );
  assertCase(
    block,
    "freeze.menuEntry",
    /\bcommandId\b/.test(entryBody),
    "MenuEntry freeze = { commandId }",
  );

  const treeSrc = existsSync(join(repoRoot, MENU_TREE))
    ? stripComments(read(MENU_TREE))
    : "";
  const treeType = extractReadonlyTypeBody(treeSrc, "MenuTree");
  assertCase(
    block,
    "freeze.menuTreeApi",
    /__brand/.test(treeType) &&
      /export\s+function\s+sealMenuTree\s*\(/.test(treeSrc),
    "MenuTree public API frozen (opaque + seal)",
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
    !/\bmenus\b/.test(uiIndex) &&
      !/MenuProvider/.test(uiIndex) &&
      !/useMenus/.test(uiIndex) &&
      !/\bpalette\b/.test(uiIndex) &&
      !/CommandPaletteProvider/.test(uiIndex) &&
      !/\bshortcuts\b/.test(uiIndex) &&
      !/ShortcutProvider/.test(uiIndex) &&
      !/\bcommands\b/.test(uiIndex) &&
      !/CommandProvider/.test(uiIndex),
    "src/ui/index.ts does not export menus, palette, shortcuts, or commands",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — noUI                                                             */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noUI";

  const menuFiles = walkFiles(join(repoRoot, MENUS_DIR));
  let hasForbiddenUi = false;
  let hasForbiddenBrowser = false;

  for (const full of menuFiles) {
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
    "No Menubar/Dropdown/Floating/Hover/Focus chrome under menus/",
  );
  assertCase(
    block,
    "ui.noBrowserApis",
    !hasForbiddenBrowser,
    "No window/document/KeyboardEvent under menus/",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — noExecution                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noExecution";

  const menuFiles = walkFiles(join(repoRoot, MENUS_DIR));
  let hasForbiddenExec = false;
  let hasExecuteMethod = false;
  let pureHasReact = false;

  for (const full of menuFiles) {
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

    if ((PURE_MENU_MODULES as readonly string[]).includes(rel)) {
      if (/\bfrom\s+["']react["']/.test(src) || /"use client"/.test(raw)) {
        pureHasReact = true;
      }
    }
  }

  assertCase(
    block,
    "exec.noHandlerCallbackPipeline",
    !hasForbiddenExec,
    "No handler/callback/preventDefault/pipeline.dispatch under menus/",
  );
  assertCase(
    block,
    "exec.noExecuteMethod",
    !hasExecuteMethod,
    "No execute() under menus/",
  );
  assertCase(
    block,
    "exec.pureModulesReactFree",
    !pureHasReact,
    "Pure menu modules remain React-free",
  );

  for (const rel of REACT_MENU_MODULES) {
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
    if (rel.startsWith("src/ui/menus/")) continue;
    const src = stripComments(readFileSync(full, "utf8"));
    if (
      /MenuProvider/.test(src) ||
      /MenuBridge/.test(src) ||
      /from\s+["']@\/ui\/menus/.test(src) ||
      /from\s+["']\.\.?\/.*menus/.test(src)
    ) {
      productWire = true;
      break;
    }
  }

  assertCase(
    block,
    "exec.noProductionMount",
    !productWire,
    "No MenuProvider/Bridge import outside src/ui/menus/",
  );

  const doc = existsSync(join(repoRoot, DOC_6_6)) ? read(DOC_6_6) : "";
  assertCase(
    block,
    "exec.docNoProduction",
    /NO production mount/i.test(doc) || /sin montaje en producción/i.test(doc),
    "UX-6.6.md documents no production mount",
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
  { id: "menuStructure", ca: "CA-UX-6.6.1" },
  { id: "menuCatalog", ca: "CA-UX-6.6.2" },
  { id: "treeBuilder", ca: "CA-UX-6.6.3" },
  { id: "treeContract", ca: "CA-UX-6.6.4" },
  { id: "providerContract", ca: "CA-UX-6.6.5" },
  { id: "diagnostics", ca: "CA-UX-6.6.6" },
  { id: "apiFreeze", ca: "CA-UX-6.6.7" },
  { id: "noUI", ca: "CA-UX-6.6.8" },
  { id: "noExecution", ca: "CA-UX-6.6.9" },
  { id: "tscCompile", ca: "CA-UX-6.6.10" },
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
