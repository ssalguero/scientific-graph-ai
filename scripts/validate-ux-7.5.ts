/**
 * UX-7.5 — Context Help Foundation gate.
 *
 * Blocks:
 * documentationExists · moduleExists · helpTypes · factoryContract
 * fromDefinition · resolveContract · barrelExport · priorFreezeIntact
 * freezeFences · unidirectionalDep
 *
 * Architectural principles:
 * - Context Help Foundation (ContextHelp projection).
 * - Context Help Freeze = ayuda contextual only.
 * - VisibilityId Freeze = exact VisibilityId (no Identity Alignment).
 * - Projection Freeze = deterministic copy of 4 fields (ignores shortcut).
 * - Description Freeze = ownership in VisibilityDefinition.
 * - Category Freeze = exact copy.
 * - Resolve = Query Only (get → projection → return).
 * - No React · Window · DOM · CSS · App mount · @/ui public expansion.
 * - UX-7.1 + UX-7.2 + UX-7.3 + UX-7.4 Architecture Freeze intact.
 * - No import from siblings / shortcuts / commands.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "documentationExists"
  | "moduleExists"
  | "helpTypes"
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

const HELP_DIR = "src/ui/context-help";
const HELP_TYPES = `${HELP_DIR}/ContextHelpTypes.ts`;
const HELP_CONTENT = `${HELP_DIR}/ContextHelp.ts`;
const HELP_FACTORY = `${HELP_DIR}/createContextHelp.ts`;
const HELP_RESOLVE = `${HELP_DIR}/resolveContextHelp.ts`;
const HELP_INDEX = `${HELP_DIR}/index.ts`;

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

const DESC_DIR = "src/ui/command-descriptions";
const DESC_CONTENT = `${DESC_DIR}/CommandDescription.ts`;
const DESC_INDEX = `${DESC_DIR}/index.ts`;

const SHORTCUTS_DIR = "src/ui/shortcuts";
const COMMANDS_DIR = "src/ui/commands";

const UI_INDEX = "src/ui/index.ts";
const ROADMAP_7 = "docs/UX/UX-7.0-roadmap.md";
const DOC_7_1 = "docs/UX/UX-7.1.md";
const DOC_7_2 = "docs/UX/UX-7.2.md";
const DOC_7_3 = "docs/UX/UX-7.3.md";
const DOC_7_4 = "docs/UX/UX-7.4.md";
const DOC_7_5 = "docs/UX/UX-7.5.md";
const VALIDATE_7_1 = "scripts/validate-ux-7.1.ts";
const VALIDATE_7_2 = "scripts/validate-ux-7.2.ts";
const VALIDATE_7_3 = "scripts/validate-ux-7.3.ts";
const VALIDATE_7_4 = "scripts/validate-ux-7.4.ts";
const PACKAGE_JSON = "package.json";

const MODULE_FILES = [
  HELP_TYPES,
  HELP_CONTENT,
  HELP_FACTORY,
  HELP_RESOLVE,
  HELP_INDEX,
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
    existsSync(join(repoRoot, DOC_7_5)),
    `${DOC_7_5} exists`,
  );

  const pkg = existsSync(join(repoRoot, PACKAGE_JSON))
    ? read(PACKAGE_JSON)
    : "";
  assertCase(
    block,
    "exists.npmScript",
    /"validate:ux-7\.5"\s*:/.test(pkg),
    "package.json has validate:ux-7.5",
  );

  const doc = existsSync(join(repoRoot, DOC_7_5)) ? read(DOC_7_5) : "";
  assertCase(
    block,
    "doc.contextHelpFreeze",
    /Context Help Freeze/i.test(doc) &&
      /ayuda contextual/i.test(doc) &&
      /No representa ejecución/i.test(doc),
    "UX-7.5.md documents Context Help Freeze",
  );

  assertCase(
    block,
    "doc.visibilityIdFreeze",
    /VisibilityId Freeze/i.test(doc) &&
      /exactamente/i.test(doc) &&
      /No convierte/i.test(doc) &&
      /No rebrandea/i.test(doc) &&
      /Identity Alignment/i.test(doc),
    "UX-7.5.md documents VisibilityId Freeze",
  );

  assertCase(
    block,
    "doc.descriptionFreeze",
    /Description Freeze/i.test(doc) &&
      /pertenece exclusivamente a VisibilityDefinition/i.test(doc) &&
      /extenderla/i.test(doc) &&
      /combinarla/i.test(doc) &&
      /resumirla/i.test(doc) &&
      /enriquecerla/i.test(doc),
    "UX-7.5.md documents Description Freeze (ownership)",
  );

  assertCase(
    block,
    "doc.categoryFreeze",
    /Category Freeze/i.test(doc) &&
      /exact copy/i.test(doc) &&
      /traducir/i.test(doc) &&
      /jerarquizar/i.test(doc),
    "UX-7.5.md documents Category Freeze",
  );

  assertCase(
    block,
    "doc.projectionFreeze",
    /Projection Freeze/i.test(doc) &&
      /contextHelpFromDefinition/.test(doc) &&
      /copia exactamente/i.test(doc),
    "UX-7.5.md documents Projection Freeze",
  );

  assertCase(
    block,
    "doc.resolveQueryOnly",
    /Resolve = Query Only/i.test(doc) && /registry\.get\(id\)/.test(doc),
    "UX-7.5.md documents Resolve = Query Only",
  );

  assertCase(
    block,
    "doc.noResponsabilidades",
    /No responsabilidades/i.test(doc) &&
      /No Identity Freeze/i.test(doc) &&
      /No aggregator/i.test(doc),
    "UX-7.5.md documents No responsabilidades",
  );

  assertCase(
    block,
    "doc.noReact",
    /NO React/i.test(doc) && /No React/i.test(doc),
    "UX-7.5.md documents No React",
  );

  const roadmap = existsSync(join(repoRoot, ROADMAP_7))
    ? read(ROADMAP_7)
    : "";
  assertCase(
    block,
    "roadmap.ux75Complete",
    /UX-7\.5\s*=\s*COMPLETE/.test(roadmap),
    "UX-7.0-roadmap.md marks UX-7.5 COMPLETE",
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
    existsSync(join(repoRoot, HELP_DIR)),
    "src/ui/context-help/ exists",
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
/* PASS 03 — helpTypes                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "helpTypes";

  const typesSrc = existsSync(join(repoRoot, HELP_TYPES))
    ? stripComments(read(HELP_TYPES))
    : "";
  const contentSrc = existsSync(join(repoRoot, HELP_CONTENT))
    ? stripComments(read(HELP_CONTENT))
    : "";

  assertCase(
    block,
    "types.reexportsVisibilityId",
    /export\s+type\s+\{\s*VisibilityId\s*\}/.test(typesSrc) &&
      /visibility\/VisibilityTypes/.test(typesSrc),
    "ContextHelpTypes reexports VisibilityId from visibility",
  );

  assertCase(
    block,
    "types.noContextHelpId",
    !/\bContextHelpId\b/.test(typesSrc) && !/\bContextHelpId\b/.test(contentSrc),
    "No parallel ContextHelpId brand",
  );

  assertCase(
    block,
    "types.noIdentityFreeze",
    !/visibilityIdFromCommandId/.test(typesSrc) &&
      !/asCommandId/.test(typesSrc) &&
      !/\bCommandId\b/.test(typesSrc),
    "No Identity Freeze / CommandId in ContextHelpTypes",
  );

  const body = extractReadonlyTypeBody(contentSrc, "ContextHelp");
  assertCase(
    block,
    "help.fields",
    /readonly\s+id\s*:\s*VisibilityId/.test(body) &&
      /readonly\s+title\s*:\s*string/.test(body) &&
      /readonly\s+description\s*:\s*string/.test(body) &&
      /readonly\s+category\s*:\s*string/.test(body),
    "ContextHelp = { id, title, description, category }",
  );

  assertCase(
    block,
    "help.noForbiddenFields",
    !/\bshortcut\b/.test(body) &&
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
    "ContextHelp has no forbidden fields (incl. shortcut)",
  );

  assertCase(
    block,
    "help.initExists",
    /export\s+type\s+ContextHelpInit\s*=/.test(contentSrc),
    "ContextHelpInit exported",
  );

  assertCase(
    block,
    "help.noReact",
    !/\bfrom\s+["']react["']/.test(contentSrc) &&
      !/\bfrom\s+["']react-dom["']/.test(contentSrc),
    "ContextHelp is React-free",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — factoryContract                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "factoryContract";

  const src = existsSync(join(repoRoot, HELP_FACTORY))
    ? stripComments(read(HELP_FACTORY))
    : "";

  assertCase(
    block,
    "factory.exports",
    /export\s+function\s+createContextHelp\s*\(/.test(src),
    "createContextHelp exported",
  );

  assertCase(
    block,
    "factory.freeze",
    /Object\.freeze/.test(src),
    "createContextHelp uses Object.freeze",
  );

  assertCase(
    block,
    "factory.trim",
    /\.trim\s*\(/.test(src),
    "createContextHelp normalizes with trim()",
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
    "factory.usesVisibilityId",
    /asVisibilityId/.test(src) && /visibility\/VisibilityTypes/.test(src),
    "Factory brands id with asVisibilityId from VisibilityTypes",
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
/* PASS 05 — fromDefinition (Projection · VisibilityId · Description · Cat)   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "fromDefinition";

  const src = existsSync(join(repoRoot, HELP_RESOLVE))
    ? stripComments(read(HELP_RESOLVE))
    : "";
  const body = extractFunctionBody(src, "contextHelpFromDefinition");

  assertCase(
    block,
    "projection.exports",
    /export\s+function\s+contextHelpFromDefinition\s*\(/.test(src),
    "contextHelpFromDefinition exported",
  );

  assertCase(
    block,
    "projection.copiesFields",
    /definition\.id/.test(body) &&
      /definition\.title/.test(body) &&
      /definition\.description/.test(body) &&
      /definition\.category/.test(body),
    "Projection copies id/title/description/category",
  );

  assertCase(
    block,
    "projection.ignoresShortcut",
    !/definition\.shortcut/.test(body),
    "Projection ignores shortcut",
  );

  assertCase(
    block,
    "projection.visibilityIdExact",
    /id:\s*definition\.id/.test(body) &&
      !/asCommandId/.test(body) &&
      !/asVisibilityId/.test(body) &&
      !/String\s*\(\s*definition\.id\s*\)/.test(body),
    "Projection uses definition.id exact (VisibilityId Freeze)",
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
      !/\benriquec/i.test(body) &&
      !/\bresum/i.test(body) &&
      !/\btraduc/i.test(body) &&
      !/\bjerarqu/i.test(body),
    "Projection has no transform/format/i18n/enrich/summarize/category taxonomy",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — resolveContract (Query Only)                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "resolveContract";

  const src = existsSync(join(repoRoot, HELP_RESOLVE))
    ? stripComments(read(HELP_RESOLVE))
    : "";
  const body = extractFunctionBody(src, "resolveContextHelp");

  assertCase(
    block,
    "resolve.exports",
    /export\s+function\s+resolveContextHelp\s*\(/.test(src),
    "resolveContextHelp exported",
  );

  assertCase(
    block,
    "resolve.visibilityIdEntry",
    /id\s*:\s*VisibilityId/.test(src) && !/commandId\s*:\s*CommandId/.test(src),
    "Resolve entry is VisibilityId",
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
    /contextHelpFromDefinition\s*\(/.test(body),
    "Resolve delegates to contextHelpFromDefinition",
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
      !/\blazy\b/i.test(body),
    "Resolve is Query Only (no register/cache/fallback/lazy)",
  );

  assertCase(
    block,
    "resolve.noFenceScannedNames",
    !/\bvisibilityRegistry\b/.test(src) &&
      !/\bVisibilityRegistryApi\b/.test(src) &&
      !/\bcreateVisibilityDefinition\b/.test(src) &&
      !/\bcreateVisibilityRegistry\b/.test(src),
    "Resolve file avoids UX-7.1 fence-scanned visibility identifiers",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — barrelExport                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "barrelExport";

  const src = existsSync(join(repoRoot, HELP_INDEX))
    ? stripComments(read(HELP_INDEX))
    : "";

  assertCase(
    block,
    "barrel.types",
    /from\s+["']\.\/ContextHelpTypes["']/.test(src) && /VisibilityId/.test(src),
    "Barrel reexports ContextHelpTypes",
  );

  assertCase(
    block,
    "barrel.help",
    /from\s+["']\.\/ContextHelp["']/.test(src) &&
      /ContextHelp/.test(src) &&
      /ContextHelpInit/.test(src),
    "Barrel reexports ContextHelp",
  );

  assertCase(
    block,
    "barrel.factory",
    /from\s+["']\.\/createContextHelp["']/.test(src) &&
      /createContextHelp/.test(src),
    "Barrel reexports createContextHelp",
  );

  assertCase(
    block,
    "barrel.resolve",
    /from\s+["']\.\/resolveContextHelp["']/.test(src) &&
      /contextHelpFromDefinition/.test(src) &&
      /resolveContextHelp/.test(src),
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
    "exists.validate74",
    existsSync(join(repoRoot, VALIDATE_7_4)),
    `${VALIDATE_7_4} exists`,
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

  assertCase(
    block,
    "exists.doc74",
    existsSync(join(repoRoot, DOC_7_4)),
    `${DOC_7_4} exists`,
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

  const descSrc = existsSync(join(repoRoot, DESC_CONTENT))
    ? stripComments(read(DESC_CONTENT))
    : "";
  const descBody = extractReadonlyTypeBody(descSrc, "CommandDescription");
  assertCase(
    block,
    "commandDescription.fiveFields",
    /readonly\s+id\s*:\s*CommandId/.test(descBody) &&
      /readonly\s+title\s*:\s*string/.test(descBody) &&
      /readonly\s+description\s*:\s*string/.test(descBody) &&
      /readonly\s+shortcut\s*:\s*string/.test(descBody) &&
      /readonly\s+category\s*:\s*string/.test(descBody),
    "CommandDescription still has 5 fields with CommandId",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — freezeFences                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "freezeFences";

  const helpFiles = walkFiles(join(repoRoot, HELP_DIR));
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
  let hasDescImport = false;
  let hasCommandsImport = false;
  let hasPipelineImport = false;
  let hasFenceScannedNames = false;

  for (const full of helpFiles) {
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
      /from\s+["']\.\.\/command-descriptions\//.test(src) ||
      /from\s+["']@\/ui\/command-descriptions\b/.test(src) ||
      /CommandDescription/.test(src) ||
      /createCommandDescription/.test(src) ||
      /resolveCommandDescription/.test(src)
    ) {
      hasDescImport = true;
    }
    if (
      /from\s+["']\.\.\/commands\//.test(src) ||
      /from\s+["']@\/ui\/commands\b/.test(src) ||
      /\bCommandId\b/.test(src) ||
      /asCommandId/.test(src)
    ) {
      hasCommandsImport = true;
    }
    if (
      /CommandExecution/.test(src) ||
      /CommandPipeline/.test(src) ||
      /Dispatcher/.test(src)
    ) {
      hasPipelineImport = true;
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

  assertCase(block, "fence.noReact", !hasReact, "No react under context-help/");
  assertCase(
    block,
    "fence.noReactDom",
    !hasReactDom,
    "No react-dom under context-help/",
  );
  assertCase(
    block,
    "fence.noWindow",
    !hasWindow,
    "No window under context-help/",
  );
  assertCase(
    block,
    "fence.noDocument",
    !hasDocument,
    "No document under context-help/",
  );
  assertCase(block, "fence.noCss", !hasCss, "No CSS/style under context-help/");
  assertCase(block, "fence.noDom", !hasDomApis, "No DOM APIs under context-help/");
  assertCase(
    block,
    "fence.noUiComponents",
    !hasUiComponentImport,
    "No UI product component imports under context-help/",
  );
  assertCase(
    block,
    "fence.noAppImport",
    !hasAppImport,
    "No App imports under context-help/",
  );
  assertCase(
    block,
    "fence.noProvider",
    !hasProvider,
    "No Provider/Context under context-help/",
  );
  assertCase(block, "fence.noHooks", !hasHook, "No hooks under context-help/");
  assertCase(
    block,
    "fence.noShortcutsImport",
    !hasShortcutsImport,
    "No import from src/ui/shortcuts/ under context-help/",
  );
  assertCase(
    block,
    "fence.noTooltipsImport",
    !hasTooltipsImport,
    "No import from tooltips under context-help/",
  );
  assertCase(
    block,
    "fence.noHintsImport",
    !hasHintsImport,
    "No import from shortcut-hints under context-help/",
  );
  assertCase(
    block,
    "fence.noDescImport",
    !hasDescImport,
    "No import from command-descriptions under context-help/",
  );
  assertCase(
    block,
    "fence.noCommandsImport",
    !hasCommandsImport,
    "No import from commands under context-help/",
  );
  assertCase(
    block,
    "fence.noPipeline",
    !hasPipelineImport,
    "No Pipeline/Dispatcher under context-help/",
  );
  assertCase(
    block,
    "fence.noUx71ScannedNames",
    !hasFenceScannedNames,
    "No UX-7.1 fence-scanned visibility identifiers under context-help/",
  );

  const srcRoot = join(repoRoot, "src");
  const allSrc = walkFiles(srcRoot);
  let productWire = false;
  for (const full of allSrc) {
    const rel = relative(repoRoot, full).replace(/\\/g, "/");
    if (rel.startsWith("src/ui/context-help/")) continue;
    const src = stripComments(readFileSync(full, "utf8"));
    if (
      /createContextHelp/.test(src) ||
      /contextHelpFromDefinition/.test(src) ||
      /resolveContextHelp/.test(src) ||
      /from\s+["']@\/ui\/context-help\b/.test(src) ||
      /from\s+["'][^"']*\/ui\/context-help\b/.test(src)
    ) {
      productWire = true;
      break;
    }
  }

  assertCase(
    block,
    "fence.noProductWire",
    !productWire,
    "No context-help import/wire outside src/ui/context-help/",
  );

  const uiIndex = existsSync(join(repoRoot, UI_INDEX))
    ? stripComments(read(UI_INDEX))
    : "";
  assertCase(
    block,
    "fence.publicBarrelIntact",
    !/\bcontext-help\b/.test(uiIndex) &&
      !/\bcommand-descriptions\b/.test(uiIndex) &&
      !/\bshortcut-hints\b/.test(uiIndex) &&
      !/\btooltips\b/.test(uiIndex) &&
      !/\bvisibility\b/.test(uiIndex) &&
      !/ContextHelp/.test(uiIndex) &&
      !/createContextHelp/.test(uiIndex) &&
      !/resolveContextHelp/.test(uiIndex) &&
      !/CommandDescription/.test(uiIndex) &&
      !/ShortcutHint/.test(uiIndex) &&
      !/TooltipContent/.test(uiIndex) &&
      !/VisibilityRegistry/.test(uiIndex) &&
      !/visibilityRegistry/.test(uiIndex),
    "src/ui/index.ts does not export context-help or prior UX-7 modules",
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

  const helpFiles = walkFiles(join(repoRoot, HELP_DIR));
  let helpImportVisibility = false;
  let helpImportForbidden = false;

  for (const full of helpFiles) {
    const src = stripComments(readFileSync(full, "utf8"));
    if (
      /from\s+["']\.\.\/visibility\//.test(src) ||
      /from\s+["']@\/ui\/visibility\b/.test(src)
    ) {
      helpImportVisibility = true;
    }
    if (
      /from\s+["']\.\.\/tooltips\//.test(src) ||
      /from\s+["']\.\.\/shortcut-hints\//.test(src) ||
      /from\s+["']\.\.\/command-descriptions\//.test(src) ||
      /from\s+["']\.\.\/shortcuts\//.test(src) ||
      /from\s+["']\.\.\/commands\//.test(src)
    ) {
      helpImportForbidden = true;
    }
  }

  assertCase(
    block,
    "dep.helpToVisibility",
    helpImportVisibility,
    "context-help imports visibility (unidirectional allowed)",
  );

  assertCase(
    block,
    "dep.helpNoSiblings",
    !helpImportForbidden,
    "context-help does not import siblings/shortcuts/commands",
  );

  function moduleImportsHelp(dir: string): boolean {
    const files = walkFiles(join(repoRoot, dir));
    for (const full of files) {
      const src = stripComments(readFileSync(full, "utf8"));
      if (
        /from\s+["']\.\.\/context-help\//.test(src) ||
        /from\s+["']@\/ui\/context-help\b/.test(src) ||
        /context-help\//.test(src) ||
        /ContextHelp/.test(src) ||
        /createContextHelp/.test(src) ||
        /resolveContextHelp/.test(src) ||
        /contextHelpFromDefinition/.test(src)
      ) {
        return true;
      }
    }
    return false;
  }

  assertCase(
    block,
    "dep.visibilityNoHelp",
    !moduleImportsHelp(VISIBILITY_DIR),
    "visibility does not import context-help",
  );

  assertCase(
    block,
    "dep.tooltipsNoHelp",
    !moduleImportsHelp(TOOLTIPS_DIR),
    "tooltips does not import context-help",
  );

  assertCase(
    block,
    "dep.hintsNoHelp",
    !moduleImportsHelp(HINTS_DIR),
    "shortcut-hints does not import context-help",
  );

  assertCase(
    block,
    "dep.descNoHelp",
    !moduleImportsHelp(DESC_DIR),
    "command-descriptions does not import context-help",
  );

  const visIndex = existsSync(join(repoRoot, VISIBILITY_INDEX))
    ? stripComments(read(VISIBILITY_INDEX))
    : "";
  assertCase(
    block,
    "dep.visibilityBarrelClean",
    !/context.?help/i.test(visIndex),
    "visibility barrel does not mention context-help",
  );

  const tipIndex = existsSync(join(repoRoot, TOOLTIP_INDEX))
    ? stripComments(read(TOOLTIP_INDEX))
    : "";
  assertCase(
    block,
    "dep.tooltipsBarrelClean",
    !/context.?help/i.test(tipIndex),
    "tooltips barrel does not mention context-help",
  );

  const hintIndex = existsSync(join(repoRoot, HINT_INDEX))
    ? stripComments(read(HINT_INDEX))
    : "";
  assertCase(
    block,
    "dep.hintsBarrelClean",
    !/context.?help/i.test(hintIndex),
    "shortcut-hints barrel does not mention context-help",
  );

  const descIndex = existsSync(join(repoRoot, DESC_INDEX))
    ? stripComments(read(DESC_INDEX))
    : "";
  assertCase(
    block,
    "dep.descBarrelClean",
    !/context.?help/i.test(descIndex),
    "command-descriptions barrel does not mention context-help",
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const BLOCKS: { id: BlockId; ca: string }[] = [
  { id: "documentationExists", ca: "CA-UX-7.5.1" },
  { id: "moduleExists", ca: "CA-UX-7.5.2" },
  { id: "helpTypes", ca: "CA-UX-7.5.3" },
  { id: "factoryContract", ca: "CA-UX-7.5.4" },
  { id: "fromDefinition", ca: "CA-UX-7.5.5" },
  { id: "resolveContract", ca: "CA-UX-7.5.6" },
  { id: "barrelExport", ca: "CA-UX-7.5.7" },
  { id: "priorFreezeIntact", ca: "CA-UX-7.5.8" },
  { id: "freezeFences", ca: "CA-UX-7.5.9" },
  { id: "unidirectionalDep", ca: "CA-UX-7.5.10" },
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
