/**
 * UX-8.7 — Interaction Commands Foundation gate.
 *
 * Blocks:
 * documentationExists · moduleExists · commandContract · resultContract
 * dispatcherState · dispatcherApiFreeze · apiStabilityFreeze
 * shapeValidationFreeze · dispatchSemanticsFreeze · dispatchDeterminismFreeze
 * statelessDispatchFreeze · commandOpaquenessFreeze · commandIdentityFreeze
 * resultImmutabilityFreeze · resultSnapshotFreeze · barrelExport
 * dependencyRule · authorities · noProductMount · windowRegistryIntact
 * roadmapUpdated
 *
 * Architectural principles:
 * - DispatcherState = { lastResult } only.
 * - InteractionCommand = { id, type, payload } only.
 * - InteractionCommandResult = { accepted, reason } only.
 * - Shape Validation · Dispatch Semantics · Determinism freezes.
 * - Stateless · Opaqueness · Identity · Immutability · Snapshot freezes.
 * - API Freeze = dispatch / clear / get / getState.
 * - API Stability Freeze = get() ≡ getState().
 * - Singleton Freeze = infra/testing only · React via Provider + hook.
 * - InteractionCommandDispatcher = sole authority · Dependency Rule ·
 *   no product mount · decoupled from UX-6.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "documentationExists"
  | "moduleExists"
  | "commandContract"
  | "resultContract"
  | "dispatcherState"
  | "dispatcherApiFreeze"
  | "apiStabilityFreeze"
  | "shapeValidationFreeze"
  | "dispatchSemanticsFreeze"
  | "dispatchDeterminismFreeze"
  | "statelessDispatchFreeze"
  | "commandOpaquenessFreeze"
  | "commandIdentityFreeze"
  | "resultImmutabilityFreeze"
  | "resultSnapshotFreeze"
  | "barrelExport"
  | "dependencyRule"
  | "authorities"
  | "noProductMount"
  | "windowRegistryIntact"
  | "roadmapUpdated";

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

function extractMethodBody(src: string, methodName: string): string {
  const re = new RegExp(
    `${methodName}\\s*\\([^)]*\\)\\s*:\\s*[\\w.<|,\\s>]+\\s*\\{`,
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

const IC_DIR = "src/ui/interaction-commands";
const IC_COMMAND = `${IC_DIR}/InteractionCommand.ts`;
const IC_RESULT = `${IC_DIR}/InteractionCommandResult.ts`;
const IC_DISPATCHER = `${IC_DIR}/InteractionCommandDispatcher.ts`;
const IC_CONTEXT = `${IC_DIR}/InteractionCommandContext.tsx`;
const IC_PROVIDER = `${IC_DIR}/InteractionCommandProvider.tsx`;
const IC_HOOK = `${IC_DIR}/useInteractionCommands.ts`;
const IC_INDEX = `${IC_DIR}/index.ts`;
const UI_INDEX = "src/ui/index.ts";
const WINDOW_REGISTRY = "src/components/windows/WindowRegistry.ts";
const PAGE_TSX = "src/app/page.tsx";
const ARCH = "docs/UX/UX-8-architecture.md";
const ROADMAP = "docs/UX/UX-8.0-roadmap.md";
const DOC_8_7 = "docs/UX/UX-8.7.md";
const PACKAGE_JSON = "package.json";

const MODULE_FILES = [
  IC_COMMAND,
  IC_RESULT,
  IC_DISPATCHER,
  IC_CONTEXT,
  IC_PROVIDER,
  IC_HOOK,
  IC_INDEX,
] as const;

const FORBIDDEN_EXTRA_METHODS = [
  /\bregister\s*\(/,
  /\bunregister\s*\(/,
  /\bsubscribe\s*\(/,
  /\bexecute\s*\(/,
  /\binvoke\s*\(/,
  /\bemit\s*\(/,
  /\bprocess\s*\(/,
  /\bsetState\s*\(/,
  /\bupdate\s*\(/,
];

const FORBIDDEN_STATE_FIELDS = [
  "history",
  "queue",
  "pending",
  "retries",
  "scheduler",
  "middleware",
  "plugins",
  "handlers",
  "stack",
  "timestamps",
  "metadata",
];

/* -------------------------------------------------------------------------- */
/* PASS 01 — documentationExists                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "documentationExists";

  assertCase(
    block,
    "exists.architecture",
    existsSync(join(repoRoot, ARCH)),
    `${ARCH} exists`,
  );

  assertCase(
    block,
    "exists.roadmap",
    existsSync(join(repoRoot, ROADMAP)),
    `${ROADMAP} exists`,
  );

  assertCase(
    block,
    "exists.doc",
    existsSync(join(repoRoot, DOC_8_7)),
    `${DOC_8_7} exists`,
  );

  const pkg = existsSync(join(repoRoot, PACKAGE_JSON))
    ? read(PACKAGE_JSON)
    : "";
  assertCase(
    block,
    "exists.npmScript",
    /"validate:ux-8\.7"\s*:/.test(pkg),
    "package.json has validate:ux-8.7",
  );

  const doc = existsSync(join(repoRoot, DOC_8_7)) ? read(DOC_8_7) : "";

  assertCase(
    block,
    "doc.ssotRef",
    /UX-8-architecture\.md/.test(doc),
    "UX-8.7.md references architecture SSOT",
  );

  assertCase(
    block,
    "doc.apiFreeze",
    /API Freeze/i.test(doc) &&
      /dispatch\(/.test(doc) &&
      /clear\(\)/.test(doc) &&
      /get\(\)/.test(doc) &&
      /getState\(\)/.test(doc),
    "UX-8.7.md documents API Freeze (4 methods)",
  );

  assertCase(
    block,
    "doc.dispatcherFreeze",
    /Dispatcher Freeze/i.test(doc),
    "UX-8.7.md documents Dispatcher Freeze",
  );

  assertCase(
    block,
    "doc.dispatchSemanticsFreeze",
    /Dispatch Semantics Freeze/i.test(doc) &&
      (/validate/i.test(doc) || /shape/i.test(doc)),
    "UX-8.7.md documents Dispatch Semantics Freeze",
  );

  assertCase(
    block,
    "doc.dispatchDeterminismFreeze",
    /Dispatch Determinism Freeze/i.test(doc) &&
      (/determinist/i.test(doc) || /same input/i.test(doc)),
    "UX-8.7.md documents Dispatch Determinism Freeze",
  );

  assertCase(
    block,
    "doc.statelessDispatchFreeze",
    /Stateless Dispatch Freeze/i.test(doc) &&
      /lastResult/.test(doc) &&
      /history/.test(doc) &&
      /queue/.test(doc),
    "UX-8.7.md documents Stateless Dispatch Freeze",
  );

  assertCase(
    block,
    "doc.shapeValidationFreeze",
    /Shape Validation Freeze/i.test(doc) &&
      (/structural/i.test(doc) || /shape only/i.test(doc) || /shape/i.test(doc)),
    "UX-8.7.md documents Shape Validation Freeze",
  );

  assertCase(
    block,
    "doc.commandOpaquenessFreeze",
    /Command Opaqueness Freeze/i.test(doc) && /opaque/i.test(doc),
    "UX-8.7.md documents Command Opaqueness Freeze",
  );

  assertCase(
    block,
    "doc.commandIdentityFreeze",
    /Command Identity Freeze/i.test(doc) &&
      (/opaque/i.test(doc) || /opaco/i.test(doc)) &&
      /\bid\b/.test(doc),
    "UX-8.7.md documents Command Identity Freeze",
  );

  assertCase(
    block,
    "doc.resultImmutabilityFreeze",
    /Result Immutability Freeze/i.test(doc) &&
      (/never mutate/i.test(doc) || /NEW/i.test(doc) || /new/i.test(doc)),
    "UX-8.7.md documents Result Immutability Freeze",
  );

  assertCase(
    block,
    "doc.resultSnapshotFreeze",
    /Result Snapshot Freeze/i.test(doc) &&
      (/clone-on-read|clone/i.test(doc) || /snapshot/i.test(doc)),
    "UX-8.7.md documents Result Snapshot Freeze",
  );

  assertCase(
    block,
    "doc.apiStabilityFreeze",
    /API Stability Freeze/i.test(doc) &&
      (/get\(\).*getState\(\)|getState\(\).*get\(\)/i.test(doc) ||
        /get\(\)\s*≡\s*getState\(\)/.test(doc) ||
        /equivalen/i.test(doc)),
    "UX-8.7.md documents API Stability Freeze",
  );

  assertCase(
    block,
    "doc.singletonFreeze",
    /Singleton Freeze/i.test(doc) &&
      /InteractionCommandProvider/.test(doc) &&
      /useInteractionCommands/.test(doc) &&
      (/infraestructura|infrastructure/i.test(doc) || /testing/i.test(doc)),
    "UX-8.7.md documents Singleton Freeze",
  );

  assertCase(
    block,
    "doc.dependencyRule",
    /Dependency Rule/i.test(doc),
    "UX-8.7.md documents Dependency Rule",
  );

  assertCase(
    block,
    "doc.authorities",
    /Authorit/i.test(doc) && /InteractionCommandDispatcher/.test(doc),
    "UX-8.7.md documents Authorities (InteractionCommandDispatcher)",
  );

  assertCase(
    block,
    "doc.outOfScope",
    /Out of Scope/i.test(doc),
    "UX-8.7.md documents Out of Scope",
  );

  assertCase(
    block,
    "doc.integrationFence",
    /Integration Fence/i.test(doc) || /Exclusions/i.test(doc),
    "UX-8.7.md documents Integration Fence / Exclusions",
  );

  assertCase(
    block,
    "doc.next88",
    /Next/i.test(doc) &&
      /UX-8\.8/.test(doc) &&
      /Interaction Diagnostics/i.test(doc),
    "UX-8.7.md documents Next UX-8.8 Interaction Diagnostics",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — moduleExists                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "moduleExists";

  assertCase(
    block,
    "exists.dir",
    existsSync(join(repoRoot, IC_DIR)),
    `${IC_DIR}/ directory exists`,
  );

  for (const rel of MODULE_FILES) {
    assertCase(
      block,
      `exists.${rel.split("/").pop()}`,
      existsSync(join(repoRoot, rel)),
      `${rel} exists`,
    );
  }

  const dispatcher = existsSync(join(repoRoot, IC_DISPATCHER))
    ? read(IC_DISPATCHER)
    : "";

  assertCase(
    block,
    "exists.InteractionCommandDispatcherApi",
    /export\s+interface\s+InteractionCommandDispatcherApi/.test(dispatcher),
    "InteractionCommandDispatcherApi interface exported",
  );

  assertCase(
    block,
    "exists.createInteractionCommandDispatcher",
    /export\s+function\s+createInteractionCommandDispatcher/.test(dispatcher),
    "createInteractionCommandDispatcher factory exported",
  );

  assertCase(
    block,
    "exists.singleton",
    /export\s+const\s+interactionCommandDispatcher/.test(dispatcher),
    "interactionCommandDispatcher singleton exported",
  );

  assertCase(
    block,
    "dispatcher.reactFree",
    !/\bfrom\s+["']react["']/.test(stripComments(dispatcher)) &&
      !/\bReact\b/.test(stripComments(dispatcher)),
    "InteractionCommandDispatcher.ts is React-free",
  );

  const commandSrc = existsSync(join(repoRoot, IC_COMMAND))
    ? read(IC_COMMAND)
    : "";
  const resultSrc = existsSync(join(repoRoot, IC_RESULT)) ? read(IC_RESULT) : "";

  assertCase(
    block,
    "command.reactFree",
    !/\bfrom\s+["']react["']/.test(stripComments(commandSrc)),
    "InteractionCommand.ts is React-free",
  );

  assertCase(
    block,
    "result.reactFree",
    !/\bfrom\s+["']react["']/.test(stripComments(resultSrc)),
    "InteractionCommandResult.ts is React-free",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — commandContract                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "commandContract";
  const typesSrc = existsSync(join(repoRoot, IC_COMMAND))
    ? read(IC_COMMAND)
    : "";
  const body = extractReadonlyTypeBody(typesSrc, "InteractionCommand");
  const stripped = stripComments(typesSrc);

  assertCase(
    block,
    "command.fieldsExact",
    /\bid\b/.test(body) &&
      /\btype\b/.test(body) &&
      /\bpayload\b/.test(body) &&
      (body.match(/\b\w+\s*:/g) ?? []).length === 3,
    "InteractionCommand has exactly id, type, payload",
  );

  assertCase(
    block,
    "command.idString",
    /id\s*:\s*string/.test(body) || /id\s*:\s*string/.test(stripped),
    "InteractionCommand.id is string",
  );

  assertCase(
    block,
    "command.typeString",
    /type\s*:\s*string/.test(body) || /type\s*:\s*string/.test(stripped),
    "InteractionCommand.type is string",
  );

  assertCase(
    block,
    "command.payloadUnknown",
    /payload\s*:\s*unknown/.test(body) ||
      /payload\s*:\s*unknown/.test(stripped),
    "InteractionCommand.payload is unknown",
  );

  assertCase(
    block,
    "command.noForbiddenFields",
    !/\btimestamp\b/.test(body) &&
      !/\bmetadata\b/.test(body) &&
      !/\bhandler\b/.test(body) &&
      !/\bexecute\b/.test(body) &&
      !/\bcallback\b/.test(body) &&
      !/\bpromise\b/i.test(body),
    "InteractionCommand has no timestamp/metadata/handler/execute/callback",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — resultContract                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "resultContract";
  const resultSrc = existsSync(join(repoRoot, IC_RESULT))
    ? read(IC_RESULT)
    : "";
  const body = extractReadonlyTypeBody(resultSrc, "InteractionCommandResult");
  const stripped = stripComments(resultSrc);

  assertCase(
    block,
    "result.fieldsExact",
    /\baccepted\b/.test(body) &&
      /\breason\b/.test(body) &&
      (body.match(/\b\w+\s*:/g) ?? []).length === 2,
    "InteractionCommandResult has exactly accepted, reason",
  );

  assertCase(
    block,
    "result.acceptedBoolean",
    /accepted\s*:\s*boolean/.test(body) ||
      /accepted\s*:\s*boolean/.test(stripped),
    "InteractionCommandResult.accepted is boolean",
  );

  assertCase(
    block,
    "result.reasonNullableString",
    /reason\s*:\s*string\s*\|\s*null/.test(body) ||
      /reason\s*:\s*string\s*\|\s*null/.test(stripped),
    "InteractionCommandResult.reason is string | null",
  );

  assertCase(
    block,
    "result.noForbiddenFields",
    !/\bpayload\b/.test(body) &&
      !/\blog\b/.test(body) &&
      !/\btiming\b/.test(body) &&
      !/\bsideEffect\b/i.test(body) &&
      !/\bexecution\b/i.test(body),
    "InteractionCommandResult has no payload/logs/timing/execution",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — dispatcherState                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "dispatcherState";
  const dispatcher = existsSync(join(repoRoot, IC_DISPATCHER))
    ? read(IC_DISPATCHER)
    : "";
  const body = extractReadonlyTypeBody(
    dispatcher,
    "InteractionCommandDispatcherState",
  );
  const stripped = stripComments(dispatcher);

  assertCase(
    block,
    "state.lastResultOnly",
    /\blastResult\b/.test(body) &&
      (body.match(/\b\w+\s*:/g) ?? []).length === 1,
    "InteractionCommandDispatcherState has only lastResult",
  );

  assertCase(
    block,
    "state.nullableLastResult",
    /lastResult\s*:\s*InteractionCommandResult\s*\|\s*null/.test(body) ||
      /lastResult\s*:\s*InteractionCommandResult\s*\|\s*null/.test(stripped),
    "lastResult is InteractionCommandResult | null",
  );

  assertCase(
    block,
    "state.noSeparateStateFile",
    !existsSync(join(repoRoot, `${IC_DIR}/InteractionCommandState.ts`)) &&
      !existsSync(
        join(repoRoot, `${IC_DIR}/InteractionCommandDispatcherState.ts`),
      ),
    "No separate State file (state lives in Dispatcher)",
  );

  for (const field of FORBIDDEN_STATE_FIELDS) {
    assertCase(
      block,
      `state.no.${field}`,
      !new RegExp(`\\b${field}\\b`).test(body),
      `DispatcherState has no ${field}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — dispatcherApiFreeze                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "dispatcherApiFreeze";
  const dispatcher = existsSync(join(repoRoot, IC_DISPATCHER))
    ? read(IC_DISPATCHER)
    : "";
  const iface = extractInterfaceBody(
    dispatcher,
    "InteractionCommandDispatcherApi",
  );
  const stripped = stripComments(dispatcher);

  const methodCount = (iface.match(/\b\w+\s*\(/g) ?? []).length;

  assertCase(
    block,
    "api.exactlyFourMethods",
    methodCount === 4 &&
      /\bdispatch\s*\(/.test(iface) &&
      /\bclear\s*\(/.test(iface) &&
      /\bget\s*\(/.test(iface) &&
      /\bgetState\s*\(/.test(iface),
    "InteractionCommandDispatcherApi has exactly dispatch/clear/get/getState",
  );

  for (const re of FORBIDDEN_EXTRA_METHODS) {
    const name = re.source.replace(/\\b|\\s\*\\\(/g, "").replace(/\\/g, "");
    assertCase(
      block,
      `api.forbid.${name || "method"}`,
      !re.test(iface),
      `API forbids extra method matching ${re}`,
    );
  }

  assertCase(
    block,
    "api.objectFreeze",
    /Object\.freeze\(\s*api\s*\)/.test(stripped) ||
      /return\s+Object\.freeze\(\s*api\s*\)/.test(stripped),
    "createInteractionCommandDispatcher freezes API",
  );

  assertCase(
    block,
    "api.dispatchReturnsResult",
    /dispatch\s*\([^)]*\)\s*:\s*InteractionCommandResult/.test(iface) ||
      /dispatch\s*\([^)]*\)\s*:\s*InteractionCommandResult/.test(stripped),
    "dispatch returns InteractionCommandResult",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — apiStabilityFreeze                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "apiStabilityFreeze";
  const dispatcher = existsSync(join(repoRoot, IC_DISPATCHER))
    ? read(IC_DISPATCHER)
    : "";
  const doc = existsSync(join(repoRoot, DOC_8_7)) ? read(DOC_8_7) : "";
  const stripped = stripComments(dispatcher);

  const getBody = extractMethodBody(stripped, "get");
  const getStateBody = extractMethodBody(stripped, "getState");

  assertCase(
    block,
    "stability.doc",
    /API Stability Freeze/i.test(doc) &&
      (/get\(\)\s*≡\s*getState\(\)/.test(doc) ||
        /equivalen/i.test(doc)),
    "Docs document get() ≡ getState()",
  );

  assertCase(
    block,
    "stability.bothCallSnapshot",
    /snapshot\s*\(/.test(getBody) && /snapshot\s*\(/.test(getStateBody),
    "get() and getState() both call snapshot()",
  );

  assertCase(
    block,
    "stability.equivalentBodies",
    getBody.replace(/\s+/g, "") === getStateBody.replace(/\s+/g, "") ||
      (/return\s+snapshot\s*\(\s*\)/.test(getBody) &&
        /return\s+snapshot\s*\(\s*\)/.test(getStateBody)),
    "get() and getState() are equivalent",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — shapeValidationFreeze                                            */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "shapeValidationFreeze";
  const dispatcher = existsSync(join(repoRoot, IC_DISPATCHER))
    ? read(IC_DISPATCHER)
    : "";
  const doc = existsSync(join(repoRoot, DOC_8_7)) ? read(DOC_8_7) : "";
  const stripped = stripComments(dispatcher);
  const dispatchBody = extractMethodBody(stripped, "dispatch");

  assertCase(
    block,
    "shape.doc",
    /Shape Validation Freeze/i.test(doc),
    "Docs document Shape Validation Freeze",
  );

  assertCase(
    block,
    "shape.validatesId",
    /typeof.*id.*===?\s*["']string["']/.test(stripped) ||
      /typeof\s+\w+\.id\s*!==?\s*["']string["']/.test(stripped),
    "dispatch validates typeof id === string",
  );

  assertCase(
    block,
    "shape.validatesType",
    /typeof.*type.*===?\s*["']string["']/.test(stripped) ||
      /typeof\s+\w+\.type\s*!==?\s*["']string["']/.test(stripped),
    "dispatch validates typeof type === string",
  );

  assertCase(
    block,
    "shape.validatesPayloadKey",
    /hasOwnProperty\.call\([^,]+,\s*["']payload["']\)/.test(stripped) ||
      /["']payload["']\s+in\s+/.test(stripped) ||
      /Object\.hasOwn\(/.test(stripped),
    "dispatch validates own payload property",
  );

  assertCase(
    block,
    "shape.rejectsInvalid",
    /accepted\s*:\s*false|freezeResult\(\s*false/.test(dispatchBody) ||
      /accepted:\s*false/.test(stripped),
    "invalid shape yields accepted: false",
  );

  assertCase(
    block,
    "shape.acceptsValid",
    /accepted\s*:\s*true|freezeResult\(\s*true/.test(dispatchBody) ||
      /accepted:\s*true/.test(stripped),
    "valid shape yields accepted: true",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — dispatchSemanticsFreeze                                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "dispatchSemanticsFreeze";
  const dispatcher = existsSync(join(repoRoot, IC_DISPATCHER))
    ? read(IC_DISPATCHER)
    : "";
  const doc = existsSync(join(repoRoot, DOC_8_7)) ? read(DOC_8_7) : "";
  const stripped = stripComments(dispatcher);
  const dispatchBody = extractMethodBody(stripped, "dispatch");

  assertCase(
    block,
    "semantics.doc",
    /Dispatch Semantics Freeze/i.test(doc),
    "Docs document Dispatch Semantics Freeze",
  );

  assertCase(
    block,
    "semantics.replacesLastResult",
    /lastResult\s*=/.test(dispatchBody),
    "dispatch replaces lastResult",
  );

  assertCase(
    block,
    "semantics.noUx6",
    !/CommandExecutionDispatcher/.test(dispatchBody) &&
      !/CommandRegistry/.test(dispatchBody) &&
      !/CommandContext/.test(dispatchBody) &&
      !/executeCommand/.test(dispatchBody),
    "dispatch does not invoke UX-6",
  );

  assertCase(
    block,
    "semantics.noHandlers",
    !/\.execute\s*\(/.test(dispatchBody) &&
      !/\.handler\b/.test(dispatchBody) &&
      !/\binvoke\s*\(/.test(dispatchBody),
    "dispatch does not call handlers",
  );

  assertCase(
    block,
    "semantics.noForeignMutation",
    !/FocusRegistry/.test(dispatchBody) &&
      !/SelectionRegistry/.test(dispatchBody) &&
      !/HoverRegistry/.test(dispatchBody) &&
      !/ClipboardRegistry/.test(dispatchBody) &&
      !/WindowRegistry/.test(dispatchBody),
    "dispatch does not mutate foreign registries",
  );

  const clearBody = extractMethodBody(stripped, "clear");
  assertCase(
    block,
    "semantics.clearNull",
    /lastResult\s*=\s*null/.test(clearBody),
    "clear() sets lastResult = null",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — dispatchDeterminismFreeze                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "dispatchDeterminismFreeze";
  const dispatcher = existsSync(join(repoRoot, IC_DISPATCHER))
    ? read(IC_DISPATCHER)
    : "";
  const doc = existsSync(join(repoRoot, DOC_8_7)) ? read(DOC_8_7) : "";
  const stripped = stripComments(dispatcher);
  const dispatchBody = extractMethodBody(stripped, "dispatch");

  assertCase(
    block,
    "determinism.doc",
    /Dispatch Determinism Freeze/i.test(doc) &&
      (/determinist/i.test(doc) || /same input/i.test(doc)),
    "Docs document Dispatch Determinism Freeze",
  );

  assertCase(
    block,
    "determinism.noDate",
    !/\bDate\b/.test(dispatchBody) && !/\bDate\.now\b/.test(dispatchBody),
    "dispatch does not use Date / time",
  );

  assertCase(
    block,
    "determinism.noRandom",
    !/Math\.random/.test(dispatchBody) && !/\bperformance\b/.test(dispatchBody),
    "dispatch does not use Math.random / performance",
  );

  assertCase(
    block,
    "determinism.noEnv",
    !/\bprocess\.env\b/.test(dispatchBody) &&
      !/\bimport\.meta\.env\b/.test(dispatchBody),
    "dispatch does not depend on environment",
  );

  assertCase(
    block,
    "determinism.noReact",
    !/\buseState\b/.test(dispatchBody) &&
      !/\buseRef\b/.test(dispatchBody) &&
      !/\bReact\b/.test(dispatchBody),
    "dispatch does not depend on React",
  );

  assertCase(
    block,
    "determinism.commentsSoleEffect",
    /sole allowed side effect|Only allowed side effect|replace lastResult/i.test(
      dispatcher,
    ) || /lastResult\s*→\s*replace/i.test(doc),
    "Determinism documents sole effect = replace lastResult",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 11 — statelessDispatchFreeze                                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "statelessDispatchFreeze";
  const dispatcher = existsSync(join(repoRoot, IC_DISPATCHER))
    ? read(IC_DISPATCHER)
    : "";
  const doc = existsSync(join(repoRoot, DOC_8_7)) ? read(DOC_8_7) : "";
  const stripped = stripComments(dispatcher);

  assertCase(
    block,
    "stateless.doc",
    /Stateless Dispatch Freeze/i.test(doc) && /lastResult/.test(doc),
    "Docs document Stateless Dispatch Freeze",
  );

  assertCase(
    block,
    "stateless.onlyLastResultLet",
    /let\s+lastResult\s*:/.test(stripped) &&
      (stripped.match(/\blet\s+\w+/g) ?? []).length === 1,
    "Dispatcher private mutable state is only lastResult",
  );

  for (const field of ["history", "queue", "pending", "retries", "stack"]) {
    assertCase(
      block,
      `stateless.no.${field}`,
      !new RegExp(`\\blet\\s+${field}\\b`).test(stripped) &&
        !new RegExp(`\\b${field}\\s*:`).test(
          extractReadonlyTypeBody(
            dispatcher,
            "InteractionCommandDispatcherState",
          ),
        ),
      `No ${field} in dispatcher state`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 12 — commandOpaquenessFreeze                                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "commandOpaquenessFreeze";
  const dispatcher = existsSync(join(repoRoot, IC_DISPATCHER))
    ? read(IC_DISPATCHER)
    : "";
  const doc = existsSync(join(repoRoot, DOC_8_7)) ? read(DOC_8_7) : "";
  const stripped = stripComments(dispatcher);
  const dispatchBody = extractMethodBody(stripped, "dispatch");

  assertCase(
    block,
    "opaqueness.doc",
    /Command Opaqueness Freeze/i.test(doc) && /opaque/i.test(doc),
    "Docs document Command Opaqueness Freeze",
  );

  assertCase(
    block,
    "opaqueness.noPayloadInspect",
    !/\.payload\s*[!=]==/.test(dispatchBody) &&
      !/\.payload\s*\./.test(dispatchBody) &&
      !/JSON\.(parse|stringify)/.test(dispatchBody),
    "dispatch does not inspect/serialize payload",
  );

  assertCase(
    block,
    "opaqueness.noTypeSwitch",
    !/switch\s*\([^)]*\.type/.test(dispatchBody) &&
      !/\.type\s*===?\s*["']/.test(dispatchBody),
    "dispatch does not interpret type values",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 13 — commandIdentityFreeze                                            */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "commandIdentityFreeze";
  const dispatcher = existsSync(join(repoRoot, IC_DISPATCHER))
    ? read(IC_DISPATCHER)
    : "";
  const doc = existsSync(join(repoRoot, DOC_8_7)) ? read(DOC_8_7) : "";
  const stripped = stripComments(dispatcher);
  const dispatchBody = extractMethodBody(stripped, "dispatch");

  assertCase(
    block,
    "identity.doc",
    /Command Identity Freeze/i.test(doc) &&
      (/opaque/i.test(doc) || /opaco/i.test(doc)),
    "Docs document Command Identity Freeze",
  );

  assertCase(
    block,
    "identity.noGenerate",
    !/crypto\.randomUUID/.test(dispatchBody) &&
      !/Math\.random/.test(dispatchBody) &&
      !/nanoid/i.test(dispatchBody) &&
      !/uuid/i.test(dispatchBody),
    "dispatch never generates ids",
  );

  assertCase(
    block,
    "identity.noModify",
    !/\.id\s*=/.test(dispatchBody),
    "dispatch never modifies id",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 14 — resultImmutabilityFreeze                                         */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "resultImmutabilityFreeze";
  const dispatcher = existsSync(join(repoRoot, IC_DISPATCHER))
    ? read(IC_DISPATCHER)
    : "";
  const doc = existsSync(join(repoRoot, DOC_8_7)) ? read(DOC_8_7) : "";
  const stripped = stripComments(dispatcher);

  assertCase(
    block,
    "immutability.doc",
    /Result Immutability Freeze/i.test(doc),
    "Docs document Result Immutability Freeze",
  );

  assertCase(
    block,
    "immutability.freezeResult",
    /Object\.freeze/.test(stripped) &&
      (/freezeResult/.test(stripped) ||
        /accepted:/.test(stripped)),
    "Results are Object.freeze'd",
  );

  assertCase(
    block,
    "immutability.noPartialUpdate",
    !/lastResult\.accepted\s*=/.test(stripped) &&
      !/lastResult\.reason\s*=/.test(stripped),
    "Never partially mutate lastResult fields",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 15 — resultSnapshotFreeze                                             */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "resultSnapshotFreeze";
  const dispatcher = existsSync(join(repoRoot, IC_DISPATCHER))
    ? read(IC_DISPATCHER)
    : "";
  const doc = existsSync(join(repoRoot, DOC_8_7)) ? read(DOC_8_7) : "";
  const stripped = stripComments(dispatcher);

  assertCase(
    block,
    "snapshot.doc",
    /Result Snapshot Freeze/i.test(doc) &&
      (/clone-on-read|clone/i.test(doc) || /snapshot/i.test(doc)),
    "Docs document Result Snapshot Freeze",
  );

  assertCase(
    block,
    "snapshot.functionExists",
    /function\s+snapshot\s*\(/.test(stripped),
    "Private snapshot() exists",
  );

  assertCase(
    block,
    "snapshot.clonesResult",
    /Object\.freeze\s*\(\s*\{[\s\S]*accepted[\s\S]*reason/.test(stripped),
    "snapshot clones result fields",
  );

  assertCase(
    block,
    "snapshot.noDirectReturn",
    !/get\s*\([^)]*\)\s*:\s*\w+\s*\{\s*return\s+lastResult/.test(stripped) &&
      !/getState\s*\([^)]*\)\s*:\s*\w+\s*\{\s*return\s+lastResult/.test(
        stripped,
      ) &&
      !/return\s+\{\s*lastResult\s*\}/.test(stripped),
    "get/getState do not expose internal lastResult directly",
  );

  const getBody = extractMethodBody(stripped, "get");
  assertCase(
    block,
    "snapshot.getUsesSnapshot",
    /return\s+snapshot\s*\(/.test(getBody),
    "get() returns snapshot()",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 16 — barrelExport                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "barrelExport";
  const indexSrc = existsSync(join(repoRoot, IC_INDEX)) ? read(IC_INDEX) : "";
  const uiIndex = existsSync(join(repoRoot, UI_INDEX)) ? read(UI_INDEX) : "";

  assertCase(
    block,
    "barrel.notReExportedComment",
    /Not re-exported from @\/ui/i.test(indexSrc) ||
      /not re-exported from @\/ui/i.test(indexSrc),
    "Barrel comments Not re-exported from @/ui",
  );

  const requiredExports = [
    "InteractionCommand",
    "InteractionCommandResult",
    "InteractionCommandDispatcherApi",
    "InteractionCommandDispatcherState",
    "createInteractionCommandDispatcher",
    "interactionCommandDispatcher",
    "InteractionCommandContext",
    "InteractionCommandContextValue",
    "InteractionCommandProvider",
    "useInteractionCommands",
  ];

  for (const name of requiredExports) {
    assertCase(
      block,
      `barrel.export.${name}`,
      new RegExp(`\\b${name}\\b`).test(indexSrc),
      `Barrel exports ${name}`,
    );
  }

  assertCase(
    block,
    "barrel.notInUiIndex",
    !/interaction-commands/.test(uiIndex) &&
      !/InteractionCommand/.test(uiIndex) &&
      !/useInteractionCommands/.test(uiIndex),
    "src/ui/index.ts does not export interaction-commands",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 17 — dependencyRule                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "dependencyRule";
  const icFiles = walkFiles(join(repoRoot, IC_DIR));
  const allRaw = icFiles.map((f) => readFileSync(f, "utf8")).join("\n");
  const all = stripComments(allRaw);

  assertCase(
    block,
    "dep.noWindows",
    !/components\/windows/.test(all) &&
      !/from\s+["'][^"']*windows[^"']*["']/.test(all) &&
      !/\bWindowRegistry\b/.test(all) &&
      !/\bWindowManager\b/.test(all),
    "interaction-commands/** does not import windows/** or WindowRegistry",
  );

  assertCase(
    block,
    "dep.noFocus",
    !/from\s+["'][^"']*\/focus[^"']*["']/.test(all) &&
      !/\bFocusRegistry\b/.test(all) &&
      !/\bFocusProvider\b/.test(all) &&
      !/\buseFocus\b/.test(all),
    "interaction-commands/** does not import Focus module",
  );

  assertCase(
    block,
    "dep.noSelection",
    !/from\s+["'][^"']*\/selection[^"']*["']/.test(all) &&
      !/\bSelectionRegistry\b/.test(all) &&
      !/\bSelectionProvider\b/.test(all) &&
      !/\buseSelection\b/.test(all),
    "interaction-commands/** does not import Selection module",
  );

  assertCase(
    block,
    "dep.noHover",
    !/from\s+["'][^"']*\/hover[^"']*["']/.test(all) &&
      !/\bHoverRegistry\b/.test(all) &&
      !/\bHoverProvider\b/.test(all) &&
      !/\buseHover\b/.test(all),
    "interaction-commands/** does not import Hover module",
  );

  assertCase(
    block,
    "dep.noKeyboard",
    !/from\s+["'][^"']*\/keyboard-nav[^"']*["']/.test(all) &&
      !/\bKeyboardNavigationRegistry\b/.test(all) &&
      !/\buseKeyboardNavigation\b/.test(all),
    "interaction-commands/** does not import Keyboard Navigation module",
  );

  assertCase(
    block,
    "dep.noClipboard",
    !/from\s+["'][^"']*\/clipboard[^"']*["']/.test(all) &&
      !/\bClipboardRegistry\b/.test(all) &&
      !/\bClipboardProvider\b/.test(all) &&
      !/\buseClipboard\b/.test(all),
    "interaction-commands/** does not import Clipboard module",
  );

  assertCase(
    block,
    "dep.noUx6Commands",
    !/from\s+["'][^"']*\/commands[^"']*["']/.test(all) &&
      !/\bCommandExecutionDispatcher\b/.test(all) &&
      !/\bCommandRegistry\b/.test(all) &&
      !/\bCommandProvider\b/.test(all) &&
      !/\bCommandContext\b/.test(all) &&
      !/\bCommandExecutionContext\b/.test(all),
    "interaction-commands/** does not import UX-6 Commands",
  );

  assertCase(
    block,
    "dep.noForeignRegistry",
    !/from\s+["'][^"']*\/(commands|visibility|features|selection|shortcuts|menus|focus|hover|keyboard-nav|clipboard)[^"']*["']/.test(
      all,
    ),
    "interaction-commands/** does not import foreign Registry modules",
  );

  assertCase(
    block,
    "dep.noScientific",
    !/lib\/scientific/.test(all) && !/\bsrc\/lib\/graph\b/.test(all),
    "interaction-commands/** does not import scientific / graph engines",
  );

  assertCase(
    block,
    "dep.noRuntime",
    !/from\s+["'][^"']*\/runtime[^"']*["']/.test(all) &&
      !/\bThemeRuntime\b/.test(all),
    "interaction-commands/** does not import Runtime",
  );

  const arch = existsSync(join(repoRoot, ARCH)) ? read(ARCH) : "";
  assertCase(
    block,
    "dep.architectureDocumentsRule",
    /Dependency Rule/i.test(arch),
    "UX-8-architecture.md documents Dependency Rule",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 18 — authorities                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "authorities";
  const arch = existsSync(join(repoRoot, ARCH)) ? read(ARCH) : "";
  const doc = existsSync(join(repoRoot, DOC_8_7)) ? read(DOC_8_7) : "";

  assertCase(
    block,
    "auth.matrixInteractionCommands",
    /Interaction commands/i.test(arch) &&
      /InteractionCommandDispatcher/.test(arch),
    "Architecture Authorities Matrix lists Interaction commands → InteractionCommandDispatcher",
  );

  assertCase(
    block,
    "auth.docSole",
    /InteractionCommandDispatcher/.test(doc) &&
      (/sole|única autoridad|ONLY mutation authority|única/i.test(doc) ||
        /Authorit/i.test(doc)),
    "UX-8.7.md documents InteractionCommandDispatcher as sole authority",
  );

  assertCase(
    block,
    "auth.noCrossMutation",
    /No Focus/i.test(doc) ||
      /NO Focus/i.test(doc) ||
      /prohibido mutar/i.test(doc) ||
      /cross-registry/i.test(doc),
    "UX-8.7.md forbids cross-registry mutation",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 19 — noProductMount                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noProductMount";
  const page = existsSync(join(repoRoot, PAGE_TSX)) ? read(PAGE_TSX) : "";
  const uiIndex = existsSync(join(repoRoot, UI_INDEX)) ? read(UI_INDEX) : "";

  const appShellFiles = walkFiles(join(repoRoot, "src/components/app-shell"));
  const appShellRaw = appShellFiles
    .map((f) => readFileSync(f, "utf8"))
    .join("\n");

  assertCase(
    block,
    "mount.noPageProvider",
    !/\bInteractionCommandProvider\b/.test(page) &&
      !/ui\/interaction-commands/.test(page),
    "page.tsx does not mount InteractionCommandProvider",
  );

  assertCase(
    block,
    "mount.noAppShell",
    !/\bInteractionCommandProvider\b/.test(appShellRaw) &&
      !/ui\/interaction-commands/.test(appShellRaw),
    "AppShell does not mount InteractionCommandProvider",
  );

  assertCase(
    block,
    "mount.noPublicBarrel",
    !/from\s+["']\.\/interaction-commands["']/.test(uiIndex) &&
      !/from\s+["']\.\/interaction-commands\//.test(uiIndex),
    "@/ui barrel does not export interaction-commands",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 20 — windowRegistryIntact                                             */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "windowRegistryIntact";
  const wr = existsSync(join(repoRoot, WINDOW_REGISTRY))
    ? stripComments(read(WINDOW_REGISTRY))
    : "";

  assertCase(
    block,
    "window.exists",
    existsSync(join(repoRoot, WINDOW_REGISTRY)),
    "WindowRegistry.ts still exists",
  );

  assertCase(
    block,
    "window.apiSurface",
    /export\s+type\s+WindowRegistry\s*=/.test(wr) &&
      /\bregister\s*\(/.test(wr) &&
      /\bunregister\s*\(/.test(wr) &&
      /\bhas\s*\(/.test(wr) &&
      /\bget\s*\(/.test(wr) &&
      /\bgetAll\s*\(/.test(wr),
    "WindowRegistry API surface intact",
  );

  assertCase(
    block,
    "window.noInteractionCommandsImport",
    !/ui\/interaction-commands/.test(wr) &&
      !/\binteractionCommandDispatcher\b/.test(wr),
    "WindowRegistry does not import interaction-commands module",
  );

  const icAll = walkFiles(join(repoRoot, IC_DIR))
    .map((f) => readFileSync(f, "utf8"))
    .join("\n");
  assertCase(
    block,
    "ic.noWindowRegistryImport",
    !/WindowRegistry/.test(stripComments(icAll)),
    "interaction-commands/** does not reference WindowRegistry",
  );

  // Prior UX-8 modules intact (no interaction-commands imports either way)
  for (const [label, dir] of [
    ["focus", "src/ui/focus"],
    ["selection", "src/ui/selection"],
    ["hover", "src/ui/hover"],
    ["keyboard-nav", "src/ui/keyboard-nav"],
    ["clipboard", "src/ui/clipboard"],
  ] as const) {
    const prior = walkFiles(join(repoRoot, dir))
      .map((f) => readFileSync(f, "utf8"))
      .join("\n");
    assertCase(
      block,
      `prior.${label}.noIcImport`,
      !/interaction-commands/.test(prior) &&
        !/\binteractionCommandDispatcher\b/.test(prior),
      `${dir} does not import interaction-commands`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 21 — roadmapUpdated                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "roadmapUpdated";
  const roadmap = existsSync(join(repoRoot, ROADMAP)) ? read(ROADMAP) : "";

  assertCase(
    block,
    "roadmap.architectureRef",
    /UX-8-architecture\.md/.test(roadmap),
    "Roadmap references UX-8-architecture.md",
  );

  assertCase(
    block,
    "roadmap.ux87Complete",
    /UX-8\.7\s*=\s*COMPLETE/i.test(roadmap) ||
      (/UX-8\.7/.test(roadmap) &&
        /Interaction Commands/.test(roadmap) &&
        /COMPLETE/.test(roadmap)),
    "Roadmap marks UX-8.7 COMPLETE",
  );

  assertCase(
    block,
    "roadmap.tableComplete",
    /UX-8\.7\s*\|\s*Interaction Commands\s*\|\s*COMPLETE/i.test(roadmap),
    "Roadmap phase table marks UX-8.7 COMPLETE",
  );

  assertCase(
    block,
    "roadmap.historicalGate",
    /validate:ux-8\.7/.test(roadmap) && /UX-8\.7\.md/.test(roadmap),
    "Roadmap lists historical gate validate:ux-8.7",
  );

  assertCase(
    block,
    "roadmap.next88",
    /UX-8\.8/.test(roadmap) && /Interaction Diagnostics/i.test(roadmap),
    "Roadmap lists UX-8.8 Interaction Diagnostics",
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const failed = results.filter((r) => !r.pass);
const passed = results.filter((r) => r.pass);

const blocks = [
  "documentationExists",
  "moduleExists",
  "commandContract",
  "resultContract",
  "dispatcherState",
  "dispatcherApiFreeze",
  "apiStabilityFreeze",
  "shapeValidationFreeze",
  "dispatchSemanticsFreeze",
  "dispatchDeterminismFreeze",
  "statelessDispatchFreeze",
  "commandOpaquenessFreeze",
  "commandIdentityFreeze",
  "resultImmutabilityFreeze",
  "resultSnapshotFreeze",
  "barrelExport",
  "dependencyRule",
  "authorities",
  "noProductMount",
  "windowRegistryIntact",
  "roadmapUpdated",
] as const;

console.log("\n=== UX-8.7 Interaction Commands Foundation Gate ===\n");

for (const b of blocks) {
  const cases = results.filter((r) => r.block === b);
  const ok = cases.every((c) => c.pass);
  const mark = ok ? "PASS" : "FAIL";
  console.log(`${mark}  ${b} (${cases.filter((c) => c.pass).length}/${cases.length})`);
  for (const c of cases.filter((x) => !x.pass)) {
    console.log(`      ✗ ${c.id}: ${c.detail}`);
  }
}

console.log(
  `\nTotal: ${passed.length} passed, ${failed.length} failed, ${results.length} assertions\n`,
);

if (failed.length > 0) {
  process.exit(1);
}

console.log("validate:ux-8.7 → PASS\n");
