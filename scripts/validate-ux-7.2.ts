/**
 * UX-7.2 — Tooltip Foundation gate.
 *
 * Blocks:
 * documentationExists · moduleExists · contentTypes · factoryContract
 * fromDefinition · resolveContract · barrelExport · visibilityFreezeIntact
 * freezeFences · unidirectionalDep
 *
 * Architectural principles:
 * - Content Foundation (TooltipContent projection).
 * - Projection Freeze = deterministic copy of 4 fields.
 * - Resolve = Query Only (get → projection → return).
 * - No React · Window · DOM · CSS · App mount · @/ui public expansion.
 * - UX-7.1 Architecture Freeze intact.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "documentationExists"
  | "moduleExists"
  | "contentTypes"
  | "factoryContract"
  | "fromDefinition"
  | "resolveContract"
  | "barrelExport"
  | "visibilityFreezeIntact"
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

const TOOLTIPS_DIR = "src/ui/tooltips";
const TOOLTIP_TYPES = `${TOOLTIPS_DIR}/TooltipTypes.ts`;
const TOOLTIP_CONTENT = `${TOOLTIPS_DIR}/TooltipContent.ts`;
const TOOLTIP_FACTORY = `${TOOLTIPS_DIR}/createTooltipContent.ts`;
const TOOLTIP_RESOLVE = `${TOOLTIPS_DIR}/resolveTooltipContent.ts`;
const TOOLTIP_INDEX = `${TOOLTIPS_DIR}/index.ts`;

const VISIBILITY_DIR = "src/ui/visibility";
const VISIBILITY_DEFINITION = `${VISIBILITY_DIR}/VisibilityDefinition.ts`;
const VISIBILITY_REGISTRY = `${VISIBILITY_DIR}/VisibilityRegistry.ts`;
const VISIBILITY_INDEX = `${VISIBILITY_DIR}/index.ts`;

const UI_INDEX = "src/ui/index.ts";
const ROADMAP_7 = "docs/UX/UX-7.0-roadmap.md";
const DOC_7_1 = "docs/UX/UX-7.1.md";
const DOC_7_2 = "docs/UX/UX-7.2.md";
const VALIDATE_7_1 = "scripts/validate-ux-7.1.ts";
const PACKAGE_JSON = "package.json";

const MODULE_FILES = [
  TOOLTIP_TYPES,
  TOOLTIP_CONTENT,
  TOOLTIP_FACTORY,
  TOOLTIP_RESOLVE,
  TOOLTIP_INDEX,
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
    existsSync(join(repoRoot, DOC_7_2)),
    `${DOC_7_2} exists`,
  );

  const pkg = existsSync(join(repoRoot, PACKAGE_JSON))
    ? read(PACKAGE_JSON)
    : "";
  assertCase(
    block,
    "exists.npmScript",
    /"validate:ux-7\.2"\s*:/.test(pkg),
    "package.json has validate:ux-7.2",
  );

  const doc = existsSync(join(repoRoot, DOC_7_2)) ? read(DOC_7_2) : "";
  assertCase(
    block,
    "doc.contentFoundation",
    /Content Foundation/i.test(doc),
    "UX-7.2.md documents Content Foundation",
  );

  assertCase(
    block,
    "doc.projectionFreeze",
    /Projection Freeze/i.test(doc) &&
      /tooltipContentFromDefinition/.test(doc) &&
      /copia exactamente/i.test(doc),
    "UX-7.2.md documents Projection Freeze",
  );

  assertCase(
    block,
    "doc.resolveQueryOnly",
    /Resolve = Query Only/i.test(doc) &&
      /registry\.get\(id\)/.test(doc),
    "UX-7.2.md documents Resolve = Query Only",
  );

  assertCase(
    block,
    "doc.noReact",
    /NO React/i.test(doc) && /No React/i.test(doc),
    "UX-7.2.md documents No React",
  );

  const roadmap = existsSync(join(repoRoot, ROADMAP_7))
    ? read(ROADMAP_7)
    : "";
  assertCase(
    block,
    "roadmap.ux72Complete",
    /UX-7\.2\s*=\s*COMPLETE/.test(roadmap),
    "UX-7.0-roadmap.md marks UX-7.2 COMPLETE",
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
    existsSync(join(repoRoot, TOOLTIPS_DIR)),
    "src/ui/tooltips/ exists",
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
/* PASS 03 — contentTypes                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "contentTypes";

  const typesSrc = existsSync(join(repoRoot, TOOLTIP_TYPES))
    ? stripComments(read(TOOLTIP_TYPES))
    : "";
  const contentSrc = existsSync(join(repoRoot, TOOLTIP_CONTENT))
    ? stripComments(read(TOOLTIP_CONTENT))
    : "";

  assertCase(
    block,
    "types.reexportsVisibilityId",
    /export\s+type\s+\{\s*VisibilityId\s*\}/.test(typesSrc) &&
      /visibility\/VisibilityTypes/.test(typesSrc),
    "TooltipTypes reexports VisibilityId from visibility",
  );

  const body = extractReadonlyTypeBody(contentSrc, "TooltipContent");
  assertCase(
    block,
    "content.fields",
    /readonly\s+id\s*:\s*VisibilityId/.test(body) &&
      /readonly\s+title\s*:\s*string/.test(body) &&
      /readonly\s+description\s*:\s*string/.test(body) &&
      /readonly\s+shortcut\s*:\s*string/.test(body),
    "TooltipContent = { id, title, description, shortcut }",
  );

  assertCase(
    block,
    "content.noForbiddenFields",
    !/\bcategory\b/.test(body) &&
      !/\bicon\b/.test(body) &&
      !/\bpriority\b/.test(body) &&
      !/\bplacement\b/.test(body) &&
      !/\bdelay\b/.test(body) &&
      !/\banimation\b/.test(body) &&
      !/\bi18n\b/.test(body) &&
      !/\bmarkdown\b/.test(body) &&
      !/\bhtml\b/i.test(body) &&
      !/\bcallback\b/.test(body) &&
      !/\bonClick\b/.test(body),
    "TooltipContent has no forbidden fields",
  );

  assertCase(
    block,
    "content.initExists",
    /export\s+type\s+TooltipContentInit\s*=/.test(contentSrc),
    "TooltipContentInit exported",
  );

  assertCase(
    block,
    "content.noReact",
    !/\bfrom\s+["']react["']/.test(contentSrc) &&
      !/\bfrom\s+["']react-dom["']/.test(contentSrc),
    "TooltipContent is React-free",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — factoryContract                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "factoryContract";

  const src = existsSync(join(repoRoot, TOOLTIP_FACTORY))
    ? stripComments(read(TOOLTIP_FACTORY))
    : "";

  assertCase(
    block,
    "factory.exports",
    /export\s+function\s+createTooltipContent\s*\(/.test(src),
    "createTooltipContent exported",
  );

  assertCase(
    block,
    "factory.freeze",
    /Object\.freeze/.test(src),
    "createTooltipContent uses Object.freeze",
  );

  assertCase(
    block,
    "factory.trim",
    /\.trim\s*\(/.test(src),
    "createTooltipContent normalizes with trim()",
  );

  assertCase(
    block,
    "factory.validate",
    /throw\s+new\s+Error/.test(src) &&
      /id must be a non-empty string/.test(src) &&
      /title must be a non-empty string/.test(src),
    "Factory validates non-empty id/title",
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
/* PASS 05 — fromDefinition (Projection Freeze)                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "fromDefinition";

  const src = existsSync(join(repoRoot, TOOLTIP_RESOLVE))
    ? stripComments(read(TOOLTIP_RESOLVE))
    : "";
  const body = extractFunctionBody(src, "tooltipContentFromDefinition");

  assertCase(
    block,
    "projection.exports",
    /export\s+function\s+tooltipContentFromDefinition\s*\(/.test(src),
    "tooltipContentFromDefinition exported",
  );

  assertCase(
    block,
    "projection.copiesFields",
    /definition\.id/.test(body) &&
      /definition\.title/.test(body) &&
      /definition\.description/.test(body) &&
      /definition\.shortcut/.test(body),
    "Projection copies id/title/description/shortcut",
  );

  assertCase(
    block,
    "projection.ignoresCategory",
    !/definition\.category/.test(body),
    "Projection ignores category",
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
      !/\bi18n\b/.test(body) &&
      !/\bmarkdown\b/.test(body) &&
      !/\bhtml\b/i.test(body) &&
      !/\bformat/.test(body) &&
      !/\.trim\s*\(/.test(body),
    "Projection has no transform/format/i18n/markdown/trim",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — resolveContract (Query Only)                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "resolveContract";

  const src = existsSync(join(repoRoot, TOOLTIP_RESOLVE))
    ? stripComments(read(TOOLTIP_RESOLVE))
    : "";
  const body = extractFunctionBody(src, "resolveTooltipContent");

  assertCase(
    block,
    "resolve.exports",
    /export\s+function\s+resolveTooltipContent\s*\(/.test(src),
    "resolveTooltipContent exported",
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
    /tooltipContentFromDefinition\s*\(/.test(body),
    "Resolve delegates to tooltipContentFromDefinition",
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
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — barrelExport                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "barrelExport";

  const src = existsSync(join(repoRoot, TOOLTIP_INDEX))
    ? stripComments(read(TOOLTIP_INDEX))
    : "";

  assertCase(
    block,
    "barrel.types",
    /from\s+["']\.\/TooltipTypes["']/.test(src) && /VisibilityId/.test(src),
    "Barrel reexports TooltipTypes",
  );

  assertCase(
    block,
    "barrel.content",
    /from\s+["']\.\/TooltipContent["']/.test(src) &&
      /TooltipContent/.test(src) &&
      /TooltipContentInit/.test(src),
    "Barrel reexports TooltipContent",
  );

  assertCase(
    block,
    "barrel.factory",
    /from\s+["']\.\/createTooltipContent["']/.test(src) &&
      /createTooltipContent/.test(src),
    "Barrel reexports createTooltipContent",
  );

  assertCase(
    block,
    "barrel.resolve",
    /from\s+["']\.\/resolveTooltipContent["']/.test(src) &&
      /tooltipContentFromDefinition/.test(src) &&
      /resolveTooltipContent/.test(src),
    "Barrel reexports projection + resolve",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — visibilityFreezeIntact                                           */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "visibilityFreezeIntact";

  assertCase(
    block,
    "exists.validate71",
    existsSync(join(repoRoot, VALIDATE_7_1)),
    `${VALIDATE_7_1} exists`,
  );

  assertCase(
    block,
    "exists.doc71",
    existsSync(join(repoRoot, DOC_7_1)),
    `${DOC_7_1} exists`,
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
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — freezeFences                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "freezeFences";

  const tooltipFiles = walkFiles(join(repoRoot, TOOLTIPS_DIR));
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

  for (const full of tooltipFiles) {
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
      /\bElement\b/.test(src) ||
      /\bNodeList\b/.test(src) ||
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
  }

  assertCase(block, "fence.noReact", !hasReact, "No react under tooltips/");
  assertCase(
    block,
    "fence.noReactDom",
    !hasReactDom,
    "No react-dom under tooltips/",
  );
  assertCase(block, "fence.noWindow", !hasWindow, "No window under tooltips/");
  assertCase(
    block,
    "fence.noDocument",
    !hasDocument,
    "No document under tooltips/",
  );
  assertCase(block, "fence.noCss", !hasCss, "No CSS/style under tooltips/");
  assertCase(block, "fence.noDom", !hasDomApis, "No DOM APIs under tooltips/");
  assertCase(
    block,
    "fence.noUiComponents",
    !hasUiComponentImport,
    "No UI product component imports under tooltips/",
  );
  assertCase(
    block,
    "fence.noAppImport",
    !hasAppImport,
    "No App imports under tooltips/",
  );
  assertCase(
    block,
    "fence.noProvider",
    !hasProvider,
    "No Provider/Context under tooltips/",
  );
  assertCase(block, "fence.noHooks", !hasHook, "No hooks under tooltips/");

  const srcRoot = join(repoRoot, "src");
  const allSrc = walkFiles(srcRoot);
  let productWire = false;
  for (const full of allSrc) {
    const rel = relative(repoRoot, full).replace(/\\/g, "/");
    if (rel.startsWith("src/ui/tooltips/")) continue;
    const src = stripComments(readFileSync(full, "utf8"));
    if (
      /createTooltipContent/.test(src) ||
      /tooltipContentFromDefinition/.test(src) ||
      /resolveTooltipContent/.test(src) ||
      /from\s+["']@\/ui\/tooltips\b/.test(src) ||
      /from\s+["'][^"']*\/ui\/tooltips\b/.test(src)
    ) {
      productWire = true;
      break;
    }
  }

  assertCase(
    block,
    "fence.noProductWire",
    !productWire,
    "No tooltips import/wire outside src/ui/tooltips/",
  );

  const uiIndex = existsSync(join(repoRoot, UI_INDEX))
    ? stripComments(read(UI_INDEX))
    : "";
  assertCase(
    block,
    "fence.publicBarrelIntact",
    !/\btooltips\b/.test(uiIndex) &&
      !/\bvisibility\b/.test(uiIndex) &&
      !/TooltipContent/.test(uiIndex) &&
      !/createTooltipContent/.test(uiIndex) &&
      !/resolveTooltipContent/.test(uiIndex) &&
      !/VisibilityRegistry/.test(uiIndex) &&
      !/visibilityRegistry/.test(uiIndex),
    "src/ui/index.ts does not export tooltips or visibility",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — unidirectionalDep                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "unidirectionalDep";

  const tooltipFiles = walkFiles(join(repoRoot, TOOLTIPS_DIR));
  let tooltipsImportsVisibility = false;
  for (const full of tooltipFiles) {
    const src = stripComments(readFileSync(full, "utf8"));
    if (
      /from\s+["']\.\.\/visibility\//.test(src) ||
      /from\s+["']@\/ui\/visibility\b/.test(src)
    ) {
      tooltipsImportsVisibility = true;
      break;
    }
  }

  assertCase(
    block,
    "dep.tooltipsToVisibility",
    tooltipsImportsVisibility,
    "tooltips imports visibility (unidirectional allowed)",
  );

  const visibilityFiles = walkFiles(join(repoRoot, VISIBILITY_DIR));
  let visibilityImportsTooltips = false;
  for (const full of visibilityFiles) {
    const src = stripComments(readFileSync(full, "utf8"));
    if (
      /from\s+["']\.\.\/tooltips\//.test(src) ||
      /from\s+["']\.\/tooltips\//.test(src) ||
      /from\s+["']@\/ui\/tooltips\b/.test(src) ||
      /tooltips\//.test(src) ||
      /TooltipContent/.test(src) ||
      /createTooltipContent/.test(src) ||
      /resolveTooltipContent/.test(src)
    ) {
      visibilityImportsTooltips = true;
      break;
    }
  }

  assertCase(
    block,
    "dep.visibilityNoTooltips",
    !visibilityImportsTooltips,
    "visibility does not import tooltips",
  );

  const visIndex = existsSync(join(repoRoot, VISIBILITY_INDEX))
    ? stripComments(read(VISIBILITY_INDEX))
    : "";
  assertCase(
    block,
    "dep.visibilityBarrelClean",
    !/tooltip/i.test(visIndex),
    "visibility barrel does not mention tooltips",
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const BLOCKS: { id: BlockId; ca: string }[] = [
  { id: "documentationExists", ca: "CA-UX-7.2.1" },
  { id: "moduleExists", ca: "CA-UX-7.2.2" },
  { id: "contentTypes", ca: "CA-UX-7.2.3" },
  { id: "factoryContract", ca: "CA-UX-7.2.4" },
  { id: "fromDefinition", ca: "CA-UX-7.2.5" },
  { id: "resolveContract", ca: "CA-UX-7.2.6" },
  { id: "barrelExport", ca: "CA-UX-7.2.7" },
  { id: "visibilityFreezeIntact", ca: "CA-UX-7.2.8" },
  { id: "freezeFences", ca: "CA-UX-7.2.9" },
  { id: "unidirectionalDep", ca: "CA-UX-7.2.10" },
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
