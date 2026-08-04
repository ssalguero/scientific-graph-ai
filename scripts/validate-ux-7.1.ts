/**
 * UX-7.1 — Visibility Foundation gate.
 *
 * Blocks:
 * documentationExists · registryExists · registryRegister · registryGet
 * registryGetAll · registryClear · definitionTypes · factoryContract
 * barrelExport · freezeFences
 *
 * Architectural principles:
 * - VisibilityRegistryApi + empty visibilityRegistry (empty by design).
 * - Definition = metadata only (id/title/description/shortcut/category).
 * - Registry Freeze = register / get / getAll / clear only.
 * - No React · Window · DOM · CSS · App mount · @/ui public expansion.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "documentationExists"
  | "registryExists"
  | "registryRegister"
  | "registryGet"
  | "registryGetAll"
  | "registryClear"
  | "definitionTypes"
  | "factoryContract"
  | "barrelExport"
  | "freezeFences";

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

const VISIBILITY_DIR = "src/ui/visibility";
const VISIBILITY_TYPES = `${VISIBILITY_DIR}/VisibilityTypes.ts`;
const VISIBILITY_DEFINITION = `${VISIBILITY_DIR}/VisibilityDefinition.ts`;
const VISIBILITY_FACTORY = `${VISIBILITY_DIR}/createVisibilityDefinition.ts`;
const VISIBILITY_REGISTRY = `${VISIBILITY_DIR}/VisibilityRegistry.ts`;
const VISIBILITY_INDEX = `${VISIBILITY_DIR}/index.ts`;
const UI_INDEX = "src/ui/index.ts";
const ROADMAP_7 = "docs/UX/UX-7.0-roadmap.md";
const DOC_7_1 = "docs/UX/UX-7.1.md";
const PACKAGE_JSON = "package.json";

const MODULE_FILES = [
  VISIBILITY_TYPES,
  VISIBILITY_DEFINITION,
  VISIBILITY_FACTORY,
  VISIBILITY_REGISTRY,
  VISIBILITY_INDEX,
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
    existsSync(join(repoRoot, DOC_7_1)),
    `${DOC_7_1} exists`,
  );

  const pkg = existsSync(join(repoRoot, PACKAGE_JSON))
    ? read(PACKAGE_JSON)
    : "";
  assertCase(
    block,
    "exists.npmScript",
    /"validate:ux-7\.1"\s*:/.test(pkg),
    "package.json has validate:ux-7.1",
  );

  const doc = existsSync(join(repoRoot, DOC_7_1)) ? read(DOC_7_1) : "";
  assertCase(
    block,
    "doc.registryFreeze",
    /Registry Freeze/i.test(doc) &&
      /register\(\)/.test(doc) &&
      /get\(\)/.test(doc) &&
      /getAll\(\)/.test(doc) &&
      /clear\(\)/.test(doc),
    "UX-7.1.md documents Registry Freeze (4 methods)",
  );

  assertCase(
    block,
    "doc.noResponsabilidades",
    /No localization/i.test(doc) &&
      /No i18n/i.test(doc) &&
      /No markdown/i.test(doc) &&
      /No rich text/i.test(doc) &&
      /No HTML/i.test(doc) &&
      /No rendering/i.test(doc) &&
      /No icon metadata/i.test(doc) &&
      /No priorities/i.test(doc),
    "UX-7.1.md documents No responsabilidades block",
  );

  assertCase(
    block,
    "doc.architecture",
    /VisibilityDefinition/.test(doc) &&
      /createVisibilityDefinition/.test(doc) &&
      /VisibilityRegistry/.test(doc) &&
      /\(Deferred\)/.test(doc),
    "UX-7.1.md documents frozen architecture pipeline",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — registryExists                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "registryExists";

  assertCase(
    block,
    "exists.dir",
    existsSync(join(repoRoot, VISIBILITY_DIR)),
    "src/ui/visibility/ exists",
  );

  assertCase(
    block,
    "exists.VisibilityRegistry",
    existsSync(join(repoRoot, VISIBILITY_REGISTRY)),
    `${VISIBILITY_REGISTRY} exists`,
  );

  const src = existsSync(join(repoRoot, VISIBILITY_REGISTRY))
    ? stripComments(read(VISIBILITY_REGISTRY))
    : "";

  assertCase(
    block,
    "registry.apiInterface",
    /export\s+interface\s+VisibilityRegistryApi\s*\{/.test(src),
    "VisibilityRegistryApi interface exported",
  );

  assertCase(
    block,
    "registry.singleton",
    /export\s+const\s+visibilityRegistry\s*:\s*VisibilityRegistryApi\s*=/.test(
      src,
    ),
    "visibilityRegistry singleton SSOT exported",
  );

  assertCase(
    block,
    "registry.create",
    /export\s+function\s+createVisibilityRegistry\s*\(/.test(src),
    "createVisibilityRegistry exported",
  );

  assertCase(
    block,
    "registry.noReact",
    !/\bfrom\s+["']react["']/.test(src) &&
      !/\bfrom\s+["']react-dom["']/.test(src),
    "VisibilityRegistry is React-free",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — registryRegister                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "registryRegister";
  const src = existsSync(join(repoRoot, VISIBILITY_REGISTRY))
    ? stripComments(read(VISIBILITY_REGISTRY))
    : "";
  const apiBody = extractInterfaceBody(src, "VisibilityRegistryApi");

  assertCase(
    block,
    "registry.register",
    /\bregister\s*\(/.test(apiBody),
    "VisibilityRegistryApi.register(",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — registryGet                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "registryGet";
  const src = existsSync(join(repoRoot, VISIBILITY_REGISTRY))
    ? stripComments(read(VISIBILITY_REGISTRY))
    : "";
  const apiBody = extractInterfaceBody(src, "VisibilityRegistryApi");

  assertCase(
    block,
    "registry.get",
    /\bget\s*\(/.test(apiBody),
    "VisibilityRegistryApi.get(",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — registryGetAll                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "registryGetAll";
  const src = existsSync(join(repoRoot, VISIBILITY_REGISTRY))
    ? stripComments(read(VISIBILITY_REGISTRY))
    : "";
  const apiBody = extractInterfaceBody(src, "VisibilityRegistryApi");

  assertCase(
    block,
    "registry.getAll",
    /\bgetAll\s*\(/.test(apiBody),
    "VisibilityRegistryApi.getAll(",
  );

  assertCase(
    block,
    "registry.getAllFrozenSnapshot",
    /Object\.freeze\s*\(\s*\[\s*\.\.\.\s*map\.values\s*\(\s*\)\s*\]\s*\)/.test(
      src,
    ),
    "getAll returns Object.freeze([...map.values()])",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — registryClear                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "registryClear";
  const src = existsSync(join(repoRoot, VISIBILITY_REGISTRY))
    ? stripComments(read(VISIBILITY_REGISTRY))
    : "";
  const apiBody = extractInterfaceBody(src, "VisibilityRegistryApi");

  assertCase(
    block,
    "registry.clear",
    /\bclear\s*\(/.test(apiBody),
    "VisibilityRegistryApi.clear(",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — definitionTypes                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "definitionTypes";

  assertCase(
    block,
    "exists.VisibilityTypes",
    existsSync(join(repoRoot, VISIBILITY_TYPES)),
    `${VISIBILITY_TYPES} exists`,
  );

  assertCase(
    block,
    "exists.VisibilityDefinition",
    existsSync(join(repoRoot, VISIBILITY_DEFINITION)),
    `${VISIBILITY_DEFINITION} exists`,
  );

  const typesSrc = existsSync(join(repoRoot, VISIBILITY_TYPES))
    ? stripComments(read(VISIBILITY_TYPES))
    : "";
  const defSrc = existsSync(join(repoRoot, VISIBILITY_DEFINITION))
    ? stripComments(read(VISIBILITY_DEFINITION))
    : "";

  assertCase(
    block,
    "types.VisibilityIdBranded",
    /export\s+type\s+VisibilityId\s*=\s*string\s*&\s*\{\s*readonly\s+__brand:\s*["']VisibilityId["']\s*\}/.test(
      typesSrc,
    ),
    "VisibilityId is branded string",
  );

  assertCase(
    block,
    "types.asVisibilityId",
    /export\s+function\s+asVisibilityId\s*\(/.test(typesSrc),
    "asVisibilityId() helper exported",
  );

  const body = extractReadonlyTypeBody(defSrc, "VisibilityDefinition");
  assertCase(
    block,
    "def.fields",
    /readonly\s+id\s*:\s*VisibilityId/.test(body) &&
      /readonly\s+title\s*:\s*string/.test(body) &&
      /readonly\s+description\s*:\s*string/.test(body) &&
      /readonly\s+shortcut\s*:\s*string/.test(body) &&
      /readonly\s+category\s*:\s*string/.test(body),
    "VisibilityDefinition = { id, title, description, shortcut, category }",
  );

  assertCase(
    block,
    "def.noForbiddenFields",
    !/\bicon\b/.test(body) &&
      !/\bpriority\b/.test(body) &&
      !/\bi18n\b/.test(body) &&
      !/\blocalizat/i.test(body) &&
      !/\bmarkdown\b/.test(body) &&
      !/\bhtml\b/i.test(body) &&
      !/\bcallback\b/.test(body) &&
      !/\bonClick\b/.test(body),
    "VisibilityDefinition has no icon/priority/i18n/markdown/html/callbacks",
  );

  assertCase(
    block,
    "def.noReact",
    !/\bfrom\s+["']react["']/.test(defSrc) &&
      !/\bfrom\s+["']react-dom["']/.test(defSrc),
    "VisibilityDefinition is React-free",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — factoryContract                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "factoryContract";

  assertCase(
    block,
    "exists.factory",
    existsSync(join(repoRoot, VISIBILITY_FACTORY)),
    `${VISIBILITY_FACTORY} exists`,
  );

  const src = existsSync(join(repoRoot, VISIBILITY_FACTORY))
    ? stripComments(read(VISIBILITY_FACTORY))
    : "";

  assertCase(
    block,
    "factory.exports",
    /export\s+function\s+createVisibilityDefinition\s*\(/.test(src),
    "createVisibilityDefinition exported",
  );

  assertCase(
    block,
    "factory.freeze",
    /Object\.freeze/.test(src),
    "createVisibilityDefinition uses Object.freeze",
  );

  assertCase(
    block,
    "factory.trim",
    /\.trim\s*\(/.test(src),
    "createVisibilityDefinition normalizes with trim()",
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
    "factory.noReact",
    !/\bfrom\s+["']react["']/.test(src) &&
      !/\bfrom\s+["']react-dom["']/.test(src),
    "Factory is React-free",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — barrelExport                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "barrelExport";

  assertCase(
    block,
    "exists.index",
    existsSync(join(repoRoot, VISIBILITY_INDEX)),
    `${VISIBILITY_INDEX} exists`,
  );

  const src = existsSync(join(repoRoot, VISIBILITY_INDEX))
    ? stripComments(read(VISIBILITY_INDEX))
    : "";

  assertCase(
    block,
    "barrel.types",
    /from\s+["']\.\/VisibilityTypes["']/.test(src) &&
      /VisibilityId/.test(src) &&
      /asVisibilityId/.test(src),
    "Barrel reexports VisibilityTypes",
  );

  assertCase(
    block,
    "barrel.definition",
    /from\s+["']\.\/VisibilityDefinition["']/.test(src) &&
      /VisibilityDefinition/.test(src),
    "Barrel reexports VisibilityDefinition",
  );

  assertCase(
    block,
    "barrel.factory",
    /from\s+["']\.\/createVisibilityDefinition["']/.test(src) &&
      /createVisibilityDefinition/.test(src),
    "Barrel reexports createVisibilityDefinition",
  );

  assertCase(
    block,
    "barrel.registry",
    /from\s+["']\.\/VisibilityRegistry["']/.test(src) &&
      /VisibilityRegistryApi/.test(src) &&
      /visibilityRegistry/.test(src) &&
      /createVisibilityRegistry/.test(src),
    "Barrel reexports VisibilityRegistry surface",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — freezeFences                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "freezeFences";

  const visibilityFiles = walkFiles(join(repoRoot, VISIBILITY_DIR));
  let hasReact = false;
  let hasReactDom = false;
  let hasWindow = false;
  let hasDocument = false;
  let hasCss = false;
  let hasDomApis = false;
  let hasUiComponentImport = false;
  let hasAppImport = false;

  for (const full of visibilityFiles) {
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
  }

  assertCase(block, "fence.noReact", !hasReact, "No react under visibility/");
  assertCase(
    block,
    "fence.noReactDom",
    !hasReactDom,
    "No react-dom under visibility/",
  );
  assertCase(block, "fence.noWindow", !hasWindow, "No window under visibility/");
  assertCase(
    block,
    "fence.noDocument",
    !hasDocument,
    "No document under visibility/",
  );
  assertCase(block, "fence.noCss", !hasCss, "No CSS/style under visibility/");
  assertCase(block, "fence.noDom", !hasDomApis, "No DOM APIs under visibility/");
  assertCase(
    block,
    "fence.noUiComponents",
    !hasUiComponentImport,
    "No UI product component imports under visibility/",
  );
  assertCase(
    block,
    "fence.noAppImport",
    !hasAppImport,
    "No App imports under visibility/",
  );

  // No product wiring: visibility must not appear outside src/ui/visibility/
  const srcRoot = join(repoRoot, "src");
  const allSrc = walkFiles(srcRoot);
  let productWire = false;
  for (const full of allSrc) {
    const rel = relative(repoRoot, full).replace(/\\/g, "/");
    if (rel.startsWith("src/ui/visibility/")) continue;
    const src = stripComments(readFileSync(full, "utf8"));
    // Detect UX-7.1 module symbols / @/ui/visibility only.
    // Do not match unrelated paths (e.g. lib/scientific/visibility,
    // resolve-toggle-visibility-hint).
    if (
      /visibilityRegistry/.test(src) ||
      /VisibilityRegistryApi/.test(src) ||
      /createVisibilityDefinition/.test(src) ||
      /createVisibilityRegistry/.test(src) ||
      /from\s+["']@\/ui\/visibility\b/.test(src) ||
      /from\s+["'][^"']*\/ui\/visibility\b/.test(src)
    ) {
      productWire = true;
      break;
    }
  }

  assertCase(
    block,
    "fence.noProductWire",
    !productWire,
    "No visibility import/wire outside src/ui/visibility/",
  );

  const uiIndex = existsSync(join(repoRoot, UI_INDEX))
    ? stripComments(read(UI_INDEX))
    : "";
  assertCase(
    block,
    "fence.publicBarrelIntact",
    !/\bvisibility\b/.test(uiIndex) &&
      !/VisibilityRegistry/.test(uiIndex) &&
      !/visibilityRegistry/.test(uiIndex) &&
      !/createVisibilityDefinition/.test(uiIndex),
    "src/ui/index.ts does not export visibility",
  );

  // Registry Freeze — no extra methods on VisibilityRegistryApi
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

  // Also ensure only the four official method names appear as method decls
  const methodNames = [...apiBody.matchAll(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g)]
    .map((m) => m[1])
    .filter((n) => n !== undefined);
  const allowed = new Set(["register", "get", "getAll", "clear"]);
  const unexpected = methodNames.filter((n) => !allowed.has(n));
  if (unexpected.length > 0) hasExtraMethods = true;

  assertCase(
    block,
    "fence.registryFreezeMethods",
    !hasExtraMethods &&
      allowed.size === 4 &&
      methodNames.includes("register") &&
      methodNames.includes("get") &&
      methodNames.includes("getAll") &&
      methodNames.includes("clear"),
    "VisibilityRegistryApi has only register/get/getAll/clear",
  );

  // Required module files present (structure completeness)
  for (const rel of MODULE_FILES) {
    assertCase(
      block,
      `fence.file.${rel.split("/").pop()}`,
      existsSync(join(repoRoot, rel)),
      `${rel} exists`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const BLOCKS: { id: BlockId; ca: string }[] = [
  { id: "documentationExists", ca: "CA-UX-7.1.1" },
  { id: "registryExists", ca: "CA-UX-7.1.2" },
  { id: "registryRegister", ca: "CA-UX-7.1.3" },
  { id: "registryGet", ca: "CA-UX-7.1.4" },
  { id: "registryGetAll", ca: "CA-UX-7.1.5" },
  { id: "registryClear", ca: "CA-UX-7.1.6" },
  { id: "definitionTypes", ca: "CA-UX-7.1.7" },
  { id: "factoryContract", ca: "CA-UX-7.1.8" },
  { id: "barrelExport", ca: "CA-UX-7.1.9" },
  { id: "freezeFences", ca: "CA-UX-7.1.10" },
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
