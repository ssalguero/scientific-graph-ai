/**
 * UX-6.4 — Keyboard Shortcuts Foundation gate.
 *
 * Blocks:
 * shortcutStructure · shortcutCatalog · registryBuilder · registryApi
 * resolverContract · diagnostics · apiFreeze · noBrowserEvents
 * noExecution · tscCompile
 *
 * Architectural principles:
 * - Shortcuts resolve ShortcutKey → CommandId only.
 * - Registry = pure catalog (get/has/size/getAll).
 * - Resolver owns key index; Provider owns resolver privately.
 * - No browser events · no command execution · no production mount.
 * - UX-6.1 / UX-6.3 public contracts remain frozen.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "shortcutStructure"
  | "shortcutCatalog"
  | "registryBuilder"
  | "registryApi"
  | "resolverContract"
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

const COMMANDS_DIR = "src/ui/commands";
const COMMAND_DEFINITION = `${COMMANDS_DIR}/CommandDefinition.ts`;
const COMMAND_REGISTRY = `${COMMANDS_DIR}/CommandRegistry.ts`;
const COMMAND_STATE = `${COMMANDS_DIR}/CommandState.ts`;
const COMMAND_CONTEXT = `${COMMANDS_DIR}/CommandContext.tsx`;
const COMMAND_PROVIDER = `${COMMANDS_DIR}/CommandProvider.tsx`;
const USE_COMMANDS = `${COMMANDS_DIR}/useCommands.ts`;
const COMMAND_BRIDGE = `${COMMANDS_DIR}/CommandBridge.tsx`;
const COMMAND_PIPELINE = `${COMMANDS_DIR}/CommandExecutionPipeline.ts`;

const UI_INDEX = "src/ui/index.ts";
const ROADMAP_6 = "docs/UX/UX-6.0-roadmap.md";
const DOC_6_4 = "docs/UX/UX-6.4.md";
const PACKAGE_JSON = "package.json";

const PURE_SHORTCUT_MODULES = [
  SHORTCUT_TYPES,
  SHORTCUT_DEFINITION,
  SHORTCUT_CATALOG,
  SHORTCUT_REGISTRATION,
  SHORTCUT_REGISTRY,
  SHORTCUT_BUILDER,
  SHORTCUT_RESOLVER,
  SHORTCUT_DIAGNOSTICS,
  SHORTCUTS_INDEX,
] as const;

const REACT_SHORTCUT_MODULES = [
  SHORTCUT_CONTEXT,
  SHORTCUT_PROVIDER,
  USE_SHORTCUTS,
  SHORTCUT_BRIDGE,
] as const;

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
/* PASS 01 — shortcutStructure                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "shortcutStructure";

  for (const [id, rel] of [
    ["exists.ShortcutTypes", SHORTCUT_TYPES],
    ["exists.ShortcutDefinition", SHORTCUT_DEFINITION],
    ["exists.ShortcutCatalog", SHORTCUT_CATALOG],
    ["exists.ShortcutRegistration", SHORTCUT_REGISTRATION],
    ["exists.ShortcutRegistry", SHORTCUT_REGISTRY],
    ["exists.ShortcutRegistryBuilder", SHORTCUT_BUILDER],
    ["exists.ShortcutContext", SHORTCUT_CONTEXT],
    ["exists.ShortcutProvider", SHORTCUT_PROVIDER],
    ["exists.useShortcuts", USE_SHORTCUTS],
    ["exists.ShortcutBridge", SHORTCUT_BRIDGE],
    ["exists.ShortcutResolver", SHORTCUT_RESOLVER],
    ["exists.ShortcutDiagnostics", SHORTCUT_DIAGNOSTICS],
    ["exists.index", SHORTCUTS_INDEX],
    ["exists.doc", DOC_6_4],
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
    /"validate:ux-6\.4"\s*:/.test(pkg),
    "package.json has validate:ux-6.4",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — shortcutCatalog                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "shortcutCatalog";

  const catalogSrc = existsSync(join(repoRoot, SHORTCUT_CATALOG))
    ? stripComments(read(SHORTCUT_CATALOG))
    : "";

  assertCase(
    block,
    "catalog.export",
    /export\s+const\s+SHORTCUT_CATALOG\b/.test(catalogSrc),
    "SHORTCUT_CATALOG exported",
  );
  assertCase(
    block,
    "catalog.ctrlShiftP",
    /Ctrl\+Shift\+P/.test(catalogSrc) && /system\.catalog/.test(catalogSrc),
    "Ctrl+Shift+P → system.catalog",
  );
  assertCase(
    block,
    "catalog.ctrlAltD",
    /Ctrl\+Alt\+D/.test(catalogSrc) && /system\.diagnostics/.test(catalogSrc),
    "Ctrl+Alt+D → system.diagnostics",
  );
  assertCase(
    block,
    "catalog.ctrlAltP",
    /Ctrl\+Alt\+P/.test(catalogSrc) && /system\.ping/.test(catalogSrc),
    "Ctrl+Alt+P → system.ping",
  );
  // Case-sensitive: /Export/i would false-positive on TypeScript `export`.
  assertCase(
    block,
    "catalog.noFunctional",
    !/\bSave\b/.test(catalogSrc) &&
      !/\bUndo\b/.test(catalogSrc) &&
      !/\bRedo\b/.test(catalogSrc) &&
      !/\bExport\b/.test(catalogSrc) &&
      !/\bOpen\b/.test(catalogSrc),
    "No Save/Undo/Redo/Export/Open shortcuts",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — registryBuilder                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "registryBuilder";

  const regSrc = existsSync(join(repoRoot, SHORTCUT_REGISTRATION))
    ? stripComments(read(SHORTCUT_REGISTRATION))
    : "";
  const builderSrc = existsSync(join(repoRoot, SHORTCUT_BUILDER))
    ? stripComments(read(SHORTCUT_BUILDER))
    : "";

  assertCase(
    block,
    "reg.create",
    /export\s+function\s+createShortcutRegistration\s*\(/.test(regSrc),
    "createShortcutRegistration exported",
  );
  assertCase(
    block,
    "reg.register",
    /\bregisterShortcut\s*\(/.test(regSrc),
    "registerShortcut present",
  );
  assertCase(
    block,
    "reg.duplicates",
    /\bgetDuplicates\s*\(/.test(regSrc),
    "getDuplicates present",
  );
  assertCase(
    block,
    "reg.dupGuard",
    /byId\.has|duplicates\.push/.test(regSrc),
    "Duplicate guard present",
  );
  assertCase(
    block,
    "builder.build",
    /export\s+function\s+buildShortcutRegistry\s*\(/.test(builderSrc),
    "buildShortcutRegistry exported",
  );
  assertCase(
    block,
    "builder.consumesCatalog",
    /SHORTCUT_CATALOG/.test(builderSrc),
    "Builder consumes SHORTCUT_CATALOG",
  );
  assertCase(
    block,
    "builder.singleton",
    /export\s+const\s+shortcutRegistry\s*[:=]/.test(builderSrc),
    "shortcutRegistry singleton exported",
  );
  assertCase(
    block,
    "builder.createRegistry",
    /createShortcutRegistry\s*\(/.test(builderSrc),
    "Builder calls createShortcutRegistry",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — registryApi                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "registryApi";

  const registrySrc = existsSync(join(repoRoot, SHORTCUT_REGISTRY))
    ? stripComments(read(SHORTCUT_REGISTRY))
    : "";
  const apiBody = extractInterfaceBody(registrySrc, "ShortcutRegistryApi");

  assertCase(
    block,
    "api.interface",
    /export\s+interface\s+ShortcutRegistryApi\s*\{/.test(registrySrc),
    "ShortcutRegistryApi interface exported",
  );
  assertCase(
    block,
    "api.get",
    /\bget\s*\(/.test(apiBody),
    "get() on ShortcutRegistryApi",
  );
  assertCase(
    block,
    "api.has",
    /\bhas\s*\(/.test(apiBody),
    "has() on ShortcutRegistryApi",
  );
  assertCase(
    block,
    "api.size",
    /\bsize\s*\(/.test(apiBody),
    "size() on ShortcutRegistryApi",
  );
  assertCase(
    block,
    "api.getAll",
    /\bgetAll\s*\(/.test(apiBody),
    "getAll() on ShortcutRegistryApi",
  );
  assertCase(
    block,
    "api.noFindByShortcut",
    !/\bfindByShortcut\b/.test(apiBody) &&
      !/\bfindByShortcut\b/.test(registrySrc),
    "No findByShortcut on registry",
  );
  assertCase(
    block,
    "api.noMutators",
    !/\bregister\b/.test(apiBody) &&
      !/\bset\b/.test(apiBody) &&
      !/\bdelete\b/.test(apiBody) &&
      !/\bclear\b/.test(apiBody),
    "No mutators on ShortcutRegistryApi",
  );
  assertCase(
    block,
    "api.create",
    /export\s+function\s+createShortcutRegistry\s*\(/.test(registrySrc),
    "createShortcutRegistry exported",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — resolverContract                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "resolverContract";

  const resolverSrc = existsSync(join(repoRoot, SHORTCUT_RESOLVER))
    ? stripComments(read(SHORTCUT_RESOLVER))
    : "";
  const resolverType = extractReadonlyTypeBody(resolverSrc, "ShortcutResolver");
  const createBody = extractFunctionBody(resolverSrc, "createShortcutResolver");

  assertCase(
    block,
    "resolver.type",
    /export\s+type\s+ShortcutResolver\s*=/.test(resolverSrc),
    "ShortcutResolver type exported",
  );
  assertCase(
    block,
    "resolver.resolve",
    /\bresolve\s*\(/.test(resolverType),
    "resolve() on ShortcutResolver",
  );
  assertCase(
    block,
    "resolver.create",
    /export\s+function\s+createShortcutResolver\s*\(/.test(resolverSrc),
    "createShortcutResolver exported",
  );
  assertCase(
    block,
    "resolver.usesGetAll",
    /\.getAll\s*\(/.test(createBody),
    "Resolver builds index from getAll()",
  );
  assertCase(
    block,
    "resolver.returnsCommandId",
    /CommandId/.test(resolverSrc) && /index\.get|Map/.test(createBody),
    "Resolver maps key → CommandId via private index",
  );
  assertCase(
    block,
    "resolver.noDispatch",
    !/\bdispatch\b/.test(resolverSrc) &&
      !/\bexecute\b/.test(resolverSrc) &&
      !/\bpipeline\b/i.test(resolverSrc),
    "Resolver does not dispatch/execute",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — diagnostics                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "diagnostics";

  const diagSrc = existsSync(join(repoRoot, SHORTCUT_DIAGNOSTICS))
    ? stripComments(read(SHORTCUT_DIAGNOSTICS))
    : "";
  const reportBody = extractReadonlyTypeBody(
    diagSrc,
    "ShortcutDiagnosticsReport",
  );

  assertCase(
    block,
    "diag.report",
    /export\s+type\s+ShortcutDiagnosticsReport\s*=/.test(diagSrc),
    "ShortcutDiagnosticsReport type exported",
  );
  assertCase(
    block,
    "diag.create",
    /export\s+function\s+createShortcutDiagnosticsReport\s*\(/.test(diagSrc),
    "createShortcutDiagnosticsReport exported",
  );
  assertCase(
    block,
    "diag.count",
    /\bcount\b/.test(reportBody),
    "Report has count",
  );
  assertCase(
    block,
    "diag.ids",
    /\bids\b/.test(reportBody),
    "Report has ids",
  );
  assertCase(
    block,
    "diag.shortcuts",
    /\bshortcuts\b/.test(reportBody),
    "Report has shortcuts",
  );
  assertCase(
    block,
    "diag.duplicates",
    /\bduplicates\b/.test(reportBody),
    "Report has duplicates",
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

  const defSrc = existsSync(join(repoRoot, SHORTCUT_DEFINITION))
    ? stripComments(read(SHORTCUT_DEFINITION))
    : "";
  const defBody = extractReadonlyTypeBody(defSrc, "ShortcutDefinition");
  assertCase(
    block,
    "freeze.definitionShape",
    /\bid\b/.test(defBody) &&
      /\bkey\b/.test(defBody) &&
      /\bcommandId\b/.test(defBody) &&
      !/\benabled\b/.test(defBody) &&
      !/\bhandler\b/.test(defBody) &&
      !/\bexecute\b/.test(defBody) &&
      !/\bcallback\b/.test(defBody) &&
      !/\bscope\b/.test(defBody) &&
      !/\bpriority\b/.test(defBody) &&
      !/\bplatform\b/.test(defBody),
    "ShortcutDefinition = { id, key, commandId } only",
  );

  const ctxSrc = existsSync(join(repoRoot, SHORTCUT_CONTEXT))
    ? stripComments(read(SHORTCUT_CONTEXT))
    : "";
  const ctxBody = extractReadonlyTypeBody(ctxSrc, "ShortcutContextValue");
  assertCase(
    block,
    "freeze.contextValue",
    /\bregistry\b/.test(ctxBody) &&
      !/\bresolver\b/.test(ctxBody) &&
      !/\bdispatch\b/.test(ctxBody),
    "ShortcutContextValue = { registry } only",
  );

  const providerSrc = existsSync(join(repoRoot, SHORTCUT_PROVIDER))
    ? stripComments(read(SHORTCUT_PROVIDER))
    : "";
  const providerBody = extractFunctionBody(providerSrc, "ShortcutProvider");
  assertCase(
    block,
    "freeze.providerPrivateResolver",
    /createShortcutResolver/.test(providerBody) &&
      /useRef/.test(providerBody) &&
      /void\s+resolverRef/.test(providerBody) &&
      !/resolver\s*:/.test(providerBody),
    "Provider owns resolver privately via useRef",
  );

  const hookSrc = existsSync(join(repoRoot, USE_SHORTCUTS))
    ? stripComments(read(USE_SHORTCUTS))
    : "";
  const hookBody = extractFunctionBody(hookSrc, "useShortcuts");
  assertCase(
    block,
    "freeze.hookReadOnly",
    /useContext\s*\(\s*ShortcutContext\s*\)/.test(hookBody) &&
      !/\bdispatch\b/.test(hookBody) &&
      !/\bresolve\b/.test(hookBody),
    "useShortcuts is read-only Context access",
  );

  const bridgeSrc = existsSync(join(repoRoot, SHORTCUT_BRIDGE))
    ? stripComments(read(SHORTCUT_BRIDGE))
    : "";
  const bridgeBody = extractFunctionBody(bridgeSrc, "ShortcutBridge");
  assertCase(
    block,
    "freeze.bridgePassThrough",
    /useShortcuts\s*\(/.test(bridgeBody) &&
      (/return\s+<>\s*\{\s*children\s*\}\s*<\/>/.test(bridgeBody) ||
        /return\s+children/.test(bridgeBody)) &&
      !/\bresolve\b/.test(bridgeBody) &&
      !/\bdispatch\b/.test(bridgeBody),
    "ShortcutBridge remains pass-through",
  );

  // Prior Commands contracts remain intact (shape checks).
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

  const uiIndex = existsSync(join(repoRoot, UI_INDEX))
    ? stripComments(read(UI_INDEX))
    : "";
  assertCase(
    block,
    "freeze.publicBarrelIntact",
    !/\bshortcuts\b/.test(uiIndex) &&
      !/ShortcutProvider/.test(uiIndex) &&
      !/shortcutRegistry/.test(uiIndex) &&
      !/useShortcuts/.test(uiIndex) &&
      !/\bcommands\b/.test(uiIndex) &&
      !/CommandProvider/.test(uiIndex),
    "src/ui/index.ts does not export shortcuts or commands",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — noBrowserEvents                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noBrowserEvents";

  const shortcutFiles = walkFiles(join(repoRoot, SHORTCUTS_DIR));
  let hasForbiddenBrowser = false;
  for (const full of shortcutFiles) {
    const src = stripComments(readFileSync(full, "utf8"));
    for (const re of FORBIDDEN_BROWSER) {
      if (re.test(src)) {
        hasForbiddenBrowser = true;
      }
    }
  }

  assertCase(
    block,
    "browser.noDomApis",
    !hasForbiddenBrowser,
    "No window/document/KeyboardEvent/addEventListener/onKeyDown under shortcuts/",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — noExecution                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noExecution";

  const shortcutFiles = walkFiles(join(repoRoot, SHORTCUTS_DIR));
  let hasForbiddenExec = false;
  let hasExecuteMethod = false;
  let pureHasReact = false;

  for (const full of shortcutFiles) {
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

    if ((PURE_SHORTCUT_MODULES as readonly string[]).includes(rel)) {
      if (/\bfrom\s+["']react["']/.test(src) || /"use client"/.test(raw)) {
        pureHasReact = true;
      }
    }
  }

  assertCase(
    block,
    "exec.noHandlerCallbackPipeline",
    !hasForbiddenExec,
    "No handler/callback/preventDefault/pipeline.dispatch under shortcuts/",
  );
  assertCase(
    block,
    "exec.noExecuteMethod",
    !hasExecuteMethod,
    "No execute() under shortcuts/",
  );
  assertCase(
    block,
    "exec.pureModulesReactFree",
    !pureHasReact,
    "Pure shortcut modules remain React-free",
  );

  for (const rel of REACT_SHORTCUT_MODULES) {
    const raw = existsSync(join(repoRoot, rel)) ? read(rel) : "";
    assertCase(
      block,
      `exec.reactAllowed.${rel.split("/").pop()}`,
      /"use client"/.test(raw),
      `${rel} is a client React module`,
    );
  }

  // No production mount outside shortcuts/
  const srcRoot = join(repoRoot, "src");
  const allSrc = walkFiles(srcRoot);
  let productWire = false;
  for (const full of allSrc) {
    const rel = relative(repoRoot, full).replace(/\\/g, "/");
    if (rel.startsWith("src/ui/shortcuts/")) continue;
    const src = stripComments(readFileSync(full, "utf8"));
    if (
      /ShortcutProvider/.test(src) ||
      /ShortcutBridge/.test(src) ||
      /from\s+["']@\/ui\/shortcuts/.test(src) ||
      /from\s+["']\.\.?\/.*shortcuts/.test(src)
    ) {
      productWire = true;
      break;
    }
  }

  assertCase(
    block,
    "exec.noProductionMount",
    !productWire,
    "No ShortcutProvider/Bridge import outside src/ui/shortcuts/",
  );

  const doc = existsSync(join(repoRoot, DOC_6_4)) ? read(DOC_6_4) : "";
  assertCase(
    block,
    "exec.docNoProduction",
    /NO production mount/i.test(doc) || /sin montaje en producción/i.test(doc),
    "UX-6.4.md documents no production mount",
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
  { id: "shortcutStructure", ca: "CA-UX-6.4.1" },
  { id: "shortcutCatalog", ca: "CA-UX-6.4.2" },
  { id: "registryBuilder", ca: "CA-UX-6.4.3" },
  { id: "registryApi", ca: "CA-UX-6.4.4" },
  { id: "resolverContract", ca: "CA-UX-6.4.5" },
  { id: "diagnostics", ca: "CA-UX-6.4.6" },
  { id: "apiFreeze", ca: "CA-UX-6.4.7" },
  { id: "noBrowserEvents", ca: "CA-UX-6.4.8" },
  { id: "noExecution", ca: "CA-UX-6.4.9" },
  { id: "tscCompile", ca: "CA-UX-6.4.10" },
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
