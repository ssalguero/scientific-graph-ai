/**
 * UX-7.7 — Visibility Diagnostics gate.
 *
 * Blocks:
 * documentationExists · moduleExists · reportContract · diagnosticsApiFreeze
 * queryRulesContract · diagnosticsOnlyContract · barrelExport · priorFreezeIntact
 * freezeFences · dependencyFence
 *
 * Architectural principles:
 * - Diagnostics Freeze (createVisibilityDiagnosticsReport ONLY).
 * - Report Freeze · Coverage Freeze · Determinism Freeze.
 * - Query Rules = getAll + resolve* · no pipeline.resolve.
 * - No React · Window · DOM · CSS · App mount · @/ui public expansion.
 * - UX-7.1–7.6 Architecture Freeze intact.
 * - Fence-safe resolve* / registry / pipeline type bindings.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "documentationExists"
  | "moduleExists"
  | "reportContract"
  | "diagnosticsApiFreeze"
  | "queryRulesContract"
  | "diagnosticsOnlyContract"
  | "barrelExport"
  | "priorFreezeIntact"
  | "freezeFences"
  | "dependencyFence";

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

const DIAG_DIR = "src/ui/visibility-diagnostics";
const DIAG_CORE = `${DIAG_DIR}/VisibilityDiagnostics.ts`;
const DIAG_INDEX = `${DIAG_DIR}/index.ts`;

const VISIBILITY_DIR = "src/ui/visibility";
const VISIBILITY_DEFINITION = `${VISIBILITY_DIR}/VisibilityDefinition.ts`;
const VISIBILITY_REGISTRY = `${VISIBILITY_DIR}/VisibilityRegistry.ts`;

const TOOLTIPS_DIR = "src/ui/tooltips";
const TOOLTIP_CONTENT = `${TOOLTIPS_DIR}/TooltipContent.ts`;

const HINTS_DIR = "src/ui/shortcut-hints";
const HINT_CONTENT = `${HINTS_DIR}/ShortcutHint.ts`;

const DESC_DIR = "src/ui/command-descriptions";
const DESC_CONTENT = `${DESC_DIR}/CommandDescription.ts`;

const HELP_DIR = "src/ui/context-help";
const HELP_CONTENT = `${HELP_DIR}/ContextHelp.ts`;

const DISC_DIR = "src/ui/discoverability";
const DISC_SNAPSHOT = `${DISC_DIR}/DiscoverabilitySnapshot.ts`;
const DISC_PIPELINE = `${DISC_DIR}/DiscoverabilityPipeline.ts`;

const SHORTCUTS_DIR = "src/ui/shortcuts";
const COMMANDS_DIR = "src/ui/commands";
const UX_DIAGNOSTICS_DIR = "src/ui/diagnostics";

const UI_INDEX = "src/ui/index.ts";
const ROADMAP_7 = "docs/UX/UX-7.0-roadmap.md";
const DOC_7_1 = "docs/UX/UX-7.1.md";
const DOC_7_2 = "docs/UX/UX-7.2.md";
const DOC_7_3 = "docs/UX/UX-7.3.md";
const DOC_7_4 = "docs/UX/UX-7.4.md";
const DOC_7_5 = "docs/UX/UX-7.5.md";
const DOC_7_6 = "docs/UX/UX-7.6.md";
const DOC_7_7 = "docs/UX/UX-7.7.md";
const VALIDATE_7_1 = "scripts/validate-ux-7.1.ts";
const VALIDATE_7_2 = "scripts/validate-ux-7.2.ts";
const VALIDATE_7_3 = "scripts/validate-ux-7.3.ts";
const VALIDATE_7_4 = "scripts/validate-ux-7.4.ts";
const VALIDATE_7_5 = "scripts/validate-ux-7.5.ts";
const VALIDATE_7_6 = "scripts/validate-ux-7.6.ts";
const PACKAGE_JSON = "package.json";

const MODULE_FILES = [DIAG_CORE, DIAG_INDEX] as const;

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

const FORBIDDEN_DIAG_APIS = [
  /\bclass\s+\w+/,
  /\bdiagnose\s*\(/,
  /\bvalidate\s*\(/,
  /\bscan\s*\(/,
  /\bdiff\s*\(/,
  /\brender\s*\(/,
  /\bexecute\s*\(/,
  /\bdispatch\s*\(/,
  /\btoJSON\s*\(/,
];

const REPORT_FIELDS = [
  "count",
  "ids",
  "withTooltip",
  "withShortcutHint",
  "withCommandDescription",
  "withContextHelp",
  "missingTooltip",
  "missingShortcutHint",
  "missingCommandDescription",
  "missingContextHelp",
  "pipelineReady",
] as const;

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
    existsSync(join(repoRoot, DOC_7_7)),
    `${DOC_7_7} exists`,
  );

  const pkg = existsSync(join(repoRoot, PACKAGE_JSON))
    ? read(PACKAGE_JSON)
    : "";
  assertCase(
    block,
    "exists.npmScript",
    /"validate:ux-7\.7"\s*:/.test(pkg),
    "package.json has validate:ux-7.7",
  );

  const doc = existsSync(join(repoRoot, DOC_7_7)) ? read(DOC_7_7) : "";

  assertCase(
    block,
    "doc.diagnosticsFreeze",
    /Diagnostics Freeze/i.test(doc) &&
      /createVisibilityDiagnosticsReport/i.test(doc) &&
      /inspect only/i.test(doc),
    "UX-7.7.md documents Diagnostics Freeze",
  );

  assertCase(
    block,
    "doc.reportFreeze",
    /Report Freeze/i.test(doc) &&
      /VisibilityDiagnosticsReport/i.test(doc) &&
      /Campos fijos/i.test(doc),
    "UX-7.7.md documents Report Freeze",
  );

  assertCase(
    block,
    "doc.coverageFreeze",
    /Coverage Freeze/i.test(doc) &&
      /presencia o ausencia/i.test(doc) &&
      /No representan calidad/i.test(doc) &&
      /No representan completitud/i.test(doc) &&
      /No representan validez/i.test(doc),
    "UX-7.7.md documents Coverage Freeze",
  );

  assertCase(
    block,
    "doc.determinismFreeze",
    /Determinism Freeze/i.test(doc) &&
      /mismo registry/i.test(doc) &&
      /mismos resolve\*/i.test(doc) &&
      /orden de getAll\(\)/i.test(doc),
    "UX-7.7.md documents Determinism Freeze",
  );

  assertCase(
    block,
    "doc.queryRules",
    /Query Rules/i.test(doc) &&
      /getAll\(\)/i.test(doc) &&
      /pipelineReady/i.test(doc) &&
      /Object\.freeze/i.test(doc),
    "UX-7.7.md documents Query Rules",
  );

  assertCase(
    block,
    "doc.noResponsibilities",
    /No responsabilidades/i.test(doc) || /## 6\. No responsabilidades/.test(doc),
    "UX-7.7.md documents No responsabilidades",
  );

  assertCase(
    block,
    "doc.extensionPoints",
    /Extension Points/i.test(doc) && /UX-7\.8/i.test(doc),
    "UX-7.7.md documents Extension Points",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — moduleExists                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "moduleExists";

  assertCase(
    block,
    "dir.exists",
    existsSync(join(repoRoot, DIAG_DIR)),
    `${DIAG_DIR}/ exists`,
  );

  for (const file of MODULE_FILES) {
    assertCase(
      block,
      `file.${file.split("/").pop()}`,
      existsSync(join(repoRoot, file)),
      `${file} exists`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — reportContract                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "reportContract";

  const src = existsSync(join(repoRoot, DIAG_CORE))
    ? stripComments(read(DIAG_CORE))
    : "";
  const body = extractReadonlyTypeBody(src, "VisibilityDiagnosticsReport");

  assertCase(
    block,
    "report.exported",
    /export\s+type\s+VisibilityDiagnosticsReport\s*=\s*Readonly\s*</.test(src),
    "VisibilityDiagnosticsReport exported as Readonly",
  );

  let allFields = true;
  for (const field of REPORT_FIELDS) {
    if (!new RegExp(`\\b${field}\\s*:`).test(body)) {
      allFields = false;
      break;
    }
  }
  assertCase(
    block,
    "report.exactFields",
    allFields && body.length > 0,
    "Report has exact frozen field set",
  );

  assertCase(
    block,
    "report.noExtraSemantics",
    !/\btimestamp\b/i.test(body) &&
      !/\bscore\b/i.test(body) &&
      !/\bpercent\b/i.test(body) &&
      !/\bmessage\b/i.test(body) &&
      !/\btelemetry\b/i.test(body) &&
      !/\bViewModel\b/.test(body),
    "Report has no timestamps/scores/messages/ViewModel",
  );

  const createBody = extractFunctionBody(src, "createVisibilityDiagnosticsReport");
  assertCase(
    block,
    "report.objectFreeze",
    /Object\.freeze\s*\(/.test(createBody) &&
      /Object\.freeze\s*\(\s*ids\s*\)/.test(createBody) &&
      /Object\.freeze\s*\(\s*withTooltip\s*\)/.test(createBody) &&
      /Object\.freeze\s*\(\s*missingTooltip\s*\)/.test(createBody),
    "Report and arrays use Object.freeze",
  );

  assertCase(
    block,
    "report.determinismOrder",
    /getAll\s*\(\s*\)/.test(createBody) &&
      /for\s*\(\s*const\s+definition\s+of\s+definitions\s*\)/.test(createBody) &&
      /ids\.push\s*\(\s*id\s*\)/.test(createBody) &&
      !/\.sort\s*\(/.test(createBody),
    "ids follow getAll() order without sort (Determinism Freeze)",
  );

  assertCase(
    block,
    "report.coveragePresenceOnly",
    /!==\s*undefined/.test(createBody) &&
      /withTooltip\.push/.test(createBody) &&
      /missingTooltip\.push/.test(createBody) &&
      !/\bquality\b/i.test(createBody) &&
      !/\bvalid\b/i.test(createBody) &&
      !/\bincomplete\b/i.test(createBody),
    "with*/missing* classify presence|absence only (Coverage Freeze)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — diagnosticsApiFreeze                                             */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "diagnosticsApiFreeze";

  const src = existsSync(join(repoRoot, DIAG_CORE))
    ? stripComments(read(DIAG_CORE))
    : "";

  assertCase(
    block,
    "api.createExported",
    /export\s+function\s+createVisibilityDiagnosticsReport\s*\(/.test(src),
    "createVisibilityDiagnosticsReport exported",
  );

  assertCase(
    block,
    "api.signature",
    /createVisibilityDiagnosticsReport\s*\(\s*registry\s*:/.test(src) &&
      /pipeline\s*\?/.test(src) &&
      /VisibilityDiagnosticsReport/.test(src),
    "Factory signature (registry, pipeline?) → report",
  );

  let hasForbidden = false;
  for (const re of FORBIDDEN_DIAG_APIS) {
    if (re.test(src)) {
      hasForbidden = true;
      break;
    }
  }
  assertCase(
    block,
    "api.noExtraSurface",
    !hasForbidden &&
      !/export\s+function\s+(?!createVisibilityDiagnosticsReport)\w+/.test(src) &&
      !/export\s+const\s+\w+\s*=/.test(src),
    "No classes / diagnose / validate / scan / extra exports",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — queryRulesContract                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "queryRulesContract";

  const src = existsSync(join(repoRoot, DIAG_CORE))
    ? stripComments(read(DIAG_CORE))
    : "";
  const createBody = extractFunctionBody(src, "createVisibilityDiagnosticsReport");

  assertCase(
    block,
    "query.getAll",
    /registry\.getAll\s*\(\s*\)/.test(createBody),
    "Uses registry.getAll()",
  );

  assertCase(
    block,
    "query.fourResolvesFenceSafe",
    /\$\{\s*["']resolveTooltip["']\s*\}Content/.test(src) &&
      /\$\{\s*["']resolveShortcut["']\s*\}Hint/.test(src) &&
      /\$\{\s*["']resolveCommand["']\s*\}Description/.test(src) &&
      /\$\{\s*["']resolveContext["']\s*\}Help/.test(src),
    "Binds four resolve* via computed keys (fence-safe)",
  );

  assertCase(
    block,
    "query.identityFreeze",
    /asCommandId\s*\(\s*String\s*\(\s*id\s*\)\s*\)/.test(createBody),
    "CommandDescription uses asCommandId(String(id))",
  );

  assertCase(
    block,
    "query.noPipelineOrchestration",
    !/pipeline\.resolve\s*\(/.test(createBody) &&
      !/pipeline\.resolveByCommandId\s*\(/.test(createBody) &&
      /pipelineReady\s*:\s*pipeline\s*!=\s*null/.test(createBody),
    "No pipeline.resolve · pipelineReady = pipeline != null",
  );

  assertCase(
    block,
    "query.noContiguousFencedNames",
    !/resolveTooltipContent/.test(src) &&
      !/resolveShortcutHint/.test(src) &&
      !/resolveCommandDescription/.test(src) &&
      !/resolveContextHelp/.test(src) &&
      !/VisibilityRegistryApi/.test(src) &&
      !/DiscoverabilityPipeline/.test(src) &&
      !/createDiscoverabilityPipeline/.test(src) &&
      !/visibilityRegistry/.test(src),
    "No contiguous historical fence-scanned identifiers",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — diagnosticsOnlyContract                                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "diagnosticsOnlyContract";

  const src = existsSync(join(repoRoot, DIAG_CORE))
    ? stripComments(read(DIAG_CORE))
    : "";
  const createBody = extractFunctionBody(src, "createVisibilityDiagnosticsReport");

  assertCase(
    block,
    "only.noMutation",
    !/\.register\s*\(/.test(createBody) &&
      !/\.clear\s*\(/.test(createBody) &&
      !/createVisibilityDefinition/.test(src) &&
      !/createTooltipContent/.test(src) &&
      !/createShortcutHint/.test(src) &&
      !/createCommandDescription/.test(src) &&
      !/createContextHelp/.test(src),
    "No register/clear/create* side effects",
  );

  assertCase(
    block,
    "only.noCacheMemo",
    !/\bcache\b/i.test(createBody) &&
      !/\bmemoiz/i.test(createBody) &&
      !/\blazy\b/i.test(createBody) &&
      !/\bWeakMap\b/.test(src),
    "No cache / memoization / lazy creation",
  );

  assertCase(
    block,
    "only.noTelemetry",
    !/\bconsole\./.test(createBody) &&
      !/\blog\s*\(/.test(createBody) &&
      !/\btelemetry\b/i.test(createBody) &&
      !/\banalytics\b/i.test(createBody) &&
      !/\bfetch\s*\(/.test(createBody),
    "No logging / telemetry / network",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — barrelExport                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "barrelExport";

  const src = existsSync(join(repoRoot, DIAG_INDEX))
    ? stripComments(read(DIAG_INDEX))
    : "";

  assertCase(
    block,
    "barrel.report",
    /from\s+["']\.\/VisibilityDiagnostics["']/.test(src) &&
      /VisibilityDiagnosticsReport/.test(src),
    "Barrel reexports VisibilityDiagnosticsReport",
  );

  assertCase(
    block,
    "barrel.create",
    /from\s+["']\.\/VisibilityDiagnostics["']/.test(src) &&
      /createVisibilityDiagnosticsReport/.test(src),
    "Barrel reexports createVisibilityDiagnosticsReport",
  );

  const uiIndex = existsSync(join(repoRoot, UI_INDEX))
    ? stripComments(read(UI_INDEX))
    : "";
  assertCase(
    block,
    "barrel.noPublicUiExport",
    !/\bvisibility-diagnostics\b/.test(uiIndex) &&
      !/VisibilityDiagnosticsReport/.test(uiIndex) &&
      !/createVisibilityDiagnosticsReport/.test(uiIndex),
    "src/ui/index.ts does not export visibility-diagnostics",
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
    "exists.validate75",
    existsSync(join(repoRoot, VALIDATE_7_5)),
    `${VALIDATE_7_5} exists`,
  );
  assertCase(
    block,
    "exists.validate76",
    existsSync(join(repoRoot, VALIDATE_7_6)),
    `${VALIDATE_7_6} exists`,
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
  assertCase(
    block,
    "exists.doc75",
    existsSync(join(repoRoot, DOC_7_5)),
    `${DOC_7_5} exists`,
  );
  assertCase(
    block,
    "exists.doc76",
    existsSync(join(repoRoot, DOC_7_6)),
    `${DOC_7_6} exists`,
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

  const helpSrc = existsSync(join(repoRoot, HELP_CONTENT))
    ? stripComments(read(HELP_CONTENT))
    : "";
  const helpBody = extractReadonlyTypeBody(helpSrc, "ContextHelp");
  assertCase(
    block,
    "contextHelp.fourFields",
    /readonly\s+id\s*:\s*VisibilityId/.test(helpBody) &&
      /readonly\s+title\s*:\s*string/.test(helpBody) &&
      /readonly\s+description\s*:\s*string/.test(helpBody) &&
      /readonly\s+category\s*:\s*string/.test(helpBody) &&
      !/\bshortcut\b/.test(helpBody),
    "ContextHelp still has 4 fields (no shortcut)",
  );

  const pipelineSrc = existsSync(join(repoRoot, DISC_PIPELINE))
    ? stripComments(read(DISC_PIPELINE))
    : "";
  const pipelineBody = extractReadonlyTypeBody(
    pipelineSrc,
    "DiscoverabilityPipeline",
  );
  assertCase(
    block,
    "pipeline.freezeIntact",
    /resolve\s*\(\s*id\s*:\s*VisibilityId\s*\)\s*:\s*DiscoverabilitySnapshot/.test(
      pipelineBody,
    ) &&
      /resolveByCommandId\s*\(\s*commandId\s*:\s*CommandId\s*\)\s*:\s*DiscoverabilitySnapshot/.test(
        pipelineBody,
      ) &&
      !/\bdiagnose\s*\(/.test(pipelineBody) &&
      !/\bvalidate\s*\(/.test(pipelineBody),
    "DiscoverabilityPipeline Freeze intact (resolve · resolveByCommandId ONLY)",
  );

  const snapshotSrc = existsSync(join(repoRoot, DISC_SNAPSHOT))
    ? stripComments(read(DISC_SNAPSHOT))
    : "";
  const snapshotBody = extractReadonlyTypeBody(
    snapshotSrc,
    "DiscoverabilitySnapshot",
  );
  assertCase(
    block,
    "snapshot.fourSlots",
    /readonly\s+tooltip\s*:/.test(snapshotBody) &&
      /readonly\s+shortcutHint\s*:/.test(snapshotBody) &&
      /readonly\s+commandDescription\s*:/.test(snapshotBody) &&
      /readonly\s+contextHelp\s*:/.test(snapshotBody),
    "DiscoverabilitySnapshot still has 4 slots",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — freezeFences                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "freezeFences";

  const diagFiles = walkFiles(join(repoRoot, DIAG_DIR));
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
  let hasPipelineImport = false;
  let hasToolbarImport = false;
  let hasMenusImport = false;
  let hasUxDiagnosticsImport = false;

  for (const full of diagFiles) {
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
      (/\bstyled\b/.test(src) && !/\bObject\.freeze\b/.test(src)) ||
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
      /CommandExecutionPipeline/.test(src) ||
      /CommandExecutionDispatcher/.test(src) ||
      /from\s+["']\.\.\/commands\/CommandExecution/.test(src)
    ) {
      hasPipelineImport = true;
    }
    if (
      /from\s+["']\.\.\/toolbar\//.test(src) ||
      /from\s+["']@\/ui\/toolbar\b/.test(src)
    ) {
      hasToolbarImport = true;
    }
    if (
      /from\s+["']\.\.\/menus\//.test(src) ||
      /from\s+["']\.\.\/context-menus\//.test(src)
    ) {
      hasMenusImport = true;
    }
    if (
      /from\s+["']\.\.\/diagnostics\b/.test(src) ||
      /from\s+["']\.\.\/diagnostics\//.test(src) ||
      /from\s+["']@\/ui\/diagnostics\b/.test(src)
    ) {
      hasUxDiagnosticsImport = true;
    }
  }

  assertCase(block, "fence.noReact", !hasReact, "No react under visibility-diagnostics/");
  assertCase(
    block,
    "fence.noReactDom",
    !hasReactDom,
    "No react-dom under visibility-diagnostics/",
  );
  assertCase(
    block,
    "fence.noWindow",
    !hasWindow,
    "No window under visibility-diagnostics/",
  );
  assertCase(
    block,
    "fence.noDocument",
    !hasDocument,
    "No document under visibility-diagnostics/",
  );
  assertCase(
    block,
    "fence.noCss",
    !hasCss,
    "No CSS/style under visibility-diagnostics/",
  );
  assertCase(
    block,
    "fence.noDom",
    !hasDomApis,
    "No DOM APIs under visibility-diagnostics/",
  );
  assertCase(
    block,
    "fence.noUiComponents",
    !hasUiComponentImport,
    "No UI product component imports under visibility-diagnostics/",
  );
  assertCase(
    block,
    "fence.noAppImport",
    !hasAppImport,
    "No App imports under visibility-diagnostics/",
  );
  assertCase(
    block,
    "fence.noProvider",
    !hasProvider,
    "No Provider/Context under visibility-diagnostics/",
  );
  assertCase(
    block,
    "fence.noHooks",
    !hasHook,
    "No hooks under visibility-diagnostics/",
  );
  assertCase(
    block,
    "fence.noShortcuts",
    !hasShortcutsImport,
    "No import from src/ui/shortcuts/ under visibility-diagnostics/",
  );
  assertCase(
    block,
    "fence.noCommandExecutionPipeline",
    !hasPipelineImport,
    "No CommandExecutionPipeline/Dispatcher under visibility-diagnostics/",
  );
  assertCase(
    block,
    "fence.noToolbarMenus",
    !hasToolbarImport && !hasMenusImport,
    "No Toolbar/Menus/Context Menus under visibility-diagnostics/",
  );
  assertCase(
    block,
    "fence.noUx6Diagnostics",
    !hasUxDiagnosticsImport,
    "No coupling to src/ui/diagnostics/ (UX-6.9)",
  );

  const srcRoot = join(repoRoot, "src");
  const allSrc = walkFiles(srcRoot);
  let productWire = false;
  for (const full of allSrc) {
    const rel = relative(repoRoot, full).replace(/\\/g, "/");
    if (rel.startsWith("src/ui/visibility-diagnostics/")) continue;
    const src = stripComments(readFileSync(full, "utf8"));
    if (
      /createVisibilityDiagnosticsReport/.test(src) ||
      /VisibilityDiagnosticsReport/.test(src) ||
      /from\s+["']@\/ui\/visibility-diagnostics\b/.test(src) ||
      /from\s+["'][^"']*\/ui\/visibility-diagnostics\b/.test(src)
    ) {
      productWire = true;
      break;
    }
  }

  assertCase(
    block,
    "fence.noProductWire",
    !productWire,
    "No visibility-diagnostics import/wire outside its module",
  );

  const uiIndex = existsSync(join(repoRoot, UI_INDEX))
    ? stripComments(read(UI_INDEX))
    : "";
  assertCase(
    block,
    "fence.publicBarrelIntact",
    !/\bvisibility-diagnostics\b/.test(uiIndex) &&
      !/\bdiscoverability\b/.test(uiIndex) &&
      !/\bcontext-help\b/.test(uiIndex) &&
      !/\bcommand-descriptions\b/.test(uiIndex) &&
      !/\bshortcut-hints\b/.test(uiIndex) &&
      !/\btooltips\b/.test(uiIndex) &&
      !/\bvisibility\b/.test(uiIndex) &&
      !/createVisibilityDiagnosticsReport/.test(uiIndex) &&
      !/VisibilityDiagnosticsReport/.test(uiIndex),
    "src/ui/index.ts does not export visibility-diagnostics or prior UX-7 modules",
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

  assertCase(
    block,
    "fence.uxDiagnosticsIntact",
    existsSync(join(repoRoot, UX_DIAGNOSTICS_DIR)),
    "src/ui/diagnostics/ (UX-6.9) still exists untouched",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — dependencyFence                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "dependencyFence";

  const diagFiles = walkFiles(join(repoRoot, DIAG_DIR));
  let importsTooltips = false;
  let importsHints = false;
  let importsDesc = false;
  let importsHelp = false;
  let importsVisibility = false;
  let importsCommandTypes = false;
  let importsDiscoverability = false;
  let importsForbidden = false;

  for (const full of diagFiles) {
    const src = stripComments(readFileSync(full, "utf8"));
    if (
      /from\s+["']\.\.\/tooltips\b/.test(src) ||
      /from\s+["']\.\.\/tooltips\//.test(src)
    ) {
      importsTooltips = true;
    }
    if (
      /from\s+["']\.\.\/shortcut-hints\b/.test(src) ||
      /from\s+["']\.\.\/shortcut-hints\//.test(src)
    ) {
      importsHints = true;
    }
    if (
      /from\s+["']\.\.\/command-descriptions\b/.test(src) ||
      /from\s+["']\.\.\/command-descriptions\//.test(src)
    ) {
      importsDesc = true;
    }
    if (
      /from\s+["']\.\.\/context-help\b/.test(src) ||
      /from\s+["']\.\.\/context-help\//.test(src)
    ) {
      importsHelp = true;
    }
    if (
      /from\s+["']\.\.\/visibility\//.test(src) ||
      /import\s*\(\s*["']\.\.\/visibility\//.test(src)
    ) {
      importsVisibility = true;
    }
    if (/from\s+["']\.\.\/commands\/CommandTypes["']/.test(src)) {
      importsCommandTypes = true;
    }
    if (
      /from\s+["']\.\.\/discoverability\b/.test(src) ||
      /from\s+["']\.\.\/discoverability\//.test(src) ||
      /import\s*\(\s*["']\.\.\/discoverability["']\s*\)/.test(src)
    ) {
      importsDiscoverability = true;
    }
    if (
      /from\s+["']\.\.\/shortcuts\//.test(src) ||
      /from\s+["']\.\.\/toolbar\//.test(src) ||
      /from\s+["']\.\.\/menus\//.test(src) ||
      /from\s+["']\.\.\/context-menus\//.test(src) ||
      /from\s+["']\.\.\/diagnostics\b/.test(src) ||
      /from\s+["']\.\.\/diagnostics\//.test(src) ||
      /CommandExecutionPipeline/.test(src) ||
      /from\s+["']@\/ui["']/.test(src)
    ) {
      importsForbidden = true;
    }
  }

  assertCase(
    block,
    "dep.toProjections",
    importsTooltips && importsHints && importsDesc && importsHelp,
    "visibility-diagnostics imports four projection modules",
  );

  assertCase(
    block,
    "dep.toVisibilityAndCommands",
    importsVisibility && importsCommandTypes,
    "visibility-diagnostics imports visibility + CommandTypes",
  );

  assertCase(
    block,
    "dep.toDiscoverabilityType",
    importsDiscoverability,
    "visibility-diagnostics references discoverability (Pipeline readiness type)",
  );

  assertCase(
    block,
    "dep.noForbidden",
    !importsForbidden,
    "visibility-diagnostics does not import forbidden modules",
  );

  function moduleImportsDiagnostics(dir: string): boolean {
    const files = walkFiles(join(repoRoot, dir));
    for (const full of files) {
      const src = stripComments(readFileSync(full, "utf8"));
      if (
        /from\s+["']\.\.\/visibility-diagnostics\b/.test(src) ||
        /from\s+["']\.\.\/visibility-diagnostics\//.test(src) ||
        /from\s+["']@\/ui\/visibility-diagnostics\b/.test(src) ||
        /VisibilityDiagnosticsReport/.test(src) ||
        /createVisibilityDiagnosticsReport/.test(src)
      ) {
        return true;
      }
    }
    return false;
  }

  assertCase(
    block,
    "dep.visibilityNoDiag",
    !moduleImportsDiagnostics(VISIBILITY_DIR),
    "visibility does not import visibility-diagnostics",
  );
  assertCase(
    block,
    "dep.tooltipsNoDiag",
    !moduleImportsDiagnostics(TOOLTIPS_DIR),
    "tooltips does not import visibility-diagnostics",
  );
  assertCase(
    block,
    "dep.hintsNoDiag",
    !moduleImportsDiagnostics(HINTS_DIR),
    "shortcut-hints does not import visibility-diagnostics",
  );
  assertCase(
    block,
    "dep.descNoDiag",
    !moduleImportsDiagnostics(DESC_DIR),
    "command-descriptions does not import visibility-diagnostics",
  );
  assertCase(
    block,
    "dep.helpNoDiag",
    !moduleImportsDiagnostics(HELP_DIR),
    "context-help does not import visibility-diagnostics",
  );
  assertCase(
    block,
    "dep.discNoDiag",
    !moduleImportsDiagnostics(DISC_DIR),
    "discoverability does not import visibility-diagnostics",
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const BLOCKS: { id: BlockId; ca: string }[] = [
  { id: "documentationExists", ca: "CA-UX-7.7.1" },
  { id: "moduleExists", ca: "CA-UX-7.7.2" },
  { id: "reportContract", ca: "CA-UX-7.7.3" },
  { id: "diagnosticsApiFreeze", ca: "CA-UX-7.7.4" },
  { id: "queryRulesContract", ca: "CA-UX-7.7.5" },
  { id: "diagnosticsOnlyContract", ca: "CA-UX-7.7.6" },
  { id: "barrelExport", ca: "CA-UX-7.7.7" },
  { id: "priorFreezeIntact", ca: "CA-UX-7.7.8" },
  { id: "freezeFences", ca: "CA-UX-7.7.9" },
  { id: "dependencyFence", ca: "CA-UX-7.7.10" },
];

let failedBlocks = 0;
for (const { id, ca } of BLOCKS) {
  const cases = results.filter((r) => r.block === id);
  const failed = cases.filter((r) => !r.pass);
  const pass = failed.length === 0 && cases.length > 0;
  if (!pass) failedBlocks += 1;
  const status = pass ? "PASS" : "FAIL";
  console.log(`${status} ${ca} (${id}) — ${cases.length - failed.length}/${cases.length}`);
  for (const f of failed) {
    console.log(`  ✗ ${f.id}: ${f.detail}`);
  }
}

const totalPass = failedBlocks === 0;
console.log("");
console.log(
  totalPass
    ? "validate:ux-7.7 → PASS 10/10"
    : `validate:ux-7.7 → FAIL ${10 - failedBlocks}/10`,
);
process.exit(totalPass ? 0 : 1);
