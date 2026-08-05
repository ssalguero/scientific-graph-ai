/**
 * UX-8.5 — Keyboard Navigation Foundation gate.
 *
 * Blocks:
 * documentationExists · moduleExists · stateContract · directionEnum
 * registryApiFreeze · apiStabilityFreeze · navigationSemanticsFreeze
 * directionNormalizationFreeze · statelessNavigationFreeze · domFreeze
 * barrelExport · dependencyRule · authorities · noProductMount
 * windowRegistryIntact · roadmapUpdated
 *
 * Architectural principles:
 * - KeyboardNavigationState = { lastDirection } only.
 * - Direction Normalization Freeze · move() canonical · next/previous/escape delegate.
 * - Stateless Navigation Freeze · no index/target/cursor/stack/history.
 * - DOM Freeze · no KeyboardEvent / window / document / listeners.
 * - API Freeze = next / previous / move / escape / clear / get / getState.
 * - API Stability Freeze = get() ≡ getState().
 * - Singleton Freeze = infra/testing only · React via Provider + hook.
 * - KeyboardNavigationRegistry = sole authority · Dependency Rule · no product mount.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "documentationExists"
  | "moduleExists"
  | "stateContract"
  | "directionEnum"
  | "registryApiFreeze"
  | "apiStabilityFreeze"
  | "navigationSemanticsFreeze"
  | "directionNormalizationFreeze"
  | "statelessNavigationFreeze"
  | "domFreeze"
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

const KN_DIR = "src/ui/keyboard-nav";
const KN_TYPES = `${KN_DIR}/KeyboardNavigationTypes.ts`;
const KN_STATE = `${KN_DIR}/KeyboardNavigationState.ts`;
const KN_REGISTRY = `${KN_DIR}/KeyboardNavigationRegistry.ts`;
const KN_CONTEXT = `${KN_DIR}/KeyboardNavigationContext.tsx`;
const KN_PROVIDER = `${KN_DIR}/KeyboardNavigationProvider.tsx`;
const KN_HOOK = `${KN_DIR}/useKeyboardNavigation.ts`;
const KN_INDEX = `${KN_DIR}/index.ts`;
const UI_INDEX = "src/ui/index.ts";
const WINDOW_REGISTRY = "src/components/windows/WindowRegistry.ts";
const PAGE_TSX = "src/app/page.tsx";
const ARCH = "docs/UX/UX-8-architecture.md";
const ROADMAP = "docs/UX/UX-8.0-roadmap.md";
const DOC_8_5 = "docs/UX/UX-8.5.md";
const PACKAGE_JSON = "package.json";

const MODULE_FILES = [
  KN_TYPES,
  KN_STATE,
  KN_REGISTRY,
  KN_CONTEXT,
  KN_PROVIDER,
  KN_HOOK,
  KN_INDEX,
] as const;

const FORBIDDEN_EXTRA_METHODS = [
  /\bhandleKey\s*\(/,
  /\bonKeyDown\s*\(/,
  /\bonKeyUp\s*\(/,
  /\bregisterShortcut\s*\(/,
  /\bbind\s*\(/,
  /\bexecute\s*\(/,
  /\bfocus\s*\(/,
  /\bselect\s*\(/,
  /\bsetState\s*\(/,
  /\bupdate\s*\(/,
];

const FORBIDDEN_STATE_FIELDS = [
  "currentIndex",
  "currentTarget",
  "currentFocus",
  "currentSelection",
  "navigationStack",
  "history",
];

const DOM_FORBIDDEN = [
  /\bKeyboardEvent\b/,
  /\baddEventListener\b/,
  /\bremoveEventListener\b/,
  /\bEventTarget\b/,
  /\bHTMLElement\b/,
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
    existsSync(join(repoRoot, DOC_8_5)),
    `${DOC_8_5} exists`,
  );

  const pkg = existsSync(join(repoRoot, PACKAGE_JSON))
    ? read(PACKAGE_JSON)
    : "";
  assertCase(
    block,
    "exists.npmScript",
    /"validate:ux-8\.5"\s*:/.test(pkg),
    "package.json has validate:ux-8.5",
  );

  const doc = existsSync(join(repoRoot, DOC_8_5)) ? read(DOC_8_5) : "";

  assertCase(
    block,
    "doc.ssotRef",
    /UX-8-architecture\.md/.test(doc),
    "UX-8.5.md references architecture SSOT",
  );

  assertCase(
    block,
    "doc.apiFreeze",
    /API Freeze/i.test(doc) &&
      /next\(\)/.test(doc) &&
      /previous\(\)/.test(doc) &&
      /move\(/.test(doc) &&
      /escape\(\)/.test(doc) &&
      /clear\(\)/.test(doc) &&
      /get\(\)/.test(doc) &&
      /getState\(\)/.test(doc),
    "UX-8.5.md documents API Freeze (7 methods)",
  );

  assertCase(
    block,
    "doc.navigationSemanticsFreeze",
    /Navigation Semantics Freeze/i.test(doc) &&
      (/intent/i.test(doc) || /intención/i.test(doc)) &&
      (/NEXT.*Tab|Tab.*NEXT|≠ Tab|does NOT mean.*Tab/i.test(doc) ||
        /NEXT\s*≠\s*Tab/i.test(doc)),
    "UX-8.5.md documents Navigation Semantics Freeze",
  );

  assertCase(
    block,
    "doc.directionNormalizationFreeze",
    /Direction Normalization Freeze/i.test(doc) &&
      (/move\(\).*canonical|canonical.*move\(\)/i.test(doc) ||
        /ONLY canonical/i.test(doc)) &&
      /next\(\)/.test(doc) &&
      /move\(NEXT\)/.test(doc) &&
      /previous\(\)/.test(doc) &&
      /move\(PREVIOUS\)/.test(doc) &&
      /escape\(\)/.test(doc) &&
      /move\(ESCAPE\)/.test(doc),
    "UX-8.5.md documents Direction Normalization Freeze",
  );

  assertCase(
    block,
    "doc.statelessNavigationFreeze",
    /Stateless Navigation Freeze/i.test(doc) &&
      /lastDirection/.test(doc) &&
      /currentIndex/.test(doc) &&
      /currentTarget/.test(doc),
    "UX-8.5.md documents Stateless Navigation Freeze",
  );

  assertCase(
    block,
    "doc.domFreeze",
    /DOM Freeze/i.test(doc) &&
      /KeyboardEvent/.test(doc) &&
      (/addEventListener/.test(doc) || /listeners/i.test(doc)),
    "UX-8.5.md documents DOM Freeze",
  );

  assertCase(
    block,
    "doc.apiStabilityFreeze",
    /API Stability Freeze/i.test(doc) &&
      (/get\(\).*getState\(\)|getState\(\).*get\(\)/i.test(doc) ||
        /get\(\)\s*≡\s*getState\(\)/.test(doc) ||
        /equivalen/i.test(doc)),
    "UX-8.5.md documents API Stability Freeze",
  );

  assertCase(
    block,
    "doc.singletonFreeze",
    /Singleton Freeze/i.test(doc) &&
      /KeyboardNavigationProvider/.test(doc) &&
      /useKeyboardNavigation/.test(doc) &&
      (/infraestructura|infrastructure/i.test(doc) || /testing/i.test(doc)),
    "UX-8.5.md documents Singleton Freeze",
  );

  assertCase(
    block,
    "doc.dependencyRule",
    /Dependency Rule/i.test(doc),
    "UX-8.5.md documents Dependency Rule",
  );

  assertCase(
    block,
    "doc.authorities",
    /Authorit/i.test(doc) && /KeyboardNavigationRegistry/.test(doc),
    "UX-8.5.md documents Authorities (KeyboardNavigationRegistry)",
  );

  assertCase(
    block,
    "doc.outOfScope",
    /Out of Scope/i.test(doc),
    "UX-8.5.md documents Out of Scope",
  );

  assertCase(
    block,
    "doc.integrationFence",
    /Integration Fence/i.test(doc) || /Exclusions/i.test(doc),
    "UX-8.5.md documents Integration Fence / Exclusions",
  );

  assertCase(
    block,
    "doc.next86",
    /Next/i.test(doc) && /UX-8\.6/.test(doc) && /Clipboard/i.test(doc),
    "UX-8.5.md documents Next UX-8.6 Clipboard Foundation",
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
    existsSync(join(repoRoot, KN_DIR)),
    `${KN_DIR}/ directory exists`,
  );

  for (const rel of MODULE_FILES) {
    assertCase(
      block,
      `exists.${rel.split("/").pop()}`,
      existsSync(join(repoRoot, rel)),
      `${rel} exists`,
    );
  }

  const registry = existsSync(join(repoRoot, KN_REGISTRY))
    ? read(KN_REGISTRY)
    : "";

  assertCase(
    block,
    "exists.KeyboardNavigationRegistryApi",
    /export\s+interface\s+KeyboardNavigationRegistryApi/.test(registry),
    "KeyboardNavigationRegistryApi interface exported",
  );

  assertCase(
    block,
    "exists.createKeyboardNavigationRegistry",
    /export\s+function\s+createKeyboardNavigationRegistry/.test(registry),
    "createKeyboardNavigationRegistry factory exported",
  );

  assertCase(
    block,
    "exists.singleton",
    /export\s+const\s+keyboardNavigationRegistry/.test(registry),
    "keyboardNavigationRegistry singleton exported",
  );

  assertCase(
    block,
    "registry.reactFree",
    !/\bfrom\s+["']react["']/.test(stripComments(registry)) &&
      !/\bReact\b/.test(stripComments(registry)),
    "KeyboardNavigationRegistry.ts is React-free",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — stateContract                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "stateContract";
  const stateSrc = existsSync(join(repoRoot, KN_STATE)) ? read(KN_STATE) : "";
  const body = extractReadonlyTypeBody(stateSrc, "KeyboardNavigationState");
  const stripped = stripComments(stateSrc);

  assertCase(
    block,
    "state.lastDirectionOnly",
    /\blastDirection\b/.test(body) &&
      (body.match(/\b\w+\s*:/g) ?? []).length === 1,
    "KeyboardNavigationState has only lastDirection",
  );

  assertCase(
    block,
    "state.nullableDirection",
    /lastDirection\s*:\s*KeyboardNavigationDirection\s*\|\s*null/.test(body) ||
      /lastDirection\s*:\s*KeyboardNavigationDirection\s*\|\s*null/.test(
        stripped,
      ),
    "lastDirection is KeyboardNavigationDirection | null",
  );

  assertCase(
    block,
    "state.createFactory",
    /export\s+function\s+createKeyboardNavigationState/.test(stateSrc) &&
      /Object\.freeze/.test(stateSrc),
    "createKeyboardNavigationState uses Object.freeze",
  );

  assertCase(
    block,
    "state.emptyConstant",
    /export\s+const\s+EMPTY_KEYBOARD_NAVIGATION_STATE/.test(stateSrc) &&
      /lastDirection\s*:\s*null/.test(stateSrc),
    "EMPTY_KEYBOARD_NAVIGATION_STATE exported with null lastDirection",
  );

  assertCase(
    block,
    "state.noCollections",
    !/\bArray\b/.test(body) &&
      !/\bSet\b/.test(body) &&
      !/\bMap\b/.test(body),
    "KeyboardNavigationState has no Array/Set/Map",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — directionEnum                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "directionEnum";
  const typesSrc = existsSync(join(repoRoot, KN_TYPES)) ? read(KN_TYPES) : "";
  const stripped = stripComments(typesSrc);

  assertCase(
    block,
    "enum.exists",
    /export\s+enum\s+KeyboardNavigationDirection/.test(typesSrc),
    "KeyboardNavigationDirection enum exported",
  );

  const required = [
    "NEXT",
    "PREVIOUS",
    "UP",
    "DOWN",
    "LEFT",
    "RIGHT",
    "ESCAPE",
  ];
  for (const member of required) {
    assertCase(
      block,
      `enum.${member}`,
      new RegExp(`\\b${member}\\b`).test(stripped),
      `KeyboardNavigationDirection has ${member}`,
    );
  }

  assertCase(
    block,
    "enum.noKeyboardEvent",
    !/\bKeyboardEvent\b/.test(stripped),
    "Types file has no KeyboardEvent",
  );

  assertCase(
    block,
    "enum.noDom",
    !/\bdocument\b/.test(stripped) &&
      !/\bwindow\b/.test(stripped) &&
      !/\bHTMLElement\b/.test(stripped),
    "Types file has no DOM references",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — registryApiFreeze                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "registryApiFreeze";
  const registry = existsSync(join(repoRoot, KN_REGISTRY))
    ? read(KN_REGISTRY)
    : "";
  const apiBody = extractInterfaceBody(
    registry,
    "KeyboardNavigationRegistryApi",
  );
  const stripped = stripComments(registry);

  const requiredMethods = [
    "next",
    "previous",
    "move",
    "escape",
    "clear",
    "get",
    "getState",
  ];
  for (const method of requiredMethods) {
    assertCase(
      block,
      `api.has.${method}`,
      new RegExp(`\\b${method}\\s*\\(`).test(apiBody),
      `KeyboardNavigationRegistryApi has ${method}()`,
    );
  }

  const methodCount = (apiBody.match(/\b\w+\s*\(/g) ?? []).length;
  assertCase(
    block,
    "api.exactlySevenMethods",
    methodCount === 7,
    `KeyboardNavigationRegistryApi has exactly 7 methods (found ${methodCount})`,
  );

  for (const re of FORBIDDEN_EXTRA_METHODS) {
    const name = re.source.replace(/\\b|\\s\*\\\(/g, "");
    assertCase(
      block,
      `api.forbid.${name}`,
      !re.test(apiBody) && !re.test(stripped),
      `Forbidden method not present: ${name}`,
    );
  }

  assertCase(
    block,
    "api.objectFreeze",
    /return\s+Object\.freeze\(/.test(registry),
    "createKeyboardNavigationRegistry returns Object.freeze(API)",
  );

  assertCase(
    block,
    "api.cloneOnRead",
    /createKeyboardNavigationState/.test(registry) &&
      /function\s+snapshot/.test(registry),
    "Registry uses clone-on-read via createKeyboardNavigationState",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — apiStabilityFreeze                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "apiStabilityFreeze";
  const registry = existsSync(join(repoRoot, KN_REGISTRY))
    ? read(KN_REGISTRY)
    : "";
  const doc = existsSync(join(repoRoot, DOC_8_5)) ? read(DOC_8_5) : "";

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
        /get\(\) and getState\(\)/i.test(registry)),
    "Registry header documents get() ≡ getState()",
  );

  const getBody = extractMethodBody(registry, "get");
  const getStateBody = extractMethodBody(registry, "getState");
  assertCase(
    block,
    "stability.bothUseSnapshot",
    /snapshot\s*\(/.test(getBody) && /snapshot\s*\(/.test(getStateBody),
    "get() and getState() both return snapshot()",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — navigationSemanticsFreeze                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "navigationSemanticsFreeze";
  const doc = existsSync(join(repoRoot, DOC_8_5)) ? read(DOC_8_5) : "";
  const registry = existsSync(join(repoRoot, KN_REGISTRY))
    ? read(KN_REGISTRY)
    : "";
  const types = existsSync(join(repoRoot, KN_TYPES)) ? read(KN_TYPES) : "";

  assertCase(
    block,
    "semantics.docIntent",
    /Navigation Semantics Freeze/i.test(doc) && /intent/i.test(doc),
    "Docs state registry models intent",
  );

  assertCase(
    block,
    "semantics.notPhysicalKeys",
    (/NEXT.*≠.*Tab|NEXT does NOT mean Tab|does NOT mean[\s\S]*Tab/i.test(doc) ||
      /NEXT\s*≠\s*Tab/i.test(doc)) &&
      (/ESCAPE.*KeyboardEvent|does NOT mean[\s\S]*Escape/i.test(doc) ||
        /ESCAPE\s*≠/i.test(doc)),
    "Docs clarify intent ≠ physical keys",
  );

  assertCase(
    block,
    "semantics.registryComment",
    /Navigation Semantics Freeze|intent only/i.test(registry) ||
      /intent only/i.test(types),
    "Source documents Navigation Semantics Freeze / intent only",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — directionNormalizationFreeze                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "directionNormalizationFreeze";
  const doc = existsSync(join(repoRoot, DOC_8_5)) ? read(DOC_8_5) : "";
  const registry = existsSync(join(repoRoot, KN_REGISTRY))
    ? read(KN_REGISTRY)
    : "";

  assertCase(
    block,
    "norm.doc",
    /Direction Normalization Freeze/i.test(doc) &&
      /move\(NEXT\)/.test(doc) &&
      /move\(PREVIOUS\)/.test(doc) &&
      /move\(ESCAPE\)/.test(doc),
    "Docs document Direction Normalization Freeze equivalences",
  );

  assertCase(
    block,
    "norm.registryHeader",
    /Direction Normalization Freeze/i.test(registry) &&
      (/canonical/i.test(registry) || /delegate/i.test(registry)),
    "Registry header documents Direction Normalization Freeze",
  );

  const nextBody = extractMethodBody(registry, "next");
  const previousBody = extractMethodBody(registry, "previous");
  const escapeBody = extractMethodBody(registry, "escape");
  const moveBody = extractMethodBody(registry, "move");

  assertCase(
    block,
    "norm.nextDelegates",
    /move\s*\(\s*KeyboardNavigationDirection\.NEXT\s*\)/.test(nextBody),
    "next() delegates to move(KeyboardNavigationDirection.NEXT)",
  );

  assertCase(
    block,
    "norm.previousDelegates",
    /move\s*\(\s*KeyboardNavigationDirection\.PREVIOUS\s*\)/.test(
      previousBody,
    ),
    "previous() delegates to move(KeyboardNavigationDirection.PREVIOUS)",
  );

  assertCase(
    block,
    "norm.escapeDelegates",
    /move\s*\(\s*KeyboardNavigationDirection\.ESCAPE\s*\)/.test(escapeBody),
    "escape() delegates to move(KeyboardNavigationDirection.ESCAPE)",
  );

  assertCase(
    block,
    "norm.moveIsCanonical",
    /lastDirection\s*=\s*direction/.test(moveBody) &&
      !/lastDirection\s*=/.test(nextBody) &&
      !/lastDirection\s*=/.test(previousBody) &&
      !/lastDirection\s*=/.test(escapeBody),
    "Only move() assigns lastDirection; shortcuts do not duplicate logic",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — statelessNavigationFreeze                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "statelessNavigationFreeze";
  const doc = existsSync(join(repoRoot, DOC_8_5)) ? read(DOC_8_5) : "";
  const stateSrc = existsSync(join(repoRoot, KN_STATE)) ? read(KN_STATE) : "";
  const registry = existsSync(join(repoRoot, KN_REGISTRY))
    ? read(KN_REGISTRY)
    : "";
  const moduleAll = walkFiles(join(repoRoot, KN_DIR))
    .map((f) => readFileSync(f, "utf8"))
    .join("\n");
  const strippedAll = stripComments(moduleAll);

  assertCase(
    block,
    "stateless.doc",
    /Stateless Navigation Freeze/i.test(doc) && /lastDirection/.test(doc),
    "Docs document Stateless Navigation Freeze",
  );

  assertCase(
    block,
    "stateless.registryHeader",
    /Stateless Navigation Freeze/i.test(registry),
    "Registry header documents Stateless Navigation Freeze",
  );

  for (const field of FORBIDDEN_STATE_FIELDS) {
    assertCase(
      block,
      `stateless.no.${field}`,
      !new RegExp(`\\b${field}\\b`).test(strippedAll),
      `Module has no ${field}`,
    );
  }

  assertCase(
    block,
    "stateless.stateOnlyLastDirection",
    /\blastDirection\b/.test(stateSrc) &&
      !/\bcurrentIndex\b/.test(stripComments(stateSrc)) &&
      !/\btimestamp\b/i.test(stripComments(stateSrc)) &&
      !/\bmetadata\b/i.test(stripComments(stateSrc)),
    "State file only models lastDirection (no forbidden extras)",
  );

  const privateLets = (
    stripComments(registry).match(/\blet\s+(\w+)/g) ?? []
  ).map((m) => m.replace(/\blet\s+/, ""));
  assertCase(
    block,
    "stateless.privateOnlyLastDirection",
    privateLets.length === 1 && privateLets[0] === "lastDirection",
    `Registry private mutable state is only lastDirection (found: ${privateLets.join(", ") || "none"})`,
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — domFreeze                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "domFreeze";
  const doc = existsSync(join(repoRoot, DOC_8_5)) ? read(DOC_8_5) : "";
  const moduleAll = walkFiles(join(repoRoot, KN_DIR))
    .map((f) => readFileSync(f, "utf8"))
    .join("\n");
  const stripped = stripComments(moduleAll);

  assertCase(
    block,
    "dom.doc",
    /DOM Freeze/i.test(doc) && /KeyboardEvent/.test(doc),
    "Docs document DOM Freeze",
  );

  for (const re of DOM_FORBIDDEN) {
    const name = re.source.replace(/\\b/g, "");
    // Allow the identifiers only inside comment/doc strings already stripped;
    // also allow mentions in freeze documentation comments — stripComments
    // already removed block comments. Fail on code identifiers.
    assertCase(
      block,
      `dom.no.${name}`,
      !re.test(stripped),
      `keyboard-nav/** code has no ${name}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 11 — barrelExport                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "barrelExport";
  const indexRaw = existsSync(join(repoRoot, KN_INDEX)) ? read(KN_INDEX) : "";
  const uiIndex = existsSync(join(repoRoot, UI_INDEX)) ? read(UI_INDEX) : "";

  const requiredExports = [
    "KeyboardNavigationDirection",
    "createKeyboardNavigationState",
    "EMPTY_KEYBOARD_NAVIGATION_STATE",
    "KeyboardNavigationRegistryApi",
    "createKeyboardNavigationRegistry",
    "keyboardNavigationRegistry",
    "KeyboardNavigationContext",
    "KeyboardNavigationProvider",
    "useKeyboardNavigation",
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
    !/from\s+["']\.\/keyboard-nav["']/.test(uiIndex) &&
      !/from\s+["']\.\/keyboard-nav\//.test(uiIndex),
    "src/ui/index.ts does not re-export keyboard-nav module",
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
/* PASS 12 — dependencyRule                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "dependencyRule";
  const knFiles = walkFiles(join(repoRoot, KN_DIR));
  const allRaw = knFiles.map((f) => readFileSync(f, "utf8")).join("\n");
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
    "keyboard-nav/** does not import windows/** or WindowRegistry",
  );

  assertCase(
    block,
    "dep.noFocus",
    !/from\s+["'][^"']*\/focus[^"']*["']/.test(all) &&
      !/\bFocusRegistry\b/.test(all) &&
      !/\bFocusProvider\b/.test(all) &&
      !/\bFocusContext\b/.test(all) &&
      !/\buseFocus\b/.test(all),
    "keyboard-nav/** does not import Focus module",
  );

  assertCase(
    block,
    "dep.noSelection",
    !/from\s+["'][^"']*\/selection[^"']*["']/.test(all) &&
      !/\bSelectionRegistry\b/.test(all) &&
      !/\bSelectionProvider\b/.test(all) &&
      !/\bSelectionContext\b/.test(all) &&
      !/\buseSelection\b/.test(all),
    "keyboard-nav/** does not import Selection module",
  );

  assertCase(
    block,
    "dep.noHover",
    !/from\s+["'][^"']*\/hover[^"']*["']/.test(all) &&
      !/\bHoverRegistry\b/.test(all) &&
      !/\bHoverProvider\b/.test(all) &&
      !/\bHoverContext\b/.test(all) &&
      !/\buseHover\b/.test(all),
    "keyboard-nav/** does not import Hover module",
  );

  assertCase(
    block,
    "dep.noForeignRegistry",
    !/from\s+["'][^"']*\/(commands|visibility|features|selection|clipboard|shortcuts|menus|focus|hover)[^"']*["']/.test(
      all,
    ) &&
      !/\bCommandRegistry\b/.test(all) &&
      !/\bVisibilityRegistry\b/.test(all) &&
      !/\bFeatureRegistry\b/.test(all) &&
      !/\bSelectionRegistry\b/.test(all) &&
      !/\bFocusRegistry\b/.test(all) &&
      !/\bHoverRegistry\b/.test(all),
    "keyboard-nav/** does not import foreign Registry modules",
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
      !/\bHoverContext\b/.test(all),
    "keyboard-nav/** does not import foreign Provider/Context",
  );

  assertCase(
    block,
    "dep.noScientific",
    !/lib\/scientific/.test(all) && !/\bsrc\/lib\/graph\b/.test(all),
    "keyboard-nav/** does not import scientific / graph engines",
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
/* PASS 13 — authorities                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "authorities";
  const arch = existsSync(join(repoRoot, ARCH)) ? read(ARCH) : "";
  const doc = existsSync(join(repoRoot, DOC_8_5)) ? read(DOC_8_5) : "";

  assertCase(
    block,
    "auth.matrixKeyboard",
    /Keyboard navigation/i.test(arch) &&
      (/next/i.test(arch) || /Keyboard Navigation/i.test(arch)),
    "Architecture Authorities Matrix lists Keyboard navigation",
  );

  assertCase(
    block,
    "auth.noCrossMutation",
    /Ningún registry puede modificar/i.test(arch) ||
      /no registry can modify/i.test(arch) ||
      /cross-registry mutation/i.test(arch),
    "Architecture documents no cross-registry mutation",
  );

  assertCase(
    block,
    "auth.docSoleAuthority",
    /única autoridad|sole.*authority|KeyboardNavigationRegistry.*authority/i.test(
      doc,
    ),
    "UX-8.5.md documents KeyboardNavigationRegistry as sole authority",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 14 — noProductMount                                                   */
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
    !/\bKeyboardNavigationProvider\b/.test(page) &&
      !/ui\/keyboard-nav/.test(page),
    "page.tsx does not mount KeyboardNavigationProvider",
  );

  assertCase(
    block,
    "mount.noAppShell",
    !/\bKeyboardNavigationProvider\b/.test(appShellRaw) &&
      !/ui\/keyboard-nav/.test(appShellRaw),
    "AppShell does not mount KeyboardNavigationProvider",
  );

  assertCase(
    block,
    "mount.noPublicBarrel",
    !/from\s+["']\.\/keyboard-nav["']/.test(uiIndex) &&
      !/from\s+["']\.\/keyboard-nav\//.test(uiIndex),
    "@/ui barrel does not export keyboard-nav",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 15 — windowRegistryIntact                                             */
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
    "window.noKeyboardNavImport",
    !/ui\/keyboard-nav/.test(wr) && !/\bkeyboardNavigationRegistry\b/.test(wr),
    "WindowRegistry does not import keyboard-nav module",
  );

  const knAll = walkFiles(join(repoRoot, KN_DIR))
    .map((f) => readFileSync(f, "utf8"))
    .join("\n");
  assertCase(
    block,
    "kn.noWindowRegistryImport",
    !/WindowRegistry/.test(stripComments(knAll)),
    "keyboard-nav/** does not reference WindowRegistry",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 16 — roadmapUpdated                                                   */
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
    "roadmap.ux85Complete",
    /UX-8\.5\s*=\s*COMPLETE/i.test(roadmap) ||
      (/UX-8\.5/.test(roadmap) &&
        /Keyboard Navigation/.test(roadmap) &&
        /COMPLETE/.test(roadmap)),
    "Roadmap marks UX-8.5 COMPLETE",
  );

  assertCase(
    block,
    "roadmap.tableComplete",
    /UX-8\.5\s*\|\s*Keyboard Navigation[^|]*\|\s*COMPLETE/i.test(roadmap),
    "Roadmap phase table marks UX-8.5 COMPLETE",
  );

  assertCase(
    block,
    "roadmap.historicalGate",
    /validate:ux-8\.5/.test(roadmap) && /UX-8\.5\.md/.test(roadmap),
    "Roadmap lists historical gate validate:ux-8.5",
  );

  assertCase(
    block,
    "roadmap.next86",
    /UX-8\.6/.test(roadmap) && /Clipboard/i.test(roadmap),
    "Roadmap lists UX-8.6 Clipboard Foundation",
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
  "stateContract",
  "directionEnum",
  "registryApiFreeze",
  "apiStabilityFreeze",
  "navigationSemanticsFreeze",
  "directionNormalizationFreeze",
  "statelessNavigationFreeze",
  "domFreeze",
  "barrelExport",
  "dependencyRule",
  "authorities",
  "noProductMount",
  "windowRegistryIntact",
  "roadmapUpdated",
] as const;

console.log("UX-8.5 Keyboard Navigation Foundation — validation\n");

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
