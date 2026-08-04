/**
 * UX-6.3 — Command Execution Pipeline Foundation gate.
 *
 * Blocks:
 * executionPipelineStructure · executionContext · dispatcherStructure
 * executionResult · providerIntegration · diagnosticsPipeline
 * apiFreeze · noBusinessExecution · noProductionMount · tscCompile
 *
 * Architectural principles:
 * - Structural dispatch only (notFound | notEnabled | acknowledged).
 * - No handlers · no callbacks · no business execution.
 * - UX-6.1 Context / Provider / Hook / Bridge / Registry APIs frozen.
 * - No production mount · no @/ui barrel expansion.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "executionPipelineStructure"
  | "executionContext"
  | "dispatcherStructure"
  | "executionResult"
  | "providerIntegration"
  | "diagnosticsPipeline"
  | "apiFreeze"
  | "noBusinessExecution"
  | "noProductionMount"
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
const EXEC_TYPES = `${COMMANDS_DIR}/CommandExecutionTypes.ts`;
const EXEC_CONTEXT = `${COMMANDS_DIR}/CommandExecutionContext.ts`;
const EXEC_PIPELINE = `${COMMANDS_DIR}/CommandExecutionPipeline.ts`;
const EXEC_DISPATCHER = `${COMMANDS_DIR}/CommandExecutionDispatcher.ts`;
const EXEC_RESULT = `${COMMANDS_DIR}/CommandExecutionResult.ts`;
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
const DOC_6_3 = "docs/UX/UX-6.3.md";
const PACKAGE_JSON = "package.json";

const PURE_EXEC_MODULES = [
  EXEC_TYPES,
  EXEC_CONTEXT,
  EXEC_PIPELINE,
  EXEC_DISPATCHER,
  EXEC_RESULT,
  COMMAND_DIAGNOSTICS,
] as const;

const FORBIDDEN_BUSINESS = [
  /\bhandler\b/i,
  /\bcallback\b/i,
  /\bonClick\b/,
  /\bonKeyDown\b/,
  /\baddEventListener\b/,
  /\bshortcut\b/i,
  /\bpalette\b/i,
  /\bundo\b/i,
  /\bredo\b/i,
];

/* -------------------------------------------------------------------------- */
/* PASS 01 — executionPipelineStructure                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "executionPipelineStructure";

  for (const [id, rel] of [
    ["exists.CommandExecutionTypes", EXEC_TYPES],
    ["exists.CommandExecutionContext", EXEC_CONTEXT],
    ["exists.CommandExecutionPipeline", EXEC_PIPELINE],
    ["exists.CommandExecutionDispatcher", EXEC_DISPATCHER],
    ["exists.CommandExecutionResult", EXEC_RESULT],
    ["exists.doc", DOC_6_3],
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
    /"validate:ux-6\.3"\s*:/.test(pkg),
    "package.json has validate:ux-6.3",
  );

  const pipelineSrc = existsSync(join(repoRoot, EXEC_PIPELINE))
    ? stripComments(read(EXEC_PIPELINE))
    : "";
  assertCase(
    block,
    "pipeline.type",
    /export\s+type\s+CommandExecutionPipeline\s*=/.test(pipelineSrc),
    "CommandExecutionPipeline type exported",
  );
  assertCase(
    block,
    "pipeline.create",
    /export\s+function\s+createCommandExecutionPipeline\s*\(/.test(
      pipelineSrc,
    ),
    "createCommandExecutionPipeline exported",
  );
  assertCase(
    block,
    "pipeline.dispatch",
    /\bdispatch\s*\(/.test(pipelineSrc),
    "Pipeline exposes dispatch()",
  );
  assertCase(
    block,
    "pipeline.getContext",
    /\bgetContext\s*\(/.test(pipelineSrc),
    "Pipeline exposes getContext()",
  );
  assertCase(
    block,
    "pipeline.freeze",
    /Object\.freeze/.test(pipelineSrc),
    "Pipeline is frozen",
  );
  assertCase(
    block,
    "pipeline.noReact",
    !/\bfrom\s+["']react["']/.test(pipelineSrc) &&
      !/"use client"/.test(read(EXEC_PIPELINE)),
    "CommandExecutionPipeline is React-free",
  );

  const typesSrc = existsSync(join(repoRoot, EXEC_TYPES))
    ? stripComments(read(EXEC_TYPES))
    : "";
  const reqBody = extractReadonlyTypeBody(typesSrc, "CommandExecutionRequest");
  assertCase(
    block,
    "request.commandIdOnly",
    /readonly\s+commandId\s*:\s*CommandId/.test(reqBody) &&
      !/\bpayload\b/.test(reqBody) &&
      !/\bargs\b/.test(reqBody),
    "CommandExecutionRequest = { commandId } only",
  );
  assertCase(
    block,
    "request.create",
    /export\s+function\s+createCommandExecutionRequest\s*\(/.test(typesSrc) &&
      /Object\.freeze/.test(typesSrc),
    "createCommandExecutionRequest uses Object.freeze",
  );

  const indexSrc = existsSync(join(repoRoot, COMMANDS_INDEX))
    ? stripComments(read(COMMANDS_INDEX))
    : "";
  assertCase(
    block,
    "index.exportsPipeline",
    /createCommandExecutionPipeline/.test(indexSrc) &&
      /createCommandExecutionRequest/.test(indexSrc) &&
      /createCommandExecutionDispatcher/.test(indexSrc) &&
      /createCommandExecutionResult/.test(indexSrc) &&
      /createCommandExecutionContext/.test(indexSrc),
    "Local barrel exports execution surface",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — executionContext                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "executionContext";

  const src = existsSync(join(repoRoot, EXEC_CONTEXT))
    ? stripComments(read(EXEC_CONTEXT))
    : "";
  const body = extractReadonlyTypeBody(src, "CommandExecutionContext");

  assertCase(
    block,
    "context.shape",
    /readonly\s+registry\s*:\s*CommandRegistryApi/.test(body) &&
      /readonly\s+states\s*:\s*ReadonlyMap\s*<\s*CommandId\s*,\s*CommandState\s*>/.test(
        body,
      ),
    "CommandExecutionContext = { registry, states }",
  );
  assertCase(
    block,
    "context.create",
    /export\s+function\s+createCommandExecutionContext\s*\(/.test(src) &&
      /Object\.freeze/.test(src),
    "createCommandExecutionContext freezes context",
  );
  assertCase(
    block,
    "context.noMutators",
    !/\bsetState\b/.test(src) &&
      !/\bregister\b/.test(src) &&
      !/\bdispatch\b/.test(src),
    "Execution context has no mutators",
  );
  assertCase(
    block,
    "context.noReact",
    !/\bfrom\s+["']react["']/.test(src) &&
      !/"use client"/.test(read(EXEC_CONTEXT)),
    "CommandExecutionContext is React-free",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — dispatcherStructure                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "dispatcherStructure";

  const src = existsSync(join(repoRoot, EXEC_DISPATCHER))
    ? stripComments(read(EXEC_DISPATCHER))
    : "";

  assertCase(
    block,
    "dispatcher.type",
    /export\s+type\s+CommandExecutionDispatcher\s*=/.test(src),
    "CommandExecutionDispatcher type exported",
  );
  assertCase(
    block,
    "dispatcher.create",
    /export\s+function\s+createCommandExecutionDispatcher\s*\(/.test(src),
    "createCommandExecutionDispatcher exported",
  );
  assertCase(
    block,
    "dispatcher.dispatch",
    /\bdispatch\s*\(/.test(src),
    "Dispatcher exposes dispatch()",
  );
  assertCase(
    block,
    "dispatcher.statuses",
    /"notFound"/.test(src) &&
      /"notEnabled"/.test(src) &&
      /"acknowledged"/.test(src),
    "Dispatcher uses structural status triad",
  );
  assertCase(
    block,
    "dispatcher.noHandlerLookup",
    !/\bhandler\b/i.test(src) &&
      !/\bcallback\b/i.test(src) &&
      !/\.execute\b/.test(src),
    "Dispatcher has no handler/callback/execute lookup",
  );
  assertCase(
    block,
    "dispatcher.freeze",
    /Object\.freeze/.test(src),
    "Dispatcher is frozen",
  );
  assertCase(
    block,
    "dispatcher.noReact",
    !/\bfrom\s+["']react["']/.test(src) &&
      !/"use client"/.test(read(EXEC_DISPATCHER)),
    "CommandExecutionDispatcher is React-free",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — executionResult                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "executionResult";

  const src = existsSync(join(repoRoot, EXEC_RESULT))
    ? stripComments(read(EXEC_RESULT))
    : "";
  const body = extractReadonlyTypeBody(src, "CommandExecutionResult");
  const typesSrc = existsSync(join(repoRoot, EXEC_TYPES))
    ? stripComments(read(EXEC_TYPES))
    : "";

  assertCase(
    block,
    "result.fields",
    /readonly\s+commandId\s*:\s*CommandId/.test(body) &&
      /readonly\s+status\s*:\s*CommandExecutionStatus/.test(body) &&
      /readonly\s+ok\s*:\s*boolean/.test(body),
    "CommandExecutionResult = { commandId, status, ok }",
  );
  assertCase(
    block,
    "result.noPayload",
    !/\bpayload\b/.test(body) &&
      !/\bdata\b/.test(body) &&
      !/\berror\b/.test(body) &&
      !/\bhandler\b/.test(body),
    "Result has no business payload fields",
  );
  assertCase(
    block,
    "result.create",
    /export\s+function\s+createCommandExecutionResult\s*\(/.test(src) &&
      /Object\.freeze/.test(src),
    "createCommandExecutionResult uses Object.freeze",
  );
  assertCase(
    block,
    "status.union",
    /export\s+type\s+CommandExecutionStatus\s*=/.test(typesSrc) &&
      /"notFound"/.test(typesSrc) &&
      /"notEnabled"/.test(typesSrc) &&
      /"acknowledged"/.test(typesSrc),
    "CommandExecutionStatus triad defined",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — providerIntegration                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "providerIntegration";

  const provSrc = existsSync(join(repoRoot, COMMAND_PROVIDER))
    ? stripComments(read(COMMAND_PROVIDER))
    : "";
  const ctxSrc = existsSync(join(repoRoot, COMMAND_CONTEXT))
    ? stripComments(read(COMMAND_CONTEXT))
    : "";
  const ctxBody = extractReadonlyTypeBody(ctxSrc, "CommandContextValue");

  assertCase(
    block,
    "provider.ownsPipeline",
    /createCommandExecutionPipeline/.test(provSrc) &&
      /pipelineRef/.test(provSrc),
    "Provider owns pipeline via pipelineRef",
  );
  assertCase(
    block,
    "provider.usesContextFactory",
    /createCommandExecutionContext/.test(provSrc),
    "Provider builds execution context",
  );
  assertCase(
    block,
    "provider.propsUnchanged",
    /export\s+type\s+CommandProviderProps\s*=\s*Readonly\s*<\s*\{\s*children\s*:\s*ReactNode\s*;\s*\}\s*>/.test(
      provSrc,
    ) ||
      (/children\s*:\s*ReactNode/.test(
        extractReadonlyTypeBody(provSrc, "CommandProviderProps"),
      ) &&
        !/\bpipeline\b/.test(
          extractReadonlyTypeBody(provSrc, "CommandProviderProps"),
        )),
    "CommandProviderProps remains { children } only",
  );
  assertCase(
    block,
    "context.valueFrozen",
    /registry\s*:\s*CommandRegistryApi/.test(ctxBody) &&
      /states\s*:\s*ReadonlyMap\s*<\s*CommandId\s*,\s*CommandState\s*>/.test(
        ctxBody,
      ) &&
      !/\bpipeline\b/.test(ctxBody),
    "CommandContextValue remains { registry, states } (no pipeline)",
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
      !/\bregister\b/.test(provSrc),
    "Provider has no setters/register",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — diagnosticsPipeline                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "diagnosticsPipeline";

  const src = existsSync(join(repoRoot, COMMAND_DIAGNOSTICS))
    ? stripComments(read(COMMAND_DIAGNOSTICS))
    : "";
  const reportBody = extractReadonlyTypeBody(src, "CommandDiagnosticsReport");

  assertCase(
    block,
    "diag.pipelineReady",
    /\bpipelineReady\s*:\s*boolean/.test(reportBody),
    "Report includes pipelineReady",
  );
  assertCase(
    block,
    "diag.keepsUx61Fields",
    /\bcount\s*:\s*number/.test(reportBody) &&
      /\bids\s*:\s*readonly\s+CommandId\s*\[\]/.test(reportBody) &&
      /\benabled\s*:\s*readonly\s+CommandId\s*\[\]/.test(reportBody) &&
      /\bvisible\s*:\s*readonly\s+CommandId\s*\[\]/.test(reportBody),
    "Report keeps count/ids/enabled/visible",
  );
  assertCase(
    block,
    "diag.noRegisteredAliases",
    !/\bregisteredCount\b/.test(reportBody) &&
      !/\bregisteredIds\b/.test(reportBody),
    "No redundant registeredCount/registeredIds aliases",
  );
  assertCase(
    block,
    "diag.acceptsPipeline",
    /pipeline\s*\?/.test(src) ||
      /CommandExecutionPipeline/.test(src),
    "createCommandDiagnosticsReport accepts pipeline",
  );
  assertCase(
    block,
    "diag.factory",
    /export\s+function\s+createCommandDiagnosticsReport\s*\(/.test(src) &&
      /Object\.freeze/.test(src),
    "Diagnostics factory freezes report",
  );
  assertCase(
    block,
    "diag.noReact",
    !/\bfrom\s+["']react["']/.test(src) &&
      !/"use client"/.test(read(COMMAND_DIAGNOSTICS)),
    "CommandDiagnostics is React-free",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — apiFreeze                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "apiFreeze";

  const defSrc = existsSync(join(repoRoot, COMMAND_DEFINITION))
    ? stripComments(read(COMMAND_DEFINITION))
    : "";
  const defBody = extractReadonlyTypeBody(defSrc, "CommandDefinition");
  assertCase(
    block,
    "freeze.definitionIdOnly",
    /readonly\s+id\s*:\s*CommandId/.test(defBody) &&
      !/\benabled\b/.test(defBody) &&
      !/\bexecute\b/.test(defBody) &&
      !/\bhandler\b/.test(defBody),
    "CommandDefinition remains { id } only",
  );

  const stateSrc = existsSync(join(repoRoot, COMMAND_STATE))
    ? stripComments(read(COMMAND_STATE))
    : "";
  const stateBody = extractReadonlyTypeBody(stateSrc, "CommandState");
  assertCase(
    block,
    "freeze.stateFields",
    /readonly\s+id\s*:\s*CommandId/.test(stateBody) &&
      /readonly\s+enabled\s*:\s*boolean/.test(stateBody) &&
      /readonly\s+visible\s*:\s*boolean/.test(stateBody),
    "CommandState remains { id, enabled, visible }",
  );

  const regSrc = existsSync(join(repoRoot, COMMAND_REGISTRY))
    ? stripComments(read(COMMAND_REGISTRY))
    : "";
  assertCase(
    block,
    "freeze.registryQueryOnly",
    /\bget\s*\(/.test(regSrc) &&
      /\bhas\s*\(/.test(regSrc) &&
      /\bsize\s*\(/.test(regSrc) &&
      /\bgetAll\s*\(/.test(regSrc) &&
      !/\bregister\b/.test(regSrc) &&
      !/\bdispatch\b/.test(regSrc),
    "CommandRegistryApi remains query-only",
  );

  const hookSrc = existsSync(join(repoRoot, USE_COMMANDS))
    ? stripComments(read(USE_COMMANDS))
    : "";
  const hookBody = extractFunctionBody(hookSrc, "useCommands");
  assertCase(
    block,
    "freeze.hookReadOnly",
    /Command hooks must be used inside CommandProvider/.test(hookSrc) &&
      /return\s+context/.test(hookBody) &&
      !/\bdispatch\b/.test(hookBody) &&
      !/\bpipeline\b/.test(hookBody),
    "useCommands remains read-only Context return",
  );

  const bridgeSrc = existsSync(join(repoRoot, COMMAND_BRIDGE))
    ? stripComments(read(COMMAND_BRIDGE))
    : "";
  const bridgeBody = extractFunctionBody(bridgeSrc, "CommandBridge");
  assertCase(
    block,
    "freeze.bridgePassThrough",
    (/return\s+<>\s*\{\s*children\s*\}\s*<\/>/.test(bridgeBody) ||
      /return\s+children/.test(bridgeBody)) &&
      !/\bpipeline\b/.test(bridgeBody) &&
      !/\bdispatch\b/.test(bridgeBody),
    "CommandBridge remains pass-through",
  );

  const uiIndex = existsSync(join(repoRoot, UI_INDEX))
    ? stripComments(read(UI_INDEX))
    : "";
  assertCase(
    block,
    "freeze.publicBarrelIntact",
    !/\bcommands\b/.test(uiIndex) &&
      !/CommandProvider/.test(uiIndex) &&
      !/commandRegistry/.test(uiIndex) &&
      !/useCommands/.test(uiIndex) &&
      !/CommandExecutionPipeline/.test(uiIndex),
    "src/ui/index.ts does not export commands",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — noBusinessExecution                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noBusinessExecution";

  const commandFiles = walkFiles(join(repoRoot, COMMANDS_DIR));
  let hasForbiddenBusiness = false;
  let hasExecuteMethod = false;
  let pureHasReact = false;
  let hasWindow = false;
  let hasDocument = false;
  let hasKeyboard = false;
  let hasMouse = false;

  for (const full of commandFiles) {
    const rel = relative(repoRoot, full).replace(/\\/g, "/");
    const raw = readFileSync(full, "utf8");
    const src = stripComments(raw);

    for (const re of FORBIDDEN_BUSINESS) {
      if (re.test(src)) {
        hasForbiddenBusiness = true;
      }
    }

    // Ban imperative business execute() method / property access.
    if (/\.execute\s*\(/.test(src) || /\bfunction\s+execute\s*\(/.test(src)) {
      hasExecuteMethod = true;
    }

    if (/\bwindow\b/.test(src)) hasWindow = true;
    if (/\bdocument\b/.test(src)) hasDocument = true;
    if (/\bKeyboardEvent\b/.test(src)) hasKeyboard = true;
    if (/\bMouseEvent\b/.test(src)) hasMouse = true;

    if ((PURE_EXEC_MODULES as readonly string[]).includes(rel)) {
      if (/\bfrom\s+["']react["']/.test(src) || /"use client"/.test(raw)) {
        pureHasReact = true;
      }
    }
  }

  assertCase(
    block,
    "biz.noHandlerCallbackEvents",
    !hasForbiddenBusiness,
    "No handler/callback/shortcut/palette/undo/redo/DOM events",
  );
  assertCase(
    block,
    "biz.noExecuteMethod",
    !hasExecuteMethod,
    "No execute() business method under commands/",
  );
  assertCase(
    block,
    "biz.pureModulesReactFree",
    !pureHasReact,
    "Pure execution + diagnostics modules remain React-free",
  );
  assertCase(
    block,
    "biz.noWindowDocument",
    !hasWindow && !hasDocument,
    "No window/document under commands/",
  );
  assertCase(
    block,
    "biz.noKeyboardMouse",
    !hasKeyboard && !hasMouse,
    "No KeyboardEvent/MouseEvent under commands/",
  );

  const dispatcherSrc = existsSync(join(repoRoot, EXEC_DISPATCHER))
    ? stripComments(read(EXEC_DISPATCHER))
    : "";
  assertCase(
    block,
    "biz.dispatcherStructuralOnly",
    /acknowledged/.test(dispatcherSrc) &&
      !/\bfetch\b/.test(dispatcherSrc) &&
      !/\blocalStorage\b/.test(dispatcherSrc),
    "Dispatcher remains structural (acknowledged only)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — noProductionMount                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noProductionMount";

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
      /CommandExecutionPipeline/.test(src) ||
      /from\s+["']@\/ui\/commands/.test(src) ||
      /from\s+["']\.\.?\/.*commands/.test(src)
    ) {
      productWire = true;
      break;
    }
  }

  assertCase(
    block,
    "mount.noProductWire",
    !productWire,
    "No CommandProvider/Bridge/pipeline import outside src/ui/commands/",
  );

  const doc = existsSync(join(repoRoot, DOC_6_3)) ? read(DOC_6_3) : "";
  assertCase(
    block,
    "mount.docNoProduction",
    /NO production mount/i.test(doc) || /sin montaje en producción/i.test(doc),
    "UX-6.3.md documents no production mount",
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
  { id: "executionPipelineStructure", ca: "CA-UX-6.3.1" },
  { id: "executionContext", ca: "CA-UX-6.3.2" },
  { id: "dispatcherStructure", ca: "CA-UX-6.3.3" },
  { id: "executionResult", ca: "CA-UX-6.3.4" },
  { id: "providerIntegration", ca: "CA-UX-6.3.5" },
  { id: "diagnosticsPipeline", ca: "CA-UX-6.3.6" },
  { id: "apiFreeze", ca: "CA-UX-6.3.7" },
  { id: "noBusinessExecution", ca: "CA-UX-6.3.8" },
  { id: "noProductionMount", ca: "CA-UX-6.3.9" },
  { id: "tscCompile", ca: "CA-UX-6.3.10" },
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
