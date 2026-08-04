/**
 * UX-7.4 — Command Description Bridge gate.
 *
 * Blocks:
 * documentationExists · moduleExists · descriptionTypes · factoryContract
 * fromDefinition · resolveContract · barrelExport · priorFreezeIntact
 * freezeFences · unidirectionalDep
 *
 * Architectural principles:
 * - Bridge Freeze (read-only CommandId-facing projection).
 * - Identity Freeze = brand cast only.
 * - Projection Freeze = deterministic copy of 5 fields.
 * - Title / Description / Shortcut / Category Freezes.
 * - Resolve = Query Only (CommandId → Identity Freeze → get → projection → return).
 * - No React · Window · DOM · CSS · App mount · @/ui public expansion.
 * - UX-7.1 + UX-7.2 + UX-7.3 Architecture Freeze intact.
 * - No import from tooltips/ · shortcut-hints/ · shortcuts/.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "documentationExists"
  | "moduleExists"
  | "descriptionTypes"
  | "factoryContract"
  | "fromDefinition"
  | "resolveContract"
  | "barrelExport"
  | "priorFreezeIntact"
  | "freezeFences"
  | "unidirectionalDep";

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

const DESC_DIR = "src/ui/command-descriptions";
const DESC_TYPES = `${DESC_DIR}/CommandDescriptionTypes.ts`;
const DESC_CONTENT = `${DESC_DIR}/CommandDescription.ts`;
const DESC_FACTORY = `${DESC_DIR}/createCommandDescription.ts`;
const DESC_RESOLVE = `${DESC_DIR}/resolveCommandDescription.ts`;
const DESC_INDEX = `${DESC_DIR}/index.ts`;

const VISIBILITY_DIR = "src/ui/visibility";
const VISIBILITY_DEFINITION = `${VISIBILITY_DIR}/VisibilityDefinition.ts`;
const VISIBILITY_REGISTRY = `${VISIBILITY_DIR}/VisibilityRegistry.ts`;
const VISIBILITY_INDEX = `${VISIBILITY_DIR}/index.ts`;

const TOOLTIPS_DIR = "src/ui/tooltips";
const TOOLTIP_CONTENT = `${TOOLTIPS_DIR}/TooltipContent.ts`;
const TOOLTIP_INDEX = `${TOOLTIPS_DIR}/index.ts`;

const HINTS_DIR = "src/ui/shortcut-hints";
const HINT_CONTENT = `${HINTS_DIR}/ShortcutHint.ts`;
const HINT_INDEX = `${HINTS_DIR}/index.ts`;

const SHORTCUTS_DIR = "src/ui/shortcuts";
const COMMANDS_DIR = "src/ui/commands";

const UI_INDEX = "src/ui/index.ts";
const ROADMAP_7 = "docs/UX/UX-7.0-roadmap.md";
const DOC_7_1 = "docs/UX/UX-7.1.md";
const DOC_7_2 = "docs/UX/UX-7.2.md";
const DOC_7_3 = "docs/UX/UX-7.3.md";
const DOC_7_4 = "docs/UX/UX-7.4.md";
const VALIDATE_7_1 = "scripts/validate-ux-7.1.ts";
const VALIDATE_7_2 = "scripts/validate-ux-7.2.ts";
const VALIDATE_7_3 = "scripts/validate-ux-7.3.ts";
const PACKAGE_JSON = "package.json";

const MODULE_FILES = [
  DESC_TYPES,
  DESC_CONTENT,
  DESC_FACTORY,
  DESC_RESOLVE,
  DESC_INDEX,
] as const;

const FORBIDDEN_EXTRA_METHODS = [
  /\bfindByCategory\s*\(/,
  /\bfindByShortcut\s*\(/,
  /\bfindBy\w*\s*\(/,
  /\bcontains\s*\(/,
  /\bsize\s*\(/,
  /\bhas\s*\(/,
  /\bremove\s*\(/,
  /\breplace\s*\(/,
];

/* -------------------------------------------------------------------------- */
/* PASS 01 — documentationExists                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "documentationExists";

  assertCase(
    block,
    "exists.roadmap",
    existsSync(join(repoRoot, ROADMAP_7)),
    `${ROADMAP_7} exists`,
  );

  assertCase(
    block,
    "exists.doc",
    existsSync(join(repoRoot, DOC_7_4)),
    `${DOC_7_4} exists`,
  );

  const pkg = existsSync(join(repoRoot, PACKAGE_JSON))
    ? read(PACKAGE_JSON)
    : "";
  assertCase(
    block,
    "exists.npmScript",
    /"validate:ux-7\.4"\s*:/.test(pkg),
    "package.json has validate:ux-7.4",
  );

  const doc = existsSync(join(repoRoot, DOC_7_4)) ? read(DOC_7_4) : "";
  assertCase(
    block,
    "doc.bridgeFreeze",
    /Bridge Freeze/i.test(doc) && /proyección read-only/i.test(doc),
    "UX-7.4.md documents Bridge Freeze",
  );

  assertCase(
    block,
    "doc.identityFreeze",
    /Identity Freeze/i.test(doc) &&
      /visibilityIdFromCommandId/.test(doc) &&
      /cast explícito/i.test(doc) &&
      /No valida/i.test(doc),
    "UX-7.4.md documents Identity Freeze",
  );

  assertCase(
    block,
    "doc.categoryFreeze",
    /Category Freeze/i.test(doc) &&
      /exact copy/i.test(doc) &&
      /traducir/i.test(doc) &&
      /jerarquizar/i.test(doc),
    "UX-7.4.md documents Category Freeze",
  );

  assertCase(
    block,
    "doc.projectionFreeze",
    /Projection Freeze/i.test(doc) &&
      /commandDescriptionFromDefinition/.test(doc) &&
      /copia exactamente/i.test(doc),
    "UX-7.4.md documents Projection Freeze",
  );

  assertCase(
    block,
    "doc.resolveQueryOnly",
    /Resolve = Query Only/i.test(doc) &&
      /visibilityIdFromCommandId\(\)/.test(doc) &&
      /registry\.get\(id\)/.test(doc),
    "UX-7.4.md documents Resolve = Query Only",
  );

  assertCase(
    block,
    "doc.noResponsabilidades",
    /No responsabilidades/i.test(doc) && /No alias map/i.test(doc),
    "UX-7.4.md documents No responsabilidades",
  );

  assertCase(
    block,
    "doc.noReact",
    /NO React/i.test(doc) && /No React/i.test(doc),
    "UX-7.4.md documents No React",
  );

  const roadmap = existsSync(join(repoRoot, ROADMAP_7))
    ? read(ROADMAP_7)
    : "";
  assertCase(
    block,
    "roadmap.ux74Complete",
    /UX-7\.4\s*=\s*COMPLETE/.test(roadmap),
    "UX-7.0-roadmap.md marks UX-7.4 COMPLETE",
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
    existsSync(join(repoRoot, DESC_DIR)),
    "src/ui/command-descriptions/ exists",
  );

  for (const rel of MODULE_FILES) {
    assertCase(
      block,
      `exists.${rel.split("/").pop()}`,
      existsSync(join(repoRoot, rel)),
      `${rel} exists`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — descriptionTypes                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "descriptionTypes";

  const typesSrc = existsSync(join(repoRoot, DESC_TYPES))
    ? stripComments(read(DESC_TYPES))
    : "";
  const contentSrc = existsSync(join(repoRoot, DESC_CONTENT))
    ? stripComments(read(DESC_CONTENT))
    : "";

  assertCase(
    block,
    "types.reexportsCommandId",
    /export\s+type\s+\{\s*CommandId\s*\}/.test(typesSrc) &&
      /commands\/CommandTypes/.test(typesSrc),
    "CommandDescriptionTypes reexports CommandId from CommandTypes",
  );

  assertCase(
    block,
    "types.identityFreezeHelper",
    /export\s+function\s+visibilityIdFromCommandId\s*\(/.test(typesSrc),
    "visibilityIdFromCommandId exported",
  );

  const identityBody = extractFunctionBody(
    typesSrc,
    "visibilityIdFromCommandId",
  );
  assertCase(
    block,
    "types.identityFreezeBrandCastOnly",
    /asVisibilityId\s*\(\s*String\s*\(\s*commandId\s*\)\s*\)/.test(
      identityBody,
    ) &&
      !/\.trim\s*\(/.test(identityBody) &&
      !/\.register\s*\(/.test(identityBody) &&
      !/\.get\s*\(/.test(identityBody) &&
      !/\bthrow\b/.test(identityBody) &&
      !/\bMap\b/.test(identityBody) &&
      !/\balias/i.test(identityBody),
    "visibilityIdFromCommandId is brand cast only (Identity Freeze)",
  );

  const body = extractReadonlyTypeBody(contentSrc, "CommandDescription");
  assertCase(
    block,
    "description.fields",
    /readonly\s+id\s*:\s*CommandId/.test(body) &&
      /readonly\s+title\s*:\s*string/.test(body) &&
      /readonly\s+description\s*:\s*string/.test(body) &&
      /readonly\s+shortcut\s*:\s*string/.test(body) &&
      /readonly\s+category\s*:\s*string/.test(body),
    "CommandDescription = { id, title, description, shortcut, category }",
  );

  assertCase(
    block,
    "description.noForbiddenFields",
    !/\bicon\b/.test(body) &&
      !/\bpriority\b/.test(body) &&
      !/\bplacement\b/.test(body) &&
      !/\bkeywords\b/.test(body) &&
      !/\bhandler\b/.test(body) &&
      !/\bcallback\b/.test(body) &&
      !/\bReactNode\b/.test(body) &&
      !/\bi18n\b/.test(body) &&
      !/\bmarkdown\b/.test(body) &&
      !/\bhtml\b/i.test(body) &&
      !/\bonClick\b/.test(body),
    "CommandDescription has no forbidden fields",
  );

  assertCase(
    block,
    "description.initExists",
    /export\s+type\s+CommandDescriptionInit\s*=/.test(contentSrc),
    "CommandDescriptionInit exported",
  );

  assertCase(
    block,
    "description.noReact",
    !/\bfrom\s+["']react["']/.test(contentSrc) &&
      !/\bfrom\s+["']react-dom["']/.test(contentSrc),
    "CommandDescription is React-free",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — factoryContract                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "factoryContract";

  const src = existsSync(join(repoRoot, DESC_FACTORY))
    ? stripComments(read(DESC_FACTORY))
    : "";

  assertCase(
    block,
    "factory.exports",
    /export\s+function\s+createCommandDescription\s*\(/.test(src),
    "createCommandDescription exported",
  );

  assertCase(
    block,
    "factory.freeze",
    /Object\.freeze/.test(src),
    "createCommandDescription uses Object.freeze",
  );

  assertCase(
    block,
    "factory.trim",
    /\.trim\s*\(/.test(src),
    "createCommandDescription normalizes with trim()",
  );

  assertCase(
    block,
    "factory.validate",
    /throw\s+new\s+Error/.test(src) &&
      /id must be a non-empty string/.test(src) &&
      /title must be a non-empty string/.test(src) &&
      /category must be a non-empty string/.test(src),
    "Factory validates non-empty id/title/category",
  );

  assertCase(
    block,
    "factory.usesCommandId",
    /asCommandId/.test(src) && /commands\/CommandTypes/.test(src),
    "Factory brands id with asCommandId from CommandTypes",
  );

  assertCase(
    block,
    "factory.noReact",
    !/\bfrom\s+["']react["']/.test(src) &&
      !/\bfrom\s+["']react-dom["']/.test(src),
    "Factory is React-free",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — fromDefinition (Projection · Identity · Category Freezes)        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "fromDefinition";

  const src = existsSync(join(repoRoot, DESC_RESOLVE))
    ? stripComments(read(DESC_RESOLVE))
    : "";
  const body = extractFunctionBody(src, "commandDescriptionFromDefinition");

  assertCase(
    block,
    "projection.exports",
    /export\s+function\s+commandDescriptionFromDefinition\s*\(/.test(src),
    "commandDescriptionFromDefinition exported",
  );

  assertCase(
    block,
    "projection.copiesFields",
    /definition\.id/.test(body) &&
      /definition\.title/.test(body) &&
      /definition\.description/.test(body) &&
      /definition\.shortcut/.test(body) &&
      /definition\.category/.test(body),
    "Projection copies id/title/description/shortcut/category",
  );

  assertCase(
    block,
    "projection.identityBrandCast",
    /asCommandId\s*\(\s*String\s*\(\s*definition\.id\s*\)\s*\)/.test(body),
    "Projection applies Identity Freeze brand cast on id",
  );

  assertCase(
    block,
    "projection.freeze",
    /Object\.freeze/.test(body),
    "Projection returns Object.freeze",
  );

  assertCase(
    block,
    "projection.noTransform",
    !/\.toLowerCase\s*\(/.test(body) &&
      !/\.toUpperCase\s*\(/.test(body) &&
      !/\.replace\s*\(/.test(body) &&
      !/\.slice\s*\(/.test(body) &&
      !/\.substring\s*\(/.test(body) &&
      !/\bi18n\b/.test(body) &&
      !/\bmarkdown\b/.test(body) &&
      !/\bhtml\b/i.test(body) &&
      !/\bformat/.test(body) &&
      !/\.trim\s*\(/.test(body) &&
      !/\balias/i.test(body) &&
      !/\bplatform/i.test(body) &&
      !/\bglyph/i.test(body) &&
      !/\btraduc/i.test(body) &&
      !/\bjerarqu/i.test(body),
    "Projection has no transform/format/i18n/markdown/trim/category taxonomy",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — resolveContract (Query Only)                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "resolveContract";

  const src = existsSync(join(repoRoot, DESC_RESOLVE))
    ? stripComments(read(DESC_RESOLVE))
    : "";
  const body = extractFunctionBody(src, "resolveCommandDescription");

  assertCase(
    block,
    "resolve.exports",
    /export\s+function\s+resolveCommandDescription\s*\(/.test(src),
    "resolveCommandDescription exported",
  );

  assertCase(
    block,
    "resolve.commandIdEntry",
    /commandId\s*:\s*CommandId/.test(src),
    "Resolve entry is CommandId",
  );

  assertCase(
    block,
    "resolve.usesIdentityFreeze",
    /visibilityIdFromCommandId\s*\(/.test(body),
    "Resolve uses visibilityIdFromCommandId",
  );

  assertCase(
    block,
    "resolve.usesGet",
    /registry\.get\s*\(/.test(body),
    "Resolve uses registry.get(",
  );

  assertCase(
    block,
    "resolve.usesProjection",
    /commandDescriptionFromDefinition\s*\(/.test(body),
    "Resolve delegates to commandDescriptionFromDefinition",
  );

  assertCase(
    block,
    "resolve.undefinedMiss",
    /return\s+undefined/.test(body),
    "Resolve returns undefined on miss",
  );

  assertCase(
    block,
    "resolve.queryOnly",
    !/\.register\s*\(/.test(body) &&
      !/\.clear\s*\(/.test(body) &&
      !/\bcache\b/i.test(body) &&
      !/\bmemoiz/i.test(body) &&
      !/\bWeakMap\b/.test(body) &&
      !/\bMap\s*\(/.test(body) &&
      !/\bfallback\b/i.test(body) &&
      !/\blazy\b/i.test(body) &&
      !/\bcommandRegistry\b/i.test(body),
    "Resolve is Query Only (no register/cache/fallback/lazy/CommandRegistry)",
  );

  assertCase(
    block,
    "resolve.noFenceScannedNames",
    !/\bvisibilityRegistry\b/.test(src) &&
      !/\bVisibilityRegistryApi\b/.test(src) &&
      !/\bcreateVisibilityDefinition\b/.test(src) &&
      !/\bcreateVisibilityRegistry\b/.test(src),
    "Resolve does not name UX-7.1 fence-scanned identifiers",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — barrelExport                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "barrelExport";

  const src = existsSync(join(repoRoot, DESC_INDEX))
    ? stripComments(read(DESC_INDEX))
    : "";

  assertCase(
    block,
    "barrel.types",
    /from\s+["']\.\/CommandDescriptionTypes["']/.test(src) &&
      /CommandId/.test(src) &&
      /visibilityIdFromCommandId/.test(src),
    "Barrel reexports CommandDescriptionTypes + Identity Freeze",
  );

  assertCase(
    block,
    "barrel.model",
    /from\s+["']\.\/CommandDescription["']/.test(src) &&
      /CommandDescription/.test(src) &&
      /CommandDescriptionInit/.test(src),
    "Barrel reexports CommandDescription",
  );

  assertCase(
    block,
    "barrel.factory",
    /from\s+["']\.\/createCommandDescription["']/.test(src) &&
      /createCommandDescription/.test(src),
    "Barrel reexports createCommandDescription",
  );

  assertCase(
    block,
    "barrel.resolve",
    /from\s+["']\.\/resolveCommandDescription["']/.test(src) &&
      /commandDescriptionFromDefinition/.test(src) &&
      /resolveCommandDescription/.test(src),
    "Barrel reexports projection + resolve",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — priorFreezeIntact                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "priorFreezeIntact";

  assertCase(
    block,
    "exists.validate71",
    existsSync(join(repoRoot, VALIDATE_7_1)),
    `${VALIDATE_7_1} exists`,
  );

  assertCase(
    block,
    "exists.validate72",
    existsSync(join(repoRoot, VALIDATE_7_2)),
    `${VALIDATE_7_2} exists`,
  );

  assertCase(
    block,
    "exists.validate73",
    existsSync(join(repoRoot, VALIDATE_7_3)),
    `${VALIDATE_7_3} exists`,
  );

  assertCase(
    block,
    "exists.doc71",
    existsSync(join(repoRoot, DOC_7_1)),
    `${DOC_7_1} exists`,
  );

  assertCase(
    block,
    "exists.doc72",
    existsSync(join(repoRoot, DOC_7_2)),
    `${DOC_7_2} exists`,
  );

  assertCase(
    block,
    "exists.doc73",
    existsSync(join(repoRoot, DOC_7_3)),
    `${DOC_7_3} exists`,
  );

  const registrySrc = existsSync(join(repoRoot, VISIBILITY_REGISTRY))
    ? stripComments(read(VISIBILITY_REGISTRY))
    : "";
  const apiBody = extractInterfaceBody(registrySrc, "VisibilityRegistryApi");

  let hasExtraMethods = false;
  for (const re of FORBIDDEN_EXTRA_METHODS) {
    if (re.test(apiBody)) {
      hasExtraMethods = true;
      break;
    }
  }
  const methodNames = [...apiBody.matchAll(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g)]
    .map((m) => m[1])
    .filter((n) => n !== undefined);
  const allowed = new Set(["register", "get", "getAll", "clear"]);
  const unexpected = methodNames.filter((n) => !allowed.has(n));
  if (unexpected.length > 0) hasExtraMethods = true;

  assertCase(
    block,
    "registry.freezeMethods",
    !hasExtraMethods &&
      methodNames.includes("register") &&
      methodNames.includes("get") &&
      methodNames.includes("getAll") &&
      methodNames.includes("clear"),
    "VisibilityRegistryApi still has only register/get/getAll/clear",
  );

  const defSrc = existsSync(join(repoRoot, VISIBILITY_DEFINITION))
    ? stripComments(read(VISIBILITY_DEFINITION))
    : "";
  const defBody = extractReadonlyTypeBody(defSrc, "VisibilityDefinition");
  assertCase(
    block,
    "definition.fiveFields",
    /readonly\s+id\s*:\s*VisibilityId/.test(defBody) &&
      /readonly\s+title\s*:\s*string/.test(defBody) &&
      /readonly\s+description\s*:\s*string/.test(defBody) &&
      /readonly\s+shortcut\s*:\s*string/.test(defBody) &&
      /readonly\s+category\s*:\s*string/.test(defBody),
    "VisibilityDefinition still has 5 fields",
  );

  const tooltipSrc = existsSync(join(repoRoot, TOOLTIP_CONTENT))
    ? stripComments(read(TOOLTIP_CONTENT))
    : "";
  const tooltipBody = extractReadonlyTypeBody(tooltipSrc, "TooltipContent");
  assertCase(
    block,
    "tooltip.fourFields",
    /readonly\s+id\s*:\s*VisibilityId/.test(tooltipBody) &&
      /readonly\s+title\s*:\s*string/.test(tooltipBody) &&
      /readonly\s+description\s*:\s*string/.test(tooltipBody) &&
      /readonly\s+shortcut\s*:\s*string/.test(tooltipBody) &&
      !/\bcategory\b/.test(tooltipBody),
    "TooltipContent still has 4 fields",
  );

  const hintSrc = existsSync(join(repoRoot, HINT_CONTENT))
    ? stripComments(read(HINT_CONTENT))
    : "";
  const hintBody = extractReadonlyTypeBody(hintSrc, "ShortcutHint");
  assertCase(
    block,
    "hint.threeFields",
    /readonly\s+id\s*:\s*VisibilityId/.test(hintBody) &&
      /readonly\s+title\s*:\s*string/.test(hintBody) &&
      /readonly\s+shortcut\s*:\s*string/.test(hintBody) &&
      !/\bdescription\b/.test(hintBody) &&
      !/\bcategory\b/.test(hintBody),
    "ShortcutHint still has 3 fields",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — freezeFences                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "freezeFences";

  const descFiles = walkFiles(join(repoRoot, DESC_DIR));
  let hasReact = false;
  let hasReactDom = false;
  let hasWindow = false;
  let hasDocument = false;
  let hasCss = false;
  let hasDomApis = false;
  let hasUiComponentImport = false;
  let hasAppImport = false;
  let hasProvider = false;
  let hasHook = false;
  let hasShortcutsImport = false;
  let hasTooltipsImport = false;
  let hasHintsImport = false;
  let hasPipelineImport = false;
  let hasCommandBridgeImport = false;
  let hasFenceScannedNames = false;

  for (const full of descFiles) {
    const raw = readFileSync(full, "utf8");
    const src = stripComments(raw);

    if (/\bfrom\s+["']react["']/.test(src) || /"use client"/.test(raw)) {
      hasReact = true;
    }
    if (
      /from\s+["']react-dom["']/.test(src) ||
      /require\s*\(\s*["']react-dom["']/.test(src)
    ) {
      hasReactDom = true;
    }
    if (/\bwindow\b/.test(src)) hasWindow = true;
    if (/\bdocument\b/.test(src)) hasDocument = true;
    if (
      /\.css["']/.test(src) ||
      /from\s+["'][^"']+\.css["']/.test(src) ||
      /\bstyled\b/.test(src) ||
      /\bclassName\b/.test(src)
    ) {
      hasCss = true;
    }
    if (
      /\bHTMLElement\b/.test(src) ||
      /\bquerySelector\b/.test(src) ||
      /\baddEventListener\b/.test(src)
    ) {
      hasDomApis = true;
    }
    if (
      /from\s+["']@\/components\//.test(src) ||
      /from\s+["']\.\.\/.*components\//.test(src)
    ) {
      hasUiComponentImport = true;
    }
    if (/from\s+["']@\/app\//.test(src) || /from\s+["']\.\.\/.*app\//.test(src)) {
      hasAppImport = true;
    }
    if (/\bProvider\b/.test(src) || /\bcreateContext\b/.test(src)) {
      hasProvider = true;
    }
    if (/\buse[A-Z]\w*\s*\(/.test(src)) {
      hasHook = true;
    }
    if (
      /from\s+["']\.\.\/shortcuts\//.test(src) ||
      /from\s+["']@\/ui\/shortcuts\b/.test(src)
    ) {
      hasShortcutsImport = true;
    }
    if (
      /from\s+["']\.\.\/tooltips\//.test(src) ||
      /from\s+["']@\/ui\/tooltips\b/.test(src) ||
      /TooltipContent/.test(src) ||
      /createTooltipContent/.test(src) ||
      /resolveTooltipContent/.test(src)
    ) {
      hasTooltipsImport = true;
    }
    if (
      /from\s+["']\.\.\/shortcut-hints\//.test(src) ||
      /from\s+["']@\/ui\/shortcut-hints\b/.test(src) ||
      /ShortcutHint/.test(src) ||
      /createShortcutHint/.test(src) ||
      /resolveShortcutHint/.test(src)
    ) {
      hasHintsImport = true;
    }
    if (
      /CommandExecution/.test(src) ||
      /CommandPipeline/.test(src) ||
      /Dispatcher/.test(src)
    ) {
      hasPipelineImport = true;
    }
    if (/CommandBridge/.test(src)) {
      hasCommandBridgeImport = true;
    }
    if (
      /\bvisibilityRegistry\b/.test(src) ||
      /\bVisibilityRegistryApi\b/.test(src) ||
      /\bcreateVisibilityDefinition\b/.test(src) ||
      /\bcreateVisibilityRegistry\b/.test(src) ||
      /from\s+["']@\/ui\/visibility\b/.test(src) ||
      /from\s+["'][^"']*\/ui\/visibility\b/.test(src)
    ) {
      hasFenceScannedNames = true;
    }
  }

  assertCase(block, "fence.noReact", !hasReact, "No react under command-descriptions/");
  assertCase(
    block,
    "fence.noReactDom",
    !hasReactDom,
    "No react-dom under command-descriptions/",
  );
  assertCase(
    block,
    "fence.noWindow",
    !hasWindow,
    "No window under command-descriptions/",
  );
  assertCase(
    block,
    "fence.noDocument",
    !hasDocument,
    "No document under command-descriptions/",
  );
  assertCase(
    block,
    "fence.noCss",
    !hasCss,
    "No CSS/style under command-descriptions/",
  );
  assertCase(
    block,
    "fence.noDom",
    !hasDomApis,
    "No DOM APIs under command-descriptions/",
  );
  assertCase(
    block,
    "fence.noUiComponents",
    !hasUiComponentImport,
    "No UI product component imports under command-descriptions/",
  );
  assertCase(
    block,
    "fence.noAppImport",
    !hasAppImport,
    "No App imports under command-descriptions/",
  );
  assertCase(
    block,
    "fence.noProvider",
    !hasProvider,
    "No Provider/Context under command-descriptions/",
  );
  assertCase(
    block,
    "fence.noHooks",
    !hasHook,
    "No hooks under command-descriptions/",
  );
  assertCase(
    block,
    "fence.noShortcutsImport",
    !hasShortcutsImport,
    "No import from src/ui/shortcuts/ under command-descriptions/",
  );
  assertCase(
    block,
    "fence.noTooltipsImport",
    !hasTooltipsImport,
    "No import from tooltips under command-descriptions/",
  );
  assertCase(
    block,
    "fence.noHintsImport",
    !hasHintsImport,
    "No import from shortcut-hints under command-descriptions/",
  );
  assertCase(
    block,
    "fence.noPipeline",
    !hasPipelineImport,
    "No Pipeline/Dispatcher under command-descriptions/",
  );
  assertCase(
    block,
    "fence.noCommandBridge",
    !hasCommandBridgeImport,
    "No CommandBridge under command-descriptions/",
  );
  assertCase(
    block,
    "fence.noUx71ScannedNames",
    !hasFenceScannedNames,
    "No UX-7.1 fence-scanned visibility identifiers under command-descriptions/",
  );

  const srcRoot = join(repoRoot, "src");
  const allSrc = walkFiles(srcRoot);
  let productWire = false;
  for (const full of allSrc) {
    const rel = relative(repoRoot, full).replace(/\\/g, "/");
    if (rel.startsWith("src/ui/command-descriptions/")) continue;
    const src = stripComments(readFileSync(full, "utf8"));
    if (
      /createCommandDescription/.test(src) ||
      /commandDescriptionFromDefinition/.test(src) ||
      /resolveCommandDescription/.test(src) ||
      /visibilityIdFromCommandId/.test(src) ||
      /from\s+["']@\/ui\/command-descriptions\b/.test(src) ||
      /from\s+["'][^"']*\/ui\/command-descriptions\b/.test(src)
    ) {
      productWire = true;
      break;
    }
  }

  assertCase(
    block,
    "fence.noProductWire",
    !productWire,
    "No command-descriptions import/wire outside src/ui/command-descriptions/",
  );

  const uiIndex = existsSync(join(repoRoot, UI_INDEX))
    ? stripComments(read(UI_INDEX))
    : "";
  assertCase(
    block,
    "fence.publicBarrelIntact",
    !/\bcommand-descriptions\b/.test(uiIndex) &&
      !/\bshortcut-hints\b/.test(uiIndex) &&
      !/\btooltips\b/.test(uiIndex) &&
      !/\bvisibility\b/.test(uiIndex) &&
      !/CommandDescription/.test(uiIndex) &&
      !/createCommandDescription/.test(uiIndex) &&
      !/resolveCommandDescription/.test(uiIndex) &&
      !/ShortcutHint/.test(uiIndex) &&
      !/TooltipContent/.test(uiIndex) &&
      !/VisibilityRegistry/.test(uiIndex) &&
      !/visibilityRegistry/.test(uiIndex),
    "src/ui/index.ts does not export command-descriptions, shortcut-hints, tooltips, or visibility",
  );

  assertCase(
    block,
    "fence.shortcutsExecutionIntact",
    existsSync(join(repoRoot, SHORTCUTS_DIR)),
    "src/ui/shortcuts/ (execution) still exists untouched",
  );

  assertCase(
    block,
    "fence.commandsIntact",
    existsSync(join(repoRoot, COMMANDS_DIR)),
    "src/ui/commands/ still exists untouched",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — unidirectionalDep                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "unidirectionalDep";

  const descFiles = walkFiles(join(repoRoot, DESC_DIR));
  let descImportVisibility = false;
  let descImportCommandTypes = false;
  let descImportForbiddenCommands = false;

  for (const full of descFiles) {
    const src = stripComments(readFileSync(full, "utf8"));
    if (
      /from\s+["']\.\.\/visibility\//.test(src) ||
      /from\s+["']@\/ui\/visibility\b/.test(src)
    ) {
      descImportVisibility = true;
    }
    if (/from\s+["']\.\.\/commands\/CommandTypes["']/.test(src)) {
      descImportCommandTypes = true;
    }
    if (
      /from\s+["']\.\.\/commands\/(?!CommandTypes)/.test(src) ||
      /CommandBridge/.test(src) ||
      /CommandPipeline/.test(src) ||
      /CommandExecution/.test(src) ||
      /CommandProvider/.test(src) ||
      /CommandDispatcher/.test(src)
    ) {
      descImportForbiddenCommands = true;
    }
  }

  assertCase(
    block,
    "dep.descToVisibility",
    descImportVisibility,
    "command-descriptions imports visibility (unidirectional allowed)",
  );

  assertCase(
    block,
    "dep.descToCommandTypes",
    descImportCommandTypes,
    "command-descriptions imports CommandTypes only (allowed)",
  );

  assertCase(
    block,
    "dep.descNoForbiddenCommands",
    !descImportForbiddenCommands,
    "command-descriptions does not import Pipeline/Dispatcher/Provider/Bridge",
  );

  const visibilityFiles = walkFiles(join(repoRoot, VISIBILITY_DIR));
  let visibilityImportsDesc = false;
  for (const full of visibilityFiles) {
    const src = stripComments(readFileSync(full, "utf8"));
    if (
      /from\s+["']\.\.\/command-descriptions\//.test(src) ||
      /from\s+["']@\/ui\/command-descriptions\b/.test(src) ||
      /command-descriptions\//.test(src) ||
      /CommandDescription/.test(src) ||
      /createCommandDescription/.test(src) ||
      /resolveCommandDescription/.test(src)
    ) {
      visibilityImportsDesc = true;
      break;
    }
  }

  assertCase(
    block,
    "dep.visibilityNoDesc",
    !visibilityImportsDesc,
    "visibility does not import command-descriptions",
  );

  const tooltipFiles = walkFiles(join(repoRoot, TOOLTIPS_DIR));
  let tooltipsImportDesc = false;
  for (const full of tooltipFiles) {
    const src = stripComments(readFileSync(full, "utf8"));
    if (
      /command-descriptions\//.test(src) ||
      /CommandDescription/.test(src) ||
      /createCommandDescription/.test(src) ||
      /resolveCommandDescription/.test(src)
    ) {
      tooltipsImportDesc = true;
      break;
    }
  }

  assertCase(
    block,
    "dep.tooltipsNoDesc",
    !tooltipsImportDesc,
    "tooltips does not import command-descriptions",
  );

  const hintFiles = walkFiles(join(repoRoot, HINTS_DIR));
  let hintsImportDesc = false;
  for (const full of hintFiles) {
    const src = stripComments(readFileSync(full, "utf8"));
    if (
      /command-descriptions\//.test(src) ||
      /CommandDescription/.test(src) ||
      /createCommandDescription/.test(src) ||
      /resolveCommandDescription/.test(src)
    ) {
      hintsImportDesc = true;
      break;
    }
  }

  assertCase(
    block,
    "dep.hintsNoDesc",
    !hintsImportDesc,
    "shortcut-hints does not import command-descriptions",
  );

  const visIndex = existsSync(join(repoRoot, VISIBILITY_INDEX))
    ? stripComments(read(VISIBILITY_INDEX))
    : "";
  assertCase(
    block,
    "dep.visibilityBarrelClean",
    !/command.?description/i.test(visIndex),
    "visibility barrel does not mention command-descriptions",
  );

  const tipIndex = existsSync(join(repoRoot, TOOLTIP_INDEX))
    ? stripComments(read(TOOLTIP_INDEX))
    : "";
  assertCase(
    block,
    "dep.tooltipsBarrelClean",
    !/command.?description/i.test(tipIndex),
    "tooltips barrel does not mention command-descriptions",
  );

  const hintIndex = existsSync(join(repoRoot, HINT_INDEX))
    ? stripComments(read(HINT_INDEX))
    : "";
  assertCase(
    block,
    "dep.hintsBarrelClean",
    !/command.?description/i.test(hintIndex),
    "shortcut-hints barrel does not mention command-descriptions",
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const BLOCKS: { id: BlockId; ca: string }[] = [
  { id: "documentationExists", ca: "CA-UX-7.4.1" },
  { id: "moduleExists", ca: "CA-UX-7.4.2" },
  { id: "descriptionTypes", ca: "CA-UX-7.4.3" },
  { id: "factoryContract", ca: "CA-UX-7.4.4" },
  { id: "fromDefinition", ca: "CA-UX-7.4.5" },
  { id: "resolveContract", ca: "CA-UX-7.4.6" },
  { id: "barrelExport", ca: "CA-UX-7.4.7" },
  { id: "priorFreezeIntact", ca: "CA-UX-7.4.8" },
  { id: "freezeFences", ca: "CA-UX-7.4.9" },
  { id: "unidirectionalDep", ca: "CA-UX-7.4.10" },
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
