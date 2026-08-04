/**
 * UX-6.1 — Command System Foundation gate.
 *
 * Blocks:
 * structureExists · definitionContract · registryContract · stateContract
 * providerContract · hookContract · bridgeContract · diagnosticsContract
 * apiFreezeFences · tscCompile
 *
 * Architectural principles:
 * - CommandRegistryApi + empty commandRegistry (empty by design).
 * - Definition = { id } · State = { id, enabled, visible }.
 * - Provider owns registry + states · useCommands read-only · Bridge pass-through.
 * - No execution · no shortcuts · no product wiring · decoupling fence.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "structureExists"
  | "definitionContract"
  | "registryContract"
  | "stateContract"
  | "providerContract"
  | "hookContract"
  | "bridgeContract"
  | "diagnosticsContract"
  | "apiFreezeFences"
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
const UI_INDEX = "src/ui/index.ts";
const ROADMAP_6 = "docs/UX/UX-6.0-roadmap.md";
const DOC_6_1 = "docs/UX/UX-6.1.md";
const PACKAGE_JSON = "package.json";

const PURE_MODULES = [
  COMMAND_TYPES,
  COMMAND_DEFINITION,
  COMMAND_REGISTRY,
  COMMAND_STATE,
  COMMAND_DIAGNOSTICS,
] as const;

const FORBIDDEN_EXEC = [
  /\bexecute\b/i,
  /\bhandler\b/i,
  /\bcallback\b/i,
  /\bdispatcher\b/i,
  /\bexecutor\b/i,
  /\bshortcut\b/i,
  /\bpalette\b/i,
  /\bonClick\b/,
  /\bonKeyDown\b/,
  /\baddEventListener\b/,
];

/* -------------------------------------------------------------------------- */
/* PASS 01 — structureExists                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "structureExists";

  assertCase(
    block,
    "exists.dir",
    existsSync(join(repoRoot, COMMANDS_DIR)),
    "src/ui/commands/ exists",
  );

  for (const [id, rel] of [
    ["exists.CommandTypes", COMMAND_TYPES],
    ["exists.CommandDefinition", COMMAND_DEFINITION],
    ["exists.CommandRegistry", COMMAND_REGISTRY],
    ["exists.CommandState", COMMAND_STATE],
    ["exists.CommandContext", COMMAND_CONTEXT],
    ["exists.CommandProvider", COMMAND_PROVIDER],
    ["exists.useCommands", USE_COMMANDS],
    ["exists.CommandBridge", COMMAND_BRIDGE],
    ["exists.CommandDiagnostics", COMMAND_DIAGNOSTICS],
    ["exists.index", COMMANDS_INDEX],
  ] as const) {
    assertCase(block, id, existsSync(join(repoRoot, rel)), `${rel} exists`);
  }

  assertCase(
    block,
    "exists.roadmap",
    existsSync(join(repoRoot, ROADMAP_6)),
    `${ROADMAP_6} exists`,
  );

  assertCase(
    block,
    "exists.doc",
    existsSync(join(repoRoot, DOC_6_1)),
    `${DOC_6_1} exists`,
  );

  const pkg = existsSync(join(repoRoot, PACKAGE_JSON))
    ? read(PACKAGE_JSON)
    : "";
  assertCase(
    block,
    "exists.npmScript",
    /"validate:ux-6\.1"\s*:/.test(pkg),
    "package.json has validate:ux-6.1",
  );

  const doc = existsSync(join(repoRoot, DOC_6_1)) ? read(DOC_6_1) : "";
  assertCase(
    block,
    "doc.emptyRegistryDecision",
    /Registration is intentionally deferred to UX-6\.2/.test(doc) &&
      /registry remains empty by design/i.test(doc) &&
      /No production commands are created or mounted/i.test(doc),
    "UX-6.1.md documents empty registry by design",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — definitionContract                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "definitionContract";

  const typesSrc = existsSync(join(repoRoot, COMMAND_TYPES))
    ? stripComments(read(COMMAND_TYPES))
    : "";
  const defSrc = existsSync(join(repoRoot, COMMAND_DEFINITION))
    ? stripComments(read(COMMAND_DEFINITION))
    : "";

  assertCase(
    block,
    "types.CommandIdBranded",
    /export\s+type\s+CommandId\s*=\s*string\s*&\s*\{\s*readonly\s+__brand:\s*["']CommandId["']\s*\}/.test(
      typesSrc,
    ),
    "CommandId is branded string",
  );

  assertCase(
    block,
    "types.asCommandId",
    /export\s+function\s+asCommandId\s*\(/.test(typesSrc),
    "asCommandId() helper exported",
  );

  const body = extractReadonlyTypeBody(defSrc, "CommandDefinition");
  assertCase(
    block,
    "def.idOnly",
    /readonly\s+id\s*:\s*CommandId/.test(body) &&
      !/\benabled\b/.test(body) &&
      !/\bvisible\b/.test(body) &&
      !/\bshortcut\b/.test(body) &&
      !/\bicon\b/.test(body) &&
      !/\bcategory\b/.test(body) &&
      !/\bexecute\b/.test(body),
    "CommandDefinition = { id } only",
  );

  assertCase(
    block,
    "def.create",
    /export\s+function\s+createCommandDefinition\s*\(/.test(defSrc) &&
      /Object\.freeze/.test(defSrc),
    "createCommandDefinition uses Object.freeze",
  );

  assertCase(
    block,
    "def.noReact",
    !/\bfrom\s+["']react["']/.test(defSrc) &&
      !/\bfrom\s+["']react-dom["']/.test(defSrc),
    "CommandDefinition is React-free",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — registryContract                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "registryContract";

  const src = existsSync(join(repoRoot, COMMAND_REGISTRY))
    ? stripComments(read(COMMAND_REGISTRY))
    : "";

  assertCase(
    block,
    "registry.apiInterface",
    /export\s+interface\s+CommandRegistryApi\s*\{/.test(src),
    "CommandRegistryApi interface exported",
  );

  assertCase(
    block,
    "registry.noTypeCommandRegistry",
    !/export\s+type\s+CommandRegistry\b/.test(src) &&
      !/export\s+interface\s+CommandRegistry\b/.test(src) &&
      !/export\s+class\s+CommandRegistry\b/.test(src),
    "No type/interface/class named CommandRegistry",
  );

  assertCase(
    block,
    "registry.queryOnly",
    /\bget\s*\(/.test(src) &&
      /\bhas\s*\(/.test(src) &&
      /\bsize\s*\(/.test(src) &&
      /\bgetAll\s*\(/.test(src) &&
      !/\bregister\b/.test(src) &&
      !/\bset\s*\(/.test(src) &&
      !/\bdelete\s*\(/.test(src) &&
      !/\bclear\s*\(/.test(src),
    "Registry is query-only (get/has/size/getAll)",
  );

  assertCase(
    block,
    "registry.create",
    /export\s+function\s+createCommandRegistry\s*\(/.test(src) &&
      /Object\.freeze/.test(src),
    "createCommandRegistry freezes API",
  );

  assertCase(
    block,
    "registry.singleton",
    /export\s+const\s+commandRegistry\s*:\s*CommandRegistryApi\s*=\s*createCommandRegistry\s*\(\s*\)/.test(
      src,
    ),
    "commandRegistry empty singleton SSOT",
  );

  assertCase(
    block,
    "registry.emptySeed",
    /EMPTY_COMMAND_DEFINITIONS/.test(src) &&
      /Object\.freeze\(\s*\[\s*\]\s*\)/.test(src),
    "EMPTY_COMMAND_DEFINITIONS is frozen empty array",
  );

  assertCase(
    block,
    "registry.noReact",
    !/\bfrom\s+["']react["']/.test(src) &&
      !/\bfrom\s+["']react-dom["']/.test(src),
    "CommandRegistry is React-free",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — stateContract                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "stateContract";

  const src = existsSync(join(repoRoot, COMMAND_STATE))
    ? stripComments(read(COMMAND_STATE))
    : "";
  const body = extractReadonlyTypeBody(src, "CommandState");

  assertCase(
    block,
    "state.fields",
    /readonly\s+id\s*:\s*CommandId/.test(body) &&
      /readonly\s+enabled\s*:\s*boolean/.test(body) &&
      /readonly\s+visible\s*:\s*boolean/.test(body),
    "CommandState = { id, enabled, visible }",
  );

  assertCase(
    block,
    "state.noExtra",
    !/\bshortcut\b/.test(body) &&
      !/\bhandler\b/.test(body) &&
      !/\bexecute\b/.test(body) &&
      !/\bstatus\b/.test(body),
    "CommandState has no extra forbidden fields",
  );

  assertCase(
    block,
    "state.create",
    /export\s+function\s+createCommandState\s*\(/.test(src) &&
      /Object\.freeze/.test(src),
    "createCommandState uses Object.freeze",
  );

  assertCase(
    block,
    "state.isolatedFile",
    existsSync(join(repoRoot, COMMAND_STATE)) &&
      existsSync(join(repoRoot, COMMAND_DEFINITION)) &&
      COMMAND_STATE.endsWith("CommandState.ts") &&
      COMMAND_DEFINITION.endsWith("CommandDefinition.ts"),
    "State is a separate module from Definition",
  );

  assertCase(
    block,
    "state.noReact",
    !/\bfrom\s+["']react["']/.test(src) &&
      !/\bfrom\s+["']react-dom["']/.test(src),
    "CommandState is React-free",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — providerContract                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "providerContract";

  const ctxSrc = existsSync(join(repoRoot, COMMAND_CONTEXT))
    ? stripComments(read(COMMAND_CONTEXT))
    : "";
  const provSrc = existsSync(join(repoRoot, COMMAND_PROVIDER))
    ? stripComments(read(COMMAND_PROVIDER))
    : "";

  const ctxBody = extractReadonlyTypeBody(ctxSrc, "CommandContextValue");
  assertCase(
    block,
    "context.valueShape",
    /registry\s*:\s*CommandRegistryApi/.test(ctxBody) &&
      /states\s*:\s*ReadonlyMap\s*<\s*CommandId\s*,\s*CommandState\s*>/.test(
        ctxBody,
      ),
    "CommandContextValue = { registry, states }",
  );

  assertCase(
    block,
    "context.createContext",
    /createContext\s*<\s*CommandContextValue\s*\|\s*null\s*>\s*\(\s*null\s*\)/.test(
      ctxSrc,
    ),
    "CommandContext defaults to null",
  );

  assertCase(
    block,
    "provider.exports",
    /export\s+function\s+CommandProvider\s*\(/.test(provSrc),
    "CommandProvider exported",
  );

  assertCase(
    block,
    "provider.ownsRegistry",
    /commandRegistry/.test(provSrc) && /registryRef|registry:/.test(provSrc),
    "Provider owns/exposes registry",
  );

  assertCase(
    block,
    "provider.ownsStates",
    /useRef\s*<\s*ReadonlyMap\s*<\s*CommandId\s*,\s*CommandState\s*>>/.test(
      provSrc,
    ) || /ReadonlyMap\s*<\s*CommandId\s*,\s*CommandState\s*>/.test(provSrc),
    "Provider owns ReadonlyMap states",
  );

  assertCase(
    block,
    "provider.noMutableHooks",
    !/\buseState\b/.test(provSrc) && !/\buseReducer\b/.test(provSrc),
    "Provider has no useState/useReducer",
  );

  assertCase(
    block,
    "provider.noSetters",
    !/\bsetState\b/.test(provSrc) &&
      !/\bdispatch\b/.test(provSrc) &&
      !/\bregister\b/.test(provSrc),
    "Provider has no setters/dispatch/register",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — hookContract                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "hookContract";

  const src = existsSync(join(repoRoot, USE_COMMANDS))
    ? stripComments(read(USE_COMMANDS))
    : "";
  const body = extractFunctionBody(src, "useCommands");

  assertCase(
    block,
    "hook.exports",
    /export\s+function\s+useCommands\s*\(/.test(src),
    "useCommands() exported",
  );

  assertCase(
    block,
    "hook.usesContext",
    /useContext\s*\(\s*CommandContext\s*\)/.test(src),
    "useCommands reads CommandContext",
  );

  assertCase(
    block,
    "hook.errorContract",
    /Command hooks must be used inside CommandProvider/.test(src),
    "Exact Provider-required error message",
  );

  assertCase(
    block,
    "hook.readOnly",
    !/\bsetState\b/.test(body) &&
      !/\bdispatch\b/.test(body) &&
      !/\bexecute\b/.test(body) &&
      !/\bregister\b/.test(body) &&
      /return\s+context/.test(body),
    "useCommands is read-only (returns context)",
  );

  assertCase(
    block,
    "hook.returnType",
    /:\s*CommandContextValue/.test(src),
    "useCommands returns CommandContextValue",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — bridgeContract                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "bridgeContract";

  const src = existsSync(join(repoRoot, COMMAND_BRIDGE))
    ? stripComments(read(COMMAND_BRIDGE))
    : "";
  const body = extractFunctionBody(src, "CommandBridge");

  assertCase(
    block,
    "bridge.exports",
    /export\s+function\s+CommandBridge\s*\(/.test(src),
    "CommandBridge exported",
  );

  assertCase(
    block,
    "bridge.usesHook",
    /useCommands\s*\(\s*\)/.test(body),
    "Bridge calls useCommands() for availability",
  );

  assertCase(
    block,
    "bridge.passThrough",
    /return\s+<>\s*\{\s*children\s*\}\s*<\/>/.test(body) ||
      /return\s+children/.test(body),
    "Bridge returns children pass-through",
  );

  assertCase(
    block,
    "bridge.noLogic",
    !/\.states\b/.test(body) &&
      !/\.registry\b/.test(body) &&
      !/\bexecute\b/.test(body) &&
      !/\bif\s*\(/.test(body) &&
      !/\bmap\s*\(/.test(body),
    "Bridge has no business logic / no map consumption",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — diagnosticsContract                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "diagnosticsContract";

  const src = existsSync(join(repoRoot, COMMAND_DIAGNOSTICS))
    ? stripComments(read(COMMAND_DIAGNOSTICS))
    : "";
  const reportBody = extractReadonlyTypeBody(src, "CommandDiagnosticsReport");

  assertCase(
    block,
    "diag.noClass",
    !/\bclass\s+CommandDiagnostics\b/.test(src) &&
      !/\bnew\s+CommandDiagnostics\b/.test(src),
    "Diagnostics is not a class",
  );

  assertCase(
    block,
    "diag.factory",
    /export\s+function\s+createCommandDiagnosticsReport\s*\(/.test(src),
    "createCommandDiagnosticsReport exported",
  );

  assertCase(
    block,
    "diag.reportShape",
    /\bcount\s*:\s*number/.test(reportBody) &&
      /\bids\s*:\s*readonly\s+CommandId\s*\[\]/.test(reportBody) &&
      /\benabled\s*:\s*readonly\s+CommandId\s*\[\]/.test(reportBody) &&
      /\bvisible\s*:\s*readonly\s+CommandId\s*\[\]/.test(reportBody),
    "Report = { count, ids, enabled, visible }",
  );

  assertCase(
    block,
    "diag.freeze",
    /Object\.freeze/.test(src),
    "Diagnostics report is frozen",
  );

  assertCase(
    block,
    "diag.noReact",
    !/\bfrom\s+["']react["']/.test(src) &&
      !/\bfrom\s+["']react-dom["']/.test(src) &&
      !/"use client"/.test(read(COMMAND_DIAGNOSTICS)),
    "CommandDiagnostics is React-free",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — apiFreezeFences                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "apiFreezeFences";

  const commandFiles = walkFiles(join(repoRoot, COMMANDS_DIR));
  let hasForbiddenExec = false;
  let hasReactDom = false;
  let hasWindow = false;
  let hasDocument = false;
  let hasKeyboard = false;
  let hasMouse = false;
  let hasUiComponentImport = false;
  let hasRuntimeDep = false;
  let pureHasReact = false;

  for (const full of commandFiles) {
    const rel = relative(repoRoot, full).replace(/\\/g, "/");
    const raw = readFileSync(full, "utf8");
    const src = stripComments(raw);

    for (const re of FORBIDDEN_EXEC) {
      if (re.test(src)) {
        // Allow the word only in comments already stripped; flag code hits
        // Exception: diagnostics field names enabled/visible are fine;
        // "execute" etc. must not appear in code.
        if (
          re.source.includes("execute") ||
          re.source.includes("handler") ||
          re.source.includes("callback") ||
          re.source.includes("dispatcher") ||
          re.source.includes("executor") ||
          re.source.includes("shortcut") ||
          re.source.includes("palette") ||
          re.source.includes("onClick") ||
          re.source.includes("onKeyDown") ||
          re.source.includes("addEventListener")
        ) {
          hasForbiddenExec = true;
        }
      }
    }

    if (/from\s+["']react-dom["']/.test(src) || /require\s*\(\s*["']react-dom["']/.test(src)) {
      hasReactDom = true;
    }
    if (/\bwindow\b/.test(src)) hasWindow = true;
    if (/\bdocument\b/.test(src)) hasDocument = true;
    if (/\bKeyboardEvent\b/.test(src)) hasKeyboard = true;
    if (/\bMouseEvent\b/.test(src)) hasMouse = true;

    if (
      /from\s+["']@\/components\//.test(src) ||
      /from\s+["']\.\.\/.*components\//.test(src) ||
      /from\s+["']@\/app\//.test(src)
    ) {
      hasUiComponentImport = true;
    }

    if (/theme\/runtime/.test(src) || /from\s+["']@\/ui\/theme\/runtime/.test(src)) {
      hasRuntimeDep = true;
    }

    if ((PURE_MODULES as readonly string[]).includes(rel)) {
      if (/\bfrom\s+["']react["']/.test(src) || /"use client"/.test(raw)) {
        pureHasReact = true;
      }
    }
  }

  assertCase(
    block,
    "fence.noExecutionSurface",
    !hasForbiddenExec,
    "No execute/handler/callback/dispatcher/executor/shortcut/palette/events",
  );

  assertCase(
    block,
    "fence.noReactDom",
    !hasReactDom,
    "No react-dom imports under commands/",
  );

  assertCase(
    block,
    "fence.noWindow",
    !hasWindow,
    "No window references under commands/",
  );

  assertCase(
    block,
    "fence.noDocument",
    !hasDocument,
    "No document references under commands/",
  );

  assertCase(
    block,
    "fence.noKeyboardEvent",
    !hasKeyboard,
    "No KeyboardEvent under commands/",
  );

  assertCase(
    block,
    "fence.noMouseEvent",
    !hasMouse,
    "No MouseEvent under commands/",
  );

  assertCase(
    block,
    "fence.noUiComponents",
    !hasUiComponentImport,
    "No UI product component imports under commands/",
  );

  assertCase(
    block,
    "fence.noRuntimeDep",
    !hasRuntimeDep,
    "No theme/runtime imports under commands/",
  );

  assertCase(
    block,
    "fence.pureModulesReactFree",
    !pureHasReact,
    "Pure modules remain React-free",
  );

  // No product wiring: CommandProvider/Bridge must not appear outside commands/
  const srcRoot = join(repoRoot, "src");
  const allSrc = walkFiles(srcRoot);
  let productWire = false;
  for (const full of allSrc) {
    const rel = relative(repoRoot, full).replace(/\\/g, "/");
    if (rel.startsWith("src/ui/commands/")) continue;
    const src = stripComments(readFileSync(full, "utf8"));
    if (
      /CommandProvider/.test(src) ||
      /CommandBridge/.test(src) ||
      /from\s+["']@\/ui\/commands/.test(src) ||
      /from\s+["']\.\.?\/.*commands/.test(src)
    ) {
      // Allow mentions only in docs (not under src). Any src outside commands is wire.
      productWire = true;
      break;
    }
  }

  assertCase(
    block,
    "fence.noProductWire",
    !productWire,
    "No CommandProvider/Bridge/commands import outside src/ui/commands/",
  );

  const uiIndex = existsSync(join(repoRoot, UI_INDEX))
    ? stripComments(read(UI_INDEX))
    : "";
  assertCase(
    block,
    "fence.publicBarrelIntact",
    !/\bcommands\b/.test(uiIndex) &&
      !/CommandProvider/.test(uiIndex) &&
      !/commandRegistry/.test(uiIndex) &&
      !/useCommands/.test(uiIndex),
    "src/ui/index.ts does not export commands",
  );

  // Local barrel must not export React ownership surface in a way that expands public API —
  // check index does not re-export from a path that would imply @/ui expansion (already covered).
  // Ensure no type named CommandRegistry anywhere under commands/
  let hasCommandRegistryType = false;
  for (const full of commandFiles) {
    const src = stripComments(readFileSync(full, "utf8"));
    if (
      /export\s+type\s+CommandRegistry\b/.test(src) ||
      /export\s+interface\s+CommandRegistry\b/.test(src) ||
      /export\s+class\s+CommandRegistry\b/.test(src)
    ) {
      hasCommandRegistryType = true;
    }
  }
  assertCase(
    block,
    "fence.noCommandRegistryTypeName",
    !hasCommandRegistryType,
    "No exported type/interface/class CommandRegistry in commands/",
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
  { id: "structureExists", ca: "CA-UX-6.1.1" },
  { id: "definitionContract", ca: "CA-UX-6.1.2" },
  { id: "registryContract", ca: "CA-UX-6.1.3" },
  { id: "stateContract", ca: "CA-UX-6.1.4" },
  { id: "providerContract", ca: "CA-UX-6.1.5" },
  { id: "hookContract", ca: "CA-UX-6.1.6" },
  { id: "bridgeContract", ca: "CA-UX-6.1.7" },
  { id: "diagnosticsContract", ca: "CA-UX-6.1.8" },
  { id: "apiFreezeFences", ca: "CA-UX-6.1.9" },
  { id: "tscCompile", ca: "CA-UX-6.1.10" },
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
