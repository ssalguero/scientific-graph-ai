/**
 * UX-6.8 — Context Menus Foundation gate.
 *
 * Blocks:
 * contextMenuStructure · contextMenuCatalog · builderPipeline · opaqueContract
 * providerContract · diagnostics · apiFreeze · noBrowserEvents
 * noExecution · tscCompile
 *
 * Architectural principles:
 * - Context Menus reference CommandId only; commandRegistry remains SSOT.
 * - ContextMenus is opaque (public brand only); read helpers are package-internal.
 * - Builder: validate → freeze → preserve order → seal.
 * - No browser events · no React UI · no production mount · prior UX-6.x APIs frozen.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "contextMenuStructure"
  | "contextMenuCatalog"
  | "builderPipeline"
  | "opaqueContract"
  | "providerContract"
  | "diagnostics"
  | "apiFreeze"
  | "noBrowserEvents"
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

const CONTEXT_MENUS_DIR = "src/ui/context-menus";
const CONTEXT_MENU_TYPES = `${CONTEXT_MENUS_DIR}/ContextMenuTypes.ts`;
const CONTEXT_MENU_DEFINITION = `${CONTEXT_MENUS_DIR}/ContextMenuDefinition.ts`;
const CONTEXT_MENU_CATALOG = `${CONTEXT_MENUS_DIR}/ContextMenuCatalog.ts`;
const CONTEXT_MENUS = `${CONTEXT_MENUS_DIR}/ContextMenus.ts`;
const CONTEXT_MENU_BUILDER = `${CONTEXT_MENUS_DIR}/ContextMenuBuilder.ts`;
const CONTEXT_MENU_CONTEXT = `${CONTEXT_MENUS_DIR}/ContextMenuContext.tsx`;
const CONTEXT_MENU_PROVIDER = `${CONTEXT_MENUS_DIR}/ContextMenuProvider.tsx`;
const USE_CONTEXT_MENUS = `${CONTEXT_MENUS_DIR}/useContextMenus.ts`;
const CONTEXT_MENU_BRIDGE = `${CONTEXT_MENUS_DIR}/ContextMenuBridge.tsx`;
const CONTEXT_MENU_DIAGNOSTICS = `${CONTEXT_MENUS_DIR}/ContextMenuDiagnostics.ts`;
const CONTEXT_MENU_BARREL = `${CONTEXT_MENUS_DIR}/index.ts`;

const TOOLBAR_DIR = "src/ui/toolbar";
const TOOLBAR_DEFINITION = `${TOOLBAR_DIR}/ToolbarDefinition.ts`;
const TOOLBAR = `${TOOLBAR_DIR}/Toolbar.ts`;
const TOOLBAR_PROVIDER = `${TOOLBAR_DIR}/ToolbarProvider.tsx`;
const USE_TOOLBAR = `${TOOLBAR_DIR}/useToolbar.ts`;
const TOOLBAR_BRIDGE = `${TOOLBAR_DIR}/ToolbarBridge.tsx`;
const TOOLBAR_DIAGNOSTICS = `${TOOLBAR_DIR}/ToolbarDiagnostics.ts`;

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
const DOC_6_8 = "docs/UX/UX-6.8.md";
const PACKAGE_JSON = "package.json";

const PURE_CONTEXT_MENU_MODULES = [
  CONTEXT_MENU_TYPES,
  CONTEXT_MENU_DEFINITION,
  CONTEXT_MENU_CATALOG,
  CONTEXT_MENUS,
  CONTEXT_MENU_BUILDER,
  CONTEXT_MENU_DIAGNOSTICS,
  CONTEXT_MENU_BARREL,
] as const;

const REACT_CONTEXT_MENU_MODULES = [
  CONTEXT_MENU_CONTEXT,
  CONTEXT_MENU_PROVIDER,
  USE_CONTEXT_MENUS,
  CONTEXT_MENU_BRIDGE,
] as const;

const FORBIDDEN_BROWSER_EVENTS = [
  /\bMouseEvent\b/,
  /\bContextMenuEvent\b/,
  /\bKeyboardEvent\b/,
  // DOM event name "contextmenu" (lowercase) — not ContextMenu* type names
  /\bcontextmenu\b/,
  /\bonContextMenu\b/,
  /\bonClick\b/,
  /\bonMouse\w+\b/,
  /\bonKeyDown\b/,
  /\bFloating\b/,
  /\bOverlay\b/,
  /\bModal\b/,
  /\bDialog\b/,
  /\bMenubar\b/,
  /\bDropdown\b/,
  /\bSeparator\b/,
  /\b<button\b/i,
  /\b<input\b/i,
  /\btextarea\b/i,
  /\bfocus\(/i,
  /\bautoFocus\b/,
  /\bgetBoundingClientRect\b/,
  /\bclientX\b/,
  /\bclientY\b/,
  /\bpageX\b/,
  /\bpageY\b/,
];

const FORBIDDEN_EXEC = [
  /\bhandler\b/i,
  /\bcallback\b/i,
  /\bpreventDefault\b/,
  /\bstopPropagation\b/,
  /\bpipeline\.dispatch\b/,
  /\bCommandExecutionPipeline\b/,
];

const FORBIDDEN_DOM = [
  /\bwindow\b/,
  /\bdocument\b/,
  /\bHTMLElement\b/,
  /\baddEventListener\b/,
  /\bremoveEventListener\b/,
  /\bquerySelector\b/,
  /\bcreateElement\b/,
];

/* -------------------------------------------------------------------------- */
/* PASS 01 — contextMenuStructure                                             */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "contextMenuStructure";

  for (const [id, rel] of [
    ["exists.ContextMenuTypes", CONTEXT_MENU_TYPES],
    ["exists.ContextMenuDefinition", CONTEXT_MENU_DEFINITION],
    ["exists.ContextMenuCatalog", CONTEXT_MENU_CATALOG],
    ["exists.ContextMenus", CONTEXT_MENUS],
    ["exists.ContextMenuBuilder", CONTEXT_MENU_BUILDER],
    ["exists.ContextMenuContext", CONTEXT_MENU_CONTEXT],
    ["exists.ContextMenuProvider", CONTEXT_MENU_PROVIDER],
    ["exists.useContextMenus", USE_CONTEXT_MENUS],
    ["exists.ContextMenuBridge", CONTEXT_MENU_BRIDGE],
    ["exists.ContextMenuDiagnostics", CONTEXT_MENU_DIAGNOSTICS],
    ["exists.index", CONTEXT_MENU_BARREL],
    ["exists.doc", DOC_6_8],
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
    /"validate:ux-6\.8"\s*:/.test(pkg),
    "package.json has validate:ux-6.8",
  );

  const cmDir = join(repoRoot, CONTEXT_MENUS_DIR);
  const nestedDirs =
    existsSync(cmDir) &&
    readdirSync(cmDir).some((name) =>
      statSync(join(cmDir, name)).isDirectory(),
    );
  assertCase(
    block,
    "structure.flat",
    !nestedDirs,
    "src/ui/context-menus/ remains flat (no nested folders)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — contextMenuCatalog                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "contextMenuCatalog";

  const catalogSrc = existsSync(join(repoRoot, CONTEXT_MENU_CATALOG))
    ? stripComments(read(CONTEXT_MENU_CATALOG))
    : "";
  const defSrc = existsSync(join(repoRoot, CONTEXT_MENU_DEFINITION))
    ? stripComments(read(CONTEXT_MENU_DEFINITION))
    : "";
  const defBody = extractReadonlyTypeBody(defSrc, "ContextMenuDefinition");
  const itemBody = extractReadonlyTypeBody(defSrc, "ContextMenuItem");

  assertCase(
    block,
    "catalog.export",
    /export\s+const\s+CONTEXT_MENU_CATALOG\b/.test(catalogSrc),
    "CONTEXT_MENU_CATALOG exported",
  );
  assertCase(
    block,
    "catalog.default",
    /context\.default/.test(catalogSrc),
    "Catalog includes Default context menu (context.default)",
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
      !/\bseparator\b/.test(defBody) &&
      !/\bsubmenu\b/.test(defBody) &&
      !/\bMouseEvent\b/.test(defBody) &&
      !/\btarget\b/.test(defBody) &&
      !/\bselector\b/.test(defBody),
    "ContextMenuDefinition = { id, items } only",
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
    "ContextMenuItem = { commandId } only",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — builderPipeline                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "builderPipeline";

  const builderSrc = existsSync(join(repoRoot, CONTEXT_MENU_BUILDER))
    ? stripComments(read(CONTEXT_MENU_BUILDER))
    : "";
  const buildBody = extractFunctionBody(builderSrc, "buildContextMenus");

  assertCase(
    block,
    "builder.export",
    /export\s+function\s+buildContextMenus\s*\(/.test(builderSrc),
    "buildContextMenus exported",
  );
  assertCase(
    block,
    "builder.usesCatalog",
    /CONTEXT_MENU_CATALOG/.test(builderSrc),
    "Builder consumes CONTEXT_MENU_CATALOG",
  );
  assertCase(
    block,
    "builder.validateDuplicateContextMenuId",
    /Duplicate ContextMenuId|seenContextMenuIds|duplicate.*ContextMenuId/i.test(
      buildBody,
    ) && /throw\s+new\s+Error/.test(buildBody),
    "Builder throws on duplicate ContextMenuId",
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
    "Builder records duplicatedItems on ContextMenus",
  );
  assertCase(
    block,
    "builder.seals",
    /sealContextMenus/.test(buildBody),
    "Builder seals opaque ContextMenus",
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
/* PASS 04 — opaqueContract                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "opaqueContract";

  const cmSrc = existsSync(join(repoRoot, CONTEXT_MENUS))
    ? stripComments(read(CONTEXT_MENUS))
    : "";
  const cmType = extractReadonlyTypeBody(cmSrc, "ContextMenus");
  const barrelSrc = existsSync(join(repoRoot, CONTEXT_MENU_BARREL))
    ? stripComments(read(CONTEXT_MENU_BARREL))
    : "";

  assertCase(
    block,
    "contextMenus.type",
    /export\s+type\s+ContextMenus\s*=/.test(cmSrc),
    "ContextMenus type exported",
  );
  assertCase(
    block,
    "contextMenus.opaqueBrand",
    /__brand/.test(cmType) &&
      /ContextMenus/.test(cmType) &&
      !/\bitems\b/.test(cmType) &&
      !/\bduplicatedItems\b/.test(cmType) &&
      !/\bmap\b/i.test(cmType),
    "ContextMenus is opaque (brand only; no internal fields)",
  );
  assertCase(
    block,
    "contextMenus.weakMapPrivate",
    /WeakMap/.test(cmSrc) && /contextMenusStore|WeakMap/.test(cmSrc),
    "ContextMenus internals stored privately (WeakMap)",
  );
  assertCase(
    block,
    "contextMenus.noMutators",
    !/\binsert\b/i.test(cmSrc) &&
      !/\bdelete\b/i.test(cmSrc) &&
      !/\bmutate\b/i.test(cmSrc) &&
      !/\bpush\b/.test(cmSrc) &&
      !/\bregister\b/i.test(cmSrc),
    "ContextMenus has no insert/delete/mutate APIs",
  );
  assertCase(
    block,
    "contextMenus.helpersExist",
    /getContextMenusEntries/.test(cmSrc) &&
      /getContextMenusItems/.test(cmSrc) &&
      /getContextMenusDuplicatedItems/.test(cmSrc),
    "ContextMenus module has package-internal read helpers",
  );
  assertCase(
    block,
    "contextMenus.helpersNotInBarrel",
    !/getContextMenusEntries/.test(barrelSrc) &&
      !/getContextMenusItems/.test(barrelSrc) &&
      !/getContextMenusDuplicatedItems/.test(barrelSrc) &&
      !/sealContextMenus/.test(barrelSrc),
    "Barrel does not export opaque helpers or sealContextMenus",
  );
  assertCase(
    block,
    "contextMenus.reactFree",
    !/\bfrom\s+["']react["']/.test(cmSrc) && !/"use client"/.test(cmSrc),
    "ContextMenus module remains React-free",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — providerContract                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "providerContract";

  const ctxSrc = existsSync(join(repoRoot, CONTEXT_MENU_CONTEXT))
    ? stripComments(read(CONTEXT_MENU_CONTEXT))
    : "";
  const ctxBody = extractReadonlyTypeBody(ctxSrc, "ContextMenuContextValue");
  assertCase(
    block,
    "context.value",
    /\bcontextMenus\b/.test(ctxBody) &&
      !/\bduplicatedItems\b/.test(ctxBody) &&
      !/\bdispatch\b/.test(ctxBody),
    "ContextMenuContextValue = { contextMenus } only",
  );

  const providerSrc = existsSync(join(repoRoot, CONTEXT_MENU_PROVIDER))
    ? stripComments(read(CONTEXT_MENU_PROVIDER))
    : "";
  const providerBody = extractFunctionBody(providerSrc, "ContextMenuProvider");
  assertCase(
    block,
    "provider.useRef",
    /useRef/.test(providerBody),
    "Provider holds contextMenus via useRef",
  );
  assertCase(
    block,
    "provider.buildsContextMenus",
    /buildContextMenus/.test(providerBody),
    "Provider builds via buildContextMenus",
  );
  assertCase(
    block,
    "provider.exposesContextMenusOnly",
    /contextMenus\s*:/.test(providerBody) &&
      !/\bduplicatedItems\b/.test(providerBody),
    "Provider exposes opaque contextMenus only",
  );
  assertCase(
    block,
    "provider.noUseState",
    !/\buseState\b/.test(providerBody) && !/\buseReducer\b/.test(providerBody),
    "Provider has no useState/useReducer",
  );

  const hookSrc = existsSync(join(repoRoot, USE_CONTEXT_MENUS))
    ? stripComments(read(USE_CONTEXT_MENUS))
    : "";
  const hookBody = extractFunctionBody(hookSrc, "useContextMenus");
  assertCase(
    block,
    "hook.readOnly",
    /useContext\s*\(\s*ContextMenuContext\s*\)/.test(hookBody) &&
      /throw\s+new\s+Error/.test(hookBody),
    "useContextMenus is read-only and throws outside Provider",
  );

  const bridgeSrc = existsSync(join(repoRoot, CONTEXT_MENU_BRIDGE))
    ? stripComments(read(CONTEXT_MENU_BRIDGE))
    : "";
  const bridgeBody = extractFunctionBody(bridgeSrc, "ContextMenuBridge");
  assertCase(
    block,
    "bridge.passThrough",
    /useContextMenus\s*\(/.test(bridgeBody) &&
      (/return\s+<>\s*\{\s*children\s*\}\s*<\/>/.test(bridgeBody) ||
        /return\s+children/.test(bridgeBody)) &&
      !/\bdispatch\b/.test(bridgeBody),
    "ContextMenuBridge remains pass-through",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — diagnostics                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "diagnostics";

  const diagSrc = existsSync(join(repoRoot, CONTEXT_MENU_DIAGNOSTICS))
    ? stripComments(read(CONTEXT_MENU_DIAGNOSTICS))
    : "";
  const reportBody = extractReadonlyTypeBody(
    diagSrc,
    "ContextMenuDiagnosticsReport",
  );
  const createBody = extractFunctionBody(
    diagSrc,
    "createContextMenuDiagnosticsReport",
  );

  assertCase(
    block,
    "diag.report",
    /export\s+type\s+ContextMenuDiagnosticsReport\s*=/.test(diagSrc),
    "ContextMenuDiagnosticsReport type exported",
  );
  assertCase(
    block,
    "diag.create",
    /export\s+function\s+createContextMenuDiagnosticsReport\s*\(/.test(
      diagSrc,
    ),
    "createContextMenuDiagnosticsReport exported",
  );
  assertCase(
    block,
    "diag.contextMenus",
    /\bcontextMenus\b/.test(reportBody),
    "Report has contextMenus",
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
    /getContextMenusDuplicatedItems/.test(createBody),
    "Diagnostics reads Builder-precomputed duplicatedItems",
  );
  assertCase(
    block,
    "diag.importsHelpersFromContextMenus",
    /from\s+["']\.\/ContextMenus["']/.test(diagSrc) &&
      /getContextMenusEntries/.test(diagSrc) &&
      /getContextMenusItems/.test(diagSrc),
    "Diagnostics imports helpers from ./ContextMenus",
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

  const defSrc = existsSync(join(repoRoot, CONTEXT_MENU_DEFINITION))
    ? stripComments(read(CONTEXT_MENU_DEFINITION))
    : "";
  const defBody = extractReadonlyTypeBody(defSrc, "ContextMenuDefinition");
  const itemBody = extractReadonlyTypeBody(defSrc, "ContextMenuItem");
  assertCase(
    block,
    "freeze.contextMenuDefinition",
    /\bid\b/.test(defBody) && /\bitems\b/.test(defBody),
    "ContextMenuDefinition freeze = { id, items }",
  );
  assertCase(
    block,
    "freeze.contextMenuItem",
    /\bcommandId\b/.test(itemBody),
    "ContextMenuItem freeze = { commandId }",
  );

  const cmSrc = existsSync(join(repoRoot, CONTEXT_MENUS))
    ? stripComments(read(CONTEXT_MENUS))
    : "";
  const cmType = extractReadonlyTypeBody(cmSrc, "ContextMenus");
  assertCase(
    block,
    "freeze.contextMenusApi",
    /__brand/.test(cmType) &&
      /export\s+function\s+sealContextMenus\s*\(/.test(cmSrc),
    "ContextMenus public API frozen (opaque + seal)",
  );

  assertCase(
    block,
    "freeze.contextMenuProviderExists",
    existsSync(join(repoRoot, CONTEXT_MENU_PROVIDER)),
    "ContextMenuProvider file intact",
  );
  assertCase(
    block,
    "freeze.useContextMenusExists",
    existsSync(join(repoRoot, USE_CONTEXT_MENUS)),
    "useContextMenus file intact",
  );
  assertCase(
    block,
    "freeze.contextMenuBridgeExists",
    existsSync(join(repoRoot, CONTEXT_MENU_BRIDGE)),
    "ContextMenuBridge file intact",
  );
  assertCase(
    block,
    "freeze.contextMenuDiagnosticsExists",
    existsSync(join(repoRoot, CONTEXT_MENU_DIAGNOSTICS)),
    "ContextMenuDiagnostics file intact",
  );

  // Prior Toolbar contracts remain intact.
  const toolbarDef = existsSync(join(repoRoot, TOOLBAR_DEFINITION))
    ? stripComments(read(TOOLBAR_DEFINITION))
    : "";
  const toolbarDefBody = extractReadonlyTypeBody(toolbarDef, "ToolbarDefinition");
  assertCase(
    block,
    "freeze.toolbarDefinition",
    /\bid\b/.test(toolbarDefBody) && /\bitems\b/.test(toolbarDefBody),
    "ToolbarDefinition remains { id, items }",
  );

  const toolbarSrc = existsSync(join(repoRoot, TOOLBAR))
    ? stripComments(read(TOOLBAR))
    : "";
  const toolbarType = extractReadonlyTypeBody(toolbarSrc, "Toolbar");
  assertCase(
    block,
    "freeze.toolbar",
    /__brand/.test(toolbarType),
    "Toolbar remains opaque",
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
    !/\bcontext-menus\b/.test(uiIndex) &&
      !/ContextMenuProvider/.test(uiIndex) &&
      !/useContextMenus/.test(uiIndex) &&
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
    "src/ui/index.ts does not export context-menus, toolbar, menus, palette, shortcuts, or commands",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — noBrowserEvents                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noBrowserEvents";

  const cmFiles = walkFiles(join(repoRoot, CONTEXT_MENUS_DIR));
  let hasForbiddenEvents = false;
  let hasForbiddenDom = false;

  for (const full of cmFiles) {
    const src = stripComments(readFileSync(full, "utf8"));
    for (const re of FORBIDDEN_BROWSER_EVENTS) {
      if (re.test(src)) {
        hasForbiddenEvents = true;
      }
    }
    for (const re of FORBIDDEN_DOM) {
      if (re.test(src)) {
        hasForbiddenDom = true;
      }
    }
  }

  assertCase(
    block,
    "events.noBrowserEvents",
    !hasForbiddenEvents,
    "No MouseEvent/contextmenu/Floating/Overlay/chrome under context-menus/",
  );
  assertCase(
    block,
    "events.noDomApis",
    !hasForbiddenDom,
    "No window/document/DOM APIs under context-menus/",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — noExecution                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noExecution";

  const cmFiles = walkFiles(join(repoRoot, CONTEXT_MENUS_DIR));
  let hasForbiddenExec = false;
  let hasExecuteMethod = false;
  let pureHasReact = false;

  for (const full of cmFiles) {
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

    if ((PURE_CONTEXT_MENU_MODULES as readonly string[]).includes(rel)) {
      if (/\bfrom\s+["']react["']/.test(src) || /"use client"/.test(raw)) {
        pureHasReact = true;
      }
    }
  }

  assertCase(
    block,
    "exec.noHandlerCallbackPipeline",
    !hasForbiddenExec,
    "No handler/callback/preventDefault/pipeline.dispatch under context-menus/",
  );
  assertCase(
    block,
    "exec.noExecuteMethod",
    !hasExecuteMethod,
    "No execute() under context-menus/",
  );
  assertCase(
    block,
    "exec.pureModulesReactFree",
    !pureHasReact,
    "Pure context-menu modules remain React-free",
  );

  for (const rel of REACT_CONTEXT_MENU_MODULES) {
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
    if (rel.startsWith("src/ui/context-menus/")) continue;
    const src = stripComments(readFileSync(full, "utf8"));
    if (
      /ContextMenuProvider/.test(src) ||
      /ContextMenuBridge/.test(src) ||
      /from\s+["']@\/ui\/context-menus/.test(src) ||
      /from\s+["'][^"']*\/ui\/context-menus/.test(src)
    ) {
      productWire = true;
      break;
    }
  }

  assertCase(
    block,
    "exec.noProductionMount",
    !productWire,
    "No ContextMenuProvider/Bridge import outside src/ui/context-menus/",
  );

  const doc = existsSync(join(repoRoot, DOC_6_8)) ? read(DOC_6_8) : "";
  assertCase(
    block,
    "exec.docNoProduction",
    /NO production mount/i.test(doc) || /sin montaje en producción/i.test(doc),
    "UX-6.8.md documents no production mount",
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
  { id: "contextMenuStructure", ca: "CA-UX-6.8.1" },
  { id: "contextMenuCatalog", ca: "CA-UX-6.8.2" },
  { id: "builderPipeline", ca: "CA-UX-6.8.3" },
  { id: "opaqueContract", ca: "CA-UX-6.8.4" },
  { id: "providerContract", ca: "CA-UX-6.8.5" },
  { id: "diagnostics", ca: "CA-UX-6.8.6" },
  { id: "apiFreeze", ca: "CA-UX-6.8.7" },
  { id: "noBrowserEvents", ca: "CA-UX-6.8.8" },
  { id: "noExecution", ca: "CA-UX-6.8.9" },
  { id: "tscCompile", ca: "CA-UX-6.8.10" },
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
