/**
 * UX-8.6 — Clipboard Foundation gate.
 *
 * Blocks:
 * documentationExists · moduleExists · entryContract · stateContract
 * registryApiFreeze · apiStabilityFreeze · clipboardContractFreeze
 * clipboardSemanticsFreeze · entryReplacementFreeze · payloadOpaquenessFreeze
 * clipboardIdentityFreeze · entryImmutabilityFreeze · statelessClipboardFreeze
 * browserClipboardFreeze · barrelExport · dependencyRule · authorities
 * noProductMount · windowRegistryIntact · roadmapUpdated
 *
 * Architectural principles:
 * - ClipboardState = { entry } only.
 * - ClipboardEntry = { id, kind, payload } only.
 * - Entry Replacement · Payload Opaqueness · Identity · Immutability freezes.
 * - Stateless Clipboard Freeze · Browser Clipboard Freeze.
 * - API Freeze = set / clear / get / getState.
 * - API Stability Freeze = get() ≡ getState().
 * - Singleton Freeze = infra/testing only · React via Provider + hook.
 * - ClipboardRegistry = sole authority · Dependency Rule · no product mount.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "documentationExists"
  | "moduleExists"
  | "entryContract"
  | "stateContract"
  | "registryApiFreeze"
  | "apiStabilityFreeze"
  | "clipboardContractFreeze"
  | "clipboardSemanticsFreeze"
  | "entryReplacementFreeze"
  | "payloadOpaquenessFreeze"
  | "clipboardIdentityFreeze"
  | "entryImmutabilityFreeze"
  | "statelessClipboardFreeze"
  | "browserClipboardFreeze"
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
  const re = new RegExp(`${methodName}\\s*\\([^)]*\\)\\s*:\\s*\\w+\\s*\\{`);
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

const CB_DIR = "src/ui/clipboard";
const CB_TYPES = `${CB_DIR}/ClipboardTypes.ts`;
const CB_STATE = `${CB_DIR}/ClipboardState.ts`;
const CB_REGISTRY = `${CB_DIR}/ClipboardRegistry.ts`;
const CB_CONTEXT = `${CB_DIR}/ClipboardContext.tsx`;
const CB_PROVIDER = `${CB_DIR}/ClipboardProvider.tsx`;
const CB_HOOK = `${CB_DIR}/useClipboard.ts`;
const CB_INDEX = `${CB_DIR}/index.ts`;
const UI_INDEX = "src/ui/index.ts";
const WINDOW_REGISTRY = "src/components/windows/WindowRegistry.ts";
const PAGE_TSX = "src/app/page.tsx";
const ARCH = "docs/UX/UX-8-architecture.md";
const ROADMAP = "docs/UX/UX-8.0-roadmap.md";
const DOC_8_6 = "docs/UX/UX-8.6.md";
const PACKAGE_JSON = "package.json";

const MODULE_FILES = [
  CB_TYPES,
  CB_STATE,
  CB_REGISTRY,
  CB_CONTEXT,
  CB_PROVIDER,
  CB_HOOK,
  CB_INDEX,
] as const;

const FORBIDDEN_EXTRA_METHODS = [
  /\bcopy\s*\(/,
  /\bpaste\s*\(/,
  /\bcut\s*\(/,
  /\bread\s*\(/,
  /\bwrite\s*\(/,
  /\bsync\s*\(/,
  /\bimport\s*\(/,
  /\bexport\s*\(/,
  /\bsetState\s*\(/,
  /\bupdate\s*\(/,
];

const FORBIDDEN_STATE_FIELDS = [
  "history",
  "stack",
  "queue",
  "previousEntry",
  "undo",
  "redo",
  "timestamps",
  "metadata",
];

const BROWSER_FORBIDDEN = [
  /\bnavigator\.clipboard\b/,
  /\bClipboardEvent\b/,
  /\bexecCommand\b/,
  /\bdocument\b/,
  /\bwindow\b/,
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
    existsSync(join(repoRoot, DOC_8_6)),
    `${DOC_8_6} exists`,
  );

  const pkg = existsSync(join(repoRoot, PACKAGE_JSON))
    ? read(PACKAGE_JSON)
    : "";
  assertCase(
    block,
    "exists.npmScript",
    /"validate:ux-8\.6"\s*:/.test(pkg),
    "package.json has validate:ux-8.6",
  );

  const doc = existsSync(join(repoRoot, DOC_8_6)) ? read(DOC_8_6) : "";

  assertCase(
    block,
    "doc.ssotRef",
    /UX-8-architecture\.md/.test(doc),
    "UX-8.6.md references architecture SSOT",
  );

  assertCase(
    block,
    "doc.apiFreeze",
    /API Freeze/i.test(doc) &&
      /set\(/.test(doc) &&
      /clear\(\)/.test(doc) &&
      /get\(\)/.test(doc) &&
      /getState\(\)/.test(doc),
    "UX-8.6.md documents API Freeze (4 methods)",
  );

  assertCase(
    block,
    "doc.clipboardContractFreeze",
    /Clipboard Contract Freeze/i.test(doc) &&
      (/logical payload/i.test(doc) || /payload lógico/i.test(doc)),
    "UX-8.6.md documents Clipboard Contract Freeze",
  );

  assertCase(
    block,
    "doc.clipboardSemanticsFreeze",
    /Clipboard Semantics Freeze/i.test(doc) &&
      (/replace/i.test(doc) || /reemplaza/i.test(doc)),
    "UX-8.6.md documents Clipboard Semantics Freeze",
  );

  assertCase(
    block,
    "doc.entryReplacementFreeze",
    /Entry Replacement Freeze/i.test(doc) &&
      (/never.*merge|merge.*never|never merge/i.test(doc) ||
        /nunca.*merge/i.test(doc) ||
        /Never:[\s\S]*merge/i.test(doc)),
    "UX-8.6.md documents Entry Replacement Freeze",
  );

  assertCase(
    block,
    "doc.payloadOpaquenessFreeze",
    /Payload Opaqueness Freeze/i.test(doc) && /opaque/i.test(doc),
    "UX-8.6.md documents Payload Opaqueness Freeze",
  );

  assertCase(
    block,
    "doc.clipboardIdentityFreeze",
    /Clipboard Identity Freeze/i.test(doc) &&
      (/opaque/i.test(doc) || /opaco/i.test(doc)) &&
      /\bid\b/.test(doc),
    "UX-8.6.md documents Clipboard Identity Freeze",
  );

  assertCase(
    block,
    "doc.entryImmutabilityFreeze",
    /Entry Immutability Freeze/i.test(doc) &&
      (/never mutate/i.test(doc) || /nunca.*muta/i.test(doc) ||
        /never mutated/i.test(doc)),
    "UX-8.6.md documents Entry Immutability Freeze",
  );

  assertCase(
    block,
    "doc.statelessClipboardFreeze",
    /Stateless Clipboard Freeze/i.test(doc) &&
      /\bentry\b/.test(doc) &&
      /history/.test(doc) &&
      /stack/.test(doc),
    "UX-8.6.md documents Stateless Clipboard Freeze",
  );

  assertCase(
    block,
    "doc.browserClipboardFreeze",
    /Browser Clipboard Freeze/i.test(doc) &&
      /navigator\.clipboard/.test(doc) &&
      /ClipboardEvent/.test(doc),
    "UX-8.6.md documents Browser Clipboard Freeze",
  );

  assertCase(
    block,
    "doc.apiStabilityFreeze",
    /API Stability Freeze/i.test(doc) &&
      (/get\(\).*getState\(\)|getState\(\).*get\(\)/i.test(doc) ||
        /get\(\)\s*≡\s*getState\(\)/.test(doc) ||
        /equivalen/i.test(doc)),
    "UX-8.6.md documents API Stability Freeze",
  );

  assertCase(
    block,
    "doc.singletonFreeze",
    /Singleton Freeze/i.test(doc) &&
      /ClipboardProvider/.test(doc) &&
      /useClipboard/.test(doc) &&
      (/infraestructura|infrastructure/i.test(doc) || /testing/i.test(doc)),
    "UX-8.6.md documents Singleton Freeze",
  );

  assertCase(
    block,
    "doc.dependencyRule",
    /Dependency Rule/i.test(doc),
    "UX-8.6.md documents Dependency Rule",
  );

  assertCase(
    block,
    "doc.authorities",
    /Authorit/i.test(doc) && /ClipboardRegistry/.test(doc),
    "UX-8.6.md documents Authorities (ClipboardRegistry)",
  );

  assertCase(
    block,
    "doc.outOfScope",
    /Out of Scope/i.test(doc),
    "UX-8.6.md documents Out of Scope",
  );

  assertCase(
    block,
    "doc.integrationFence",
    /Integration Fence/i.test(doc) || /Exclusions/i.test(doc),
    "UX-8.6.md documents Integration Fence / Exclusions",
  );

  assertCase(
    block,
    "doc.next87",
    /Next/i.test(doc) &&
      /UX-8\.7/.test(doc) &&
      /Interaction Commands/i.test(doc),
    "UX-8.6.md documents Next UX-8.7 Interaction Commands",
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
    existsSync(join(repoRoot, CB_DIR)),
    `${CB_DIR}/ directory exists`,
  );

  for (const rel of MODULE_FILES) {
    assertCase(
      block,
      `exists.${rel.split("/").pop()}`,
      existsSync(join(repoRoot, rel)),
      `${rel} exists`,
    );
  }

  const registry = existsSync(join(repoRoot, CB_REGISTRY))
    ? read(CB_REGISTRY)
    : "";

  assertCase(
    block,
    "exists.ClipboardRegistryApi",
    /export\s+interface\s+ClipboardRegistryApi/.test(registry),
    "ClipboardRegistryApi interface exported",
  );

  assertCase(
    block,
    "exists.createClipboardRegistry",
    /export\s+function\s+createClipboardRegistry/.test(registry),
    "createClipboardRegistry factory exported",
  );

  assertCase(
    block,
    "exists.singleton",
    /export\s+const\s+clipboardRegistry/.test(registry),
    "clipboardRegistry singleton exported",
  );

  assertCase(
    block,
    "registry.reactFree",
    !/\bfrom\s+["']react["']/.test(stripComments(registry)) &&
      !/\bReact\b/.test(stripComments(registry)),
    "ClipboardRegistry.ts is React-free",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — entryContract                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "entryContract";
  const typesSrc = existsSync(join(repoRoot, CB_TYPES)) ? read(CB_TYPES) : "";
  const body = extractReadonlyTypeBody(typesSrc, "ClipboardEntry");
  const stripped = stripComments(typesSrc);

  assertCase(
    block,
    "entry.fieldsExact",
    /\bid\b/.test(body) &&
      /\bkind\b/.test(body) &&
      /\bpayload\b/.test(body) &&
      (body.match(/\b\w+\s*:/g) ?? []).length === 3,
    "ClipboardEntry has exactly id, kind, payload",
  );

  assertCase(
    block,
    "entry.idString",
    /id\s*:\s*string/.test(body) || /id\s*:\s*string/.test(stripped),
    "ClipboardEntry.id is string",
  );

  assertCase(
    block,
    "entry.kindString",
    /kind\s*:\s*string/.test(body) || /kind\s*:\s*string/.test(stripped),
    "ClipboardEntry.kind is string",
  );

  assertCase(
    block,
    "entry.payloadUnknown",
    /payload\s*:\s*unknown/.test(body) ||
      /payload\s*:\s*unknown/.test(stripped),
    "ClipboardEntry.payload is unknown",
  );

  assertCase(
    block,
    "entry.noForbiddenFields",
    !/\btimestamp\b/.test(body) &&
      !/\bmetadata\b/.test(body) &&
      !/\bmime\b/.test(body) &&
      !/\bsource\b/.test(body) &&
      !/\bownership\b/.test(body),
    "ClipboardEntry has no timestamp/metadata/mime/source/ownership",
  );

  assertCase(
    block,
    "entry.logicalPayloadComment",
    /logical payload only/i.test(typesSrc) &&
      (/NOT the browser/i.test(typesSrc) || /NOT.*OS clipboard/i.test(typesSrc)),
    "ClipboardTypes documents logical payload only (not browser/OS)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — stateContract                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "stateContract";
  const stateSrc = existsSync(join(repoRoot, CB_STATE)) ? read(CB_STATE) : "";
  const body = extractReadonlyTypeBody(stateSrc, "ClipboardState");
  const stripped = stripComments(stateSrc);

  assertCase(
    block,
    "state.entryOnly",
    /\bentry\b/.test(body) && (body.match(/\b\w+\s*:/g) ?? []).length === 1,
    "ClipboardState has only entry",
  );

  assertCase(
    block,
    "state.nullableEntry",
    /entry\s*:\s*ClipboardEntry\s*\|\s*null/.test(body) ||
      /entry\s*:\s*ClipboardEntry\s*\|\s*null/.test(stripped),
    "entry is ClipboardEntry | null",
  );

  assertCase(
    block,
    "state.createFactory",
    /export\s+function\s+createClipboardState/.test(stateSrc) &&
      /Object\.freeze/.test(stateSrc),
    "createClipboardState factory uses Object.freeze",
  );

  assertCase(
    block,
    "state.emptyConstant",
    /export\s+const\s+EMPTY_CLIPBOARD_STATE/.test(stateSrc),
    "EMPTY_CLIPBOARD_STATE exported",
  );

  assertCase(
    block,
    "state.noCollections",
    !/\bArray\b/.test(stripped) &&
      !/\bSet\b/.test(stripped) &&
      !/\bMap\b/.test(stripped),
    "ClipboardState has no Array/Set/Map",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — registryApiFreeze                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "registryApiFreeze";
  const registry = existsSync(join(repoRoot, CB_REGISTRY))
    ? read(CB_REGISTRY)
    : "";
  const body = extractInterfaceBody(registry, "ClipboardRegistryApi");
  const required = ["set", "clear", "get", "getState"];

  for (const method of required) {
    assertCase(
      block,
      `api.has.${method}`,
      new RegExp(`\\b${method}\\s*\\(`).test(body),
      `ClipboardRegistryApi has ${method}()`,
    );
  }

  const methodDecls = body.match(/\b\w+\s*\(/g) ?? [];
  assertCase(
    block,
    "api.exactlyFourMethods",
    methodDecls.length === 4,
    `ClipboardRegistryApi has exactly 4 methods (found ${methodDecls.length})`,
  );

  const stripped = stripComments(registry);
  for (const re of FORBIDDEN_EXTRA_METHODS) {
    assertCase(
      block,
      `api.forbid.${re.source}`,
      !re.test(stripped),
      `ClipboardRegistry forbids ${re.source}`,
    );
  }

  assertCase(
    block,
    "api.objectFreeze",
    /Object\.freeze\s*\(\s*api\s*\)/.test(registry) ||
      /return\s+Object\.freeze/.test(registry),
    "createClipboardRegistry returns Object.freeze(API)",
  );

  assertCase(
    block,
    "api.cloneOnRead",
    /function\s+snapshot/.test(registry) &&
      /createClipboardState/.test(registry),
    "Registry uses snapshot() + createClipboardState (clone-on-read)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — apiStabilityFreeze                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "apiStabilityFreeze";
  const registry = existsSync(join(repoRoot, CB_REGISTRY))
    ? read(CB_REGISTRY)
    : "";
  const doc = existsSync(join(repoRoot, DOC_8_6)) ? read(DOC_8_6) : "";

  assertCase(
    block,
    "stability.doc",
    /API Stability Freeze/i.test(doc) &&
      (/get\(\)\s*≡\s*getState\(\)/.test(doc) ||
        /equivalen/i.test(doc) ||
        /intentionally equivalent/i.test(doc)),
    "Docs document get() ≡ getState()",
  );

  assertCase(
    block,
    "stability.registryHeader",
    /API Stability Freeze/i.test(registry) &&
      (/get\(\).*getState\(\)|equivalent/i.test(registry) ||
        /intentionally equivalent/i.test(registry)),
    "Registry header documents API Stability Freeze",
  );

  const getBody = extractMethodBody(registry, "get");
  const getStateBody = extractMethodBody(registry, "getState");
  assertCase(
    block,
    "stability.bothCallSnapshot",
    /snapshot\s*\(/.test(getBody) && /snapshot\s*\(/.test(getStateBody),
    "get() and getState() both call snapshot()",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — clipboardContractFreeze                                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "clipboardContractFreeze";
  const doc = existsSync(join(repoRoot, DOC_8_6)) ? read(DOC_8_6) : "";
  const types = existsSync(join(repoRoot, CB_TYPES)) ? read(CB_TYPES) : "";
  const registry = existsSync(join(repoRoot, CB_REGISTRY))
    ? read(CB_REGISTRY)
    : "";

  assertCase(
    block,
    "contract.doc",
    /Clipboard Contract Freeze/i.test(doc) &&
      /logical payload/i.test(doc),
    "Docs document Clipboard Contract Freeze (logical payload)",
  );

  assertCase(
    block,
    "contract.typesComment",
    /Clipboard Contract Freeze/i.test(types) ||
      /logical payload only/i.test(types),
    "Types document Clipboard Contract / logical payload",
  );

  assertCase(
    block,
    "contract.registryComment",
    /Clipboard Contract Freeze/i.test(registry),
    "Registry header documents Clipboard Contract Freeze",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — clipboardSemanticsFreeze                                         */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "clipboardSemanticsFreeze";
  const doc = existsSync(join(repoRoot, DOC_8_6)) ? read(DOC_8_6) : "";
  const registry = existsSync(join(repoRoot, CB_REGISTRY))
    ? read(CB_REGISTRY)
    : "";
  const setBody = extractMethodBody(registry, "set");
  const clearBody = extractMethodBody(registry, "clear");

  assertCase(
    block,
    "semantics.doc",
    /Clipboard Semantics Freeze/i.test(doc) &&
      (/replaces completely|replace/i.test(doc) || /reemplaza/i.test(doc)),
    "Docs document Clipboard Semantics Freeze (set replaces)",
  );

  assertCase(
    block,
    "semantics.registryComment",
    /Clipboard Semantics Freeze/i.test(registry) &&
      /replace/i.test(registry),
    "Registry header documents Clipboard Semantics Freeze",
  );

  assertCase(
    block,
    "semantics.setAssigns",
    /entry\s*=/.test(setBody) && /Object\.freeze/.test(setBody),
    "set() assigns a new frozen entry (full replace)",
  );

  assertCase(
    block,
    "semantics.clearNull",
    /entry\s*=\s*null/.test(clearBody),
    "clear() sets entry = null",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — entryReplacementFreeze                                           */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "entryReplacementFreeze";
  const doc = existsSync(join(repoRoot, DOC_8_6)) ? read(DOC_8_6) : "";
  const registry = existsSync(join(repoRoot, CB_REGISTRY))
    ? read(CB_REGISTRY)
    : "";
  const setBody = stripComments(extractMethodBody(registry, "set"));

  assertCase(
    block,
    "replacement.doc",
    /Entry Replacement Freeze/i.test(doc),
    "Docs document Entry Replacement Freeze",
  );

  assertCase(
    block,
    "replacement.registryComment",
    /Entry Replacement Freeze/i.test(registry),
    "Registry header documents Entry Replacement Freeze",
  );

  assertCase(
    block,
    "replacement.noMerge",
    !/\bmerge\b/.test(setBody) &&
      !/\bObject\.assign\b/.test(setBody) &&
      !/\.\.\./.test(setBody),
    "set() does not merge/spread/patch existing entry",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — payloadOpaquenessFreeze                                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "payloadOpaquenessFreeze";
  const doc = existsSync(join(repoRoot, DOC_8_6)) ? read(DOC_8_6) : "";
  const registry = existsSync(join(repoRoot, CB_REGISTRY))
    ? read(CB_REGISTRY)
    : "";
  const stripped = stripComments(registry);

  assertCase(
    block,
    "payload.doc",
    /Payload Opaqueness Freeze/i.test(doc) && /opaque/i.test(doc),
    "Docs document Payload Opaqueness Freeze",
  );

  assertCase(
    block,
    "payload.registryComment",
    /Payload Opaqueness Freeze/i.test(registry),
    "Registry header documents Payload Opaqueness Freeze",
  );

  assertCase(
    block,
    "payload.noInspection",
    !/\bJSON\.(parse|stringify)\b/.test(stripped) &&
      !/\btypeof\s+.*payload/.test(stripped) &&
      !/payload\s*\./.test(stripped) &&
      !/\bpayload\s*\[/.test(stripped),
    "Registry does not inspect/serialize payload",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 11 — clipboardIdentityFreeze                                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "clipboardIdentityFreeze";
  const doc = existsSync(join(repoRoot, DOC_8_6)) ? read(DOC_8_6) : "";
  const registry = existsSync(join(repoRoot, CB_REGISTRY))
    ? read(CB_REGISTRY)
    : "";
  const stripped = stripComments(registry);
  const setBody = stripComments(extractMethodBody(registry, "set"));

  assertCase(
    block,
    "identity.doc",
    /Clipboard Identity Freeze/i.test(doc) &&
      (/opaque/i.test(doc) || /opaco/i.test(doc)),
    "Docs document Clipboard Identity Freeze",
  );

  assertCase(
    block,
    "identity.registryComment",
    /Clipboard Identity Freeze/i.test(registry),
    "Registry header documents Clipboard Identity Freeze",
  );

  assertCase(
    block,
    "identity.noGenerate",
    !/\bcrypto\b/.test(stripped) &&
      !/\buuid\b/i.test(stripped) &&
      !/\brandomUUID\b/.test(stripped) &&
      !/\bDate\.now\b/.test(stripped) &&
      !/id\s*=\s*[`'"]/.test(setBody) &&
      !/id\s*:\s*[`'"]/.test(setBody),
    "Registry never generates id",
  );

  assertCase(
    block,
    "identity.noMutateId",
    !/\.id\s*=/.test(stripped) && !/entry\.id\s*=/.test(stripped),
    "Registry never assigns entry.id in place",
  );

  assertCase(
    block,
    "identity.storesAsReceived",
    /id\s*:\s*next\.id/.test(setBody) || /id\s*:\s*\w+\.id/.test(setBody),
    "set() stores id exactly as received",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 12 — entryImmutabilityFreeze                                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "entryImmutabilityFreeze";
  const doc = existsSync(join(repoRoot, DOC_8_6)) ? read(DOC_8_6) : "";
  const registry = existsSync(join(repoRoot, CB_REGISTRY))
    ? read(CB_REGISTRY)
    : "";
  const stripped = stripComments(registry);
  const setBody = stripComments(extractMethodBody(registry, "set"));

  assertCase(
    block,
    "immutability.doc",
    /Entry Immutability Freeze/i.test(doc) &&
      (/never mutate/i.test(doc) || /never mutated/i.test(doc) ||
        /nunca.*muta/i.test(doc)),
    "Docs document Entry Immutability Freeze",
  );

  assertCase(
    block,
    "immutability.registryComment",
    /Entry Immutability Freeze/i.test(registry),
    "Registry header documents Entry Immutability Freeze",
  );

  assertCase(
    block,
    "immutability.noPartialAssign",
    !/entry\.id\s*=/.test(stripped) &&
      !/entry\.kind\s*=/.test(stripped) &&
      !/entry\.payload\s*=/.test(stripped),
    "No partial field assignments on stored entry",
  );

  assertCase(
    block,
    "immutability.replacePath",
    /Object\.freeze/.test(setBody) && /entry\s*=/.test(setBody),
    "set() replaces via new Object.freeze entry",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 13 — statelessClipboardFreeze                                         */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "statelessClipboardFreeze";
  const doc = existsSync(join(repoRoot, DOC_8_6)) ? read(DOC_8_6) : "";
  const registry = existsSync(join(repoRoot, CB_REGISTRY))
    ? read(CB_REGISTRY)
    : "";
  const stateSrc = existsSync(join(repoRoot, CB_STATE)) ? read(CB_STATE) : "";
  const moduleAll = walkFiles(join(repoRoot, CB_DIR))
    .map((f) => readFileSync(f, "utf8"))
    .join("\n");
  const strippedModule = stripComments(moduleAll);

  assertCase(
    block,
    "stateless.doc",
    /Stateless Clipboard Freeze/i.test(doc) && /\bentry\b/.test(doc),
    "Docs document Stateless Clipboard Freeze",
  );

  assertCase(
    block,
    "stateless.registryComment",
    /Stateless Clipboard Freeze/i.test(registry),
    "Registry header documents Stateless Clipboard Freeze",
  );

  for (const field of FORBIDDEN_STATE_FIELDS) {
    assertCase(
      block,
      `stateless.no.${field}`,
      !new RegExp(`\\b${field}\\b`).test(
        extractReadonlyTypeBody(stateSrc, "ClipboardState"),
      ),
      `ClipboardState has no ${field}`,
    );
  }

  const privateLets = registry.match(/\blet\s+(\w+)/g) ?? [];
  assertCase(
    block,
    "stateless.privateEntryOnly",
    privateLets.length === 1 && /let\s+entry\b/.test(registry),
    "Registry private state is only `let entry`",
  );

  assertCase(
    block,
    "stateless.moduleNoHistory",
    !/\bpreviousEntry\b/.test(strippedModule) &&
      !/\bundoStack\b/.test(strippedModule) &&
      !/\bclipboardHistory\b/.test(strippedModule),
    "Module has no previousEntry / undoStack / clipboardHistory",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 14 — browserClipboardFreeze                                           */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "browserClipboardFreeze";
  const doc = existsSync(join(repoRoot, DOC_8_6)) ? read(DOC_8_6) : "";
  const moduleAll = walkFiles(join(repoRoot, CB_DIR))
    .map((f) => readFileSync(f, "utf8"))
    .join("\n");
  const stripped = stripComments(moduleAll);

  assertCase(
    block,
    "browser.doc",
    /Browser Clipboard Freeze/i.test(doc) &&
      /navigator\.clipboard/.test(doc),
    "Docs document Browser Clipboard Freeze",
  );

  for (const re of BROWSER_FORBIDDEN) {
    assertCase(
      block,
      `browser.forbid.${re.source}`,
      !re.test(stripped),
      `clipboard/** forbids ${re.source}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 15 — barrelExport                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "barrelExport";
  const indexRaw = existsSync(join(repoRoot, CB_INDEX)) ? read(CB_INDEX) : "";
  const uiIndex = existsSync(join(repoRoot, UI_INDEX)) ? read(UI_INDEX) : "";

  const requiredExports = [
    "ClipboardEntry",
    "createClipboardState",
    "EMPTY_CLIPBOARD_STATE",
    "ClipboardRegistryApi",
    "createClipboardRegistry",
    "clipboardRegistry",
    "ClipboardContext",
    "ClipboardProvider",
    "useClipboard",
  ];
  for (const name of requiredExports) {
    assertCase(
      block,
      `barrel.exports.${name}`,
      new RegExp(`\\b${name}\\b`).test(indexRaw),
      `index.ts exports ${name}`,
    );
  }

  assertCase(
    block,
    "barrel.notInPublicUi",
    !/from\s+["']\.\/clipboard["']/.test(uiIndex) &&
      !/from\s+["']\.\/clipboard\//.test(uiIndex),
    "src/ui/index.ts does not re-export clipboard module",
  );

  assertCase(
    block,
    "barrel.localOnlyComment",
    /Not re-exported from @\/ui/i.test(indexRaw) ||
      /not re-exported/i.test(indexRaw),
    "index.ts comments that module is not exported globally",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 16 — dependencyRule                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "dependencyRule";
  const cbFiles = walkFiles(join(repoRoot, CB_DIR));
  const allRaw = cbFiles.map((f) => readFileSync(f, "utf8")).join("\n");
  const all = stripComments(allRaw);

  assertCase(
    block,
    "dep.noWindows",
    !/components\/windows/.test(all) &&
      !/from\s+["'][^"']*windows[^"']*["']/.test(all) &&
      !/\bWindowRegistry\b/.test(all) &&
      !/\bWindowManager\b/.test(all) &&
      !/\bWindowAPI\b/.test(all) &&
      !/\bWindowTypes\b/.test(all),
    "clipboard/** does not import windows/** or WindowRegistry",
  );

  assertCase(
    block,
    "dep.noFocus",
    !/from\s+["'][^"']*\/focus[^"']*["']/.test(all) &&
      !/\bFocusRegistry\b/.test(all) &&
      !/\bFocusProvider\b/.test(all) &&
      !/\bFocusContext\b/.test(all) &&
      !/\buseFocus\b/.test(all),
    "clipboard/** does not import Focus module",
  );

  assertCase(
    block,
    "dep.noSelection",
    !/from\s+["'][^"']*\/selection[^"']*["']/.test(all) &&
      !/\bSelectionRegistry\b/.test(all) &&
      !/\bSelectionProvider\b/.test(all) &&
      !/\bSelectionContext\b/.test(all) &&
      !/\buseSelection\b/.test(all),
    "clipboard/** does not import Selection module",
  );

  assertCase(
    block,
    "dep.noHover",
    !/from\s+["'][^"']*\/hover[^"']*["']/.test(all) &&
      !/\bHoverRegistry\b/.test(all) &&
      !/\bHoverProvider\b/.test(all) &&
      !/\bHoverContext\b/.test(all) &&
      !/\buseHover\b/.test(all),
    "clipboard/** does not import Hover module",
  );

  assertCase(
    block,
    "dep.noKeyboard",
    !/from\s+["'][^"']*\/keyboard-nav[^"']*["']/.test(all) &&
      !/\bKeyboardNavigationRegistry\b/.test(all) &&
      !/\bKeyboardNavigationProvider\b/.test(all) &&
      !/\buseKeyboardNavigation\b/.test(all),
    "clipboard/** does not import Keyboard Navigation module",
  );

  assertCase(
    block,
    "dep.noForeignRegistry",
    !/from\s+["'][^"']*\/(commands|visibility|features|selection|shortcuts|menus|focus|hover|keyboard-nav|interaction-commands)[^"']*["']/.test(
      all,
    ) &&
      !/\bCommandRegistry\b/.test(all) &&
      !/\bVisibilityRegistry\b/.test(all) &&
      !/\bFeatureRegistry\b/.test(all) &&
      !/\bSelectionRegistry\b/.test(all) &&
      !/\bFocusRegistry\b/.test(all) &&
      !/\bHoverRegistry\b/.test(all),
    "clipboard/** does not import foreign Registry modules",
  );

  assertCase(
    block,
    "dep.noForeignProviderContext",
    !/\bCommandProvider\b/.test(all) &&
      !/\bCommandContext\b/.test(all) &&
      !/\bFeatureProvider\b/.test(all) &&
      !/\bVisibilityProvider\b/.test(all) &&
      !/\bActivePanelProvider\b/.test(all) &&
      !/\bSelectionProvider\b/.test(all) &&
      !/\bSelectionContext\b/.test(all) &&
      !/\bFocusProvider\b/.test(all) &&
      !/\bFocusContext\b/.test(all) &&
      !/\bHoverProvider\b/.test(all) &&
      !/\bHoverContext\b/.test(all) &&
      !/\bKeyboardNavigationProvider\b/.test(all) &&
      !/\bKeyboardNavigationContext\b/.test(all),
    "clipboard/** does not import foreign Provider/Context",
  );

  assertCase(
    block,
    "dep.noScientific",
    !/lib\/scientific/.test(all) && !/\bsrc\/lib\/graph\b/.test(all),
    "clipboard/** does not import scientific / graph engines",
  );

  assertCase(
    block,
    "dep.noBrowserClipboard",
    !/\bnavigator\.clipboard\b/.test(all) &&
      !/\bClipboardEvent\b/.test(all) &&
      !/\bexecCommand\b/.test(all),
    "clipboard/** does not use browser clipboard APIs",
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
/* PASS 17 — authorities                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "authorities";
  const arch = existsSync(join(repoRoot, ARCH)) ? read(ARCH) : "";
  const doc = existsSync(join(repoRoot, DOC_8_6)) ? read(DOC_8_6) : "";

  assertCase(
    block,
    "auth.matrixClipboard",
    /Clipboard/i.test(arch) && /ClipboardRegistry/.test(arch),
    "Architecture Authorities Matrix lists Clipboard → ClipboardRegistry",
  );

  assertCase(
    block,
    "auth.docSole",
    /ClipboardRegistry/.test(doc) &&
      (/sole|única autoridad|ONLY mutation authority|única/i.test(doc) ||
        /Authorit/i.test(doc)),
    "UX-8.6.md documents ClipboardRegistry as sole authority",
  );

  assertCase(
    block,
    "auth.noCrossMutation",
    /No Focus/i.test(doc) ||
      /NO Focus/i.test(doc) ||
      /prohibido mutar/i.test(doc) ||
      /cross-registry/i.test(doc),
    "UX-8.6.md forbids cross-registry mutation",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 18 — noProductMount                                                   */
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
    !/\bClipboardProvider\b/.test(page) && !/ui\/clipboard/.test(page),
    "page.tsx does not mount ClipboardProvider",
  );

  assertCase(
    block,
    "mount.noAppShell",
    !/\bClipboardProvider\b/.test(appShellRaw) &&
      !/ui\/clipboard/.test(appShellRaw),
    "AppShell does not mount ClipboardProvider",
  );

  assertCase(
    block,
    "mount.noPublicBarrel",
    !/from\s+["']\.\/clipboard["']/.test(uiIndex) &&
      !/from\s+["']\.\/clipboard\//.test(uiIndex),
    "@/ui barrel does not export clipboard",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 19 — windowRegistryIntact                                             */
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
    "window.noClipboardImport",
    !/ui\/clipboard/.test(wr) && !/\bclipboardRegistry\b/.test(wr),
    "WindowRegistry does not import clipboard module",
  );

  const cbAll = walkFiles(join(repoRoot, CB_DIR))
    .map((f) => readFileSync(f, "utf8"))
    .join("\n");
  assertCase(
    block,
    "cb.noWindowRegistryImport",
    !/WindowRegistry/.test(stripComments(cbAll)),
    "clipboard/** does not reference WindowRegistry",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 20 — roadmapUpdated                                                   */
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
    "roadmap.ux86Complete",
    /UX-8\.6\s*=\s*COMPLETE/i.test(roadmap) ||
      (/UX-8\.6/.test(roadmap) &&
        /Clipboard/.test(roadmap) &&
        /COMPLETE/.test(roadmap)),
    "Roadmap marks UX-8.6 COMPLETE",
  );

  assertCase(
    block,
    "roadmap.tableComplete",
    /UX-8\.6\s*\|\s*Clipboard Foundation\s*\|\s*COMPLETE/i.test(roadmap),
    "Roadmap phase table marks UX-8.6 COMPLETE",
  );

  assertCase(
    block,
    "roadmap.historicalGate",
    /validate:ux-8\.6/.test(roadmap) && /UX-8\.6\.md/.test(roadmap),
    "Roadmap lists historical gate validate:ux-8.6",
  );

  assertCase(
    block,
    "roadmap.next87",
    /UX-8\.7/.test(roadmap) && /Interaction Commands/i.test(roadmap),
    "Roadmap lists UX-8.7 Interaction Commands",
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
  "entryContract",
  "stateContract",
  "registryApiFreeze",
  "apiStabilityFreeze",
  "clipboardContractFreeze",
  "clipboardSemanticsFreeze",
  "entryReplacementFreeze",
  "payloadOpaquenessFreeze",
  "clipboardIdentityFreeze",
  "entryImmutabilityFreeze",
  "statelessClipboardFreeze",
  "browserClipboardFreeze",
  "barrelExport",
  "dependencyRule",
  "authorities",
  "noProductMount",
  "windowRegistryIntact",
  "roadmapUpdated",
] as const;

console.log("UX-8.6 Clipboard Foundation — validation\n");

for (const b of blocks) {
  const blockResults = results.filter((r) => r.block === b);
  const ok = blockResults.every((r) => r.pass);
  const label = ok ? "PASS" : "FAIL";
  console.log(
    `  [${label}] ${b} (${blockResults.filter((r) => r.pass).length}/${blockResults.length})`,
  );
  for (const r of blockResults.filter((x) => !x.pass)) {
    console.log(`         ✗ ${r.id}: ${r.detail}`);
  }
}

console.log(
  `\nResult: ${failed.length === 0 ? "PASS" : "FAIL"} ${passed.length}/${results.length}`,
);

if (failed.length > 0) {
  process.exitCode = 1;
}
