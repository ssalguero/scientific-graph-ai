/**
 * UX-6.10 — Integration Certification gate.
 *
 * Blocks:
 * commandsCertified · pipelineCertified · shortcutsCertified · paletteCertified
 * menusCertified · toolbarCertified · contextMenusCertified · diagnosticsCertified
 * apiFreezeCertified · roadmapCertified
 *
 * Frozen principles:
 * - Documentary — certification only; no production changes
 * - Architectural — system under certification is unchanged
 * - Evidence Reuse Only — aggregates UX-6.1 / UX-6.3–6.9 proofs; does not redefine criteria
 * - Read-only Validator — reads / verifies / reports only; never mutates artifacts
 * - Series Closure — RELEASE CERTIFIED only if every block passes (10/10)
 *
 * No nested validate:ux-6.N (Windows hang). Inline evidence reuse only.
 * UX-6.2 has no independent doc/validator (absorbed into UX-6.1) — not required.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "commandsCertified"
  | "pipelineCertified"
  | "shortcutsCertified"
  | "paletteCertified"
  | "menusCertified"
  | "toolbarCertified"
  | "contextMenusCertified"
  | "diagnosticsCertified"
  | "apiFreezeCertified"
  | "roadmapCertified";

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

function assertExists(block: BlockId, rel: string): void {
  assertCase(
    block,
    `exists.${rel.split("/").pop()}`,
    existsSync(join(repoRoot, rel)),
    `${rel} exists`,
  );
}

/* -------------------------------------------------------------------------- */
/* Paths                                                                      */
/* -------------------------------------------------------------------------- */

const COMMANDS_DIR = "src/ui/commands";
const COMMAND_TYPES = `${COMMANDS_DIR}/CommandTypes.ts`;
const COMMAND_DEFINITION = `${COMMANDS_DIR}/CommandDefinition.ts`;
const COMMAND_REGISTRY = `${COMMANDS_DIR}/CommandRegistry.ts`;
const COMMAND_STATE = `${COMMANDS_DIR}/CommandState.ts`;
const COMMAND_CONTEXT = `${COMMANDS_DIR}/CommandContext.tsx`;
const COMMAND_PROVIDER = `${COMMANDS_DIR}/CommandProvider.tsx`;
const USE_COMMANDS = `${COMMANDS_DIR}/useCommands.ts`;
const COMMAND_BRIDGE = `${COMMANDS_DIR}/CommandBridge.tsx`;
const COMMAND_DIAGNOSTICS = `${COMMANDS_DIR}/CommandDiagnostics.ts`;
const COMMANDS_INDEX = `${COMMANDS_DIR}/index.ts`;

const EXEC_TYPES = `${COMMANDS_DIR}/CommandExecutionTypes.ts`;
const EXEC_CONTEXT = `${COMMANDS_DIR}/CommandExecutionContext.ts`;
const EXEC_PIPELINE = `${COMMANDS_DIR}/CommandExecutionPipeline.ts`;
const EXEC_DISPATCHER = `${COMMANDS_DIR}/CommandExecutionDispatcher.ts`;
const EXEC_RESULT = `${COMMANDS_DIR}/CommandExecutionResult.ts`;

const SHORTCUTS_DIR = "src/ui/shortcuts";
const SHORTCUT_TYPES = `${SHORTCUTS_DIR}/ShortcutTypes.ts`;
const SHORTCUT_DEFINITION = `${SHORTCUTS_DIR}/ShortcutDefinition.ts`;
const SHORTCUT_CATALOG = `${SHORTCUTS_DIR}/ShortcutCatalog.ts`;
const SHORTCUT_REGISTRATION = `${SHORTCUTS_DIR}/ShortcutRegistration.ts`;
const SHORTCUT_REGISTRY = `${SHORTCUTS_DIR}/ShortcutRegistry.ts`;
const SHORTCUT_BUILDER = `${SHORTCUTS_DIR}/ShortcutRegistryBuilder.ts`;
const SHORTCUT_CONTEXT = `${SHORTCUTS_DIR}/ShortcutContext.tsx`;
const SHORTCUT_PROVIDER = `${SHORTCUTS_DIR}/ShortcutProvider.tsx`;
const USE_SHORTCUTS = `${SHORTCUTS_DIR}/useShortcuts.ts`;
const SHORTCUT_BRIDGE = `${SHORTCUTS_DIR}/ShortcutBridge.tsx`;
const SHORTCUT_RESOLVER = `${SHORTCUTS_DIR}/ShortcutResolver.ts`;
const SHORTCUT_DIAGNOSTICS = `${SHORTCUTS_DIR}/ShortcutDiagnostics.ts`;
const SHORTCUTS_INDEX = `${SHORTCUTS_DIR}/index.ts`;

const PALETTE_DIR = "src/ui/palette";
const PALETTE_TYPES = `${PALETTE_DIR}/CommandPaletteTypes.ts`;
const PALETTE_DEFINITION = `${PALETTE_DIR}/CommandPaletteDefinition.ts`;
const PALETTE_CATALOG = `${PALETTE_DIR}/CommandPaletteCatalog.ts`;
const PALETTE_INDEX_MOD = `${PALETTE_DIR}/CommandPaletteIndex.ts`;
const PALETTE_SEARCH = `${PALETTE_DIR}/CommandPaletteSearch.ts`;
const PALETTE_CONTEXT = `${PALETTE_DIR}/CommandPaletteContext.tsx`;
const PALETTE_PROVIDER = `${PALETTE_DIR}/CommandPaletteProvider.tsx`;
const USE_PALETTE = `${PALETTE_DIR}/useCommandPalette.ts`;
const PALETTE_BRIDGE = `${PALETTE_DIR}/CommandPaletteBridge.tsx`;
const PALETTE_DIAGNOSTICS = `${PALETTE_DIR}/CommandPaletteDiagnostics.ts`;
const PALETTE_BARREL = `${PALETTE_DIR}/index.ts`;

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
const MENUS_INDEX = `${MENUS_DIR}/index.ts`;

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
const TOOLBAR_INDEX = `${TOOLBAR_DIR}/index.ts`;

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
const CONTEXT_MENUS_INDEX = `${CONTEXT_MENUS_DIR}/index.ts`;

const DIAG_DIR = "src/ui/diagnostics";
const DIAG_TYPES = `${DIAG_DIR}/UXDiagnosticsTypes.ts`;
const DIAG_METRICS = `${DIAG_DIR}/UXMetrics.ts`;
const DIAG_REPORT = `${DIAG_DIR}/UXDiagnosticsReport.ts`;
const DIAG_AGGREGATOR = `${DIAG_DIR}/UXDiagnosticsAggregator.ts`;
const DIAG_CONTEXT = `${DIAG_DIR}/UXDiagnosticsContext.tsx`;
const DIAG_PROVIDER = `${DIAG_DIR}/UXDiagnosticsProvider.tsx`;
const DIAG_HOOK = `${DIAG_DIR}/useUXDiagnostics.ts`;
const DIAG_BRIDGE = `${DIAG_DIR}/UXDiagnosticsBridge.tsx`;
const DIAG_BARREL = `${DIAG_DIR}/index.ts`;

const UI_INDEX = "src/ui/index.ts";
const ROADMAP_6 = "docs/UX/UX-6.0-roadmap.md";
const DOC_6_10 = "docs/UX/UX-6.10.md";
const PACKAGE_JSON = "package.json";

/* -------------------------------------------------------------------------- */
/* PASS 01 — commandsCertified (UX-6.1 evidence reuse)                         */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "commandsCertified";

  for (const rel of [
    COMMAND_TYPES,
    COMMAND_DEFINITION,
    COMMAND_REGISTRY,
    COMMAND_STATE,
    COMMAND_CONTEXT,
    COMMAND_PROVIDER,
    USE_COMMANDS,
    COMMAND_BRIDGE,
    COMMAND_DIAGNOSTICS,
    COMMANDS_INDEX,
  ]) {
    assertExists(block, rel);
  }

  const defSrc = existsSync(join(repoRoot, COMMAND_DEFINITION))
    ? stripComments(read(COMMAND_DEFINITION))
    : "";
  const defBody = extractReadonlyTypeBody(defSrc, "CommandDefinition");
  assertCase(
    block,
    "commands.definitionShape",
    /\bid\b/.test(defBody) &&
      /export\s+function\s+createCommandDefinition\s*\(/.test(defSrc) &&
      /Object\.freeze/.test(defSrc),
    "CommandDefinition + createCommandDefinition freeze fingerprint",
  );

  const regSrc = existsSync(join(repoRoot, COMMAND_REGISTRY))
    ? stripComments(read(COMMAND_REGISTRY))
    : "";
  const regBody = extractInterfaceBody(regSrc, "CommandRegistryApi");
  assertCase(
    block,
    "commands.registryApi",
    /export\s+interface\s+CommandRegistryApi\s*\{/.test(regSrc) &&
      /\bget\s*\(/.test(regBody) &&
      /\bhas\s*\(/.test(regBody) &&
      /\bsize\s*\(/.test(regBody) &&
      /\bgetAll\s*\(/.test(regBody) &&
      /export\s+function\s+createCommandRegistry\s*\(/.test(regSrc) &&
      /export\s+const\s+commandRegistry\s*:\s*CommandRegistryApi/.test(regSrc),
    "CommandRegistryApi query-only + createCommandRegistry + commandRegistry",
  );

  const stateSrc = existsSync(join(repoRoot, COMMAND_STATE))
    ? stripComments(read(COMMAND_STATE))
    : "";
  const stateBody = extractReadonlyTypeBody(stateSrc, "CommandState");
  assertCase(
    block,
    "commands.stateShape",
    /\bid\b/.test(stateBody) &&
      /\benabled\b/.test(stateBody) &&
      /\bvisible\b/.test(stateBody) &&
      /export\s+function\s+createCommandState\s*\(/.test(stateSrc),
    "CommandState { id, enabled, visible } + factory",
  );

  const hooksSrc = existsSync(join(repoRoot, USE_COMMANDS))
    ? stripComments(read(USE_COMMANDS))
    : "";
  assertCase(
    block,
    "commands.hooks",
    /export\s+function\s+useCommands\s*\(/.test(hooksSrc),
    "useCommands exported",
  );

  const diagSrc = existsSync(join(repoRoot, COMMAND_DIAGNOSTICS))
    ? stripComments(read(COMMAND_DIAGNOSTICS))
    : "";
  assertCase(
    block,
    "commands.diagnostics",
    /export\s+function\s+createCommandDiagnosticsReport\s*\(/.test(diagSrc),
    "createCommandDiagnosticsReport exported",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — pipelineCertified (UX-6.3 evidence reuse)                         */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "pipelineCertified";

  for (const rel of [
    EXEC_TYPES,
    EXEC_CONTEXT,
    EXEC_PIPELINE,
    EXEC_DISPATCHER,
    EXEC_RESULT,
  ]) {
    assertExists(block, rel);
  }

  const pipelineSrc = existsSync(join(repoRoot, EXEC_PIPELINE))
    ? stripComments(read(EXEC_PIPELINE))
    : "";
  assertCase(
    block,
    "pipeline.typeAndFactory",
    /export\s+type\s+CommandExecutionPipeline\s*=/.test(pipelineSrc) &&
      /export\s+function\s+createCommandExecutionPipeline\s*\(/.test(
        pipelineSrc,
      ),
    "CommandExecutionPipeline type + createCommandExecutionPipeline",
  );

  const typesSrc = existsSync(join(repoRoot, EXEC_TYPES))
    ? stripComments(read(EXEC_TYPES))
    : "";
  const reqBody = extractReadonlyTypeBody(typesSrc, "CommandExecutionRequest");
  assertCase(
    block,
    "pipeline.request",
    /\bcommandId\b/.test(reqBody) &&
      /export\s+function\s+createCommandExecutionRequest\s*\(/.test(typesSrc),
    "CommandExecutionRequest { commandId } + factory",
  );

  const ctxSrc = existsSync(join(repoRoot, EXEC_CONTEXT))
    ? stripComments(read(EXEC_CONTEXT))
    : "";
  const ctxBody = extractReadonlyTypeBody(ctxSrc, "CommandExecutionContext");
  assertCase(
    block,
    "pipeline.context",
    /\bregistry\b/.test(ctxBody) &&
      /\bstates\b/.test(ctxBody) &&
      /export\s+function\s+createCommandExecutionContext\s*\(/.test(ctxSrc),
    "CommandExecutionContext { registry, states } + factory",
  );

  const dispSrc = existsSync(join(repoRoot, EXEC_DISPATCHER))
    ? stripComments(read(EXEC_DISPATCHER))
    : "";
  assertCase(
    block,
    "pipeline.dispatcher",
    /export\s+type\s+CommandExecutionDispatcher\s*=/.test(dispSrc) &&
      /export\s+function\s+createCommandExecutionDispatcher\s*\(/.test(dispSrc),
    "CommandExecutionDispatcher type + factory",
  );

  const resultSrc = existsSync(join(repoRoot, EXEC_RESULT))
    ? stripComments(read(EXEC_RESULT))
    : "";
  const resultBody = extractReadonlyTypeBody(
    resultSrc,
    "CommandExecutionResult",
  );
  assertCase(
    block,
    "pipeline.result",
    /\bcommandId\b/.test(resultBody) &&
      /\bstatus\b/.test(resultBody) &&
      /\bok\b/.test(resultBody) &&
      /export\s+function\s+createCommandExecutionResult\s*\(/.test(resultSrc),
    "CommandExecutionResult { commandId, status, ok } + factory",
  );

  const indexSrc = existsSync(join(repoRoot, COMMANDS_INDEX))
    ? stripComments(read(COMMANDS_INDEX))
    : "";
  assertCase(
    block,
    "pipeline.barrelExports",
    /createCommandExecutionPipeline/.test(indexSrc) &&
      /createCommandExecutionRequest/.test(indexSrc) &&
      /createCommandExecutionDispatcher/.test(indexSrc) &&
      /createCommandExecutionResult/.test(indexSrc) &&
      /createCommandExecutionContext/.test(indexSrc),
    "commands/index.ts exports execution factories",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — shortcutsCertified (UX-6.4 evidence reuse)                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "shortcutsCertified";

  for (const rel of [
    SHORTCUT_TYPES,
    SHORTCUT_DEFINITION,
    SHORTCUT_CATALOG,
    SHORTCUT_REGISTRATION,
    SHORTCUT_REGISTRY,
    SHORTCUT_BUILDER,
    SHORTCUT_CONTEXT,
    SHORTCUT_PROVIDER,
    USE_SHORTCUTS,
    SHORTCUT_BRIDGE,
    SHORTCUT_RESOLVER,
    SHORTCUT_DIAGNOSTICS,
    SHORTCUTS_INDEX,
  ]) {
    assertExists(block, rel);
  }

  const defSrc = existsSync(join(repoRoot, SHORTCUT_DEFINITION))
    ? stripComments(read(SHORTCUT_DEFINITION))
    : "";
  assertCase(
    block,
    "shortcuts.definition",
    /export\s+function\s+createShortcutDefinition\s*\(/.test(defSrc) ||
      /export\s+type\s+ShortcutDefinition\s*=/.test(defSrc),
    "ShortcutDefinition surface present",
  );

  const hooksSrc = existsSync(join(repoRoot, USE_SHORTCUTS))
    ? stripComments(read(USE_SHORTCUTS))
    : "";
  assertCase(
    block,
    "shortcuts.hooks",
    /export\s+function\s+useShortcuts\s*\(/.test(hooksSrc),
    "useShortcuts exported",
  );

  const diagSrc = existsSync(join(repoRoot, SHORTCUT_DIAGNOSTICS))
    ? stripComments(read(SHORTCUT_DIAGNOSTICS))
    : "";
  assertCase(
    block,
    "shortcuts.diagnostics",
    /export\s+function\s+createShortcutDiagnosticsReport\s*\(/.test(diagSrc),
    "createShortcutDiagnosticsReport exported",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — paletteCertified (UX-6.5 evidence reuse)                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "paletteCertified";

  for (const rel of [
    PALETTE_TYPES,
    PALETTE_DEFINITION,
    PALETTE_CATALOG,
    PALETTE_INDEX_MOD,
    PALETTE_SEARCH,
    PALETTE_CONTEXT,
    PALETTE_PROVIDER,
    USE_PALETTE,
    PALETTE_BRIDGE,
    PALETTE_DIAGNOSTICS,
    PALETTE_BARREL,
  ]) {
    assertExists(block, rel);
  }

  const hooksSrc = existsSync(join(repoRoot, USE_PALETTE))
    ? stripComments(read(USE_PALETTE))
    : "";
  assertCase(
    block,
    "palette.hooks",
    /export\s+function\s+useCommandPalette\s*\(/.test(hooksSrc),
    "useCommandPalette exported",
  );

  const diagSrc = existsSync(join(repoRoot, PALETTE_DIAGNOSTICS))
    ? stripComments(read(PALETTE_DIAGNOSTICS))
    : "";
  assertCase(
    block,
    "palette.diagnostics",
    /export\s+function\s+createCommandPaletteDiagnosticsReport\s*\(/.test(
      diagSrc,
    ),
    "createCommandPaletteDiagnosticsReport exported",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — menusCertified (UX-6.6 evidence reuse)                            */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "menusCertified";

  for (const rel of [
    MENU_TYPES,
    MENU_DEFINITION,
    MENU_CATALOG,
    MENU_TREE,
    MENU_TREE_BUILDER,
    MENU_CONTEXT,
    MENU_PROVIDER,
    USE_MENUS,
    MENU_BRIDGE,
    MENU_DIAGNOSTICS,
    MENUS_INDEX,
  ]) {
    assertExists(block, rel);
  }

  const hooksSrc = existsSync(join(repoRoot, USE_MENUS))
    ? stripComments(read(USE_MENUS))
    : "";
  assertCase(
    block,
    "menus.hooks",
    /export\s+function\s+useMenus\s*\(/.test(hooksSrc),
    "useMenus exported",
  );

  const diagSrc = existsSync(join(repoRoot, MENU_DIAGNOSTICS))
    ? stripComments(read(MENU_DIAGNOSTICS))
    : "";
  assertCase(
    block,
    "menus.diagnostics",
    /export\s+function\s+createMenuDiagnosticsReport\s*\(/.test(diagSrc),
    "createMenuDiagnosticsReport exported",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — toolbarCertified (UX-6.7 evidence reuse)                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "toolbarCertified";

  for (const rel of [
    TOOLBAR_TYPES,
    TOOLBAR_DEFINITION,
    TOOLBAR_CATALOG,
    TOOLBAR,
    TOOLBAR_BUILDER,
    TOOLBAR_CONTEXT,
    TOOLBAR_PROVIDER,
    USE_TOOLBAR,
    TOOLBAR_BRIDGE,
    TOOLBAR_DIAGNOSTICS,
    TOOLBAR_INDEX,
  ]) {
    assertExists(block, rel);
  }

  const hooksSrc = existsSync(join(repoRoot, USE_TOOLBAR))
    ? stripComments(read(USE_TOOLBAR))
    : "";
  assertCase(
    block,
    "toolbar.hooks",
    /export\s+function\s+useToolbar\s*\(/.test(hooksSrc),
    "useToolbar exported",
  );

  const diagSrc = existsSync(join(repoRoot, TOOLBAR_DIAGNOSTICS))
    ? stripComments(read(TOOLBAR_DIAGNOSTICS))
    : "";
  assertCase(
    block,
    "toolbar.diagnostics",
    /export\s+function\s+createToolbarDiagnosticsReport\s*\(/.test(diagSrc),
    "createToolbarDiagnosticsReport exported",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — contextMenusCertified (UX-6.8 evidence reuse)                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "contextMenusCertified";

  for (const rel of [
    CONTEXT_MENU_TYPES,
    CONTEXT_MENU_DEFINITION,
    CONTEXT_MENU_CATALOG,
    CONTEXT_MENUS,
    CONTEXT_MENU_BUILDER,
    CONTEXT_MENU_CONTEXT,
    CONTEXT_MENU_PROVIDER,
    USE_CONTEXT_MENUS,
    CONTEXT_MENU_BRIDGE,
    CONTEXT_MENU_DIAGNOSTICS,
    CONTEXT_MENUS_INDEX,
  ]) {
    assertExists(block, rel);
  }

  const hooksSrc = existsSync(join(repoRoot, USE_CONTEXT_MENUS))
    ? stripComments(read(USE_CONTEXT_MENUS))
    : "";
  assertCase(
    block,
    "contextMenus.hooks",
    /export\s+function\s+useContextMenus\s*\(/.test(hooksSrc),
    "useContextMenus exported",
  );

  const diagSrc = existsSync(join(repoRoot, CONTEXT_MENU_DIAGNOSTICS))
    ? stripComments(read(CONTEXT_MENU_DIAGNOSTICS))
    : "";
  assertCase(
    block,
    "contextMenus.diagnostics",
    /export\s+function\s+createContextMenuDiagnosticsReport\s*\(/.test(diagSrc),
    "createContextMenuDiagnosticsReport exported",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — diagnosticsCertified (UX-6.9 evidence reuse)                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "diagnosticsCertified";

  for (const rel of [
    DIAG_TYPES,
    DIAG_METRICS,
    DIAG_REPORT,
    DIAG_AGGREGATOR,
    DIAG_CONTEXT,
    DIAG_PROVIDER,
    DIAG_HOOK,
    DIAG_BRIDGE,
    DIAG_BARREL,
  ]) {
    assertExists(block, rel);
  }

  const typesSrc = existsSync(join(repoRoot, DIAG_TYPES))
    ? stripComments(read(DIAG_TYPES))
    : "";
  assertCase(
    block,
    "diagnostics.input",
    /export\s+type\s+UXDiagnosticsInput\s*=/.test(typesSrc),
    "UXDiagnosticsInput sole input contract present",
  );

  const aggSrc = existsSync(join(repoRoot, DIAG_AGGREGATOR))
    ? stripComments(read(DIAG_AGGREGATOR))
    : "";
  assertCase(
    block,
    "diagnostics.aggregator",
    /export\s+function\s+createUXDiagnosticsReport\s*\(/.test(aggSrc) &&
      /createUXMetrics\s*\(\s*input\s*\)/.test(aggSrc) &&
      /Object\.freeze/.test(aggSrc),
    "createUXDiagnosticsReport aggregates via createUXMetrics + freeze",
  );

  const metricsSrc = existsSync(join(repoRoot, DIAG_METRICS))
    ? stripComments(read(DIAG_METRICS))
    : "";
  assertCase(
    block,
    "diagnostics.metrics",
    /export\s+function\s+createUXMetrics\s*\(/.test(metricsSrc),
    "createUXMetrics exported",
  );

  const providerSrc = existsSync(join(repoRoot, DIAG_PROVIDER))
    ? stripComments(read(DIAG_PROVIDER))
    : "";
  assertCase(
    block,
    "diagnostics.provider",
    /export\s+function\s+UXDiagnosticsProvider\s*\(/.test(providerSrc) &&
      /useRef\s*\(\s*createUXDiagnosticsReport\s*\(\s*input\s*\)\s*\)/.test(
        providerSrc,
      ),
    "UXDiagnosticsProvider owns report via useRef(input)",
  );

  const hookSrc = existsSync(join(repoRoot, DIAG_HOOK))
    ? stripComments(read(DIAG_HOOK))
    : "";
  assertCase(
    block,
    "diagnostics.hook",
    /export\s+function\s+useUXDiagnostics\s*\(/.test(hookSrc),
    "useUXDiagnostics exported",
  );

  const barrel = existsSync(join(repoRoot, DIAG_BARREL))
    ? stripComments(read(DIAG_BARREL))
    : "";
  assertCase(
    block,
    "diagnostics.barrelCore",
    /UXDiagnosticsInput/.test(barrel) &&
      /createUXMetrics/.test(barrel) &&
      /createUXDiagnosticsReport/.test(barrel) &&
      !/UXDiagnosticsProvider/.test(barrel) &&
      !/useUXDiagnostics/.test(barrel),
    "Local barrel exports core types/factories only (no React surfaces)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — apiFreezeCertified                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "apiFreezeCertified";

  // Prior subsystem providers / pipeline remain present
  for (const [id, rel] of [
    ["freeze.commandProvider", COMMAND_PROVIDER],
    ["freeze.commandPipeline", EXEC_PIPELINE],
    ["freeze.shortcutProvider", SHORTCUT_PROVIDER],
    ["freeze.paletteProvider", PALETTE_PROVIDER],
    ["freeze.menuProvider", MENU_PROVIDER],
    ["freeze.toolbarProvider", TOOLBAR_PROVIDER],
    ["freeze.contextMenuProvider", CONTEXT_MENU_PROVIDER],
    ["freeze.diagnosticsProvider", DIAG_PROVIDER],
  ] as const) {
    assertCase(
      block,
      id,
      existsSync(join(repoRoot, rel)),
      `${rel} intact`,
    );
  }

  // Commands core freeze fingerprints
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
      /\bgetAll\s*\(/.test(cmdRegBody),
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

  // Prior diagnostics report factories remain
  const priorDiags: Array<[string, string]> = [
    [COMMAND_DIAGNOSTICS, "createCommandDiagnosticsReport"],
    [SHORTCUT_DIAGNOSTICS, "createShortcutDiagnosticsReport"],
    [PALETTE_DIAGNOSTICS, "createCommandPaletteDiagnosticsReport"],
    [MENU_DIAGNOSTICS, "createMenuDiagnosticsReport"],
    [TOOLBAR_DIAGNOSTICS, "createToolbarDiagnosticsReport"],
    [CONTEXT_MENU_DIAGNOSTICS, "createContextMenuDiagnosticsReport"],
  ];
  for (const [rel, factory] of priorDiags) {
    const src = existsSync(join(repoRoot, rel))
      ? stripComments(read(rel))
      : "";
    assertCase(
      block,
      `freeze.prior.${factory}`,
      new RegExp(`export\\s+function\\s+${factory}\\s*\\(`).test(src),
      `${rel} still exports ${factory}`,
    );
  }

  // @/ui must not export UX-6 surfaces
  const uiIndex = existsSync(join(repoRoot, UI_INDEX))
    ? stripComments(read(UI_INDEX))
    : "";
  assertCase(
    block,
    "freeze.uiIndexNoUx6",
    existsSync(join(repoRoot, UI_INDEX)) &&
      !/diagnostics/.test(uiIndex) &&
      !/commands/.test(uiIndex) &&
      !/shortcuts/.test(uiIndex) &&
      !/palette/.test(uiIndex) &&
      !/menus/.test(uiIndex) &&
      !/toolbar/.test(uiIndex) &&
      !/context-menus/.test(uiIndex),
    "src/ui/index.ts does not export UX-6 surfaces",
  );

  // Doc declares no new APIs / freeze vigente
  const doc610 = existsSync(join(repoRoot, DOC_6_10)) ? read(DOC_6_10) : "";
  assertCase(
    block,
    "freeze.docApiFreeze",
    /API Freeze/i.test(doc610) &&
      /UX-6\.1/.test(doc610) &&
      /UX-6\.3/.test(doc610) &&
      /UX-6\.9/.test(doc610) &&
      /No se introduce ninguna API nueva/i.test(doc610),
    "UX-6.10.md declares API Freeze UX-6.1 / UX-6.3–UX-6.9 · no new APIs",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — roadmapCertified                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "roadmapCertified";

  const roadmap = existsSync(join(repoRoot, ROADMAP_6)) ? read(ROADMAP_6) : "";
  const doc610 = existsSync(join(repoRoot, DOC_6_10)) ? read(DOC_6_10) : "";
  const pkg = existsSync(join(repoRoot, PACKAGE_JSON))
    ? read(PACKAGE_JSON)
    : "";

  assertCase(
    block,
    "roadmap.exists",
    existsSync(join(repoRoot, ROADMAP_6)),
    "UX-6.0-roadmap.md exists",
  );

  assertCase(
    block,
    "roadmap.releaseCertified",
    /UX-6\s+RELEASE\s+CERTIFIED/.test(roadmap),
    "roadmap declares UX-6 RELEASE CERTIFIED",
  );

  assertCase(
    block,
    "roadmap.closed",
    /UX-6\s*=\s*CLOSED/.test(roadmap),
    "roadmap marks UX-6 CLOSED",
  );

  assertCase(
    block,
    "roadmap.ux610Complete",
    /UX-6\.10\s*=\s*COMPLETE/.test(roadmap) ||
      /UX-6\.10[\s\S]*?COMPLETE/.test(roadmap),
    "roadmap marks UX-6.10 COMPLETE",
  );

  assertCase(
    block,
    "roadmap.nextUx7",
    /Next Series\s*=\s*UX-7/.test(roadmap) ||
      /Next Series\s*→\s*UX-7/.test(roadmap) ||
      /Next Series:\s*UX-7/.test(roadmap),
    "roadmap Next Series → UX-7",
  );

  assertCase(
    block,
    "roadmap.ux62Absorbed",
    /ABSORBED/i.test(roadmap) && /UX-6\.2/.test(roadmap),
    "roadmap documents UX-6.2 ABSORBED into UX-6.1",
  );

  assertCase(
    block,
    "doc610.exists",
    existsSync(join(repoRoot, DOC_6_10)),
    "docs/UX/UX-6.10.md exists",
  );

  assertCase(
    block,
    "doc610.principles",
    /Documentary Principle/.test(doc610) &&
      /Architectural Principles/.test(doc610) &&
      /Evidence Reuse Only/.test(doc610) &&
      /Read-only Validator Principle/.test(doc610) &&
      /Series Closure Principle/.test(doc610),
    "UX-6.10.md declares Documentary / Architectural / Evidence Reuse / Read-only / Series Closure",
  );

  assertCase(
    block,
    "doc610.registrationNote",
    /Registration Note/i.test(doc610) &&
      /absorbida/i.test(doc610) &&
      /UX-6\.2/.test(doc610) &&
      /UX-6\.1/.test(doc610) &&
      /UX-6\.3/.test(doc610),
    "UX-6.10.md Registration Note documents UX-6.2 absorption",
  );

  assertCase(
    block,
    "doc610.releaseCertified",
    /UX-6 RELEASE CERTIFIED/.test(doc610) &&
      /Next Series\s*→\s*UX-7/.test(doc610),
    "UX-6.10.md official declaration + Next Series → UX-7",
  );

  assertCase(
    block,
    "doc610.certArchitecture",
    /Certified Architecture/i.test(doc610) &&
      /Execution Pipeline/.test(doc610) &&
      /Diagnostics & Metrics/.test(doc610),
    "UX-6.10.md documents certified architecture",
  );

  // Historical docs / validators for implemented phases only (no UX-6.2)
  const certifiedPhases = [1, 3, 4, 5, 6, 7, 8, 9, 10] as const;
  for (const n of certifiedPhases) {
    const doc = `docs/UX/UX-6.${n}.md`;
    const script = `scripts/validate-ux-6.${n}.ts`;
    assertCase(
      block,
      `historical.doc.ux6${n}`,
      existsSync(join(repoRoot, doc)),
      `${doc} exists`,
    );
    assertCase(
      block,
      `historical.validator.ux6${n}`,
      existsSync(join(repoRoot, script)) &&
        new RegExp(`"validate:ux-6\\.${n}"\\s*:`).test(pkg),
      `UX-6.${n} validator file + npm script retained`,
    );
  }

  // Explicitly: UX-6.2 absence is expected (not a failure condition beyond note)
  assertCase(
    block,
    "historical.ux62NotRequired",
    /Registration Note/i.test(doc610) &&
      !existsSync(join(repoRoot, "docs/UX/UX-6.2.md")) &&
      !existsSync(join(repoRoot, "scripts/validate-ux-6.2.ts")),
    "UX-6.2.md / validate-ux-6.2.ts absent by design (Registration Note)",
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const BLOCKS: Array<{ id: BlockId; pass: number; ca: string }> = [
  { id: "commandsCertified", pass: 1, ca: "CA-UX-6.10.1" },
  { id: "pipelineCertified", pass: 2, ca: "CA-UX-6.10.2" },
  { id: "shortcutsCertified", pass: 3, ca: "CA-UX-6.10.3" },
  { id: "paletteCertified", pass: 4, ca: "CA-UX-6.10.4" },
  { id: "menusCertified", pass: 5, ca: "CA-UX-6.10.5" },
  { id: "toolbarCertified", pass: 6, ca: "CA-UX-6.10.6" },
  { id: "contextMenusCertified", pass: 7, ca: "CA-UX-6.10.7" },
  { id: "diagnosticsCertified", pass: 8, ca: "CA-UX-6.10.8" },
  { id: "apiFreezeCertified", pass: 9, ca: "CA-UX-6.10.9" },
  { id: "roadmapCertified", pass: 10, ca: "CA-UX-6.10.10" },
];

let passCount = 0;
for (const { id: block, pass, ca } of BLOCKS) {
  const blockResults = results.filter((r) => r.block === block);
  const failed = blockResults.filter((r) => r.pass === false);
  const ok = failed.length === 0 && blockResults.length > 0;
  if (ok) passCount += 1;
  const label = `PASS ${String(pass).padStart(2, "0")} ${block}`;
  const pad = ".".repeat(Math.max(1, 48 - label.length));
  console.log(`${label} ${pad} ${ok ? "PASS" : "FAIL"} (${ca})`);
  for (const f of failed) {
    console.log(`  FAIL ${f.id}: ${f.detail}`);
  }
  if (blockResults.length === 0) {
    console.log(`  FAIL (no cases)`);
  }
}

const allPass = passCount === BLOCKS.length;
console.log("validate:ux-6.10");
console.log(allPass ? "PASS" : "FAIL");
if (allPass) {
  console.log("UX-6 RELEASE CERTIFIED");
  console.log("Series Closed · Next UX-7");
  console.log("Partial certification is not permitted — all blocks passed");
  console.log("validate:ux-6.10 = final series gate");
} else {
  console.log(
    "UX-6 RELEASE CERTIFIED is NOT valid (partial certification forbidden)",
  );
}
console.log(`${passCount}/${BLOCKS.length}`);

process.exit(allPass ? 0 : 1);
